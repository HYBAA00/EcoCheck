import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Alert,
  LinearProgress,
  Pagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  FilterList,
  GetApp,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  Business,
  VerifiedUser,
  DateRange,
  FileDownload,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../services/api';

interface CertificateData {
  id: number;
  number: string;
  issue_date: string;
  expiry_date: string;
  treatment_type: string;
  status: 'active' | 'expired' | 'revoked';
  is_active: boolean;
  company_name: string;
  company_ice: string;
  company_address: string;
  validated_by_name: string;
  request_date: string;
}

interface CertificateStats {
  total_certificates: number;
  active_certificates: number;
  expired_certificates: number;
  revoked_certificates: number;
  treatment_statistics: Record<string, number>;
}

export default function CertificateConsultation() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadCertificates();
    loadStats();
  }, [page, searchTerm, statusFilter, treatmentFilter]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(treatmentFilter && { treatment_type: treatmentFilter }),
      });

      const response = await authorityAPI.getCertificates(params.toString());
      setCertificates(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / 10));
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error);
      setError('Impossible de charger les certificats');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authorityAPI.getCertificateStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(treatmentFilter && { treatment_type: treatmentFilter }),
      });

      await authorityAPI.exportCertificates(params.toString());
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'error';
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'warning';
      case 'revoked': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string, isActive: boolean) => {
    if (!isActive) return 'Révoqué';
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'revoked': return 'Révoqué';
      default: return status;
    }
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (!isActive) return <Cancel />;
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'expired': return <Schedule />;
      case 'revoked': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const handleViewDetails = (certificate: CertificateData) => {
    setSelectedCertificate(certificate);
    setDetailsOpen(true);
  };

  if (loading && certificates.length === 0) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}>
        <LinearProgress sx={{ 
          backgroundColor: 'rgba(255,255,255,0.3)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'white'
          }
        }} />
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
          Chargement des certificats...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/authority/dashboard')}
            sx={{ 
              color: 'white',
              mr: 2,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Retour
          </Button>
          <Typography variant="h4" sx={{ 
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            <VerifiedUser sx={{ mr: 2, fontSize: 40 }} />
            Consultation des Certificats
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Consultation et validation des certificats DEEE délivrés
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <VerifiedUser sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.total_certificates}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Total Certificats
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.active_certificates}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Actifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <Schedule sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.expired_certificates}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Expirés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <Cancel sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.revoked_certificates}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Révoqués
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        mb: 3
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#2c3e50', 
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}>
            <FilterList sx={{ mr: 2, color: '#667eea' }} />
            Filtres et Recherche
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par ID, nom ou organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="expired">Expiré</MenuItem>
                  <MenuItem value="revoked">Révoqué</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type de traitement</InputLabel>
                <Select
                  value={treatmentFilter}
                  label="Type de traitement"
                  onChange={(e) => setTreatmentFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  <MenuItem value="tri">Tri</MenuItem>
                  <MenuItem value="recycling">Recyclage</MenuItem>
                  <MenuItem value="reuse">Réutilisation</MenuItem>
                  <MenuItem value="disposal">Élimination</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={loadCertificates}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      borderRadius: 2
                    }}
                  >
                    Actualiser
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GetApp />}
                    onClick={handleExport}
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderRadius: 2
                    }}
                  >
                    Export
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card sx={{ 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#2c3e50', 
            mb: 3
          }}>
            Liste des Certificats ({certificates.length})
          </Typography>
          
          {loading ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Numéro</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Entreprise</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Émission</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Expiration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Validé par</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.map((certificate) => (
                    <TableRow key={certificate.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {certificate.number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {certificate.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {certificate.company_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ICE: {certificate.company_ice}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={certificate.treatment_type}
                          variant="outlined"
                          size="small"
                          sx={{ borderColor: '#667eea', color: '#667eea' }}
                        />
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
                          icon={getStatusIcon(certificate.status, certificate.is_active)}
                          label={getStatusText(certificate.status, certificate.is_active)}
                          color={getStatusColor(certificate.status, certificate.is_active)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {certificate.validated_by_name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(certificate)}
                            sx={{ color: '#667eea' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Certificate Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <VerifiedUser sx={{ mr: 2 }} />
          Détails du Certificat {selectedCertificate?.number}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedCertificate && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Informations du Certificat
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Numéro:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedCertificate.number}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Type de traitement:</Typography>
                  <Chip label={selectedCertificate.treatment_type} variant="outlined" size="small" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Date d'émission:</Typography>
                  <Typography variant="body1">{new Date(selectedCertificate.issue_date).toLocaleDateString('fr-FR')}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Date d'expiration:</Typography>
                  <Typography variant="body1">{new Date(selectedCertificate.expiry_date).toLocaleDateString('fr-FR')}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Statut:</Typography>
                  <Chip
                    icon={getStatusIcon(selectedCertificate.status, selectedCertificate.is_active)}
                    label={getStatusText(selectedCertificate.status, selectedCertificate.is_active)}
                    color={getStatusColor(selectedCertificate.status, selectedCertificate.is_active)}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Informations de l'Entreprise
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Nom:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedCertificate.company_name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">ICE:</Typography>
                  <Typography variant="body1">{selectedCertificate.company_ice}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Adresse:</Typography>
                  <Typography variant="body1">{selectedCertificate.company_address}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Date de demande:</Typography>
                  <Typography variant="body1">{new Date(selectedCertificate.request_date).toLocaleDateString('fr-FR')}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Validé par:</Typography>
                  <Typography variant="body1">{selectedCertificate.validated_by_name || 'N/A'}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsOpen(false)}>
            Fermer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<FileDownload />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Télécharger PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 