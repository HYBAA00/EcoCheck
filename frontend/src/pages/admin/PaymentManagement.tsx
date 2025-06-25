import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TablePagination,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MonetizationOnIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

interface Payment {
  id: number;
  company_name: string;
  ice_number: string;
  request_id: number;
  treatment_type: string;
  amount: number;
  fees: number;
  total_amount: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  payment_date?: string;
  created_at: string;
}

const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
  <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ color, mr: 1, fontSize: 30 }} />
        <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {typeof value === 'number' && title.includes('Montant') 
          ? `${value.toLocaleString()} MAD`
          : value
        }
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    payment_method: '',
    search: ''
  });

  // Mock data
  const mockPayments: Payment[] = [
    {
      id: 1,
      company_name: "EcoTech Solutions",
      ice_number: "002345678901234",
      request_id: 101,
      treatment_type: "Recyclage électronique",
      amount: 5000,
      fees: 500,
      total_amount: 5500,
      payment_method: "Carte bancaire",
      status: "completed",
      transaction_id: "TXN_2024_001",
      payment_date: "2024-01-15T10:30:00Z",
      created_at: "2024-01-15T09:00:00Z"
    },
    {
      id: 2,
      company_name: "GreenWaste Corp",
      ice_number: "002345678901235",
      request_id: 102,
      treatment_type: "Traitement déchets organiques",
      amount: 3000,
      fees: 300,
      total_amount: 3300,
      payment_method: "Virement bancaire",
      status: "pending",
      created_at: "2024-01-16T14:20:00Z"
    },
    {
      id: 3,
      company_name: "CleanEnergy Ltd",
      ice_number: "002345678901236",
      request_id: 103,
      treatment_type: "Gestion déchets industriels",
      amount: 7500,
      fees: 750,
      total_amount: 8250,
      payment_method: "Chèque",
      status: "failed",
      created_at: "2024-01-17T11:15:00Z"
    },
    {
      id: 4,
      company_name: "RecycleMax",
      ice_number: "002345678901237",
      request_id: 104,
      treatment_type: "Recyclage plastique",
      amount: 4200,
      fees: 420,
      total_amount: 4620,
      payment_method: "Carte bancaire",
      status: "completed",
      transaction_id: "TXN_2024_002",
      payment_date: "2024-01-18T16:45:00Z",
      created_at: "2024-01-18T15:30:00Z"
    },
    {
      id: 5,
      company_name: "WasteZero Inc",
      ice_number: "002345678901238",
      request_id: 105,
      treatment_type: "Compostage industriel",
      amount: 6000,
      fees: 600,
      total_amount: 6600,
      payment_method: "Virement bancaire",
      status: "pending",
      created_at: "2024-01-19T08:00:00Z"
    }
  ];

  const stats = {
    total_payments: mockPayments.length,
    total_amount: mockPayments.reduce((sum, p) => sum + p.total_amount, 0),
    pending_payments: mockPayments.filter(p => p.status === 'pending').length,
    completed_payments: mockPayments.filter(p => p.status === 'completed').length,
    pending_amount: mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.total_amount, 0),
    completed_amount: mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.total_amount, 0)
  };

  useEffect(() => {
    setPayments(mockPayments);
  }, []);

  const handlePaymentAction = (payment: Payment, actionType: string) => {
    setSelectedPayment(payment);
    setAction(actionType);
    setActionDialogOpen(true);
  };

  const executeAction = () => {
    if (!selectedPayment) return;

    if (action === 'validate') {
      setSuccess('Paiement validé avec succès');
      setPayments(prev => prev.map(p => 
        p.id === selectedPayment.id ? {...p, status: 'completed'} : p
      ));
    } else if (action === 'reject') {
      setSuccess('Paiement rejeté');
      setPayments(prev => prev.map(p => 
        p.id === selectedPayment.id ? {...p, status: 'failed'} : p
      ));
    } else if (action === 'refund') {
      setSuccess('Remboursement initié');
      setPayments(prev => prev.map(p => 
        p.id === selectedPayment.id ? {...p, status: 'refunded'} : p
      ));
    }
    
    setActionDialogOpen(false);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      case 'refunded': return 'Remboursé';
      default: return status;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !filters.search || 
      payment.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.ice_number.includes(filters.search);
    const matchesStatus = !filters.status || payment.status === filters.status;
    const matchesMethod = !filters.payment_method || payment.payment_method.toLowerCase().includes(filters.payment_method.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Gestion des Paiements
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={PaymentIcon} 
            title="Total Paiements" 
            value={stats.total_payments}
            subtitle="Toutes périodes"
            color="#1976d2" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={MonetizationOnIcon} 
            title="Montant Total" 
            value={stats.total_amount}
            subtitle="Revenus générés"
            color="#2e7d32" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={PendingIcon} 
            title="En Attente" 
            value={stats.pending_payments}
            subtitle={`${stats.pending_amount.toLocaleString()} MAD`}
            color="#ed6c02" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={CheckCircleIcon} 
            title="Complétés" 
            value={stats.completed_payments}
            subtitle={`${stats.completed_amount.toLocaleString()} MAD`}
            color="#2e7d32" 
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  label="Statut"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="completed">Complété</MenuItem>
                  <MenuItem value="failed">Échoué</MenuItem>
                  <MenuItem value="refunded">Remboursé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Méthode</InputLabel>
                <Select
                  value={filters.payment_method}
                  onChange={(e) => setFilters({...filters, payment_method: e.target.value})}
                  label="Méthode"
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="carte">Carte bancaire</MenuItem>
                  <MenuItem value="virement">Virement</MenuItem>
                  <MenuItem value="chèque">Chèque</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({
                  status: '',
                  payment_method: '',
                  search: ''
                })}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Liste des Paiements ({filteredPayments.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell>Demande</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Méthode</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{payment.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {payment.company_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ICE: {payment.ice_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Demande #{payment.request_id}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {payment.treatment_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {payment.total_amount.toLocaleString()} MAD
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Base: {payment.amount.toLocaleString()} + Frais: {payment.fees.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.payment_method}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(payment.status)}
                        size="small"
                        color={getStatusColor(payment.status)}
                        variant={payment.status === 'completed' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.payment_date 
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : new Date(payment.created_at).toLocaleDateString()
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedPayment(payment);
                          setDialogOpen(true);
                        }}
                        title="Voir détails"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {payment.status === 'pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={() => handlePaymentAction(payment, 'validate')}
                            title="Valider"
                            color="success"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handlePaymentAction(payment, 'reject')}
                            title="Rejeter"
                            color="error"
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      {payment.status === 'completed' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handlePaymentAction(payment, 'refund')}
                          title="Rembourser"
                          color="info"
                        >
                          <ReceiptIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPayments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails du Paiement #{selectedPayment?.id}
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Entreprise:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedPayment.company_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">ICE:</Typography>
                <Typography variant="body1">
                  {selectedPayment.ice_number}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Demande:</Typography>
                <Typography variant="body1">
                  #{selectedPayment.request_id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Type de traitement:</Typography>
                <Typography variant="body1">
                  {selectedPayment.treatment_type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Montant de base:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedPayment.amount.toLocaleString()} MAD
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Frais:</Typography>
                <Typography variant="body1">
                  {selectedPayment.fees.toLocaleString()} MAD
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {selectedPayment.total_amount.toLocaleString()} MAD
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Méthode de paiement:</Typography>
                <Typography variant="body1">
                  {selectedPayment.payment_method}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Statut:</Typography>
                <Chip
                  label={getStatusLabel(selectedPayment.status)}
                  color={getStatusColor(selectedPayment.status)}
                  variant="filled"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          Confirmer l'action
        </DialogTitle>
        <DialogContent>
          <Typography>
            {action === 'validate' && 
              'Êtes-vous sûr de vouloir valider ce paiement ?'
            }
            {action === 'reject' && 
              'Êtes-vous sûr de vouloir rejeter ce paiement ?'
            }
            {action === 'refund' && 
              'Êtes-vous sûr de vouloir initier un remboursement pour ce paiement ?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={executeAction} variant="contained" color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 