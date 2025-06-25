from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from datetime import timedelta, date
from accounts.models import User, CompanyProfile, Employee
import os

def default_expiry_date():
    """Fonction pour calculer la date d'expiration par défaut (1 an)"""
    return timezone.now().date() + timedelta(days=365)

def certification_upload_path(instance, filename):
    """Fonction pour générer le chemin d'upload des documents de certification"""
    # Créer un dossier par entreprise et par demande
    company_name = instance.certification_request.company.business_name.replace(' ', '_')
    return f'certification_requests/{company_name}/request_{instance.certification_request.id}/{filename}'

def supporting_documents_upload_path(instance, filename):
    """Fonction pour générer le chemin d'upload des documents justificatifs"""
    company_name = instance.company.business_name.replace(' ', '_')
    return f'certification_requests/{company_name}/request_{instance.id}/supporting_documents/{filename}'

class CertificationRequest(models.Model):
    """Modèle pour les demandes de certification (DemandeFormulaire dans le diagramme)"""
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('submitted', 'Soumise'),
        ('under_review', 'En cours de révision'),
        ('approved', 'Approuvée'),
        ('rejected', 'Rejetée'),
        ('cancelled', 'Annulée')
    ]

    id = models.AutoField(primary_key=True)
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='certification_requests')
    treatment_type = models.CharField(max_length=100, verbose_name="Type de traitement")
    submission_date = models.DateField(auto_now_add=True, verbose_name="Date de soumission")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_data = models.JSONField(verbose_name="Données soumises", default=dict)
    
    # Relations avec les employés
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='assigned_requests')
    validated_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='validated_requests')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reviewed_requests', verbose_name="Révisé par")
    
    # Document principal (pour compatibilité avec l'ancien système)
    supporting_documents = models.FileField(
        upload_to=supporting_documents_upload_path,
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])],
        verbose_name="Document principal",
        null=True,
        blank=True,
        help_text="Document principal de la demande"
    )

    class Meta:
        verbose_name = "Demande de certification"
        verbose_name_plural = "Demandes de certification"

    def __str__(self):
        return f"Demande {self.id} - {self.company.business_name}"

    def get_all_documents(self):
        """Retourne tous les documents associés à cette demande"""
        documents = []
        if self.supporting_documents:
            documents.append({
                'id': 'main',
                'name': os.path.basename(self.supporting_documents.name),
                'url': self.supporting_documents.url,
                'type': 'main'
            })
        
        # Ajouter les documents supplémentaires
        for doc in self.additional_documents.all():
            documents.append({
                'id': doc.id,
                'name': doc.name or os.path.basename(doc.file.name),
                'url': doc.file.url,
                'type': 'additional'
            })
        
        return documents

class SupportingDocument(models.Model):
    """Modèle pour les documents justificatifs multiples"""
    DOCUMENT_TYPE_CHOICES = [
        ('technical_report', 'Rapport technique'),
        ('environmental_study', 'Étude environnementale'),
        ('authorization', 'Autorisation'),
        ('certificate', 'Certificat'),
        ('invoice', 'Facture'),
        ('contract', 'Contrat'),
        ('other', 'Autre'),
    ]

    certification_request = models.ForeignKey(
        CertificationRequest, 
        on_delete=models.CASCADE, 
        related_name='additional_documents'
    )
    name = models.CharField(max_length=255, verbose_name="Nom du document", blank=True)
    document_type = models.CharField(
        max_length=50, 
        choices=DOCUMENT_TYPE_CHOICES, 
        default='other',
        verbose_name="Type de document"
    )
    file = models.FileField(
        upload_to=certification_upload_path,
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'])],
        verbose_name="Fichier"
    )
    description = models.TextField(blank=True, verbose_name="Description")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Document justificatif"
        verbose_name_plural = "Documents justificatifs"
    
    def __str__(self):
        return f"{self.name or 'Document'} - Demande {self.certification_request.id}"

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)

