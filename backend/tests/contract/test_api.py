"""Contract tests for the API endpoints."""

import json
import hashlib
import hmac

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from catalog.models import Category, Product
from core.models import SystemSettings
from orders.models import Order, OrderStatus

User = get_user_model()


def make_client_user(phone="+5511999990001"):
    return User.objects.create(phone=phone, role="CLIENT", is_active=True)


def auth_header(user) -> dict:
    token = str(RefreshToken.for_user(user).access_token)
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


class MagicLinkContractTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_client_user()

    def test_magic_link_returns_token(self):
        resp = self.client.post(
            "/api/auth/magic-link", {"phone": self.user.phone}, format="json"
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("token", data)
        self.assertIn("role", data)
        self.assertIn("expires_in_seconds", data)
        self.assertEqual(data["expires_in_seconds"], 7 * 86400)

    def test_magic_link_unknown_phone_returns_404(self):
        resp = self.client.post(
            "/api/auth/magic-link", {"phone": "+00000000000"}, format="json"
        )
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(resp.json()["code"], "AUTH_PHONE_NOT_FOUND")


class CatalogContractTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_client_user("+5511999990002")
        self.category = Category.objects.create(name="Esmaltes", slug="esmaltes")
        self.product = Product.objects.create(
            category=self.category,
            name="Esmalte Nude",
            price="18.90",
            stock_quantity=10,
            is_active=True,
        )
        Product.objects.create(
            category=self.category,
            name="Esmalte Inactive",
            price="5.00",
            stock_quantity=5,
            is_active=False,
        )

    def test_product_list_returns_only_active(self):
        resp = self.client.get("/api/catalog/products", **auth_header(self.user))
        self.assertEqual(resp.status_code, 200)
        ids = [p["id"] for p in resp.json()]
        self.assertIn(self.product.pk, ids)
        self.assertEqual(len(ids), 1)

    def test_product_list_requires_auth(self):
        resp = self.client.get("/api/catalog/products")
        self.assertEqual(resp.status_code, 401)


class WebhookIdempotencyTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        SystemSettings.objects.create(pk=1, payments_enabled=True)
        self.user = make_client_user("+5511999990003")
        self.category = Category.objects.create(name="Cat", slug="cat")
        self.product = Product.objects.create(
            category=self.category, name="P", price="10.00", stock_quantity=5
        )
        self.order = Order.objects.create(
            client=self.user,
            subtotal="10.00",
            shipping_cost="0.00",
            total="10.00",
            status=OrderStatus.PENDING,
        )

    def _build_webhook_payload(self, event_id: str) -> bytes:
        payload = {
            "id": event_id,
            "type": "payment.approved",
            "order_id": self.order.pk,
        }
        return json.dumps(payload).encode()

    def _sign(self, payload: bytes, secret="dev-webhook-secret") -> str:
        return hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

    def test_webhook_processed_once(self):
        import os

        os.environ["INFINITEPAY_WEBHOOK_SECRET"] = "dev-webhook-secret"

        payload = self._build_webhook_payload("evt-001")
        sig = self._sign(payload)

        resp = self.client.post(
            "/api/orders/webhook/infinitepay",
            data=payload,
            content_type="application/json",
            HTTP_X_INFINITEPAY_SIGNATURE=sig,
        )
        self.assertEqual(resp.status_code, 200)

        # Duplicate
        resp2 = self.client.post(
            "/api/orders/webhook/infinitepay",
            data=payload,
            content_type="application/json",
            HTTP_X_INFINITEPAY_SIGNATURE=sig,
        )
        self.assertEqual(resp2.status_code, 200)

        from orders.models import WebhookEvent, WebhookEventStatus

        events = WebhookEvent.objects.filter(provider_event_id="evt-001")
        self.assertEqual(events.count(), 1)
        self.assertEqual(events.first().status, WebhookEventStatus.IGNORED_DUPLICATE)

    def test_webhook_invalid_signature_rejected(self):
        payload = self._build_webhook_payload("evt-002")
        resp = self.client.post(
            "/api/orders/webhook/infinitepay",
            data=payload,
            content_type="application/json",
            HTTP_X_INFINITEPAY_SIGNATURE="invalid",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "PAYMENT_WEBHOOK_INVALID_SIGNATURE")
