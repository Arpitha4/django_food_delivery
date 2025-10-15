from accounts.models import User
from django.db import models


class Food(models.Model):
    NORTH = 'north'
    SOUTH = 'south'
    CATEGORY_CHOICES = [
        (NORTH, 'North Indian'),
        (SOUTH, 'South Indian'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default=NORTH)

    def __str__(self):
        return self.name


class Booking(models.Model):
    customer = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    delivery_partner = models.ForeignKey('accounts.User', null=True, blank=True, on_delete=models.SET_NULL,
                                         related_name='assigned_bookings')
    food_items = models.ManyToManyField(Food)
    address = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='pending')  # pending, assigned, delivered etc.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} by {self.customer.username}"


class ChatMessage(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.message}"
