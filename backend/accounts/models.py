from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('enterprise', 'Entreprise'),
        ('employee', 'Employé'),
        ('authority', 'Autorité'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

class Administrator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='administrator_profile')
    level = models.CharField(max_length=50, verbose_name="Niveau")
    department = models.CharField(max_length=100, verbose_name="Département")

    class Meta:
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"

    def __str__(self):
        return f"{self.user.username} - {self.department}"

class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    business_name = models.CharField(max_length=255, verbose_name="Raison Sociale")
    company_type = models.CharField(max_length=100, blank=True, verbose_name="Type d'entreprise")
    ice_number = models.CharField(max_length=50, unique=False, verbose_name="ICE")
    rc_number = models.CharField(max_length=50, unique=False, verbose_name="RC")
    responsible_name = models.CharField(max_length=255, verbose_name="Responsable")
    address = models.TextField(verbose_name="Adresse")
    phone_company = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    website = models.URLField(blank=True, verbose_name="Site Web")
    company_size = models.CharField(max_length=100, blank=True, verbose_name="Taille de l'entreprise")
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil Entreprise"
        verbose_name_plural = "Profils Entreprises"

    def __str__(self):
        return self.business_name

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    position = models.CharField(max_length=100, verbose_name="Poste")
    hire_date = models.DateField(verbose_name="Date d'embauche")
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='supervised_employees')

    class Meta:
        verbose_name = "Employé"
        verbose_name_plural = "Employés"

    def __str__(self):
        return f"{self.user.username} - {self.position}"
    
    def valider_dossier(self, certification_request):
        """Valide un dossier de demande de certification"""
        from certifications.models import CertificationRequest
        if isinstance(certification_request, CertificationRequest):
            certification_request.status = 'approved'
            certification_request.validated_by = self
            certification_request.reviewed_by = self.user
            certification_request.save()
            return True
        return False
    
    def generer_rapport_refus(self, certification_request, reason):
        """Génère un rapport de refus pour une demande"""
        from certifications.models import CertificationRequest, RejectionReport
        if isinstance(certification_request, CertificationRequest):
            certification_request.status = 'rejected'
            certification_request.reviewed_by = self.user
            certification_request.save()
            
            # Créer le rapport de refus
            rapport = RejectionReport.objects.create(
                certification_request=certification_request,
                rejected_by=self,
                comments=reason
            )
            return rapport
        return None
    
    def generer_certificat(self, certification_request):
        """Génère un certificat pour une demande approuvée"""
        from certifications.models import CertificationRequest, Certificate
        import uuid
        if isinstance(certification_request, CertificationRequest) and certification_request.status == 'approved':
            certificat = Certificate.objects.create(
                certification_request=certification_request,
                number=f"CERT-{certification_request.id}-{timezone.now().year}",
                treatment_type=certification_request.treatment_type,
                pdf_file=None  # Sera généré plus tard
            )
            return certificat
        return None
    
    def retraiter_demande(self, certification_request):
        """Remet une demande en traitement"""
        from certifications.models import CertificationRequest
        if isinstance(certification_request, CertificationRequest):
            certification_request.status = 'under_review'
            certification_request.reviewed_by = self.user
            certification_request.save()
    
    def suivre_statut(self, certification_request):
        """Suit le statut d'une demande"""
        from certifications.models import CertificationRequest
        if isinstance(certification_request, CertificationRequest):
            return certification_request.status
        return None

class Authority(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='authority_profile')
    organization = models.CharField(max_length=255, verbose_name="Organisme")
    sector = models.CharField(max_length=100, verbose_name="Secteur")
    region = models.CharField(max_length=100, verbose_name="Région")

    class Meta:
        verbose_name = "Autorité"
        verbose_name_plural = "Autorités"

    def __str__(self):
        return f"{self.organization} - {self.region}"

class Enterprise(models.Model):
    """Modèle pour les entreprises productrices de DEEE"""
    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    address = models.TextField(verbose_name="Adresse")
    phone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(verbose_name="Email")
    registration_number = models.CharField(max_length=50, unique=True, verbose_name="Numéro d'enregistrement")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='enterprise')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
