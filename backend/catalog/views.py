"""Catalog views."""

from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from .serializers import ProductSerializer
from .services.catalog_service import list_catalog_products


class ProductListView(ListAPIView):
    """List all active products with their category."""

    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return list_catalog_products()
