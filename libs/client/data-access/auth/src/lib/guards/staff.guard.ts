import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { whenStatusChecked } from './auth-status';
import { loginRedirect } from './auth.guard';

// admins can do everything staff members can, as on the server
export const staffGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  return whenStatusChecked(auth => {
    if (auth.isStaff() || auth.isAdmin()) return true;
    return auth.isAuth()
      ? router.createUrlTree(['/'])
      : loginRedirect(router, state.url);
  });
};
