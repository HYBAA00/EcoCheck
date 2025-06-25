import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  Divider,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Nature,
  Business,
  Upload,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Delete as DeleteIcon,
  Recycling,
  LocalShipping,
  Sort,
  FactoryOutlined,
  Send,
} from '@mui/icons-material';
import { certificationAPI } from '../../services/api';

// Types de traitement disponibles
const treatmentTypes = [
  {
    id: 'collecte',
    label: 'Collecte',
    icon: <LocalShipping />,
    description: 'Ramassage et transport vers une installation autorisée',
    color: '#2196f3'
  },
  {
    id: 'tri',
    label: 'Tri',
    icon: <Sort />,
    description: 'Séparation et classification des DEEE par catégorie',
    color: '#ff9800'
  },
  {
    id: 'recyclage',
    label: 'Recyclage',
    icon: <Recycling />,
    description: 'Traitement, valorisation et élimination des DEEE',
    color: '#4caf50'
  }
];

// Lois applicables par type de traitement
const lawsByTreatment = {
  collecte: [
    { id: 'art2', text: 'Art. 2 - Définition de la collecte comme opération de ramassage, tri, transport vers une installation autorisée' },
    { id: 'art4', text: 'Art. 4 - Obligation du producteur de fournir des informations sur les déchets générés à l\'administration' },
    { id: 'art19', text: 'Art. 19 - Organisation de la collecte par les communes ; possibilité d\'instaurer une collecte sélective' },
    { id: 'art20', text: 'Art. 20 - Possibilité de déléguer la gestion à des opérateurs agréés (via conventions)' },
    { id: 'art21', text: 'Art. 21 - Obligation pour les collecteurs de respecter les normes techniques et de tenir un registre' },
    { id: 'art22', text: 'Art. 22 - La collecte de déchets dangereux (DEEE) nécessite une autorisation préalable' }
  ],
  tri: [
    { id: 'art2_tri', text: 'Art. 2 - Le tri est inclus dans la définition de la collecte (séparation préalable avant transport)' },
    { id: 'art4_tri', text: 'Art. 4 - Obligation des producteurs de concevoir des produits favorisant le tri (réduction de la nocivité, démontrabilité)' },
    { id: 'art19_tri', text: 'Art. 19 - Autorisation de mise en place d\'une collecte différenciée par type de déchets, impliquant un tri à la source' },
    { id: 'art21_tri', text: 'Art. 21 - Obligation de consigner les opérations de tri dans le registre réglementaire' }
  ],
  recyclage: [
    { id: 'art3', text: 'Art. 3 - But général : réduction, valorisation, recyclage des déchets pour préserver l\'environnement' },
    { id: 'art21_rec', text: 'Art. 21 - Suivi obligatoire de toutes les opérations de traitement, valorisation, élimination dans un registre' },
    { id: 'art23', text: 'Art. 23 - Le traitement des déchets dangereux doit être fait dans des installations spécialisées autorisées' },
    { id: 'art24', text: 'Art. 24 - Le stockage temporaire est possible dans des conditions strictes (sécurité, durée, autorisation)' },
    { id: 'art25', text: 'Art. 25 - L\'exportation ou importation des déchets est soumise aux conventions internationales et à l\'autorisation nationale' },
    { id: 'art41_46', text: 'Art. 41-46 - Sanctions administratives et pénales en cas de non-respect des normes de traitement ou recyclage' }
  ]
};

const steps = ['Informations Entreprise', 'Type de Traitement', 'Conformité Légale', 'Documents', 'Soumission'];

interface FormData {
  // Informations entreprise
  companyName: string;
  ice: string;
  rc: string;
  address: string;
  phone: string;
  email: string;
  legalRepresentative: string;
  
  // Type de traitement
  treatmentType: string;
  
  // Lois cochées
  selectedLaws: string[];
  
  // Documents
  documents: File[];
  
  // Description
  description: string;
}

