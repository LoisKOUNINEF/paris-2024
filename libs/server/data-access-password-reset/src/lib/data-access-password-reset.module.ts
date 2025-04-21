import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetRepository } from './password-reset.repository';
import { PasswordReset } from './password-reset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordReset])],
  providers: [PasswordResetRepository],
  exports: [PasswordResetRepository, TypeOrmModule],
})
export class DataAccessPasswordResetModule {}
