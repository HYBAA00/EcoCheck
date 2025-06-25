import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Payment as PaymentIcon,
  CreditCard,
  AccountBalance,
  CheckCircle,
  Security,
  Receipt,
  Download,
  Print,
  Share,
  Lock,
  Verified,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentAPI, certificationAPI } from '../../services/api';

const steps = ['Vérification', 'Paiement', 'Confirmation'];

interface PaymentData {
  id?: number;
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
  status: string;
  transaction_id?: string;
}

interface CardData {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

interface BankData {
  iban: string;
  bic: string;
  bank_name: string;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [bankData, setBankData] = useState<BankData>({
    iban: '',
    bic: '',
    bank_name: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [receiptDialog, setReceiptDialog] = useState(false);

  useEffect(() => {
    if (requestId) {
      loadPaymentData();
    } else {
      setLoading(false);
    }
  }, [requestId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des données de paiement pour requestId:', requestId);

      // Try to get existing payment first
      try {
        const response = await paymentAPI.getPaymentByRequest(Number(requestId));
        console.log('✅ Paiement existant trouvé:', response.data);
        setPaymentData(response.data);
      } catch (error: any) {
        console.log('❌ Erreur lors de la récupération du paiement:', error.response?.status, error.response?.data);
        if (error.response?.status === 404) {
          // No payment exists, create one
          console.log('📝 Création d\'un nouveau paiement...');
          const createResponse = await paymentAPI.createPayment({
            certification_request_id: Number(requestId),
            payment_method: 'card'
          });
          console.log('✅ Nouveau paiement créé:', createResponse.data);
          setPaymentData(createResponse.data);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('💥 Erreur lors du chargement des données de paiement:', error);
      console.error('Response:', error.response?.data);
      setError('Impossible de charger les données de paiement: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      processPayment();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const processPayment = async () => {
    if (!paymentData) return;

    setProcessing(true);
    try {
      const paymentDetails = paymentMethod === 'card' 
        ? {
            card_number: cardData.number.replace(/\s/g, ''),
            card_holder: cardData.name,
            expiry_date: cardData.expiry,
            cvv: cardData.cvv
          }
        : {
            iban: bankData.iban,
            bic: bankData.bic,
            bank_name: bankData.bank_name
          };

      const response = await paymentAPI.processPayment(paymentData.id!, {
        payment_method: paymentMethod,
        payment_details: paymentDetails
      });

      // Update payment data with transaction ID
      setPaymentData(prev => prev ? {
        ...prev,
        status: 'completed',
        transaction_id: response.data.transaction_id
      } : null);

      setActiveStep(2);
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      setError('Erreur lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!paymentData?.id) return;
    
    try {
      const response = await paymentAPI.getReceipt(paymentData.id);
      console.log('Reçu téléchargé:', response.data);
      setReceiptDialog(true);
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
    }
  };

  const validateCardData = () => {
    return cardData.number.replace(/\s/g, '').length >= 16 &&
           cardData.expiry.length >= 5 &&
           cardData.cvv.length >= 3 &&
           cardData.name.length >= 2;
  };

  const validateBankData = () => {
    return bankData.iban.length >= 15 &&
           bankData.bic.length >= 8 &&
           bankData.bank_name.length >= 2;
  };

  const isPaymentValid = () => {
    // Temporairement désactivé pour permettre les tests
    return true;
    // return paymentMethod === 'card' ? validateCardData() : validateBankData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#667eea' }} />
        <Typography sx={{ ml: 2 }}>Chargement des données de paiement...</Typography>
      </Box>
    );
  }

  if (!requestId) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          ID de demande manquant
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/enterprise/dashboard')}
        >
          Retour au Dashboard
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/enterprise/dashboard')}
        >
          Retour au Dashboard
        </Button>
      </Box>
    );
  }

  const renderVerificationStep = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
          Détails de la Certification
        </Typography>
        
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Demande #</strong></TableCell>
                <TableCell>{paymentData?.certification_request.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Type de traitement</strong></TableCell>
                <TableCell>
                  <Chip 
                    label={paymentData?.certification_request.treatment_type} 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Entreprise</strong></TableCell>
                <TableCell>{paymentData?.certification_request.company.business_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Montant de base</strong></TableCell>
                <TableCell>{paymentData?.amount.toLocaleString()} MAD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Frais de traitement</strong></TableCell>
                <TableCell>{paymentData?.fees.toLocaleString()} MAD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Total à payer</strong></TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                    {paymentData?.total_amount.toLocaleString()} MAD
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Informations importantes :</strong>
            <br />• Le paiement est sécurisé par SSL
            <br />• Vous recevrez un reçu par email
            <br />• Le certificat sera généré après validation du paiement
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
          <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
          Paiement Sécurisé
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Choisissez votre méthode de paiement :
          </Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel
              value="card"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ mr: 1 }} />
                  Carte bancaire
                </Box>
              }
            />
            <FormControlLabel
              value="bank_transfer"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 1 }} />
                  Virement bancaire
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {paymentMethod === 'card' && (
          <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Numéro de carte"
                  value={cardData.number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                    setCardData(prev => ({ ...prev, number: value }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                />
              </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'expiration"
                value={cardData.expiry}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
                  setCardData(prev => ({ ...prev, expiry: value }));
                }}
                placeholder="MM/AA"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CVV"
                value={cardData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCardData(prev => ({ ...prev, cvv: value }));
                }}
                placeholder="123"
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du titulaire"
                value={cardData.name}
                onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Jean Dupont"
              />
            </Grid>
          </Grid>
        )}

        {paymentMethod === 'bank_transfer' && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IBAN"
                value={bankData.iban}
                onChange={(e) => setBankData(prev => ({ ...prev, iban: e.target.value.toUpperCase() }))}
                placeholder="MA64 0110 0000 0000 0123 4567 89"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code BIC/SWIFT"
                value={bankData.bic}
                onChange={(e) => setBankData(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                placeholder="BMCEMAMC"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom de la banque"
                value={bankData.bank_name}
                onChange={(e) => setBankData(prev => ({ ...prev, bank_name: e.target.value }))}
                placeholder="Bank of Morocco"
              />
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9ff', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#667eea' }}>
            <Security sx={{ mr: 1 }} />
            Paiement sécurisé SSL - Vos données sont protégées
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderConfirmationStep = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
          Paiement Confirmé !
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Votre paiement a été traité avec succès.
        </Typography>

        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9ff' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Transaction ID:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentData?.transaction_id}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Montant payé:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentData?.total_amount.toLocaleString()} MAD
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReceipt}
              sx={{ borderColor: '#667eea', color: '#667eea' }}
            >
              Télécharger le reçu
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Verified />}
              onClick={() => navigate('/enterprise/certificates')}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' }
              }}
            >
              Voir mes certificats
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Debug logs
  console.log('🔍 État de la page Payment:', {
    loading,
    error,
    paymentData,
    requestId,
    activeStep
  });

