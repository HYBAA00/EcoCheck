import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TablePagination,
  Box as MuiBox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import CreateUserForm from '../../components/admin/CreateUserForm';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    role: '',
    is_active: '',
    search: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        ...filters,
        page: page + 1,
        page_size: rowsPerPage
      });
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError('Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (user, actionType) => {
    setSelectedUser(user);
    setAction(actionType);
    setActionDialogOpen(true);
  };

  const executeAction = async () => {
    try {
      if (action === 'toggle_active') {
        await adminAPI.toggleUserActive(selectedUser.id);
        setSuccess(`Utilisateur ${selectedUser.is_active ? 'désactivé' : 'activé'} avec succès`);
      } else if (action === 'reset_password') {
        const response = await adminAPI.resetUserPassword(selectedUser.id);
        setSuccess(`Mot de passe réinitialisé. Nouveau mot de passe: ${response.data.temp_password}`);
      }
      
      setActionDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      setError('Erreur lors de l\'exécution de l\'action');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#e53e3e';
      case 'enterprise': return '#3182ce';
      case 'employee': return '#38a169';
      case 'authority': return '#d69e2e';
      default: return '#718096';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <SecurityIcon />;
      case 'enterprise': return <BusinessIcon />;
      case 'employee': return <BadgeIcon />;
      case 'authority': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Icon sx={{ color, mr: 1, fontSize: 30 }} />
          <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
      </CardContent>
    </Card>
  );

  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.is_active).length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const enterpriseUsers = users.filter(user => user.role === 'enterprise').length;

    return { totalUsers, activeUsers, adminUsers, enterpriseUsers };
  };

  const stats = getUserStats();

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Gestion des Utilisateurs
      </Typography>

      {/* Alerts */}
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={PersonIcon} 
            title="Total Utilisateurs" 
            value={stats.totalUsers}
            color="#1976d2" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={CheckIcon} 
            title="Utilisateurs Actifs" 
            value={stats.activeUsers}
            color="#2e7d32" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={SecurityIcon} 
            title="Administrateurs" 
            value={stats.adminUsers}
            color="#d32f2f" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={BusinessIcon} 
            title="Entreprises" 
            value={stats.enterpriseUsers}
            color="#ed6c02" 
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Rechercher"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  label="Rôle"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="enterprise">Entreprise</MenuItem>
                  <MenuItem value="employee">Employé</MenuItem>
                  <MenuItem value="authority">Autorité</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.is_active}
                  onChange={(e) => setFilters({...filters, is_active: e.target.value})}
                  label="Statut"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="true">Actif</MenuItem>
                  <MenuItem value="false">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateUserDialogOpen(true)}
                fullWidth
              >
                Nouvel Utilisateur
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Dernière connexion</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: getRoleColor(user.role) }}>
                            {getRoleIcon(user.role)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(user.role),
                            color: 'white',
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Actif' : 'Inactif'}
                          size="small"
                          color={user.is_active ? 'success' : 'error'}
                          variant={user.is_active ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.last_login_formatted || 'Jamais connecté'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          title="Voir détails"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          title="Modifier"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUserAction(user, 'toggle_active')}
                          title={user.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {user.is_active ? <BlockIcon /> : <CheckIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUserAction(user, 'reset_password')}
                          title="Réinitialiser mot de passe"
                        >
                          <SecurityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          Confirmer l'action
        </DialogTitle>
        <DialogContent>
          <Typography>
            {action === 'toggle_active' && 
              `Êtes-vous sûr de vouloir ${selectedUser?.is_active ? 'désactiver' : 'activer'} cet utilisateur ?`
            }
            {action === 'reset_password' && 
              'Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={executeAction} variant="contained" color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Form */}
      <CreateUserForm
        open={createUserDialogOpen}
        onClose={() => setCreateUserDialogOpen(false)}
        onUserCreated={() => {
          fetchUsers(); // Actualiser la liste après création
          setSuccess('Utilisateur créé avec succès !');
        }}
      />
    </Box>
  );
} 