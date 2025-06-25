import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Business,
  Edit,
  Save,
  Cancel,
  Person,
  VerifiedUser,
  LocationOn,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const companyTypes = [
  'Fabricant',
  'Distributeur',
  'Recycleur',
  'Centre de traitement',
  'Collecteur',
  'Autre',
];

const companySizes = [
  'TPE (1-9 employés)',
  'PME (10-249 employés)',
  'ETI (250-4999 employés)',
  'Grande entreprise (5000+ employés)',
];

interface ProfileData {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  profile: {
    company_name: string;
    company_type: string;
    ice_number: string;
    rc_number: string;
    address: string;
    phone: string;
    website: string;
    company_size: string;
    legal_representative: string;
    description: string;
  };
}

export default function EnterpriseProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    user: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    },
    profile: {
      company_name: '',
      company_type: '',
      ice_number: '',
      rc_number: '',
      address: '',
      phone: '',
      website: '',
      company_size: '',
      legal_representative: '',
      description: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfileData(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement du profil');
      console.error('Profile fetch error:', err);
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
      setSuccess(false);

      const response = await authAPI.updateProfile(profileData);
      setProfileData(response.data);
      dispatch(updateUser(response.data.user));
      setSuccess(true);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour du profil');
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
          Profil Entreprise
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez les informations de votre entreprise et vos données personnelles
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem',
                }}
              >
                <Business sx={{ fontSize: '3rem', color: 'white' }} />
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profileData.profile.company_name || 'Nom de l\'entreprise'}
              </Typography>
              
              <Chip
                label={profileData.profile.company_type || 'Type non défini'}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {!editing ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      },
                    }}
                  >
                    Modifier
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                        },
                      }}
                    >
                      {saving ? <CircularProgress size={20} /> : 'Sauvegarder'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      color="error"
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ color: '#667eea', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Personnelles
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom d'utilisateur"
                      value={profileData.user.username}
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.user.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'user')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      value={profileData.user.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value, 'user')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={profileData.user.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value, 'user')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Business sx={{ color: '#667eea', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Entreprise
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom de l'entreprise"
                      value={profileData.profile.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Type d'entreprise"
                      value={profileData.profile.company_type}
                      onChange={(e) => handleInputChange('company_type', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    >
                      {companyTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Taille de l'entreprise"
                      value={profileData.profile.company_size}
                      onChange={(e) => handleInputChange('company_size', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    >
                      {companySizes.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Représentant légal"
                      value={profileData.profile.legal_representative}
                      onChange={(e) => handleInputChange('legal_representative', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <VerifiedUser sx={{ color: '#667eea', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Légales
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Numéro ICE"
                      value={profileData.profile.ice_number}
                      onChange={(e) => handleInputChange('ice_number', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Numéro RC"
                      value={profileData.profile.rc_number}
                      onChange={(e) => handleInputChange('rc_number', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationOn sx={{ color: '#667eea', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Coordonnées
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      multiline
                      rows={2}
                      value={profileData.profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={profileData.profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Site web"
                      value={profileData.profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
} 