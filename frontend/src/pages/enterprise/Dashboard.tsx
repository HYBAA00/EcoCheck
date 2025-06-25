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
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#1F2937', fontWeight: 'bold', mb: 1 }}>
          Espace Entreprise
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#6B7280' }}>
          Gestion complète de vos demandes de certification DEEE
        </Typography>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.totalRequests > 0 && (
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                bgcolor: "#3B82F6",
                color: 'white',
                borderRadius: 2,
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stats.totalRequests}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Demandes Totales
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Assignment sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {stats.approvedRequests > 0 && (
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                bgcolor: "#10B981",
                color: 'white',
                borderRadius: 2,
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stats.approvedRequests}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Approuvées
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CheckCircle sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stats.pendingRequests > 0 && (
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                bgcolor: "#F97316",
                color: 'white',
                borderRadius: 2,
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stats.pendingRequests}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  En Attente
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Schedule sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stats.certificatesCount > 0 && (
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                bgcolor: "#0EA5E9",
                color: 'white',
                borderRadius: 2,
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stats.certificatesCount}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Certificats
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CardMembership sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stats.pendingPayments > 0 && (
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                bgcolor: "#EC4899",
                color: 'white',
                borderRadius: 2,
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stats.pendingPayments}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Paiements Dus
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Warning sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stats.rejectedRequests > 0 && (
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                bgcolor: "#EF4444",
                color: 'white',
                borderRadius: 2,
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {stats.rejectedRequests}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Rejetées
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Cancel sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Actions Rapides */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 'bold' }}>
          Actions Rapides
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/enterprise/certification-form')}
              fullWidth
              sx={{
                py: 2,
                bgcolor: '#3B82F6',
                color: 'white',
                '&:hover': {
                  bgcolor: '#2563EB',
                },
              }}
            >
              Nouvelle Demande
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              onClick={() => navigate('/enterprise/payments')}
              fullWidth
              sx={{
                py: 2,
                borderColor: '#3B82F6',
                color: '#3B82F6',
                '&:hover': {
                  borderColor: '#2563EB',
                  backgroundColor: 'rgba(59, 130, 246, 0.04)',
                },
              }}
            >
              Paiements
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<CardMembership />}
              onClick={() => navigate('/enterprise/certificates')}
              fullWidth
              sx={{
                py: 2,
                borderColor: '#10B981',
                color: '#10B981',
                '&:hover': {
                  borderColor: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                },
              }}
            >
              Mes Certificats
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<History />}
              onClick={() => navigate('/enterprise/history')}
              fullWidth
              sx={{
                py: 2,
                borderColor: '#F97316',
                color: '#F97316',
                '&:hover': {
                  borderColor: '#EA580C',
                  backgroundColor: 'rgba(249, 115, 24, 0.04)',
                },
              }}
            >
              Historique Complet
            </Button>
          </Grid>
        </Grid>
      </Box>

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