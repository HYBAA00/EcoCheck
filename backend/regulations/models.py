from django.db import models
from django.core.validators import FileExtensionValidator
from accounts.models import User
from django.utils import timezone
from datetime import date

class TreatmentType(models.Model):
    """Modèle pour les types de traitement DEEE"""
    name = models.CharField(max_length=100, verbose_name="Nom")
    code = models.CharField(max_length=20, unique=True, default="default", verbose_name="Code")
    description = models.TextField(verbose_name="Description")
    
    # Lois applicables à ce type de traitement
    applicable_laws = models.ManyToManyField('Law', verbose_name="Lois applicables", blank=True)
    
    # Exigences spécifiques
    requirements = models.JSONField(default=dict, verbose_name="Exigences")
    
    # Frais de certification
    certification_fee = models.DecimalField(max_digits=10, decimal_places=2, default=2500.00, verbose_name="Frais de certification")
    
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    class Meta:
        verbose_name = "Type de traitement"
        verbose_name_plural = "Types de traitement"
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Law(models.Model):
    """Modèle pour les lois et réglementations"""
    title = models.CharField(max_length=200, verbose_name="Titre")
    number = models.CharField(max_length=50, default="28-00", verbose_name="Numéro de loi")
    article = models.CharField(max_length=20, default="1", verbose_name="Article")
    description = models.TextField(verbose_name="Description")
    content = models.TextField(default="", verbose_name="Contenu complet")
    effective_date = models.DateField(default=date.today, verbose_name="Date d'entrée en vigueur")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    # Catégories de lois
    CATEGORY_CHOICES = [
        ('waste_management', 'Gestion des déchets'),
        ('environmental', 'Environnement'),
        ('deee', 'DEEE'),
        ('certification', 'Certification'),
        ('compliance', 'Conformité'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='deee', verbose_name="Catégorie")
    
    class Meta:
        verbose_name = "Loi"
        verbose_name_plural = "Lois"
    
    def __str__(self):
        return f"Loi {self.number} - Article {self.article}"

class Regulation(models.Model):
    """Modèle pour les réglementations spécifiques"""
    title = models.CharField(max_length=200, verbose_name="Titre")
    description = models.TextField(verbose_name="Description")
    content = models.TextField(default="", verbose_name="Contenu")
    
    # Relation avec les lois
    related_laws = models.ManyToManyField('Law', verbose_name="Lois liées", blank=True)
    
    # Secteur d'application
    SECTOR_CHOICES = [
        ('all', 'Tous secteurs'),
        ('industrial', 'Industriel'),
        ('commercial', 'Commercial'),
        ('municipal', 'Municipal'),
        ('healthcare', 'Santé'),
    ]
    applicable_sector = models.CharField(max_length=20, choices=SECTOR_CHOICES, default='all', verbose_name="Secteur applicable")
    
    effective_date = models.DateField(default=date.today, verbose_name="Date d'entrée en vigueur")
    is_mandatory = models.BooleanField(default=True, verbose_name="Obligatoire")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    class Meta:
        verbose_name = "Réglementation"
        verbose_name_plural = "Réglementations"
    
    def __str__(self):
        return self.title

class FeeStructure(models.Model):
    """Modèle pour la structure des frais de certification"""
    name = models.CharField(max_length=100, verbose_name="Nom de la structure")
    description = models.TextField(verbose_name="Description")
    
    # Frais de base
    base_fee = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Frais de base")
    
    # Frais administratifs
    admin_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Frais administratifs")
    
    # Frais d'inspection
    inspection_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Frais d'inspection")
    
    # Frais de traitement urgent
    urgent_processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Frais de traitement urgent")
    
    # TVA applicable
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20.00, verbose_name="Taux de TVA (%)")
    
    # Type de traitement associé
    treatment_type = models.ForeignKey(TreatmentType, on_delete=models.CASCADE, related_name='fee_structures', verbose_name="Type de traitement")
    
    # Validité
    effective_from = models.DateField(default=date.today, verbose_name="Valide à partir du")
    effective_until = models.DateField(null=True, blank=True, verbose_name="Valide jusqu'au")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_fee_structures')
    
    class Meta:
        verbose_name = "Structure des frais"
        verbose_name_plural = "Structures des frais"
        ordering = ['-effective_from']
    
    def __str__(self):
        return f"{self.name} - {self.treatment_type.name}"
    
    def get_total_fee(self):
        """Calcule le total des frais sans TVA"""
        return self.base_fee + self.admin_fee + self.inspection_fee
    
    def get_total_with_tax(self):
        """Calcule le total des frais avec TVA"""
        total = self.get_total_fee()
        tax_amount = total * (self.tax_rate / 100)
        return total + tax_amount

