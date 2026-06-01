"""Order service: settlement, dashboard summary, loyalty ranking."""

from __future__ import annotations

from typing import TYPE_CHECKING
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Count

from api.exceptions import APIError
from api import errors as err

if TYPE_CHECKING:
    from orders.models import Order


def settle_order(
    user, items: list, shipping_cost: Decimal = Decimal("0.00")
) -> "Order":
    """
    Create an Order and deduct stock atomically.
    Lock order: Order first, then Products in ascending id order.
    items = [{"product_id": int, "quantity": int, "unit_price": Decimal}]
    """
    from orders.models import Order, OrderItem
    from catalog.models import Product

    product_ids = sorted(set(i["product_id"] for i in items))

    with transaction.atomic():
        # Lock products in ascending id order to prevent deadlocks
        products = {
            p.pk: p
            for p in Product.objects.select_for_update().filter(pk__in=product_ids)
        }

        # Validate stock
        for item in items:
            product = products.get(item["product_id"])
            if not product:
                raise APIError(
                    code=err.CATALOG_PRODUCT_NOT_FOUND,
                    message=f"Product {item['product_id']} not found.",
                    http_status=404,
                )
            if product.stock_quantity < item["quantity"]:
                raise APIError(
                    code=err.ORDER_INSUFFICIENT_STOCK,
                    message=f"Insufficient stock for {product.name}.",
                    details={
                        "product_id": product.pk,
                        "available": product.stock_quantity,
                    },
                    http_status=422,
                )

        # Deduct stock
        for item in items:
            product = products[item["product_id"]]
            product.stock_quantity -= item["quantity"]
            product.save(update_fields=["stock_quantity"])

        # Compute totals
        subtotal = sum(Decimal(str(i["unit_price"])) * i["quantity"] for i in items)
        total = subtotal + shipping_cost

        # Create order
        order = Order.objects.create(
            client=user,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
        )

        # Create items
        order_items = [
            OrderItem(
                order=order,
                product_id=i["product_id"],
                quantity=i["quantity"],
                unit_price=Decimal(str(i["unit_price"])),
            )
            for i in items
        ]
        OrderItem.objects.bulk_create(order_items)

    return order


def build_dashboard_summary() -> dict:
    """Return aggregate stats for the admin dashboard."""
    from orders.models import Order, OrderStatus

    total_orders = Order.objects.count()
    pending = Order.objects.filter(status=OrderStatus.PENDING).count()
    in_progress = Order.objects.filter(
        status__in=[OrderStatus.APPROVED_PREPARING, OrderStatus.IN_TRANSIT]
    ).count()
    delivered = Order.objects.filter(status=OrderStatus.DELIVERED).count()
    revenue = Order.objects.filter(status=OrderStatus.DELIVERED).aggregate(
        total=Sum("total")
    )["total"] or Decimal("0.00")

    return {
        "total_orders": total_orders,
        "pending": pending,
        "in_progress": in_progress,
        "delivered": delivered,
        "revenue": str(revenue),
    }


def build_loyalty_ranking(limit: int = 10) -> list:
    """Return top clients by total spend on delivered orders."""
    from orders.models import Order, OrderStatus
    from django.db.models import Sum

    rows = (
        Order.objects.filter(status=OrderStatus.DELIVERED)
        .values("client__phone", "client__salon_name")
        .annotate(total_spent=Sum("total"), order_count=Count("id"))
        .order_by("-total_spent")[:limit]
    )
    return [
        {
            "phone": r["client__phone"],
            "salon_name": r["client__salon_name"],
            "total_spent": str(r["total_spent"]),
            "order_count": r["order_count"],
        }
        for r in rows
    ]
