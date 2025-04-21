import { Module } from '@nestjs/common';
import { User } from '@paris-2024/server-data-access-user';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import { Cart } from '@paris-2024/server-data-access-cart';
import { Bundle } from '@paris-2024/server-data-access-bundle';
import { ItemJunction } from '@paris-2024/server-data-access-item-junction';
import { Order } from '@paris-2024/server-data-access-order';
import { Ticket } from '@paris-2024/server-data-access-ticket';

@Module({
  exports: [
    User,
    PasswordReset,
    Cart,
    ItemJunction,
    Bundle,
    Order,
    Ticket,
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
      Order,
      Ticket,
    ];
  }
}
