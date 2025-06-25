import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { adminAPI } from '../services/api';

interface CreateUserFormProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  // Champs spécifiques selon le rôle
  business_name?: string;
  ice_number?: string;
  rc_number?: string;
  responsible_name?: string;
  address?: string;
  position?: string;
  hire_date?: string;
  supervisor?: string;
  organization?: string;
  sector?: string;
  region?: string;
  level?: string;
  department?: string;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ open, onClose, onUserCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
  });

  const steps = ['Informations de base', 'Informations spécifiques', 'Confirmation'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.username && formData.email && formData.password && 
                 formData.confirmPassword && formData.first_name && formData.last_name && formData.role);
      case 1:
        return true; // Les champs spécifiques sont optionnels
      case 2:
        return formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    } else {
      setError('Veuillez remplir tous les champs requis');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Préparer les données à envoyer
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role,
      };

      // Ajouter les champs spécifiques selon le rôle
      if (formData.role === 'enterprise') {
        Object.assign(userData, {
          business_name: formData.business_name,
          ice_number: formData.ice_number,
          rc_number: formData.rc_number,
          responsible_name: formData.responsible_name,
          address: formData.address,
        });
      } else if (formData.role === 'employee') {
        Object.assign(userData, {
          position: formData.position,
          hire_date: formData.hire_date,
          supervisor: formData.supervisor,
        });
      } else if (formData.role === 'authority') {
        Object.assign(userData, {
          organization: formData.organization,
          sector: formData.sector,
          region: formData.region,
        });
      } else if (formData.role === 'admin') {
        Object.assign(userData, {
          level: formData.level,
          department: formData.department,
        });
      }

      // Appel API pour créer l'utilisateur
      await adminAPI.createUser(userData);
      
      setSuccess('Utilisateur créé avec succès !');
      setTimeout(() => {
        onUserCreated();
        handleClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: '',
    });
    setError('');
    setSuccess('');
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Rôle"
                >
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="enterprise">Entreprise</MenuItem>
                  <MenuItem value="employee">Employé</MenuItem>
                  <MenuItem value="authority">Autorité</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return renderRoleSpecificFields();

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Récapitulatif
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Nom d'utilisateur:</Typography>
                <Typography variant="body1">{formData.username}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Email:</Typography>
                <Typography variant="body1">{formData.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Nom complet:</Typography>
                <Typography variant="body1">{formData.first_name} {formData.last_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Rôle:</Typography>
                <Typography variant="body1">{formData.role}</Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'enterprise':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numéro ICE"
                value={formData.ice_number}
                onChange={(e) => handleInputChange('ice_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numéro RC"
                value={formData.rc_number}
                onChange={(e) => handleInputChange('rc_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du responsable"
                value={formData.responsible_name}
                onChange={(e) => handleInputChange('responsible_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 'employee':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Poste"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'embauche"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange('hire_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Superviseur"
                value={formData.supervisor}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 'authority':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organisation"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Secteur"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Région"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 'admin':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Niveau"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Département"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      default:
        return (
          <Typography variant="body2" color="textSecondary">
            Sélectionnez un rôle pour voir les champs spécifiques.
          </Typography>
        );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1 }} />
          Créer un Nouvel Utilisateur
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Précédent
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext} 
            variant="contained" 
            disabled={loading || !validateStep(activeStep)}
          >
            Suivant
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !validateStep(activeStep)}
          >
            {loading ? 'Création...' : 'Créer l\'utilisateur'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserForm; 