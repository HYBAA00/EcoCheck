from django.contrib.auth import get_user_model
from .models import AdminNotification
from accounts.models import Administrator
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

class NotificationManager:
    """Gestionnaire pour créer automatiquement des notifications admin"""
    
    @staticmethod
    def get_admin_users():
        """Récupère tous les utilisateurs administrateurs"""
        return User.objects.filter(role='admin', is_active=True)
    
    @staticmethod
    def create_notification_for_all_admins(title, message, notification_type, priority='medium', **kwargs):
        """Crée une notification pour tous les administrateurs"""
        notifications = []
        for admin in NotificationManager.get_admin_users():
            notification = AdminNotification.create_notification(
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                recipient=admin,
                **kwargs
            )
            notifications.append(notification)
        return notifications
    
    @staticmethod
    def create_global_notification(title, message, notification_type, priority='medium', **kwargs):
        """Crée une notification globale (pour tous les admins)"""
        return AdminNotification.create_notification(
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            recipient=None,  # Null = tous les admins
            **kwargs
        )
    
    @staticmethod
    def notify_new_certification_request(request):
        """Notification pour une nouvelle demande de certification"""
        return NotificationManager.create_global_notification(
            title="Nouvelle demande de certification",
            message=f"{request.company.business_name} a soumis une nouvelle demande de certification pour {request.treatment_type}",
            notification_type='new_request',
            priority='high',
            content_type='CertificationRequest',
            object_id=request.id,
            action_url=f'/admin/certification-requests/{request.id}',
            action_label='Voir la demande',
            metadata={
                'company_id': request.company.id,
                'company_name': request.company.business_name,
                'treatment_type': request.treatment_type,
                'submission_date': request.submission_date.isoformat()
            }
        )
    
    @staticmethod
    def notify_payment_received(payment):
        """Notification pour un paiement reçu"""
        return NotificationManager.create_global_notification(
            title="Paiement reçu",
            message=f"Paiement de {payment.total_amount} MAD reçu pour la demande #{payment.certification_request.id}",
            notification_type='payment_received',
            priority='medium',
            content_type='Payment',
            object_id=payment.id,
            action_url=f'/admin/payments/{payment.id}',
            action_label='Voir le paiement',
            metadata={
                'amount': float(payment.total_amount),
                'request_id': payment.certification_request.id,
                'company_name': payment.certification_request.company.business_name,
                'payment_method': payment.payment_method
            }
        )
    
    @staticmethod
    def notify_certificate_issued(certificate):
        """Notification pour un certificat émis"""
        return NotificationManager.create_global_notification(
            title="Certificat émis",
            message=f"Certificat #{certificate.number} émis pour {certificate.certification_request.company.business_name}",
            notification_type='certificate_issued',
            priority='medium',
            content_type='Certificate',
            object_id=certificate.id,
            action_url=f'/admin/certificates/{certificate.id}',
            action_label='Voir le certificat',
            metadata={
                'certificate_number': certificate.number,
                'company_name': certificate.certification_request.company.business_name,
                'issue_date': certificate.issue_date.isoformat(),
                'expiry_date': certificate.expiry_date.isoformat()
            }
        )
    
    @staticmethod
    def notify_user_registered(user):
        """Notification pour un nouvel utilisateur enregistré"""
        role_display_map = {
            'enterprise': 'Entreprise',
            'employee': 'Employé',
            'authority': 'Autorité',
            'admin': 'Administrateur'
        }
        
        return NotificationManager.create_global_notification(
            title="Nouvel utilisateur enregistré",
            message=f"Un nouvel utilisateur ({role_display_map.get(user.role, user.role)}) s'est inscrit: {user.email}",
            notification_type='user_registered',
            priority='low',
            content_type='User',
            object_id=user.id,
            action_url=f'/admin/users/{user.id}',
            action_label='Voir l\'utilisateur',
            metadata={
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'registration_date': user.date_joined.isoformat()
            }
        )
    
    @staticmethod
    def notify_system_alert(title, message, priority='medium', **kwargs):
        """Notification pour une alerte système"""
        return NotificationManager.create_global_notification(
            title=title,
            message=message,
            notification_type='system_alert',
            priority=priority,
            **kwargs
        )
    
    @staticmethod
    def notify_approval_needed(request, assigned_to=None):
        """Notification pour une demande nécessitant une approbation"""
        if assigned_to:
            # Notification spécifique à un utilisateur
            return AdminNotification.create_notification(
                title="Approbation requise",
                message=f"La demande #{request.id} de {request.company.business_name} nécessite votre approbation",
                notification_type='approval_needed',
                priority='high',
                recipient=assigned_to,
                content_type='CertificationRequest',
                object_id=request.id,
                action_url=f'/admin/certification-requests/{request.id}',
                action_label='Traiter la demande',
                metadata={
                    'request_id': request.id,
                    'company_name': request.company.business_name,
                    'treatment_type': request.treatment_type
                }
            )
        else:
            # Notification globale
            return NotificationManager.create_global_notification(
                title="Approbation requise",
                message=f"La demande #{request.id} de {request.company.business_name} nécessite une approbation",
                notification_type='approval_needed',
                priority='high',
                content_type='CertificationRequest',
                object_id=request.id,
                action_url=f'/admin/certification-requests/{request.id}',
                action_label='Traiter la demande',
                metadata={
                    'request_id': request.id,
                    'company_name': request.company.business_name,
                    'treatment_type': request.treatment_type
                }
            )
    
    @staticmethod
    def notify_document_uploaded(request, document_name):
        """Notification pour un document téléchargé"""
        return NotificationManager.create_global_notification(
            title="Document téléchargé",
            message=f"Nouveau document '{document_name}' téléchargé pour la demande #{request.id}",
            notification_type='document_uploaded',
            priority='low',
            content_type='CertificationRequest',
            object_id=request.id,
            action_url=f'/admin/certification-requests/{request.id}',
            action_label='Voir la demande',
            metadata={
                'request_id': request.id,
                'company_name': request.company.business_name,
                'document_name': document_name
            }
        )
    
    @staticmethod
    def notify_deadline_approaching(certificate, days_until_expiry):
        """Notification pour une échéance qui approche"""
        return NotificationManager.create_global_notification(
            title="Échéance approche",
            message=f"Le certificat #{certificate.number} expire dans {days_until_expiry} jour(s)",
            notification_type='deadline_approaching',
            priority='urgent' if days_until_expiry <= 7 else 'high',
            content_type='Certificate',
            object_id=certificate.id,
            action_url=f'/admin/certificates/{certificate.id}',
            action_label='Voir le certificat',
            expires_at=certificate.expiry_date,
            metadata={
                'certificate_number': certificate.number,
                'company_name': certificate.certification_request.company.business_name,
                'expiry_date': certificate.expiry_date.isoformat(),
                'days_until_expiry': days_until_expiry
            }
        )
    
    @staticmethod
    def notify_error_occurred(error_message, context=None, priority='high'):
        """Notification pour une erreur système"""
        message = f"Une erreur s'est produite: {error_message}"
        if context:
            message += f" (Contexte: {context})"
            
        return NotificationManager.create_global_notification(
            title="Erreur système",
            message=message,
            notification_type='error_occurred',
            priority=priority,
            metadata={
                'error_message': error_message,
                'context': context,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    @staticmethod
    def notify_maintenance(title, message, start_time=None, end_time=None):
        """Notification pour une maintenance"""
        full_message = message
        if start_time and end_time:
            full_message += f" Prévue du {start_time} au {end_time}"
            
        return NotificationManager.create_global_notification(
            title=title,
            message=full_message,
            notification_type='maintenance',
            priority='medium',
            expires_at=end_time,
            metadata={
                'start_time': start_time.isoformat() if start_time else None,
                'end_time': end_time.isoformat() if end_time else None,
            }
        )
    
    @staticmethod
    def cleanup_expired_notifications():
        """Nettoie les notifications expirées"""
        expired_count = AdminNotification.objects.filter(
            expires_at__lt=timezone.now(),
            is_dismissed=False
        ).update(is_dismissed=True)
        
        return expired_count
    
    @staticmethod
    def cleanup_old_notifications(days_old=30):
        """Supprime les anciennes notifications"""
        cutoff_date = timezone.now() - timedelta(days=days_old)
        old_notifications = AdminNotification.objects.filter(
            created_at__lt=cutoff_date,
            is_read=True
        )
        count = old_notifications.count()
        old_notifications.delete()
        
        return count

# Fonction pour créer des notifications de test
def create_sample_notifications():
    """Crée des notifications d'exemple pour les tests"""
    notifications = []
    
    # Nouvelle demande
    notifications.append(
        NotificationManager.create_global_notification(
            title="Nouvelle demande de certification",
            message="EcoTech Solutions a soumis une nouvelle demande de certification pour traitement de déchets électroniques",
            notification_type='new_request',
            priority='high',
            action_url='/admin/certification-requests/1',
            action_label='Voir la demande'
        )
    )
    
    # Paiement reçu
    notifications.append(
        NotificationManager.create_global_notification(
            title="Paiement reçu",
            message="Paiement de 3500 MAD reçu pour la certification #CR-2024-001",
            notification_type='payment_received',
            priority='medium',
            action_url='/admin/payments/1',
            action_label='Voir le paiement'
        )
    )
    
    # Échéance approche
    notifications.append(
        NotificationManager.create_global_notification(
            title="Échéance approche",
            message="Le certificat #CERT-2024-015 expire dans 7 jours",
            notification_type='deadline_approaching',
            priority='urgent',
            action_url='/admin/certificates/15',
            action_label='Voir le certificat'
        )
    )
    
    return notifications 