import { Module } from '@nestjs/common';
import { User } from '@paris-2024/server-data-access-user';

@Module({
  exports: [User],
  providers: [],
})
export class EntitiesModule {
  static provideEntities() {
    return [User];
  }
}
