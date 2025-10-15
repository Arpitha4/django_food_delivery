from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='customer_dashboard'),
    path('create/', views.create_booking, name='create_booking'),
    path('ajax/get-messages/<int:booking_id>/', views.get_messages, name='get_messages'),
    path('ajax/send-message/<int:booking_id>/', views.send_message, name='send_message'),
    path('cancel/<int:booking_id>/', views.cancel_booking, name='cancel_booking'),
    path('delivery/', views.delivery_dashboard, name='delivery_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('assign/<int:booking_id>/', views.assign_delivery, name='assign_delivery'),
    path('update-booking-status/<int:booking_id>/', views.update_booking_status, name='update_booking_status'),
]
