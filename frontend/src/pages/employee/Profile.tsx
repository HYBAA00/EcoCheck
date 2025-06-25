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
  Work,
  Badge,
} from '@mui/icons-material';

interface EmployeeProfileData {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  profile: {
    employee_id: string;
    department: string;
    position: string;
    phone: string;
    hire_date: string;
    supervisor: string;
    certifications: string[];
    skills: string[];
  };
}

const departments = [
  'Validation et Contrôle',
  'Audit Environnemental',
  'Conformité Réglementaire',
  'Support Technique',
  'Administration',
  'Autre'
];

const positions = [
  'Agent de Validation',
  'Inspecteur Environnemental',
  'Responsable Conformité',
  'Technicien Spécialisé',
  'Chef d\'Équipe',
  'Superviseur',
  'Autre'
];

export default function EmployeeProfile() {
  const [profileData, setProfileData] = useState<EmployeeProfileData>({
    user: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
    },
    profile: {
      employee_id: '',
      department: '',
      position: '',
      phone: '',
      hire_date: '',
      supervisor: '',
      certifications: [],
      skills: [],
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
      
      const mockData: EmployeeProfileData = {
        user: {
          username: 'houda',
          email: 'houda@gmail.com',
          first_name: 'Houda',
          last_name: 'Benali',
        },
        profile: {
          employee_id: 'EMP-2024-001',
          department: 'Validation et Contrôle',
          position: 'Agent de Validation',
          phone: '+212 6 12 34 56 78',
          hire_date: '2024-01-15',
          supervisor: 'Ahmed Alami',
          certifications: ['ISO 14001', 'DEEE Certification'],
          skills: ['Validation DEEE', 'Audit Environnemental', 'Conformité Réglementaire'],
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
          Profil Employé
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations personnelles et professionnelles
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
                <Badge sx={{ fontSize: '3rem', color: 'white' }} />
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profileData.user.first_name + ' ' + profileData.user.last_name || 'Nom Employé'}
              </Typography>
              
              <Chip
                label={profileData.profile.position || 'Poste non défini'}
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profileData.profile.department}
              </Typography>

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
                  <Work sx={{ color: '#667eea', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Informations Professionnelles
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID Employé"
                      value={profileData.profile.employee_id}
                      disabled
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
                      select
                      fullWidth
                      label="Département"
                      value={profileData.profile.department}
                      onChange={(e) => handleInputChange('department', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Poste"
                      value={profileData.profile.position}
                      onChange={(e) => handleInputChange('position', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    >
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>
                          {pos}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date d'embauche"
                      type="date"
                      value={profileData.profile.hire_date}
                      onChange={(e) => handleInputChange('hire_date', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Superviseur"
                      value={profileData.profile.supervisor}
                      onChange={(e) => handleInputChange('supervisor', e.target.value, 'profile')}
                      disabled={!editing}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Certifications & Compétences
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Certifications
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profileData.profile.certifications.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Compétences
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profileData.profile.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}