class ValidationCycle(models.Model):
    """Modèle pour les cycles de validation"""
    name = models.CharField(max_length=100, verbose_name="Nom du cycle")
    description = models.TextField(verbose_name="Description")
    
    # Étapes de validation
    steps = models.JSONField(default=list, verbose_name="Étapes", help_text="Liste des étapes de validation")
    
    # Durées estimées
    estimated_duration_days = models.PositiveIntegerField(default=30, verbose_name="Durée estimée (jours)")
    max_duration_days = models.PositiveIntegerField(default=60, verbose_name="Durée maximale (jours)")
    
    # Type de traitement associé
    treatment_type = models.ForeignKey(TreatmentType, on_delete=models.CASCADE, related_name='validation_cycles', verbose_name="Type de traitement")
    
    # Rôles requis pour chaque étape
    required_roles = models.JSONField(default=dict, verbose_name="Rôles requis", help_text="Mapping des étapes vers les rôles requis")
    
    # Statut
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    is_default = models.BooleanField(default=False, verbose_name="Cycle par défaut")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_validation_cycles')
    
    class Meta:
        verbose_name = "Cycle de validation"
        verbose_name_plural = "Cycles de validation"
        unique_together = [['treatment_type', 'is_default']]
    
    def __str__(self):
        return f"{self.name} - {self.treatment_type.name}"

class SystemConfiguration(models.Model):
    """Modèle pour les configurations système"""
    SETTING_TYPE_CHOICES = [
        ('string', 'Chaîne de caractères'),
        ('integer', 'Nombre entier'),
        ('decimal', 'Nombre décimal'),
        ('boolean', 'Booléen'),
        ('json', 'JSON'),
        ('date', 'Date'),
        ('datetime', 'Date et heure'),
    ]
    
    key = models.CharField(max_length=100, unique=True, verbose_name="Clé")
    name = models.CharField(max_length=200, verbose_name="Nom")
    description = models.TextField(verbose_name="Description")
    value = models.TextField(verbose_name="Valeur")
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPE_CHOICES, default='string', verbose_name="Type de paramètre")
    
    # Catégorie pour regrouper les paramètres
    category = models.CharField(max_length=50, default='general', verbose_name="Catégorie")
    
    # Validation
    is_required = models.BooleanField(default=False, verbose_name="Obligatoire")
    is_editable = models.BooleanField(default=True, verbose_name="Modifiable")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_configurations')
    
    class Meta:
        verbose_name = "Configuration système"
        verbose_name_plural = "Configurations système"
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.key})"
    
    def get_typed_value(self):
        """Retourne la valeur avec le bon type"""
        if self.setting_type == 'integer':
            return int(self.value)
        elif self.setting_type == 'decimal':
            return float(self.value)
        elif self.setting_type == 'boolean':
            return self.value.lower() in ['true', '1', 'yes', 'on']
        elif self.setting_type == 'json':
            import json
            return json.loads(self.value)
        elif self.setting_type == 'date':
            from datetime import datetime
            return datetime.strptime(self.value, '%Y-%m-%d').date()
        elif self.setting_type == 'datetime':
            from datetime import datetime
            return datetime.fromisoformat(self.value)
        else:
            return self.value

class AuditLog(models.Model):
    """Modèle pour les logs d'audit"""
    ACTION_CHOICES = [
        ('create', 'Création'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('view', 'Consultation'),
        ('export', 'Export'),
        ('import', 'Import'),
        ('approve', 'Approbation'),
        ('reject', 'Rejet'),
        ('assign', 'Attribution'),
        ('payment', 'Paiement'),
        ('certificate_issue', 'Émission certificat'),
    ]
    
    # Informations de base
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name="Action")
    description = models.TextField(verbose_name="Description")
    
    # Utilisateur et timestamp
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Utilisateur")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Horodatage")
    
    # Informations techniques
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Adresse IP")
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")
    
    # Objet concerné
    content_type = models.CharField(max_length=100, null=True, blank=True, verbose_name="Type d'objet")
    object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name="ID de l'objet")
    object_repr = models.CharField(max_length=200, null=True, blank=True, verbose_name="Représentation de l'objet")
    
    # Données supplémentaires
    additional_data = models.JSONField(default=dict, verbose_name="Données supplémentaires")
    
    # Résultat
    success = models.BooleanField(default=True, verbose_name="Succès")
    error_message = models.TextField(null=True, blank=True, verbose_name="Message d'erreur")
    
    class Meta:
        verbose_name = "Log d'audit"
        verbose_name_plural = "Logs d'audit"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} par {self.user} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"

