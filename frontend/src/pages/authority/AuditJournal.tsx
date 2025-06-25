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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
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
  Assignment,
  Person,
  DateRange,
  FileDownload,
  Refresh,
  Business,
  Edit,
  Delete,
  Warning,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../services/api';

interface AuditEntry {
  id: number;
  timestamp: string;
  action: string;
  user_name: string;
  user_role: string;
  request_id: number;
  company_name: string;
  details: string;
  ip_address: string;
  status: 'success' | 'warning' | 'error' | 'info';
  treatment_type: string;
}

interface AuditStats {
  total_entries: number;
  today_entries: number;
  success_rate: number;
  most_active_user: string;
  most_common_action: string;
}

export default function AuditJournal() {
  const navigate = useNavigate();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadAuditEntries();
    loadStats();
  }, [page, searchTerm, actionFilter, userFilter, dateFilter]);

  const loadAuditEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(actionFilter && { action: actionFilter }),
        ...(userFilter && { user: userFilter }),
        ...(dateFilter && { date_filter: dateFilter }),
      });

      const response = await authorityAPI.getAuditEntries(params.toString());
      setAuditEntries(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / 20));
    } catch (error) {
      console.error('Erreur lors du chargement du journal d\'audit:', error);
      setError('Impossible de charger le journal d\'audit');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authorityAPI.getAuditStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(actionFilter && { action: actionFilter }),
        ...(userFilter && { user: userFilter }),
        ...(dateFilter && { date_filter: dateFilter }),
      });

      await authorityAPI.exportAuditLog(params.toString());
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Cancel />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'validation': return <CheckCircle sx={{ color: '#4CAF50' }} />;
      case 'rejection': return <Cancel sx={{ color: '#f44336' }} />;
      case 'assignment': return <Person sx={{ color: '#2196F3' }} />;
      case 'creation': return <Edit sx={{ color: '#FF9800' }} />;
      case 'deletion': return <Delete sx={{ color: '#f44336' }} />;
      case 'consultation': return <Visibility sx={{ color: '#9C27B0' }} />;
      default: return <Assignment sx={{ color: '#667eea' }} />;
    }
  };

  const handleViewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  };

  if (loading && auditEntries.length === 0) {
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
          Chargement du journal d'audit...
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
            <Assignment sx={{ mr: 2, fontSize: 40 }} />
            Journal d'Audit
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Suivi détaillé de toutes les actions effectuées sur la plateforme
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
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <Assignment sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.total_entries}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Total Entrées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <DateRange sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.today_entries}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Aujourd'hui
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <CheckCircle sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.success_rate}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Taux de Succès
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <Person sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.most_active_user}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Plus Actif
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              textAlign: 'center'
            }}>
              <CardContent>
                <Edit sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {stats.most_common_action}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Action Fréquente
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Rechercher dans les logs..."
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
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Toutes les actions</MenuItem>
                  <MenuItem value="validation">Validation</MenuItem>
                  <MenuItem value="rejection">Rejet</MenuItem>
                  <MenuItem value="assignment">Assignation</MenuItem>
                  <MenuItem value="creation">Création</MenuItem>
                  <MenuItem value="consultation">Consultation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Utilisateur</InputLabel>
                <Select
                  value={userFilter}
                  label="Utilisateur"
                  onChange={(e) => setUserFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous les utilisateurs</MenuItem>
                  <MenuItem value="employee">Employés</MenuItem>
                  <MenuItem value="admin">Administrateurs</MenuItem>
                  <MenuItem value="authority">Autorités</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Période</InputLabel>
                <Select
                  value={dateFilter}
                  label="Période"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="today">Aujourd'hui</MenuItem>
                  <MenuItem value="week">Cette semaine</MenuItem>
                  <MenuItem value="month">Ce mois</MenuItem>
                  <MenuItem value="year">Cette année</MenuItem>
                  <MenuItem value="all">Toutes les dates</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={loadAuditEntries}
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

      {/* Audit Entries Table */}
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
            Entrées d'Audit ({auditEntries.length})
          </Typography>
          
          {loading ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Horodatage</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Utilisateur</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Entreprise</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditEntries.map((entry) => (
                    <TableRow key={entry.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(entry.timestamp).toLocaleDateString('fr-FR')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getActionIcon(entry.action)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {entry.action}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {entry.user_name}
                        </Typography>
                        <Chip 
                          label={entry.user_role}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.company_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Req #{entry.request_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.treatment_type}
                          variant="outlined"
                          size="small"
                          sx={{ borderColor: '#667eea', color: '#667eea' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(entry.status)}
                          label={entry.status}
                          color={getStatusColor(entry.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {entry.ip_address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(entry)}
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

      {/* Entry Details Dialog */}
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
          <Assignment sx={{ mr: 2 }} />
          Détails de l'Entrée d'Audit #{selectedEntry?.id}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedEntry && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Informations de l'Action
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Horodatage:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(selectedEntry.timestamp).toLocaleString('fr-FR')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Action:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getActionIcon(selectedEntry.action)}
                    <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                      {selectedEntry.action}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Statut:</Typography>
                  <Chip
                    icon={getStatusIcon(selectedEntry.status)}
                    label={selectedEntry.status}
                    color={getStatusColor(selectedEntry.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Adresse IP:</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedEntry.ip_address}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Informations Contextuelles
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Utilisateur:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedEntry.user_name}</Typography>
                  <Chip 
                    label={selectedEntry.user_role}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Entreprise:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedEntry.company_name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">ID Demande:</Typography>
                  <Typography variant="body1">#{selectedEntry.request_id}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Type de traitement:</Typography>
                  <Chip 
                    label={selectedEntry.treatment_type}
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: '#667eea', color: '#667eea', mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Détails de l'Action
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9ff', borderRadius: 2 }}>
                  <Typography variant="body1">
                    {selectedEntry.details}
                  </Typography>
                </Paper>
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
            Exporter cette entrée
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 