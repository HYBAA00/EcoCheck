import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

export default function Reports() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [auditStats, setAuditStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportParams, setExportParams] = useState({
    export_type: 'certification_requests',
    format: 'csv',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, metricsRes, statsRes] = await Promise.all([
        adminAPI.getAuditLogs({ limit: 50 }),
        adminAPI.getSystemMetrics({ limit: 30 }),
        adminAPI.getAuditStats(),
      ]);

      console.log('Audit stats response:', statsRes.data);
      console.log('Logs response:', logsRes.data);
      console.log('Metrics response:', metricsRes.data);

      setAuditLogs(logsRes.data.results || logsRes.data);
      setSystemMetrics(metricsRes.data.results || metricsRes.data);
      setAuditStats(statsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await adminAPI.exportData(exportParams);
      setSuccess('Export effectué avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Icon sx={{ color, mr: 1, fontSize: 30 }} />
          <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Rapports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AssessmentIcon}
            title="Actions Audit"
            value={auditStats.total_actions || 0}
            subtitle="Total des actions"
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUpIcon}
            title="Actions Réussies"
            value={auditStats.successful_actions || 0}
            subtitle={`${(auditStats.success_rate || 0).toFixed(1)}% de succès`}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={BarChartIcon}
            title="Utilisateurs Actifs"
            value={auditStats.unique_users || 0}
            subtitle="Dernières 24h"
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PieChartIcon}
            title="Sessions Actives"
            value={auditStats.active_sessions || 0}
            subtitle="En cours"
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Export Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Exportation de Données
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de données</InputLabel>
                <Select
                  value={exportParams.export_type}
                  onChange={(e) => setExportParams({...exportParams, export_type: e.target.value})}
                  label="Type de données"
                >
                  <MenuItem value="certification_requests">Demandes de certification</MenuItem>
                  <MenuItem value="certificates">Certificats</MenuItem>
                  <MenuItem value="payments">Paiements</MenuItem>
                  <MenuItem value="users">Utilisateurs</MenuItem>
                  <MenuItem value="audit_logs">Logs d'audit</MenuItem>
                  <MenuItem value="system_metrics">Métriques système</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Format</InputLabel>
                <Select
                  value={exportParams.format}
                  onChange={(e) => setExportParams({...exportParams, format: e.target.value})}
                  label="Format"
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Date début"
                type="date"
                value={exportParams.date_from}
                onChange={(e) => setExportParams({...exportParams, date_from: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Date fin"
                type="date"
                value={exportParams.date_to}
                onChange={(e) => setExportParams({...exportParams, date_to: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={loading}
              >
                Exporter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Journal d'Audit Récent
          </Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Horodatage</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {log.user_email || 'Système'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.success ? 'Succès' : 'Échec'}
                        size="small" 
                        color={log.success ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {log.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
} 