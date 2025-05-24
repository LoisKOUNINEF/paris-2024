import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffGuard } from './staff.guard';

describe('StaffGuard', () => {
  let guard: StaffGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new StaffGuard(reflector);
  });

  it('should allow access if staffCheck is false', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const context = createMockExecutionContext({ user: null });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user is not present', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = createMockExecutionContext({ user: null });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow access if user role is staff', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = createMockExecutionContext({
      user: { role: 'staff' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user role is not staff', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const context = createMockExecutionContext({
      user: { role: 'customer' }, // or any other role
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  function createMockExecutionContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any as ExecutionContext;
  }
});
