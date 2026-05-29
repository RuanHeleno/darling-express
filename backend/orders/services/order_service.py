"""Order service entrypoints for pricing, checkout, and status changes."""

from django.http import HttpRequest


def build_order_summary(request: HttpRequest) -> dict:
    return {"status": "pending"}
