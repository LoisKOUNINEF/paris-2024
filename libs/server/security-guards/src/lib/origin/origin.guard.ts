import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin || request.headers.referer;
    const normalizeOrigin = (origin: string) => {
      if (!origin) return '';
      return origin.replace('https://www.', 'https://');
    };

    const allowedOrigins = [
      'https://studi-exam-jo.lois-kouninef.eu',
      'https://studi-exam-jo-staging.lois-kouninef.eu'
    ];

    if (
      request.hostname === 'localhost' ||
      (origin && allowedOrigins.some(allowed => normalizeOrigin(origin).startsWith(allowed)))
    ) {
      return true;
    }

    throw new ForbiddenException('Access denied: Invalid origin');
  }
}
