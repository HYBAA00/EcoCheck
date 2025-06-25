import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Security,
  Assignment,
  Assessment,
  FileDownload,
  Visibility,
  Logout,
  Person,
  Settings,
  Notifications,
  Home,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Tableau de bord',
    icon: <Dashboard />,
    path: '/authority/dashboard',
    color: '#667eea'
  },
  {
    text: 'Consultation Certificats',
    icon: <Security />,
    path: '/authority/certificates',
    color: '#4CAF50'
  },
  {
    text: 'Journal d\'Audit',
    icon: <Assignment />,
    path: '/authority/audit-journal',
    color: '#2196F3'
  },
  {
    text: 'Rapport d\'Audit',
    icon: <Assessment />,
    path: '/authority/audit-report',
    color: '#FF9800'
  },
  {
    text: 'Export Historiques',
    icon: <FileDownload />,
    path: '/authority/export',
    color: '#9C27B0'
  },
  {
    text: 'Documents Lecture',
    icon: <Visibility />,
    path: '/authority/documents',
    color: '#607D8B'
  },
];

export default function AuthorityLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
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
        <Security sx={{ fontSize: 40, color: 'white', mb: 1 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          EcoCompliance
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: '#2c3e50',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              Interface Autorité - EcoCompliance
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Consultation et audit des certifications DEEE
            </Typography>
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Home Button */}
          <Tooltip title="Accueil">
            <IconButton color="inherit" onClick={() => navigate('/')} sx={{ mr: 1 }}>
              <Home />
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: '#667eea',
                fontSize: '1rem'
              }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
            {user?.email}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: '#667eea', 
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            Autorité
          </Typography>
        </Box>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Mon Profil
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Paramètres
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: '#f44336' }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          Déconnexion
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
} 