class SystemMetrics(models.Model):
    """Modèle pour les métriques système"""
    date = models.DateField(auto_now_add=True, verbose_name="Date")
    
    # Statistiques des demandes
    total_requests = models.PositiveIntegerField(default=0, verbose_name="Total demandes")
    pending_requests = models.PositiveIntegerField(default=0, verbose_name="Demandes en attente")
    approved_requests = models.PositiveIntegerField(default=0, verbose_name="Demandes approuvées")
    rejected_requests = models.PositiveIntegerField(default=0, verbose_name="Demandes rejetées")
    
    # Statistiques des paiements
    total_payments = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total paiements")
    pending_payments = models.PositiveIntegerField(default=0, verbose_name="Paiements en attente")
    completed_payments = models.PositiveIntegerField(default=0, verbose_name="Paiements complétés")
    
    # Statistiques des utilisateurs
    total_users = models.PositiveIntegerField(default=0, verbose_name="Total utilisateurs")
    active_users = models.PositiveIntegerField(default=0, verbose_name="Utilisateurs actifs")
    new_registrations = models.PositiveIntegerField(default=0, verbose_name="Nouvelles inscriptions")
    
    # Statistiques des certificats
    certificates_issued = models.PositiveIntegerField(default=0, verbose_name="Certificats émis")
    certificates_expired = models.PositiveIntegerField(default=0, verbose_name="Certificats expirés")
    
    # Métriques de performance
    avg_processing_time = models.DecimalField(max_digits=8, decimal_places=2, default=0, verbose_name="Temps moyen de traitement (jours)")
    avg_approval_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Taux d'approbation moyen (%)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Métriques système"
        verbose_name_plural = "Métriques système"
        unique_together = ['date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Métriques du {self.date.strftime('%d/%m/%Y')}"

class AdminNotification(models.Model):
    """Modèle pour les notifications administrateur"""
    
    TYPE_CHOICES = [
        ('new_request', 'Nouvelle demande de certification'),
        ('payment_received', 'Paiement reçu'),
        ('certificate_issued', 'Certificat émis'),
        ('user_registered', 'Nouvel utilisateur enregistré'),
        ('system_alert', 'Alerte système'),
        ('approval_needed', 'Approbation requise'),
        ('document_uploaded', 'Document téléchargé'),
        ('deadline_approaching', 'Échéance approche'),
        ('error_occurred', 'Erreur système'),
        ('maintenance', 'Maintenance'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
        ('urgent', 'Urgente'),
    ]
    
    # Informations de base
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name="Type")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name="Priorité")
    
    # Destinataire (null = tous les admins)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, 
                                related_name='admin_notifications', verbose_name="Destinataire")
    
    # Objet lié (optionnel)
    content_type = models.CharField(max_length=100, null=True, blank=True, verbose_name="Type d'objet")
    object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name="ID de l'objet")
    
    # Actions possibles
    action_url = models.URLField(null=True, blank=True, verbose_name="URL d'action")
    action_label = models.CharField(max_length=50, null=True, blank=True, verbose_name="Label d'action")
    
    # Statut
    is_read = models.BooleanField(default=False, verbose_name="Lu")
    is_dismissed = models.BooleanField(default=False, verbose_name="Ignoré")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Lu le")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Expire le")
    
    # Données supplémentaires
    metadata = models.JSONField(default=dict, verbose_name="Métadonnées")
    
    class Meta:
        verbose_name = "Notification admin"
        verbose_name_plural = "Notifications admin"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_priority_display()}"
    
    def mark_as_read(self):
        """Marquer comme lu"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def dismiss(self):
        """Ignorer la notification"""
        self.is_dismissed = True
        self.save(update_fields=['is_dismissed'])
    
    @property
    def is_expired(self):
        """Vérifier si la notification a expiré"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @classmethod
    def create_notification(cls, title, message, notification_type, priority='medium', 
                          recipient=None, action_url=None, action_label=None, **kwargs):
        """Créer une nouvelle notification"""
        return cls.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            recipient=recipient,
            action_url=action_url,
            action_label=action_label,
            **kwargs
        )
