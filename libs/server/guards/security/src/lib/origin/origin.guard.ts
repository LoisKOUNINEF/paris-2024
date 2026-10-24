import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin || request.headers.referer;
    // compare full origins: a prefix match would accept https://allowed.eu.evil.com
    const normalizeOrigin = (origin: string) => {
      try {
        return new URL(origin).origin.replace('https://www.', 'https://');
      } catch {
        return '';
      }
    };

    const allowedOrigins = [
      'https://studi-exam-jo.lois-kouninef.eu',
      'https://studi-exam-jo-staging.lois-kouninef.eu'
    ];

    if (
      request.hostname === 'localhost' ||
      (origin && allowedOrigins.includes(normalizeOrigin(origin)))
    ) {
      return true;
    }

    throw new ForbiddenException('Access denied: Invalid origin');
  }
}
