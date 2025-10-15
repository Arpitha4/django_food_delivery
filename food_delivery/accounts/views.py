from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from .models import User
import requests
import random
from django.conf import settings
import logging

logger = logging.getLogger(__name__)
access_key = settings.BACKEND_ACCESS_KEY


def home(request):
    try:
        return render(request, 'accounts/home.html')
    except Exception as e:
        logger.error(f"Error in home page: {e}", exc_info=True)
        return render(request, 'accounts/home.html', {'error': 'An unexpected error occurred.'})


def send_otp_via_2factor(mobile, otp):
    try:
        url = f"https://2factor.in/API/V1/{settings.SMS_API_KEY}/SMS/{mobile}/{otp}/Your OTP is"
        response = requests.get(url)
        return response.ok
    except Exception as e:
        logger.error(f"Error sending OTP to {mobile}: {e}", exc_info=True)
        return False


def process_send_otp(request):
    try:
        mobile = request.POST.get('mobile')
        if not mobile:
            return render(request, 'accounts/login.html', {'error': 'Please enter a mobile number.'})

        user = User.objects.filter(mobile_number=mobile).first()

        if user:
            # Existing user → go to verify OTP page with default OTP 1234
            request.session['2fa_mobile'] = mobile
            request.session['otp_sent'] = settings.LOGIN_KEY
            return render(request, 'accounts/verify_otp.html', {'mobile': mobile, 'role': user.role})
        else:
            # New user → generate random OTP and send via 2Factor
            otp = str(random.randint(1000, 9999))
            request.session['2fa_mobile'] = mobile
            request.session['otp_sent'] = otp
            send_otp_via_2factor(mobile, otp)
            return render(request, 'accounts/signup.html', {'mobile': mobile})

    except Exception as e:
        logger.error(f"Error in process_send_otp: {e}", exc_info=True)
        return render(request, 'accounts/login.html', {'error': 'An unexpected error occurred. Please try again.'})


def process_verify_otp(request):
    try:
        mobile = request.session.get('2fa_mobile')
        if not mobile:
            return render(request, 'accounts/login.html', {'error': 'Session expired. Please try again.'})

        otp = request.POST.get('otp')
        input_access_key = request.POST.get('access_key')

        otp_sent = request.session.get('otp_sent')

        if otp != otp_sent:
            # OTP mismatch
            user = User.objects.filter(mobile_number=mobile).first()
            role = user.role if user else request.POST.get('role', '')
            return render(request, 'accounts/verify_otp.html', {
                'mobile': mobile,
                'error': 'Invalid OTP. Please try again.',
                'role': role
            })

        # OTP matches
        user = User.objects.filter(mobile_number=mobile).first()

        if user:
            # Existing user → use stored role
            role = user.role
        else:
            # New user → get role from POST
            role = request.POST.get('role')
            if role in [User.ADMIN, User.DELIVERY] and input_access_key != access_key:
                return render(request, 'accounts/signup.html', {
                    'mobile': mobile,
                    'roles': {
                        'CUSTOMER': User.CUSTOMER,
                        'DELIVERY': User.DELIVERY,
                        'ADMIN': User.ADMIN
                    },
                    'error': 'Invalid access key.'
                })
            user = User.objects.create(username=mobile, mobile_number=mobile, role=role)

        login(request, user)

        # Redirect based on role
        if role == User.CUSTOMER:
            return redirect('customer_dashboard')
        elif role == User.DELIVERY:
            return redirect('delivery_dashboard')
        elif role == User.ADMIN:
            return redirect('admin_dashboard')
        else:
            return render(request, 'accounts/login.html', {'error': 'Invalid role assigned.'})

    except Exception as e:
        logger.error(f"Error in process_verify_otp: {e}", exc_info=True)
        return render(request, 'accounts/verify_otp.html', {
            'mobile': request.session.get('2fa_mobile'),
            'error': 'An unexpected error occurred. Please try again.',
            'role': user.role if 'user' in locals() else ''
        })


def login_view(request):
    try:
        if request.method == 'POST':
            if 'send_otp' in request.POST:
                return process_send_otp(request)
            elif 'verify_otp' in request.POST:
                return process_verify_otp(request)
            else:
                return render(request, 'accounts/login.html', {'error': 'Invalid action.'})
        else:
            return render(request, 'accounts/login.html')
    except Exception as e:
        logger.error(f"Error in login_view: {e}", exc_info=True)
        return render(request, 'accounts/login.html', {'error': 'An unexpected error occurred. Please try again.'})


def logout_view(request):
    try:
        logout(request)
    except Exception as e:
        logger.error(f"Error during logout: {e}", exc_info=True)
    return redirect('home')
