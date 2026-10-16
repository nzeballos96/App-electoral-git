import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { seedDatabase } from '../db/seeder';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // 1. Inicializar base de datos con seeder si está vacía
      try {
        await seedDatabase();
      } catch (err) {
        console.error('Error inicializando base local:', err);
      }

      // 2. Restaurar sesión si existe
      const current = authService.getCurrentUser();
      if (current) {
        setUser(current);
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = async (username, password) => {
    const session = await authService.login(username, password);
    setUser(session);
    return session;
  };

  const fastLogin = async (username) => {
    const session = await authService.fastLogin(username);
    setUser(session);
    return session;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, fastLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
