import React, { useState, useEffect } from 'react';
import { 
  Notifications, 
  Close, 
  CheckCircle, 
  Warning, 
  Info, 
  Schedule, 
  Visibility, 
  VisibilityOff, 
  Delete,
  Payment,
  PersonAdd,
  Assignment
} from '@mui/icons-material';
import { 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  ButtonGroup,
  Tooltip,
  Paper
} from '@mui/material';
import { adminAPI } from '../../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  time_since_created: string;
  action_url?: string;
  action_label?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  onUnreadCountChange 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Données de test pour les notifications
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Nouvelle demande de certification',
      message: 'EcoTech Solutions a soumis une nouvelle demande de certification pour traitement de déchets électroniques',
      notification_type: 'new_request',
      priority: 'high',
      is_read: false,
      is_dismissed: false,
      created_at: new Date().toISOString(),
      time_since_created: 'il y a 2 minutes',
      action_url: '/admin/certification-requests',
      action_label: 'Voir la demande'
    },
    {
      id: 2,
      title: 'Paiement reçu',
      message: 'Paiement de 3500 MAD reçu pour la certification #CR-2024-001',
      notification_type: 'payment_received',
      priority: 'medium',
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      time_since_created: 'il y a 30 minutes',
      action_url: '/admin/payments',
      action_label: 'Voir le paiement'
    },
    {
      id: 3,
      title: 'Nouvel utilisateur enregistré',
      message: 'Green Recycling Corp s\'est inscrit sur la plateforme',
      notification_type: 'user_registered',
      priority: 'low',
      is_read: true,
      is_dismissed: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      time_since_created: 'il y a 2 heures',
      action_url: '/admin/users',
      action_label: 'Voir l\'utilisateur'
    },
    {
      id: 4,
      title: 'Échéance approche',
      message: 'Le certificat #CERT-2024-015 expire dans 7 jours',
      notification_type: 'deadline_approaching',
      priority: 'urgent',
      is_read: false,
      is_dismissed: false,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      time_since_created: 'il y a 4 heures',
      action_url: '/admin/certificates',
      action_label: 'Voir le certificat'
    },
    {
      id: 5,
      title: 'Alerte système',
      message: 'Le serveur de génération de certificats a redémarré avec succès',
      notification_type: 'system_alert',
      priority: 'medium',
      is_read: true,
      is_dismissed: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      time_since_created: 'il y a 1 jour',
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let apiNotifications = [];
      
      try {
        // Essayer d'abord l'API réelle
        const response = await adminAPI.getNotifications();
        apiNotifications = response.data.results || response.data;
      } catch (apiError) {
        console.warn('API non disponible, utilisation des données de test:', apiError);
        // Fallback avec les données de test
        apiNotifications = mockNotifications;
      }
      
      let filteredNotifications = apiNotifications;
      
      // Appliquer les filtres
      if (filter === 'unread') {
        filteredNotifications = filteredNotifications.filter((n: any) => !n.is_read);
      } else if (filter === 'urgent') {
        filteredNotifications = filteredNotifications.filter((n: any) => 
          n.priority === 'urgent' || n.priority === 'high'
        );
      }
      
      setNotifications(filteredNotifications);
      
      // Mettre à jour le compteur de notifications non lues
      const unreadCount = filteredNotifications.filter((n: any) => !n.is_read && !n.is_dismissed).length;
      onUnreadCountChange?.(unreadCount);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    fetchNotifications();
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetchNotifications();
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    fetchNotifications();
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetchNotifications();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';  
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_request': return <Assignment color="primary" />;
      case 'payment_received': return <Payment color="success" />;
      case 'user_registered': return <PersonAdd color="info" />;
      case 'system_alert': return <Warning color="warning" />;
      case 'deadline_approaching': return <Schedule color="error" />;
      default: return <Notifications color="action" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const toggleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedNotifications = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 400 } }}
    >
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Notifications sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
          <IconButton color="inherit" onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Filtres */}
      <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
        <ButtonGroup variant="outlined" size="small" fullWidth>
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button 
            variant={filter === 'unread' ? 'contained' : 'outlined'}
            onClick={() => setFilter('unread')}
          >
            Non lues
          </Button>
          <Button 
            variant={filter === 'urgent' ? 'contained' : 'outlined'}
            onClick={() => setFilter('urgent')}
          >
            Urgentes
          </Button>
        </ButtonGroup>
      </Box>

      {/* Actions */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={markAllAsRead} color="primary">
              Tout marquer comme lu
            </Button>
            {selectedNotifications.length > 0 && (
              <Button 
                size="small" 
                onClick={deleteSelectedNotifications} 
                color="error"
                startIcon={<Delete />}
              >
                Supprimer ({selectedNotifications.length})
              </Button>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {notifications.length} notification(s)
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Liste des notifications */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                <Notifications sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography>Aucune notification</Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: !notification.is_read ? 'action.hover' : 'transparent',
                    borderLeft: !notification.is_read ? 4 : 0,
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelectNotification(notification.id)}
                    size="small"
                  />
                  
                  <ListItemIcon>
                    {getTypeIcon(notification.notification_type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ fontWeight: !notification.is_read ? 'bold' : 'normal' }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip 
                          label={notification.priority} 
                          size="small" 
                          color={getPriorityColor(notification.priority) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time_since_created}
                          </Typography>
                          {notification.action_label && (
                            <Button 
                              size="small" 
                              onClick={() => handleNotificationClick(notification)}
                            >
                              {notification.action_label}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box>
                      {!notification.is_read && (
                        <Tooltip title="Marquer comme lu">
                          <IconButton size="small" onClick={() => markAsRead(notification.id)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Ignorer">
                        <IconButton size="small" onClick={() => dismissNotification(notification.id)}>
                          <VisibilityOff />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => deleteNotification(notification.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationCenter; 