export interface Branch {
  branchNumber: string;
  branchName: string;
  swiftCode: string;
  supportsRunningBalance: boolean;
}

export interface Customer {
  customerNumber: string;
  customerName: string;
  country: string;
}

export interface Account {
  accountNumber: string;
  accountName: string;
  currency: string;
  accountType: string;
  branchNumber: string;
  customerNumber: string;
  currentBalance: number;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: 'VIEWER' | 'MAKER' | 'AUTHORIZER' | 'ADMIN';
  timeZone: string;
}
