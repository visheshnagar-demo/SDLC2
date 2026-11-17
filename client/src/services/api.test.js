import { describe, it, expect } from 'vitest';
import api, {
  registerUser,
  loginUser,
  uploadDocument,
  verifyBiometrics,
  listComplianceApplications,
  listAuditLogs,
} from './api';

describe('API Service Contracts', () => {
  it('exports all mandated endpoints and helper functions', () => {
    expect(typeof registerUser).toBe('function');
    expect(typeof loginUser).toBe('function');
    expect(typeof uploadDocument).toBe('function');
    expect(typeof verifyBiometrics).toBe('function');
    expect(typeof listComplianceApplications).toBe('function');
    expect(typeof listAuditLogs).toBe('function');
  });

  it('exposes axios apiClient instance with configured headers', () => {
    expect(api.apiClient).toBeDefined();
    expect(api.apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
