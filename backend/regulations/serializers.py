from rest_framework import serializers
from .models import (
    TreatmentType, Law, Regulation, FeeStructure, ValidationCycle,
    SystemConfiguration, AuditLog, SystemMetrics, AdminNotification
)
from accounts.models import User

class TreatmentTypeSerializer(serializers.ModelSerializer):
    applicable_laws_count = serializers.SerializerMethodField()
    fee_structures_count = serializers.SerializerMethodField()
    total_requests = serializers.SerializerMethodField()
    
    class Meta:
        model = TreatmentType
        fields = [
            'id', 'name', 'code', 'description', 'applicable_laws', 
            'requirements', 'certification_fee', 'is_active',
            'applicable_laws_count', 'fee_structures_count', 'total_requests'
        ]
    
    def get_applicable_laws_count(self, obj):
        return obj.applicable_laws.count()
    
    def get_fee_structures_count(self, obj):
        return obj.fee_structures.count()
    
    def get_total_requests(self, obj):
        from certifications.models import CertificationRequest
        return CertificationRequest.objects.filter(treatment_type=obj.name).count()

class LawSerializer(serializers.ModelSerializer):
    class Meta:
        model = Law
        fields = [
            'id', 'title', 'number', 'article', 'description', 'content',
            'effective_date', 'is_active', 'category'
        ]

class RegulationSerializer(serializers.ModelSerializer):
    related_laws_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Regulation
        fields = [
            'id', 'title', 'description', 'content', 'related_laws',
            'applicable_sector', 'effective_date', 'is_mandatory', 'is_active',
            'related_laws_count'
        ]
    
    def get_related_laws_count(self, obj):
        return obj.related_laws.count()

