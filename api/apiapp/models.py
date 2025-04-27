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