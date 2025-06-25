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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment,
  Schedule,
  Done,
} from '@mui/icons-material';

interface CertificationRequest {
  id: number;
  request_number: string;
  company_name: string;
  company_ice: string;
  treatment_type: string;
  status: string;
  created_date: string;
  updated_date: string;
  assigned_employee: string;
  estimated_cost: number;
  documents_count: number;
}

interface RequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
}

export default function AdminCertificationRequests() {
  const [requests, setRequests] = useState<CertificationRequest[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CertificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'approve' | 'reject'>('view');

  useEffect(() => {
    loadRequests();
    loadStats();
  }, [searchTerm, statusFilter, treatmentFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      const mockRequests: CertificationRequest[] = [
        {
          id: 1,
          request_number: "REQ-2024-001",
          company_name: "EcoTech Solutions",
          company_ice: "002345678000045",
          treatment_type: "Recyclage",
          status: "pending",
          created_date: "2024-12-10",
          updated_date: "2024-12-15",
          assigned_employee: "Houda Benali",
          estimated_cost: 2500,
          documents_count: 5
        },
        {
          id: 2,
          request_number: "REQ-2024-002",
          company_name: "GreenCorp Industries",
          company_ice: "002876543000098",
          treatment_type: "Tri",
          status: "approved",
          created_date: "2024-11-15",
          updated_date: "2024-11-20",
          assigned_employee: "Ahmed Alami",
          estimated_cost: 1800,
          documents_count: 4
        },
        {
          id: 3,
          request_number: "REQ-2024-003",
          company_name: "RecycleMax",
          company_ice: "002123456000021",
          treatment_type: "Réutilisation",
          status: "in_review",
          created_date: "2024-09-30",
          updated_date: "2024-10-05",
          assigned_employee: "Fatima Zahra",
          estimated_cost: 3200,
          documents_count: 6
        },
        {
          id: 4,
          request_number: "REQ-2024-004",
          company_name: "WasteTech Pro",
          company_ice: "002987654000076",
          treatment_type: "Élimination",
          status: "rejected",
          created_date: "2024-08-05",
          updated_date: "2024-08-12",
          assigned_employee: "Mohamed Tazi",
          estimated_cost: 4100,
          documents_count: 3
        }
      ];

      let filteredRequests = mockRequests;

      if (searchTerm) {
        filteredRequests = filteredRequests.filter(req =>
          req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.company_ice.includes(searchTerm)
        );
      }

      if (statusFilter) {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
      }

      if (treatmentFilter) {
        filteredRequests = filteredRequests.filter(req =>
          req.treatment_type.toLowerCase() === treatmentFilter.toLowerCase()
        );
      }

      setRequests(filteredRequests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const mockStats: RequestStats = {
        total_requests: 4,
        pending_requests: 1,
        approved_requests: 1,
        rejected_requests: 1
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleAction = (request: CertificationRequest, action: 'view' | 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (actionType === 'approve') {
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'approved', updated_date: new Date().toISOString().split('T')[0] }
            : req
        ));
      } else if (actionType === 'reject') {
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'rejected', updated_date: new Date().toISOString().split('T')[0] }
            : req
        ));
      }
      
      handleCloseDialog();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'in_review': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'in_review': return 'En révision';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Gestion des Demandes de Certification
      </Typography>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.total_requests}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Total Demandes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Schedule sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.pending_requests}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  En Attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Done sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.approved_requests}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Approuvées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CancelIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.rejected_requests}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Rejetées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher des demandes..."
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
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="in_review">En révision</MenuItem>
                  <MenuItem value="approved">Approuvé</MenuItem>
                  <MenuItem value="rejected">Rejeté</MenuItem>
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
                  <MenuItem value="recyclage">Recyclage</MenuItem>
                  <MenuItem value="réutilisation">Réutilisation</MenuItem>
                  <MenuItem value="élimination">Élimination</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Entreprise</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Employé Assigné</TableCell>
              <TableCell>Coût Estimé</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Date Création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.request_number}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {request.company_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ICE: {request.company_ice}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={request.treatment_type} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(request.status)}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{request.assigned_employee}</TableCell>
                <TableCell>{request.estimated_cost.toLocaleString()} MAD</TableCell>
                <TableCell>
                  <Chip label={`${request.documents_count} docs`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {new Date(request.created_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Tooltip title="Voir les détails">
                    <IconButton
                      size="small"
                      onClick={() => handleAction(request, 'view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {request.status === 'pending' && (
                    <>
                      <Tooltip title="Approuver">
                        <IconButton
                          size="small"
                          onClick={() => handleAction(request, 'approve')}
                          sx={{ color: 'success.main' }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeter">
                        <IconButton
                          size="small"
                          onClick={() => handleAction(request, 'reject')}
                          sx={{ color: 'error.main' }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune demande trouvée
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Détails de la demande'}
          {actionType === 'approve' && 'Approuver la demande'}
          {actionType === 'reject' && 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              {actionType === 'approve' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Êtes-vous sûr de vouloir approuver cette demande ?
                </Alert>
              )}
              {actionType === 'reject' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Êtes-vous sûr de vouloir rejeter cette demande ?
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Numéro de demande"
                    value={selectedRequest.request_number}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Entreprise"
                    value={selectedRequest.company_name}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ICE"
                    value={selectedRequest.company_ice}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Type de traitement"
                    value={selectedRequest.treatment_type}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employé assigné"
                    value={selectedRequest.assigned_employee}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coût estimé (MAD)"
                    value={selectedRequest.estimated_cost}
                    disabled
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          {actionType !== 'view' && (
            <Button 
              onClick={handleConfirmAction} 
              variant="contained"
              color={actionType === 'reject' ? 'error' : 'primary'}
            >
              {actionType === 'approve' && 'Approuver'}
              {actionType === 'reject' && 'Rejeter'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}