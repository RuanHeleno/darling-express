from django.db import models


class SystemSettings(models.Model):
    """Singleton settings row – only one record should exist."""

    payments_enabled = models.BooleanField(default=False)
    free_shipping_threshold = models.DecimalField(
        max_digits=10, decimal_places=2, default="150.00"
    )
    lalamove_api_key = models.CharField(max_length=512, blank=True)
    infinitepay_api_key = models.CharField(max_length=512, blank=True)
    store_lat = models.FloatField(null=True, blank=True)
    store_lng = models.FloatField(null=True, blank=True)

    class Meta:
        verbose_name = "system settings"
        verbose_name_plural = "system settings"

    @classmethod
    def get(cls) -> "SystemSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return "System Settings"
