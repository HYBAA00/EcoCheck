import React, { useState } from 'react';
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
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  FileDownload,
  GetApp,
  DateRange,
  Settings,
  VerifiedUser,
  Assignment,
  Assessment,
  Business,
  CheckCircle,
  Schedule,
  Info,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../services/api';

interface ExportConfig {
  startDate: string;
  endDate: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  dataTypes: {
    certificates: boolean;
    requests: boolean;
    audit: boolean;
    companies: boolean;
    payments: boolean;
  };
  filters: {
    status: string;
    treatmentType: string;
    companySize: string;
  };
  includeDetails: boolean;
  includeStatistics: boolean;
  includeCharts: boolean;
}

export default function ExportHistorical() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ExportConfig>({
    startDate: '',
    endDate: '',
    format: 'pdf',
    dataTypes: {
      certificates: true,
      requests: true,
      audit: false,
      companies: false,
      payments: false,
    },
    filters: {
      status: '',
      treatmentType: '',
      companySize: '',
    },
    includeDetails: true,
    includeStatistics: true,
    includeCharts: true,
  });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleConfigChange = (field: keyof ExportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDataTypeChange = (type: keyof ExportConfig['dataTypes'], checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      dataTypes: { ...prev.dataTypes, [type]: checked }
    }));
  };

  const handleFilterChange = (filter: keyof ExportConfig['filters'], value: string) => {
    setConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, [filter]: value }
    }));
  };

  const handleExportAll = async () => {
    if (!config.startDate || !config.endDate) {
      setError('Veuillez sélectionner une période pour l\'export');
      return;
    }

    const selectedTypes = Object.entries(config.dataTypes)
      .filter(([_, selected]) => selected)
      .map(([type, _]) => type);

    if (selectedTypes.length === 0) {
      setError('Veuillez sélectionner au moins un type de données à exporter');
      return;
    }

    try {
      setExporting(true);
      setError(null);
      setSuccess(null);

      await authorityAPI.exportHistoricalData({
        start_date: config.startDate,
        end_date: config.endDate,
        format: config.format,
        data_types: selectedTypes,
        filters: config.filters,
        include_details: config.includeDetails,
        include_statistics: config.includeStatistics,
        include_charts: config.includeCharts,
      });

      setSuccess('Export terminé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError('Impossible d\'exporter les données');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSpecific = async (type: string) => {
    if (!config.startDate || !config.endDate) {
      setError('Veuillez sélectionner une période pour l\'export');
      return;
    }

    try {
      setExporting(true);
      setError(null);
      setSuccess(null);

      await authorityAPI.exportHistoricalData({
        start_date: config.startDate,
        end_date: config.endDate,
        format: config.format,
        data_types: [type],
        filters: config.filters,
        include_details: config.includeDetails,
        include_statistics: config.includeStatistics,
        include_charts: config.includeCharts,
      });

      setSuccess(`Export ${type} terminé avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError(`Impossible d\'exporter les données ${type}`);
    } finally {
      setExporting(false);
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'certificates': return <VerifiedUser sx={{ color: '#4CAF50' }} />;
      case 'requests': return <Assignment sx={{ color: '#2196F3' }} />;
      case 'audit': return <Assessment sx={{ color: '#FF9800' }} />;
      case 'companies': return <Business sx={{ color: '#9C27B0' }} />;
      case 'payments': return <GetApp sx={{ color: '#607D8B' }} />;
      default: return <Info sx={{ color: '#667eea' }} />;
    }
  };

  const getDataTypeLabel = (type: string) => {
    switch (type) {
      case 'certificates': return 'Certificats';
      case 'requests': return 'Demandes';
      case 'audit': return 'Audit';
      case 'companies': return 'Entreprises';
      case 'payments': return 'Paiements';
      default: return type;
    }
  };

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
            <FileDownload sx={{ mr: 2, fontSize: 40 }} />
            Export des Historiques
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Exportation complète des données historiques de la plateforme
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {exporting && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GetApp sx={{ mr: 2, color: '#667eea' }} />
              <Typography variant="h6">Export en cours...</Typography>
            </Box>
            <LinearProgress sx={{ 
              backgroundColor: '#e3f2fd',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }
            }} />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Configuration de l'export */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 4,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Settings sx={{ mr: 2, color: '#667eea' }} />
                Configuration de l'Export
              </Typography>

              {/* Période */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Période d'Export
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date de début"
                      type="date"
                      value={config.startDate}
                      onChange={(e) => handleConfigChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date de fin"
                      type="date"
                      value={config.endDate}
                      onChange={(e) => handleConfigChange('endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Types de données */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  Types de Données à Exporter
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(config.dataTypes).map(([type, selected]) => (
                    <Grid item xs={12} sm={6} md={4} key={type}>
                      <Paper sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        border: selected ? '2px solid #667eea' : '1px solid #e0e0e0',
                        backgroundColor: selected ? '#f8f9ff' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleDataTypeChange(type as keyof ExportConfig['dataTypes'], !selected)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getDataTypeIcon(type)}
                          <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                            {getDataTypeLabel(type)}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selected}
                              onChange={(e) => handleDataTypeChange(type as keyof ExportConfig['dataTypes'], e.target.checked)}
                              sx={{ color: '#667eea' }}
                            />
                          }
                          label="Inclure"
                          sx={{ ml: 0 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Filtres */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                  Filtres d'Export
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={config.filters.status}
                        label="Statut"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">Tous les statuts</MenuItem>
                        <MenuItem value="approved">Approuvé</MenuItem>
                        <MenuItem value="pending">En attente</MenuItem>
                        <MenuItem value="rejected">Rejeté</MenuItem>
                        <MenuItem value="active">Actif</MenuItem>
                        <MenuItem value="expired">Expiré</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Type de traitement</InputLabel>
                      <Select
                        value={config.filters.treatmentType}
                        label="Type de traitement"
                        onChange={(e) => handleFilterChange('treatmentType', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">Tous les types</MenuItem>
                        <MenuItem value="tri">Tri</MenuItem>
                        <MenuItem value="recycling">Recyclage</MenuItem>
                        <MenuItem value="reuse">Réutilisation</MenuItem>
                        <MenuItem value="disposal">Élimination</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Taille d'entreprise</InputLabel>
                      <Select
                        value={config.filters.companySize}
                        label="Taille d'entreprise"
                        onChange={(e) => handleFilterChange('companySize', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">Toutes les tailles</MenuItem>
                        <MenuItem value="small">Petite (1-50)</MenuItem>
                        <MenuItem value="medium">Moyenne (51-250)</MenuItem>
                        <MenuItem value="large">Grande (250+)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Format et options */}
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                      Format d'Export
                    </FormLabel>
                    <RadioGroup
                      value={config.format}
                      onChange={(e) => handleConfigChange('format', e.target.value)}
                    >
                      <FormControlLabel value="pdf" control={<Radio sx={{ color: '#667eea' }} />} label="PDF" />
                      <FormControlLabel value="excel" control={<Radio sx={{ color: '#667eea' }} />} label="Excel" />
                      <FormControlLabel value="csv" control={<Radio sx={{ color: '#667eea' }} />} label="CSV" />
                      <FormControlLabel value="json" control={<Radio sx={{ color: '#667eea' }} />} label="JSON" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                    Options d'Export
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.includeDetails}
                        onChange={(e) => handleConfigChange('includeDetails', e.target.checked)}
                        sx={{ color: '#667eea' }}
                      />
                    }
                    label="Inclure les détails complets"
                    sx={{ display: 'block', mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.includeStatistics}
                        onChange={(e) => handleConfigChange('includeStatistics', e.target.checked)}
                        sx={{ color: '#667eea' }}
                      />
                    }
                    label="Inclure les statistiques"
                    sx={{ display: 'block', mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.includeCharts}
                        onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                        sx={{ color: '#667eea' }}
                      />
                    }
                    label="Inclure les graphiques"
                    sx={{ display: 'block' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions d'export */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            mb: 3
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <GetApp sx={{ mr: 2, color: '#667eea' }} />
                Actions d'Export
              </Typography>

              {/* Export individuel */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
                Export par Type
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VerifiedUser />}
                    onClick={() => handleExportSpecific('certificates')}
                    disabled={exporting}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: '0.8rem'
                    }}
                  >
                    Certificats
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={() => handleExportSpecific('requests')}
                    disabled={exporting}
                    sx={{
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: '0.8rem'
                    }}
                  >
                    Demandes
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assessment />}
                    onClick={() => handleExportSpecific('audit')}
                    disabled={exporting}
                    sx={{
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: '0.8rem'
                    }}
                  >
                    Audit
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Business />}
                    onClick={() => handleExportSpecific('companies')}
                    disabled={exporting}
                    sx={{
                      background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      fontSize: '0.8rem'
                    }}
                  >
                    Entreprises
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Export complet */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<GetApp />}
                onClick={handleExportAll}
                disabled={exporting}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  borderRadius: 3,
                  py: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {exporting ? 'Export en cours...' : 'Tout Exporter'}
              </Button>
            </CardContent>
          </Card>

          {/* Informations sur l'export */}
          <Card sx={{ 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Info sx={{ mr: 2, color: '#667eea' }} />
                Informations
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Données sécurisées"
                    secondary="Tous les exports sont chiffrés"
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule sx={{ color: '#FF9800', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Traitement asynchrone"
                    secondary="Les gros exports sont traités en arrière-plan"
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: '#f44336', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Limite de taille"
                    secondary="Exports limités à 100MB par fichier"
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 