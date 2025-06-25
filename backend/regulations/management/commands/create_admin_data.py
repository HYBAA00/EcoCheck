from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from regulations.models import (
    TreatmentType, Law, FeeStructure, ValidationCycle, 
    SystemConfiguration, AuditLog, SystemMetrics
)
from accounts.models import CompanyProfile, Employee, Authority
import json
from decimal import Decimal
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Create initial admin data and superuser'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create superuser if it doesn't exist
            if not User.objects.filter(email='admin@ecocheck.ma').exists():
                admin_user = User.objects.create_superuser(
                    email='admin@ecocheck.ma',
                    username='admin',
                    password='admin123',
                    first_name='Admin',
                    last_name='EcoCheck',
                    role='admin'
                )
                self.stdout.write(f'Superuser created: admin@ecocheck.ma / admin123')
            else:
                admin_user = User.objects.get(email='admin@ecocheck.ma')
                self.stdout.write('Superuser already exists')

            # Create treatment types
            treatment_data = [
                {
                    'name': 'Recyclage Électronique',
                    'code': 'RECYCLE_ELEC',
                    'description': 'Traitement des déchets électroniques par recyclage',
                    'certification_fee': Decimal('1500.00'),
                    'is_active': True
                },
                {
                    'name': 'Démantèlement DEEE',
                    'code': 'DEMANTEL_DEEE',
                    'description': 'Démantèlement professionnel des équipements électroniques',
                    'certification_fee': Decimal('2000.00'),
                    'is_active': True
                },
                {
                    'name': 'Récupération Métaux',
                    'code': 'RECUP_METAUX',
                    'description': 'Récupération et valorisation des métaux précieux',
                    'certification_fee': Decimal('1200.00'),
                    'is_active': True
                }
            ]

            for data in treatment_data:
                treatment_type, created = TreatmentType.objects.get_or_create(
                    code=data['code'],
                    defaults=data
                )
                if created:
                    self.stdout.write(f'Treatment type created: {treatment_type.name}')

            # Create laws
            law_data = [
                {
                    'title': 'Loi sur la gestion des déchets électroniques',
                    'number': '13-09',
                    'article': 'Article 15',
                    'description': 'Réglementation sur le traitement des DEEE',
                    'content': 'Toute entreprise traitant des DEEE doit obtenir une certification',
                    'category': 'deee',
                    'is_active': True
                },
                {
                    'title': 'Décret sur la protection environnementale',
                    'number': '2.12.647',
                    'article': 'Article 8',
                    'description': 'Normes environnementales pour le recyclage',
                    'content': 'Les installations de recyclage doivent respecter les normes ISO 14001',
                    'category': 'environmental',
                    'is_active': True
                }
            ]

            for data in law_data:
                law, created = Law.objects.get_or_create(
                    number=data['number'],
                    article=data['article'],
                    defaults=data
                )
                if created:
                    self.stdout.write(f'Law created: {law.title}')

            # Create fee structures
            for treatment_type in TreatmentType.objects.all():
                fee_structure, created = FeeStructure.objects.get_or_create(
                    treatment_type=treatment_type,
                    defaults={
                        'name': f'Frais standard - {treatment_type.name}',
                        'description': f'Structure de frais pour {treatment_type.name}',
                        'base_fee': treatment_type.certification_fee,
                        'admin_fee': Decimal('300.00'),
                        'inspection_fee': Decimal('500.00'),
                        'urgent_processing_fee': Decimal('200.00'),
                        'tax_rate': Decimal('20.00'),
                        'validity_months': 12,
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(f'Fee structure created: {fee_structure.name}')

            # Create system configurations
            config_data = [
                {
                    'name': 'MAX_FILE_SIZE',
                    'value': '10485760',
                    'setting_type': 'integer',
                    'description': 'Taille maximale des fichiers en bytes',
                    'category': 'files'
                },
                {
                    'name': 'NOTIFICATION_EMAIL',
                    'value': 'notifications@ecocheck.ma',
                    'setting_type': 'string',
                    'description': 'Email pour les notifications système',
                    'category': 'notifications'
                },
                {
                    'name': 'AUTO_APPROVAL_ENABLED',
                    'value': 'false',
                    'setting_type': 'boolean',
                    'description': 'Activation de l\'approbation automatique',
                    'category': 'workflow'
                },
                {
                    'name': 'SUPPORTED_FORMATS',
                    'value': '["pdf", "doc", "docx", "jpg", "png"]',
                    'setting_type': 'json',
                    'description': 'Formats de fichiers supportés',
                    'category': 'files'
                }
            ]

            for data in config_data:
                config, created = SystemConfiguration.objects.get_or_create(
                    name=data['name'],
                    defaults=data
                )
                if created:
                    self.stdout.write(f'System config created: {config.name}')

            # Create validation cycle
            cycle, created = ValidationCycle.objects.get_or_create(
                name='Cycle Standard DEEE',
                defaults={
                    'description': 'Cycle de validation standard pour les demandes DEEE',
                    'steps': json.dumps([
                        {'step': 1, 'name': 'Vérification documentaire', 'duration_days': 3, 'required_role': 'employee'},
                        {'step': 2, 'name': 'Inspection technique', 'duration_days': 5, 'required_role': 'employee'},
                        {'step': 3, 'name': 'Validation finale', 'duration_days': 2, 'required_role': 'employee'},
                        {'step': 4, 'name': 'Émission certificat', 'duration_days': 1, 'required_role': 'employee'}
                    ]),
                    'total_duration_estimate': 11,
                    'is_default': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Validation cycle created: {cycle.name}')

            # Create some audit logs
            AuditLog.objects.get_or_create(
                user=admin_user,
                action='SYSTEM_INIT',
                ip_address='127.0.0.1',
                defaults={
                    'details': {'message': 'System initialization completed'},
                    'success': True
                }
            )

            # Create system metrics for the last 7 days
            for i in range(7):
                date = datetime.now().date() - timedelta(days=i)
                SystemMetrics.objects.get_or_create(
                    date=date,
                    defaults={
                        'requests_count': 5 + i * 2,
                        'pending_requests': 2 + i,
                        'approved_requests': 3 + i,
                        'rejected_requests': 0,
                        'payments_total': Decimal(str(1000 + i * 500)),
                        'pending_payments': Decimal(str(200 + i * 100)),
                        'completed_payments': Decimal(str(800 + i * 400)),
                        'active_users': 10 + i * 3,
                        'new_users': 1 + i,
                        'certificates_issued': 2 + i,
                        'certificates_expired': 0,
                        'avg_response_time': 450 + i * 50,
                        'system_uptime': 99.9,
                        'error_count': max(0, 2 - i)
                    }
                )

            self.stdout.write(
                self.style.SUCCESS('✅ Admin data created successfully!')
            )
            self.stdout.write('🔑 Admin credentials: admin@ecocheck.ma / admin123')
            self.stdout.write('🌐 Django Admin: http://localhost:8000/admin/')
            self.stdout.write('📊 API Dashboard: http://localhost:8000/api/regulations/admin/dashboard/stats/') 