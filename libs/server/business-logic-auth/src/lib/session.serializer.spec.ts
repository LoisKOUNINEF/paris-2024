import { Test, TestingModule } from '@nestjs/testing';
import { SessionSerializer, UserSession } from './session.serializer';
import { Roles } from '@paris-2024/shared-interfaces';

describe('SessionSerializer', () => {
  let serializer: SessionSerializer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionSerializer],
    }).compile();

    serializer = module.get<SessionSerializer>(SessionSerializer);
  });

  it('should be defined', () => {
    expect(serializer).toBeDefined();
  });

  describe('serializeUser', () => {
    it('should serialize user to include id and role', (done) => {
      const user: UserSession = { id: '123', role: Roles.CUSTOMER };

      serializer.serializeUser(user, (err, serializedUser) => {
        expect(err).toBeNull();
        expect(serializedUser).toEqual({ id: '123', role: Roles.CUSTOMER });
        done();
      });
    });

    it('should handle user with additional properties', (done) => {
      const user = { id: '123', role: Roles.CUSTOMER ,name: 'Test User', email: 'test@example.com' };

      serializer.serializeUser(user as UserSession, (err, serializedUser) => {
        expect(err).toBeNull();
        expect(serializedUser).toEqual({ id: '123',role: Roles.CUSTOMER });
        expect(serializedUser).not.toHaveProperty('name');
        expect(serializedUser).not.toHaveProperty('email');
        done();
      });
    });
  });

  describe('deserializeUser', () => {
    it('should deserialize payload without modification', (done) => {
      const payload: UserSession = { id: '123', role: Roles.CUSTOMER };

      serializer.deserializeUser(payload, (err, deserializedUser) => {
        expect(err).toBeNull();
        expect(deserializedUser).toEqual(payload);
        done();
      });
    });
  });
});
