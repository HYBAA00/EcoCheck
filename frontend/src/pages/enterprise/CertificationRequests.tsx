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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  LinearProgress,
  Fab,
  Paper,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Download,
  Upload,
  CheckCircle,
  Schedule,
  Warning,
  Cancel,
  FilterList,
  Payment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { certificationAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  treatment_type: string;
  status: string;
  submission_date: string;
  company_name: string;
  supporting_documents?: string;
  has_payment?: boolean;
}

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'submitted', label: 'Soumise' },
  { value: 'under_review', label: 'En révision' },
  { value: 'approved', label: 'Approuvée' },
  { value: 'rejected', label: 'Rejetée' },
];

const treatmentTypes = [
  'Recyclage Ordinateurs',
  'Traitement Batteries',
  'Recyclage Téléphones',
  'Traitement Écrans',
  'Recyclage Composants',
  'Traitement Câbles',
];

export default function CertificationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CertificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CertificationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire pour nouvelle demande
  const [newRequest, setNewRequest] = useState({
    treatment_type: '',
    description: '',
    estimated_quantity: '',
    documents: null as File | null,
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await certificationAPI.getRequests();
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      // En cas d'erreur, afficher un message mais ne pas bloquer l'interface
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = requests;

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.treatment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toString().includes(searchTerm)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'info';
      case 'under_review': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'submitted': return 'Soumise';
      case 'under_review': return 'En révision';
      case 'rejected': return 'Rejetée';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'submitted': return <Schedule />;
      case 'under_review': return <Warning />;
      case 'rejected': return <Cancel />;
      case 'draft': return <Edit />;
      default: return <Schedule />;
    }
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setNewRequest({
      treatment_type: '',
      description: '',
      estimated_quantity: '',
      documents: null,
    });
    setOpenDialog(true);
  };

  const handleEditRequest = (request: CertificationRequest) => {
    setSelectedRequest(request);
    setNewRequest({
      treatment_type: request.treatment_type,
      description: '',
      estimated_quantity: '',
      documents: null,
    });
    setOpenDialog(true);
  };

  const handleSubmitRequest = () => {
    // Logique pour soumettre ou modifier la demande
    console.log('Demande soumise:', newRequest);
    setOpenDialog(false);
    // Ici, vous feriez un appel API pour créer/modifier la demande
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewRequest({ ...newRequest, documents: file });
    }
  };

  const handlePayment = (requestId: number) => {
    navigate(`/enterprise/payment?request_id=${requestId}`);
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
          Demandes de Certification
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestion de vos demandes de certification DEEE
        </Typography>
      </Box>

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID ou type de traitement..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Filtrer par statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/enterprise/requests/new')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Nouvelle Demande
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f3f4f6' }}>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {requests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Demandes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f0f9ff' }}>
            <CardContent>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {requests.filter(r => r.status === 'submitted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f0fdf4' }}>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {requests.filter(r => r.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approuvées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#fef2f2' }}>
            <CardContent>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {requests.filter(r => r.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejetées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des demandes */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type de Traitement</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date de Soumission</TableCell>
                  <TableCell>Paiement</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>{request.treatment_type}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(request.submission_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.has_payment ? (
                        <Chip label="Payé" color="success" size="small" />
                      ) : (
                        <Chip label="En attente" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {request.supporting_documents ? (
                        <Tooltip title="Télécharger documents">
                          <IconButton size="small">
                            <Download />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucun
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Voir détails">
                        <IconButton size="small" onClick={() => navigate(`/enterprise/requests/${request.id}`)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {(request.status === 'draft' || request.status === 'rejected') && (
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleEditRequest(request)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      {request.status === 'approved' && (
                        <Tooltip title="Télécharger certificat">
                          <IconButton size="small">
                            <Download />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!request.has_payment && ['submitted', 'under_review', 'approved'].includes(request.status) && (
                        <Tooltip title="Effectuer le paiement">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePayment(request.id)}
                            sx={{ color: '#e91e63' }}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRequests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Aucune demande trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {statusFilter !== 'all' || searchTerm 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par créer votre première demande de certification'
                }
              </Typography>
              {statusFilter === 'all' && !searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/enterprise/requests/new')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Créer une demande
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour nouvelle demande/modification */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRequest ? 'Modifier la Demande' : 'Nouvelle Demande de Certification'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Type de Traitement"
                value={newRequest.treatment_type}
                onChange={(e) => setNewRequest({ ...newRequest, treatment_type: e.target.value })}
                required
              >
                {treatmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description détaillée"
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder="Décrivez le type de déchets, la quantité estimée, les processus de traitement..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantité estimée (kg)"
                value={newRequest.estimated_quantity}
                onChange={(e) => setNewRequest({ ...newRequest, estimated_quantity: e.target.value })}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                fullWidth
                sx={{ height: '56px' }}
              >
                {newRequest.documents ? newRequest.documents.name : 'Télécharger Documents'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Les documents justificatifs doivent inclure : inventaire des déchets, 
                processus de traitement prévu, certifications existantes, etc.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitRequest}
            disabled={!newRequest.treatment_type}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {selectedRequest ? 'Modifier' : 'Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bouton flottant pour nouvelle demande */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          }
        }}
        onClick={() => navigate('/enterprise/requests/new')}
      >
        <Add />
      </Fab>
    </Box>
  );
} 