import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { certificationAPI, treatmentTypeAPI, lawAPI } from '../../services/api';

const steps = ['Informations de traitement', 'Détails de conformité', 'Révision et soumission'];

interface TreatmentType {
  id: number;
  name: string;
  description: string;
}

interface Law {
  id: number;
  title: string;
  description: string;
}

const validationSchema = [
  // Étape 1
  Yup.object({
    treatment_type: Yup.string().required('Le type de traitement est requis'),
    waste_description: Yup.string().required('La description des déchets est requise'),
    estimated_quantity: Yup.number()
      .required('La quantité estimée est requise')
      .positive('La quantité doit être un nombre positif'),
  }),
  // Étape 2
  Yup.object({
    compliance_details: Yup.string().required('Les détails de conformité sont requis'),
    selected_laws: Yup.array()
      .of(Yup.number())
      .min(1, 'Au moins une loi doit être sélectionnée'),
  }),
  // Étape 3 - Révision
  Yup.object({}),
];

export default function CertificationRequest() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [treatmentTypes, setTreatmentTypes] = useState<TreatmentType[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [treatmentTypesResponse, lawsResponse] = await Promise.all([
          treatmentTypeAPI.getTreatmentTypes(),
          lawAPI.getLaws(),
        ]);
        setTreatmentTypes(treatmentTypesResponse.data);
        setLaws(lawsResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (values: any) => {
    if (activeStep === steps.length - 1) {
      try {
        await certificationAPI.createRequest(values);
        navigate('/certifications');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erreur lors de la soumission de la demande');
      }
    } else {
      handleNext();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Nouvelle demande de certification
      </Typography>

      <Stepper activeStep={activeStep} sx={{ py: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={{
          treatment_type: '',
          waste_description: '',
          estimated_quantity: '',
          compliance_details: '',
          selected_laws: [],
          additional_notes: '',
        }}
        validationSchema={validationSchema[activeStep]}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Box sx={{ mt: 2 }}>
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      name="treatment_type"
                      label="Type de traitement"
                      value={values.treatment_type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.treatment_type && Boolean(errors.treatment_type)}
                      helperText={touched.treatment_type && errors.treatment_type}
                    >
                      {treatmentTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="waste_description"
                      label="Description des déchets"
                      value={values.waste_description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.waste_description && Boolean(errors.waste_description)}
                      helperText={touched.waste_description && errors.waste_description}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      name="estimated_quantity"
                      label="Quantité estimée (kg)"
                      value={values.estimated_quantity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.estimated_quantity && Boolean(errors.estimated_quantity)}
                      helperText={touched.estimated_quantity && errors.estimated_quantity}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      SelectProps={{
                        multiple: true
                      }}
                      name="selected_laws"
                      label="Lois applicables"
                      value={values.selected_laws}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.selected_laws && Boolean(errors.selected_laws)}
                      helperText={touched.selected_laws && errors.selected_laws}
                    >
                      {laws.map((law) => (
                        <MenuItem key={law.id} value={law.id}>
                          {law.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="compliance_details"
                      label="Détails de conformité"
                      value={values.compliance_details}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.compliance_details && Boolean(errors.compliance_details)}
                      helperText={touched.compliance_details && errors.compliance_details}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Révision de votre demande
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Type de traitement</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {treatmentTypes.find((t) => t.id === Number(values.treatment_type))?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Description des déchets</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {values.waste_description}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Quantité estimée</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {values.estimated_quantity} kg
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Lois sélectionnées</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {values.selected_laws
                          .map((lawId) => laws.find((l) => l.id === lawId)?.title)
                          .join(', ')}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Détails de conformité</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {values.compliance_details}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Retour
                  </Button>
                )}
                <Button
                  variant="contained"
                  type="submit"
                >
                  {activeStep === steps.length - 1 ? 'Soumettre' : 'Suivant'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
} 