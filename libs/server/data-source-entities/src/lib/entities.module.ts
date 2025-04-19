import { Module } from '@nestjs/common';
import { User } from '@paris-2024/server-data-access-user';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import { Cart } from '@paris-2024/server-data-access-cart';
import { Bundle } from '@paris-2024/server-data-access-bundle';
import { ItemJunction } from '@paris-2024/server-data-access-item-junction';

@Module({
  exports: [
    User,
    PasswordReset,
    Cart,
    ItemJunction,
    Bundle,
  ],
  providers: [],
})
export class EntitiesModule {
  static provideEntities() {
    return [
      User,
      PasswordReset,
      Cart,
      ItemJunction,
      Bundle,
    ];
  }
}
