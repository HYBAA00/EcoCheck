from django.core.management.base import BaseCommand
from regulations.utils import NotificationManager, create_sample_notifications
from regulations.models import AdminNotification

class Command(BaseCommand):
    help = 'Gère les notifications administrateur (création d\'exemples, nettoyage, etc.)'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--create-samples',
            action='store_true',
            help='Crée des notifications d\'exemple pour les tests',
        )
        parser.add_argument(
            '--cleanup-expired',
            action='store_true',
            help='Marque les notifications expirées comme ignorées',
        )
        parser.add_argument(
            '--cleanup-old',
            type=int,
            default=30,
            help='Supprime les notifications lues plus anciennes que X jours (défaut: 30)',
        )
        parser.add_argument(
            '--stats',
            action='store_true',
            help='Affiche les statistiques des notifications',
        )
        parser.add_argument(
            '--clear-all',
            action='store_true',
            help='Supprime toutes les notifications (attention!)',
        )
    
    def handle(self, *args, **options):
        if options['create_samples']:
            self.create_sample_notifications()
        
        if options['cleanup_expired']:
            self.cleanup_expired_notifications()
        
        if options['cleanup_old']:
            self.cleanup_old_notifications(options['cleanup_old'])
        
        if options['stats']:
            self.show_statistics()
        
        if options['clear_all']:
            self.clear_all_notifications()
    
    def create_sample_notifications(self):
        """Crée des notifications d'exemple"""
        self.stdout.write("Création de notifications d'exemple...")
        
        try:
            notifications = create_sample_notifications()
            self.stdout.write(
                self.style.SUCCESS(f'✓ {len(notifications)} notifications d\'exemple créées')
            )
            
            for notification in notifications:
                self.stdout.write(f'  - {notification.title} ({notification.get_priority_display()})')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Erreur lors de la création des notifications: {e}')
            )
    
    def cleanup_expired_notifications(self):
        """Nettoie les notifications expirées"""
        self.stdout.write("Nettoyage des notifications expirées...")
        
        try:
            count = NotificationManager.cleanup_expired_notifications()
            self.stdout.write(
                self.style.SUCCESS(f'✓ {count} notifications expirées marquées comme ignorées')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Erreur lors du nettoyage: {e}')
            )
    
    def cleanup_old_notifications(self, days_old):
        """Supprime les anciennes notifications"""
        self.stdout.write(f"Suppression des notifications lues de plus de {days_old} jours...")
        
        try:
            count = NotificationManager.cleanup_old_notifications(days_old)
            self.stdout.write(
                self.style.SUCCESS(f'✓ {count} anciennes notifications supprimées')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Erreur lors de la suppression: {e}')
            )
    
    def show_statistics(self):
        """Affiche les statistiques des notifications"""
        self.stdout.write("=== Statistiques des notifications ===")
        
        try:
            total = AdminNotification.objects.count()
            unread = AdminNotification.objects.filter(is_read=False, is_dismissed=False).count()
            dismissed = AdminNotification.objects.filter(is_dismissed=True).count()
            from django.utils import timezone
            expired = AdminNotification.objects.filter(expires_at__lt=timezone.now()).count()
            
            # Statistiques par type
            type_stats = {}
            for choice in AdminNotification.TYPE_CHOICES:
                type_code, type_name = choice
                count = AdminNotification.objects.filter(notification_type=type_code).count()
                if count > 0:
                    type_stats[type_name] = count
            
            # Statistiques par priorité
            priority_stats = {}
            for choice in AdminNotification.PRIORITY_CHOICES:
                priority_code, priority_name = choice
                count = AdminNotification.objects.filter(priority=priority_code).count()
                if count > 0:
                    priority_stats[priority_name] = count
            
            self.stdout.write(f"Total des notifications: {total}")
            self.stdout.write(f"Non lues: {unread}")
            self.stdout.write(f"Ignorées: {dismissed}")
            self.stdout.write(f"Expirées: {expired}")
            self.stdout.write("")
            
            if type_stats:
                self.stdout.write("Par type:")
                for type_name, count in type_stats.items():
                    self.stdout.write(f"  - {type_name}: {count}")
                self.stdout.write("")
            
            if priority_stats:
                self.stdout.write("Par priorité:")
                for priority_name, count in priority_stats.items():
                    self.stdout.write(f"  - {priority_name}: {count}")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Erreur lors du calcul des statistiques: {e}')
            )
    
    def clear_all_notifications(self):
        """Supprime toutes les notifications (avec confirmation)"""
        confirm = input("Êtes-vous sûr de vouloir supprimer TOUTES les notifications? (oui/non): ")
        
        if confirm.lower() in ['oui', 'o', 'yes', 'y']:
            try:
                count = AdminNotification.objects.count()
                AdminNotification.objects.all().delete()
                self.stdout.write(
                    self.style.WARNING(f'⚠ {count} notifications supprimées')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Erreur lors de la suppression: {e}')
                )
        else:
            self.stdout.write("Suppression annulée.") 