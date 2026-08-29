import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, signup as apiSignup } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          const userData = res.data?.data?.user || res.data?.data || res.data?.user;
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data) => {
    const res = await apiLogin(data);
    const payload = res.data?.data || res.data;
    const token = payload?.token;
    const userData = payload?.user;
    
    if (token) localStorage.setItem('token', token);
    if (userData) setUser(userData);
    return payload;
  };

  const signup = async (data) => {
    const res = await apiSignup(data);
    const payload = res.data?.data || res.data;
    const token = payload?.token;
    const userData = payload?.user;
    
    if (token) localStorage.setItem('token', token);
    if (userData) setUser(userData);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (data) => setUser({ ...user, ...data });

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);