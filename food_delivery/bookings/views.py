from django.shortcuts import render, redirect, get_object_or_404
from .models import Food, Booking, ChatMessage
from django.http import JsonResponse
from accounts.models import User
from django.contrib.auth.decorators import login_required
import logging

logger = logging.getLogger(__name__)


@login_required
def dashboard(request):
    try:
        if request.user.role != User.CUSTOMER:
            return redirect('home')
        foods = Food.objects.all()
        bookings = Booking.objects.filter(customer=request.user).exclude(status="Cancelled")
        return render(request, 'bookings/customer_dashboard.html', {'foods': foods, 'bookings': bookings})
    except Exception as e:
        logger.error(f"Error in dashboard view: {e}", exc_info=True)
        return redirect('home')


@login_required
def create_booking(request):
    try:
        if request.user.role != User.CUSTOMER:
            return redirect('home')

        if request.method == 'POST':
            food_ids = request.POST.getlist('food_ids')
            if not food_ids:
                # No food selected → redirect back
                return redirect('customer_dashboard')

            address = request.POST.get('address', '').strip()
            if not address:
                # Address not provided → redirect back
                return redirect('customer_dashboard')

            # Create booking
            booking = Booking.objects.create(customer=request.user, address=address)
            booking.food_items.add(*food_ids)
            return redirect('customer_dashboard')

        # If GET request, just redirect
        return redirect('customer_dashboard')

    except Exception as e:
        logger.error(f"Error in create_booking view: {e}", exc_info=True)
        return redirect('customer_dashboard')




@login_required
def cancel_booking(request, booking_id):
    try:
        booking = get_object_or_404(Booking, id=booking_id, customer=request.user)
        booking.status = "Cancelled"
        booking.save()
        return redirect('customer_dashboard')
    except Exception as e:
        logger.error(f"Error in cancel_booking view: {e}", exc_info=True)
        return redirect('customer_dashboard')


@login_required
def delivery_dashboard(request):
    try:
        if request.user.role != User.DELIVERY:
            return redirect('home')
        bookings = Booking.objects.exclude(status="Delivered").order_by('-created_at')
        statuses = ['Start', 'Reached', 'Collected', 'Delivered']
        return render(request, 'bookings/delivery_dashboard.html', {'bookings': bookings, 'statuses': statuses})
    except Exception as e:
        logger.error(f"Error in delivery_dashboard view: {e}", exc_info=True)
        return redirect('home')


@login_required
def admin_dashboard(request):
    try:
        if request.user.role != User.ADMIN:
            return redirect('customer_dashboard')
        bookings = Booking.objects.filter(status='pending').order_by('-created_at')
        delivery_partners = User.objects.filter(role=User.DELIVERY)
        return render(request, 'bookings/admin_dashboard.html', {
            'bookings': bookings,
            'delivery_partners': delivery_partners
        })
    except Exception as e:
        logger.error(f"Error in admin_dashboard view: {e}", exc_info=True)
        return redirect('customer_dashboard')


@login_required
def assign_delivery(request, booking_id):
    try:
        if request.user.role != User.ADMIN:
            return redirect('customer_dashboard')
        booking = get_object_or_404(Booking, id=booking_id)
        if request.method == 'POST':
            dp_id = request.POST.get('delivery_partner')
            dp = get_object_or_404(User, id=dp_id)
            booking.delivery_partner = dp
            booking.status = 'assigned'
            booking.save()
        return redirect('admin_dashboard')
    except Exception as e:
        logger.error(f"Error in assign_delivery view: {e}", exc_info=True)
        return redirect('admin_dashboard')


@login_required
def update_booking_status(request, booking_id):
    try:
        if request.method == 'POST':
            status = request.POST.get('status')
            booking = Booking.objects.get(id=booking_id)
            booking.status = status
            booking.save()
            return JsonResponse({'success': True, 'status': booking.status})
        return JsonResponse({'success': False, 'error': 'Invalid request'})
    except Exception as e:
        logger.error(f"Error in update_booking_status view: {e}", exc_info=True)
        return JsonResponse({'success': False, 'error': str(e)})


def get_messages(request, booking_id):
    try:
        messages = ChatMessage.objects.filter(booking_id=booking_id).order_by('timestamp')
        data = [{'sender': m.sender.username, 'message': m.message} for m in messages]
        return JsonResponse(data, safe=False)
    except Exception as e:
        logger.error(f"Error in get_messages view: {e}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)


def send_message(request, booking_id):
    try:
        if request.method == "POST":
            msg_text = request.POST.get('message')
            booking = Booking.objects.get(id=booking_id)
            msg = ChatMessage.objects.create(
                booking=booking,
                sender=request.user,
                message=msg_text
            )
            return JsonResponse({'sender': msg.sender.username, 'message': msg.message})
        return JsonResponse({'error': 'Invalid method'}, status=400)
    except Exception as e:
        logger.error(f"Error in send_message view: {e}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)
