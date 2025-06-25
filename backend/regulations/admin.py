from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db import models
from django.forms import TextInput, Textarea
import json

from .models import (
    TreatmentType, Law, Regulation, FeeStructure, ValidationCycle, 
    SystemConfiguration, AuditLog, SystemMetrics, AdminNotification
)

# Personnalisation des widgets pour les champs JSON
class JSONWidget(Textarea):
    def format_value(self, value):
        if value is None:
            return ''
        if isinstance(value, str):
            return value
        return json.dumps(value, indent=2, ensure_ascii=False)

@admin.register(TreatmentType)
class TreatmentTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'certification_fee', 'is_active', 'applicable_laws_count', 'created_date']
    list_filter = ['is_active', 'applicable_laws']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['applicable_laws_count', 'total_requests']
    filter_horizontal = ['applicable_laws']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'code', 'description', 'is_active')
        }),
        ('Configuration financière', {
            'fields': ('certification_fee',)
        }),
        ('Lois applicables', {
            'fields': ('applicable_laws',)
        }),
        ('Exigences spécifiques', {
            'fields': ('requirements',),
            'classes': ('collapse',)
        }),
        ('Statistiques', {
            'fields': ('applicable_laws_count', 'total_requests'),
            'classes': ('collapse',)
        }),
    )
    
    formfield_overrides = {
        models.JSONField: {'widget': JSONWidget},
    }
    
    def applicable_laws_count(self, obj):
        return obj.applicable_laws.count()
    applicable_laws_count.short_description = 'Nombre de lois applicables'
    
    def total_requests(self, obj):
        from certifications.models import CertificationRequest
        count = CertificationRequest.objects.filter(treatment_type=obj.name).count()
        return count
    total_requests.short_description = 'Total des demandes'
    
    def created_date(self, obj):
        return obj.name  # Placeholder car pas de date de création dans le modèle
    created_date.short_description = 'Date de création'

@admin.register(Law)
class LawAdmin(admin.ModelAdmin):
    list_display = ['title', 'number', 'article', 'category', 'effective_date', 'is_active']
    list_filter = ['category', 'is_active', 'effective_date']
    search_fields = ['title', 'number', 'article', 'description']
    date_hierarchy = 'effective_date'
    
    fieldsets = (
        ('Identification', {
            'fields': ('title', 'number', 'article', 'category')
        }),
        ('Contenu', {
            'fields': ('description', 'content')
        }),
        ('Statut', {
            'fields': ('effective_date', 'is_active')
        }),
    )
    
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }

