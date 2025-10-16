#!/bin/bash

echo "Starting deployment..."

# Apply migrations
python manage.py migrate --noinput

# Load initial data (optional)
python manage.py loaddata fixtures/initial_data.json

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn food_delivery.wsgi
