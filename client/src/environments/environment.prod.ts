export const environment = {
  production: true,
  apiBaseUrl: (window as any).__env?.apiBaseUrl || 'http://localhost:8080/api'
};