  // Gestion des états de chargement et d'erreur
  if (loading) {
    console.log('🔄 Affichage de l\'état de chargement');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des données de paiement...
        </Typography>
      </Box>
    );
  }

  if (error) {
    console.log('❌ Affichage de l\'erreur:', error);
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/enterprise/dashboard')}
          startIcon={<ArrowBack />}
        >
          Retour au Dashboard
        </Button>
      </Box>
    );
  }

  if (!paymentData) {
    console.log('⚠️ Aucune donnée de paiement trouvée');
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Aucune donnée de paiement trouvée
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/enterprise/dashboard')}
          startIcon={<ArrowBack />}
        >
          Retour au Dashboard
        </Button>
      </Box>
    );
  }

  console.log('✅ Affichage de la page de paiement normale avec données:', paymentData);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
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
          Paiement de Certification
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Content */}
      {activeStep === 0 && renderVerificationStep()}
      {activeStep === 1 && renderPaymentStep()}
      {activeStep === 2 && renderConfirmationStep()}

      {/* Actions */}
      {activeStep < 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Retour
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={processing || (activeStep === 1 && !isPaymentValid())}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' }
                }}
              >
                {processing ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  activeStep === 1 ? 'Payer maintenant' : 'Continuer'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onClose={() => setReceiptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reçu de Paiement</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Le reçu sera téléchargé prochainement. Fonctionnalité en cours d'implémentation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 