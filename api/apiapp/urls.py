from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('confirm-email/<uidb64>/<token>/', views.ConfirmEmailView.as_view(), name='confirm-email'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh-cookie/', views.CustomTokenRefreshView.as_view(), name='token_refresh_cookie'),
    path('logout/', views.LogoutView.as_view(), name="logout"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/update/', views.UpdateUserView.as_view(), name='user-update'),
    path('user/get/', views.GetCurrentUserView.as_view(), name='get-user-by-id'),
    path('user/delete_current_user/', views.DeleteCurrentUserView.as_view(), name='delete-current-user'),
    path('get-jwt/', views.GetJWTUserView.as_view(), name='test-jwt'),
    path('create-plant/', views.CreatePlantView.as_view(), name='create_plant'),
    path('get-plants-overview/', views.PlantOverviewAPIView.as_view(), name='plant-overview'),
    path('delete-plant/<int:plant_id>/', views.DeletePlantAPIView.as_view()),
    path('update-plant/<int:plant_id>/', views.UpdatePlantAPIView.as_view(), name='update-plant'),
    path('get-devices-by-plant/<int:plant_id>/', views.GetDevicesByPlantAPIView.as_view()),
    path('add-device/', views.AddDeviceByPlantAPIView.as_view()),
    path('update-device/<int:device_id>/', views.UpdateDeviceByPlantAPIView.as_view()),
    path('delete-device/<int:device_id>/', views.DeleteDeviceByPlantAPIView.as_view()),
    path('plants/<int:plant_id>/ingest/', views.PlantDataIngestionView.as_view(), name='plant-data-ingestion'),
    path('plants/custom_ingest/', views.PlantCustomDataIngestionView.as_view(), name='plant-custom-data-ingestion'),
    path('plants/<int:plant_id>/get_data/', views.PlantGetData.as_view(), name='plant-get-data'),
    path('get-pv-estimation/', views.PlantPvEstimation.as_view(), name='plant-pv-estimation'),
    path('aggregated-report/', views.AggregatedPlantDataView.as_view(), name='aggregated-report'),
    path('get-notifications-user/', views.GetNotificationsPerUser.as_view(), name='get-notifications-user'),
    path('mark-alert/<int:alert_id>/', views.MarkAlertAsViewed.as_view(), name='mark-alert-as-viewed'),
    path('update_alarm/<int:plant_id>/', views.UpdateAlarmSettings.as_view(), name='update-alarm-settings'),
]