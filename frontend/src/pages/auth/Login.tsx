import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Container,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  Nature,
  ArrowBack,
} from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const validationSchema = Yup.object({
  email: Yup.string().email('Adresse email invalide').required("L'adresse email est requise"),
  password: Yup.string().required('Le mot de passe est requis').min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string }) => {
  setIsSubmitting(true);
  setError(null);
  try {
    dispatch(loginStart());
      
      console.log('Login attempt with:', values);
      
      // Appel à l'API de connexion JWT
      const response = await authAPI.login(values);
      
      console.log('Login response:', response.data);
      
      // Extraire les données de la réponse JWT
      const { access, user } = response.data;
      
      // Dispatch avec le bon format
      dispatch(loginSuccess({ 
        user: user, 
        token: access 
      }));

    // Redirection selon le rôle
      const role = user.role;
      console.log('Redirecting user with role:', role);
      
    switch (role) {
        case 'admin': 
          navigate('/admin/dashboard'); 
          break;
        case 'enterprise': 
          navigate('/enterprise/dashboard'); 
          break;
        case 'employee': 
          navigate('/employee/dashboard'); 
          break;
        case 'authority': 
          navigate('/authority/dashboard'); 
          break;
        default: 
          navigate('/');
    }
  } catch (err: any) {
      console.error('Login error:', err);
    const errorMessage = err.response?.data?.detail || 'Une erreur est survenue lors de la connexion';
    dispatch(loginFailure(errorMessage));
    setError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};


  const handleTogglePassword = () => setShowPassword((prev) => !prev);


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
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/ECO CHECK LOGO.png" 
              alt="EcoCheck Logo" 
              style={{ height: 40, width: 'auto', marginRight: '12px' }} 
            />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
              EcoCheck
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Login Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper 
            elevation={0}
            sx={{ 
              p: 6, 
              borderRadius: 4,
              backgroundColor: 'white',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar 
                sx={{ 
                  bgcolor: '#667eea', 
                  width: 64, 
                  height: 64, 
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
          <LockOutlined sx={{ fontSize: 32 }} />
        </Avatar>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  mb: 1
                }}
              >
                Connexion
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#6b7280',
                  fontSize: '1.1rem'
                }}
              >
                Connectez-vous à votre compte EcoCheck
              </Typography>
            </Box>

        <Formik initialValues={{ email: '', password: '' }} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form>
                  {error && (
                    <Box 
                      sx={{ 
                        mb: 3, 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: '#fef2f2',
                        border: '1px solid #fecaca'
                      }}
                    >
                      <Typography 
                        color="error" 
                        variant="body2" 
                        sx={{ textAlign: 'center', fontWeight: 500 }}
                      >
                        {error}
                      </Typography>
                    </Box>
                  )}

                  <TextField 
                    margin="normal" 
                    required 
                    fullWidth 
                    id="email" 
                    label="Adresse email" 
                    name="email" 
                    autoComplete="email" 
                    autoFocus 
                    value={values.email} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    error={touched.email && Boolean(errors.email)} 
                    helperText={touched.email && errors.email} 
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      },
                    }} 
                  />

                  <TextField 
                    margin="normal" 
                    required 
                    fullWidth 
                    name="password" 
                    label="Mot de passe" 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    autoComplete="current-password" 
                    value={values.password} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    error={touched.password && Boolean(errors.password)} 
                    helperText={touched.password && errors.password} 
                    InputProps={{ 
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            aria-label="toggle password visibility" 
                            onClick={handleTogglePassword} 
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ) 
                    }} 
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#667eea',
                      },
                    }} 
                  />

                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    disabled={isSubmitting} 
                    sx={{ 
                      py: 2, 
                      mb: 3, 
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      },
                      '&:disabled': {
                        background: '#9ca3af',
                      },
                      position: 'relative',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ 
                          position: 'absolute', 
                          color: 'white'
                        }} 
                      />
                    ) : (
                      'Se connecter'
                    )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Vous n'avez pas de compte ?
                    </Typography>
                    <Link 
                      component={RouterLink} 
                      to="/register" 
                      sx={{ 
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        '&:hover': { 
                          textDecoration: 'underline',
                          color: '#5a67d8'
                        } 
                      }}
                    >
                      Inscrivez-vous
                    </Link>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
        </Container>
      </Box>
    </Box>
  );
}