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
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  FileDownload,
  Refresh,
  DateRange,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Info,
  Business,
  VerifiedUser,
  Assignment,
  Visibility,
  GetApp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../services/api';

interface AuditReportData {
  id: number;
  title: string;
  generated_date: string;
  period_start: string;
  period_end: string;
  summary: {
    total_requests: number;
    processed_requests: number;
    pending_requests: number;
    success_rate: number;
    average_processing_time: number;
  };
  details: {
    certificates_issued: number;
    certificates_revoked: number;
    companies_audited: number;
    compliance_issues: number;
  };
  recommendations: string[];
  status: 'draft' | 'final' | 'published';
}

interface ComplianceMetrics {
  overall_score: number;
  category_scores: {
    documentation: number;
    processing_time: number;
    quality_control: number;
    regulatory_compliance: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  critical_issues: number;
  resolved_issues: number;
}

export default function AuditReport() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AuditReportData[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AuditReportData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Filtres pour la génération de rapport
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('compliance');

  useEffect(() => {
    loadReports();
    loadMetrics();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authorityAPI.getAuditReports();
      setReports(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      setError('Impossible de charger les rapports d\'audit');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await authorityAPI.getComplianceReport();
      setMetrics(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    }
  };

  const handleGenerateReport = async () => {
    console.log('Button clicked!');
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    
    if (!startDate || !endDate) {
      setError('Veuillez sélectionner une période pour le rapport');
      return;
    }

    try {
      setGeneratingReport(true);
      setError(null);
      
      console.log('Calling API with:', {
        start_date: startDate,
        end_date: endDate,
        report_type: reportType,
      });

      const response = await authorityAPI.generateAuditReport({
        start_date: startDate,
        end_date: endDate,
        report_type: reportType,
      });
      
      console.log('API response:', response);

      // Recharger les rapports après génération
      await loadReports();
      
      // Réinitialiser les champs
      setStartDate('');
      setEndDate('');
      setReportType('compliance');
      
      console.log('Report generated successfully');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      setError('Impossible de générer le rapport');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleViewReport = (report: AuditReportData) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  const handleDownloadReport = async (reportId: number) => {
    try {
      await authorityAPI.downloadAuditReport(reportId);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'final': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'final': return 'Final';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp sx={{ color: '#4CAF50' }} />;
      case 'declining': return <TrendingUp sx={{ color: '#f44336', transform: 'rotate(180deg)' }} />;
      case 'stable': return <TrendingUp sx={{ color: '#FF9800', transform: 'rotate(90deg)' }} />;
      default: return <TrendingUp sx={{ color: '#9E9E9E' }} />;
    }
  };

  if (loading) {
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
          Chargement des rapports d'audit...
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
            <Assessment sx={{ mr: 2, fontSize: 40 }} />
            Rapport d'Audit
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Génération et consultation des rapports d'audit de conformité
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Métriques de conformité */}
      {metrics && (
        <Card sx={{ 
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: '#2c3e50', 
              mb: 3,
              display: 'flex',
              alignItems: 'center'
            }}>
              <TrendingUp sx={{ mr: 2, color: '#667eea' }} />
              Métriques de Conformité Globale
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, backgroundColor: '#f8f9ff' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#667eea', mb: 1 }}>
                    {metrics.overall_score}%
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
                    Score Global
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(metrics.trend)}
                    <Typography variant="body2" sx={{ ml: 1, color: '#7f8c8d' }}>
                      {metrics.trend === 'improving' ? 'En amélioration' : 
                       metrics.trend === 'declining' ? 'En déclin' : 'Stable'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  Scores par Catégorie
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Documentation</Typography>
                      <Chip 
                        label={`${metrics.category_scores.documentation}%`}
                        color={metrics.category_scores.documentation >= 80 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Temps de traitement</Typography>
                      <Chip 
                        label={`${metrics.category_scores.processing_time}%`}
                        color={metrics.category_scores.processing_time >= 80 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Contrôle qualité</Typography>
                      <Chip 
                        label={`${metrics.category_scores.quality_control}%`}
                        color={metrics.category_scores.quality_control >= 80 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Conformité réglementaire</Typography>
                      <Chip 
                        label={`${metrics.category_scores.regulatory_compliance}%`}
                        color={metrics.category_scores.regulatory_compliance >= 80 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  Problèmes Identifiés
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Error sx={{ color: '#f44336', mr: 1 }} />
                  <Typography variant="body2">
                    {metrics.critical_issues} problèmes critiques
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 1 }} />
                  <Typography variant="body2">
                    {metrics.resolved_issues} problèmes résolus
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Génération de rapport */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Assessment sx={{ mr: 2, color: '#667eea' }} />
                Générer un Nouveau Rapport
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                  Période du rapport:
                </Typography>
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type de rapport</InputLabel>
                <Select
                  value={reportType}
                  label="Type de rapport"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="compliance">Conformité</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="security">Sécurité</MenuItem>
                  <MenuItem value="comprehensive">Complet</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={generatingReport ? <Refresh className="animate-spin" /> : <Assessment />}
                onClick={handleGenerateReport}
                disabled={generatingReport || !startDate || !endDate}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 'bold'
                }}
              >
                {generatingReport ? 'Génération...' : 'Générer le Rapport'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Liste des rapports */}
        <Grid item xs={12} md={8}>
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
                Rapports d'Audit Disponibles ({reports.length})
              </Typography>
              
              {reports.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8f9ff' }}>
                  <Assessment sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#2c3e50', mb: 1 }}>
                    Aucun rapport disponible
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                    Générez votre premier rapport d'audit pour commencer
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Titre</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Période</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date de génération</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {report.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(report.period_start).toLocaleDateString('fr-FR')} - {new Date(report.period_end).toLocaleDateString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(report.generated_date).toLocaleDateString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(report.status)}
                              color={getStatusColor(report.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleViewReport(report)}
                                sx={{ color: '#667eea' }}
                              >
                                Voir
                              </Button>
                              <Button
                                size="small"
                                startIcon={<GetApp />}
                                onClick={() => handleDownloadReport(report.id)}
                                sx={{ color: '#4CAF50' }}
                              >
                                Télécharger
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de détails du rapport */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Assessment sx={{ mr: 2 }} />
          {selectedReport?.title}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Résumé Exécutif
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#f8f9ff', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total des demandes:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.summary.total_requests}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Demandes traitées:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.summary.processed_requests}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Taux de succès:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.summary.success_rate}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Temps moyen:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.summary.average_processing_time}j</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Détails des Activités
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#f8f9ff', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Certificats émis:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.details.certificates_issued}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Certificats révoqués:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.details.certificates_revoked}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Entreprises auditées:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.details.companies_audited}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Problèmes de conformité:</Typography>
                      <Typography variant="h6" fontWeight="bold">{selectedReport.details.compliance_issues}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2c3e50' }}>
                  Recommandations
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#f8f9ff', borderRadius: 2 }}>
                  <List>
                    {selectedReport.recommendations.map((recommendation, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <Info sx={{ color: '#667eea' }} />
                          </ListItemIcon>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                        {index < selectedReport.recommendations.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
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
            onClick={() => selectedReport && handleDownloadReport(selectedReport.id)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Télécharger PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 