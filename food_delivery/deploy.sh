#!/bin/bash

echo "Starting deployment..."

# Apply migrations
python manage.py migrate --noinput

# Create superuser automatically
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()

mobile_number = "9448138524"
email = "admin@example.com"
password = "1234"

if not User.objects.filter(username=mobile_number).exists():
    User.objects.create_superuser(
        username=mobile_number,
        email=email,
        password=password,
        mobile_number=mobile_number,
        is_staff=True,
        is_superuser=True
    )
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
END

# Load initial data (optional)
python manage.py loaddata fixtures/initial_data.json

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn food_delivery.wsgi
