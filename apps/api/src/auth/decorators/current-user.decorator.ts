import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../auth.types';

type RequestWithUser = Request & { user: AuthUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user ?? null;
  },
);
