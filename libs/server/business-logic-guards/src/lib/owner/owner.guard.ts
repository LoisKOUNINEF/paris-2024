import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { RequestWithUser } from '@paris-2024/server-base-entity';
import { OWNERSHIP_GUARD_OPTIONS, OwnershipGuardOptions } from './owner.decorator';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownerCheck = this.reflector.getAllAndOverride<boolean>('owner', [
      context.getHandler(),
      context.getClass(),
    ]);

    if(!ownerCheck) return true;

    const options = this.reflector.get<OwnershipGuardOptions>(OWNERSHIP_GUARD_OPTIONS, context.getHandler()) || {};
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const { user, params, body, query } = req;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!options.paramKey && !options.entityService ) {
      return true;
    }

    const key = options.paramKey;
    if(!key) return false;
    const id = params?.[key] || query?.[key] || body?.[key];
    if (!id) {
      throw new ForbiddenException(`Missing parameter: ${key}`);
    }

    if (options.entityService && options.findMethod && options.ownershipField) {

      const serviceInstance = this.moduleRef.get(options.entityService, { strict: false });
      const entity = await serviceInstance[options.findMethod](id);

      if (!entity) {
        throw new ForbiddenException('Resource not found');
      }

      req.entity = entity;

      const ownerId = entity[options.ownershipField];
      if (ownerId !== user.id && user.role !== 'admin') {
        throw new ForbiddenException('Access denied');
      }

      return true;
    }

    if (user.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
