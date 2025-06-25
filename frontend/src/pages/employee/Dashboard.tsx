import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Alert,
  LinearProgress,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Cancel,
  Warning,
  Visibility,
  Edit,
  Download,
  TrendingUp,
  People,
  Today,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

interface DashboardStats {
  total_requests: number;
  assigned_to_me: number;
  pending_review: number;
  approved_today: number;
  status_counts: {
    [key: string]: number;
  };
  recent_assigned: CertificationRequest[];
}

interface CertificationRequest {
  id: number;
  company_name: string;
  company_ice: string;
  treatment_type: string;
  status: string;
  submission_date: string;
  assigned_to_name: string;
  has_payment: boolean;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_requests: 0,
    assigned_to_me: 0,
    pending_review: 0,
    approved_today: 0,
    status_counts: {},
    recent_assigned: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Utiliser des données par défaut en cas d'erreur
      setStats({
        total_requests: 0,
        assigned_to_me: 0,
        pending_review: 0,
        approved_today: 0,
        status_counts: {},
        recent_assigned: []
      });
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
      case 'draft': return <Assignment />;
      default: return <Schedule />;
    }
  };

  const handleViewRequest = (requestId: number) => {
    navigate(`/employee/requests/${requestId}`);
  };

  const handleAssignToMe = async (requestId: number) => {
    try {
      await employeeAPI.assignToMe(requestId);
      loadDashboardData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Chargement du tableau de bord...
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
          Tableau de Bord Employé
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestion et validation des demandes de certification DEEE
        </Typography>
      </Box>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.total_requests}
              </Typography>
              <Typography variant="body2">
                Total Demandes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <People sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.assigned_to_me}
              </Typography>
              <Typography variant="body2">
                Mes Assignations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.pending_review}
              </Typography>
              <Typography variant="body2">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Today sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.approved_today}
              </Typography>
              <Typography variant="body2">
                Approuvées Aujourd'hui
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Actions rapides */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Actions Rapides
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={() => navigate('/employee/requests')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      py: 1.5
                    }}
                  >
                    Voir Demandes
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CheckCircle />}
                    onClick={() => navigate('/employee/assignments')}
                    sx={{ 
                      borderColor: '#4caf50', 
                      color: '#4caf50',
                      '&:hover': {
                        borderColor: '#45a049',
                        backgroundColor: 'rgba(76, 175, 80, 0.04)'
                      },
                      py: 1.5
                    }}
                  >
                    Mes Assignations
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CheckCircle />}
                    onClick={() => navigate('/employee/validation')}
                    sx={{ 
                      borderColor: '#2196f3', 
                      color: '#2196f3',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(33, 150, 243, 0.04)'
                      },
                      py: 1.5
                    }}
                  >
                    Validation
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/employee/rejections')}
                    sx={{ 
                      borderColor: '#f44336', 
                      color: '#f44336',
                      '&:hover': {
                        borderColor: '#d32f2f',
                        backgroundColor: 'rgba(244, 67, 54, 0.04)'
                      },
                      py: 1.5
                    }}
                  >
                    Rapports Refus
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Demandes récentes assignées */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  Mes Assignations Récentes
                </Typography>
                <Button
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/employee/assignments')}
                  sx={{ color: '#667eea' }}
                >
                  Voir tout
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Entreprise</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recent_assigned.map((request) => (
                      <TableRow key={request.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{request.id.toString().padStart(3, '0')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.company_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ICE: {request.company_ice}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.treatment_type}
                          </Typography>
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Voir détails">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewRequest(request.id)}
                                sx={{ color: '#667eea' }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Traiter">
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/employee/validation/${request.id}`)}
                                sx={{ color: '#4caf50' }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {stats.recent_assigned.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Assignment sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucune assignation récente
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Les demandes qui vous seront assignées apparaîtront ici
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} md={4}>
          {/* Répartition par statut */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Répartition par Statut
              </Typography>
              <List>
                {Object.entries(stats.status_counts).map(([status, count]) => (
                  <ListItem key={status}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getStatusColor(status) === 'success' ? '#4caf50' : 
                                            getStatusColor(status) === 'warning' ? '#ff9800' :
                                            getStatusColor(status) === 'error' ? '#f44336' : '#2196f3' }}>
                        {getStatusIcon(status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={getStatusText(status)}
                      secondary={`${count} demande${count > 1 ? 's' : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Actions rapides
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/employee/requests')}
                  fullWidth
                >
                  Voir toutes les demandes
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CheckCircle />}
                  onClick={() => navigate('/employee/validation')}
                  fullWidth
                >
                  Valider des demandes
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate('/employee/profile')}
                  fullWidth
                >
                  Mon profil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
