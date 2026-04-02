import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, logout as authServiceLogout, getToken, getUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize state from local storage on mount
  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();
    
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    saveSession(token, userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    authServiceLogout(); // This performs local storage clear and hard redirect to /login
  };

  // Derive role safely
  const role = user?.rol_nombre || 'Invitado';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
