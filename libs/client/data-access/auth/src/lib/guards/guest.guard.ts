import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { whenStatusChecked } from './auth-status';

// keeps logged-in users away from login, signup and password reset pages
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);

  return whenStatusChecked(auth => {
    if (!auth.isAuth()) return true;
    return router.createUrlTree([auth.isAdmin() ? '/admin' : '/shop']);
  });
};
