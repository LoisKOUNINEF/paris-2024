import { ExecutionContext } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

const mockCanActivate = jest.fn();
const mockLogIn = jest.fn();

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => {
    return jest.fn().mockImplementation(() => ({
      canActivate: mockCanActivate,
      logIn: mockLogIn,
    }));
  }),
}));

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    guard = new LocalAuthGuard();
    mockRequest = {};
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should call super.canActivate and return its result', async () => {
      mockCanActivate.mockResolvedValue(true);
      const result = await guard.canActivate(mockExecutionContext);
      expect(mockCanActivate).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return false if super.canActivate returns false', async () => {
      mockCanActivate.mockResolvedValue(false);
      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });
  });
});