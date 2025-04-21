import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export type UserSession = {
  id: string;
};

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: UserSession, done: (err: Error | null, user: UserSession) => void): void {
    done(null, { id: user.id });
  }

  deserializeUser(payload: UserSession, done: (err: Error | null, user: UserSession | null) => void): void {
    done(null, payload);
  }
}