export default function CertificationForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    // Informations entreprise
    companyName: '',
    ice: '',
    rc: '',
    address: '',
    phone: '',
    email: '',
    legalRepresentative: '',
    
    // Type de traitement
    treatmentType: '',
    
    // Lois cochées
    selectedLaws: [],
    
    // Documents
    documents: [],
    
    // Description
    description: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLawToggle = (lawId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedLaws: prev.selectedLaws.includes(lawId)
        ? prev.selectedLaws.filter(id => id !== lawId)
        : [...prev.selectedLaws, lawId]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validation côté frontend
      if (!formData.treatmentType) {
        throw new Error('Veuillez sélectionner un type de traitement');
      }
      
      if (!formData.companyName || !formData.ice || !formData.rc || !formData.email) {
        throw new Error('Veuillez remplir tous les champs obligatoires de l\'entreprise');
      }
      
      if (formData.selectedLaws.length === 0) {
        throw new Error('Veuillez sélectionner au moins une loi applicable');
      }

      if (formData.documents.length === 0) {
        throw new Error('Veuillez télécharger au moins un document justificatif');
      }
      
      // Créer un FormData pour envoyer les fichiers
      const formDataToSend = new FormData();
      
      // Ajouter les champs de base
      formDataToSend.append('treatment_type', formData.treatmentType);
      
      // Ajouter les données JSON
      const submittedData = {
          companyName: formData.companyName,
          ice: formData.ice,
          rc: formData.rc,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          legalRepresentative: formData.legalRepresentative,
          selectedLaws: formData.selectedLaws,
          description: formData.description,
      };
      
      formDataToSend.append('submitted_data', JSON.stringify(submittedData));
      
      // Ajouter le document principal (pour compatibilité)
      if (formData.documents.length > 0) {
        const pdfFiles = formData.documents.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
          formDataToSend.append('supporting_documents', pdfFiles[0]);
        } else {
          formDataToSend.append('supporting_documents', formData.documents[0]);
        }
      }
      
      console.log('Données à envoyer:');
      console.log('- treatment_type:', formData.treatmentType);
      console.log('- submitted_data:', submittedData);
      console.log('- documents:', formData.documents.map(f => f.name));

      // Créer la demande via l'API avec FormData
      const response = await certificationAPI.createRequestWithFiles(formDataToSend);
      
      // Si la demande a été créée avec succès et qu'il y a plusieurs documents,
      // uploader les documents supplémentaires
      if (response.data && formData.documents.length > 1) {
        const requestId = response.data.id;
        const additionalFormData = new FormData();
        
        additionalFormData.append('certification_request', requestId.toString());
        
        // Ajouter tous les fichiers sauf le premier (déjà uploadé comme document principal)
        formData.documents.slice(1).forEach((file, index) => {
          additionalFormData.append('files', file);
          additionalFormData.append(`name_${index}`, file.name);
          additionalFormData.append(`document_type_${index}`, 'other');
          additionalFormData.append(`description_${index}`, `Document justificatif ${index + 2}`);
        });
        
        try {
          await certificationAPI.uploadMultipleSupportingDocuments(additionalFormData);
          console.log('Documents additionnels uploadés avec succès');
        } catch (docError) {
          console.warn('Erreur lors de l\'upload des documents additionnels:', docError);
          // Ne pas faire échouer la demande pour cela
        }
      }
      
      // Rediriger vers la liste des demandes
      navigate('/enterprise/requests');
    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      
      let errorMessage = 'Erreur lors de la soumission de la demande';
      
      // Erreur côté frontend (validation)
      if (err.message && !err.response) {
        errorMessage = err.message;
      }
      // Erreur côté backend
      else if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.treatment_type) {
          errorMessage = `Type de traitement: ${err.response.data.treatment_type[0]}`;
        } else if (err.response.data.submitted_data) {
          errorMessage = `Données soumises: ${err.response.data.submitted_data[0]}`;
        } else if (err.response.data.company) {
          errorMessage = `Entreprise: ${err.response.data.company[0]}`;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.status === 400) {
          errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (err.response.status === 403) {
          errorMessage = 'Accès refusé. Vérifiez que votre profil d\'entreprise est complet.';
        } else {
          errorMessage = 'Erreur de validation des données';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.companyName && formData.ice && formData.rc && formData.email;
      case 1:
        return formData.treatmentType !== '';
      case 2:
        return formData.selectedLaws.length > 0;
      case 3:
        return formData.documents.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* En-tête avec icône */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ 
                bgcolor: '#4caf50', 
                width: 60, 
                height: 60, 
                mr: 2,
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
              }}>
                <Nature fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                  Demande de Certification DEEE
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Formulaire de demande de certification de conformité environnementale
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Informations de l'Entreprise
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Raison sociale"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="N° ICE"
                  value={formData.ice}
                  onChange={(e) => handleInputChange('ice', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="N° Registre de Commerce"
                  value={formData.rc}
                  onChange={(e) => handleInputChange('rc', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Adresse complète"
                  placeholder="Adresse, ville, code postal"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Représentant légal"
                  value={formData.legalRepresentative}
                  onChange={(e) => handleInputChange('legalRepresentative', e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Type de traitement des DEEE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Sélectionnez le type de traitement pour lequel vous demandez la certification
            </Typography>

            <Grid container spacing={3}>
              {treatmentTypes.map((type) => (
                <Grid item xs={12} md={4} key={type.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.treatmentType === type.id ? `2px solid ${type.color}` : '2px solid transparent',
                      '&:hover': { 
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s'
                      },
                      height: '100%'
                    }}
                    onClick={() => handleInputChange('treatmentType', type.id)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: type.color, 
                        width: 60, 
                        height: 60, 
                        mx: 'auto', 
                        mb: 2 
                      }}>
                        {type.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                      {formData.treatmentType === type.id && (
                        <Chip 
                          label="Sélectionné" 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 2 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        const applicableLaws = formData.treatmentType ? lawsByTreatment[formData.treatmentType as keyof typeof lawsByTreatment] : [];
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Conformité Légale - Loi n° 28-00
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Cochez les articles de loi applicables à votre type de traitement ({formData.treatmentType})
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Vous devez cocher au moins un article pour confirmer votre conformité aux exigences légales.
            </Alert>

            <FormControl component="fieldset" fullWidth>
              <FormGroup>
                {applicableLaws.map((law) => (
                  <Paper key={law.id} sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.selectedLaws.includes(law.id)}
                          onChange={() => handleLawToggle(law.id)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                          {law.text}
                        </Typography>
                      }
                    />
                  </Paper>
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Documents Justificatifs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Téléchargez les documents requis pour votre demande de certification
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Les documents justificatifs doivent inclure : inventaire des déchets, processus de traitement prévu, 
              certifications existantes, autorisations administratives, etc.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description détaillée du processus"
                  placeholder="Décrivez en détail votre processus de traitement des DEEE, les équipements utilisés, les mesures de sécurité..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Télécharger Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleFileUpload}
                  />
                </Button>
              </Grid>
            </Grid>

            {/* Liste des fichiers téléchargés */}
            {formData.documents.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Documents téléchargés ({formData.documents.length})
                </Typography>
                {formData.documents.map((file, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{file.name}</Typography>
                    <IconButton onClick={() => handleRemoveFile(index)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Récapitulatif de la Demande
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informations Entreprise
                  </Typography>
                  <Typography><strong>Raison sociale:</strong> {formData.companyName}</Typography>
                  <Typography><strong>ICE:</strong> {formData.ice}</Typography>
                  <Typography><strong>RC:</strong> {formData.rc}</Typography>
                  <Typography><strong>Email:</strong> {formData.email}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Type de Traitement
                  </Typography>
                  <Chip 
                    label={treatmentTypes.find(t => t.id === formData.treatmentType)?.label} 
                    color="primary" 
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Articles de Loi Cochés ({formData.selectedLaws.length})
                  </Typography>
                  {formData.selectedLaws.map(lawId => (
                    <Chip key={lawId} label={lawId} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Documents ({formData.documents.length})
                  </Typography>
                  {formData.documents.map((file, index) => (
                    <Typography key={index} variant="body2">• {file.name}</Typography>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3 }}>
              Votre demande est prête à être soumise. Vérifiez toutes les informations avant la soumission finale.
            </Alert>
          </Box>
        );

      default:
        return 'Étape inconnue';
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/enterprise/requests')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Nouvelle Demande de Certification
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Content */}
      <Paper sx={{ p: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {renderStepContent(activeStep)}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0 || isSubmitting}
          onClick={handleBack}
          startIcon={<ArrowBack />}
        >
          Précédent
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
              }
            }}
          >
            {isSubmitting ? 'Soumission...' : 'Soumettre la Demande'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid(activeStep) || isSubmitting}
            endIcon={<ArrowForward />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Suivant
          </Button>
        )}
      </Box>
    </Box>
  );
} 