import { Module } from '@nestjs/common';
import { User } from '@paris-2024/server-data-access-user';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';

@Module({
  exports: [
    User,
    PasswordReset,
  ],
  providers: [],
})
export class EntitiesModule {
  static provideEntities() {
    return [
      User,
      PasswordReset,
    ];
  }
}
