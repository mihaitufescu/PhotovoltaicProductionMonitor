from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Plant, AlarmPlant, Device, ApiKeyIngestionSettings, AwsIngestionSettings
import hashlib
import secrets

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'address', 'city', 'country', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['user_id'] = user.id
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['is_email_confirmed'] = user.is_email_confirmed

        return token

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'address', 'city', 'country']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'address': {'required': False},
            'city': {'required': False},
            'country': {'required': False},
        }

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ['name', 'serial_number', 'device_type']

class ApiKeyIngestionSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiKeyIngestionSettings
        fields = ['api_key', 'expiration_date', 'is_active']

class AwsIngestionSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwsIngestionSettings
        fields = ['bucket_name', 'region', 'access_key_id', 'secret_access_key', 'file_prefix', 'polling_interval_minutes']

class AlarmPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlarmPlant
        fields = ['metric_type', 'threshold_value']

class PlantSerializer(serializers.ModelSerializer):
    devices = DeviceSerializer(many=True)
    aws_settings = AwsIngestionSettingsSerializer(required=False)
    alarm = AlarmPlantSerializer(required=False)

    class Meta:
        model = Plant
        fields = ['id','plant_name', 'ingestion_type', 'devices', 'aws_settings', 'alarm']

    def create(self, validated_data):
        devices_data = validated_data.pop('devices')
        aws_data = validated_data.pop('aws_settings', None)
        alarm_data = validated_data.pop('alarm', None)

        # Create Plant
        plant = Plant.objects.create(**validated_data)

        # Create Devices
        for device_data in devices_data:
            Device.objects.create(plant=plant, **device_data)

        # Create Alarm if provided
        if alarm_data:
            AlarmPlant.objects.create(plant=plant, **alarm_data)
        api_key = None
        if validated_data['ingestion_type'] == 'API':
            api_key = secrets.token_urlsafe(64)  # Generate a random API key

            # Hash the API key before saving it to the database
            hashed_api_key = hashlib.sha256(api_key.encode('utf-8')).hexdigest()

            # Create the API Ingestion Settings with the hashed key
            api_key_settings = ApiKeyIngestionSettings.objects.create(plant=plant, api_key=hashed_api_key)
            # Return the plant with the api_key (this should be done in the view, not in the serializer)
            return plant, api_key

        elif validated_data['ingestion_type'] == 'AWS':
            AwsIngestionSettings.objects.create(plant=plant, **aws_data)

        return plant, api_key