import secrets
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        
        required_fields = ['first_name', 'last_name', 'address', 'city', 'country']
        for field in required_fields:
            if not extra_fields.get(field):
                raise ValueError(f"The {field} field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=False)
    address = models.CharField(max_length=255, blank=False)
    city = models.CharField(max_length=100, blank=False)
    country = models.CharField(max_length=100, blank=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_confirmed = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "address", "city", "country"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class PlantData(models.Model):
    plant_id = models.BigIntegerField()
    plant_name = models.CharField(max_length=100)
    inverter_name = models.CharField(max_length=100)
    total_string_capacity_kwp = models.FloatField()
    yield_kwh = models.FloatField()
    total_yield_kwh = models.FloatField()
    specific_energy_kwh_per_kwp = models.FloatField()
    peak_ac_power_kw = models.FloatField()
    grid_connection_duration_h = models.FloatField()
    read_date = models.DateField(default=timezone.now)
    load_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.plant_id} - {self.plant_name} - {self.device_name}"
    
class UserPlant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_plants")
    plant = models.ForeignKey(PlantData, on_delete=models.CASCADE, related_name="plant_users")
    added_on = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField()

    class Meta:
        unique_together = ('user', 'plant')

    def __str__(self):
        return f"{self.user.email} - {self.plant.plant_name}"
    
class PlantSettings(models.Model):
    INGESTION_TYPES = [
        ('API', 'API Key'),
        ('AWS', 'AWS File System'),
    ]

    plant = models.OneToOneField(PlantData, on_delete=models.CASCADE, related_name='settings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plant_settings')
    ingestion_type = models.CharField(max_length=10, choices=INGESTION_TYPES)
    plant_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.plant.plant_name} - {self.ingestion_type}"

class ApiKeyIngestionSettings(models.Model):
    plant = models.OneToOneField(PlantData, on_delete=models.CASCADE, related_name='api_settings')
    api_key = models.CharField(max_length=128, unique=True, default=secrets.token_urlsafe)
    expiration_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"API Key for {self.plant.plant_name}"
    
class AwsIngestionSettings(models.Model):
    plant = models.OneToOneField(PlantData, on_delete=models.CASCADE, related_name='aws_settings')
    bucket_name = models.CharField(max_length=255)
    region = models.CharField(max_length=100)
    access_key_id = models.CharField(max_length=255)
    secret_access_key = models.CharField(max_length=255)
    file_prefix = models.CharField(max_length=255, blank=True, help_text="Optional path prefix inside the bucket")
    polling_interval_minutes = models.PositiveIntegerField(default=60)

    def __str__(self):
        return f"AWS Config for {self.plant.plant_name}"
    
class AlarmPlant(models.Model):
    METRIC_TYPES = [
        ('yield', 'Yield (kWh)'),
        ('power', 'Peak AC Power (kW)'),
        ('specific_energy', 'Specific Energy (kWh/kWp)'),
    ]

    plant = models.OneToOneField(PlantData, on_delete=models.CASCADE, related_name='alarm_settings')
    threshold_value = models.FloatField()
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPES)
    last_alarm_triggered = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Alarm for {self.plant.plant_name} - {self.metric_type}"