class Payment(models.Model):
    """Modèle pour les paiements de certification"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Payé'),
        ('failed', 'Échec'),
        ('refunded', 'Remboursé'),
        ('cancelled', 'Annulé')
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Carte bancaire'),
        ('bank_transfer', 'Virement bancaire'),
        ('cash', 'Espèces'),
        ('check', 'Chèque')
    ]

    id = models.AutoField(primary_key=True)
    certification_request = models.OneToOneField(
        CertificationRequest, 
        on_delete=models.CASCADE, 
        related_name='payment'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    fees = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Frais de traitement")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant total")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, verbose_name="Méthode de paiement")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True, verbose_name="ID de transaction")
    payment_date = models.DateTimeField(null=True, blank=True, verbose_name="Date de paiement")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Informations de paiement (optionnel)
    payment_details = models.JSONField(default=dict, verbose_name="Détails du paiement")
    receipt_url = models.URLField(null=True, blank=True, verbose_name="URL du reçu")

    def save(self, *args, **kwargs):
        # Calculer le montant total automatiquement
        if self.amount and self.fees:
            self.total_amount = self.amount + self.fees
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"Paiement {self.id} - {self.certification_request.company.business_name} - {self.total_amount}MAD"

class Certificate(models.Model):
    """Modèle pour les certificats"""
    id = models.AutoField(primary_key=True)
    number = models.CharField(max_length=50, unique=True, verbose_name="Numéro")
    issue_date = models.DateField(auto_now_add=True, verbose_name="Date d'émission")
    expiry_date = models.DateField(
        verbose_name="Date d'expiration",
        default=default_expiry_date
    )
    treatment_type = models.CharField(max_length=100, verbose_name="Type de traitement")
    pdf_file = models.FileField(
        upload_to='certificates/',
        validators=[FileExtensionValidator(['pdf'])],
        verbose_name="Fichier PDF",
        null=True,
        blank=True
    )
    certification_request = models.OneToOneField(
        CertificationRequest,
        on_delete=models.CASCADE,
        related_name='certificate'
    )
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    def generate(self):
        """Méthode pour générer le certificat"""
        from .certificate_generator import CertificateGenerator
        from django.core.files.base import ContentFile
        
        if not self.pdf_file:
            generator = CertificateGenerator()
            pdf_buffer = generator.generate_certificate_pdf(self)
            
            # Sauvegarder le PDF
            pdf_filename = f"certificat_{self.number}.pdf"
            self.pdf_file.save(
                pdf_filename,
                ContentFile(pdf_buffer.getvalue()),
                save=True
            )
        
        return self.pdf_file
    
    def archive(self):
        """Méthode pour archiver le certificat"""
        pass

    @property
    def status(self):
        """Retourne le statut du certificat basé sur la date d'expiration"""
        from django.utils import timezone
        if not self.is_active:
            return 'revoked'
        elif self.expiry_date < timezone.now().date():
            return 'expired'
        else:
            return 'active'

    class Meta:
        verbose_name = "Certificat"
        verbose_name_plural = "Certificats"

    def __str__(self):
        return f"Certificat {self.number}"

class RejectionReport(models.Model):
    """Modèle pour les rapports de refus (RapportRefus dans le diagramme)"""
    id = models.AutoField(primary_key=True)
    certification_request = models.ForeignKey(CertificationRequest, on_delete=models.CASCADE, related_name='rejection_reports')
    comments = models.TextField(verbose_name="Commentaires")
    date = models.DateField(auto_now_add=True)
    rejected_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)

    def generate(self):
        """Méthode pour générer le rapport de refus"""
        pass

    class Meta:
        verbose_name = "Rapport de refus"
        verbose_name_plural = "Rapports de refus"

    def __str__(self):
        return f"Rapport de refus - Demande {self.certification_request.id}"

