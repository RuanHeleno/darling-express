"""Authentication service entrypoints for the users app."""

from django.http import HttpRequest


def issue_magic_link(request: HttpRequest) -> dict:
    return {"status": "pending"}
