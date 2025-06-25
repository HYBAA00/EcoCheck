import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  Person,
  ExitToApp,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';
import NotificationCenter from '../components/employee/NotificationCenter';

const drawerWidth = 240;

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/employee/dashboard' },
    { text: 'Mes Certifications', icon: <CheckCircle />, path: '/employee/certifications' },
    { text: 'Mes Demandes', icon: <Assignment />, path: '/employee/requests' },
    { text: 'Profil', icon: <Person />, path: '/employee/profile' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Menu Employé
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
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
                onClick={() => navigate(item.path)}
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
              Bonjour, {user?.username || 'Employé'}
            </Typography>
          <NotificationCenter />
            
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
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Mobile drawer only */}
      <Box
        component="nav"
        sx={{ width: { xs: drawerWidth, md: 0 }, flexShrink: { xs: 0, md: 0 } }}
      >
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: 8,
          bgcolor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
