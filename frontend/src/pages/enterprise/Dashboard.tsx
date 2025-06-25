import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Assignment,
  Payment,
  Download,
  Visibility,
  History,
  CheckCircle,
  Schedule,
  Cancel,
  Warning,
  Receipt,
  CloudUpload,
  Refresh,
  CardMembership,
  AccountBalance,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { certificationAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  treatment_type: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  submission_date: string;
  has_payment: boolean;
  certificate_url?: string;
  rejection_report_url?: string;
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  certificatesCount: number;
  pendingPayments: number;
}

export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    certificatesCount: 0,
    pendingPayments: 0,
  });
  const [recentRequests, setRecentRequests] = useState<CertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques depuis les vraies APIs
      const [statsResponse, requestsResponse] = await Promise.all([
        certificationAPI.getEnterpriseStats(),
        certificationAPI.getRequests()
      ]);
      
      setStats(statsResponse.data);
      // Prendre les 5 demandes les plus récentes
      const sortedRequests = requestsResponse.data
        .sort((a: any, b: any) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime())
        .slice(0, 5);
      setRecentRequests(sortedRequests);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, garder les données par défaut (zéros)
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
      default: return <Schedule />;
    }
  };

  const handlePayment = (requestId: number) => {
    // Rediriger vers la page de paiement
    navigate(`/enterprise/payment/${requestId}`);
  };

  const handleDownloadCertificate = (certificateUrl: string) => {
    // Télécharger le certificat
    window.open(certificateUrl, '_blank');
  };

  const handleDownloadRejectionReport = (reportUrl: string) => {
    // Télécharger le rapport de refus
    window.open(reportUrl, '_blank');
  };

  const handleResubmit = (requestId: number) => {
    // Rediriger vers le formulaire de re-soumission
    navigate(`/enterprise/resubmit/${requestId}`);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress sx={{ 
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
        }} />
        <Typography sx={{ mt: 2, textAlign: 'center', color: '#666' }}>
          Chargement de votre espace entreprise...
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
          Espace Entreprise
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestion complète de vos demandes de certification DEEE
        </Typography>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalRequests}
              </Typography>
              <Typography variant="body2">
                Demandes Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.approvedRequests}
              </Typography>
              <Typography variant="body2">
                Approuvées
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.pendingRequests}
              </Typography>
              <Typography variant="body2">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <CardMembership sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.certificatesCount}
              </Typography>
              <Typography variant="body2">
                Certificats
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Badge badgeContent={stats.pendingPayments} color="error">
                <Payment sx={{ fontSize: 40, mb: 1 }} />
              </Badge>
              <Typography variant="h4" fontWeight="bold">
                {stats.pendingPayments}
              </Typography>
              <Typography variant="body2">
                Paiements Dus
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Cancel sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.rejectedRequests}
              </Typography>
              <Typography variant="body2">
                Rejetées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
            Actions Rapides
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/enterprise/certification-form')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  py: 1.5
                }}
              >
                Nouvelle Demande
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Payment />}
                onClick={() => navigate('/enterprise/payments')}
                sx={{ 
                  borderColor: '#667eea', 
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  },
                  py: 1.5
                }}
              >
                Paiements
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CardMembership />}
                onClick={() => navigate('/enterprise/certificates')}
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
                Mes Certificats
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<History />}
                onClick={() => navigate('/enterprise/history')}
                sx={{ 
                  borderColor: '#ff9800', 
                  color: '#ff9800',
                  '&:hover': {
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(255, 152, 0, 0.04)'
                  },
                  py: 1.5
                }}
              >
                Historique Complet
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Demandes récentes */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
              Demandes Récentes
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadDashboardData}
              sx={{ color: '#667eea' }}
            >
              Actualiser
            </Button>
          </Box>

          {/* Info sur les paiements */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Nouveau :</strong> Vous pouvez maintenant effectuer le paiement dès que votre demande est soumise, 
              sans attendre l'approbation. Cela accélère le processus de certification !
            </Typography>
          </Alert>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type de Traitement</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Paiement</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{request.id.toString().padStart(3, '0')}
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
                      {request.has_payment ? (
                        <Chip label="Payé" color="success" size="small" />
                      ) : (
                        <Chip label="En attente" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir détails">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate('/enterprise/requests')}
                            sx={{ color: '#667eea' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status === 'approved' && request.certificate_url && (
                          <Tooltip title="Télécharger certificat">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadCertificate(request.certificate_url!)}
                              sx={{ color: '#4caf50' }}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {request.status === 'rejected' && request.rejection_report_url && (
                          <Tooltip title="Voir rapport de refus">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadRejectionReport(request.rejection_report_url!)}
                              sx={{ color: '#f44336' }}
                            >
                              <Receipt />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {request.status === 'rejected' && (
                          <Tooltip title="Re-soumettre">
                            <IconButton 
                              size="small" 
                              onClick={() => handleResubmit(request.id)}
                              sx={{ color: '#ff9800' }}
                            >
                              <CloudUpload />
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {recentRequests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Assignment sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucune demande de certification
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Commencez par créer votre première demande de certification
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
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
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}