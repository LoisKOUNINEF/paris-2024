import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './user.dto';

describe('UpdateUserDto', () => {
  // same options as the PATCH /users/:id body pipe
  const validateUpdate = (body: object) =>
    validate(plainToInstance(UpdateUserDto, body), {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

  it('should accept a partial update of editable fields', async () => {
    await expect(validateUpdate({ firstName: 'Jane' })).resolves.toHaveLength(0);
  });

  it('should accept a password update with the current password', async () => {
    await expect(validateUpdate({
      password: 'NewPassword1#',
      currentPassword: 'OldPassword1#',
    })).resolves.toHaveLength(0);
  });

  it.each([
    { role: 'admin' },
    { cartId: 'cart-1' },
    { emailVerified: true },
    { isAnonymized: true },
  ])('should reject %p', async (body) => {
    const errors = await validateUpdate({ firstName: 'Jane', ...body });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(Object.keys(body)[0]);
  });

  it('should reject an empty first name', async () => {
    await expect(validateUpdate({ firstName: '' })).resolves.toHaveLength(1);
  });
});
