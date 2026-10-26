import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UrlTree } from '@angular/router';
import { PlatformService } from '@paris-2024/client-utils';
import { filter, map, Observable, of, take } from 'rxjs';
import { AuthService } from '../auth.service';

/**
 * Runs `decide` once the initial auth status is known.
 * The status is only checked in the browser, so the server lets every route through
 * and the guards run again on the client's initial navigation.
 */
export function whenStatusChecked(
  decide: (auth: AuthService) => boolean | UrlTree
): Observable<boolean | UrlTree> {
  const auth = inject(AuthService);

  if (!inject(PlatformService).isBrowser) {
    return of(true);
  }

  return toObservable(auth.statusChecked).pipe(
    filter(Boolean),
    take(1),
    map(() => decide(auth)),
  );
}
