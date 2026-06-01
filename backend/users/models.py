from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    CLIENT = "CLIENT", "Client"


class CustomUserManager(BaseUserManager):
    def create_user(self, phone: str, role: str = UserRole.CLIENT, **extra_fields):
        if not phone:
            raise ValueError("Phone is required")
        user = self.model(phone=phone, role=role, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("role", UserRole.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    role = models.CharField(
        max_length=10, choices=UserRole.choices, default=UserRole.CLIENT
    )
    phone = models.CharField(max_length=30, unique=True)
    salon_name = models.CharField(max_length=160, blank=True)
    address_lat = models.FloatField(null=True, blank=True)
    address_lng = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self) -> str:
        return f"{self.phone} ({self.role})"

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
