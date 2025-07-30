import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [lastLoginTime, setLastLoginTime] = useState(localStorage.getItem('lastLoginTime'));  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');

  const SESSION_DURATION = 24 * 60 * 60 * 1000;  const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000;
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }  }, [token]);

  const isSessionValid = () => {
    if (!token || !lastLoginTime) return false;
    
    const loginTime = parseInt(lastLoginTime);
    const currentTime = Date.now();
    const sessionDuration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
      return (currentTime - loginTime) < sessionDuration;
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedLastLoginTime = localStorage.getItem('lastLoginTime');
        const storedRememberMe = localStorage.getItem('rememberMe') === 'true';
        
        if (storedToken && storedLastLoginTime) {          setLastLoginTime(storedLastLoginTime);
          setRememberMe(storedRememberMe);
          
          const loginTime = parseInt(storedLastLoginTime);
          const currentTime = Date.now();
          const sessionDuration = storedRememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
          
          if ((currentTime - loginTime) < sessionDuration) {
            try {              setToken(storedToken);
              const response = await api.get('/auth/me');
              setUser(response.data.user);
            } catch (error) {
              clearSession();            }
          } else {
            clearSession();
          }        } else {
          
        }
      } catch (error) {} finally {
        setLoading(false);
      }
    };    checkAuth();
  }, [REMEMBER_ME_DURATION, SESSION_DURATION]);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem('rememberMe');
    setToken(null);
    setUser(null);
    setLastLoginTime(null);
    setRememberMe(false);
  };
  const login = async (identifier, password, rememberMeOption = false) => {
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password
      });

      const { token: newToken, user: userData } = response.data;
      const currentTime = Date.now().toString();
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('lastLoginTime', currentTime);
      localStorage.setItem('rememberMe', rememberMeOption.toString());
      
      setToken(newToken);
      setUser(userData);
      setLastLoginTime(currentTime);
      setRememberMe(rememberMeOption);
        return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false, 
        error: error.response?.data?.message || 'Login failed'      };
    }
  };  const register = async (userData, rememberMeOption = false) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      const currentTime = Date.now().toString();
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('lastLoginTime', currentTime);
      localStorage.setItem('rememberMe', rememberMeOption.toString());
      
      setToken(newToken);
      setUser(newUser);
      setLastLoginTime(currentTime);
      setRememberMe(rememberMeOption);      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };
  const logout = async () => {    try {
      await api.post('/auth/logout');
    } catch (error) {
      
    } finally {
      clearSession();
    }
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token: newToken } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);      
      return newToken;
    } catch (error) {
      logout();
      return null;
    }
  };
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    isSessionValid,
    rememberMe,
    lastLoginTime,
    clearSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
