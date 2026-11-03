import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

function readCachedUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }
    api.currentUser()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      })
      .catch((error) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }

        setUser(readCachedUser());
        console.warn('Could not refresh the current session:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (form) => {
    const data = await api.register(form);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
