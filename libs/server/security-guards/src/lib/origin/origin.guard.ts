import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin || request.headers.referer;

    if (
      request.hostname === 'localhost' || 
      (origin && (
        origin.startsWith('https://studi-exam-jo.lois-kouninef.eu') || 
        origin.startsWith('https://studi-exam-jo-staging.lois-kouninef.eu')
      ))
    ) {
      return true;
    }

    throw new ForbiddenException('Access denied: Invalid origin');
  }
}
