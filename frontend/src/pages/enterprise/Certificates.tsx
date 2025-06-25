import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Download,
  Visibility,
  Search,
  CardMembership,
  CheckCircle,
  Print,
  Share,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { certificateAPI } from '../../services/api';

interface Certificate {
  id: number;
  number: string;
  treatment_type: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'revoked';
  pdf_file: string;
  certification_request: {
    id: number;
    company: {
      business_name: string;
      ice_number: string;
    };
    treatment_type: string;
    submission_date: string;
    status: string;
  };
  is_active: boolean;
}

function CertificatesPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateAPI.getCertificates();
      setCertificates(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'warning';
      case 'revoked': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'revoked': return 'Révoqué';
      default: return status;
    }
  };

  const handleDownload = (certificate: Certificate) => {
    // Télécharger le certificat
    certificateAPI.downloadCertificate(certificate.id);
  };

  const handleView = (certificate: Certificate) => {
    // Ouvrir le certificat dans un nouvel onglet
    if (certificate.pdf_file) {
      window.open(`http://localhost:8000${certificate.pdf_file}`, '_blank');
    } else {
      // Rediriger vers la page de visualisation du certificat
      window.open(`/certificate/${certificate.certification_request.id}`, '_blank');
    }
  };

  const handlePrint = (certificate: Certificate) => {
    // Imprimer le certificat
    if (certificate.pdf_file) {
      const printWindow = window.open(`http://localhost:8000${certificate.pdf_file}`, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
      }
    }
  };

  const handleShare = (certificate: Certificate) => {
    // Partager le certificat
    const shareUrl = certificate.pdf_file 
      ? `http://localhost:8000${certificate.pdf_file}`
      : `${window.location.origin}/certificate/${certificate.certification_request.id}`;
      
    if (navigator.share) {
      navigator.share({
        title: `Certificat ${certificate.number}`,
        text: `Certificat de ${certificate.treatment_type} DEEE`,
        url: shareUrl,
      });
    } else {
      // Fallback - copier le lien
      navigator.clipboard.writeText(shareUrl);
      alert('Lien copié dans le presse-papiers');
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.treatment_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCertificates = certificates.filter(cert => cert.status === 'active');
  const expiredCertificates = certificates.filter(cert => cert.status === 'expired');

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Chargement de vos certificats...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/enterprise/dashboard')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Mes Certificats
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <CardMembership sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {certificates.length}
              </Typography>
              <Typography variant="body2">
                Total Certificats
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {activeCertificates.length}
              </Typography>
              <Typography variant="body2">
                Certificats Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {expiredCertificates.length}
              </Typography>
              <Typography variant="body2">
                Certificats Expirés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {new Set(certificates.map(c => c.treatment_type)).size}
              </Typography>
              <Typography variant="body2">
                Types de Traitement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recherche */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Rechercher par numéro ou type de traitement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Alerte pour certificats expirés */}
      {expiredCertificates.length > 0 && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Vous avez {expiredCertificates.length} certificat(s) expiré(s). 
          Veuillez renouveler vos certifications pour maintenir votre conformité.
        </Alert>
      )}

      {/* Liste des certificats */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
              Certificats ({filteredCertificates.length})
            </Typography>
            <Button
              variant="outlined"
              onClick={loadCertificates}
              sx={{ color: '#667eea', borderColor: '#667eea' }}
            >
              Actualiser
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Certificat</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date d'émission</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date d'expiration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: certificate.status === 'active' ? '#4caf50' : '#ff9800',
                          width: 40, 
                          height: 40 
                        }}>
                          <CardMembership />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {certificate.number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Demande #{certificate.certification_request.id.toString().padStart(3, '0')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {certificate.treatment_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(certificate.issue_date).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(certificate.expiry_date).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(certificate.status)}
                        color={getStatusColor(certificate.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir">
                          <IconButton 
                            size="small" 
                            onClick={() => handleView(certificate)}
                            sx={{ color: '#667eea' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Télécharger">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownload(certificate)}
                            sx={{ color: '#4caf50' }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Imprimer">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePrint(certificate)}
                            sx={{ color: '#ff9800' }}
                          >
                            <Print />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Partager">
                          <IconButton 
                            size="small" 
                            onClick={() => handleShare(certificate)}
                            sx={{ color: '#e91e63' }}
                          >
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCertificates.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CardMembership sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun certificat trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Essayez de modifier votre recherche' : 'Vous n\'avez pas encore de certificats validés'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/enterprise/certification-form')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Créer une demande
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default CertificatesPage;
