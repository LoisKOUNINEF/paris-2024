import { AuthenticatedGuard } from './authenticated.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthenticatedGuard', () => {
  let guard: AuthenticatedGuard;

  beforeEach(() => {
    guard = new AuthenticatedGuard();
  });

  it('should return true if the user is authenticated', async () => {
    const mockRequest = {
      isAuthenticated: jest.fn().mockReturnValue(true),
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
    expect(mockRequest.isAuthenticated).toHaveBeenCalled();
  });

  it('should return false if the user is not authenticated', async () => {
    const mockRequest = {
      isAuthenticated: jest.fn().mockReturnValue(false),
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);
    expect(result).toBe(false);
    expect(mockRequest.isAuthenticated).toHaveBeenCalled();
  });
});
