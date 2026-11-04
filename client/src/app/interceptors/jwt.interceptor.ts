import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Pass default X-User-Id header and Auth header for CitiDirect Maker/Checker simulation
  const currentRole = localStorage.getItem('citi_user_role') || 'MAKER';
  const currentUserId = currentRole === 'CHECKER' ? 'usr_checker_202' : 'usr_maker_101';

  const cloned = req.clone({
    setHeaders: {
      'X-User-Id': currentUserId,
      'X-User-Role': currentRole === 'CHECKER' ? 'ROLE_CHECKER' : 'ROLE_MAKER'
    }
  });

  return next(cloned);
};
