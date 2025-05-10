from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, PlantSettings, AlarmPlant

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

class PlantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantSettings
        fields = ['plant_name', 'ingestion_type', 'created_at']

class AlarmPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlarmPlant
        fields = ['threshold_value', 'metric_type', 'last_alarm_triggered']