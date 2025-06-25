import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Business,
  Assignment,
  Person,
  ExitToApp,
  Group,
  Gavel,
  Settings,
} from '@mui/icons-material';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import NotificationBell from '../components/admin/NotificationBell';

const drawerWidth = 240;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Gestion Utilisateurs', icon: <Group />, path: '/admin/users' },
    { text: 'Demandes de certification', icon: <Assignment />, path: '/admin/certification-requests' },
    { text: 'Rapports & Analytics', icon: <Gavel />, path: '/admin/reports' },
    { text: 'Suivi des Paiements', icon: <Business />, path: '/admin/payments' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src="/ECO CHECK LOGO.png" 
            alt="EcoCheck Logo" 
            style={{ height: 40, width: 'auto' }} 
          />
          <Typography variant="h6" noWrap component="div">
            Administration
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
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
              Bonjour, {user?.username || 'Admin'}
            </Typography>
          <NotificationBell />
          
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
        aria-label="menu de navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 