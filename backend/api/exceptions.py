"""Custom API exceptions and error envelope for darling-express backend."""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import (
    ValidationError,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
)
from . import errors


class APIError(Exception):
    """Raise this to return a structured error envelope from any service."""

    def __init__(
        self,
        code: str,
        message: str,
        details: dict | None = None,
        http_status: int = 400,
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        self.http_status = http_status
        super().__init__(message)


def _envelope(code: str, message: str, details: dict | None = None) -> dict:
    return {"code": code, "message": message, "details": details or {}}


def api_exception_handler(exc, context):
    """DRF custom exception handler that returns a consistent error envelope."""
    response = exception_handler(exc, context)

    if isinstance(exc, APIError):
        return Response(
            _envelope(exc.code, exc.message, exc.details),
            status=exc.http_status,
        )

    if response is None:
        return Response(
            _envelope(errors.INTERNAL_ERROR, "An unexpected error occurred."),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Map DRF native exceptions to our codes
    code = errors.INTERNAL_ERROR
    message = str(exc)

    if isinstance(exc, ValidationError):
        code = errors.VALIDATION_ERROR
        message = "Validation failed."
        details = exc.detail
    elif isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        code = errors.AUTH_TOKEN_INVALID
        message = "Authentication credentials were not provided or are invalid."
        details = {}
    elif isinstance(exc, PermissionDenied):
        code = errors.PERMISSION_DENIED
        message = "You do not have permission to perform this action."
        details = {}
    elif isinstance(exc, NotFound):
        code = errors.NOT_FOUND
        message = "The requested resource was not found."
        details = {}
    else:
        details = {"detail": str(exc)}

    response.data = _envelope(code, message, details)
    return response
