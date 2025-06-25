from django.contrib import admin
from .models import (
    CertificationRequest, Certificate, Payment, RejectionReport, 
    DailyInfo, RequestHistory, DynamicForm, LawChecklist, 
    FormSubmission, DocumentArchive, SupportingDocument
)

class SupportingDocumentInline(admin.TabularInline):
    model = SupportingDocument
    extra = 0
    readonly_fields = ('uploaded_at',)

@admin.register(CertificationRequest)
class CertificationRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'treatment_type', 'status', 'submission_date')
    list_filter = ('status', 'treatment_type', 'submission_date')
    search_fields = ('company__business_name', 'company__ice_number')
    readonly_fields = ('submission_date',)
    inlines = [SupportingDocumentInline]

@admin.register(SupportingDocument)
class SupportingDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'document_type', 'certification_request', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')
    search_fields = ('name', 'certification_request__company__business_name')
    readonly_fields = ('uploaded_at',)

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('number', 'certification_request', 'treatment_type', 'issue_date', 'expiry_date', 'is_active')
    list_filter = ('treatment_type', 'is_active', 'issue_date')
    search_fields = ('number', 'certification_request__company__business_name')
    readonly_fields = ('issue_date',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'certification_request', 'total_amount', 'payment_method', 'status', 'payment_date')
    list_filter = ('status', 'payment_method', 'payment_date')
    search_fields = ('certification_request__company__business_name', 'transaction_id')

@admin.register(RejectionReport)
class RejectionReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'certification_request', 'rejected_by', 'date')
    list_filter = ('date',)
    search_fields = ('certification_request__company__business_name',)

@admin.register(DailyInfo)
class DailyInfoAdmin(admin.ModelAdmin):
    list_display = ('company', 'date', 'waste_collected', 'waste_treated', 'recycling_rate')
    list_filter = ('date',)
    search_fields = ('company__business_name',)

@admin.register(RequestHistory)
class RequestHistoryAdmin(admin.ModelAdmin):
    list_display = ('certification_request', 'action', 'performed_by', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('certification_request__company__business_name',)

@admin.register(DynamicForm)
class DynamicFormAdmin(admin.ModelAdmin):
    list_display = ('treatment_type', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')

@admin.register(LawChecklist)
class LawChecklistAdmin(admin.ModelAdmin):
    list_display = ('treatment_type', 'law_reference', 'law_title', 'is_mandatory')
    list_filter = ('treatment_type', 'is_mandatory')
    search_fields = ('law_reference', 'law_title')

@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('certification_request', 'submitted_at', 'updated_at')
    list_filter = ('submitted_at',)

@admin.register(DocumentArchive)
class DocumentArchiveAdmin(admin.ModelAdmin):
    list_display = ('certification_request', 'document_type', 'original_filename', 'archived_at')
    list_filter = ('document_type', 'archived_at')
    search_fields = ('certification_request__company__business_name', 'original_filename')
