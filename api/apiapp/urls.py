from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('confirm-email/<uidb64>/<token>/', views.ConfirmEmailView.as_view(), name='confirm-email'),
]