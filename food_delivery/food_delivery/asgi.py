import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from food_delivery import bookings

# import bookings.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_delivery.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            bookings.routing.websocket_urlpatterns
        )
    ),
})
