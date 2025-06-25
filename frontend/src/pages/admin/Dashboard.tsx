import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Euro as EuroIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    total_enterprises: 0,
    total_employees: 0,
    total_authorities: 0,
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    total_payments: 0,
    pending_payments: 0,
    completed_payments: 0,
    certificates_issued: 0,
    certificates_expired: 0,
    recent_activities: [],
  });
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, treatmentTypesRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getTreatmentTypes(),
        ]);

        setStats(statsRes.data);
        setTreatmentTypes(treatmentTypesRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color, 
    backgroundColor = '#fff',
    onClick = null 
  }: {
    icon: React.ComponentType<any>;
    title: string;
    value: number;
    color: string;
    backgroundColor?: string;
    onClick?: (() => void) | null;
  }) => (
    <Card 
      sx={{ 
        height: '140px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
        borderRadius: 3,
        backgroundColor,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
        } : {}
      }}
      onClick={onClick || undefined}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Icon sx={{ 
          fontSize: 40, 
          color,
          mb: 1
        }} />
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          sx={{ 
            color: color,
            mb: 0.5,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
          }}
        >
          {loading ? '...' : value.toLocaleString()}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center"
          sx={{ 
            fontSize: '0.9rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    buttonText, 
    iconColor,
    iconBgColor,
    onClick 
  }: {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    buttonText: string;
    iconColor: string;
    iconBgColor: string;
    onClick: () => void;
  }) => (
    <Card sx={{ 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
      borderRadius: 3,
      minHeight: '240px',
      height: 'auto',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
      }
    }}>
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        p: 3 
      }}>
        {/* Header avec icône et titre */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ 
              backgroundColor: iconBgColor, 
              width: 50, 
              height: 50,
              mr: 2
            }}>
              <Icon sx={{ color: iconColor }} />
            </Avatar>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
              {title}
            </Typography>
          </Box>
          
          {/* Description */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              lineHeight: 1.5,
              fontSize: '0.9rem'
            }}
          >
            {description}
          </Typography>
        </Box>
        
        {/* Bouton d'action */}
        <Box sx={{ mt: 'auto' }}>
          <Button 
            variant="contained" 
            fullWidth
            onClick={onClick}
            sx={{
              backgroundColor: iconColor,
              '&:hover': {
                backgroundColor: iconColor,
                opacity: 0.9,
                transform: 'scale(1.02)'
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.2,
              fontSize: '0.95rem'
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: '#f8fafc', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'rgba(255,255,255,0.95)', 
        borderRadius: 4, 
        p: 3, 
        mb: 4,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="#2d3748"
          sx={{ mb: 1 }}
        >
          Tableau de Bord Administrateur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Accueil → Dashboard
      </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={PeopleIcon} 
            title="UTILISATEURS ACTIFS" 
            value={stats.total_users}
            color="#667eea"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={AssignmentIcon} 
            title="DEMANDES EN COURS" 
            value={stats.pending_requests}
            color="#f093fb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={EuroIcon} 
            title="REVENUS CE MOIS" 
            value={Math.round(stats.total_payments)}
            color="#4facfe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={CategoryIcon} 
            title="TYPES DE TRAITEMENTS" 
            value={treatmentTypes.length}
            color="#43e97b"
          />
        </Grid>
      </Grid>

      {/* Action Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ActionCard
            icon={GroupIcon}
            title="Gestion des Utilisateurs"
            description="Gérez les comptes utilisateurs, les rôles et les permissions. Créez de nouveaux employés et autorisez l'accès aux différents modules."
            buttonText="Gérer les Utilisateurs"
            iconColor="#3b82f6"
            iconBgColor="#dbeafe"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <ActionCard
            icon={SettingsIcon}
            title="Configuration Système"
            description="Configurez les types de traitements, les lois applicables, les frais et les cycles de validation pour optimiser le workflow."
            buttonText="Configurer"
            iconColor="#ef4444"
            iconBgColor="#fecaca"
            onClick={() => navigate('/admin/settings')}
                    />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <ActionCard
            icon={BarChartIcon}
            title="Rapports & Analytics"
            description="Exportez les données, générez des statistiques détaillées et supervisez les performances globales du système."
            buttonText="Voir les Rapports"
            iconColor="#f97316"
            iconBgColor="#fed7aa"
            onClick={() => navigate('/admin/reports')}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ActionCard
            icon={PaymentIcon}
            title="Suivi des Paiements"
            description="Supervisez tous les paiements, validez les transactions et gérez les aspects financiers du système."
            buttonText="Gérer les Paiements"
            iconColor="#10b981"
            iconBgColor="#d1fae5"
            onClick={() => navigate('/admin/payments')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
