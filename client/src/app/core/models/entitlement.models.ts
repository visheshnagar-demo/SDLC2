export interface Branch {
  branchNumber: string;
  branchName: string;
  swiftCode: string;
  supportsRunningBalance?: boolean;
  runningBalanceEnabled?: boolean;
}

export interface Customer {
  customerNumber: string;
  customerName: string;
  countryCode?: string;
  country?: string;
}

export interface Account {
  accountNumber: string;
  accountName: string;
  currency: string;
  accountType: string;
  branchNumber: string;
  customerNumber: string;
  currentBalance?: number;
  openingBalance?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: 'VIEWER' | 'MAKER' | 'AUTHORIZER' | 'ADMIN' | 'ROLE_MAKER' | 'ROLE_AUTHORIZER' | 'ROLE_VIEWER' | 'ROLE_SECURITY_ADMIN';
  timeZone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface EntitlementsResponse {
  branches: string[];
  customers: string[];
  accounts: string[];
}
