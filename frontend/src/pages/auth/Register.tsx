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
  Container,
  MenuItem,
  Paper,
  Avatar,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Nature,
  ArrowBack,
} from '@mui/icons-material';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const roleOptions = [
  { value: 'enterprise', label: 'Entreprise' },
];

const initialValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'enterprise',
  // Entreprise
  business_name: '',
  ice_number: '',
  rc_number: '',
  responsible_name: '',
  address: '',
};

const validationSchema = Yup.object({
  username: Yup.string().required('Nom d\'utilisateur requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, '6 caractères minimum').required('Mot de passe requis'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas').required('Confirmation requise'),
  role: Yup.string().required('Rôle requis'),
});

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    const dataToSend: any = {
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role,
      business_name: values.business_name,
      ice_number: values.ice_number,
      rc_number: values.rc_number,
      responsible_name: values.responsible_name,
      address: values.address,
    };
    try {
      await authAPI.register(dataToSend);
      setSuccess('Inscription réussie !');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Une erreur s'est produite lors de l'inscription";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Validation des champs entreprise
  const validateRoleFields = (values: any) => {
    const errors: Record<string, string> = {};
    if (!values.business_name) errors.business_name = 'Champ obligatoire';
    if (!values.ice_number) errors.ice_number = 'Champ obligatoire';
    if (!values.rc_number) errors.rc_number = 'Champ obligatoire';
    if (!values.responsible_name) errors.responsible_name = 'Champ obligatoire';
    if (!values.address) errors.address = 'Champ obligatoire';
    return errors;
  };

  const renderRoleFields = (values: any, errors: any, touched: any, handleChange: any, handleBlur: any) => {
    const fieldStyle = {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': { borderColor: '#667eea' },
        '&.Mui-focused fieldset': { borderColor: '#667eea' },
      },
      '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
    };

    return (
      <>
        <TextField 
          fullWidth 
          label="Raison sociale" 
          name="business_name" 
          value={values.business_name} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          error={!!errors.business_name && touched.business_name} 
          helperText={touched.business_name && errors.business_name} 
          sx={fieldStyle}
        />
        <TextField 
          fullWidth 
          label="ICE" 
          name="ice_number" 
          value={values.ice_number} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          error={!!errors.ice_number && touched.ice_number} 
          helperText={touched.ice_number && errors.ice_number} 
          sx={fieldStyle}
        />
        <TextField 
          fullWidth 
          label="RC" 
          name="rc_number" 
          value={values.rc_number} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          error={!!errors.rc_number && touched.rc_number} 
          helperText={touched.rc_number && errors.rc_number} 
          sx={fieldStyle}
        />
        <TextField 
          fullWidth 
          label="Responsable" 
          name="responsible_name" 
          value={values.responsible_name} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          error={!!errors.responsible_name && touched.responsible_name} 
          helperText={touched.responsible_name && errors.responsible_name} 
          sx={fieldStyle}
        />
        <TextField 
          fullWidth 
          label="Adresse" 
          name="address" 
          value={values.address} 
          onChange={handleChange} 
          onBlur={handleBlur} 
          error={!!errors.address && touched.address} 
          helperText={touched.address && errors.address} 
          sx={{ ...fieldStyle, gridColumn: '1 / -1' }}
        />
      </>
    );
  };

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

      {/* Register Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          py: 4,
        }}
      >
        <Container maxWidth="md">
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
                <PersonAdd sx={{ fontSize: 32 }} />
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
                Inscription
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#6b7280',
                  fontSize: '1.1rem'
                }}
              >
                Créez votre compte EcoCheck
              </Typography>
            </Box>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validate={validateRoleFields}
              onSubmit={handleSubmit}
            >
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
                  {success && (
                    <Box 
                      sx={{ 
                        mb: 3, 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: '#f0fdf4',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <Typography 
                        sx={{ 
                          color: '#166534', 
                          textAlign: 'center', 
                          fontWeight: 500 
                        }}
                      >
                        {success}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      required
                      name="username"
                      label="Nom d'utilisateur"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      name="email"
                      label="Adresse email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      required
                      name="password"
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      name="confirmPassword"
                      label="Confirmer le mot de passe"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleToggleConfirmPassword} edge="end">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' },
                      }}
                    />
                  </Box>

                  {/* Informations entreprise */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1f2937', fontWeight: 600 }}>
                      Informations de l'entreprise
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      {renderRoleFields(values, errors, touched, handleChange, handleBlur)}
                    </Box>
                  </Box>

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
                      'S\'inscrire'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Vous avez déjà un compte ?
                    </Typography>
                    <Link 
                      component={RouterLink} 
                      to="/login" 
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
                      Se connecter
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