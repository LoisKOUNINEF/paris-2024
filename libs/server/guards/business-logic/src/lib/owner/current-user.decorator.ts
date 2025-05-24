import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '@paris-2024/server-base-entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
