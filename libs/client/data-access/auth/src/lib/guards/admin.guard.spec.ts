import { adminGuard } from './admin.guard';
import { AuthMock, runGuard, setupGuardTest } from './guard-test-utils';

describe('adminGuard', () => {
  let auth: AuthMock;

  beforeEach(() => auth = setupGuardTest());

  it('should let admins through', () => {
    auth.isAuth.set(true);
    auth.isAdmin.set(true);
    expect(runGuard(adminGuard)()).toBe(true);
  });

  it('should send other users home', () => {
    auth.isAuth.set(true);
    auth.isStaff.set(true);
    expect(runGuard(adminGuard)()).toBe('/');
  });

  it('should send guests to login with a returnUrl', () => {
    expect(runGuard(adminGuard, '/admin/dashboard')())
      .toBe('/auth/login?returnUrl=%2Fadmin%2Fdashboard');
  });
});
