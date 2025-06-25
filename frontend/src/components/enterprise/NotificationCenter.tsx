import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
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

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export default function EnterpriseNotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');

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
      message: "Le paiement pour votre demande de certification #005 est maintenant requis. Montant: 2,500 MAD",
      type: "payment_required",
      priority: "urgent",
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
    if (open) {
      setNotifications(mockNotifications);
    }
  }, [open]);

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
      default:
        return <InfoIcon sx={{ color: '#757575' }} />;
    }
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const handleDeleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.is_read;
      case 'urgent': return notification.priority === 'urgent';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 450, maxWidth: '90vw' }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              size="small"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Tout marquer comme lu
            </Button>
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel>Filtrer</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Filtrer"
            >
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="unread">Non lues</MenuItem>
              <MenuItem value="urgent">Urgentes</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Alert severity="info">
                Aucune notification
              </Alert>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                      borderLeft: notification.is_read ? 'none' : `4px solid ${getPriorityColor(notification.priority)}`,
                      cursor: 'pointer',
                      alignItems: 'flex-start',
                      py: 2
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ mt: 0.5 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: notification.is_read ? 400 : 600,
                            flex: 1
                          }}>
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.priority}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: getPriorityColor(notification.priority),
                              color: 'white'
                            }}
                          />
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(notification.created_at)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {notification.action_label && (
                                <Typography variant="caption" sx={{ 
                                  color: 'primary.main',
                                  fontWeight: 500
                                }}>
                                  {notification.action_label}
                                </Typography>
                              )}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
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
} 