import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedRequest } from '../../common/types/authenticated-request';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request & AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException({
        code: 'AUTH_USER_MISSING',
        message: 'Authenticated user context is missing.'
      });
    }

    return request.user;
  }
);
