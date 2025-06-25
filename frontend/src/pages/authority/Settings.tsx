import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Grid,
  Alert,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Save as SaveIcon
} from '@mui/icons-material';

export default function AuthoritySettings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      newCertificates: true,
      auditReminders: true,
      systemAlerts: true
    },
    appearance: {
      theme: 'light',
      language: 'fr'
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSwitchChange = (category: string, setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: event.target.checked
      }
    }));
  };

  const handleSelectChange = (category: string, setting: string) => (event: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: event.target.value
      }
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde des paramètres:', settings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
          Paramètres
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          Configurez vos préférences et paramètres de compte
        </Typography>
      </Box>

      {/* Success Alert */}
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Paramètres sauvegardés avec succès !
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1, color: '#667eea' }} />
                Notifications
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#7f8c8d' }}>
                  Méthodes de notification
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={handleSwitchChange('notifications', 'email')}
                    />
                  }
                  label="Notifications par email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={handleSwitchChange('notifications', 'push')}
                    />
                  }
                  label="Notifications push"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={handleSwitchChange('notifications', 'sms')}
                    />
                  }
                  label="Notifications SMS"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#7f8c8d' }}>
                  Types de notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.newCertificates}
                      onChange={handleSwitchChange('notifications', 'newCertificates')}
                    />
                  }
                  label="Nouveaux certificats"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.auditReminders}
                      onChange={handleSwitchChange('notifications', 'auditReminders')}
                    />
                  }
                  label="Rappels d'audit"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onChange={handleSwitchChange('notifications', 'systemAlerts')}
                    />
                  }
                  label="Alertes système"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
                <PaletteIcon sx={{ mr: 1, color: '#667eea' }} />
                Apparence
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Thème</InputLabel>
                <Select
                  value={settings.appearance.theme}
                  label="Thème"
                  onChange={handleSelectChange('appearance', 'theme')}
                >
                  <MenuItem value="light">Clair</MenuItem>
                  <MenuItem value="dark">Sombre</MenuItem>
                  <MenuItem value="auto">Automatique</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Langue</InputLabel>
                <Select
                  value={settings.appearance.language}
                  label="Langue"
                  onChange={handleSelectChange('appearance', 'language')}
                >
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ar">العربية</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1, color: '#667eea' }} />
                Sécurité
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactor}
                        onChange={handleSwitchChange('security', 'twoFactor')}
                      />
                    }
                    label="Authentification à deux facteurs"
                  />
                  <Typography variant="body2" sx={{ color: '#7f8c8d', mt: 1 }}>
                    Ajouter une couche de sécurité supplémentaire à votre compte
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Délai d'expiration de session (minutes)"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        sessionTimeout: parseInt(e.target.value) || 30
                      }
                    }))}
                    InputProps={{ inputProps: { min: 5, max: 120 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                backgroundColor: '#667eea',
                '&:hover': { backgroundColor: '#5a6fd8' },
                px: 4,
                py: 1.5
              }}
            >
              Sauvegarder les Paramètres
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 