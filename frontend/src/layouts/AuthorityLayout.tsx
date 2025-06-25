import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';
import AuthorityNotificationBell from '../components/authority/NotificationBell';
import AuthorityNotificationCenter from '../components/authority/NotificationCenter';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Tableau de bord',
    icon: <DashboardIcon />,
    path: '/authority/dashboard',
    color: '#667eea'
  },
  {
    text: 'Consultation Certificats',
    icon: <SecurityIcon />,
    path: '/authority/certificates',
    color: '#4CAF50'
  },
  {
    text: 'Journal d\'Audit',
    icon: <AssignmentIcon />,
    path: '/authority/audit-journal',
    color: '#2196F3'
  },
  {
    text: 'Rapport d\'Audit',
    icon: <AssessmentIcon />,
    path: '/authority/audit-report',
    color: '#FF9800'
  },
  {
    text: 'Export Historiques',
    icon: <GetAppIcon />,
    path: '/authority/export',
    color: '#9C27B0'
  },
  {
    text: 'Documents Lecture',
    icon: <VisibilityIcon />,
    path: '/authority/documents',
    color: '#607D8B'
  },
];

export default function AuthorityLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Logo/Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <img 
            src="/ECO CHECK LOGO.png" 
            alt="EcoCheck Logo" 
            style={{ height: 40, width: 'auto' }} 
          />
        </Box>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          EcoCheck
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Interface Autorité
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                  py: 1.5,
                  px: 2,
                }}
                selected={isActive}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  minWidth: 40 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', display: 'block' }}>
          Version 1.0.0 - Autorité
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          ml: 0,
          bgcolor: 'white',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="ouvrir le menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img 
              src="/ECO CHECK LOGO.png" 
              alt="EcoCheck Logo" 
              style={{ height: 40, width: 'auto' }} 
            />
            <Typography variant="h6" noWrap component="div" sx={{ color: '#00A896', mr: 2 }}>
              EcoCheck
            </Typography>
          </Box>
            
          {/* Menu items in navbar for desktop - centered */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            gap: 1
          }}>
            {menuItems.map((item) => (
              <IconButton
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: '#4B5563',
                  flexDirection: 'column',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  minWidth: '80px',
                  '&:hover': {
                    bgcolor: '#f3f4f6',
                    color: '#00A896'
                  }
                }}
              >
                {item.icon}
                <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>
                  {item.text}
                </Typography>
              </IconButton>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#4B5563', display: { xs: 'none', sm: 'block' } }}>
              Bonjour, {user?.first_name} {user?.last_name}
            </Typography>
            <AuthorityNotificationBell />
            
            {/* Logout button in navbar */}
            <IconButton
              onClick={handleLogout}
              sx={{
                color: '#EF4444',
                '&:hover': {
                  bgcolor: '#fef2f2'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>



      {/* Mobile drawer only */}
      <Box
        component="nav"
        sx={{ width: { xs: drawerWidth, md: 0 }, flexShrink: { xs: 0, md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          mt: 8,
          p: 3,
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <Outlet />
      </Box>

      {/* Notification Center */}
      <AuthorityNotificationCenter 
        open={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
    </Box>
  );
} 