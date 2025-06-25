import React, { useState, useEffect } from 'react';
import { keyframes } from '@mui/system';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  Security,
  Assignment,
  FileDownload,
  Refresh,
  Search,
  FilterList,
  Assessment,
  Business,
  VerifiedUser,
  Visibility,
  GetApp,
  DateRange,
  TrendingUp,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../services/api';

// Animation keyframes
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

interface DashboardStats {
  certificates: {
    total: number;
    active: number;
    expired: number;
    revoked: number;
  };
  requests: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  companies: number;
}

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    certificates: { total: 0, active: 0, expired: 0, revoked: 0 },
    requests: { total: 0, approved: 0, rejected: 0, pending: 0 },
    companies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les données depuis l'API
      const [certificatesStats, requestsStats] = await Promise.all([
        authorityAPI.getCertificateStats(),
        authorityAPI.getRequestStats(),
      ]);

      setStats({
        certificates: {
          total: certificatesStats.data.total_certificates || 0,
          active: certificatesStats.data.active_certificates || 0,
          expired: certificatesStats.data.expired_certificates || 0,
          revoked: certificatesStats.data.revoked_certificates || 0,
        },
        requests: {
          total: requestsStats.data.total_requests || 0,
          approved: requestsStats.data.approved_requests || 0,
          rejected: requestsStats.data.rejected_requests || 0,
          pending: requestsStats.data.pending_requests || 0,
        },
        companies: 0, // Sera ajouté quand l'endpoint sera disponible
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress sx={{ 
          backgroundColor: '#e3f2fd',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
        }} />
        <Typography sx={{ mt: 2, textAlign: 'center', color: '#667eea' }}>
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        zIndex: 0
      }
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" sx={{ 
          color: 'white',
          fontWeight: 'bold',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          <Security sx={{ mr: 2, fontSize: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          Interface Autorité - EcoCheck
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          Consultation et audit des certifications DEEE
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              zIndex: 1
            },
            '&:hover': { 
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
              background: 'rgba(255,255,255,1)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 2 }}>
              <Box sx={{ 
                position: 'relative',
                display: 'inline-block',
                mb: 2
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  opacity: 0.1,
                  zIndex: 0
                }} />
                <Security sx={{ 
                  fontSize: 60, 
                  color: '#667eea', 
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #667eea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Consultation des Certificats
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#7f8c8d', 
                mb: 3,
                fontWeight: 500
              }}>
                Rechercher par ID, nom ou organisation...
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Rechercher par ID, nom ou organisation..."
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      background: 'rgba(255,255,255,1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  )
                }}
              />
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tous les statuts</InputLabel>
                    <Select
                      label="Tous les statuts"
                      defaultValue=""
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Tous les statuts</MenuItem>
                      <MenuItem value="active">Actif</MenuItem>
                      <MenuItem value="expired">Expiré</MenuItem>
                      <MenuItem value="revoked">Révoqué</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tous les types</InputLabel>
                    <Select
                      label="Tous les types"
                      defaultValue=""
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Tous les types</MenuItem>
                      <MenuItem value="tri">Tri</MenuItem>
                      <MenuItem value="recycling">Recyclage</MenuItem>
                      <MenuItem value="reuse">Réutilisation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => navigate('/authority/certificates')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Valider Certificat
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={loadDashboardData}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #43A047 0%, #388E3C 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(76, 175, 80, 0.4)'
                      }
                    }}
                  >
                    Actualiser
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
              zIndex: 1
            },
            '&:hover': { 
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
              background: 'rgba(255,255,255,1)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 2 }}>
              <Box sx={{ 
                position: 'relative',
                display: 'inline-block',
                mb: 2
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  opacity: 0.1,
                  zIndex: 0
                }} />
                <Assignment sx={{ 
                  fontSize: 60, 
                  color: '#2196F3', 
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(33, 150, 243, 0.3))'
                }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #2196F3 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Audit des Demandes et Rapports
              </Typography>
              
              {/* Statistics Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(33, 150, 243, 0.15)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: '#1976D2',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {stats.requests.total}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1565C0', fontWeight: 500 }}>
                      Demandes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                    border: '1px solid rgba(76, 175, 80, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.15)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: '#388E3C',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {stats.requests.approved}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 500 }}>
                      Approuvées
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                    border: '1px solid rgba(255, 152, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(255, 152, 0, 0.15)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: '#F57C00',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {stats.requests.pending}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#EF6C00', fontWeight: 500 }}>
                      En cours
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                    border: '1px solid rgba(244, 67, 54, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(244, 67, 54, 0.15)'
                    }
                  }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: '#D32F2F',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {stats.requests.rejected}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#C62828', fontWeight: 500 }}>
                      Rejetées
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Aujourd'hui</InputLabel>
                    <Select
                      label="Aujourd'hui"
                      defaultValue="today"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="today">Aujourd'hui</MenuItem>
                      <MenuItem value="week">Cette semaine</MenuItem>
                      <MenuItem value="month">Ce mois</MenuItem>
                      <MenuItem value="year">Cette année</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tous les types</InputLabel>
                    <Select
                      label="Tous les types"
                      defaultValue=""
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Tous les types</MenuItem>
                      <MenuItem value="tri">Tri</MenuItem>
                      <MenuItem value="recycling">Recyclage</MenuItem>
                      <MenuItem value="reuse">Réutilisation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={() => navigate('/authority/audit-journal')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Journal d'Audit
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assessment />}
                    onClick={() => navigate('/authority/audit-report')}
                    sx={{
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(33, 150, 243, 0.4)'
                      }
                    }}
                  >
                    Rapport d'Audit
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)',
              zIndex: 1
            },
            '&:hover': { 
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
              background: 'rgba(255,255,255,1)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 2 }}>
              <Box sx={{ 
                position: 'relative',
                display: 'inline-block',
                mb: 2
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  opacity: 0.1,
                  zIndex: 0
                }} />
                <FileDownload sx={{ 
                  fontSize: 60, 
                  color: '#4CAF50', 
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))'
                }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: '#2c3e50', 
                mb: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #4CAF50 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Export des Historiques
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: '#4CAF50', 
                  mb: 2, 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Du:
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255,255,255,1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                      }
                    }
                  }}
                />
                
                <Typography variant="body2" sx={{ 
                  color: '#4CAF50', 
                  mb: 2, 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Au:
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255,255,255,1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                      }
                    }
                  }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VerifiedUser />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Certificats
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assessment />}
                    sx={{
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4)'
                      }
                    }}
                  >
                    Audit
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Assignment />}
                    sx={{
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      borderRadius: 3,
                      py: 1.5,
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 6px 16px rgba(255, 152, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FB8C00 0%, #EF6C00 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(255, 152, 0, 0.4)'
                      }
                    }}
                  >
                    Reports
                  </Button>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                startIcon={<GetApp />}
                onClick={() => navigate('/authority/export')}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  mb: 2,
                  boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #43A047 0%, #388E3C 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(76, 175, 80, 0.4)'
                  }
                }}
              >
                Tout Exporter
              </Button>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>PDF</InputLabel>
                    <Select
                      label="PDF"
                      defaultValue="pdf"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Refresh />}
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderRadius: 3,
                      fontWeight: 'bold'
                    }}
                  >
                    Configuration
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Documents Section */}
      <Card sx={{ 
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          zIndex: 1
        }
      }}>
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            color: '#2c3e50', 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #2c3e50 0%, #667eea 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <Box sx={{ 
              position: 'relative',
              display: 'inline-block',
              mr: 2
            }}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: 0.1,
                zIndex: 0
              }} />
              <Visibility sx={{ 
                color: '#667eea', 
                position: 'relative',
                zIndex: 1,
                filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
              }} />
            </Box>
            Documents en Lecture Seule
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Rechercher des documents..."
            sx={{ 
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                },
                '&.Mui-focused': {
                  background: 'rgba(255,255,255,1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.2)'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#667eea' }} />
                </InputAdornment>
              )
            }}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: '1px solid rgba(76, 175, 80, 0.2)',
                background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(76, 175, 80, 0.15)',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#2E7D32', 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: '#4CAF50',
                    mr: 1
                  }} />
                  Politique de Certification
                </Typography>
                <Typography variant="body2" sx={{ color: '#388E3C', mb: 2, fontWeight: 500 }}>
                  Modifié: 15/06/2025 | PDF
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Visibility />}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    borderRadius: 3,
                    fontWeight: 'bold',
                    boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #43A047 0%, #388E3C 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.4)'
                    }
                  }}
                >
                  Consulter
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: '1px solid rgba(33, 150, 243, 0.2)',
                background: 'linear-gradient(135deg, #E3F2FD 0%, #E1F5FE 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(33, 150, 243, 0.15)',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#1565C0', 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: '#2196F3',
                    mr: 1
                  }} />
                  Procédures d'Audit
                </Typography>
                <Typography variant="body2" sx={{ color: '#1976D2', mb: 2, fontWeight: 500 }}>
                  Modifié: 12/06/2025 | PDF
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Visibility />}
                  sx={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    borderRadius: 3,
                    fontWeight: 'bold',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4)'
                    }
                  }}
                >
                  Consulter
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ 
                p: 4, 
                borderRadius: 3, 
                border: '2px solid rgba(102, 126, 234, 0.3)',
                background: 'linear-gradient(135deg, #F3F4FF 0%, #E8EAFF 100%)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  zIndex: 1
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 32px rgba(102, 126, 234, 0.2)',
                  border: '2px solid rgba(102, 126, 234, 0.4)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#5E35B1', 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mr: 1,
                    animation: `${pulse} 2s infinite`
                  }} />
                  Rapport de Conformité
                </Typography>
                <Typography variant="body2" sx={{ color: '#673AB7', mb: 2, fontWeight: 500 }}>
                  Dernier rapport généré automatiquement - Accès prioritaire
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Assessment />}
                  onClick={() => navigate('/authority/compliance-report')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                    fontSize: '1rem',
                    px: 3,
                    py: 1.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Voir le Rapport Complet
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 