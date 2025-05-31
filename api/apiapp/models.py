import secrets
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)
from django.contrib.auth.hashers import make_password

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

class Plant(models.Model):
    INGESTION_TYPES = [
        ('API', 'API Key'),
        ('AWS', 'AWS File System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plant_settings')
    ingestion_type = models.CharField(max_length=10, choices=INGESTION_TYPES)
    plant_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    devices_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.plant_name} - {self.ingestion_type}"

class PlantData(models.Model):
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='plant_data')
    total_string_capacity_kwp = models.FloatField()
    yield_kwh = models.FloatField()
    total_yield_kwh = models.FloatField()
    specific_energy_kwh_per_kwp = models.FloatField()
    peak_ac_power_kw = models.FloatField()
    grid_connection_duration_h = models.FloatField()
    read_date = models.DateField(default=timezone.now)
    load_date = models.DateField(default=timezone.now)
    is_valid = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.plant_id} - {self.plant_name} - {self.device_name}"

    
class Device(models.Model):
    DEVICE_TYPES = [
        ('inverter', 'Inverter'),
        ('meter', 'Meter'),
        ('sensor', 'Sensor'),
    ]

    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='devices')
    name = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=50, choices=DEVICE_TYPES)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.device_type}) - {self.plant.plant_name}"

class ApiKeyIngestionSettings(models.Model):
    plant = models.OneToOneField(Plant, on_delete=models.CASCADE, related_name='api_settings')
    api_key = models.CharField(max_length=256, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"API Key for {self.plant.plant_name}"
    
class AwsIngestionSettings(models.Model):
    plant = models.OneToOneField(Plant, on_delete=models.CASCADE, related_name='aws_settings')
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

    plant = models.OneToOneField(Plant, on_delete=models.CASCADE, related_name='alarm_settings')
    threshold_value = models.FloatField()
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPES)
    last_alarm_triggered = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Alarm for {self.plant.plant_name} - {self.metric_type}"
    

class AlertLog(models.Model):
    STATUS_CHOICES = [
        ('triggered', 'Threshold Triggered'),
        ('ok', 'Within Threshold'),
    ]

    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='alert_logs')
    plant_data = models.ForeignKey(PlantData, on_delete=models.CASCADE, related_name='alert_logs')
    read_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    metric_type = models.CharField(max_length=50)
    threshold_value = models.FloatField()
    actual_value = models.FloatField()
    triggered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('plant', 'read_date', 'metric_type')

    def __str__(self):
        return f"{self.status.upper()} | {self.plant.plant_name} | {self.metric_type} on {self.read_date}"