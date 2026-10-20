import React, { createContext, useContext, useState, useEffect } from "react";

export const ROLES = {
  CEDING: "ceding_underwriter",
  UNDERWRITER: "reinsurance_underwriter",
  MANAGER: "underwriting_manager",
};

export const USER_PROFILES = {
  [ROLES.CEDING]: {
    id: "usr-ced-01",
    name: "Sarah Jenkins",
    email: "test@example.com",
    role: ROLES.CEDING,
    roleTitle: "Ceding Company Underwriter",
    organization: "Hartford General Insurance Corp (HGIC)",
    orgId: "HGIC-770",
    authorityLimit: 0,
  },
  [ROLES.UNDERWRITER]: {
    id: "usr-uw-02",
    name: "Marcus Vance",
    email: "marcus.vance@apexre.com",
    role: ROLES.UNDERWRITER,
    roleTitle: "Reinsurance Underwriter",
    organization: "Apex Specialty Reinsurance",
    orgId: "APEX-RE",
    authorityLimit: 5000000, // $5,000,000 authority threshold
  },
  [ROLES.MANAGER]: {
    id: "usr-mgr-03",
    name: "Eleanor Vance (CUO)",
    email: "admin@example.com",
    role: ROLES.MANAGER,
    roleTitle: "Underwriting Manager",
    organization: "Apex Specialty Reinsurance",
    orgId: "APEX-RE",
    authorityLimit: 50000000, // $50,000,000
  },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem("user_role") || ROLES.UNDERWRITER;
  });

  const currentUser =
    USER_PROFILES[currentRole] || USER_PROFILES[ROLES.UNDERWRITER];

  useEffect(() => {
    localStorage.setItem("user_role", currentRole);
    localStorage.setItem("user_id", currentUser.id);
  }, [currentRole, currentUser]);

  const switchRole = (newRole) => {
    if (USER_PROFILES[newRole]) {
      setCurrentRole(newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentRole, currentUser, switchRole, ROLES }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
