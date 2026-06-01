from django.db import models
from django.conf import settings


class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED_PREPARING = "APPROVED_PREPARING", "Approved / Preparing"
    IN_TRANSIT = "IN_TRANSIT", "In transit"
    DELIVERED = "DELIVERED", "Delivered"
    CANCELED = "CANCELED", "Canceled"
    SHIPPING_UNAVAILABLE = "SHIPPING_UNAVAILABLE", "Shipping unavailable"


class PaymentMethod(models.TextChoices):
    PIX_INFINITEPAY = "PIX_INFINITEPAY", "PIX InfinitePay"
    MANUAL = "MANUAL", "Manual"


class Order(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    status = models.CharField(
        max_length=32,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.PIX_INFINITEPAY,
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default="0.00")
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default="0.00")
    total = models.DecimalField(max_digits=10, decimal_places=2, default="0.00")
    infinitepay_transaction_id = models.CharField(max_length=128, blank=True)
    lalamove_order_id = models.CharField(max_length=128, blank=True)
    lalamove_tracking_url = models.URLField(blank=True)
    dispatch_request_id = models.CharField(max_length=128, blank=True)
    dispatch_retry_count = models.PositiveIntegerField(default=0)
    dispatch_last_error_code = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order #{self.pk} [{self.status}]"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f"{self.quantity}x product#{self.product_id} in Order #{self.order_id}"


class WebhookProvider(models.TextChoices):
    INFINITEPAY = "INFINITEPAY", "InfinitePay"


class WebhookEventStatus(models.TextChoices):
    RECEIVED = "RECEIVED", "Received"
    PROCESSED = "PROCESSED", "Processed"
    IGNORED_DUPLICATE = "IGNORED_DUPLICATE", "Ignored duplicate"
    FAILED = "FAILED", "Failed"


class WebhookEvent(models.Model):
    provider = models.CharField(max_length=20, choices=WebhookProvider.choices)
    provider_event_id = models.CharField(max_length=256)
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="webhook_events",
    )
    status = models.CharField(
        max_length=20,
        choices=WebhookEventStatus.choices,
        default=WebhookEventStatus.RECEIVED,
    )
    payload_hash = models.CharField(max_length=64, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("provider", "provider_event_id")]

    def __str__(self) -> str:
        return f"{self.provider}:{self.provider_event_id} [{self.status}]"
