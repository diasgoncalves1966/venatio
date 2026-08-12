import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { isAdminGroup } from '@venatio/shared';
import type { AuthUser } from '../auth.types';

type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !isAdminGroup(user.group)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
