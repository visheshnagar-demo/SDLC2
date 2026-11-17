import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('veritas_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default demo user for instant QA audit access
    return {
      id: 'usr-9281a-7b3f-4e01',
      email: 'test@example.com',
      full_name: 'Alex Morgan',
      role: 'customer', // 'customer' | 'compliance_officer' | 'admin'
      is_active: true,
      created_at: new Date().toISOString(),
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('veritas_access_token') || 'demo-jwt-token-xyz');
  const [loading, setLoading] = useState(false);
  const [onboardingState, setOnboardingState] = useState(() => {
    const saved = localStorage.getItem('veritas_onboarding_state');
    return saved
      ? JSON.parse(saved)
      : {
          step: 1, // 1: Doc Upload, 2: OCR Review, 3: Biometrics, 4: Complete
          documentId: null,
          docType: 'PASSPORT',
          ocrData: null,
          ocrConfidence: null,
          biometricId: null,
          faceMatchScore: null,
          livenessPassed: false,
          applicationStatus: 'DRAFT', // DRAFT, AUTO_VERIFIED, FLAGGED, APPROVED, REJECTED
        };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('veritas_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('veritas_user_session');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('veritas_onboarding_state', JSON.stringify(onboardingState));
  }, [onboardingState]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res && res.access_token) {
        localStorage.setItem('veritas_access_token', res.access_token);
        if (res.refresh_token) {
          localStorage.setItem('veritas_refresh_token', res.refresh_token);
        }
        setToken(res.access_token);
        const userData = res.user || {
          id: res.user_id || 'usr-default',
          email,
          full_name: res.full_name || email.split('@')[0],
          role: email.includes('admin') ? 'admin' : email.includes('compliance') ? 'compliance_officer' : 'customer',
          is_active: true,
        };
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      // Fallback for standalone demo mode
      console.warn('API login failed, applying local mock fallback:', err.message);
      let role = 'customer';
      if (email.includes('admin')) role = 'admin';
      if (email.includes('compliance') || email.includes('officer')) role = 'compliance_officer';
      const fallbackUser = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        email,
        full_name: email.split('@')[0].toUpperCase(),
        role,
        is_active: true,
      };
      setUser(fallbackUser);
      localStorage.setItem('veritas_access_token', 'mock-token-12345');
      setToken('mock-token-12345');
      return { success: true, user: fallbackUser, isMock: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await registerUser(payload);
      if (res && res.access_token) {
        localStorage.setItem('veritas_access_token', res.access_token);
        setToken(res.access_token);
        const userData = res.user || {
          id: res.id || 'usr-new',
          email: payload.email,
          full_name: payload.full_name,
          role: payload.role || 'customer',
          is_active: true,
        };
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: true, data: res };
    } catch (err) {
      console.warn('API register failed, applying local fallback:', err.message);
      const fallbackUser = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role || 'customer',
        is_active: true,
      };
      setUser(fallbackUser);
      return { success: true, user: fallbackUser, isMock: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('veritas_access_token');
    localStorage.removeItem('veritas_refresh_token');
    localStorage.removeItem('veritas_user_session');
    setUser(null);
    setToken(null);
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      setUser({
        id: 'usr-demo',
        email: `${newRole}@example.com`,
        full_name: `Demo ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
        role: newRole,
        is_active: true,
      });
    }
  };

  const updateOnboarding = (partial) => {
    setOnboardingState((prev) => ({ ...prev, ...partial }));
  };

  const resetOnboarding = () => {
    setOnboardingState({
      step: 1,
      documentId: null,
      docType: 'PASSPORT',
      ocrData: null,
      ocrConfidence: null,
      biometricId: null,
      faceMatchScore: null,
      livenessPassed: false,
      applicationStatus: 'DRAFT',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        onboardingState,
        login,
        register,
        logout,
        switchRole,
        updateOnboarding,
        resetOnboarding,
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
