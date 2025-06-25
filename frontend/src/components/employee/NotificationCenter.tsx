import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { employeeAPI } from '../../services/api';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  useEffect(() => {
    loadNotifications();
    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Charger les statistiques pour générer les notifications
      const response = await employeeAPI.getDashboardStats();
      const stats = response.data;
      
      const newNotifications: Notification[] = [];
      
      // Notification pour les demandes en attente
      if (stats.pending_review > 0) {
        newNotifications.push({
          id: 'pending-review',
          type: 'info',
          title: 'Demandes en attente',
          message: `${stats.pending_review} demande${stats.pending_review > 1 ? 's' : ''} en attente de révision`,
          timestamp: new Date(),
          read: false
        });
      }
      
      // Notification pour les demandes approuvées aujourd'hui
      if (stats.approved_today > 0) {
        newNotifications.push({
          id: 'approved-today',
          type: 'success',
          title: 'Demandes approuvées',
          message: `${stats.approved_today} demande${stats.approved_today > 1 ? 's' : ''} approuvée${stats.approved_today > 1 ? 's' : ''} aujourd'hui`,
          timestamp: new Date(),
          read: false
        });
      }
      
      // Notification pour les nouvelles assignations
      if (stats.assigned_to_me > 0) {
        newNotifications.push({
          id: 'assigned-to-me',
          type: 'warning',
          title: 'Nouvelles assignations',
          message: `Vous avez ${stats.assigned_to_me} demande${stats.assigned_to_me > 1 ? 's' : ''} assignée${stats.assigned_to_me > 1 ? 's' : ''}`,
          timestamp: new Date(),
          read: false
        });
      }
      
      // Notification générale
      newNotifications.push({
        id: 'general-reminder',
        type: 'warning',
        title: 'Rappel',
        message: 'Pensez à vérifier les nouvelles demandes soumises',
        timestamp: new Date(),
        read: false
      });
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '350px',
            maxHeight: '400px',
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''}`}
              size="small"
              color="primary"
              onClick={markAllAsRead}
            />
          )}
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.read ? 'transparent' : 'rgba(103, 126, 234, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(103, 126, 234, 0.2)'
                  },
                  borderLeft: `4px solid ${
                    notification.type === 'info' ? '#2196f3' :
                    notification.type === 'warning' ? '#ff9800' :
                    notification.type === 'success' ? '#4caf50' : '#f44336'
                  }`
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp.toLocaleTimeString('fr-FR')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Actualisation automatique toutes les 30 secondes
          </Typography>
        </Box>
      </Menu>
    </>
  );
} 