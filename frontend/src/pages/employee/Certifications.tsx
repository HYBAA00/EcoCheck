import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CheckCircle,
  Assignment,
  VerifiedUser,
} from '@mui/icons-material';
import { employeeAPI } from '../../services/api';

interface Certificate {
  id: number;
  number: string;
  issue_date: string;
  expiry_date: string;
  treatment_type: string;
  status: string;
  is_active: boolean;
  company_name: string;
  company_ice: string;
  validated_by_name: string;
  request_date: string;
}

interface CertificationStats {
  total_certificates: number;
  active_certificates: number;
  expired_certificates: number;
  my_validations: number;
}

export default function EmployeeCertifications() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');

  useEffect(() => {
    loadCertificates();
    loadStats();
  }, [searchTerm, statusFilter, treatmentFilter]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Données mockées de certificats validés par l'employé
      const mockCertificates: Certificate[] = [
        {
          id: 1,
          number: "DEEE-2025-8E5B4E46",
          issue_date: "2024-12-15",
          expiry_date: "2025-12-15",
          treatment_type: "Recyclage",
          status: "active",
          is_active: true,
          company_name: "EcoTech Solutions",
          company_ice: "002345678000045",
          validated_by_name: "Vous",
          request_date: "2024-12-10"
        },
        {
          id: 2,
          number: "DEEE-2024-7F3A2B91",
          issue_date: "2024-11-20",
          expiry_date: "2025-11-20",
          treatment_type: "Tri",
          status: "active",
          is_active: true,
          company_name: "GreenCorp Industries",
          company_ice: "002876543000098",
          validated_by_name: "Vous",
          request_date: "2024-11-15"
        },
        {
          id: 3,
          number: "DEEE-2024-9D4C8A12",
          issue_date: "2024-10-05",
          expiry_date: "2025-10-05",
          treatment_type: "Réutilisation",
          status: "active",
          is_active: true,
          company_name: "RecycleMax",
          company_ice: "002123456000021",
          validated_by_name: "Vous",
          request_date: "2024-09-30"
        },
        {
          id: 4,
          number: "DEEE-2024-5B8E1F67",
          issue_date: "2024-08-12",
          expiry_date: "2024-08-12",
          treatment_type: "Élimination",
          status: "expired",
          is_active: false,
          company_name: "WasteTech Pro",
          company_ice: "002987654000076",
          validated_by_name: "Vous",
          request_date: "2024-08-05"
        },
        {
          id: 5,
          number: "DEEE-2024-3C9F2E45",
          issue_date: "2024-09-18",
          expiry_date: "2025-09-18",
          treatment_type: "Recyclage",
          status: "active",
          is_active: true,
          company_name: "EcoSolutions SARL",
          company_ice: "002456789000054",
          validated_by_name: "Vous",
          request_date: "2024-09-12"
        }
      ];

      // Filtrer selon les critères de recherche
      let filteredCertificates = mockCertificates;

      if (searchTerm) {
        filteredCertificates = filteredCertificates.filter(cert =>
          cert.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.treatment_type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter) {
        filteredCertificates = filteredCertificates.filter(cert => {
          if (statusFilter === 'active') return cert.status === 'active' && cert.is_active;
          if (statusFilter === 'expired') return cert.status === 'expired' || !cert.is_active;
          if (statusFilter === 'revoked') return !cert.is_active;
          return true;
        });
      }

      if (treatmentFilter) {
        filteredCertificates = filteredCertificates.filter(cert =>
          cert.treatment_type.toLowerCase() === treatmentFilter.toLowerCase()
        );
      }

      setCertificates(filteredCertificates);

      // Calculer les statistiques
      const activeCerts = mockCertificates.filter(cert => cert.status === 'active' && cert.is_active);
      const expiredCerts = mockCertificates.filter(cert => cert.status === 'expired' || !cert.is_active);

      setStats({
        total_certificates: mockCertificates.length,
        active_certificates: activeCerts.length,
        expired_certificates: expiredCerts.length,
        my_validations: mockCertificates.length // Tous sont validés par l'employé
      });

    } catch (err: any) {
      console.error('Erreur lors du chargement des certificats:', err);
      setError('Impossible de charger les certificats');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Temporairement vide
  };

  const handleViewCertificate = (certificateId: number) => {
    // Navigation vers les détails du certificat
    console.log('Voir certificat:', certificateId);
  };

  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      console.log('Télécharger certificat:', certificateId);
      // TODO: Implémenter le téléchargement
    } catch (err: any) {
      console.error('Erreur lors du téléchargement:', err);
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

  if (loading && certificates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Mes Certifications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <VerifiedUser sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
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
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
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
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
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
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <VerifiedUser sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.my_validations}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Mes Validations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher des certificats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
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
                >
                  <MenuItem value="">Tous</MenuItem>
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
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="tri">Tri</MenuItem>
                  <MenuItem value="recycling">Recyclage</MenuItem>
                  <MenuItem value="reuse">Réutilisation</MenuItem>
                  <MenuItem value="disposal">Élimination</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des certificats */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Entreprise</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date d'émission</TableCell>
              <TableCell>Date d'expiration</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Validé par</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell>{certificate.number}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {certificate.company_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ICE: {certificate.company_ice}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={certificate.treatment_type} size="small" />
                </TableCell>
                <TableCell>
                  {new Date(certificate.issue_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  {new Date(certificate.expiry_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(certificate.status, certificate.is_active)}
                    color={getStatusColor(certificate.status, certificate.is_active) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{certificate.validated_by_name}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewCertificate(certificate.id)}
                    title="Voir les détails"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadCertificate(certificate.id)}
                    title="Télécharger"
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {certificates.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun certificat trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 