class FeeStructureSerializer(serializers.ModelSerializer):
    treatment_type_name = serializers.CharField(source='treatment_type.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    total_fee = serializers.SerializerMethodField()
    total_with_tax = serializers.SerializerMethodField()
    
    class Meta:
        model = FeeStructure
        fields = [
            'id', 'name', 'description', 'base_fee', 'admin_fee', 'inspection_fee',
            'urgent_processing_fee', 'tax_rate', 'treatment_type', 'treatment_type_name',
            'effective_from', 'effective_until', 'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_name', 'total_fee', 'total_with_tax'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_total_fee(self, obj):
        return float(obj.get_total_fee())
    
    def get_total_with_tax(self, obj):
        return float(obj.get_total_with_tax())
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ValidationCycleSerializer(serializers.ModelSerializer):
    treatment_type_name = serializers.CharField(source='treatment_type.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    steps_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ValidationCycle
        fields = [
            'id', 'name', 'description', 'steps', 'estimated_duration_days',
            'max_duration_days', 'treatment_type', 'treatment_type_name',
            'required_roles', 'is_active', 'is_default', 'created_at',
            'updated_at', 'created_by', 'created_by_name', 'steps_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_steps_count(self, obj):
        return len(obj.steps) if obj.steps else 0
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SystemConfigurationSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    typed_value = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemConfiguration
        fields = [
            'id', 'key', 'name', 'description', 'value', 'setting_type',
            'category', 'is_required', 'is_editable', 'created_at', 'updated_at',
            'updated_by', 'updated_by_name', 'typed_value'
        ]
        read_only_fields = ['created_at', 'updated_at', 'updated_by']
    
    def get_typed_value(self, obj):
        try:
            return obj.get_typed_value()
        except:
            return obj.value
    
    def update(self, instance, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'action_display', 'description', 'user', 'user_name', 
            'user_role', 'timestamp', 'ip_address', 'user_agent', 'content_type',
            'object_id', 'object_repr', 'additional_data', 'success', 'error_message'
        ]
        read_only_fields = ['timestamp']

class SystemMetricsSerializer(serializers.ModelSerializer):
    efficiency_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemMetrics
        fields = [
            'id', 'date', 'total_requests', 'pending_requests', 'approved_requests',
            'rejected_requests', 'total_payments', 'pending_payments', 'completed_payments',
            'total_users', 'active_users', 'new_registrations', 'certificates_issued',
            'certificates_expired', 'avg_processing_time', 'avg_approval_rate',
            'created_at', 'efficiency_rate'
        ]
        read_only_fields = ['date', 'created_at']
    
    def get_efficiency_rate(self, obj):
        if obj.total_requests > 0:
            return round((obj.approved_requests / obj.total_requests) * 100, 2)
        return 0

# Serializers pour les statistiques et rapports

class AdminDashboardStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques du dashboard admin"""
    total_users = serializers.IntegerField()
    total_enterprises = serializers.IntegerField()
    total_employees = serializers.IntegerField()
    total_authorities = serializers.IntegerField()
    
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    approved_requests = serializers.IntegerField()
    rejected_requests = serializers.IntegerField()
    
    total_payments = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_payments = serializers.DecimalField(max_digits=15, decimal_places=2)
    completed_payments = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    certificates_issued = serializers.IntegerField()
    certificates_expired = serializers.IntegerField()
    
    recent_activities = serializers.ListField()

class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer pour la gestion des utilisateurs par l'admin"""
    profile_type = serializers.SerializerMethodField()
    profile_info = serializers.SerializerMethodField()
    last_login_formatted = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone', 'is_active', 'is_staff', 'date_joined', 'last_login',
            'profile_type', 'profile_info', 'last_login_formatted', 'password'
        ]
        read_only_fields = ['date_joined']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_profile_type(self, obj):
        if hasattr(obj, 'company_profile'):
            return 'enterprise'
        elif hasattr(obj, 'employee_profile'):
            return 'employee'
        elif hasattr(obj, 'authority_profile'):
            return 'authority'
        elif hasattr(obj, 'administrator_profile'):
            return 'administrator'
        return 'none'
    
    def get_profile_info(self, obj):
        if hasattr(obj, 'company_profile'):
            return {
                'business_name': obj.company_profile.business_name,
                'ice_number': obj.company_profile.ice_number,
                'company_type': obj.company_profile.company_type
            }
        elif hasattr(obj, 'employee_profile'):
            return {
                'position': obj.employee_profile.position,
                'hire_date': obj.employee_profile.hire_date
            }
        elif hasattr(obj, 'authority_profile'):
            return {
                'organization': obj.authority_profile.organization,
                'sector': obj.authority_profile.sector,
                'region': obj.authority_profile.region
            }
        elif hasattr(obj, 'administrator_profile'):
            return {
                'level': obj.administrator_profile.level,
                'department': obj.administrator_profile.department
            }
        return {}
    
    def get_last_login_formatted(self, obj):
        if obj.last_login:
            return obj.last_login.strftime('%d/%m/%Y %H:%M')
        return 'Jamais connecté'
    
    def create(self, validated_data):
        """Créer un utilisateur avec mot de passe hashé"""
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        """Mettre à jour un utilisateur avec mot de passe hashé si fourni"""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class ExportDataSerializer(serializers.Serializer):
    """Serializer pour les paramètres d'export"""
    export_type = serializers.ChoiceField(choices=[
        ('users', 'Utilisateurs'),
        ('requests', 'Demandes'),
        ('payments', 'Paiements'),
        ('certificates', 'Certificats'),
        ('audit_logs', 'Logs d\'audit'),
        ('metrics', 'Métriques'),
    ])
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    format = serializers.ChoiceField(choices=[
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
    ], default='csv')
    filters = serializers.JSONField(required=False, default=dict)

class AdminNotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications admin"""
    recipient_name = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    time_since_created = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = AdminNotification
        fields = [
            'id', 'title', 'message', 'notification_type', 'type_display',
            'priority', 'priority_display', 'recipient', 'recipient_name',
            'content_type', 'object_id', 'action_url', 'action_label',
            'is_read', 'is_dismissed', 'created_at', 'read_at', 'expires_at',
            'metadata', 'time_since_created', 'is_expired'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    def get_recipient_name(self, obj):
        if obj.recipient:
            return f"{obj.recipient.first_name} {obj.recipient.last_name}".strip()
        return "Tous les administrateurs"
    
    def get_time_since_created(self, obj):
        """Retourne le temps écoulé depuis la création"""
        from django.utils.timesince import timesince
        return timesince(obj.created_at) 