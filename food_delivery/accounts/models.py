from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class User(AbstractUser):
    CUSTOMER = 'customer'
    DELIVERY = 'delivery'
    ADMIN = 'admin'
    ROLE_CHOICES = [
        (CUSTOMER, 'Customer'),
        (DELIVERY, 'Delivery Partner'),
        (ADMIN, 'Admin')
    ]

    mobile_number = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return self.mobile_number + " " + self.role
