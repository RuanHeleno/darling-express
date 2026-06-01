"""Order views."""

import logging
from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.exceptions import APIError
from api import errors as err
from core.models import SystemSettings
from .models import Order, OrderStatus
from .serializers import (
    ShippingQuoteRequestSerializer,
    ShippingQuoteResponseSerializer,
    PayOrderResponseSerializer,
    DispatchResponseSerializer,
    DashboardSerializer,
    LoyaltyEntrySerializer,
    OrderSerializer,
)
from .services import lalamove_service, infinitepay_service, order_service


logger = logging.getLogger(__name__)


class ShippingQuoteView(APIView):
    """POST /api/orders/shipping-quote – returns Lalamove quote."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ShippingQuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        settings = SystemSettings.get()
        result = lalamove_service.quote_shipping(
            cart_items=data["items"],
            client_lat=data["client_lat"],
            client_lng=data["client_lng"],
            settings=settings,
        )
        subtotal = sum(
            Decimal(str(i["unit_price"])) * i["quantity"] for i in data["items"]
        )
        free = subtotal >= settings.free_shipping_threshold

        response_data = {
            "quote_id": result["quote_id"],
            "price": "0.00" if free else result["price"],
            "free_shipping": free,
        }
        return Response(ShippingQuoteResponseSerializer(response_data).data)


class PayOrderView(APIView):
    """POST /api/orders/pay – settle order and create PIX charge."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        items_data = request.data.get("items", [])
        quote_price = Decimal(str(request.data.get("shipping_cost", "0.00")))

        settings = SystemSettings.get()

        # Check free shipping
        subtotal = sum(
            Decimal(str(i.get("unit_price", 0))) * int(i.get("quantity", 1))
            for i in items_data
        )
        shipping_cost = (
            Decimal("0.00")
            if subtotal >= settings.free_shipping_threshold
            else quote_price
        )

        order = order_service.settle_order(
            user=request.user,
            items=[
                {
                    "product_id": int(i["product_id"]),
                    "quantity": int(i["quantity"]),
                    "unit_price": Decimal(str(i["unit_price"])),
                }
                for i in items_data
            ],
            shipping_cost=shipping_cost,
        )

        if not settings.payments_enabled:
            return Response(
                PayOrderResponseSerializer(
                    {
                        "order_id": order.pk,
                        "pix_code": "PAYMENTS_DISABLED",
                        "qr_code_base64": "",
                        "total": str(order.total),
                    }
                ).data
            )

        charge = infinitepay_service.create_pix_charge(order, settings)
        order.infinitepay_transaction_id = charge["transaction_id"]
        order.save(update_fields=["infinitepay_transaction_id", "updated_at"])

        return Response(
            PayOrderResponseSerializer(
                {
                    "order_id": order.pk,
                    "pix_code": charge["pix_code"],
                    "qr_code_base64": charge["qr_code_base64"],
                    "total": str(order.total),
                }
            ).data,
            status=status.HTTP_201_CREATED,
        )


class WebhookView(APIView):
    """POST /api/orders/webhook/infinitepay – InfinitePay payment notifications."""

    permission_classes = []  # Public endpoint; HMAC validates authenticity
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("X-Infinitepay-Signature", "")
        payload_bytes = request.body

        result = infinitepay_service.record_and_process_webhook(
            payload_bytes, signature, _settings_obj()
        )

        # Broadcast real-time update via Channels if order status changed
        if result.get("status") == "processed" and result.get("order_id"):
            _broadcast_order_update(result["order_id"])

        return Response({"received": True})


def _settings_obj():
    return SystemSettings.get()


def _broadcast_order_update(order_id):
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            f"order_{order_id}",
            {"type": "order.status.updated", "order_id": order_id},
        )
    except Exception:
        logger.exception("Failed to broadcast order update for %s", order_id)


class DispatchOrderView(APIView):
    """POST /api/orders/<pk>/dispatch – dispatch to Lalamove."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            raise APIError(
                code=err.PERMISSION_DENIED, message="Admin only.", http_status=403
            )
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            raise APIError(
                code=err.ORDER_NOT_FOUND, message="Order not found.", http_status=404
            )

        if order.status not in (OrderStatus.APPROVED_PREPARING,):
            raise APIError(
                code=err.ORDER_INVALID_STATE,
                message="Order not ready for dispatch.",
                http_status=422,
            )

        settings = SystemSettings.get()
        result = lalamove_service.dispatch_order(order, settings)

        order.lalamove_order_id = result["lalamove_order_id"]
        order.lalamove_tracking_url = result["tracking_url"]
        order.status = OrderStatus.IN_TRANSIT
        order.dispatch_retry_count += 1
        order.save(
            update_fields=[
                "lalamove_order_id",
                "lalamove_tracking_url",
                "status",
                "dispatch_retry_count",
                "updated_at",
            ]
        )

        _broadcast_order_update(order.pk)

        return Response(
            DispatchResponseSerializer(
                {
                    "order_id": order.pk,
                    "lalamove_order_id": result["lalamove_order_id"],
                    "tracking_url": result["tracking_url"],
                }
            ).data
        )


class DashboardView(APIView):
    """GET /api/orders/dashboard – admin summary stats."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            raise APIError(
                code=err.PERMISSION_DENIED, message="Admin only.", http_status=403
            )
        summary = order_service.build_dashboard_summary()
        return Response(DashboardSerializer(summary).data)


class LoyaltyView(APIView):
    """GET /api/orders/loyalty – top clients by spend."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            raise APIError(
                code=err.PERMISSION_DENIED, message="Admin only.", http_status=403
            )
        ranking = order_service.build_loyalty_ranking()
        return Response(LoyaltyEntrySerializer(ranking, many=True).data)


class OrderListView(APIView):
    """GET /api/orders/ – list orders (admin: all, client: own)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            orders = Order.objects.select_related("client").prefetch_related(
                "items__product"
            )
        else:
            orders = (
                Order.objects.select_related("client")
                .prefetch_related("items__product")
                .filter(client=request.user)
            )
        return Response(OrderSerializer(orders, many=True).data)
