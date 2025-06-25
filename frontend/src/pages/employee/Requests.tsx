import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Grid,
  Alert,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Visibility,
  Assignment,
  CheckCircle,
  Cancel,
  Download,
  FilterList,
  Refresh,
  Schedule,
  Warning,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  company_name: string;
  company_ice: string;
  treatment_type: string;
  status: string;
  submission_date: string;
  assigned_to_name: string;
  reviewed_by_name: string;
  has_payment: boolean;
  supporting_documents: string;
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'submitted', label: 'Soumises' },
  { value: 'under_review', label: 'En révision' },
  { value: 'approved', label: 'Approuvées' },
  { value: 'rejected', label: 'Rejetées' },
];

const treatmentTypes = [
  { value: '', label: 'Tous les types' },
  { value: 'collecte', label: 'Collecte' },
  { value: 'tri', label: 'Tri' },
  { value: 'recyclage', label: 'Recyclage' },
];

export default function EmployeeRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    treatment_type: '',
    assigned_to_me: false,
    search: '',
  });
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CertificationRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filters.status && { status: filters.status }),
        ...(filters.treatment_type && { treatment_type: filters.treatment_type }),
        ...(filters.assigned_to_me && { assigned_to_me: 'true' }),
      };
      const response = await employeeAPI.getRequests(params);
      setRequests(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'info';
      case 'under_review': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'submitted': return 'Soumise';
      case 'under_review': return 'En révision';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'submitted': return <Schedule />;
      case 'under_review': return <Warning />;
      case 'rejected': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const handleAssignToMe = async (request: CertificationRequest) => {
    try {
      await employeeAPI.assignToMe(request.id);
      loadRequests();
      setAssignDialog(false);
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  const handleViewRequest = (request: CertificationRequest) => {
    navigate(`/employee/requests/${request.id}`);
  };

  const handleValidateRequest = (request: CertificationRequest) => {
    navigate(`/employee/validation/${request.id}`);
  };

  const handleDownloadDocuments = async (request: CertificationRequest) => {
    try {
      const response = await employeeAPI.downloadDocuments(request.id);
      // Gérer le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `documents_demande_${request.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        request.company_name.toLowerCase().includes(searchLower) ||
        request.company_ice.toLowerCase().includes(searchLower) ||
        request.treatment_type.toLowerCase().includes(searchLower) ||
        request.id.toString().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: filteredRequests.length,
    submitted: filteredRequests.filter(r => r.status === 'submitted').length,
    under_review: filteredRequests.filter(r => r.status === 'under_review').length,
    approved: filteredRequests.filter(r => r.status === 'approved').length,
    rejected: filteredRequests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des demandes...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Gestion des Demandes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Visualisation et traitement des demandes de certification
        </Typography>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f3f4f6' }}>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.submitted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Soumises
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.under_review}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En révision
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approuvées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {stats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejetées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtres et Recherche
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadRequests}
              sx={{ color: '#667eea' }}
            >
              Actualiser
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Rechercher"
                variant="outlined"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Entreprise, ICE, type..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.treatment_type}
                  label="Type"
                  onChange={(e) => setFilters({ ...filters, treatment_type: e.target.value })}
                >
                  {treatmentTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant={filters.assigned_to_me ? "contained" : "outlined"}
                onClick={() => setFilters({ ...filters, assigned_to_me: !filters.assigned_to_me })}
                sx={{ 
                  height: '56px',
                  borderColor: '#667eea', 
                  color: filters.assigned_to_me ? 'white' : '#667eea',
                  bgcolor: filters.assigned_to_me ? '#667eea' : 'transparent'
                }}
              >
                Mes assignations uniquement
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des demandes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
            Liste des Demandes ({filteredRequests.length})
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Entreprise</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Assigné à</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Paiement</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{request.id.toString().padStart(3, '0')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {request.company_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ICE: {request.company_ice}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={request.treatment_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.submission_date).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.assigned_to_name || 'Non assigné'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.has_payment ? 'Payé' : 'En attente'} 
                        color={request.has_payment ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewRequest(request)}
                            sx={{ color: '#667eea' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {!request.assigned_to_name && (
                          <Tooltip title="M'assigner cette demande">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedRequest(request);
                                setAssignDialog(true);
                              }}
                              sx={{ color: '#4caf50' }}
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {request.assigned_to_name && request.status === 'under_review' && (
                          <Tooltip title="Valider/Rejeter">
                            <IconButton 
                              size="small" 
                              onClick={() => handleValidateRequest(request)}
                              sx={{ color: '#ff9800' }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {request.supporting_documents && (
                          <Tooltip title="Télécharger documents">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadDocuments(request)}
                              sx={{ color: '#2196f3' }}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRequests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Business sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucune demande trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aucune demande ne correspond aux critères de recherche
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'assignation */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Confirmer l'assignation</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vous assigner la demande #{selectedRequest?.id.toString().padStart(3, '0')} 
            de l'entreprise {selectedRequest?.company_name} ?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Cette action changera le statut de la demande à "En révision" et vous permettra de la traiter.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Annuler</Button>
          <Button 
            onClick={() => selectedRequest && handleAssignToMe(selectedRequest)} 
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Confirmer l'assignation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 