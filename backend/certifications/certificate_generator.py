import os
import io
from datetime import datetime, timedelta
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.colors import Color, black, green
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import arabic_reshaper
from bidi.algorithm import get_display

class CertificateGenerator:
    def __init__(self):
        self.width, self.height = A4
        self.margin = 2 * cm
        
    def generate_certificate_pdf(self, certificate):
        """Génère le PDF du certificat de conformité DEEE"""
        
        # Créer un buffer pour le PDF
        buffer = io.BytesIO()
        
        # Créer le canvas
        c = canvas.Canvas(buffer, pagesize=A4)
        
        # Dessiner le certificat
        self._draw_certificate(c, certificate)
        
        # Finaliser le PDF
        c.save()
        buffer.seek(0)
        
        return buffer
    
    def _draw_certificate(self, c, certificate):
        """Dessine le contenu du certificat"""
        
        # Couleurs
        green_color = Color(0.2, 0.7, 0.3)  # Vert pour la bordure
        dark_gray = Color(0.2, 0.2, 0.2)   # Gris foncé pour le texte
        
        # Dessiner la bordure verte
        c.setStrokeColor(green_color)
        c.setLineWidth(4)
        c.rect(self.margin, self.margin, self.width - 2*self.margin, self.height - 2*self.margin)
        
        # Position Y de départ
        y_pos = self.height - 3*cm
        
        # En-tête - Logo et texte ministère
        self._draw_header(c, y_pos)
        y_pos -= 4*cm
        
        # Titre principal
        self._draw_title(c, y_pos)
        y_pos -= 3*cm
        
        # Sous-titre environnemental
        self._draw_subtitle(c, y_pos)
        y_pos -= 2*cm
        
        # Texte de certification
        y_pos = self._draw_certification_text(c, y_pos, certificate)
        y_pos -= 3*cm
        
        # Informations du certificat
        y_pos = self._draw_certificate_info(c, y_pos, certificate)
        
        # Signatures en bas
        self._draw_signatures(c)
    
    def _draw_header(self, c, y_pos):
        """Dessine l'en-tête avec le logo et les textes ministère"""
        
        # Texte arabe en haut
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(black)
        
        # Royaume du Maroc en arabe (simulé)
        arabic_text = "المملكة المغربية"
        c.drawCentredText(self.width/2, y_pos + 1*cm, arabic_text)
        
        # Texte français à gauche
        c.setFont("Helvetica", 10)
        french_text = "MINISTÈRE DE LA TRANSITION ÉNERGÉTIQUE\nET DU DÉVELOPPEMENT DURABLE"
        lines = french_text.split('\n')
        for i, line in enumerate(lines):
            c.drawString(self.margin + 1*cm, y_pos - i*0.4*cm, line)
        
        # Texte arabe à droite (simulé)
        c.setFont("Helvetica", 10)
        arabic_ministry = "وزارة الانتقال الطاقي والتنمية المستدامة"
        c.drawRightString(self.width - self.margin - 1*cm, y_pos, arabic_ministry)
        
        # Logo au centre (simulé avec un cercle)
        center_x = self.width / 2
        c.setStrokeColor(colors.red)
        c.setFillColor(colors.red)
        c.circle(center_x, y_pos - 0.5*cm, 1*cm, fill=1)
        
        # Couronne dans le logo (simulé)
        c.setStrokeColor(colors.yellow)
        c.setFillColor(colors.yellow)
        c.circle(center_x, y_pos - 0.3*cm, 0.3*cm, fill=1)
    
    def _draw_title(self, c, y_pos):
        """Dessine le titre principal"""
        c.setFont("Helvetica-Bold", 32)
        c.setFillColor(Color(0.3, 0.3, 0.3))
        c.drawCentredText(self.width/2, y_pos, "CERTIFICAT DE CONFORMITÉ")
    
    def _draw_subtitle(self, c, y_pos):
        """Dessine le sous-titre environnemental"""
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(Color(0.4, 0.4, 0.4))
        c.drawCentredText(self.width/2, y_pos, "Environnementale DEEE")
    
    def _draw_certification_text(self, c, y_pos, certificate):
        """Dessine le texte de certification"""
        c.setFont("Helvetica", 11)
        c.setFillColor(Color(0.5, 0.5, 0.5))
        
        # Texte principal
        text_lines = [
            "Le Ministre de la Transition Énergétique et du Développement Durable",
            f"certifie par les présentes que l'entreprise ci-dessous désignée est en CONFORMITÉ avec les dispositions",
            "de la Loi n° 28-00 relative à la gestion des déchets et à leur élimination, ainsi qu'aux textes",
            "réglementaires en vigueur concernant la gestion des DEEE."
        ]
        
        for i, line in enumerate(text_lines):
            c.drawCentredText(self.width/2, y_pos - i*0.5*cm, line)
        
        return y_pos - len(text_lines)*0.5*cm
    
    def _draw_certificate_info(self, c, y_pos, certificate):
        """Dessine les informations du certificat dans un tableau"""
        
        # Informations de l'entreprise
        company = certificate.certification_request.company
        
        # Créer un tableau avec les informations
        data = [
            ["Entreprise:", company.business_name],
            ["ICE:", company.ice_number],
            ["Adresse:", company.address],
            ["Type de traitement:", certificate.treatment_type.upper()],
            ["Numéro de certificat:", certificate.number],
            ["Date d'émission:", certificate.issue_date.strftime("%d/%m/%Y")],
            ["Date d'expiration:", certificate.expiry_date.strftime("%d/%m/%Y")]
        ]
        
        # Position du tableau
        table_x = self.width/2 - 6*cm
        table_y = y_pos - 1*cm
        
        # Dessiner le tableau manuellement
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(black)
        
        row_height = 0.6*cm
        col1_width = 4*cm
        col2_width = 8*cm
        
        for i, (label, value) in enumerate(data):
            y = table_y - i * row_height
            
            # Label (gras)
            c.setFont("Helvetica-Bold", 10)
            c.drawString(table_x, y, label)
            
            # Valeur (normal)
            c.setFont("Helvetica", 10)
            c.drawString(table_x + col1_width, y, str(value))
        
        return table_y - len(data) * row_height
    
    def _draw_signatures(self, c):
        """Dessine les zones de signature"""
        
        # Position des signatures
        sig_y = 4*cm
        left_sig_x = self.margin + 3*cm
        right_sig_x = self.width - self.margin - 7*cm
        
        # Signature gauche - Le Ministre
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(black)
        c.drawCentredText(left_sig_x, sig_y + 1*cm, "Le Ministre")
        
        # Ligne de signature gauche
        c.line(left_sig_x - 2*cm, sig_y, left_sig_x + 2*cm, sig_y)
        
        # Nom du ministre
        c.setFont("Helvetica", 10)
        c.drawCentredText(left_sig_x, sig_y - 0.5*cm, "Dr. Leila BENKHIANE")
        c.drawCentredText(left_sig_x, sig_y - 0.8*cm, "Directrice de l'Environnement")
        c.drawCentredText(left_sig_x, sig_y - 1.1*cm, "Durable")
        
        # Sceau ministériel (simulé)
        c.setStrokeColor(colors.blue)
        c.setFillColor(colors.lightblue)
        c.circle(left_sig_x, sig_y + 0.3*cm, 0.8*cm, fill=1)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.blue)
        c.drawCentredText(left_sig_x, sig_y + 0.3*cm, "SCEAU")
        c.drawCentredText(left_sig_x, sig_y + 0.1*cm, "OFFICIEL")
        
        # Signature droite - Autorité de Certification
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(black)
        c.drawCentredText(right_sig_x, sig_y + 1*cm, "Autorité de Certification")
        
        # Ligne de signature droite
        c.line(right_sig_x - 2*cm, sig_y, right_sig_x + 2*cm, sig_y)
        
        # Nom de l'autorité
        c.setFont("Helvetica", 10)
        c.drawCentredText(right_sig_x, sig_y - 0.5*cm, "Ing. Hiba Labjouji")
        c.drawCentredText(right_sig_x, sig_y - 0.8*cm, "Chef de la Division DEEE")
        
        # Signature manuscrite simulée
        c.setStrokeColor(black)
        c.setLineWidth(2)
        # Dessiner une signature stylisée
        c.bezier(right_sig_x - 1*cm, sig_y + 0.3*cm, 
                right_sig_x - 0.5*cm, sig_y + 0.6*cm,
                right_sig_x + 0.5*cm, sig_y + 0.2*cm,
                right_sig_x + 1*cm, sig_y + 0.4*cm)

def generate_certificate_for_request(certification_request):
    """Fonction utilitaire pour générer un certificat pour une demande"""
    
    from .models import Certificate
    from django.utils import timezone
    import uuid
    
    # Vérifier si un certificat existe déjà
    if hasattr(certification_request, 'certificate'):
        return certification_request.certificate
    
    # Générer un numéro de certificat unique
    certificate_number = f"DEEE-{timezone.now().year}-{str(uuid.uuid4())[:8].upper()}"
    
    # Créer le certificat
    certificate = Certificate.objects.create(
        number=certificate_number,
        treatment_type=certification_request.treatment_type,
        certification_request=certification_request,
        expiry_date=timezone.now().date() + timedelta(days=365)  # Valide 1 an
    )
    
    # Générer le PDF
    generator = CertificateGenerator()
    pdf_buffer = generator.generate_certificate_pdf(certificate)
    
    # Sauvegarder le PDF
    pdf_filename = f"certificat_{certificate.number}.pdf"
    certificate.pdf_file.save(
        pdf_filename,
        ContentFile(pdf_buffer.getvalue()),
        save=True
    )
    
    return certificate 