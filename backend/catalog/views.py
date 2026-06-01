"""Catalog views."""

from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Product
from .serializers import ProductSerializer


class ProductListView(ListAPIView):
    """List all active products with their category."""

    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .order_by("category__name", "name")
        )
