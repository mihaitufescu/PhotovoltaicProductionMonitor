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
