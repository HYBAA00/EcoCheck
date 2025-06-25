import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  AdminPanelSettings,
  Security,
} from '@mui/icons-material';

interface AdminProfileData {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  profile: {
    admin_id: string;
    role: string;
    permissions: string[];
    phone: string;
    join_date: string;
    last_login: string;
    managed_areas: string[];
    security_level: string;
  };
}

const adminRoles = [
  'Super Administrateur',
  'Administrateur Système',
  'Administrateur Conformité',
  'Administrateur Support',
  'Autre'
];

const securityLevels = [
  'Niveau 1 - Accès Total',
  'Niveau 2 - Accès Étendu',
  'Niveau 3 - Accès Standard',
  'Niveau 4 - Accès Limité'
];

export default function AdminProfile() {
  const [profileData, setProfileData] = useState<AdminProfileData>({
    user: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    },
    profile: {
      admin_id: '',
      role: '',
      permissions: [],
      phone: '',
      join_date: '',
      last_login: '',
      managed_areas: [],
      security_level: '',
    },
  });
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Données de démonstration pour l'administrateur
      const mockData: AdminProfileData = {
        user: {
          username: 'admin',
          email: 'admin@ecocheck.ma',
          first_name: 'Admin',
          last_name: 'EcoCheck',
        },
        profile: {
          admin_id: 'ADMIN-2024-001',
          role: 'Super Administrateur',
          permissions: ['Gestion Utilisateurs', 'Validation Certificats', 'Configuration Système', 'Gestion Paiements'],
          phone: '+212 6 00 00 00 00',
          join_date: '2024-01-01',
          last_login: '2024-03-20',
          managed_areas: ['Validation', 'Conformité', 'Support Technique'],
          security_level: 'Niveau 1 - Accès Total',
        },
      };
      
      setProfileData(mockData);
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Impossible de charger les données du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string, section: 'user' | 'profile') => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Impossible de sauvegarder les modifications');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
          Profil Administrateur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations personnelles et vos autorisations d'administration
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profil mis à jour avec succès !
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                }}
              >
                <AdminPanelSettings sx={{ fontSize: '3rem' }} />
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profileData.user.first_name} {profileData.user.last_name}
              </Typography>
              
              <Chip
                icon={<Security />}
                label={profileData.profile.role}
                color="primary"
                sx={{ mb: 2 }}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ID Administrateur
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {profileData.profile.admin_id}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Niveau de Sécurité
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="primary">
                  {profileData.profile.security_level}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Informations Personnelles</Typography>
              {!editing ? (
                <Button
                  startIcon={<Edit />}
                  variant="outlined"
                  onClick={() => setEditing(true)}
                >
                  Modifier
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Save />}
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ mr: 1 }}
                  >
                    Sauvegarder
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  value={profileData.user.username}
                  onChange={(e) => handleInputChange('username', e.target.value, 'user')}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.user.email}
                  onChange={(e) => handleInputChange('email', e.target.value, 'user')}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={profileData.user.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value, 'user')}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={profileData.user.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value, 'user')}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={profileData.profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'profile')}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Rôle"
                  value={profileData.profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value, 'profile')}
                  disabled={!editing}
                >
                  {adminRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Permissions et Accès</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Permissions Actives</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.profile.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Zones Gérées</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.profile.managed_areas.map((area) => (
                    <Chip
                      key={area}
                      label={area}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date d'adhésion"
                  value={profileData.profile.join_date}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dernière connexion"
                  value={profileData.profile.last_login}
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 