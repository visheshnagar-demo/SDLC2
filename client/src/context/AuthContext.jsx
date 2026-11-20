import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, refreshAuthToken, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token') || null);
  const [tokenExpiresIn, setTokenExpiresIn] = useState(3600);
  const [sessionStartTime, setSessionStartTime] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await loginUser({ email, password });
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;
      const userProfile = data.user || null;

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setTokenExpiresIn(data.expires_in || 3600);
      setSessionStartTime(Date.now());
      localStorage.setItem('access_token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      if (userProfile) {
        setUser(userProfile);
        localStorage.setItem('user_data', JSON.stringify(userProfile));
      } else {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          localStorage.setItem('user_data', JSON.stringify(profile));
        } catch {
          // Keep minimal user if profile fetch fails
          const minimal = { email };
          setUser(minimal);
          localStorage.setItem('user_data', JSON.stringify(minimal));
        }
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await registerUser(userData);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  };

  const refreshSession = async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    try {
      const data = await refreshAuthToken(refreshToken);
      const newAccessToken = data.access_token;
      setAccessToken(newAccessToken);
      setTokenExpiresIn(data.expires_in || 3600);
      setSessionStartTime(Date.now());
      localStorage.setItem('access_token', newAccessToken);
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      return data;
    } catch (err) {
      clearAuth();
      const message = err.response?.data?.detail || 'Session refresh failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (accessToken && !user) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          localStorage.setItem('user_data', JSON.stringify(profile));
        } catch {
          clearAuth();
        }
      }
    };
    fetchMe();
  }, [accessToken, user, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        tokenExpiresIn,
        sessionStartTime,
        isLoading,
        authError,
        login,
        register,
        logout,
        refreshSession,
        setUser,
        setAuthError,
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

export default AuthContext;
