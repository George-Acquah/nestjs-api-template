import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { _ISafeUser } from '../interfaces/users.interface';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): _ISafeUser => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
