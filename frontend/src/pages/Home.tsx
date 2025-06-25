import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  BarChart,
  Balance,
  Public,
  Dashboard,
  Security,
  Nature,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const features = [
    {
      icon: <Search sx={{ fontSize: 48, color: '#6366f1' }} />,
      title: 'Audit Automatisé',
      description: 'Vérification automatique de la conformité selon les standards environnementaux marocains avec génération de rapports détaillés',
    },
    {
      icon: <BarChart sx={{ fontSize: 48, color: '#6366f1' }} />,
      title: 'Analyse Intelligente',
      description: 'Tableaux de bord interactifs avec analyses prédictives et recommandations personnalisées pour améliorer la conformité',
    },
    {
      icon: <Balance sx={{ fontSize: 48, color: '#f59e0b' }} />,
      title: 'Conformité Légale',
      description: 'Suivi en temps réel des réglementations marocaines sur les DEEE avec alertes automatiques des mises à jour',
    },
    {
      icon: <Public sx={{ fontSize: 48, color: '#10b981' }} />,
      title: 'Impact Environnemental',
      description: 'Calcul précis de l\'empreinte carbone et des impacts environnementaux avec propositions d\'amélioration',
    },
    {
      icon: <Dashboard sx={{ fontSize: 48, color: '#8b5cf6' }} />,
      title: 'Interface Intuitive',
      description: 'Plateforme web responsive avec interface utilisateur moderne, accessible depuis tous types d\'appareils',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#f97316' }} />,
      title: 'Sécurité Avancée',
      description: 'Protection des données avec chiffrement de niveau entreprise et conformité aux standards de sécurité internationaux',
    },
  ];

  const stats = [
    { number: '96', label: 'Précision d\'analyse' },
    { number: '24/7', label: 'Monitoring continu' },
    { number: '96', label: 'Conformité légale' },
    { number: '48', label: 'Critères d\'évaluation' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 1
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Nature sx={{ mr: 1, fontSize: 32, color: '#10b981' }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
              EcoCompliance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button 
              color="inherit" 
              sx={{ color: 'white', fontWeight: 500 }}
              onClick={() => scrollToSection('accueil')}
            >
              Accueil
            </Button>
            <Button 
              color="inherit" 
              sx={{ color: 'white', fontWeight: 500 }}
              onClick={() => scrollToSection('fonctionnalites')}
            >
              Fonctionnalités
            </Button>
            <Button 
              color="inherit" 
              sx={{ color: 'white', fontWeight: 500 }}
              onClick={() => scrollToSection('apropos')}
            >
              À propos
            </Button>
            <Button 
              color="inherit" 
              sx={{ color: 'white', fontWeight: 500 }}
              onClick={() => scrollToSection('contact')}
            >
              Contact
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        id="accueil"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '4rem' },
            }}
          >
            Plateforme Intelligente
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              fontSize: { xs: '2.5rem', md: '4rem' },
            }}
          >
            DEEE
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.6,
            }}
          >
            Solution numérique avancée pour la vérification de la conformité
            environnementale des entreprises de gestion des Déchets d'Équipements
            Électriques et Électroniques au Maroc
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#10b981',
                color: 'white',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: '#059669',
                },
              }}
            >
              Commencer l'Évaluation
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => scrollToSection('apropos')}
              sx={{
                color: 'white',
                borderColor: 'white',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.1),
                  borderColor: 'white',
                },
              }}
            >
              En savoir plus
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#ffffff', py: 10 }}>
        <Container maxWidth="lg" id="fonctionnalites">
          <Typography
            variant="h3"
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 8,
              color: '#1f2937',
            }}
          >
            Fonctionnalités Intelligentes
          </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 'bold', mb: 2, color: '#1f2937' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#4b5563', lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index} sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    color: '#10b981',
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}
                >
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ bgcolor: '#f8fafc', py: 10 }}>
        <Container maxWidth="lg" id="apropos">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h2"
                sx={{ fontWeight: 'bold', mb: 4, color: '#1f2937' }}
              >
                À propos de notre mission
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8, color: '#4b5563' }}
              >
                Notre plateforme révolutionne la gestion environnementale des DEEE au Maroc en
                offrant une solution technologique de pointe qui simplifie et automatise la
                vérification de conformité.
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8, color: '#4b5563' }}
              >
                Développée selon les exigences réglementaires marocaines, notre solution
                intègre l'intelligence artificielle pour fournir des analyses précises et des
                recommandations personnalisées.
              </Typography>
            </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 300,
                height: 300,
                mx: 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Nature sx={{ fontSize: 120, color: '#10b981' }} />
            </Box>
          </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        id="contact"
        sx={{
          bgcolor: '#1f2937',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Nature sx={{ mr: 1, fontSize: 28, color: '#10b981' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  EcoCompliance
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Plateforme intelligente dédiée à la vérification de la conformité
                environnementale des entreprises DEEE au Maroc.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#10b981' }}>
                Liens Utiles
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Documentation
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Support technique
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Formations
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  API
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#10b981' }}>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Email: contact@ecocompliance.ma
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Téléphone: +212 5XX XX XX XX
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Adresse: Casablanca, Maroc
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#10b981' }}>
                Réglementation
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Lois marocaines DEEE
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Standards ISO
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Certifications
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Conformité
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              borderTop: '1px solid #374151',
              mt: 6,
              pt: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              © 2025 EcoCompliance. Tous droits réservés. | Conçu pour la conformité environnementale au Maroc
            </Typography>
          </Box>
        </Container>
      </Box>


    </Box>
  );
};

export default Home;