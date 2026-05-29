"""Lalamove service entrypoints for quoting and dispatch."""

from django.http import HttpRequest


def quote_shipping(request: HttpRequest) -> dict:
    return {"status": "pending"}
