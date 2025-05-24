import io
import logging
import csv
import hashlib
import requests
import json
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.views import APIView
from .models import User, Plant, AlarmPlant, ApiKeyIngestionSettings, Device, PlantData
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer, UserUpdateSerializer, PlantSerializer, PlantOverviewSerializer,GetPlantSerializer, GetDeviceSerializer, DeviceCreateUpdateSerializer
from django.core.mail import send_mail
from .utils import generate_confirmation_link
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.timezone import now
from datetime import timedelta
import yaml
from django.db.models import Q

logger = logging.getLogger(__name__)

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
        

class UpdatePlantAPIView(APIView):
    def patch(self, request, plant_id):
        try:
            plant = Plant.objects.get(id=plant_id, user=request.user)
        except Plant.DoesNotExist:
            return Response({'error': 'Plant not found or unauthorized'}, status=404)
        serializer = GetPlantSerializer(plant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetDevicesByPlantAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, plant_id):
        try:
            plant = Plant.objects.get(id=plant_id)
        except Plant.DoesNotExist:
            return Response({"error": "Plant not found"}, status=status.HTTP_404_NOT_FOUND)
        
        devices = Device.objects.filter(plant=plant)
        if not devices:
            return Response({"error": "Devices associated to plant not found"}, status=status.HTTP_404_NOT_FOUND)
        serialized_devices = GetDeviceSerializer(devices, many = True)
        return Response(serialized_devices.data, status=status.HTTP_200_OK)

class AddDeviceByPlantAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeviceCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateDeviceByPlantAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, device_id):
        try:
            device = Device.objects.get(id=device_id)
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)
        serialized_device = DeviceCreateUpdateSerializer(device, data=request.data, partial=True)
        if serialized_device.is_valid():
            serialized_device.save()
            return Response(serialized_device.data, status=status.HTTP_200_OK)
        return Response(serialized_device.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteDeviceByPlantAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, device_id):
        try:
            device = Device.objects.get(id=device_id)
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)
        device.delete()
        return Response({"message": "Device deleted"}, status=status.HTTP_204_NO_CONTENT)
    
class PlantDataIngestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, plant_id):        
        content_type = request.content_type
        file_type = None
        try:
            if content_type == 'application/json':
                entry = request.data.get('data')
                file_type = 'json'
            elif content_type.startswith('multipart/form-data') or content_type.startswith('text/csv'):
                file = request.FILES.get('file')
                if not file:
                    return Response({"error": "File not provided"}, status=status.HTTP_400_BAD_REQUEST)

                if file.name.endswith('.csv'):
                    decoded_file = file.read().decode('utf-8')
                    csv_reader = csv.DictReader(io.StringIO(decoded_file))
                    entry = next(csv_reader, None)
                    file_type = 'csv'
                elif file.name.endswith('.json'):
                    try:
                        entry = json.load(file)
                        file_type = 'json'
                    except json.JSONDecodeError as e:
                        return Response({"error": f"Invalid JSON file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Unsupported file format. Please upload .csv or .json"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Unsupported content type"}, status=status.HTTP_400_BAD_REQUEST)

            if not entry:
                return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)
            
            if 'plant_id' not in entry:
                entry['plant_id'] = plant_id

            # Build variables dict for mutation
            execution_params = {
                "selector": {
                    "jobName": "file_ingestion_pipeline",
                    "repositoryName": "__repository__",
                    "repositoryLocationName": "dagster_app",
                    "assetSelection": [],
                    "assetCheckSelection": []
                },
                "runConfigData": yaml.safe_dump({
                    "ops": {
                        "ingest_file_asset": {
                           "config": {
                                "file_data": json.dumps(entry),
                                "file_type": file_type
                            }
                        }
                    }
                }),
                "mode": "default",
                "executionMetadata": {
                    "tags": []
                }
            }

            mutation = """
            mutation LaunchPipelineExecution($executionParams: ExecutionParams!) {
              launchPipelineExecution(executionParams: $executionParams) {
                __typename
                ... on LaunchRunSuccess {
                  run {
                    runId
                    pipelineName
                    __typename
                  }
                  __typename
                }
                ... on RunConfigValidationInvalid {
                  errors {
                    message
                    __typename
                  }
                  __typename
                }
                ... on PythonError {
                  message
                  stack
                  __typename
                }
              }
            }
            """

            dagster_graphql_url = "http://data-unit:3001/graphql"
            headers = {'Content-Type': 'application/json'}

            payload = {
                "query": mutation,
                "variables": {
                    "executionParams": execution_params
                }
            }

            response = requests.post(
                dagster_graphql_url,
                headers=headers,
                data=json.dumps(payload)
            )

            dagster_response = response.json()

            # Check if there are errors inside the data response
            data_resp = dagster_response.get('data', {})
            launch_resp = data_resp.get('launchPipelineExecution', {})

            if 'errors' in dagster_response:
                return Response({"error": "Failed to trigger Dagster job", "details": dagster_response['errors']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if launch_resp.get('__typename') != 'LaunchRunSuccess':
                # Return errors from validation or python errors in the mutation response
                return Response({"error": "Dagster job failed", "details": launch_resp}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Successfully triggered Dagster job",
                "dagster_response": launch_resp
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class PlantCustomDataIngestionView(APIView):
    def post(self, request):
        api_key = request.headers.get('X-API-KEY')
        if not api_key:
            return Response({"error": "Missing API key"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Find plant_id by API key (customize based on your model)
        try:
            # Fetch only active, non-expired API keys
            today = now()
            valid_keys = ApiKeyIngestionSettings.objects.filter(
                is_active=True
            ).filter(
                Q(expiration_date__isnull=True) | Q(expiration_date__gte=today)
            )

            matched_setting = None
            for setting in valid_keys.only('id', 'api_key'):
                if check_password(api_key, setting.api_key):
                    matched_setting = setting
                    break

            if not matched_setting:
                return Response({"error": "Invalid or expired API key"}, status=status.HTTP_403_FORBIDDEN)

            # Now fetch the plant using select_related to avoid second query
            matched_setting = ApiKeyIngestionSettings.objects.select_related('plant').get(id=matched_setting.id)
            plant = matched_setting.plant
            plant_id = plant.id
        except ApiKeyIngestionSettings.DoesNotExist:
            return Response({"error": "Invalid or inactive API key"}, status=status.HTTP_403_FORBIDDEN)  
        content_type = request.content_type
        file_type = None
        try:
            if content_type == 'application/json':
                entry = request.data.get('data')
                file_type = 'json'
            elif content_type.startswith('multipart/form-data') or content_type.startswith('text/csv'):
                file = request.FILES.get('file')
                if not file:
                    return Response({"error": "File not provided"}, status=status.HTTP_400_BAD_REQUEST)

                if file.name.endswith('.csv'):
                    decoded_file = file.read().decode('utf-8')
                    csv_reader = csv.DictReader(io.StringIO(decoded_file))
                    entry = next(csv_reader, None)
                    file_type = 'csv'
                elif file.name.endswith('.json'):
                    try:
                        entry = json.load(file)
                        file_type = 'json'
                    except json.JSONDecodeError as e:
                        return Response({"error": f"Invalid JSON file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Unsupported file format. Please upload .csv or .json"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Unsupported content type"}, status=status.HTTP_400_BAD_REQUEST)

            if not entry:
                return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)
            
            if 'plant_id' not in entry:
                entry['plant_id'] = plant_id

            # Build variables dict for mutation
            execution_params = {
                "selector": {
                    "jobName": "file_ingestion_pipeline",
                    "repositoryName": "__repository__",
                    "repositoryLocationName": "dagster_app",
                    "assetSelection": [],
                    "assetCheckSelection": []
                },
                "runConfigData": yaml.safe_dump({
                    "ops": {
                        "ingest_file_asset": {
                           "config": {
                                "file_data": json.dumps(entry),
                                "file_type": file_type
                            }
                        }
                    }
                }),
                "mode": "default",
                "executionMetadata": {
                    "tags": []
                }
            }

            mutation = """
            mutation LaunchPipelineExecution($executionParams: ExecutionParams!) {
              launchPipelineExecution(executionParams: $executionParams) {
                __typename
                ... on LaunchRunSuccess {
                  run {
                    runId
                    pipelineName
                    __typename
                  }
                  __typename
                }
                ... on RunConfigValidationInvalid {
                  errors {
                    message
                    __typename
                  }
                  __typename
                }
                ... on PythonError {
                  message
                  stack
                  __typename
                }
              }
            }
            """

            dagster_graphql_url = "http://data-unit:3001/graphql"
            headers = {'Content-Type': 'application/json'}

            payload = {
                "query": mutation,
                "variables": {
                    "executionParams": execution_params
                }
            }

            response = requests.post(
                dagster_graphql_url,
                headers=headers,
                data=json.dumps(payload)
            )

            dagster_response = response.json()

            # Check if there are errors inside the data response
            data_resp = dagster_response.get('data', {})
            launch_resp = data_resp.get('launchPipelineExecution', {})

            if 'errors' in dagster_response:
                return Response({"error": "Failed to trigger Dagster job", "details": dagster_response['errors']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if launch_resp.get('__typename') != 'LaunchRunSuccess':
                # Return errors from validation or python errors in the mutation response
                return Response({"error": "Dagster job failed", "details": launch_resp}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Successfully triggered Dagster job",
                "dagster_response": launch_resp
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)