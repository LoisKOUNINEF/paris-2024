export interface OwnershipGuardOptions {
  paramKey?: string;
  entityService?: any;
  findMethod?: string;
  ownershipField?: string;
}

export const OWNERSHIP_GUARD_OPTIONS = 'ownership_guard_options';

import { SetMetadata } from '@nestjs/common';

export const Owner = (options: OwnershipGuardOptions = {}): MethodDecorator => 
  SetMetadata(OWNERSHIP_GUARD_OPTIONS, options);

export const OwnerCheck = (owner: boolean): MethodDecorator => 
  SetMetadata('owner', owner);
