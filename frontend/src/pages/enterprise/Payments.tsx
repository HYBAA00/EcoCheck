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
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Payment,
  AttachMoney,
  Receipt,
  Download,
  Refresh,
  Search,
  FilterList,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../services/api';

interface PaymentData {
  id: number;
  certification_request: {
    id: number;
    treatment_type: string;
    company: {
      business_name: string;
    };
  };
  amount: number;
  fees: number;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transaction_id: string;
  payment_date: string;
  created_at: string;
}

interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalTransactions: number;
  averagePayment: number;
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPaid: 0,
    totalPending: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    totalTransactions: 0,
    averagePayment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsResponse, statsResponse] = await Promise.all([
        paymentAPI.getPayments(),
        paymentAPI.getEnterpriseStats(),
      ]);

      setPayments(paymentsResponse.data);
      
      // S'assurer que toutes les propriétés sont définies avec des valeurs par défaut
      const statsData = statsResponse.data;
      setStats({
        totalPaid: statsData.totalPaid || 0,
        totalPending: statsData.totalPending || 0,
        completedPayments: statsData.completedPayments || 0,
        pendingPayments: statsData.pendingPayments || 0,
        failedPayments: statsData.failedPayments || 0,
        refundedPayments: statsData.refundedPayments || 0,
        totalTransactions: statsData.totalTransactions || 0,
        averagePayment: statsData.averagePayment || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      setError('Impossible de charger les données des paiements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échec';
      case 'refunded': return 'Remboursé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'bank_transfer': return 'Virement bancaire';
      case 'cash': return 'Espèces';
      case 'check': return 'Chèque';
      default: return method;
    }
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      const response = await paymentAPI.getReceipt(paymentId);
      // Créer un PDF ou afficher les détails du reçu
      console.log('Reçu:', response.data);
      // TODO: Implémenter la génération/téléchargement du reçu
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.certification_request.treatment_type
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#667eea' }} />
        <Typography sx={{ ml: 2 }}>Chargement des paiements...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/enterprise/dashboard')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h4" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Gestion des Paiements
          </Typography>
        </Box>
        
        <Button
          startIcon={<Refresh />}
          onClick={loadPaymentsData}
          variant="outlined"
          sx={{ borderColor: '#667eea', color: '#667eea' }}
        >
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <AttachMoney sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {(stats.totalPaid || 0).toLocaleString()} MAD
              </Typography>
              <Typography variant="body2">
                Total Payé
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
              <Receipt sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.completedPayments}
              </Typography>
              <Typography variant="body2">
                Paiements Réussis
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
              <Payment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.pendingPayments}
              </Typography>
              <Typography variant="body2">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {(stats.averagePayment || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Paiement Moyen (MAD)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par type ou transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#667eea', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label="Statut"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="completed">Payé</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="failed">Échec</MenuItem>
                  <MenuItem value="refunded">Remboursé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des paiements */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
            Historique des Paiements ({filteredPayments.length})
          </Typography>
          
          {filteredPayments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Payment sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun paiement trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {payments.length === 0 
                  ? "Vous n'avez effectué aucun paiement pour le moment."
                  : "Aucun paiement ne correspond aux critères de recherche."}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Transaction</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Type de traitement</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Méthode</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} sx={{ '&:hover': { backgroundColor: '#f8f9ff' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {payment.transaction_id || `PAY-${payment.id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{payment.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.certification_request.treatment_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Demande #{payment.certification_request.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {(payment.total_amount || 0).toLocaleString()} MAD
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(payment.amount || 0).toLocaleString()} + {(payment.fees || 0).toLocaleString()} (frais)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getPaymentMethodText(payment.payment_method)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(payment.status)}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.payment_date 
                            ? new Date(payment.payment_date).toLocaleDateString('fr-FR')
                            : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Créé: {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {payment.status === 'completed' && (
                            <Tooltip title="Télécharger le reçu">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownloadReceipt(payment.id)}
                                sx={{ color: '#4caf50' }}
                              >
                                <Download />
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
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 