#!/bin/bash

# Navigate to project folder (optional if already in food_delivery)
echo "Starting deployment..."

# Apply migrations
echo "Applying migrations..."
python manage.py migrate --noinput

# Create superuser automatically
echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth.models import User
import os

username = os.environ.get("DJANGO_ADMIN_USER", "9448138524")
email = os.environ.get("DJANGO_ADMIN_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_ADMIN_PASSWORD", "Arpi@123")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superuser created.")
else:
    print("Superuser already exists.")
END

# Load initial data from fixture
echo "Loading initial data..."
python manage.py loaddata fixtures/initial_data.json

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn
echo "Starting Gunicorn..."
gunicorn food_delivery.wsgi
