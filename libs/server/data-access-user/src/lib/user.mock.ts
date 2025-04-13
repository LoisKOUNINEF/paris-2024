import { Roles } from '@paris-2024/shared-interfaces';
import { createEntityMock } from '@paris-2024/shared-utils';
import { User } from './user.entity';

const { mockEntity } = createEntityMock(User);

export const mockUser: User = {
  ...mockEntity,
  id: 'test-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: '10Characters+',
  role: Roles.CUSTOMER,
  cartId: 'cart-id',
  isAnonymized: false,
  lastLoginAt: new Date(),
  deletedAt: null,
  secretKey: 'test-secret',
  createdAt: new Date(),
  updatedAt: new Date(),
  hashPassword: async () => { return; } ,
}