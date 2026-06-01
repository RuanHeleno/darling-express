from django.contrib import admin
from .models import Order, OrderItem, WebhookEvent


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "client", "status", "total", "created_at"]
    list_filter = ["status", "payment_method"]
    search_fields = ["client__phone", "infinitepay_transaction_id"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "product", "quantity", "unit_price"]


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ["id", "provider", "provider_event_id", "status", "processed_at"]
    list_filter = ["provider", "status"]
    readonly_fields = ["provider", "provider_event_id", "payload_hash", "processed_at"]
