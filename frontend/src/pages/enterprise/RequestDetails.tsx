import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Receipt,
  Payment,
  CloudUpload,
  CheckCircle,
  Schedule,
  Warning,
  Cancel,
  Assignment,
  History as HistoryIcon,
  Visibility,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { certificationAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  treatment_type: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  submission_date: string;
  created_at: string;
  updated_at: string;
  description?: string;
  estimated_quantity?: number;
  has_payment: boolean;
  certificate_url?: string;
  rejection_report_url?: string;
  company_name?: string;
}

export default function RequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CertificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRequestDetails(parseInt(id));
    }
  }, [id]);

  const loadRequestDetails = async (requestId: number) => {
    try {
      setLoading(true);
      const response = await certificationAPI.getRequest(requestId);
      setRequest(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setError('Impossible de charger les détails de la demande');
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

  const handlePayment = () => {
    if (request) {
      navigate(`/enterprise/payment?request_id=${request.id}`);
    }
  };

  const handleDownloadCertificate = () => {
    if (request?.certificate_url) {
      window.open(request.certificate_url, '_blank');
    }
  };

  const handleDownloadRejectionReport = () => {
    if (request?.rejection_report_url) {
      window.open(request.rejection_report_url, '_blank');
    }
  };

  const handleResubmit = () => {
    if (request) {
      navigate(`/enterprise/certification-form?resubmit=${request.id}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Chargement des détails...</Typography>
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Demande introuvable'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/enterprise/dashboard')}
        >
          Retour au tableau de bord
        </Button>
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
          Détails de la demande #{request.id.toString().padStart(3, '0')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Informations Générales
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type de traitement
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                    {request.treatment_type}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut actuel
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(request.status)}
                      label={getStatusText(request.status)}
                      color={getStatusColor(request.status) as any}
                      size="medium"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date de soumission
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(request.submission_date || request.created_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dernière mise à jour
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(request.updated_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                
                {request.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {request.description}
                    </Typography>
                  </Grid>
                )}
                
                {request.estimated_quantity && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Quantité estimée
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {request.estimated_quantity} kg
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Chronologie */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Chronologie
              </Typography>
              
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <Assignment />
                    </TimelineDot>
                    {request.status !== 'submitted' && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Demande soumise
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="body2">
                      Demande de certification pour {request.treatment_type}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                {request.status === 'under_review' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="warning">
                        <Warning />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        En cours de révision
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.updated_at).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="body2">
                        La demande est en cours d'examen par nos experts
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {request.status === 'approved' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <CheckCircle />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Demande approuvée
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.updated_at).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="body2">
                        Votre certificat est prêt au téléchargement
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {request.status === 'rejected' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="error">
                        <Cancel />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Demande rejetée
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.updated_at).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="body2">
                        Consultez le rapport de rejet pour plus de détails
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions et statut */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Actions Disponibles
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {request.status === 'approved' && request.certificate_url && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownloadCertificate}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                      }
                    }}
                  >
                    Télécharger le certificat
                  </Button>
                )}
                
                {request.status === 'rejected' && request.rejection_report_url && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={handleDownloadRejectionReport}
                    sx={{ borderColor: '#f44336', color: '#f44336' }}
                  >
                    Voir le rapport de rejet
                  </Button>
                )}
                
                {request.status === 'rejected' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={handleResubmit}
                    sx={{
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                      }
                    }}
                  >
                    Re-soumettre la demande
                  </Button>
                )}
                
                {!request.has_payment && ['submitted', 'under_review', 'approved'].includes(request.status) && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={handlePayment}
                    sx={{
                      background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #c2185b 0%, #ad1457 100%)',
                      }
                    }}
                  >
                    Effectuer le paiement
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Statut du paiement */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Statut du Paiement
              </Typography>
              
              {request.has_payment ? (
                <Alert severity="success">
                  <Typography variant="body2">
                    Paiement effectué avec succès
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning">
                  <Typography variant="body2">
                    Paiement en attente. Vous pouvez effectuer le paiement dès maintenant pour accélérer le processus.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 