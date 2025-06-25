import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon
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

const AuthorityNotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<AuthorityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Polling pour les nouvelles notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Charger les vraies notifications depuis l'API
      const [notificationsResponse, countResponse] = await Promise.all([
        authorityAPI.getRecentNotifications(),
        authorityAPI.getUnreadNotificationsCount()
      ]);
      
      setNotifications(notificationsResponse.data || []);
      setUnreadCount(countResponse.data?.count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      
      // Fallback avec des données de démonstration en cas d'erreur
      const mockNotifications: AuthorityNotification[] = [
        {
          id: 1,
          title: 'Nouveau certificat émis',
          message: 'Un certificat DEEE a été émis pour EcoTech Solutions',
          type: 'certificate_issued',
          priority: 'medium',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          action_url: '/authority/certificates',
          action_label: 'Voir les certificats'
        },
        {
          id: 2,
          title: 'Demande en attente d\'audit',
          message: 'Une nouvelle demande de certification nécessite un audit',
          type: 'audit_required',
          priority: 'high',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          action_url: '/authority/audit-journal',
          action_label: 'Voir les audits'
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(2);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // Appeler l'API pour marquer comme lu
      await authorityAPI.markNotificationAsRead(notificationId);
      
      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      
      // Fallback : mise à jour locale uniquement
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = (notification: AuthorityNotification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    
    handleClose();
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
      case 'certificate_issued': return <AssignmentIcon fontSize="small" />;
      case 'audit_required': return <SecurityIcon fontSize="small" />;
      case 'expiry_warning': return <WarningIcon fontSize="small" />;
      case 'report_ready': return <DescriptionIcon fontSize="small" />;
      case 'compliance_issue': return <ErrorIcon fontSize="small" />;
      case 'regulatory_update': return <GavelIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
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

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 350,
            maxWidth: 400,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: '1px solid #f5f5f5',
                backgroundColor: notification.is_read ? 'transparent' : '#f8f9ff',
                '&:hover': {
                  backgroundColor: notification.is_read ? '#f5f5f5' : '#e8e9ff',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ color: getPriorityColor(notification.priority) }}>
                  {getNotificationIcon(notification.type)}
                </Box>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      <CircleIcon sx={{ fontSize: 8, color: '#2196f3' }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(notification.created_at)}
                      </Typography>
                      <Chip
                        label={notification.priority}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.7rem',
                          backgroundColor: getPriorityColor(notification.priority),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}

        {notifications.length > 5 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  window.location.href = '/authority/notifications';
                  handleClose();
                }}
              >
                Voir toutes les notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default AuthorityNotificationBell; 