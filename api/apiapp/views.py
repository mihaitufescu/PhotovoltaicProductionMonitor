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
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import User, Plant, AlarmPlant, ApiKeyIngestionSettings, Device, PlantData, AlertLog
from .serializers import UserRegisterSerializer, CustomTokenObtainPairSerializer, UserUpdateSerializer, PlantSerializer, PlantOverviewSerializer,GetPlantSerializer, GetDeviceSerializer, DeviceCreateUpdateSerializer, AlertLogSerializer
from django.core.mail import send_mail
from .utils import generate_confirmation_link, generate_reset_token, fetch_day_ahead_market_price
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.timezone import now
from datetime import timedelta
import yaml
from django.db.models import Q
from django.db.models import Avg, Sum, Max, Count
from django.db.models.functions import TruncWeek, TruncMonth, TruncYear
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password


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

        cookie_exp = now() + timedelta(days=1)
        res.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            secure=False,
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

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')
        if not refresh:
            return Response({'detail': 'No refresh token provided'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            serializer = self.get_serializer(data={'refresh': refresh})
            serializer.is_valid(raise_exception=True)
        except InvalidToken:
            return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        access = serializer.validated_data['access']
        res = Response({'message': 'Access token refreshed'})

        res.set_cookie(
            key='access_token',
            value=access,
            httponly=True,
            secure=False,
            samesite='Lax',
            expires=now() + timedelta(minutes=30)
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
    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user.is_active = True  
        user.save()
        link = generate_confirmation_link(user)

        send_mail(
            subject="Confirmă adresa de email",
            message=f"Salut {user.first_name},\n\nClick pe link pentru a confirma contul tau:\n{link}\n\nMultumim!",
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )

class ConfirmEmailView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid link'}, status=400)

        if default_token_generator.check_token(user, token):
            user.is_email_confirmed = True
            user.save()
            return Response({'detail': 'Email confirmed! 🎉'})
        return Response({'detail': 'Invalid or expired token'}, status=400)
    
class UpdateUserView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer

    def put(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)

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
        if not user:
            return Response({'detail': 'User not found.'}, status=401)
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "is_email_confirmed": user.is_email_confirmed
        })
    
class GetCurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserUpdateSerializer(request.user)
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

            data_resp = dagster_response.get('data', {})
            launch_resp = data_resp.get('launchPipelineExecution', {})

            if 'errors' in dagster_response:
                return Response({"error": "Failed to trigger processing job", "details": dagster_response['errors']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if launch_resp.get('__typename') != 'LaunchRunSuccess':
                return Response({"error": "Processing job failed", "details": launch_resp}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Successfully triggered processing job",
                "dagster_response": launch_resp
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class PlantCustomDataIngestionView(APIView):
    def post(self, request):
        api_key = request.headers.get('X-API-KEY')
        if not api_key:
            return Response({"error": "Missing API key"}, status=status.HTTP_400_BAD_REQUEST)
        try:
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

            data_resp = dagster_response.get('data', {})
            launch_resp = data_resp.get('launchPipelineExecution', {})

            if 'errors' in dagster_response:
                return Response({"error": "Failed to trigger Dagster job", "details": dagster_response['errors']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if launch_resp.get('__typename') != 'LaunchRunSuccess':
                return Response({"error": "Dagster job failed", "details": launch_resp}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Successfully triggered Dagster job",
                "dagster_response": launch_resp
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class PlantGetData(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, plant_id):
        try:
            plant = Plant.objects.get(id=plant_id)
            plant_name = plant.plant_name
        except Plant.DoesNotExist:
            plant_name = "Unknown Plant"
        data_qs = PlantData.objects.filter(plant_id=plant_id, is_valid=True).order_by('read_date')

        histogram_data = {
            "dates": [entry.read_date.strftime("%Y-%m-%d") for entry in data_qs],
            "yield_kwh": [entry.yield_kwh for entry in data_qs],
            "specific_energy": [entry.specific_energy_kwh_per_kwp for entry in data_qs],
            "peak_ac_power_kw": [entry.peak_ac_power_kw for entry in data_qs],
            "grid_connection_duration_h": [entry.grid_connection_duration_h for entry in data_qs],
        }
        stats_summary = data_qs.aggregate(
            total_yield_kwh=Sum("yield_kwh"), 
            avg_specific_energy=Avg("specific_energy_kwh_per_kwp"),
            max_peak_power=Max("peak_ac_power_kw"),
            total_grid_duration=Sum("grid_connection_duration_h"),
        )

        device_counts = (
            Device.objects.filter(plant_id=plant_id, is_active=True)
            .values('device_type')
            .annotate(count=Count('id'))
        )

        device_summary = {
            device['device_type']: device['count']
            for device in device_counts
        }

        return Response({
            "plant_name": plant_name,
            "histogram_data": histogram_data,
            "summary": stats_summary,
            "device_summary": device_summary,
        })
    
class PlantPvEstimation(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            lat = request.data.get("latitude")
            lon = request.data.get("longitude")
            num_panels = request.data.get("number_of_panels")
            panel_power_kw = request.data.get("panel_power_kw")

            if num_panels and panel_power_kw:
                peak_power = float(num_panels) * float(panel_power_kw)
            else:
                peak_power = float(request.data.get("peak_power", 5.0))
            tilt = float(request.data.get("tilt", 30))               
            azimuth = float(request.data.get("azimuth", 0))          
            losses = float(request.data.get("losses", 14))
            elevation = request.data.get("elevation", 0)
            year_min = request.data.get("year_min", 2005)
            year_max = request.data.get("year_max", 2023)           

            pvgis_url = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc"
            params = {
                "lat": lat,
                "lon": lon,
                "peakpower": peak_power,
                "loss": losses,
                "angle": tilt,
                "aspect": azimuth,
                "outputformat": "json",
                "elevation" : elevation,
                "start_year" : year_min,
                "end_year" : year_max
            }
            response = requests.get(pvgis_url, params=params)
            response.raise_for_status()

            opcom_price = fetch_day_ahead_market_price()

            data = response.json()

            return Response({
                "pvgis_data": data,
                "market_price": opcom_price,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AggregatedPlantDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        plant_data = PlantData.objects.filter(plant__user=user, is_valid=True)

        def aggregate_by(time_trunc):
            truncated = time_trunc('read_date')
            return (
                plant_data
                .annotate(period=truncated)
                .values('period')
                .order_by('period')
                .annotate(
                    total_yield_kwh=Sum('yield_kwh'),
                    avg_specific_energy=Avg('specific_energy_kwh_per_kwp'),
                    max_peak_ac_power=Sum('peak_ac_power_kw'),
                    total_grid_connection=Sum('grid_connection_duration_h'),
                )
            )

        def aggregate_all_time():
            return plant_data.aggregate(
                total_yield_kwh=Sum('yield_kwh'),
                avg_specific_energy=Avg('specific_energy_kwh_per_kwp'),
                max_peak_ac_power=Sum('peak_ac_power_kw'),
                total_grid_connection=Sum('grid_connection_duration_h'),
            )

        response_data = {
            "weekly": list(aggregate_by(TruncWeek)),
            "monthly": list(aggregate_by(TruncMonth)),
            "yearly": list(aggregate_by(TruncYear)),
            "all_time": aggregate_all_time()
        }

        return Response(response_data)
    
class GetNotificationsPerUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        alerts = AlertLog.objects.filter(
            plant__user=user,
            is_valid=True,
            unread=True
        ).order_by('-read_date', '-id')

        if not alerts.exists():
            return Response({
                "alerts": [],
                "message": "No unread alerts at the moment."
            })

        serializer = AlertLogSerializer(alerts, many=True)
        return Response({
            "alerts": serializer.data
        })
    
class MarkAlertAsViewed(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, alert_id):
        try:
            alert = AlertLog.objects.get(id=alert_id, is_valid=True)
            alert.unread = False
            alert.save()
            return Response({"detail": "Alert marked as read."}, status=status.HTTP_200_OK)
        except AlertLog.DoesNotExist:
            return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
        
class UpdateAlarmSettings(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, plant_id):
        alarm = AlarmPlant.objects.filter(plant_id=plant_id).first()
        if not alarm:
            return Response({"error": "Alarm settings not found for this plant"}, status=status.HTTP_404_NOT_FOUND)

        metric_type = request.data.get("metric_type")
        threshold_value = request.data.get("threshold_value")

        if metric_type:
            if metric_type not in ["yield", "power", "specific_energy"]:
                return Response({"error": "Invalid metric_type"}, status=status.HTTP_400_BAD_REQUEST)
            alarm.metric_type = metric_type

        if threshold_value is not None:
            try:
                alarm.threshold_value = float(threshold_value)
            except (TypeError, ValueError):
                return Response({"error": "Invalid threshold_value"}, status=status.HTTP_400_BAD_REQUEST)

        alarm.save()

        return Response({
            "message": "Alarm settings updated",
            "plant_id": alarm.plant_id,
            "metric_type": alarm.metric_type,
            "threshold_value": alarm.threshold_value
        }, status=status.HTTP_200_OK)
    
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Introdu adresa de email.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)

            if not user.is_email_confirmed:
                return Response({'error': 'Eroare de server'}, status=status.HTTP_403_FORBIDDEN)
            
            reset_url = generate_reset_token(user)

            send_mail(
                subject="Resetează parola",
                message=f"Click pentru a reseta parola: {reset_url}",
                from_email=None,
                recipient_list=[user.email],
            )

            return Response({'message': 'Email-ul a fost trimis.'})
        except User.DoesNotExist:
            return Response({'message': 'Eroare.'}, status=status.HTTP_403_FORBIDDEN)

class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        new_password = request.data.get('new_password')

        if not new_password:
            return Response({'error': 'Introdu parola nouă'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'error': 'Link invalid'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Link invalid sau token expirat'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Parola a fost resetată.'})
    
class SystemAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        plants = Plant.objects.filter(user=user)

        availability_data = []
        total_ok = 0
        total_valid = 0

        for plant in plants:
            alerts = AlertLog.objects.filter(plant=plant)

            # Only count alerts with 'ok' or 'triggered' (exclude 'n/a')
            valid_alerts = alerts.exclude(status='n/a')
            ok_alerts = valid_alerts.filter(status='ok')
            triggered_alerts = valid_alerts.filter(status='triggered')

            total = valid_alerts.count()
            ok = ok_alerts.count()
            triggered = triggered_alerts.count()

            availability_pct = (ok / total) * 100 if total > 0 else None

            availability_data.append({
                'plant_id': plant.id,
                'plant_name': plant.plant_name,
                'ok_count': ok,
                'triggered_count': triggered,
                'total_days': total,
                'availability_percent': round(availability_pct, 2) if availability_pct is not None else 'No data'
            })

            total_ok += ok
            total_valid += total

        system_availability_pct = (total_ok / total_valid) * 100 if total_valid > 0 else None

        return Response({
            'plants': availability_data,
            'system_availability_percent': round(system_availability_pct, 2) if system_availability_pct is not None else 'No data'
        })