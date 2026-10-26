import { guestGuard } from './guest.guard';
import { AuthMock, runGuard, setupGuardTest } from './guard-test-utils';

describe('guestGuard', () => {
  let auth: AuthMock;

  beforeEach(() => auth = setupGuardTest());

  it('should let guests through', () => {
    expect(runGuard(guestGuard)()).toBe(true);
  });

  it('should send users to the shop', () => {
    auth.isAuth.set(true);
    expect(runGuard(guestGuard)()).toBe('/shop');
  });

  it('should send admins to the admin area', () => {
    auth.isAuth.set(true);
    auth.isAdmin.set(true);
    expect(runGuard(guestGuard)()).toBe('/admin');
  });
});
