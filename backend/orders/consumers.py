from channels.generic.websocket import AsyncWebsocketConsumer


class OrderEventsConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        await self.accept()

    async def disconnect(self, close_code: int) -> None:
        return None
