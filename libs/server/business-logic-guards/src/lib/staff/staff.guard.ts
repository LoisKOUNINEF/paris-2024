import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const staffCheck = this.reflector.getAllAndOverride<boolean>('staff', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!staffCheck) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user && (
      user.role === 'staff' 
      || user.role === 'admin'
    )) {
      return true;
    }
    return false;
  }
}
