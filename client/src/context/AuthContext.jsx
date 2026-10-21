import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const DEFAULT_USERS = {
  ceding: {
    email: "ceding@cedant.com",
    role: "ceding_underwriter",
    full_name: "Sarah Jenkins (Ceding Underwriter)",
    company_name: "Apex Mutual Insurance",
    authority_limit: 0,
  },
  underwriter: {
    email: "underwriter@reinsurer.com",
    role: "reinsurance_underwriter",
    full_name: "David Vance (Senior Underwriter)",
    company_name: "Apex Re Specialty",
    authority_limit: 5000000,
  },
  manager: {
    email: "manager@reinsurer.com",
    role: "underwriting_manager",
    full_name: "Elena Rostova (Chief Underwriting Officer)",
    company_name: "Apex Re Specialty",
    authority_limit: 50000000,
  },
};

const getStorageItem = (key) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    return null;
  }
  return null;
};

const setStorageItem = (key, value) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    // ignore
  }
};

const removeStorageItem = (key) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // ignore
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = getStorageItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    // Default initial demo user: Underwriter
    return DEFAULT_USERS.underwriter;
  });

  const [token, setToken] = useState(
    () => getStorageItem("token") || "demo-token",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setStorageItem("user", JSON.stringify(user));
    } else {
      removeStorageItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      setStorageItem("token", token);
    } else {
      removeStorageItem("token");
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Try real backend login
      const data = await authApi.login(email, password);
      if (data && data.access_token) {
        setToken(data.access_token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn(
        "Backend login endpoint unavailable or failed, switching to local persona matching:",
        err,
      );
      // Fallback matching for local demo / tests
      let matchedUser = Object.values(DEFAULT_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (!matchedUser) {
        if (email.includes("manager") || email.includes("admin")) {
          matchedUser = DEFAULT_USERS.manager;
        } else if (email.includes("ceding") || email.includes("cedant")) {
          matchedUser = DEFAULT_USERS.ceding;
        } else {
          matchedUser = {
            email,
            role: "reinsurance_underwriter",
            full_name: email.split("@")[0],
            company_name: "Apex Re Specialty",
            authority_limit: 5000000,
          };
        }
      }
      setToken("demo-token-" + Date.now());
      setUser(matchedUser);
      return matchedUser;
    } finally {
      setLoading(false);
    }
  };

  const switchPersona = (personaKey) => {
    if (DEFAULT_USERS[personaKey]) {
      setUser(DEFAULT_USERS[personaKey]);
      setToken(`demo-token-${personaKey}`);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStorageItem("token");
    removeStorageItem("user");
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    switchPersona,
    isAuthenticated: !!user,
    isCedingUnderwriter: user?.role === "ceding_underwriter",
    isReinsuranceUnderwriter: user?.role === "reinsurance_underwriter",
    isUnderwritingManager: user?.role === "underwriting_manager",
    authorityLimit: user?.authority_limit || 0,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
