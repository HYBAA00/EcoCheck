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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  Download,
  Receipt,
  CloudUpload,
  Payment,
  FilterList,
  ExpandMore,
  History as HistoryIcon,
  Assignment,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { certificationAPI } from '../../services/api';

interface HistoryItem {
  id: number;
  treatmentType: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  submissionDate: string;
  lastUpdate: string;
  hasPayment: boolean;
  certificateUrl?: string;
  rejectionReportUrl?: string;
  timeline: Array<{
    date: string;
    action: string;
    description: string;
    user?: string;
  }>;
}

function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Filtres
  const [filters, setFilters] = useState({
    status: '',
    treatmentType: '',
    searchTerm: '',
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await certificationAPI.getRequests();
      // Transformer les données des demandes en format historique
      const historyData = response.data.map((request: any) => ({
        id: request.id,
        treatmentType: request.treatment_type,
        status: request.status,
        submissionDate: request.created_at || request.submission_date || new Date().toISOString(),
        lastUpdate: request.updated_at || new Date().toISOString(),
        hasPayment: request.has_payment || false,
        certificateUrl: request.certificate_url,
        rejectionReportUrl: request.rejection_report_url,
        timeline: [
          {
            date: request.created_at || new Date().toISOString(),
            action: 'Soumission',
            description: `Demande de certification pour ${request.treatment_type}`,
            user: 'Entreprise'
          }
        ]
      }));
      setHistory(historyData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setHistory([]);
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
      case 'draft': return 'default';
      case 'cancelled': return 'default';
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
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'submitted': return <Schedule />;
      case 'under_review': return <Warning />;
      case 'rejected': return <Cancel />;
      case 'draft': return <Assignment />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'soumission': return <CloudUpload />;
      case 'révision': return <Visibility />;
      case 'validation': return <CheckCircle />;
      case 'paiement': return <Payment />;
      case 'certificat': return <Download />;
      case 'rejet': return <Cancel />;
      case 'problème': return <Warning />;
      default: return <HistoryIcon />;
    }
  };

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      treatmentType: '',
      searchTerm: '',
    });
  };

  const filteredHistory = history.filter(item => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.treatmentType && item.treatmentType !== filters.treatmentType) return false;
    if (filters.searchTerm && !item.treatmentType.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    total: history.length,
    approved: history.filter(h => h.status === 'approved').length,
    pending: history.filter(h => ['submitted', 'under_review'].includes(h.status)).length,
    rejected: history.filter(h => h.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Chargement de l'historique...</Typography>
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
          Historique Complet
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {statusCounts.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Demandes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {statusCounts.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approuvées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {statusCounts.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {statusCounts.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejetées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtres
            </Typography>
            <Button onClick={clearFilters} size="small">
              Effacer les filtres
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="approved">Approuvées</MenuItem>
                  <MenuItem value="under_review">En révision</MenuItem>
                  <MenuItem value="submitted">Soumises</MenuItem>
                  <MenuItem value="rejected">Rejetées</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.treatmentType}
                  label="Type"
                  onChange={(e) => handleFilterChange('treatmentType', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Collecte">Collecte</MenuItem>
                  <MenuItem value="Tri">Tri</MenuItem>
                  <MenuItem value="Recyclage">Recyclage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste de l'historique */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
            Historique ({filteredHistory.length})
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Soumission</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Dernière MAJ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{item.id.toString().padStart(3, '0')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.treatmentType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(item.status)}
                        label={getStatusText(item.status)}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(item.submissionDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(item.lastUpdate).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(item)}
                            sx={{ color: '#667eea' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {item.certificateUrl && (
                          <Tooltip title="Télécharger certificat">
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(item.certificateUrl, '_blank')}
                              sx={{ color: '#4caf50' }}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {item.rejectionReportUrl && (
                          <Tooltip title="Rapport de refus">
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(item.rejectionReportUrl, '_blank')}
                              sx={{ color: '#f44336' }}
                            >
                              <Receipt />
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

          {filteredHistory.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun élément trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Essayez de modifier vos filtres de recherche
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog des détails */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de la demande #{selectedItem?.id.toString().padStart(3, '0')}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type de traitement
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedItem.treatmentType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut actuel
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedItem.status)}
                    label={getStatusText(selectedItem.status)}
                    color={getStatusColor(selectedItem.status) as any}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Chronologie
              </Typography>
              
              <List>
                {selectedItem.timeline.map((event, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {getActionIcon(event.action)}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.action}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                          {event.user && (
                            <Typography variant="caption" color="text.secondary">
                              Par: {event.user}
                            </Typography>
                          )}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(event.date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HistoryPage;
