"""Catalog service entrypoints for product and category retrieval."""

from catalog.models import Product


def list_catalog_products():
    return (
        Product.objects.filter(is_active=True)
        .select_related("category")
        .order_by("category__name", "name")
    )
