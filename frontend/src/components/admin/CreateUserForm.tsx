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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { adminAPI } from '../../services/api';

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
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ open, onClose, onUserCreated }) => {
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

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username || !formData.email || !formData.password || 
        !formData.confirmPassword || !formData.first_name || !formData.last_name || !formData.role) {
      setError('Veuillez remplir tous les champs requis');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role,
      };

      await adminAPI.createUser(userData);
      
      setSuccess('Utilisateur créé avec succès !');
      setTimeout(() => {
        onUserCreated();
        handleClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Erreur création utilisateur:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Rôle"
                  disabled={loading}
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
                disabled={loading}
                helperText="Minimum 6 caractères"
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
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Création...' : 'Créer l\'utilisateur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserForm; 