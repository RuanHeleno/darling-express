"""Orders URL configuration."""

from django.urls import path
from .views import (
    ShippingQuoteView,
    PayOrderView,
    WebhookView,
    DispatchOrderView,
    DashboardView,
    LoyaltyView,
    OrderListView,
)

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("shipping-quote", ShippingQuoteView.as_view(), name="shipping-quote"),
    path("pay", PayOrderView.as_view(), name="pay-order"),
    path("webhook/infinitepay", WebhookView.as_view(), name="webhook-infinitepay"),
    path("dashboard", DashboardView.as_view(), name="dashboard"),
    path("loyalty", LoyaltyView.as_view(), name="loyalty"),
    path("<int:pk>/dispatch", DispatchOrderView.as_view(), name="dispatch-order"),
]
