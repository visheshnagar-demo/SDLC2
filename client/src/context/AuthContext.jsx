import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const ROLES = {
  CEDING_UNDERWRITER: "CEDING_UNDERWRITER",
  REINSURANCE_UNDERWRITER: "REINSURANCE_UNDERWRITER",
  UNDERWRITING_MANAGER: "UNDERWRITING_MANAGER",
};

const USER_PROFILES = {
  CEDING_UNDERWRITER: {
    id: "usr-cedent-01",
    name: "Sarah Jenkins",
    email: "sarah.cedent@globalsafe.com",
    role: ROLES.CEDING_UNDERWRITER,
    organization: "Global Specialty Insurers Corp",
    authority_limit: 0,
    is_internal: false,
  },
  REINSURANCE_UNDERWRITER: {
    id: "usr-uw-02",
    name: "Marcus Vance",
    email: "m.vance@apexre.com",
    role: ROLES.REINSURANCE_UNDERWRITER,
    organization: "ApexRe Specialty Underwriters Ltd",
    authority_limit: 5000000,
    is_internal: true,
  },
  UNDERWRITING_MANAGER: {
    id: "usr-mgr-03",
    name: "Victoria Sterling",
    email: "victoria.manager@apexre.com",
    role: ROLES.UNDERWRITING_MANAGER,
    organization: "ApexRe Executive Management",
    authority_limit: 50000000,
    is_internal: true,
  },
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(ROLES.REINSURANCE_UNDERWRITER);
  const [currentUser, setCurrentUser] = useState(
    USER_PROFILES[ROLES.REINSURANCE_UNDERWRITER],
  );

  const switchRole = (newRole) => {
    if (USER_PROFILES[newRole]) {
      setCurrentRole(newRole);
      setCurrentUser(USER_PROFILES[newRole]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        ROLES,
        isCedingUser: currentRole === ROLES.CEDING_UNDERWRITER,
        isUnderwriter: currentRole === ROLES.REINSURANCE_UNDERWRITER,
        isManager: currentRole === ROLES.UNDERWRITING_MANAGER,
        userProfiles: USER_PROFILES,
      }}
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
