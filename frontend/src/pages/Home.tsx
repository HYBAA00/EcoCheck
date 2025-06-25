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
import { styled } from '@mui/material/styles';


// Styled components with animations
const AnimatedButton = styled(Button)`
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  &:hover {
    animation: pulse 1s infinite;
  }
`;

const GradientBackground = styled(Box)`
  background: linear-gradient(135deg, #00A896 0%, #1976d2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
    animation: rotate 30s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LogoContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'white',
          backdropFilter: 'blur(10px)',
          py: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <LogoContainer>
            <img 
              src="/ECO CHECK LOGO.png" 
              alt="EcoCheck Logo" 
              style={{ height: 40, width: 'auto' }} 
            />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#00A896',
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              EcoCheck
            </Typography>
          </LogoContainer>

          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 3 },
            '& .MuiButton-root': {
              color: '#333',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                backgroundColor: 'rgba(0, 168, 150, 0.1)'
              }
            }
          }}>
            <Button color="inherit" onClick={() => scrollToSection('accueil')}>Accueil</Button>
            <Button color="inherit" onClick={() => scrollToSection('fonctionnalites')}>Fonctionnalités</Button>
            <Button color="inherit" onClick={() => scrollToSection('apropos')}>À propos</Button>
            <Button color="inherit" onClick={() => scrollToSection('contact')}>Contact</Button>
            <AnimatedButton 
              variant="contained" 
              sx={{ 
                bgcolor: '#00A896',
                color: 'white',
                '&:hover': {
                  bgcolor: '#008080'
                }
              }}
              onClick={() => navigate('/login')}
            >
              Se connecter
            </AnimatedButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <GradientBackground
        id="accueil"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          pt: 8,
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Box sx={{ 
            maxWidth: '800px', 
            mx: 'auto',
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
                mb: 3,
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                lineHeight: 1.2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
          >
              Gérez vos certifications<br />en toute simplicité
          </Typography>

          <Typography
              variant="h5"
            sx={{
              mb: 6,
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.2rem' },
              lineHeight: 1.6,
                maxWidth: '600px',
                mx: 'auto'
            }}
          >
            Solution numérique avancée pour la vérification de la conformité
              environnementale des entreprises de gestion des DEEE au Maroc
          </Typography>

            <AnimatedButton
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#00A896',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#008080',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                }
              }}
            >
              COMMENCER L'ÉVALUATION
            </AnimatedButton>
          </Box>
        </Container>
      </GradientBackground>

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
          bgcolor: 'white',
          color: '#333',
          py: 6,
          boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img 
                  src="/ECO CHECK LOGO.png" 
                  alt="EcoCheck Logo" 
                  style={{ height: 28, width: 'auto', marginRight: '8px' }} 
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00A896' }}>
                  EcoCheck
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4b5563' }}>
                Plateforme intelligente dédiée à la vérification de la conformité
                environnementale des entreprises DEEE au Maroc.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#00A896' }}>
                Liens Utiles
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Documentation
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Support technique
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Formations
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  API
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#00A896' }}>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                  Email: contact@ecocheck.ma
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                  Téléphone: +212 5XX XX XX XX
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                  Adresse: Casablanca, Maroc
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#00A896' }}>
                Réglementation
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Lois marocaines DEEE
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Standards ISO
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Certifications
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', '&:hover': { color: '#00A896' } }}>
                  Conformité
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              borderTop: '1px solid #e5e7eb',
              mt: 6,
              pt: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#4b5563' }}>
              © 2025 EcoCheck. Tous droits réservés. | Conçu pour la conformité environnementale au Maroc
            </Typography>
          </Box>
        </Container>
      </Box>


    </Box>
  );
};

export default Home;