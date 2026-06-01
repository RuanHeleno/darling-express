"""Order serializers."""

from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "payment_method",
            "subtotal",
            "shipping_cost",
            "total",
            "infinitepay_transaction_id",
            "lalamove_order_id",
            "lalamove_tracking_url",
            "created_at",
            "updated_at",
            "items",
        ]


class ShippingQuoteRequestSerializer(serializers.Serializer):
    client_lat = serializers.FloatField()
    client_lng = serializers.FloatField()
    items = OrderItemInputSerializer(many=True)


class ShippingQuoteResponseSerializer(serializers.Serializer):
    quote_id = serializers.CharField()
    price = serializers.CharField()
    free_shipping = serializers.BooleanField()


class PayOrderResponseSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    pix_code = serializers.CharField()
    qr_code_base64 = serializers.CharField()
    total = serializers.CharField()


class DispatchResponseSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    lalamove_order_id = serializers.CharField()
    tracking_url = serializers.CharField()


class DashboardSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    pending = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    delivered = serializers.IntegerField()
    revenue = serializers.CharField()


class LoyaltyEntrySerializer(serializers.Serializer):
    phone = serializers.CharField()
    salon_name = serializers.CharField(allow_null=True)
    total_spent = serializers.CharField()
    order_count = serializers.IntegerField()
