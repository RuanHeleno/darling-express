"""Channels routing for darling-express backend."""

from django.urls import path

from orders.consumers import OrderEventsConsumer

websocket_urlpatterns = [
    path("ws/orders/", OrderEventsConsumer.as_asgi()),
]
