import { staffGuard } from './staff.guard';
import { AuthMock, runGuard, setupGuardTest } from './guard-test-utils';

describe('staffGuard', () => {
  let auth: AuthMock;

  beforeEach(() => auth = setupGuardTest());

  it('should let staff members through', () => {
    auth.isAuth.set(true);
    auth.isStaff.set(true);
    expect(runGuard(staffGuard)()).toBe(true);
  });

  it('should let admins through', () => {
    auth.isAuth.set(true);
    auth.isAdmin.set(true);
    expect(runGuard(staffGuard)()).toBe(true);
  });

  it('should send other users home', () => {
    auth.isAuth.set(true);
    expect(runGuard(staffGuard)()).toBe('/');
  });

  it('should send guests to login with a returnUrl', () => {
    expect(runGuard(staffGuard, '/staff/ticket-validity/abc')())
      .toBe('/auth/login?returnUrl=%2Fstaff%2Fticket-validity%2Fabc');
  });
});
