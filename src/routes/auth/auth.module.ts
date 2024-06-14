import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthModule } from 'src/modules/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/shared/jwt/jwt.strategy';
import { LocalJwtStrategy } from 'src/shared/jwt/local.jwt.strategy';
import { RefreshStrategy } from 'src/shared/jwt/refresh.jwt.strategy';
import { LocalJwtAuthGuard } from 'src/shared/guards/local-jwt.guard';
import { RefreshJwtAuthGuard } from 'src/shared/guards/refreshJwt.guard';
import { JwtAuthGuard } from 'src/shared/guards/Jwt.guard';

@Module({
  imports: [UsersModule, JwtAuthModule, PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalJwtStrategy,
    RefreshStrategy,
    JwtAuthGuard,
    LocalJwtAuthGuard,
    RefreshJwtAuthGuard
  ]
})
export class AuthModule {}
