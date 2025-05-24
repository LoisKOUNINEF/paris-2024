import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Roles } from '@paris-2024/shared-interfaces';

export type UserSession = {
  id: string;
  role: Roles;
};

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: UserSession, done: (err: Error | null, user: UserSession) => void): void {
    done(null, { id: user.id, role: user.role });
  }

  deserializeUser(payload: UserSession, done: (err: Error | null, user: UserSession | null) => void): void {
    done(null, payload);
  }
}
