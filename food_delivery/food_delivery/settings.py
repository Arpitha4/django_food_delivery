import os
from pathlib import Path
import os

# BASE_DIR
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_DIR = (os.path.join(BASE_DIR, "static"))
# URL for serving static files
STATIC_URL = '/static/'

# Directory where collectstatic will put all static files
STATIC_ROOT = BASE_DIR / "staticfiles"

# Optional: Extra directories where Django looks for static files
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# SECURITY
SECRET_KEY = 'django-insecure-7&$x@!m5t*1w#k+2p8)q%v1!u=2j!s@5^&l$0g^r'
DEBUG = True
ALLOWED_HOSTS = ['*']

# INSTALLED APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',  # For real-time chat
    'accounts',  # Custom app
    'bookings',  # Custom app
    'rest_framework',  # Optional for APIs
]

# MIDDLEWARE
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ROOT URL
ROOT_URLCONF = 'food_delivery.urls'

# TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # Your global templates folder
        'APP_DIRS': True,  # Looks for templates in app folders too
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'food_delivery.asgi.application'

# CHANNELS (in-memory for development)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# DATABASE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# AUTH PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# LANGUAGE & TIMEZONE
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# DEFAULT AUTO FIELD
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
WSGI_APPLICATION = 'food_delivery.wsgi.application'
# CUSTOM USER MODEL
AUTH_USER_MODEL = 'accounts.User'

# LOGIN KEYS
SMS_API_KEY = 'b1015dc8-a843-11f0-b922-0200cd936042'
BACKEND_ACCESS_KEY = "123456789"
LOGIN_KEY = "1234"
