import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserType } from '../interfaces/active-user-type';

interface MyRequest extends Request {
  user: ActiveUserType;
}

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserType | undefined, context: ExecutionContext) => {
    const request: MyRequest = context.switchToHttp().getRequest<MyRequest>();
    const user: ActiveUserType = request.user;
    return field ? user?.[field] : user;
  },
);
