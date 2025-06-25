import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Gavel as GavelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { authorityAPI } from '../../services/api';

interface AuthorityNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const AuthorityNotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<AuthorityNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AuthorityNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, filterType, filterPriority, filterRead]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Charger les vraies notifications depuis l'API
      const response = await authorityAPI.getNotifications();
      const apiNotifications = response.data?.results || response.data || [];
      
      if (apiNotifications.length > 0) {
        setNotifications(apiNotifications);
      } else {
        // Fallback avec des données de démonstration si aucune notification API
        const mockNotifications: AuthorityNotification[] = [
          {
            id: 1,
            title: 'Nouveau certificat émis',
            message: 'Un certificat DEEE a été émis pour EcoTech Solutions. Le certificat #DEEE-2025-8E5B4E46 est maintenant actif.',
            type: 'certificate_issued',
            priority: 'medium',
            is_read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            action_url: '/authority/certificates',
            action_label: 'Voir les certificats',
            metadata: { certificate_number: 'DEEE-2025-8E5B4E46', company: 'EcoTech Solutions' }
          },
          {
            id: 2,
            title: 'Demande en attente d\'audit',
            message: 'Une nouvelle demande de certification de Green Recycling Corp nécessite un audit de conformité.',
            type: 'audit_required',
            priority: 'high',
            is_read: false,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            action_url: '/authority/audit-journal',
            action_label: 'Effectuer l\'audit',
            metadata: { company: 'Green Recycling Corp', request_id: 2 }
          },
          {
            id: 3,
            title: 'Certificat expirant bientôt',
            message: 'Le certificat #CERT-2024-015 d\'EcoTech Solutions expire dans 7 jours. Action requise.',
            type: 'expiry_warning',
            priority: 'urgent',
            is_read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            action_url: '/authority/certificates',
            action_label: 'Renouveler',
            metadata: { certificate_number: 'CERT-2024-015', days_until_expiry: 7 }
          }
        ];
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      // En cas d'erreur, utiliser les données de démonstration
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = notifications;

    // Filtre par texte de recherche
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filtre par priorité
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Filtre par statut de lecture
    if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = (notificationId: number) => {
    authorityAPI.markNotificationAsRead(notificationId)
      .then(() => {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      })
      .catch(error => {
        console.error('Erreur lors du marquage comme lu:', error);
        // Fallback : mise à jour locale
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      });
  };

  const handleMarkAsUnread = (notificationId: number) => {
    // Note: l'API ne supporte pas encore le marquage comme non lu
    // Mise à jour locale uniquement
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: false } : n
      )
    );
  };

  const handleDelete = (notificationId: number) => {
    authorityAPI.deleteNotification(notificationId)
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      })
      .catch(error => {
        console.error('Erreur lors de la suppression:', error);
        // Fallback : suppression locale
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      });
  };

  const handleMarkAllAsRead = () => {
    authorityAPI.markAllNotificationsAsRead()
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      })
      .catch(error => {
        console.error('Erreur lors du marquage global:', error);
        // Fallback : mise à jour locale
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate_issued': return <AssignmentIcon />;
      case 'audit_required': return <SecurityIcon />;
      case 'expiry_warning': return <WarningIcon />;
      case 'report_ready': return <DescriptionIcon />;
      case 'compliance_issue': return <ErrorIcon />;
      case 'regulatory_update': return <GavelIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      certificate_issued: 'Certificat émis',
      audit_required: 'Audit requis',
      expiry_warning: 'Expiration',
      report_ready: 'Rapport prêt',
      compliance_issue: 'Conformité',
      regulatory_update: 'Réglementation'
    };
    return typeLabels[type] || type;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Centre de Notifications
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} non lue{unreadCount !== 1 ? 's' : ''} sur {notifications.length}
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadNotifications}
              disabled={loading}
            >
              Actualiser
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="certificate_issued">Certificats</MenuItem>
                <MenuItem value="audit_required">Audits</MenuItem>
                <MenuItem value="expiry_warning">Expirations</MenuItem>
                <MenuItem value="compliance_issue">Conformité</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={filterPriority}
                label="Priorité"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Faible</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterRead}
                label="Statut"
                onChange={(e) => setFilterRead(e.target.value)}
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="unread">Non lues</MenuItem>
                <MenuItem value="read">Lues</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Actions */}
        {unreadCount > 0 && (
          <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
            <Button
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAllAsRead}
              fullWidth
            >
              Marquer tout comme lu
            </Button>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucune notification trouvée
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: notification.is_read ? 'transparent' : '#f8f9ff',
                      '&:hover': {
                        backgroundColor: notification.is_read ? '#f5f5f5' : '#e8e9ff',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Box sx={{ color: getPriorityColor(notification.priority) }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.is_read ? 'normal' : 'bold',
                              flex: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.is_read && (
                            <CircleIcon sx={{ fontSize: 8, color: '#2196f3', mt: 0.5 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              label={getTypeLabel(notification.type)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={notification.priority}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                backgroundColor: getPriorityColor(notification.priority),
                                color: 'white'
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(notification.created_at)}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {notification.action_url && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => window.location.href = notification.action_url!}
                                  sx={{ fontSize: '0.7rem', py: 0.5 }}
                                >
                                  {notification.action_label || 'Action'}
                                </Button>
                              )}
                              
                              <Tooltip title={notification.is_read ? "Marquer comme non lu" : "Marquer comme lu"}>
                                <IconButton
                                  size="small"
                                  onClick={() => notification.is_read 
                                    ? handleMarkAsUnread(notification.id)
                                    : handleMarkAsRead(notification.id)
                                  }
                                >
                                  {notification.is_read ? <MarkAsUnreadIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(notification.id)}
                                  sx={{ color: '#f44336' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default AuthorityNotificationCenter; 