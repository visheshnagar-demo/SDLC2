import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const ROLES = {
  CEDENT: "CEDENT",
  UNDERWRITER: "UNDERWRITER",
  MANAGER: "MANAGER",
};

const USER_PROFILES = {
  [ROLES.CEDENT]: {
    id: "usr-cedent-01",
    name: "Emily Watson",
    email: "test@example.com",
    role: ROLES.CEDENT,
    roleTitle: "Ceding Underwriter",
    organization: "Travelers Insurance Co.",
    authorityLimit: 0,
    avatar: "EW",
  },
  [ROLES.UNDERWRITER]: {
    id: "usr-uw-02",
    name: "Sarah Jenkins",
    email: "sjenkins@resecure.com",
    role: ROLES.UNDERWRITER,
    roleTitle: "Senior Facultative Underwriter",
    organization: "ReSecure Facultative Syndicate",
    authorityLimit: 5000000,
    avatar: "SJ",
  },
  [ROLES.MANAGER]: {
    id: "usr-mgr-03",
    name: "Victor Chen",
    email: "manager@example.com",
    role: ROLES.MANAGER,
    roleTitle: "VP / Underwriting Authority Manager",
    organization: "ReSecure Facultative Syndicate",
    authorityLimit: 50000000,
    avatar: "VC",
  },
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.UNDERWRITER);
  const [currentUser, setCurrentUser] = useState(
    USER_PROFILES[ROLES.UNDERWRITER],
  );

  const switchRole = (roleKey) => {
    if (USER_PROFILES[roleKey]) {
      setCurrentRole(roleKey);
      setCurrentUser(USER_PROFILES[roleKey]);
    }
  };

  const isCedent = currentRole === ROLES.CEDENT;
  const isUnderwriter =
    currentRole === ROLES.UNDERWRITER || currentRole === ROLES.MANAGER;
  const isManager = currentRole === ROLES.MANAGER;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        isCedent,
        isUnderwriter,
        isManager,
        roles: ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
