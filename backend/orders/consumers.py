"""WebSocket consumer for real-time order status updates."""

from __future__ import annotations

import asyncio
import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


HEARTBEAT_INTERVAL = 30  # seconds
IDLE_TIMEOUT = 120  # seconds without activity before disconnect


class OrderEventsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket endpoint: ws/orders/<order_id>/
    Clients subscribe to a specific order group and receive real-time status updates.
    """

    async def connect(self) -> None:
        self.order_id = self.scope["url_route"]["kwargs"].get("order_id", "all")
        self.user = await self._authenticate_user()
        if not self.user:
            await self.close(code=4401)
            return

        authorized = await self._authorize_user_for_order(self.user, self.order_id)
        if not authorized:
            await self.close(code=4403)
            return

        self.group_name = f"order_{self.order_id}"
        self._heartbeat_task = None
        self._last_activity = asyncio.get_event_loop().time()

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        self._heartbeat_task = asyncio.create_task(self._heartbeat())

    async def disconnect(self, code: int) -> None:
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(
        self, text_data: str | None = None, bytes_data: bytes | None = None
    ) -> None:
        """Update last activity timestamp on any client message."""
        self._last_activity = asyncio.get_event_loop().time()

    async def order_status_updated(self, event: dict) -> None:
        """Handler for group messages of type order.status.updated."""
        self._last_activity = asyncio.get_event_loop().time()
        await self.send(
            text_data=json.dumps(
                {
                    "type": "order_status_updated",
                    "order_id": event.get("order_id"),
                }
            )
        )

    async def _heartbeat(self) -> None:
        """Send periodic pings and disconnect idle connections."""
        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL)
            now = asyncio.get_event_loop().time()
            if now - self._last_activity > IDLE_TIMEOUT:
                await self.close()
                return
            try:
                await self.send(text_data=json.dumps({"type": "ping"}))
            except Exception:
                return

    async def _authenticate_user(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [""])[0]
        if not token:
            return None
        return await self._get_user_from_token(token)

    @database_sync_to_async
    def _get_user_from_token(self, token: str):
        from users.models import CustomUser

        try:
            claims = AccessToken(token)
        except TokenError:
            return None

        user_id = claims.get("user_id")
        if not user_id:
            return None

        try:
            return CustomUser.objects.get(pk=user_id, is_active=True)
        except CustomUser.DoesNotExist:
            return None

    @database_sync_to_async
    def _authorize_user_for_order(self, user, order_id):
        from orders.models import Order

        if order_id == "all":
            return bool(user.is_staff)

        if user.is_staff:
            return True

        try:
            order = Order.objects.only("client_id").get(pk=order_id)
        except Order.DoesNotExist:
            return False
        return order.client_id == user.pk
