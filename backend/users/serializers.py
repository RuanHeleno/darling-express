"""Auth serializers."""

from rest_framework import serializers


class MagicLinkRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)


class MagicLinkResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    role = serializers.CharField()
    expires_in_seconds = serializers.IntegerField()
    expires_at = serializers.CharField()
    deep_link = serializers.CharField()
    client_lat = serializers.FloatField(allow_null=True)
    client_lng = serializers.FloatField(allow_null=True)
