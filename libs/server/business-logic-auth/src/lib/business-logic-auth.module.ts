import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { DataAccessUserModule } from '@paris-2024/server-data-access-user';

@Module({
  imports: [
    PassportModule.register({ session: true }), 
    DataAccessUserModule,
  ],
  providers: [
    AuthService, 
    LocalStrategy, 
    SessionSerializer,
  ],
  exports: [AuthService]
})
export class BusinessLogicAuthModule {}
