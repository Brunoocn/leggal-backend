import { Module } from '@nestjs/common';
import { AuthenticationController } from './controllers/authentication.controller';
import { LoginService } from './services/login/login.service';
import { RegisterService } from './services/register/register.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/modules/authentication/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { CryptographyModule } from '../cryptography/cryptography.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CryptographyModule],
  controllers: [AuthenticationController],
  providers: [
    LoginService,
    RegisterService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    JwtStrategy,
  ],
})
export class AuthenticationModule {}
