from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, AdministratorViewSet, CompanyProfileViewSet,
    EmployeeViewSet, AuthorityViewSet, RegisterView, MyTokenObtainPairView, ProfileView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'administrators', AdministratorViewSet)
router.register(r'companies', CompanyProfileViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'authorities', AuthorityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='custom_token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
]