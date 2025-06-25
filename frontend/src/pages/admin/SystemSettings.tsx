import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Category as CategoryIcon,
  MonetizationOn as MoneyIcon,
  Gavel as LawIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SystemSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [laws, setLaws] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configs, types, lawsData, fees] = await Promise.all([
        adminAPI.getSystemConfigs(),
        adminAPI.getTreatmentTypes(),
        adminAPI.getLaws(),
        adminAPI.getFeeStructures(),
      ]);

      setSystemConfigs(configs.data);
      setTreatmentTypes(types.data);
      setLaws(lawsData.data);
      setFeeStructures(fees.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setEditingType(type);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    
    try {
      if (editingType === 'config' && editingItem.id) {
        await adminAPI.updateSystemConfig(editingItem.id, editingItem);
      } else if (editingType === 'treatment-type') {
        if (editingItem.id) {
          await adminAPI.updateTreatmentType(editingItem.id, editingItem);
        } else {
          await adminAPI.createTreatmentType(editingItem);
        }
      } else if (editingType === 'law') {
        if (editingItem.id) {
          await adminAPI.updateLaw(editingItem.id, editingItem);
        } else {
          await adminAPI.createLaw(editingItem);
        }
      } else if (editingType === 'fee-structure') {
        if (editingItem.id) {
          await adminAPI.updateFeeStructure(editingItem.id, editingItem);
        } else {
          await adminAPI.createFeeStructure(editingItem);
        }
      }

      setSuccess('Configuration mise à jour avec succès');
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    }
  };

  const renderSystemConfigs = () => (
    <Grid container spacing={3}>
      {systemConfigs.map((config: any) => (
        <Grid item xs={12} md={6} key={config.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{config.name}</Typography>
                <IconButton onClick={() => handleEdit(config, 'config')}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {config.description}
              </Typography>
              <Chip label={config.category} size="small" sx={{ mb: 1 }} />
              <Typography variant="body1" fontWeight="bold">
                Valeur: {String(config.typed_value)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTreatmentTypes = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Types de Traitement</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit({
            name: '',
            code: '',
            description: '',
            certification_fee: 0,
            is_active: true
          }, 'treatment-type')}
        >
          Nouveau Type
        </Button>
      </Box>
      
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Frais de certification</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {treatmentTypes.map((type: any) => (
              <TableRow key={type.id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.code}</TableCell>
                <TableCell>{type.certification_fee} MAD</TableCell>
                <TableCell>
                  <Chip 
                    label={type.is_active ? 'Actif' : 'Inactif'} 
                    color={type.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(type, 'treatment-type')}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderLaws = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Lois et Réglementations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit({
            title: '',
            number: '',
            article: '',
            description: '',
            content: '',
            category: 'deee',
            is_active: true
          }, 'law')}
        >
          Nouvelle Loi
        </Button>
      </Box>
      
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Numéro</TableCell>
              <TableCell>Article</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {laws.map((law: any) => (
              <TableRow key={law.id}>
                <TableCell>{law.title}</TableCell>
                <TableCell>{law.number}</TableCell>
                <TableCell>{law.article}</TableCell>
                <TableCell>
                  <Chip label={law.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={law.is_active ? 'Actif' : 'Inactif'} 
                    color={law.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(law, 'law')}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderFeeStructures = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Structures de Frais</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit({
            name: '',
            description: '',
            base_fee: 0,
            admin_fee: 0,
            inspection_fee: 0,
            urgent_processing_fee: 0,
            tax_rate: 20,
            treatment_type: '',
            is_active: true
          }, 'fee-structure')}
        >
          Nouvelle Structure
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {feeStructures.map((fee: any) => (
          <Grid item xs={12} md={6} key={fee.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{fee.name}</Typography>
                  <IconButton onClick={() => handleEdit(fee, 'fee-structure')}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {fee.treatment_type_name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Frais de base:</Typography>
                  <Typography variant="body2" fontWeight="bold">{fee.base_fee} MAD</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total avec TVA:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {fee.total_with_tax} MAD
                  </Typography>
                </Box>
                <Chip 
                  label={fee.is_active ? 'Actif' : 'Inactif'} 
                  color={fee.is_active ? 'success' : 'error'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Configuration du Système
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SettingsIcon />} label="Configuration Système" />
          <Tab icon={<CategoryIcon />} label="Types de Traitement" />
          <Tab icon={<LawIcon />} label="Lois et Réglementations" />
          <Tab icon={<MoneyIcon />} label="Structures de Frais" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderSystemConfigs()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderTreatmentTypes()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderLaws()}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderFeeStructures()}
        </TabPanel>
      </Card>

      {/* Dialog pour édition */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingType === 'config' && 'Modifier Configuration'}
          {editingType === 'treatment-type' && (editingItem?.id ? 'Modifier Type de Traitement' : 'Nouveau Type de Traitement')}
          {editingType === 'law' && (editingItem?.id ? 'Modifier Loi' : 'Nouvelle Loi')}
          {editingType === 'fee-structure' && (editingItem?.id ? 'Modifier Structure de Frais' : 'Nouvelle Structure de Frais')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {editingType === 'treatment-type' && editingItem && (
              <>
                <TextField
                  fullWidth
                  label="Nom"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Code"
                  value={editingItem.code || ''}
                  onChange={(e) => setEditingItem({...editingItem, code: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingItem.is_active || false}
                      onChange={(e) => setEditingItem({...editingItem, is_active: e.target.checked})}
                    />
                  }
                  label="Actif"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 