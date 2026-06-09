import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('cems_token');
      const savedUser = localStorage.getItem('cems_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('cems_token');
      localStorage.removeItem('cems_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    const payload = { email: identifier, password };

    const { data } = await api.post('/auth/login', payload);
    const { token: jwt, user: userData } = data;
    localStorage.setItem('cems_token', jwt);
    localStorage.setItem('cems_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cems_token');
    localStorage.removeItem('cems_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback(
    (role) => user?.role === role,
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      hasRole,
    }),
    [user, token, loading, isAuthenticated, login, register, logout, hasRole]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
