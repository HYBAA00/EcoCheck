import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { certificateAPI } from '../services/api';

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

interface CertificateViewerProps {
  open: boolean;
  onClose: () => void;
  requestId?: number;
  certificateId?: number;
}

export default function CertificateViewer({ 
  open, 
  onClose, 
  requestId, 
  certificateId 
}: CertificateViewerProps) {
  console.log('🎯 CertificateViewer props:', { open, requestId, certificateId });
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && (requestId || certificateId)) {
      loadCertificate();
    }
  }, [open, requestId, certificateId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (requestId) {
        response = await certificateAPI.getCertificateByRequest(requestId);
      } else if (certificateId) {
        response = await certificateAPI.getCertificate(certificateId);
      }

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

  const handleDownload = () => {
    if (certificate) {
      certificateAPI.downloadCertificate(certificate.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Debug forcé
  console.log('🔍 CertificateViewer rendu avec open =', open);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '600px',
          backgroundColor: 'red', // Pour voir si le dialog existe
          border: '5px solid yellow'
        }
      }}
      sx={{
        zIndex: 99999, // Z-index très élevé
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(255, 0, 0, 0.8)' // Fond rouge pour debug
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Certificat de Conformité DEEE
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {certificate && (
          <Box>
            {/* Affichage de l'image du certificat */}
            <Box sx={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '800px', 
              margin: '0 auto',
              mb: 3
            }}>
              <img 
                src="/certificate-template.png" 
                alt="Certificat de Conformité DEEE"
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '2px solid #4caf50',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                onLoad={() => console.log('✅ Image certificat chargée')}
                onError={() => console.error('❌ Erreur chargement image certificat')}
              />
              
              {/* Données superposées sur le certificat */}
              <Box sx={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                color: '#333',
                fontWeight: 'bold',
                fontSize: { xs: '16px', md: '20px' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}>
                {certificate.certification_request.company.business_name}
              </Box>
              
              {/* Numéro de certificat */}
              <Box sx={{
                position: 'absolute',
                top: '25%',
                right: '10%',
                color: '#333',
                fontWeight: 'bold',
                fontSize: { xs: '12px', md: '14px' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}>
                N° {certificate.number}
              </Box>
              
              {/* Date d'émission */}
              <Box sx={{
                position: 'absolute',
                bottom: '20%',
                left: '20%',
                color: '#333',
                fontSize: { xs: '10px', md: '12px' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}>
                {new Date(certificate.issue_date).toLocaleDateString('fr-FR')}
              </Box>
              
              {/* Date d'expiration */}
              <Box sx={{
                position: 'absolute',
                bottom: '20%',
                right: '20%',
                color: '#333',
                fontSize: { xs: '10px', md: '12px' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}>
                Valide jusqu'au: {new Date(certificate.expiry_date).toLocaleDateString('fr-FR')}
              </Box>
            </Box>

            {/* Informations supplémentaires */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informations du Certificat
              </Typography>
              <Typography><strong>Numéro:</strong> {certificate.number}</Typography>
              <Typography><strong>Entreprise:</strong> {certificate.certification_request.company.business_name}</Typography>
              <Typography><strong>ICE:</strong> {certificate.certification_request.company.ice_number}</Typography>
              <Typography><strong>Type de traitement:</strong> {certificate.treatment_type}</Typography>
              <Typography><strong>Date d'émission:</strong> {new Date(certificate.issue_date).toLocaleDateString('fr-FR')}</Typography>
              <Typography><strong>Date d'expiration:</strong> {new Date(certificate.expiry_date).toLocaleDateString('fr-FR')}</Typography>
              <Typography><strong>Statut:</strong> {certificate.is_active ? 'Actif' : 'Inactif'}</Typography>
            </Box>
          </Box>
        )}

        {!loading && !error && !certificate && (
          <Alert severity="info">
            Aucun certificat trouvé pour cette demande.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {certificate && (
          <>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              variant="outlined"
            >
              Télécharger
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              variant="outlined"
            >
              Imprimer
            </Button>
          </>
        )}
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
} 