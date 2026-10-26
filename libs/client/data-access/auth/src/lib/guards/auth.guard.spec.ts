import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { AuthMock, runGuard, setupGuardTest } from './guard-test-utils';

describe('authGuard', () => {
  let auth: AuthMock;

  beforeEach(() => auth = setupGuardTest());

  it('should let authenticated users through', () => {
    auth.isAuth.set(true);
    expect(runGuard(authGuard)()).toBe(true);
  });

  it('should send guests to login with a returnUrl', () => {
    expect(runGuard(authGuard, '/shop/checkout')())
      .toBe('/auth/login?returnUrl=%2Fshop%2Fcheckout');
  });

  it('should wait for the auth status check', () => {
    auth.statusChecked.set(false);
    const result = runGuard(authGuard);

    expect(result()).toBeUndefined();

    auth.isAuth.set(true);
    auth.statusChecked.set(true);
    expect(result()).toBe(true);
  });

  it('should let every route through on the server', () => {
    TestBed.resetTestingModule();
    auth = setupGuardTest(false);
    auth.statusChecked.set(false);

    expect(runGuard(authGuard)()).toBe(true);
  });
});
