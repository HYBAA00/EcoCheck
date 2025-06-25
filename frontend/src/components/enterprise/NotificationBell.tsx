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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}

export default function EnterpriseNotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data pour les notifications entreprise
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: "Demande Approuvée",
      message: "Votre demande de certification #004 a été approuvée. Vous pouvez maintenant télécharger votre certificat.",
      type: "request_approved",
      priority: "high",
      is_read: false,
      created_at: "2024-01-20T10:30:00Z",
      action_url: "/enterprise/certificates",
      action_label: "Voir certificat"
    },
    {
      id: 2,
      title: "Paiement Requis",
      message: "Le paiement pour votre demande de certification #005 est maintenant requis.",
      type: "payment_required",
      priority: "medium",
      is_read: false,
      created_at: "2024-01-19T15:45:00Z",
      action_url: "/enterprise/payment/5",
      action_label: "Effectuer le paiement"
    },
    {
      id: 3,
      title: "Certificat Expirant",
      message: "Votre certificat DEEE-2024-ABC123 expire dans 30 jours. Pensez à renouveler votre certification.",
      type: "certificate_expiring",
      priority: "medium",
      is_read: true,
      created_at: "2024-01-18T09:15:00Z",
      action_url: "/enterprise/certification-form",
      action_label: "Renouveler"
    },
    {
      id: 4,
      title: "Informations Manquantes",
      message: "Des informations supplémentaires sont requises pour votre demande #006.",
      type: "info_required",
      priority: "high",
      is_read: false,
      created_at: "2024-01-17T14:20:00Z",
      action_url: "/enterprise/requests/6",
      action_label: "Compléter"
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_approved':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'payment_required':
        return <PaymentIcon sx={{ color: '#ff9800' }} />;
      case 'certificate_expiring':
        return <WarningIcon sx={{ color: '#ff5722' }} />;
      case 'info_required':
        return <AssignmentIcon sx={{ color: '#2196f3' }} />;
      case 'regulation_update':
        return <InfoIcon sx={{ color: '#9c27b0' }} />;
      default:
        return <CircleIcon sx={{ color: '#757575' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#f44336';
      case 'high':
        return '#ff9800';
      case 'medium':
        return '#2196f3';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          mr: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
              Aucune notification
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                borderLeft: notification.is_read ? 'none' : `3px solid ${getPriorityColor(notification.priority)}`,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                py: 1.5,
                px: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.priority}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: getPriorityColor(notification.priority),
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(notification.created_at)}
                      </Typography>
                      {notification.action_label && (
                        <Typography variant="caption" sx={{ 
                          color: 'primary.main',
                          fontWeight: 500
                        }}>
                          {notification.action_label}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
} 