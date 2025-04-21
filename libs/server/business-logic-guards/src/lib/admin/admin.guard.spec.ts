import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;
    });

    it('should return true when adminCheck is false', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should return true when user is admin', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue({
        user: { role: 'admin' },
      });

      expect(guard.canActivate(mockExecutionContext)).toBe(true);
    });

    it('should return false when user is not admin', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue({
        user: { role: 'user' },
      });

      expect(guard.canActivate(mockExecutionContext)).toBe(false);
    });

    it('should return false when user is not present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      mockExecutionContext.switchToHttp().getRequest = jest.fn().mockReturnValue({});

      expect(guard.canActivate(mockExecutionContext)).toBe(false);
    });
  });
});