@admin.register(Regulation)
class RegulationAdmin(admin.ModelAdmin):
    list_display = ['title', 'applicable_sector', 'effective_date', 'is_mandatory', 'is_active', 'related_laws_count']
    list_filter = ['applicable_sector', 'is_mandatory', 'is_active', 'effective_date']
    search_fields = ['title', 'description']
    date_hierarchy = 'effective_date'
    filter_horizontal = ['related_laws']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'applicable_sector')
        }),
        ('Contenu', {
            'fields': ('content',)
        }),
        ('Lois liées', {
            'fields': ('related_laws',)
        }),
        ('Statut', {
            'fields': ('effective_date', 'is_mandatory', 'is_active')
        }),
    )
    
    def related_laws_count(self, obj):
        return obj.related_laws.count()
    related_laws_count.short_description = 'Nombre de lois liées'

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['name', 'treatment_type', 'base_fee', 'total_fee_display', 'total_with_tax_display', 'is_active', 'effective_from']
    list_filter = ['is_active', 'treatment_type', 'effective_from']
    search_fields = ['name', 'description', 'treatment_type__name']
    date_hierarchy = 'effective_from'
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'total_fee_display', 'total_with_tax_display']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'description', 'treatment_type')
        }),
        ('Structure des frais', {
            'fields': ('base_fee', 'admin_fee', 'inspection_fee', 'urgent_processing_fee', 'tax_rate')
        }),
        ('Calculs automatiques', {
            'fields': ('total_fee_display', 'total_with_tax_display'),
            'classes': ('collapse',)
        }),
        ('Validité', {
            'fields': ('effective_from', 'effective_until', 'is_active')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def total_fee_display(self, obj):
        return f"{obj.get_total_fee():.2f} MAD"
    total_fee_display.short_description = 'Total des frais (sans TVA)'
    
    def total_with_tax_display(self, obj):
        return f"{obj.get_total_with_tax():.2f} MAD"
    total_with_tax_display.short_description = 'Total avec TVA'
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ValidationCycle)
class ValidationCycleAdmin(admin.ModelAdmin):
    list_display = ['name', 'treatment_type', 'estimated_duration_days', 'max_duration_days', 'is_default', 'is_active', 'steps_count']
    list_filter = ['is_active', 'is_default', 'treatment_type']
    search_fields = ['name', 'description', 'treatment_type__name']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'steps_count']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'description', 'treatment_type')
        }),
        ('Configuration', {
            'fields': ('steps', 'required_roles')
        }),
        ('Durées', {
            'fields': ('estimated_duration_days', 'max_duration_days')
        }),
        ('Statut', {
            'fields': ('is_active', 'is_default')
        }),
        ('Statistiques', {
            'fields': ('steps_count',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    formfield_overrides = {
        models.JSONField: {'widget': JSONWidget},
    }
    
    def steps_count(self, obj):
        return len(obj.steps) if obj.steps else 0
    steps_count.short_description = 'Nombre d\'étapes'
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'category', 'setting_type', 'is_required', 'is_editable', 'updated_at']
    list_filter = ['category', 'setting_type', 'is_required', 'is_editable']
    search_fields = ['name', 'key', 'description']
    readonly_fields = ['created_at', 'updated_at', 'updated_by', 'typed_value_display']
    
    fieldsets = (
        ('Identification', {
            'fields': ('key', 'name', 'category')
        }),
        ('Configuration', {
            'fields': ('description', 'value', 'setting_type')
        }),
        ('Valeur typée', {
            'fields': ('typed_value_display',),
            'classes': ('collapse',)
        }),
        ('Contraintes', {
            'fields': ('is_required', 'is_editable')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def typed_value_display(self, obj):
        try:
            typed_value = obj.get_typed_value()
            return f"{typed_value} (type: {type(typed_value).__name__})"
        except Exception as e:
            return f"Erreur: {str(e)}"
    typed_value_display.short_description = 'Valeur avec type'
    
    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'action_display', 'user_display', 'description_short', 'success_display', 'ip_address']
    list_filter = ['action', 'success', 'timestamp', 'user__role']
    search_fields = ['description', 'user__username', 'user__email', 'object_repr']
    date_hierarchy = 'timestamp'
    readonly_fields = ['timestamp', 'additional_data_display']
    
    fieldsets = (
        ('Action', {
            'fields': ('action', 'description', 'success', 'error_message')
        }),
        ('Utilisateur', {
            'fields': ('user', 'timestamp')
        }),
        ('Informations techniques', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Objet concerné', {
            'fields': ('content_type', 'object_id', 'object_repr'),
            'classes': ('collapse',)
        }),
        ('Données supplémentaires', {
            'fields': ('additional_data_display',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Pas d'ajout manuel des logs
    
    def has_change_permission(self, request, obj=None):
        return False  # Pas de modification des logs
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Seul le super admin peut supprimer
    
    def action_display(self, obj):
        colors = {
            'create': 'green',
            'update': 'blue',
            'delete': 'red',
            'login': 'purple',
            'logout': 'orange',
            'approve': 'green',
            'reject': 'red',
        }
        color = colors.get(obj.action, 'black')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.get_action_display()
        )
    action_display.short_description = 'Action'
    
    def user_display(self, obj):
        if obj.user:
            return format_html(
                '<a href="{}">{}</a>',
                reverse('admin:accounts_user_change', args=[obj.user.id]),
                obj.user.username
            )
        return 'Système'
    user_display.short_description = 'Utilisateur'
    
    def description_short(self, obj):
        if len(obj.description) > 50:
            return f"{obj.description[:50]}..."
        return obj.description
    description_short.short_description = 'Description'
    
    def success_display(self, obj):
        if obj.success:
            return format_html('<span style="color: green;">✓</span>')
        else:
            return format_html('<span style="color: red;">✗</span>')
    success_display.short_description = 'Succès'
    
    def additional_data_display(self, obj):
        if obj.additional_data:
            return format_html('<pre>{}</pre>', json.dumps(obj.additional_data, indent=2, ensure_ascii=False))
        return 'Aucune donnée'
    additional_data_display.short_description = 'Données supplémentaires'

@admin.register(SystemMetrics)
class SystemMetricsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_requests', 'pending_requests', 'approved_requests', 'total_payments_display', 'total_users', 'efficiency_rate_display']
    list_filter = ['date']
    search_fields = ['date']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'efficiency_rate_display', 'approval_rate_display']
    
    fieldsets = (
        ('Date', {
            'fields': ('date',)
        }),
        ('Statistiques des demandes', {
            'fields': ('total_requests', 'pending_requests', 'approved_requests', 'rejected_requests')
        }),
        ('Statistiques des paiements', {
            'fields': ('total_payments', 'pending_payments', 'completed_payments')
        }),
        ('Statistiques des utilisateurs', {
            'fields': ('total_users', 'active_users', 'new_registrations')
        }),
        ('Statistiques des certificats', {
            'fields': ('certificates_issued', 'certificates_expired')
        }),
        ('Métriques de performance', {
            'fields': ('avg_processing_time', 'avg_approval_rate', 'efficiency_rate_display', 'approval_rate_display')
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def total_payments_display(self, obj):
        return f"{obj.total_payments:.2f} MAD"
    total_payments_display.short_description = 'Total paiements'
    
    def efficiency_rate_display(self, obj):
        if obj.total_requests > 0:
            rate = (obj.approved_requests / obj.total_requests) * 100
            return f"{rate:.1f}%"
        return "0%"
    efficiency_rate_display.short_description = 'Taux d\'efficacité'
    
    def approval_rate_display(self, obj):
        return f"{obj.avg_approval_rate:.1f}%"
    approval_rate_display.short_description = 'Taux d\'approbation'

@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    """Administration des notifications admin"""
    list_display = ['title', 'notification_type', 'priority', 'recipient', 'is_read', 'is_dismissed', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'is_dismissed', 'created_at']
    search_fields = ['title', 'message', 'recipient__username', 'recipient__email']
    readonly_fields = ['created_at', 'read_at', 'is_expired_display']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('title', 'message', 'notification_type', 'priority')
        }),
        ('Destinataire', {
            'fields': ('recipient',)
        }),
        ('Objet lié', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('Actions', {
            'fields': ('action_url', 'action_label'),
            'classes': ('collapse',)
        }),
        ('Statut', {
            'fields': ('is_read', 'is_dismissed', 'expires_at')
        }),
        ('Métadonnées', {
            'fields': ('metadata', 'created_at', 'read_at', 'is_expired_display'),
            'classes': ('collapse',)
        })
    )
    
    formfield_overrides = {
        models.JSONField: {'widget': JSONWidget},
    }
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('recipient')
    
    def is_expired_display(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">Oui</span>')
        return format_html('<span style="color: green;">Non</span>')
    is_expired_display.short_description = 'Expiré'
    is_expired_display.boolean = True

# Configuration de l'interface d'administration
admin.site.site_header = "Administration EcoCheck"
admin.site.site_title = "EcoCheck Admin"
admin.site.index_title = "Tableau de bord administrateur"

# Ajout de styles CSS personnalisés
admin.site.enable_nav_sidebar = True
