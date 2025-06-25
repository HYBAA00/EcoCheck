from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Créer le routeur pour les ViewSets
router = DefaultRouter()

# Enregistrer tous les ViewSets
router.register(r'treatment-types', views.TreatmentTypeViewSet, basename='treatment-types')
router.register(r'laws', views.LawViewSet, basename='laws')
router.register(r'regulations', views.RegulationViewSet, basename='regulations')
router.register(r'fee-structures', views.FeeStructureViewSet, basename='fee-structures')
router.register(r'validation-cycles', views.ValidationCycleViewSet, basename='validation-cycles')
router.register(r'system-config', views.SystemConfigurationViewSet, basename='system-config')
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-logs')
router.register(r'metrics', views.SystemMetricsViewSet, basename='metrics')
router.register(r'dashboard', views.AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'users', views.UserManagementViewSet, basename='user-management')
router.register(r'exports', views.DataExportViewSet, basename='data-exports')
router.register(r'notifications', views.AdminNotificationViewSet, basename='admin-notifications')

urlpatterns = [
    # Inclure toutes les routes du routeur
    path('admin/', include(router.urls)),
    
    # Routes supplémentaires si nécessaire
    path('admin/dashboard/stats/', views.AdminDashboardViewSet.as_view({'get': 'stats'}), name='admin-dashboard-stats'),
    path('admin/treatment-types/statistics/', views.TreatmentTypeViewSet.as_view({'get': 'statistics'}), name='treatment-types-stats'),
    path('admin/audit-logs/statistics/', views.AuditLogViewSet.as_view({'get': 'statistics'}), name='audit-logs-stats'),
    path('admin/system-config/categories/', views.SystemConfigurationViewSet.as_view({'get': 'categories'}), name='system-config-categories'),
    path('admin/metrics/generate/', views.SystemMetricsViewSet.as_view({'post': 'generate_daily_metrics'}), name='generate-metrics'),
    path('admin/exports/export/', views.DataExportViewSet.as_view({'post': 'export'}), name='export-data'),
] 