# Foodie Express

## 1. Project Overview
Foodie Express is a Django-based food delivery application that allows customers to browse food items, place orders, and communicate with delivery Partner. Admins and delivery users can manage the system efficiently through role-based access.

## 2. Features & User Roles
### Login & Signup
  - Users can log in with a phone number. Unregistered numbers are redirected to the signup page with OTP verification.
### User Type Selection & Access Key
  - Users select their role: Customer, Admin, or Delivery Partner. Admins and Delivery users must enter an access key from settings.py.
### Booking & Food Selection
  - Customers select food items, provide delivery addresses, view order details, and chat with the assigned delivery person.

## 3. System Architecture
  - Backend: Django (Python)
  - Frontend: Django Templates, jQuery
  - Database: SQLite
  - APIs: For order management, user authentication, and chat

## 4. Implementation
  - User authentication with phone number and OTP
  - Role-based access for Customer, Admin, and Delivery
  - Order management and chat functionality
  - Admin access key validation

## 5. Deployment
  - The project deployed on platform Render. Static files are handled via Django collectstatic, and database migrations are applied before running the server.

## 6. Screenshots
  - Customer Dashboard
  ![Image]<img width="940" height="460" alt="image" src="https://github.com/user-attachments/assets/4d251960-d04b-4c59-9fd9-327ae5a6e655" />

  - Admin Dashboard
  ![Image]<img width="940" height="459" alt="image" src="https://github.com/user-attachments/assets/9f020703-c21b-4e19-9e76-93df01b70d0c" />
  
  - Delivery Partner Dashboard
  ![Image]<img width="940" height="460" alt="image" src="https://github.com/user-attachments/assets/9bfa279d-87aa-45f6-81da-fc623971ef48" />

  - Booking & Chat
  ![Image]<img width="940" height="456" alt="image" src="https://github.com/user-attachments/assets/fabba42e-15bf-4add-ba2e-afba532f33d7" />


