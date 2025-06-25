import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuth, logout } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import { RootState } from '../store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      console.log('AuthProvider - Token trouvé:', !!token);
      
      if (token) {
        try {
          console.log('AuthProvider - Vérification du token...');
          
          // Vérifier si le token est valide en récupérant le profil
          const response = await authAPI.getProfile();
          
          console.log('AuthProvider - Token valide, restauration de l\'utilisateur:', response.data.user);
          
          // Si le token est valide, restaurer l'état d'authentification
          dispatch(restoreAuth(response.data.user));
        } catch (error: any) {
          console.error('AuthProvider - Erreur lors de la vérification du token:', error);
          
          // Si le token est invalide, nettoyer l'état
          localStorage.removeItem('token');
          dispatch(logout());
        }
      } else {
        console.log('AuthProvider - Aucun token trouvé');
      }
      
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [dispatch, isInitialized]);

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Chargement...
      </div>
    );
  }

  return <>{children}</>;
} 