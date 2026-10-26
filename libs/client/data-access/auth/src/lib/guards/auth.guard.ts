import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { whenStatusChecked } from './auth-status';

export const loginRedirect = (router: Router, returnUrl: string): UrlTree =>
  router.createUrlTree(['/auth/login'], { queryParams: { returnUrl } });

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  return whenStatusChecked(auth =>
    auth.isAuth() || loginRedirect(router, state.url)
  );
};
