import { Roles } from '@paris-2024/shared-interfaces';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id?: string;
    role: Roles;
  };
}