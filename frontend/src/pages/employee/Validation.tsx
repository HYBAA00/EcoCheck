import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Assignment,
  Gavel,
  Description,
  ExpandMore,
  Download,
  Visibility,
  CheckBox,
  CheckBoxOutlineBlank,
  Receipt,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

interface CertificationRequest {
  id: number;
  company_name: string;
  company_ice: string;
  treatment_type: string;
  status: string;
  submission_date: string;
  submitted_data: any;
  has_payment: boolean;
  form_submission: any;
  supporting_documents: string;
  company: {
    id: number;
    business_name: string;
    ice_number: string;
    rc_number: string;
    responsible_name: string;
    address: string;
    phone_company: string;
    email: string;
    company_size: string;
    activity_sector: string;
    creation_date: string;
  };
}

interface LawChecklistItem {
  id: number;
  law_reference: string;
  law_title: string;
  description: string;
  is_mandatory: boolean;
}

interface DynamicForm {
  id: number;
  treatment_type: string;
  form_fields: {
    fields: Array<{
      name: string;
      type: string;
      label: string;
      required: boolean;
      options?: string[];
    }>;
  };
}

const validationSteps = [
  'Vérification des documents',
  'Contrôle de conformité légale',
  'Validation technique',
  'Décision finale'
];

export default function ValidationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CertificationRequest | null>(null);
  const [lawChecklist, setLawChecklist] = useState<LawChecklistItem[]>([]);
  const [dynamicForm, setDynamicForm] = useState<DynamicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [validationData, setValidationData] = useState({
    documents_verified: false,
    legal_compliance: {} as { [key: number]: boolean },
    technical_validation: false,
    comments: '',
    decision: '', // 'approve' or 'reject'
  });
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveDialog, setApproveDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadValidationData();
    }
  }, [id]);

  const loadValidationData = async () => {
    try {
      setLoading(true);
      const requestId = parseInt(id!);
      
      console.log('🔄 Chargement des données de validation pour demande:', requestId);
      
      // Charger la demande
      const requestResponse = await employeeAPI.getRequest(requestId);
      setRequest(requestResponse.data);
      console.log('✅ Demande chargée:', requestResponse.data);
      
      // Charger la checklist des lois pour ce type de traitement
      try {
      const lawsResponse = await employeeAPI.getLawsByTreatmentType(requestResponse.data.treatment_type);
      setLawChecklist(lawsResponse.data);
        console.log('✅ Lois chargées:', lawsResponse.data);
      
      // Initialiser les données de validation
      const initialLegalCompliance: { [key: number]: boolean } = {};
      lawsResponse.data.forEach((law: LawChecklistItem) => {
        initialLegalCompliance[law.id] = false;
      });
      setValidationData(prev => ({
        ...prev,
        legal_compliance: initialLegalCompliance
      }));
      } catch (error: any) {
        console.warn('⚠️ Aucune checklist de lois trouvée pour le type:', requestResponse.data.treatment_type);
        setLawChecklist([]);
      }
      
      // Charger le formulaire dynamique
      try {
        const formResponse = await employeeAPI.getFormByTreatmentType(requestResponse.data.treatment_type);
        setDynamicForm(formResponse.data);
        console.log('✅ Formulaire dynamique chargé:', formResponse.data);
      } catch (error: any) {
        console.warn('⚠️ Aucun formulaire dynamique trouvé pour le type:', requestResponse.data.treatment_type);
        setDynamicForm(null);
      }
      
    } catch (error: any) {
      console.error('💥 Erreur lors du chargement des données:', error);
      console.error('Response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const handleLegalComplianceChange = (lawId: number, checked: boolean) => {
    setValidationData(prev => ({
      ...prev,
      legal_compliance: {
        ...prev.legal_compliance,
        [lawId]: checked
      }
    }));
  };

  const handleApprove = async () => {
    try {
      if (!request) return;
      
      console.log('🔄 Début de l\'approbation pour la demande:', request.id);
      
      // Utiliser la nouvelle API qui combine validation et génération de certificat
      console.log('📝 Approbation et génération du certificat...');
      const response = await employeeAPI.approveAndGenerate(request.id);
      console.log('✅ Réponse reçue:', response.data);
      
      // Afficher un message de succès
      alert(`Succès: ${response.data.message}`);
      
      setApproveDialog(false);
      navigate('/employee/requests');
    } catch (error: any) {
      console.error('💥 Erreur lors de l\'approbation:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      // Afficher l'erreur à l'utilisateur avec plus de détails
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Erreur lors de l'approbation: ${errorMessage}`);
    }
  };

  const handleReject = async () => {
    try {
      if (!request || !rejectReason.trim()) return;
      
      await employeeAPI.rejectRequest(request.id, { reason: rejectReason });
      
      setRejectDialog(false);
      navigate('/employee/requests');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0: return validationData.documents_verified;
      case 1: 
        const mandatoryLaws = lawChecklist.filter(law => law.is_mandatory);
        return mandatoryLaws.every(law => validationData.legal_compliance[law.id]);
      case 2: return validationData.technical_validation;
      case 3: return validationData.decision !== '';
      default: return false;
    }
  };

  const canProceedToNextStep = (step: number) => {
    return isStepComplete(step);
  };

  const allStepsComplete = () => {
    return validationSteps.every((_, index) => isStepComplete(index));
  };

  const handleViewCertificate = async () => {
    console.log('🚀 DÉBUT - handleViewCertificate appelée');
    
    if (!request) {
      console.error('❌ Aucune demande trouvée');
      alert('Erreur: Aucune demande trouvée');
      return;
    }

    try {
      console.log('🔄 Ouverture du certificat pour la demande:', request.id);
      
      // Ouvrir le certificat dans un nouvel onglet
      const certificateUrl = `/certificate/${request.id}`;
      console.log('🌐 URL du certificat:', certificateUrl);
      
      window.open(certificateUrl, '_blank');
      console.log('✅ Nouvel onglet ouvert avec succès');
      
    } catch (error: any) {
      console.error('💥 Erreur lors de l\'ouverture du certificat:', error);
      alert('Erreur lors de l\'ouverture du certificat: ' + error.message);
    }
    
    console.log('🏁 FIN - handleViewCertificate terminée');
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des données de validation...
        </Typography>
      </Box>
    );
  }

  if (!request) {
    return (
      <Alert severity="error">
        Demande non trouvée
      </Alert>
    );
  }



  // Si la demande est déjà approuvée, afficher une interface spéciale
  if (request.status === 'approved') {
  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
            <CheckCircle sx={{ mr: 1, color: '#4caf50', verticalAlign: 'middle' }} />
            Demande #{request.id.toString().padStart(3, '0')} - APPROUVÉE
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {request.company_name} - {request.treatment_type}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informations de la demande */}
          <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Validation Terminée
              </Typography>
                
                <Alert severity="success" sx={{ mb: 3 }}>
                  Cette demande a été approuvée avec succès. Toutes les étapes de validation ont été complétées.
                </Alert>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Entreprise"
                    secondary={request.company_name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="ICE"
                    secondary={request.company_ice}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type de traitement"
                    secondary={request.treatment_type}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date de soumission"
                    secondary={new Date(request.submission_date).toLocaleDateString('fr-FR')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                      primary="Statut"
                    secondary={
                      <Chip 
                          label="Approuvée"
                          color="success"
                        size="small"
                          icon={<CheckCircle />}
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Paiement"
                    secondary={
                      <Chip 
                        label={request.has_payment ? 'Payé' : 'En attente'}
                        color={request.has_payment ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions disponibles */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  Actions Disponibles
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                <Button
                  fullWidth
                      variant="contained"
                  startIcon={<Download />}
                      onClick={() => employeeAPI.downloadDocuments(request.id)}
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        mb: 2
                      }}
                >
                  Télécharger Documents
                </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Receipt />}
                      onClick={handleViewCertificate}
                      sx={{ borderColor: '#4caf50', color: '#4caf50', mb: 2 }}
                    >
                      Ouvrir le Certificat
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => navigate('/employee/requests')}
                    >
                      Retour aux Demandes
                    </Button>
                  </Grid>
                </Grid>
            </CardContent>
          </Card>

            {/* Historique rapide */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  Validation Complétée
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'green', mr: 1 }} />
                  <Typography variant="body2">Documents vérifiés</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'green', mr: 1 }} />
                  <Typography variant="body2">Conformité légale validée</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: 'green', mr: 1 }} />
                  <Typography variant="body2">Validation technique effectuée</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'green', mr: 1 }} />
                  <Typography variant="body2">Décision finale prise</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
          Validation de Demande #{request.id.toString().padStart(3, '0')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {request.company_name} - {request.treatment_type}
        </Typography>
      </Box>

      {/* Rapport d'Entreprise - Section complète */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#667eea', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Description sx={{ mr: 1 }} />
            Rapport d'Entreprise
          </Typography>
          
          <Grid container spacing={3}>
            {/* Informations générales */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#f8f9ff' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  Informations Générales
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Raison sociale"
                      secondary={request.company?.business_name || request.company_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Numéro ICE"
                      secondary={request.company?.ice_number || request.company_ice}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Numéro RC"
                      secondary={request.company?.rc_number || 'Non disponible'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Responsable"
                      secondary={request.company?.responsible_name || 'Non disponible'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Taille de l'entreprise"
                      secondary={request.company?.company_size || 'Non spécifiée'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Secteur d'activité"
                      secondary={request.company?.activity_sector || 'Non spécifié'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Coordonnées et demande */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#fff8e1' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  Coordonnées & Demande
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Adresse"
                      secondary={request.company?.address || 'Non disponible'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Téléphone"
                      secondary={request.company?.phone_company || 'Non disponible'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={request.company?.email || 'Non disponible'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Type de traitement demandé"
                      secondary={request.treatment_type}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Date de soumission"
                      secondary={new Date(request.submission_date).toLocaleDateString('fr-FR')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Statut du paiement"
                      secondary={
                        <Chip 
                          label={request.has_payment ? 'Payé' : 'En attente'}
                          color={request.has_payment ? 'success' : 'warning'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Données techniques soumises */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#e8f5e8' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  Données Techniques Soumises
              </Typography>
              
              {request.form_submission ? (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography fontWeight="bold">
                        📋 Formulaire de soumission ({request.treatment_type})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ bgcolor: '#ffffff', p: 2, borderRadius: 1 }}>
                        {Object.entries(request.form_submission.form_data || {}).map(([key, value]) => (
                          <Box key={key} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ) : request.submitted_data && Object.keys(request.submitted_data).length > 0 ? (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography fontWeight="bold">
                        📄 Données brutes soumises
                      </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                      <Box sx={{ bgcolor: '#ffffff', p: 2, borderRadius: 1 }}>
                        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {JSON.stringify(request.submitted_data, null, 2)}
                    </pre>
                      </Box>
                  </AccordionDetails>
                </Accordion>
              ) : (
                  <Alert severity="warning">
                    Aucune donnée technique n'a été soumise avec cette demande
                  </Alert>
                )}

                {request.supporting_documents && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      startIcon={<Download />}
                      variant="contained"
                      color="primary"
                      onClick={() => window.open(request.supporting_documents, '_blank')}
                    >
                      📎 Télécharger Documents Justificatifs
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Résumé de la demande */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Résumé de la Demande
                </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="N° Demande"
                    secondary={`#${request.id.toString().padStart(3, '0')}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Entreprise"
                    secondary={request.company?.business_name || request.company_name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type de traitement"
                    secondary={request.treatment_type}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Statut actuel"
                    secondary={
                      <Chip 
                        label={request.status === 'under_review' ? 'En révision' : request.status}
                        color="warning"
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Processus de validation */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Processus de Validation
              </Typography>

              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Étape 1: Vérification des documents */}
                <Step>
                  <StepLabel>
                    Vérification des Documents
                    {isStepComplete(0) && <CheckCircle sx={{ color: 'green', ml: 1 }} />}
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vérifiez que tous les documents requis ont été fournis et sont lisibles.
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={validationData.documents_verified}
                            onChange={(e) => setValidationData(prev => ({
                              ...prev,
                              documents_verified: e.target.checked
                            }))}
                          />
                        }
                        label="Documents vérifiés et conformes"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleStepChange(1)}
                        disabled={!canProceedToNextStep(0)}
                        sx={{ mr: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      >
                        Continuer
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                {/* Étape 2: Conformité légale */}
                <Step>
                  <StepLabel>
                    Contrôle de Conformité Légale
                    {isStepComplete(1) && <CheckCircle sx={{ color: 'green', ml: 1 }} />}
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vérifiez la conformité avec les lois et réglementations applicables.
                      </Typography>
                      
                      {lawChecklist.map((law) => (
                        <Paper key={law.id} sx={{ p: 2, mb: 2, bgcolor: '#f8f9ff' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={validationData.legal_compliance[law.id] || false}
                                onChange={(e) => handleLegalComplianceChange(law.id, e.target.checked)}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {law.law_reference} - {law.law_title}
                                  {law.is_mandatory && (
                                    <Chip label="Obligatoire" size="small" color="error" sx={{ ml: 1 }} />
                                  )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {law.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      ))}
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleStepChange(2)}
                        disabled={!canProceedToNextStep(1)}
                        sx={{ mr: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      >
                        Continuer
                      </Button>
                      <Button onClick={() => handleStepChange(0)}>
                        Retour
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                {/* Étape 3: Validation technique */}
                <Step>
                  <StepLabel>
                    Validation Technique
                    {isStepComplete(2) && <CheckCircle sx={{ color: 'green', ml: 1 }} />}
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vérifiez les aspects techniques de la demande (capacités, équipements, processus).
                      </Typography>
                      
                      {/* Affichage du formulaire dynamique */}
                      {dynamicForm && (
                        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9ff' }}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                            Critères techniques pour {dynamicForm.treatment_type}
                          </Typography>
                          {dynamicForm.form_fields.fields.map((field, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                              • {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                            </Typography>
                          ))}
                        </Paper>
                      )}
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={validationData.technical_validation}
                            onChange={(e) => setValidationData(prev => ({
                              ...prev,
                              technical_validation: e.target.checked
                            }))}
                          />
                        }
                        label="Validation technique effectuée et conforme"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleStepChange(3)}
                        disabled={!canProceedToNextStep(2)}
                        sx={{ mr: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      >
                        Continuer
                      </Button>
                      <Button onClick={() => handleStepChange(1)}>
                        Retour
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                {/* Étape 4: Décision finale */}
                <Step>
                  <StepLabel>
                    Décision Finale
                    {isStepComplete(3) && <CheckCircle sx={{ color: 'green', ml: 1 }} />}
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Prenez votre décision finale basée sur l'évaluation complète.
                      </Typography>
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Commentaires (optionnel)"
                        value={validationData.comments}
                        onChange={(e) => setValidationData(prev => ({
                          ...prev,
                          comments: e.target.value
                        }))}
                        sx={{ mb: 3 }}
                      />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => setApproveDialog(true)}
                            disabled={!allStepsComplete()}
                          >
                            Approuver et Générer Certificat
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => setRejectDialog(true)}
                          >
                            Rejeter la Demande
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Button onClick={() => handleStepChange(2)}>
                        Retour
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog d'approbation */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)}>
        <DialogTitle>Confirmer l'Approbation</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Voulez-vous approuver cette demande et générer automatiquement le certificat ?
          </Typography>
          <Alert severity="success">
            Cette action approuvera définitivement la demande et générera le certificat de conformité.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleApprove} 
            variant="contained" 
            color="success"
            startIcon={<CheckCircle />}
          >
            Approuver et Générer Certificat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rejeter la Demande</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Veuillez indiquer la raison du rejet. Un rapport de refus sera automatiquement généré.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Raison du rejet *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Décrivez en détail les raisons du rejet..."
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cette action rejettera définitivement la demande et enverra un rapport de refus à l'entreprise.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            startIcon={<Cancel />}
            disabled={!rejectReason.trim()}
          >
            Rejeter la Demande
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
} 