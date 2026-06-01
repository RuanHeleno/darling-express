"""InfinitePay payment service: PIX charge creation and webhook processing."""

import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone

import requests

from api.exceptions import APIError
from api import errors as err


logger = logging.getLogger(__name__)


def _base_url() -> str:
    import os

    return os.environ.get("INFINITEPAY_BASE_URL", "https://api.infinitepay.io")


def create_pix_charge(order, settings) -> dict:
    """
    Create a PIX charge via InfinitePay.
    Returns {"transaction_id": str, "pix_code": str, "qr_code_base64": str}.
    """
    payload = {
        "amount": str(order.total),
        "order_id": str(order.pk),
        "description": f"Esmalteria Express Order #{order.pk}",
        "payment_method": "pix",
        "customer": {
            "id": str(order.client_id),
        },
    }
    try:
        resp = requests.post(
            f"{_base_url()}/v1/transactions",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.infinitepay_api_key}",
                "Content-Type": "application/json",
                "Idempotency-Key": f"order-{order.pk}-pix",
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "transaction_id": data.get("id", ""),
            "pix_code": data.get("pix", {}).get("copy_paste", ""),
            "qr_code_base64": data.get("pix", {}).get("qr_code", ""),
        }
    except requests.RequestException as exc:
        raise APIError(
            code=err.PAYMENT_CHARGE_FAILED,
            message="Failed to create PIX charge.",
            http_status=502,
        ) from exc


def _hmac_sha256(secret: str, body: bytes) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def process_webhook(payload_bytes: bytes, signature: str, secret: str) -> dict:
    """
    Validate HMAC signature and return parsed event data.
    Raises APIError on invalid signature.
    """
    expected = _hmac_sha256(secret, payload_bytes)
    if not hmac.compare_digest(expected, signature):
        raise APIError(
            code=err.PAYMENT_WEBHOOK_INVALID_SIGNATURE,
            message="Webhook signature verification failed.",
            http_status=400,
        )
    return json.loads(payload_bytes)


def record_and_process_webhook(payload_bytes: bytes, signature: str, settings) -> dict:
    """
    Full webhook processing pipeline:
    1. Validate HMAC signature
    2. Deduplicate via WebhookEvent ledger
    3. Update order status
    Returns {"status": "processed" | "duplicate"}.
    """
    from orders.models import (
        WebhookEvent,
        WebhookEventStatus,
        WebhookProvider,
        Order,
        OrderStatus,
    )

    import os
    from django.conf import settings as django_settings

    secret = os.environ.get("INFINITEPAY_WEBHOOK_SECRET") or getattr(
        django_settings, "INFINITEPAY_WEBHOOK_SECRET", ""
    )
    data = process_webhook(payload_bytes, signature, secret)

    event_id = data.get("id") or data.get("event_id") or str(uuid.uuid4())
    payload_hash = hashlib.sha256(payload_bytes).hexdigest()

    event, created = WebhookEvent.objects.get_or_create(
        provider=WebhookProvider.INFINITEPAY,
        provider_event_id=event_id,
        defaults={
            "payload_hash": payload_hash,
            "status": WebhookEventStatus.RECEIVED,
        },
    )

    if not created:
        event.status = WebhookEventStatus.IGNORED_DUPLICATE
        event.save(update_fields=["status"])
        return {"status": "duplicate"}

    # Process the event
    order_id = data.get("order_id") or data.get("metadata", {}).get("order_id")
    event_type = data.get("type", "")

    if order_id and event_type in ("payment.approved", "transaction.approved"):
        try:
            order = Order.objects.get(pk=order_id)
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.APPROVED_PREPARING
                order.infinitepay_transaction_id = event_id
                order.save(
                    update_fields=["status", "infinitepay_transaction_id", "updated_at"]
                )
                event.order = order
        except Order.DoesNotExist:
            logger.warning("Webhook references unknown order %s", order_id)
            event.status = WebhookEventStatus.FAILED
            event.processed_at = datetime.now(tz=timezone.utc)
            event.save(update_fields=["status", "processed_at"])
            return {
                "status": "failed",
                "order_id": order_id,
                "event_type": event_type,
            }

    event.status = WebhookEventStatus.PROCESSED
    event.processed_at = datetime.now(tz=timezone.utc)
    event.save(update_fields=["status", "processed_at", "order"])

    return {"status": "processed", "order_id": order_id, "event_type": event_type}
