import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LogoContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

interface LogoProps {
  color?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ color = 'white', showText = true }) => {
  return (
    <LogoContainer>
      <img 
        src="/ECO CHECK LOGO.png" 
        alt="EcoCheck Logo" 
        style={{ height: 40, width: 'auto' }} 
      />
      {showText && (
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            color: color,
            fontSize: { xs: '1.2rem', md: '1.5rem' }
          }}
        >
          EcoCheck
        </Typography>
      )}
    </LogoContainer>
  );
};

export default Logo; 