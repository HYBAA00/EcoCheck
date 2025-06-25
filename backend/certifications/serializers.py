from rest_framework import serializers
from .models import (
    CertificationRequest, Certificate, Payment, RejectionReport, 
    DailyInfo, RequestHistory, DynamicForm, LawChecklist, 
    FormSubmission, DocumentArchive, SupportingDocument, AuthorityNotification
)
from accounts.models import CompanyProfile, Employee, User
from accounts.serializers import CompanyProfileSerializer, EmployeeSerializer, UserSerializer

class SupportingDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les documents justificatifs multiples"""
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportingDocument
        fields = [
            'id', 'name', 'document_type', 'file', 'file_url', 'file_size',
            'description', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None

class EmployeeDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'position', 'hire_date']

class CertificationRequestEmployeeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.business_name', read_only=True)
    company_ice = serializers.CharField(source='company.ice_number', read_only=True)
    company = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    validated_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    has_payment = serializers.SerializerMethodField()
    form_submission = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificationRequest
        fields = [
            'id', 'company', 'company_name', 'company_ice', 'treatment_type', 
            'submission_date', 'status', 'submitted_data',
            'assigned_to', 'assigned_to_name', 'validated_by', 'validated_by_name',
            'reviewed_by', 'reviewed_by_name', 'supporting_documents',
            'has_payment', 'form_submission'
        ]
        read_only_fields = ['id', 'submission_date']
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to and obj.assigned_to.user:
            return obj.assigned_to.user.get_full_name()
        return None
    
    def get_validated_by_name(self, obj):
        if obj.validated_by and obj.validated_by.user:
            return obj.validated_by.user.get_full_name()
        return None
    
    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name()
        return None
    
    def get_has_payment(self, obj):
        return hasattr(obj, 'payment') and obj.payment.status == 'completed'
    
    def get_company(self, obj):
        """Retourner les informations complètes de l'entreprise"""
        if obj.company:
            try:
                return {
                    'id': obj.company.id,
                    'business_name': obj.company.business_name,
                    'ice_number': obj.company.ice_number,
                    'rc_number': obj.company.rc_number,
                    'responsible_name': obj.company.responsible_name,
                    'address': obj.company.address,
                    'phone_company': obj.company.phone_company,
                    'email': obj.company.user.email if obj.company.user else '',
                    'company_size': getattr(obj.company, 'company_size', ''),
                    'company_type': getattr(obj.company, 'company_type', ''),
                    'created_at': obj.company.created_at.isoformat() if obj.company.created_at else None,
                }
            except AttributeError as e:
                # En cas d'erreur, retourner les informations de base
                return {
                    'id': obj.company.id,
                    'business_name': getattr(obj.company, 'business_name', ''),
                    'ice_number': getattr(obj.company, 'ice_number', ''),
                    'rc_number': getattr(obj.company, 'rc_number', ''),
                    'responsible_name': getattr(obj.company, 'responsible_name', ''),
                    'address': getattr(obj.company, 'address', ''),
                    'phone_company': getattr(obj.company, 'phone_company', ''),
                    'email': obj.company.user.email if hasattr(obj.company, 'user') and obj.company.user else '',
                    'company_size': '',
                    'company_type': '',
                    'created_at': None,
                }
        return None
    
    def get_form_submission(self, obj):
        if hasattr(obj, 'form_submission'):
            return FormSubmissionSerializer(obj.form_submission).data
        return None

class DynamicFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicForm
        fields = ['id', 'treatment_type', 'form_fields', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class LawChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawChecklist
        fields = [
            'id', 'treatment_type', 'law_reference', 'law_title', 
            'description', 'is_mandatory', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class FormSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmission
        fields = ['id', 'certification_request', 'form_data', 'submitted_at', 'updated_at']
        read_only_fields = ['id', 'submitted_at', 'updated_at']

class RejectionReportSerializer(serializers.ModelSerializer):
    rejected_by_name = serializers.CharField(source='rejected_by.user.get_full_name', read_only=True)
    
    class Meta:
        model = RejectionReport
        fields = ['id', 'certification_request', 'comments', 'date', 'rejected_by', 'rejected_by_name']
        read_only_fields = ['id', 'date']

class CertificateEmployeeSerializer(serializers.ModelSerializer):
    request_company = serializers.CharField(source='certification_request.company.business_name', read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'number', 'issue_date', 'expiry_date', 'treatment_type',
            'pdf_file', 'certification_request', 'request_company', 'is_active', 'status'
        ]
        read_only_fields = ['id', 'issue_date', 'status']

class DocumentArchiveSerializer(serializers.ModelSerializer):
    archived_by_name = serializers.CharField(source='archived_by.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentArchive
        fields = [
            'id', 'certification_request', 'document_type', 'file_path',
            'original_filename', 'archived_at', 'archived_by', 'archived_by_name'
        ]
        read_only_fields = ['id', 'archived_at']

class RequestHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = RequestHistory
        fields = [
            'id', 'certification_request', 'action', 'description',
            'performed_by', 'performed_by_name', 'timestamp', 'additional_data'
        ]
        read_only_fields = ['id', 'timestamp']

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'

class CertificationRequestSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.business_name', read_only=True)
    company_ice = serializers.CharField(source='company.ice_number', read_only=True)
    has_payment = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    validated_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    form_submission = serializers.SerializerMethodField()
    # Rendre le champ company optionnel lors de la création
    company = serializers.PrimaryKeyRelatedField(queryset=CompanyProfile.objects.all(), required=False, allow_null=True)
    # additional_documents = SupportingDocumentSerializer(many=True, read_only=True)
    # all_documents = serializers.SerializerMethodField()

    class Meta:
        model = CertificationRequest
        fields = [
            'id', 'company', 'company_name', 'company_ice', 'treatment_type', 
            'submission_date', 'status', 'submitted_data',
            'assigned_to', 'assigned_to_name', 'validated_by', 'validated_by_name',
            'reviewed_by', 'reviewed_by_name', 'supporting_documents',
            'has_payment', 'form_submission'
        ]
        read_only_fields = ['id', 'submission_date']
    
    def get_has_payment(self, obj):
        return hasattr(obj, 'payment') and obj.payment.status == 'completed'
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to and obj.assigned_to.user:
            return obj.assigned_to.user.get_full_name()
        return None
    
    def get_validated_by_name(self, obj):
        if obj.validated_by and obj.validated_by.user:
            return obj.validated_by.user.get_full_name()
        return None
    
    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name()
        return None
    
    def get_form_submission(self, obj):
        if hasattr(obj, 'form_submission'):
            return FormSubmissionSerializer(obj.form_submission).data
        return None
    
    # def get_all_documents(self, obj):
    #     """Retourne tous les documents de la demande"""
    #     return obj.get_all_documents()
    
    def validate_treatment_type(self, value):
        if not value:
            raise serializers.ValidationError("Le type de traitement est requis")
        return value
    
    def validate_submitted_data(self, value):
        import json
        
        # Si c'est une string, la parser en JSON
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Format JSON invalide pour submitted_data")
        
        if not value:
            raise serializers.ValidationError("Les données soumises sont requises")
        
        # Valider les champs requis dans submitted_data
        required_fields = ['companyName', 'ice', 'rc', 'email']
        for field in required_fields:
            if not value.get(field):
                raise serializers.ValidationError(f"Le champ {field} est requis dans les données soumises")
        
        return value

class CertificateSerializer(serializers.ModelSerializer):
    certification_request = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'number', 'issue_date', 'expiry_date', 'treatment_type',
            'pdf_file', 'certification_request', 'is_active', 'status'
        ]
        read_only_fields = ['id', 'issue_date', 'status']
    
    def get_certification_request(self, obj):
        """Retourner les données complètes de la demande de certification"""
        return {
            'id': obj.certification_request.id,
            'company': {
                'business_name': obj.certification_request.company.business_name,
                'ice_number': obj.certification_request.company.ice_number,
                'address': obj.certification_request.company.address,
            },
            'treatment_type': obj.certification_request.treatment_type,
            'submission_date': obj.certification_request.submission_date,
            'status': obj.certification_request.status
        }

class PaymentSerializer(serializers.ModelSerializer):
    certification_request = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'certification_request', 'amount', 'fees', 
            'total_amount', 'payment_method', 'status', 'transaction_id',
            'payment_date', 'created_at', 'updated_at', 'payment_details', 'receipt_url'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_certification_request(self, obj):
        """Retourner les données complètes de la demande de certification"""
        return {
            'id': obj.certification_request.id,
            'treatment_type': obj.certification_request.treatment_type,
            'company': {
                'business_name': obj.certification_request.company.business_name
            }
        }

class DailyInfoSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.business_name', read_only=True)
    
    class Meta:
        model = DailyInfo
        fields = [
            'id', 'company', 'company_name', 'date', 'waste_collected', 
            'waste_treated', 'recycling_rate', 'energy_consumption', 'carbon_footprint'
        ]
        read_only_fields = ['id', 'date'] 

# Serializers spécialisés pour l'interface Autorité
class CertificateAuthoritySerializer(serializers.ModelSerializer):
    """Serializer pour la consultation des certificats par les autorités"""
    company_name = serializers.CharField(source='certification_request.company.business_name', read_only=True)
    company_ice = serializers.CharField(source='certification_request.company.ice_number', read_only=True)
    company_address = serializers.CharField(source='certification_request.company.address', read_only=True)
    request_date = serializers.DateField(source='certification_request.submission_date', read_only=True)
    validated_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'number', 'issue_date', 'expiry_date', 'treatment_type',
            'is_active', 'status', 'company_name', 'company_ice', 
            'company_address', 'request_date', 'validated_by_name'
        ]
    
    def get_validated_by_name(self, obj):
        if obj.certification_request.validated_by:
            return obj.certification_request.validated_by.user.get_full_name()
        return None

class CertificationRequestAuthoritySerializer(serializers.ModelSerializer):
    """Serializer pour la consultation des demandes par les autorités"""
    company_name = serializers.CharField(source='company.business_name', read_only=True)
    company_ice = serializers.CharField(source='company.ice_number', read_only=True)
    company_address = serializers.CharField(source='company.address', read_only=True)
    company_phone = serializers.CharField(source='company.phone_company', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    validated_by_name = serializers.SerializerMethodField()
    has_certificate = serializers.SerializerMethodField()
    certificate_number = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificationRequest
        fields = [
            'id', 'company_name', 'company_ice', 'company_address', 'company_phone',
            'treatment_type', 'submission_date', 'status', 'submitted_data',
            'assigned_to_name', 'validated_by_name', 'has_certificate', 'certificate_number'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to and obj.assigned_to.user:
            return obj.assigned_to.user.get_full_name()
        return None
    
    def get_validated_by_name(self, obj):
        if obj.validated_by and obj.validated_by.user:
            return obj.validated_by.user.get_full_name()
        return None
    
    def get_has_certificate(self, obj):
        return hasattr(obj, 'certificate')
    
    def get_certificate_number(self, obj):
        if hasattr(obj, 'certificate'):
            return obj.certificate.number
        return None

class AuditReportSerializer(serializers.Serializer):
    """Serializer pour les rapports d'audit"""
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    total_requests = serializers.IntegerField()
    approved_requests = serializers.IntegerField()
    rejected_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    certificates_issued = serializers.IntegerField()
    certificates_active = serializers.IntegerField()
    certificates_expired = serializers.IntegerField()
    companies_count = serializers.IntegerField()
    treatment_types = serializers.DictField()
    monthly_statistics = serializers.ListField()

class CompanyAuditSerializer(serializers.ModelSerializer):
    """Serializer pour l'audit des entreprises"""
    total_requests = serializers.SerializerMethodField()
    approved_requests = serializers.SerializerMethodField()
    active_certificates = serializers.SerializerMethodField()
    last_request_date = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyProfile
        fields = [
            'id', 'business_name', 'ice_number', 'rc_number', 
            'address', 'phone_company', 'created_at',
            'total_requests', 'approved_requests', 'active_certificates', 'last_request_date'
        ]
    
    def get_total_requests(self, obj):
        return obj.certification_requests.count()
    
    def get_approved_requests(self, obj):
        return obj.certification_requests.filter(status='approved').count()
    
    def get_active_certificates(self, obj):
        return Certificate.objects.filter(
            certification_request__company=obj,
            is_active=True,
            status='active'
        ).count()
    
    def get_last_request_date(self, obj):
        last_request = obj.certification_requests.order_by('-submission_date').first()
        return last_request.submission_date if last_request else None

class AuthorityNotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications des autorités"""
    
    class Meta:
        model = AuthorityNotification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'recipient', 'content_type', 'object_id', 'action_url', 'action_label',
            'is_read', 'is_dismissed', 'created_at', 'read_at', 'expires_at',
            'metadata', 'is_expired'
        ]
        read_only_fields = ['created_at', 'read_at', 'is_expired']