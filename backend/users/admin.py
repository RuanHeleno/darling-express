from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    ordering = ["phone"]
    list_display = ["phone", "role", "salon_name", "is_active", "is_staff"]
    search_fields = ["phone", "salon_name"]
    list_filter = ["role", "is_active", "is_staff"]
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Profile", {"fields": ("role", "salon_name", "address_lat", "address_lng")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("phone", "role", "salon_name", "password1", "password2"),
            },
        ),
    )
