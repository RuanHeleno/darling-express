from django.urls import include, path

urlpatterns = [
    path("auth/", include("users.urls")),
    path("catalog/", include("catalog.urls")),
    path("orders/", include("orders.urls")),
]
