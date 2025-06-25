import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { certificateAPI } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Certificate {
  id: number;
  number: string;
  issue_date: string;
  expiry_date: string;
  treatment_type: string;
  status: string;
  is_active: boolean;
  certification_request: {
    id: number;
    company: {
      business_name: string;
      ice_number: string;
      address: string;
    };
  };
}

export default function CertificatePage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestId) {
      loadCertificate();
    }
  }, [requestId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await certificateAPI.getCertificateByRequest(parseInt(requestId!));
      
      if (response?.data) {
        setCertificate(response.data);
        console.log('✅ Certificat chargé:', response.data);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du certificat:', err);
      setError('Impossible de charger le certificat');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificate || !certificateRef.current) {
      alert('Erreur: Certificat non disponible');
      return;
    }

    try {
      setPdfLoading(true);
      console.log('🚀 Début de la génération PDF...');

      // Capturer le certificat en tant qu'image
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Haute qualité
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
      });

      console.log('✅ Canvas créé:', canvas.width, 'x', canvas.height);

      // Créer le PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape', // Format paysage pour le certificat
        unit: 'mm',
        format: 'a4',
      });

      // Calculer les dimensions pour centrer l'image
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Maintenir le ratio d'aspect
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      // Centrer l'image
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      // Générer le nom du fichier
      const fileName = `Certificat_${certificate.number}_${certificate.certification_request.company.business_name.replace(/\s+/g, '_')}.pdf`;
      
      console.log('📁 Nom du fichier:', fileName);

      // Télécharger le PDF
      pdf.save(fileName);

      console.log('✅ PDF téléchargé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF: ' + (error as Error).message);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Chargement du certificat...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!certificate) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto' }}>
          Aucun certificat trouvé pour cette demande
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      py: 4
    }}>
      {/* Barre d'actions (masquée lors de l'impression) */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2, 
        mb: 4,
        '@media print': { display: 'none' }
      }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          Imprimer
        </Button>
        <Button
          variant="outlined"
          startIcon={pdfLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownload}
          disabled={pdfLoading}
        >
          {pdfLoading ? 'Génération...' : 'Télécharger PDF'}
        </Button>
      </Box>

      {/* Certificat */}
      <Paper 
        ref={certificateRef}
        sx={{ 
          maxWidth: '800px', 
          mx: 'auto', 
          p: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          '@media print': { 
            boxShadow: 'none',
            maxWidth: 'none',
            margin: 0,
            padding: 0
          }
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          width: '100%'
        }}>
          {!imageLoaded && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '600px'
            }}>
              <CircularProgress />
            </Box>
          )}
          
          <img 
            src="/certificate-template.png" 
            alt="Certificat de Conformité DEEE"
            style={{
              width: '100%',
              height: 'auto',
              display: imageLoaded ? 'block' : 'none',
              imageRendering: 'high-quality' as any,
              WebkitImageSmoothing: 'high',
            }}
            onLoad={() => {
              console.log('✅ Image certificat chargée');
              setImageLoaded(true);
            }}
            onError={() => {
              console.error('❌ Erreur chargement image certificat');
              setError('Impossible de charger l\'image du certificat');
            }}
          />
          

        </Box>
      </Paper>

      {/* Informations supplémentaires (masquées lors de l'impression) */}
      <Box sx={{ 
        maxWidth: '800px', 
        mx: 'auto', 
        mt: 4,
        '@media print': { display: 'none' }
      }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informations du Certificat
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Entreprise</Typography>
              <Typography variant="body1" fontWeight="bold">
                {certificate.certification_request.company.business_name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Numéro ICE</Typography>
              <Typography variant="body1">
                {certificate.certification_request.company.ice_number}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Type de traitement</Typography>
              <Typography variant="body1">
                {certificate.treatment_type}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Statut</Typography>
              <Typography variant="body1" color={certificate.is_active ? 'success.main' : 'error.main'}>
                {certificate.is_active ? 'Actif' : 'Inactif'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 