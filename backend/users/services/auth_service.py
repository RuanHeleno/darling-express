"""Authentication service: JWT magic-link issuance."""

from datetime import datetime, timezone, timedelta

from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import CustomUser
from api.exceptions import APIError
from api import errors as err


_SESSION_DAYS = getattr(settings, "MAGIC_LINK_LIFETIME_DAYS", 7)


def issue_magic_link(phone: str) -> dict:
    """
    Look up user by phone and issue a JWT token (magic-link style).
    Returns token, role, expiry info and deep-link URL.
    """
    try:
        user = CustomUser.objects.get(phone=phone)
    except CustomUser.DoesNotExist:
        raise APIError(
            code=err.AUTH_PHONE_NOT_FOUND,
            message="No account found for this phone number.",
            http_status=404,
        )

    if not user.is_active:
        raise APIError(
            code=err.AUTH_TOKEN_INVALID,
            message="Account is inactive.",
            http_status=403,
        )

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # Include role claim so deep-link login can route by RBAC without API fetch.
    access["role"] = user.role

    # Override lifetime to match configured session days
    lifetime = timedelta(days=_SESSION_DAYS)
    access.set_exp(lifetime=lifetime)

    expires_at = datetime.now(tz=timezone.utc) + lifetime
    expires_in_seconds = int(lifetime.total_seconds())

    token_str = str(access)
    deep_link = f"esmalteria://auth?token={token_str}"

    return {
        "token": token_str,
        "role": user.role,
        "expires_in_seconds": expires_in_seconds,
        "expires_at": expires_at.isoformat(),
        "deep_link": deep_link,
        "client_lat": user.address_lat,
        "client_lng": user.address_lng,
    }
