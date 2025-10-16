import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../services/profileAPI';

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

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionId = sessionStorage.getItem('sessionId');
        const role = sessionStorage.getItem('role');
        
        if (sessionId && role) {
          // Validate session with backend
          const isValid = await validateSession(sessionId, role);
          if (isValid) {
            setUser({
              sessionId,
              role,
              username: sessionStorage.getItem('username'),
              email: sessionStorage.getItem('email'),
              driverName: sessionStorage.getItem('driverName')
            });
          } else {
            // Session expired or invalid, clear storage
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateSession = async (sessionId, role) => {
    try {
      const endpoint = role === 'USER' 
        ? `/api/profiles/user/validate/${sessionId}`
        : `/api/profiles/driver/validate/${sessionId}`;
      
      const response = await profileAPI.get(endpoint);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  const login = async (credentials, role) => {
    try {
      setLoading(true);
      let response;
      
      if (role === 'driver') {
        // Login as driver
        response = await profileAPI.post('/api/profiles/driver/login', {
          driverName: credentials.username || credentials.driverName,
          email: credentials.email
        });
      } else {
        // Login as user
        response = await profileAPI.post('/api/profiles/user/login', {
          username: credentials.username,
          email: credentials.email
        });
      }

      if (response.success) {
        const userData = {
          sessionId: response.sessionId,
          role: response.role,
          email: response.email,
          username: response.username,
          driverName: response.driverName
        };

        // Store in sessionStorage (not localStorage for security)
        sessionStorage.setItem('sessionId', response.sessionId);
        sessionStorage.setItem('role', response.role);
        sessionStorage.setItem('email', response.email);
        
        if (response.username) {
          sessionStorage.setItem('username', response.username);
        }
        if (response.driverName) {
          sessionStorage.setItem('driverName', response.driverName);
        }

        setUser(userData);
        return { success: true, data: userData };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const sessionId = sessionStorage.getItem('sessionId');
      const role = sessionStorage.getItem('role');
      
      if (sessionId && role) {
        const endpoint = role === 'USER' 
          ? `/api/profiles/user/logout/${sessionId}`
          : `/api/profiles/driver/logout/${sessionId}`;
        
        await profileAPI.post(endpoint);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('driverName');
    sessionStorage.removeItem('phone');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userProfile');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isUser: user?.role === 'USER',
    isDriver: user?.role === 'DRIVER',
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
