"""Auth views."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .serializers import MagicLinkRequestSerializer, MagicLinkResponseSerializer
from .services.auth_service import issue_magic_link


class MagicLinkView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MagicLinkRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = issue_magic_link(serializer.validated_data["phone"])
        return Response(
            MagicLinkResponseSerializer(result).data, status=status.HTTP_200_OK
        )
