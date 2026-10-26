import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { whenStatusChecked } from './auth-status';
import { loginRedirect } from './auth.guard';

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  return whenStatusChecked(auth => {
    if (auth.isAdmin()) return true;
    return auth.isAuth()
      ? router.createUrlTree(['/'])
      : loginRedirect(router, state.url);
  });
};
