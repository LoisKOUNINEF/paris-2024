import { SetMetadata } from '@nestjs/common';

export interface OwnershipGuardOptions {
  paramKey?: string;
  entityService?: any;
  findMethod?: string;
  findByUserMethod?: string;
  ownershipField?: string;
  useCurrentUser?: boolean;
}

export const OWNERSHIP_GUARD_OPTIONS = 'ownership_guard_options';

export const Owner = (options: OwnershipGuardOptions = {}): MethodDecorator => 
  SetMetadata(OWNERSHIP_GUARD_OPTIONS, options);

export const OwnerCheck = (owner: boolean): MethodDecorator => 
  SetMetadata('owner', owner);
