"""InfinitePay service entrypoints for PIX payments and webhook handling."""

from django.http import HttpRequest


def create_pix_charge(request: HttpRequest) -> dict:
    return {"status": "pending"}
