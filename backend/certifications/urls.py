from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.http import JsonResponse
from certifications.models import CertificationRequest

def test_employee_api(request):
    """Vue de test simple pour diagnostiquer"""
    try:
        # Vérifier l'utilisateur
        user_info = {
            'authenticated': request.user.is_authenticated,
            'username': str(request.user),
            'role': getattr(request.user, 'role', 'No role'),
            'has_employee_profile': hasattr(request.user, 'employee_profile')
        }
        
        # Vérifier les demandes
        total_requests = CertificationRequest.objects.count()
        requests_list = []
        for req in CertificationRequest.objects.all():
            requests_list.append({
                'id': req.id,
                'company': req.company.business_name,
                'status': req.status,
                'date': str(req.submission_date)
            })
        
        return JsonResponse({
            'success': True,
            'user': user_info,
            'total_requests': total_requests,
            'requests': requests_list
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

router = DefaultRouter()

# Routes existantes
router.register(r'requests', views.CertificationRequestViewSet, basename='certification-request')
router.register(r'certificates', views.CertificateViewSet, basename='certificate')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'daily-info', views.DailyInfoViewSet, basename='daily-info')
router.register(r'history', views.RequestHistoryViewSet, basename='request-history')
router.register(r'rejection-reports', views.RejectionReportViewSet, basename='rejection-report')
router.register(r'supporting-documents', views.SupportingDocumentViewSet, basename='supporting-document')

# Nouvelles routes pour les employés
router.register(r'employee/requests', views.CertificationRequestEmployeeViewSet, basename='employee-requests')
router.register(r'employee/dynamic-forms', views.DynamicFormViewSet, basename='dynamic-forms')
router.register(r'employee/law-checklists', views.LawChecklistViewSet, basename='law-checklists')
router.register(r'employee/archives', views.DocumentArchiveViewSet, basename='document-archives')

# Routes pour les autorités
router.register(r'authority/certificates', views.CertificateAuthorityViewSet, basename='authority-certificates')
router.register(r'authority/requests', views.CertificationRequestAuthorityViewSet, basename='authority-requests')
router.register(r'authority/companies', views.CompanyAuthorityViewSet, basename='authority-companies')
router.register(r'authority/audit-reports', views.AuditReportAuthorityViewSet, basename='authority-audit-reports')
router.register(r'authority/exports', views.ExportAuthorityViewSet, basename='authority-exports')
router.register(r'authority/compliance', views.ComplianceAuthorityViewSet, basename='authority-compliance')

urlpatterns = [
    path('', include(router.urls)),
    path('test-employee/', test_employee_api, name='test-employee'),
    # Custom URL for shared certificates
    path('certificates/shared/<str:token>/', 
         views.CertificateViewSet.as_view({'get': 'shared'}), 
         name='certificate-shared'),
] 