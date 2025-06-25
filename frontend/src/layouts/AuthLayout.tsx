import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'background.default',
      }}
    >
      <Outlet />
    </Box>
  );
} 