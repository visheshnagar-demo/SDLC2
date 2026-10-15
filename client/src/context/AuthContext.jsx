import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes session timeout

const safeGetStorage = (key) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return null;
};

const safeSetStorage = (key, value) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
};

const safeRemoveStorage = (key) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // fallback
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => safeGetStorage("apex_token"));
  const [user, setUser] = useState(() => {
    const saved = safeGetStorage("apex_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    safeRemoveStorage("apex_token");
    safeRemoveStorage("apex_user");
    setToken(null);
    setUser(null);
  }, []);

  // Update activity timestamp
  const recordActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Inactivity timeout handler
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
        logout();
      }
    }, 30000);

    const handleUserAction = () => recordActivity();
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleUserAction);
      window.addEventListener("keydown", handleUserAction);
      window.addEventListener("click", handleUserAction);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleUserAction);
        window.removeEventListener("keydown", handleUserAction);
        window.removeEventListener("click", handleUserAction);
      }
    };
  }, [token, lastActivity, logout, recordActivity]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      const authToken =
        data.accessToken || data.token || (data.data && data.data.accessToken);
      const authUser = data.user ||
        (data.data && data.data.user) || {
          username: credentials.username,
          fullName: credentials.username,
        };

      if (authToken) {
        safeSetStorage("apex_token", authToken);
        safeSetStorage("apex_user", JSON.stringify(authUser));
        setToken(authToken);
        setUser(authUser);
        setLastActivity(Date.now());
      }
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Authentication failed. Please verify credentials.";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
    recordActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
