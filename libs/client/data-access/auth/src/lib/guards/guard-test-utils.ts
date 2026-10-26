import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { PlatformService } from '@paris-2024/client-utils';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

export interface AuthMock {
  isAuth: ReturnType<typeof signal<boolean>>;
  isStaff: ReturnType<typeof signal<boolean>>;
  isAdmin: ReturnType<typeof signal<boolean>>;
  statusChecked: ReturnType<typeof signal<boolean>>;
}

export function setupGuardTest(isBrowser = true): AuthMock {
  const auth: AuthMock = {
    isAuth: signal(false),
    isStaff: signal(false),
    isAdmin: signal(false),
    statusChecked: signal(true),
  };

  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: auth },
      { provide: PlatformService, useValue: { isBrowser } },
    ],
  });

  return auth;
}

// runs the guard and returns its result as a url string (or true / undefined while pending)
export function runGuard(guard: CanActivateFn, url = '/protected'): () => string | boolean | undefined {
  let result: boolean | UrlTree | undefined;

  const result$ = TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
  ) as Observable<boolean | UrlTree>;
  result$.subscribe(res => result = res);

  return () => {
    TestBed.tick();
    return result instanceof UrlTree
      ? TestBed.inject(Router).serializeUrl(result)
      : result;
  };
}
