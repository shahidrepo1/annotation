
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
DEBUG = True

def get_env_list(key):
    return [item.strip() for item in os.getenv(key, '').split(',') if item.strip()]

ALLOWED_HOSTS = ['*']

# CORS settings
CORS_ALLOWED_ORIGINS = get_env_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-csrftoken',
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PATCH',
    'PUT',
    'DELETE',
    'OPTIONS',
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework_simplejwt",
    "rest_framework",
    "debug_toolbar",
    "template_profiler_panel",
    "corsheaders",
    "account",
    "sr_app",
    "stt_app",
    "logo_app",
    "ad_app",
    "fr_app",
    "tf_app",
    "od_app",
    "django_extensions",
]

DEBUG_TOOLBAR_PANELS = [
    "template_profiler_panel.panels.template.TemplateProfilerPanel",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ⬅️ must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",  # ⬅️ move to bottom
]

ROOT_URLCONF = "annotation_project.urls"

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_COOKIE': 'access_token',
    'AUTH_COOKIE_REFRESH': 'refresh_token',
    'AUTH_COOKIE_SECURE': False,
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': 'Lax',
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# CSRF and session settings
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "annotation_project.wsgi.application"

# Database
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.postgresql'),
        'NAME': os.getenv('DB_NAME', 'nothing'),
        'USER': os.getenv('DB_USER', 'nothing'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'ddkkd'),
        'HOST': os.getenv('DB_HOST', 'kadkks'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static & Media files
STATIC_URL = os.getenv('STATIC_URL', 'static/')
MEDIA_URL = os.getenv('MEDIA_URL', '/media/')
MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(BASE_DIR, 'media'))

if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# AI API Configurations
SR_API = os.getenv('SR_API')
SR_API_KEY = os.getenv('SR_API_KEY')
STT_API = os.getenv('STT_API')
STT_API_KEY = os.getenv('STT_API_KEY')
STT_TRAIN_API = os.getenv('STT_TRAIN_API')
FR_API_KEY = os.getenv('FR_API_KEY')
FR_IMAGE_API = os.getenv('FR_IMAGE_API')
FR_VIDEO_API = os.getenv('FR_VIDEO_API')
FR_TRAIN_API = os.getenv('FR_TRAIN_API')
AD_VIDEO_TRAIN_API_URL = os.getenv('AD_VIDEO_TRAIN_API_URL')
AD_API_URL = os.getenv('AD_API_URL')
AD_AUDIO_PROCESS_API_URL = os.getenv('AD_AUDIO_PROCESS_API_URL')
AD_AUDIO_TRAIN_API_URL = os.getenv('AD_AUDIO_TRAIN_API_URL')
AD_AUDIO_VIDEO_PROCESS_API_URL = os.getenv('AD_AUDIO_VIDEO_PROCESS_API_URL')
AD_AUDIO_VIDEO_TRAIN_API_URL = os.getenv('AD_AUDIO_VIDEO_TRAIN_API_URL')
TF_API_URL = os.getenv('TF_API_URL')
TF_API_KEY = os.getenv('TF_API_KEY')
TF_TRAIN_API_URL = os.getenv('TF_TRAIN_API_URL')
OD_API_URL = os.getenv('OD_API_URL')
OD_TRAIN_API_URL = os.getenv('OD_TRAIN_API_URL')

# Custom API Keys
API_KEY = os.getenv('API_KEY')
FR_API_KEY_CUSTOM = os.getenv('FR_API_KEY_CUSTOM')
AD_API_KEY_CUSTOM = os.getenv('AD_API_KEY_CUSTOM')
TF_API_KEY_CUSTOM = os.getenv('TF_API_KEY_CUSTOM')
LOGO_API_KEY_CUSTOM = os.getenv('LOGO_API_KEY_CUSTOM')
STT_API_KEY_CUSTOM = os.getenv('STT_API_KEY_CUSTOM')
OD_API_KEY_CUSTOM = os.getenv('OD_API_KEY_CUSTOM')

AUTH_USER_MODEL = 'account.User'
