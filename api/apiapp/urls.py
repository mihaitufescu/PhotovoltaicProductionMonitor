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
    path('logout/', views.LogoutView.as_view(), name="logout"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/<int:user_id>/update/', views.UpdateUserView.as_view(), name='user-update'),
    path('user/<int:user_id>/get/', views.GetUserByIdView.as_view(), name='get-user-by-id'),
    path('user/delete_current_user/', views.DeleteCurrentUserView.as_view(), name='delete-current-user'),
    path('get-jwt/', views.GetJWTUserView.as_view(), name='test-jwt'),
    path('create-plant/', views.CreatePlantView.as_view(), name='create_plant'),
    path('get-plants-overview/', views.PlantOverviewAPIView.as_view(), name='plant-overview'),
    path('delete-plant/<int:plant_id>/', views.DeletePlantAPIView.as_view()),
]