class DailyInfo(models.Model):
    """Modèle pour les informations journalières de l'entreprise"""
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='daily_infos')
    date = models.DateField(auto_now_add=True)
    waste_collected = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Déchets collectés (kg)")
    waste_treated = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Déchets traités (kg)")
    recycling_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Taux de recyclage (%)")
    energy_consumption = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Consommation énergétique (kWh)")
    carbon_footprint = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Empreinte carbone (kg CO2)")
    
    class Meta:
        verbose_name = "Information journalière"
        verbose_name_plural = "Informations journalières"
        unique_together = ['company', 'date']

    def __str__(self):
        return f"{self.company.business_name} - {self.date}"

class RequestHistory(models.Model):
    """Modèle pour l'historique détaillé des demandes"""
    ACTION_CHOICES = [
        ('created', 'Créée'),
        ('submitted', 'Soumise'),
        ('assigned', 'Assignée'),
        ('under_review', 'En révision'),
        ('payment_required', 'Paiement requis'),
        ('payment_received', 'Paiement reçu'),
        ('approved', 'Approuvée'),
        ('rejected', 'Rejetée'),
        ('certificate_issued', 'Certificat émis'),
        ('cancelled', 'Annulée'),
    ]

    certification_request = models.ForeignKey(CertificationRequest, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField(verbose_name="Description")
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Effectué par")
    timestamp = models.DateTimeField(auto_now_add=True)
    additional_data = models.JSONField(default=dict, verbose_name="Données supplémentaires")

    class Meta:
        verbose_name = "Historique de demande"
        verbose_name_plural = "Historiques de demandes"
        ordering = ['-timestamp']

    def __str__(self):
        return f"Historique - {self.certification_request.id} - {self.get_action_display()}"

class DynamicForm(models.Model):
    """Modèle pour les formulaires dynamiques selon le type de traitement"""
    treatment_type = models.CharField(max_length=100, unique=True, verbose_name="Type de traitement")
    form_fields = models.JSONField(verbose_name="Champs du formulaire", help_text="Structure JSON des champs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    class Meta:
        verbose_name = "Formulaire dynamique"
        verbose_name_plural = "Formulaires dynamiques"

    def __str__(self):
        return f"Formulaire - {self.treatment_type}"

class LawChecklist(models.Model):
    """Modèle pour la checklist des lois à respecter"""
    treatment_type = models.CharField(max_length=100, verbose_name="Type de traitement")
    law_reference = models.CharField(max_length=100, verbose_name="Référence de la loi")
    law_title = models.CharField(max_length=255, verbose_name="Titre de la loi")
    description = models.TextField(verbose_name="Description")
    is_mandatory = models.BooleanField(default=True, verbose_name="Obligatoire")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Checklist des lois"
        verbose_name_plural = "Checklists des lois"
        unique_together = ['treatment_type', 'law_reference']

    def __str__(self):
        return f"{self.law_reference} - {self.treatment_type}"

class FormSubmission(models.Model):
    """Modèle pour les soumissions de formulaires dynamiques"""
    certification_request = models.OneToOneField(CertificationRequest, on_delete=models.CASCADE, related_name='form_submission')
    form_data = models.JSONField(verbose_name="Données du formulaire")
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Soumission de formulaire"
        verbose_name_plural = "Soumissions de formulaires"

    def __str__(self):
        return f"Soumission - Demande {self.certification_request.id}"

class DocumentArchive(models.Model):
    """Modèle pour l'archivage des documents et rapports"""
    DOCUMENT_TYPE_CHOICES = [
        ('request', 'Demande'),
        ('certificate', 'Certificat'),
        ('rejection_report', 'Rapport de refus'),
        ('payment_receipt', 'Reçu de paiement'),
        ('supporting_document', 'Document justificatif'),
    ]

    certification_request = models.ForeignKey(CertificationRequest, on_delete=models.CASCADE, related_name='archived_documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    file_path = models.FileField(upload_to='archives/')
    original_filename = models.CharField(max_length=255)
    archived_at = models.DateTimeField(auto_now_add=True)
    archived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Archive de document"
        verbose_name_plural = "Archives de documents"

    def __str__(self):
        return f"Archive - {self.get_document_type_display()} - Demande {self.certification_request.id}"
