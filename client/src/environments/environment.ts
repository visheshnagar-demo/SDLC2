export const environment = {
  production: false,
  apiBaseUrl: (window as any).__env?.apiBaseUrl || 'http://localhost:8080/api'
};
