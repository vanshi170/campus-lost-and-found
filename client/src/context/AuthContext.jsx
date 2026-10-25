import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('foundit_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('foundit_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate existing token with backend on initial load
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('foundit_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('foundit_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token is invalid or expired
          localStorage.removeItem('foundit_token');
          localStorage.removeItem('foundit_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUserSession();

    // Listen for 401 events triggered by the Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('foundit:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('foundit:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('foundit_token', receivedToken);
      localStorage.setItem('foundit_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/api/auth/register', { name, email, password, phone });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('foundit_token', receivedToken);
      localStorage.setItem('foundit_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('foundit_token');
    localStorage.removeItem('foundit_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
