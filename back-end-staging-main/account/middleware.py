from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.middleware import get_user

User = get_user_model()

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/admin/'):
            request.user = get_user(request)
            return
        
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if access_token:
            try:
                token = AccessToken(access_token)
                user_id = token['user_id']
                user = User.objects.get(id=user_id)
                request.user = user
            except (InvalidToken, TokenError, User.DoesNotExist) as e:
                request.user = None
        else:
            request.user = None