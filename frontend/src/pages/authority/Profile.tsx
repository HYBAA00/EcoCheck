import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { RootState } from '../../store';

export default function AuthorityProfile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  const handleSave = () => {
    // Ici, vous pourriez ajouter une API call pour sauvegarder les modifications
    console.log('Sauvegarde des modifications:', editedUser);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
          Mon Profil
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          Gérez vos informations personnelles et paramètres de compte
        </Typography>
      </Box>

      {/* Success Alert */}
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profil mis à jour avec succès !
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                backgroundColor: '#667eea',
                fontSize: '2.5rem'
              }}
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            
            <Chip
              label="AUTORITÉ"
              color="primary"
              sx={{
                backgroundColor: '#667eea',
                color: 'white',
                fontWeight: 'bold',
                mb: 2
              }}
            />
            
            <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3 }}>
              Interface d'autorité pour la consultation et l'audit des certifications DEEE
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    backgroundColor: '#667eea',
                    '&:hover': { backgroundColor: '#5a6fd8' }
                  }}
                >
                  Modifier
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                  >
                    Sauvegarder
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Information Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: '#667eea' }} />
                Informations Personnelles
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={isEditing ? editedUser.first_name : user?.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={isEditing ? editedUser.last_name : user?.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={isEditing ? editedUser.email : user?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={isEditing ? editedUser.phone : user?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: '#7f8c8d' }} />
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Account Information */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1, color: '#667eea' }} />
                Informations de Compte
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                      Nom d'utilisateur
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {user?.username || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                      Rôle
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {user?.role || 'Autorité'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                      Statut du compte
                    </Typography>
                    <Chip
                      label="Actif"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                      Dernière connexion
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Aujourd'hui
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 