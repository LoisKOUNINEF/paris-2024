import { instanceToPlain } from 'class-transformer';
import { Roles } from '@paris-2024/shared-interfaces';
import { User } from './user.entity';

describe('User serialization', () => {
  it('should not expose secrets', () => {
    const user = Object.assign(new User(), {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: Roles.CUSTOMER,
      password: '$2b$10$hash',
      secretKey: 'secret',
      emailVerificationToken: 'token',
    });

    const plain = instanceToPlain(user);

    expect(plain).not.toHaveProperty('password');
    expect(plain).not.toHaveProperty('secretKey');
    expect(plain).not.toHaveProperty('emailVerificationToken');
    expect(plain).toEqual(expect.objectContaining({
      id: 'user-1',
      email: 'john.doe@example.com',
      role: Roles.CUSTOMER,
    }));
  });
});
