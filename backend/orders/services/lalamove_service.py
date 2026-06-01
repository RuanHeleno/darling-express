"""Lalamove shipping service: quote and dispatch."""

import uuid
import requests


def _headers(api_key: str) -> dict:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _base_url() -> str:
    import os

    return os.environ.get("LALAMOVE_BASE_URL", "https://rest.sandbox.lalamove.com")


def quote_shipping(
    cart_items: list, client_lat: float, client_lng: float, settings
) -> dict:
    """
    Request a shipping quote from Lalamove.
    Returns {"quote_id": str, "price": Decimal}.
    Raises ShippingUnavailableError if Lalamove cannot service the route.
    """
    from api.exceptions import APIError
    from api import errors as err

    payload = {
        "serviceType": "MOTORCYCLE",
        "specialRequests": [],
        "stops": [
            {
                "coordinates": {
                    "lat": str(settings.store_lat),
                    "lng": str(settings.store_lng),
                },
                "address": "Esmalteria Store",
            },
            {
                "coordinates": {"lat": str(client_lat), "lng": str(client_lng)},
                "address": "Client Address",
            },
        ],
        "item": {
            "quantity": str(sum(i.get("quantity", 1) for i in cart_items)),
            "weight": "LESS_THAN_3_KG",
            "categories": ["BEAUTY_AND_HEALTHCARE"],
            "handlingInstructions": [],
        },
        "language": "pt_BR",
        "isRouteOptimized": False,
        "currency": "BRL",
    }
    try:
        resp = requests.post(
            f"{_base_url()}/v3/quotations",
            json=payload,
            headers=_headers(settings.lalamove_api_key),
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        price = data.get("priceBreakdown", {}).get("total", "0")
        quote_id = data.get("quotationId", "")
        return {"quote_id": quote_id, "price": price}
    except requests.RequestException as exc:
        raise APIError(
            code=err.SHIPPING_UNAVAILABLE,
            message="Shipping is currently unavailable.",
            http_status=503,
        ) from exc


def dispatch_order(order, settings) -> dict:
    """
    Place a Lalamove delivery order.
    Idempotent: uses order.dispatch_request_id.
    Returns {"lalamove_order_id": str, "tracking_url": str}.
    """
    from api.exceptions import APIError
    from api import errors as err

    if not order.dispatch_request_id:
        order.dispatch_request_id = str(uuid.uuid4())
        order.save(update_fields=["dispatch_request_id"])

    payload = {
        "quotationId": order.lalamove_order_id or "",
        "sender": {
            "stopId": "0",
            "name": "Esmalteria",
            "phone": "+5511000000000",
        },
        "recipients": [
            {
                "stopId": "1",
                "name": f"Client {order.client_id}",
                "phone": "+5511000000001",
            }
        ],
        "isPODEnabled": False,
        "isRecipientSMSEnabled": False,
        "partnerOrderId": f"order-{order.pk}",
    }
    try:
        resp = requests.post(
            f"{_base_url()}/v3/orders",
            json=payload,
            headers={
                **_headers(settings.lalamove_api_key),
                "X-Request-ID": order.dispatch_request_id,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "lalamove_order_id": data.get("orderId", ""),
            "tracking_url": data.get("shareLink", ""),
        }
    except requests.RequestException as exc:
        error_code = getattr(getattr(exc, "response", None), "text", str(exc))
        raise APIError(
            code=err.SHIPPING_UNAVAILABLE,
            message="Failed to dispatch order via Lalamove.",
            details={"error": error_code},
            http_status=503,
        ) from exc
