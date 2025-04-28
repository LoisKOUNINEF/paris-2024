import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.entity;
  },
);
