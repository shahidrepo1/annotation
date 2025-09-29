from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from django.conf import settings


class FRAPIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):

        # Get the API key from the request header
        api_key = request.headers.get('X-API-KEY')

        # Check if the provided key matches the stored key
        if api_key != settings.FR_API_KEY_CUSTOM:
            raise AuthenticationFailed('Invalid API key')

        return None
