from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import generics
from .models import User
from .serializers import UserRegisterSerializer
from django.core.mail import send_mail
from .utils import generate_confirmation_link
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from rest_framework.response import Response

def hello_world(request):
    return JsonResponse({"message": "Hello, Django API is running!"})

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user.is_active = True  # allow login (or leave False if you want to block unconfirmed)
        user.save()

        # Generate confirmation link
        link = generate_confirmation_link(user, self.request)

        # Send email
        send_mail(
            subject="Confirm your email for Solar App 🌞",
            message=f"Hello {user.first_name},\n\nClick this link to confirm your email:\n{link}\n\nThanks!",
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )

class ConfirmEmailView(generics.CreateAPIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid link'}, status=400)

        if default_token_generator.check_token(user, token):
            user.is_confirmed = True
            user.save()
            return Response({'detail': 'Email confirmed! 🎉'})
        return Response({'detail': 'Invalid or expired token'}, status=400)