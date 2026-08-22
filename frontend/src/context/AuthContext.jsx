import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and fetch user data using the /me endpoint
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Token invalid or expired");
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // FastAPI OAuth2PasswordRequestForm requires form data
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const res = await api.post('/api/auth/login', formData);
    localStorage.setItem('token', res.data.access_token);
    
    // Fetch user details immediately after login
    const userRes = await api.get('/api/auth/me');
    setUser(userRes.data);
  };

  const register = async (name, email, password) => {
    await api.post('/api/auth/register', { name, email, password });
    await login(email, password); // Auto-login after successful registration
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};