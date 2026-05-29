from django.db import models


class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED_PREPARING = "APPROVED_PREPARING", "Approved / Preparing"
    IN_TRANSIT = "IN_TRANSIT", "In transit"
    DELIVERED = "DELIVERED", "Delivered"
    CANCELED = "CANCELED", "Canceled"
    SHIPPING_UNAVAILABLE = "SHIPPING_UNAVAILABLE", "Shipping unavailable"


class Order(models.Model):
    status = models.CharField(max_length=32, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_name = models.CharField(max_length=160)
    quantity = models.PositiveIntegerField(default=1)
