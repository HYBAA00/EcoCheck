import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Save,
  TrendingUp,
  TrendingDown,
  Nature,
  Scale,
  Visibility,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface DailyInfo {
  id: number;
  date: string;
  waste_collected: number;
  waste_treated: number;
  recycling_rate: number;
  energy_consumption: number;
  carbon_footprint: number;
}

export default function DailyInfo() {
  const [dailyInfos, setDailyInfos] = useState<DailyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<DailyInfo | null>(null);
  
  // Formulaire pour nouvelle entrée
  const [newInfo, setNewInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    waste_collected: '',
    waste_treated: '',
    recycling_rate: '',
    energy_consumption: '',
    carbon_footprint: '',
  });

  useEffect(() => {
    loadDailyInfos();
  }, []);

  const loadDailyInfos = async () => {
    try {
      // Données mockées réalistes pour les 10 derniers jours
      const mockData: DailyInfo[] = [];
      const today = new Date();
      
      for (let i = 9; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Génération de données réalistes avec variations logiques
        const baseWasteCollected = 450 + Math.random() * 200; // Entre 450-650 kg
        const wasteCollected = Math.round(baseWasteCollected);
        const wasteTreated = Math.round(wasteCollected * (0.85 + Math.random() * 0.1)); // 85-95% du collecté
        const recyclingRate = Math.round((wasteTreated / wasteCollected * 100) * 10) / 10; // Taux calculé
        const energyConsumption = Math.round(120 + Math.random() * 80); // Entre 120-200 kWh
        const carbonFootprint = Math.round(wasteCollected * 0.1 + Math.random() * 20); // Environ 10% du poids + variation
        
        mockData.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          waste_collected: wasteCollected,
          waste_treated: wasteTreated,
          recycling_rate: recyclingRate,
          energy_consumption: energyConsumption,
          carbon_footprint: carbonFootprint,
        });
      }
      
      // Trier par date décroissante (plus récent en premier)
      mockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setDailyInfos(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données journalières:', error);
      setLoading(false);
    }
  };

  const handleNewInfo = () => {
    setSelectedInfo(null);
    setNewInfo({
      date: new Date().toISOString().split('T')[0],
      waste_collected: '',
      waste_treated: '',
      recycling_rate: '',
      energy_consumption: '',
      carbon_footprint: '',
    });
    setOpenDialog(true);
  };

  const handleEditInfo = (info: DailyInfo) => {
    setSelectedInfo(info);
    setNewInfo({
      date: info.date,
      waste_collected: info.waste_collected.toString(),
      waste_treated: info.waste_treated.toString(),
      recycling_rate: info.recycling_rate.toString(),
      energy_consumption: info.energy_consumption.toString(),
      carbon_footprint: info.carbon_footprint.toString(),
    });
    setOpenDialog(true);
  };

  const handleSubmitInfo = () => {
    console.log('Informations soumises:', newInfo);
    setOpenDialog(false);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  // Configuration des graphiques
  const chartData = {
    labels: dailyInfos.map(info => new Date(info.date).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: 'Déchets Collectés (kg)',
        data: dailyInfos.map(info => info.waste_collected).reverse(),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Déchets Traités (kg)',
        data: dailyInfos.map(info => info.waste_treated).reverse(),
        borderColor: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        tension: 0.4,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des informations journalières...
        </Typography>
      </Box>
    );
  }

  const latestInfo = dailyInfos[0];
  const previousInfo = dailyInfos[1];

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
          Informations Journalières
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Suivi quotidien des performances environnementales
        </Typography>
      </Box>

      {/* Cartes de métriques avec tendances */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {latestInfo?.waste_collected.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    kg Collectés Aujourd'hui
                  </Typography>
                  {previousInfo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateTrend(latestInfo.waste_collected, previousInfo.waste_collected))}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {Math.abs(calculateTrend(latestInfo.waste_collected, previousInfo.waste_collected)).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Scale fontSize="large" sx={{ opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {latestInfo?.recycling_rate.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Taux de Recyclage
                  </Typography>
                  {previousInfo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateTrend(latestInfo.recycling_rate, previousInfo.recycling_rate))}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {Math.abs(calculateTrend(latestInfo.recycling_rate, previousInfo.recycling_rate)).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Nature fontSize="large" sx={{ opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {latestInfo?.energy_consumption.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    kWh Consommés
                  </Typography>
                  {previousInfo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getTrendIcon(calculateTrend(latestInfo.energy_consumption, previousInfo.energy_consumption))}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {Math.abs(calculateTrend(latestInfo.energy_consumption, previousInfo.energy_consumption)).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Scale fontSize="large" sx={{ opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphique */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des Déchets (Derniers jours)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Évolution des Déchets'
                    }
                  },
                  scales: {
                    x: {
                      type: 'category',
                      title: {
                        display: true,
                        text: 'Date'
                      }
                    },
                    y: {
                      type: 'linear',
                      title: {
                        display: true,
                        text: 'Quantité (kg)'
                      },
                      beginAtZero: true
                    }
                  }
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des données */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Historique des Données
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewInfo}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Ajouter Données
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Collectés (kg)</TableCell>
                  <TableCell>Traités (kg)</TableCell>
                  <TableCell>Taux Recyclage (%)</TableCell>
                  <TableCell>Énergie (kWh)</TableCell>
                  <TableCell>CO₂ (kg)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyInfos.map((info) => (
                  <TableRow key={info.id} hover>
                    <TableCell>
                      {new Date(info.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{info.waste_collected.toLocaleString()}</TableCell>
                    <TableCell>{info.waste_treated.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${info.recycling_rate.toFixed(1)}%`}
                        color={info.recycling_rate > 80 ? 'success' : info.recycling_rate > 60 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{info.energy_consumption.toLocaleString()}</TableCell>
                    <TableCell>{info.carbon_footprint.toLocaleString()}</TableCell>
                    <TableCell>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleEditInfo(info)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Voir détails">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier des données */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedInfo ? 'Modifier les Données' : 'Ajouter Nouvelles Données'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newInfo.date}
                onChange={(e) => setNewInfo({ ...newInfo, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Déchets Collectés (kg)"
                value={newInfo.waste_collected}
                onChange={(e) => setNewInfo({ ...newInfo, waste_collected: e.target.value })}
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Déchets Traités (kg)"
                value={newInfo.waste_treated}
                onChange={(e) => setNewInfo({ ...newInfo, waste_treated: e.target.value })}
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Taux de Recyclage (%)"
                value={newInfo.recycling_rate}
                onChange={(e) => setNewInfo({ ...newInfo, recycling_rate: e.target.value })}
                type="number"
                inputProps={{ min: 0, max: 100 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Consommation Énergétique (kWh)"
                value={newInfo.energy_consumption}
                onChange={(e) => setNewInfo({ ...newInfo, energy_consumption: e.target.value })}
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Empreinte Carbone (kg CO₂)"
                value={newInfo.carbon_footprint}
                onChange={(e) => setNewInfo({ ...newInfo, carbon_footprint: e.target.value })}
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Ces données sont utilisées pour calculer vos performances environnementales 
                et générer les rapports de conformité.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitInfo}
            disabled={!newInfo.waste_collected || !newInfo.waste_treated}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {selectedInfo ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bouton flottant pour ajouter des données */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          }
        }}
        onClick={handleNewInfo}
      >
        <Add />
      </Fab>
    </Box>
  );
} 