import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Roles } from '@paris-2024/shared-interfaces';
import { OwnerGuard } from './owner.guard';
import { OWNERSHIP_GUARD_OPTIONS, OwnershipGuardOptions } from './owner.decorator';

class MockEntityService {}

describe('OwnerGuard', () => {
  let guard: OwnerGuard;
  let request: any;

  const mockReflector = {
    get: jest.fn(),
    getAllAndOverride: jest.fn(),
  };

  const mockEntityService = {
    findOne: jest.fn(),
    findByUserId: jest.fn(),
  };

  const mockModuleRef = {
    get: jest.fn(() => mockEntityService),
  };

  const user = { id: 'user-1', role: Roles.CUSTOMER };
  const admin = { id: 'admin-1', role: Roles.ADMIN };

  const mockContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  const setup = (ownerCheck: boolean, options?: OwnershipGuardOptions) => {
    mockReflector.getAllAndOverride.mockReturnValue(ownerCheck);
    mockReflector.get.mockReturnValue(options);
  };

  const entityOptions: OwnershipGuardOptions = {
    paramKey: 'id',
    entityService: MockEntityService,
    findMethod: 'findOne',
    ownershipField: 'userId',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new OwnerGuard(
      mockReflector as unknown as Reflector,
      mockModuleRef as unknown as ModuleRef,
    );
    request = { user, params: {}, query: {}, body: {} };
  });

  it('should allow access when ownership check is not enabled', async () => {
    setup(false);
    request.user = undefined;

    await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    expect(mockReflector.get).not.toHaveBeenCalled();
  });

  it('should throw if user is not authenticated', async () => {
    setup(true, entityOptions);
    request.user = undefined;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access when no criteria are provided', async () => {
    setup(true, undefined);

    await expect(guard.canActivate(mockContext)).resolves.toBe(true);
  });

  describe('with entity service', () => {
    it('should resolve the service from the module ref in non strict mode', async () => {
      setup(true, entityOptions);
      request.params = { id: 'entity-1' };
      mockEntityService.findOne.mockResolvedValue({ id: 'entity-1', userId: user.id });

      await guard.canActivate(mockContext);

      expect(mockModuleRef.get).toHaveBeenCalledWith(MockEntityService, { strict: false });
    });

    it('should allow owner and attach entity to request', async () => {
      const entity = { id: 'entity-1', userId: user.id };
      setup(true, entityOptions);
      request.params = { id: 'entity-1' };
      mockEntityService.findOne.mockResolvedValue(entity);

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
      expect(mockEntityService.findOne).toHaveBeenCalledWith('entity-1');
      expect(request.entity).toBe(entity);
    });

    it('should deny access when entity belongs to another user', async () => {
      setup(true, entityOptions);
      request.params = { id: 'entity-1' };
      mockEntityService.findOne.mockResolvedValue({ id: 'entity-1', userId: 'other-user' });

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Access denied');
    });

    it('should allow admin to access entity of another user', async () => {
      setup(true, entityOptions);
      request.user = admin;
      request.params = { id: 'entity-1' };
      mockEntityService.findOne.mockResolvedValue({ id: 'entity-1', userId: 'other-user' });

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });

    it('should throw when entity is not found', async () => {
      setup(true, entityOptions);
      request.params = { id: 'entity-1' };
      mockEntityService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Resource not found');
      expect(request.entity).toBeUndefined();
    });

    it('should throw when parameter is missing', async () => {
      setup(true, entityOptions);

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Missing parameter: id');
      expect(mockEntityService.findOne).not.toHaveBeenCalled();
    });

    it.each([
      ['query', { query: { id: 'entity-1' } }],
      ['body', { body: { id: 'entity-1' } }],
    ])('should read parameter from %s', async (_source, location) => {
      setup(true, entityOptions);
      Object.assign(request, location);
      mockEntityService.findOne.mockResolvedValue({ id: 'entity-1', userId: user.id });

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
      expect(mockEntityService.findOne).toHaveBeenCalledWith('entity-1');
    });

    it('should compare against the configured ownership field', async () => {
      setup(true, { ...entityOptions, ownershipField: 'id' });
      request.params = { id: user.id };
      mockEntityService.findOne.mockResolvedValue({ id: user.id });

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });

    it('should deny access when ownership field is missing from entity', async () => {
      setup(true, entityOptions);
      request.params = { id: 'entity-1' };
      mockEntityService.findOne.mockResolvedValue({ id: 'entity-1' });

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Access denied');
    });
  });

  describe('with array of entities', () => {
    beforeEach(() => {
      request.params = { id: 'entity-1' };
    });

    it('should allow access when every item belongs to user', async () => {
      setup(true, entityOptions);
      mockEntityService.findOne.mockResolvedValue([
        { id: '1', userId: user.id },
        { id: '2', userId: user.id },
      ]);

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });

    it('should deny access when one item belongs to another user', async () => {
      setup(true, entityOptions);
      mockEntityService.findOne.mockResolvedValue([
        { id: '1', userId: user.id },
        { id: '2', userId: 'other-user' },
      ]);

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Access denied to one or more items');
    });

    it('should deny access when one item has no ownership field', async () => {
      setup(true, entityOptions);
      mockEntityService.findOne.mockResolvedValue([
        { id: '1', userId: user.id },
        { id: '2' },
      ]);

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Access denied to one or more items');
    });

    it('should allow admin regardless of ownership', async () => {
      setup(true, entityOptions);
      request.user = admin;
      mockEntityService.findOne.mockResolvedValue([{ id: '1', userId: 'other-user' }]);

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });

    it('should allow an empty array', async () => {
      setup(true, entityOptions);
      mockEntityService.findOne.mockResolvedValue([]);

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });
  });

  describe('with current user', () => {
    const currentUserOptions: OwnershipGuardOptions = {
      entityService: MockEntityService,
      findMethod: 'findOne',
      findByUserMethod: 'findByUserId',
      ownershipField: 'userId',
      useCurrentUser: true,
    };

    it('should fetch entities with findByUserMethod and current user id', async () => {
      const entities = [{ id: '1', userId: user.id }];
      setup(true, currentUserOptions);
      mockEntityService.findByUserId.mockResolvedValue(entities);

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
      expect(mockEntityService.findByUserId).toHaveBeenCalledWith(user.id);
      expect(mockEntityService.findOne).not.toHaveBeenCalled();
      expect(request.entity).toBe(entities);
    });

    it('should fall back to findMethod when findByUserMethod does not exist on service', async () => {
      setup(true, { ...currentUserOptions, findByUserMethod: 'doesNotExist' });
      mockEntityService.findOne.mockResolvedValue({ id: '1', userId: user.id });

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
      expect(mockEntityService.findOne).toHaveBeenCalledWith(user.id);
    });

    it('should allow access without entity service', async () => {
      setup(true, { useCurrentUser: true });

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
      expect(mockModuleRef.get).not.toHaveBeenCalled();
    });
  });

  describe('with direct id comparison', () => {
    it('should allow access when parameter matches user id', async () => {
      setup(true, { paramKey: 'userId' });
      request.params = { userId: user.id };

      await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    });

    it('should deny access when parameter does not match user id', async () => {
      setup(true, { paramKey: 'userId' });
      request.params = { userId: 'other-user' };

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Access denied');
    });

    it('should throw when parameter is missing', async () => {
      setup(true, { paramKey: 'userId' });

      await expect(guard.canActivate(mockContext)).rejects.toThrow('Missing parameter: userId');
    });
  });

  it('should read options from handler metadata', async () => {
    setup(true, undefined);

    await guard.canActivate(mockContext);

    expect(mockReflector.get).toHaveBeenCalledWith(OWNERSHIP_GUARD_OPTIONS, mockContext.getHandler());
  });
});
