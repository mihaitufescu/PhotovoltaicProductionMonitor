from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.views import APIView
from .models import User, Plant, AlarmPlant, ApiKeyIngestionSettings
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer, UserUpdateSerializer, PlantSerializer, PlantOverviewSerializer
from django.core.mail import send_mail
from .utils import generate_confirmation_link
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.timezone import now
from datetime import timedelta

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = serializer.validated_data['refresh']
        access = serializer.validated_data['access']

        res = Response({'message': 'Login successful'})

        # Set secure cookies
        cookie_exp = now() + timedelta(days=1)
        res.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            secure=False,  # Set True in production
            samesite='Lax',
            expires=cookie_exp
        )
        res.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            expires=now() + timedelta(days=7)
        )

        return res

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

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
            subject="Confirm your email for Photovoltaic Production Monitor 🌞",
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
    
class UpdateUserView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer
    def put(self, request, user_id):
        print(f"User id is {user_id}")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "User not found.", 'is_error': True}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "User updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetJWTUserView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "is_email_confirmed": user.is_email_confirmed
        })
    
class GetUserByIdView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    lookup_url_kwarg = 'user_id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "message": "User fetched successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
class DeleteCurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "User account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
class CreatePlantView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        serializer = PlantSerializer(data=request.data)

        if serializer.is_valid():
            plant, api_key = serializer.save(user=request.user)

            response_data = {
                "message": "Plant created successfully",
                "plant_id": plant.id,
            }

            if api_key:
                response_data["api_key"] = api_key

            return Response(response_data, status=status.HTTP_201_CREATED)

        # Return error if validation fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PlantOverviewAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_plants = Plant.objects.filter(user=request.user)
        overview_list = []
        for plant in user_plants:
            serializer = PlantOverviewSerializer({
                "plant": plant,
                "devices": plant.devices.all(),
                "alarm_settings": getattr(plant, 'alarm_settings', None)
            })
            overview_list.append(serializer.data)

        return Response(overview_list)
    

class DeletePlantAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, plant_id):
        try:
            plant = Plant.objects.get(id=plant_id, user=request.user)
            plant.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Plant.DoesNotExist:
            return Response({'error': 'Plant not found or unauthorized'}, status=404)