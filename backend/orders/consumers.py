"""WebSocket consumer for real-time order status updates."""

from __future__ import annotations

import asyncio
import json

from channels.generic.websocket import AsyncWebsocketConsumer


HEARTBEAT_INTERVAL = 30  # seconds
IDLE_TIMEOUT = 120  # seconds without activity before disconnect


class OrderEventsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket endpoint: ws/orders/<order_id>/
    Clients subscribe to a specific order group and receive real-time status updates.
    """

    async def connect(self) -> None:
        self.order_id = self.scope["url_route"]["kwargs"].get("order_id", "all")
        self.group_name = f"order_{self.order_id}"
        self._heartbeat_task = None
        self._last_activity = asyncio.get_event_loop().time()

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        self._heartbeat_task = asyncio.ensure_future(self._heartbeat())

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
