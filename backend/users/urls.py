"""Users URL configuration."""

from django.urls import path
from .views import MagicLinkView

urlpatterns = [
    path("magic-link", MagicLinkView.as_view(), name="magic-link"),
]
