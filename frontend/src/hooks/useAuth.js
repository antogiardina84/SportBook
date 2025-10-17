// ============================================
// frontend/src/hooks/useAuth.js
// Hook per Gestione Autenticazione
// ============================================

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook personalizzato per accedere al contesto di autenticazione
 * Fornisce accesso a user, login, logout, register e altri metodi auth
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider');
  }
  
  return context;
};

export default useAuth;