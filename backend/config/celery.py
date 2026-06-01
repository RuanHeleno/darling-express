"""Celery application for darling-express backend."""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("darling_express")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
