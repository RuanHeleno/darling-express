from django.db import models


class SystemSetting(models.Model):
    name = models.CharField(max_length=120, unique=True)
    value = models.JSONField(default=dict)

    class Meta:
        verbose_name = "system setting"
        verbose_name_plural = "system settings"
