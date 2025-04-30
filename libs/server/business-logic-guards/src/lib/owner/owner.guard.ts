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
    // Early exits based on metadata and basic checks
    if (!this.shouldCheckOwnership(context)) return true;

    const options = this.reflector.get<OwnershipGuardOptions>(OWNERSHIP_GUARD_OPTIONS, context.getHandler()) || {};
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = req;

    this.ensureUserAuthenticated(user);

    // Skip if no criteria provided
    if (!options.paramKey && !options.entityService && !options.useCurrentUser) {
      return true;
    }

    // Handle entity service case (most complex)
    if (options.entityService && options.findMethod && options.ownershipField) {
      return await this.handleEntityServiceCase(options, req);
    }

    // Handle useCurrentUser without entity service
    if (options.useCurrentUser) {
      return true;
    }

    // Handle direct ID comparison (simplest case)
    return this.handleDirectIdComparison(options, req);
  }

  private shouldCheckOwnership(context: ExecutionContext): boolean {
    const ownerCheck = this.reflector.getAllAndOverride<boolean>('owner', [
      context.getHandler(),
      context.getClass(),
    ]);
    return !!ownerCheck;
  }

  private ensureUserAuthenticated(user: any): void {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
  }

  private async handleEntityServiceCase(
    options: OwnershipGuardOptions,
    req: RequestWithUser
  ): Promise<boolean> {
    const { user, params, body, query } = req;
    const serviceInstance = this.moduleRef.get(options.entityService, { strict: false });
    
    // Get entity based on options
    const entity = await this.fetchEntity(serviceInstance, options, user, params, body, query);
    
    if (!entity) {
      throw new ForbiddenException('Resource not found');
    }

    // Store entity in request for controller usage
    req.entity = entity;

    // Verify ownership
    this.verifyOwnership(entity, user, options);

    return true;
  }

  private async fetchEntity(
    serviceInstance: any,
    options: OwnershipGuardOptions,
    user: any,
    params: any,
    body: any,
    query: any
  ): Promise<any> {
    if (options.useCurrentUser) {
      return this.fetchEntityByCurrentUser(serviceInstance, options, user.id);
    } else {
      return this.fetchEntityByParameter(serviceInstance, options, params, body, query);
    }
  }

  private async fetchEntityByCurrentUser(
    serviceInstance: any,
    options: OwnershipGuardOptions,
    userId: string
  ): Promise<any> {
    const findByUserMethod = options.findByUserMethod || 'findByUserId';
    
    if (typeof serviceInstance[findByUserMethod] === 'function') {
      return await serviceInstance[findByUserMethod](userId);
    } else {
      const findMethod = options.findMethod as string;
      return await serviceInstance[findMethod](userId);
    }
  }

  private async fetchEntityByParameter(
    serviceInstance: any,
    options: OwnershipGuardOptions,
    params: any,
    body: any,
    query: any
  ): Promise<any> {
    const key = options.paramKey;
    if (!key) return null;
    
    const id = params?.[key] || query?.[key] || body?.[key];
    if (!id) {
      throw new ForbiddenException(`Missing parameter: ${key}`);
    }
    const findMethod = options.findMethod as string;
    return await serviceInstance[findMethod](id);
  }

  private verifyOwnership(
    entity: any,
    user: any,
    options: OwnershipGuardOptions
  ): void {
    if (Array.isArray(entity)) {
      this.verifyArrayOwnership(entity, user, options);
    } else {
      this.verifySingleEntityOwnership(entity, user, options);
    }
  }

  private verifyArrayOwnership(
    entities: any[],
    user: any,
    options: OwnershipGuardOptions
  ): void {
    if (user.role === 'admin') return;
    
    if (!options.ownershipField) return;
    
    const ownershipField = options.ownershipField as string;
    const hasUnauthorizedAccess = entities.some(
      item => item && 
             typeof item === 'object' && 
             ownershipField in item && 
             item[ownershipField] !== user.id
    );
    
    if (hasUnauthorizedAccess) {
      throw new ForbiddenException('Access denied to one or more items');
    }
  }

  private verifySingleEntityOwnership(
    entity: any,
    user: any,
    options: OwnershipGuardOptions
  ): void {
    if (user.role === 'admin') return;
    
    if (!options.ownershipField || !entity || typeof entity !== 'object') return;
    
    const ownershipField = options.ownershipField as string;
    if (!(ownershipField in entity)) return;
    
    const ownerId = entity[ownershipField];
    if (ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
  }

  private handleDirectIdComparison(
    options: OwnershipGuardOptions,
    req: RequestWithUser
  ): boolean {
    const { user, params, body, query } = req;
    const key = options.paramKey;
    
    if (!key) return false;
    
    const id = params?.[key] || query?.[key] || body?.[key];
    if (!id) {
      throw new ForbiddenException(`Missing parameter: ${key}`);
    }

    if (user?.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
