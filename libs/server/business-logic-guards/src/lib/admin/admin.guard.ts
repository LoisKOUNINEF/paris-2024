import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const adminCheck = this.reflector.getAllAndOverride<boolean>('admin', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!adminCheck) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user && user.role === 'admin') {
      return true;
    }
    return false;
  }
}
