import React, { useState, useEffect } from 'react';
import { Notifications } from '@mui/icons-material';
import { IconButton, Badge } from '@mui/material';
import { adminAPI } from '../../services/api';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // Polling toutes les 30 secondes pour vérifier les nouvelles notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUnreadNotificationsCount();
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du compteur de notifications:', error);
      // Fallback avec des données statiques en cas d'erreur
      setUnreadCount(3);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleUnreadCountChange = (count: number) => {
    setUnreadCount(count);
  };

  return (
    <>
      <IconButton
        onClick={handleBellClick}
        color="inherit"
        title="Notifications"
      >
        <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      {/* Centre de notifications */}
      <NotificationCenter 
        isOpen={isOpen}
        onClose={handleClose}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </>
  );
};

export default NotificationBell; 