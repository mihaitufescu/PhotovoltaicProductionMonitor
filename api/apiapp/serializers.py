from rest_framework import serializers
from .models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'address', 'city', 'country', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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