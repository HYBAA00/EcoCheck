from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Administrator, CompanyProfile, Employee, Authority
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Administrator
        fields = ('id', 'user', 'level', 'department')

class CompanyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # Ajout de champs virtuels pour correspondre au frontend
    company_name = serializers.CharField(source='business_name', required=False)
    company_type = serializers.CharField(required=False, allow_blank=True)
    patent_number = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(source='phone_company', required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)
    company_size = serializers.CharField(required=False, allow_blank=True)
    legal_representative = serializers.CharField(source='responsible_name', required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = CompanyProfile
        fields = ('id', 'user', 'business_name', 'company_name', 'company_type', 
                 'ice_number', 'rc_number', 'patent_number', 'responsible_name', 
                 'legal_representative', 'address', 'phone', 'website', 
                 'company_size', 'description', 'created_at', 'updated_at')

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    supervisor = UserSerializer(read_only=True)
    
    class Meta:
        model = Employee
        fields = ('id', 'user', 'position', 'hire_date', 'supervisor')

class AuthoritySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Authority
        fields = ('id', 'user', 'organization', 'sector', 'region')

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    # Champs additionnels selon le rôle
    business_name = serializers.CharField(required=False)
    ice_number = serializers.CharField(required=False)
    rc_number = serializers.CharField(required=False)
    responsible_name = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    hire_date = serializers.DateField(required=False)
    supervisor = serializers.IntegerField(required=False)
    organization = serializers.CharField(required=False)
    sector = serializers.CharField(required=False)
    region = serializers.CharField(required=False)
    # Champs pour administrateur
    level = serializers.CharField(required=False)
    department = serializers.CharField(required=False)

    def validate(self, data):
        role = data.get('role')
        if role == 'admin':
            if not data.get('level'):
                raise serializers.ValidationError({"level": "Le niveau est requis pour un administrateur"})
            if not data.get('department'):
                raise serializers.ValidationError({"department": "Le département est requis pour un administrateur"})
        elif role == 'enterprise':
            if not data.get('business_name'):
                raise serializers.ValidationError({"business_name": "La raison sociale est requise"})
            if not data.get('ice_number'):
                raise serializers.ValidationError({"ice_number": "Le numéro ICE est requis"})
            if not data.get('rc_number'):
                raise serializers.ValidationError({"rc_number": "Le numéro RC est requis"})
        elif role == 'authority':
            if not data.get('organization'):
                raise serializers.ValidationError({"organization": "L'organisme est requis"})
            if not data.get('sector'):
                raise serializers.ValidationError({"sector": "Le secteur est requis"})
            if not data.get('region'):
                raise serializers.ValidationError({"region": "La région est requise"})
        return data

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        user = User.objects.create(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            role=role
        )
        user.set_password(password)
        user.save()

        # Création du profil selon le rôle
        if role == 'enterprise':
            CompanyProfile.objects.create(
                user=user,
                business_name=validated_data.get('business_name', ''),
                ice_number=validated_data.get('ice_number', ''),
                rc_number=validated_data.get('rc_number', ''),
                responsible_name=validated_data.get('responsible_name', ''),
                address=validated_data.get('address', ''),
            )
        elif role == 'employee':
            Employee.objects.create(
                user=user,
                position=validated_data.get('position', ''),
                hire_date=validated_data.get('hire_date'),
                supervisor_id=validated_data.get('supervisor'),
            )
        elif role == 'authority':
            Authority.objects.create(
                user=user,
                organization=validated_data.get('organization', ''),
                sector=validated_data.get('sector', ''),
                region=validated_data.get('region', ''),
            )
        elif role == 'admin':
            Administrator.objects.create(
                user=user,
                level=validated_data.get('level'),
                department=validated_data.get('department'),
            )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Récupérer le username (qui peut être un email)
        username = attrs.get("username", "")
        password = attrs.get("password", "")

        # Si c'est un email, chercher l'utilisateur correspondant
        if "@" in username:
            try:
                user = User.objects.get(email=username)
                if not user.is_active:
                    raise serializers.ValidationError(
                        {"detail": "Ce compte n'est pas actif."}
                    )
                # Remplacer l'email par le username pour l'authentification
                attrs["username"] = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": "Aucun compte trouvé avec cet email."}
                )
        else:
            # Si ce n'est pas un email, vérifier que l'utilisateur existe
            try:
                user = User.objects.get(username=username)
                if not user.is_active:
                    raise serializers.ValidationError(
                        {"detail": "Ce compte n'est pas actif."}
                    )
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": "Nom d'utilisateur incorrect."}
                )

        # Vérifier le mot de passe
        if not user.check_password(password):
            raise serializers.ValidationError(
                {"detail": "Mot de passe incorrect."}
            )

        # Si tout est ok, procéder à la validation JWT
        data = super().validate(attrs)
        
        # Ajouter des informations supplémentaires au token si nécessaire
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
        
        return data 