#!/bin/bash

# Navigate to project folder (optional if already in food_delivery)
echo "Starting deployment..."

# Apply migrations
echo "Applying migrations..."
python manage.py migrate --noinput

# Load initial data from fixture
echo "Loading initial data..."
python manage.py loaddata fixtures/initial_data.json

# Start Gunicorn
echo "Starting Gunicorn..."
gunicorn food_delivery.wsgi
