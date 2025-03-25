import { Module } from '@nestjs/common';

@Module({
  exports: [],
  providers: [],
})
export class EntitiesModule {
  static provideEntities() {
    return [];
  }
}
