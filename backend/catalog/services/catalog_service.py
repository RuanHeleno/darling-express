"""Catalog service entrypoints for product and category retrieval."""

from django.http import HttpRequest


def list_catalog_products(request: HttpRequest) -> dict:
    return {"status": "pending"}
