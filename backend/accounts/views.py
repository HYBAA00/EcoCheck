from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from .models import Administrator, CompanyProfile, Employee, Authority
from .serializers import (
    UserSerializer, AdministratorSerializer, CompanyProfileSerializer,
    EmployeeSerializer, AuthoritySerializer, RegisterSerializer, MyTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer
    permission_classes = [permissions.IsAdminUser]

class CompanyProfileViewSet(viewsets.ModelViewSet):
    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CompanyProfile.objects.all()
        return CompanyProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Employee.objects.all()
        return Employee.objects.filter(user=self.request.user)

class AuthorityViewSet(viewsets.ModelViewSet):
    queryset = Authority.objects.all()
    serializer_class = AuthoritySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Authority.objects.all()
        return Authority.objects.filter(user=self.request.user)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Utilisateur créé avec succès.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({
                'detail': 'Veuillez fournir un nom d\'utilisateur et un mot de passe.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Connexion réussie !',
            })
        else:
            return Response({
                'detail': 'Nom d\'utilisateur ou mot de passe incorrect.'
            }, status=status.HTTP_401_UNAUTHORIZED)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Récupérer le profil de l'utilisateur connecté"""
        user = request.user
        user_data = UserSerializer(user).data
        
        # Ajouter les informations spécifiques selon le rôle
        profile_data = {}
        
        if hasattr(user, 'company_profile'):
            profile_data = CompanyProfileSerializer(user.company_profile).data
        elif hasattr(user, 'employee_profile'):
            profile_data = EmployeeSerializer(user.employee_profile).data
        elif hasattr(user, 'authority_profile'):
            profile_data = AuthoritySerializer(user.authority_profile).data
        elif hasattr(user, 'administrator_profile'):
            profile_data = AdministratorSerializer(user.administrator_profile).data
            
        return Response({
            'user': user_data,
            'profile': profile_data
        })

    def put(self, request):
        """Mettre à jour le profil de l'utilisateur connecté"""
        user = request.user
        user_data = request.data.get('user', {})
        profile_data = request.data.get('profile', {})
        
        # Mettre à jour les données utilisateur
        user_serializer = UserSerializer(user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Mettre à jour le profil spécifique selon le rôle
        profile_instance = None
        profile_serializer = None
        
        if hasattr(user, 'company_profile'):
            profile_instance = user.company_profile
            profile_serializer = CompanyProfileSerializer(profile_instance, data=profile_data, partial=True)
        elif hasattr(user, 'employee_profile'):
            profile_instance = user.employee_profile
            profile_serializer = EmployeeSerializer(profile_instance, data=profile_data, partial=True)
        elif hasattr(user, 'authority_profile'):
            profile_instance = user.authority_profile
            profile_serializer = AuthoritySerializer(profile_instance, data=profile_data, partial=True)
        elif hasattr(user, 'administrator_profile'):
            profile_instance = user.administrator_profile
            profile_serializer = AdministratorSerializer(profile_instance, data=profile_data, partial=True)
        
        if profile_serializer:
            if profile_serializer.is_valid():
                profile_serializer.save()
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'user': UserSerializer(user).data,
            'profile': profile_serializer.data if profile_serializer else {}
        })
