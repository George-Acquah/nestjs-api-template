import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  _IPayload,
  _ITokens,
  _TJwtPayload
} from 'src/shared/interfaces/jwt_payload.interface';
import { sign, verify } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { sanitizeLoginUserFn } from 'src/shared/helpers/users.sanitizers';
import { LoginUserDto } from 'src/shared/dtos/users/login-users.dtos';
import { _ISanitizedUser } from 'src/shared/interfaces/users.interface';
import { getExpirationTime } from 'src/shared/utils/users.utils';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(private userService: UsersService) {}
  async signPayload(payload: _IPayload, secret: string, exp: string) {
    return sign(payload, secret, { expiresIn: exp });
  }

  async verifyToken(token: string, secret: string): Promise<_IPayload> {
    const tokenPayload = verify(token, secret) as _TJwtPayload;
    return {
      sub: {
        email: tokenPayload.sub.email
      },
      user_id: tokenPayload.user_id,
      userType: tokenPayload.userType
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUser(email);
    //Compare password from user to password in DB
    const isValidPassword = await compare(password, user.password);

    if (user && isValidPassword) {
      return sanitizeLoginUserFn(user);
    }

    throw new Error('Wrong Password');
  }

  async refreshToken(user: _ISanitizedUser) {
    const payload: _IPayload = {
      user_id: user._id?.toString() ?? '',
      userType: user.userType,
      sub: {
        email: user.email
      }
    };

    const access_token = await this.signPayload(
      payload,
      process.env.SECRET_KEY,
      '1h'
    );

    const refresh_token = await this.signPayload(
      payload,
      process.env.REFRESH_KEY,
      '12h'
    );

    const expiresIn = getExpirationTime(5);

    const tokens: _ITokens = {
      access_token,
      refresh_token,
      expiresIn
    };

    return {
      tokens
    };
  }

  async login(dto: LoginUserDto) {
    const { email, password } = dto;
    const user = await this.validateUser(email, password);

    const payload: _IPayload = {
      user_id: user._id?.toString() ?? '',
      userType: user.userType,
      sub: {
        email: user.email
      }
    };

    const access_token = await this.signPayload(
      payload,
      process.env.SECRET_KEY,
      '1h'
    );

    const refresh_token = await this.signPayload(
      payload,
      process.env.REFRESH_KEY,
      '12h'
    );

    const expiresIn = getExpirationTime(1);

    const tokens: _ITokens = {
      access_token,
      refresh_token,
      expiresIn
    };

    return {
      user,
      tokens
    };
  }

  async findByPayload(payload: _IPayload) {
    const {
      sub: { email }
    } = payload;

    return await this.userService.findUser(email);
  }

  async verifyUser(payload: _IPayload) {
    const user = await this.findByPayload(payload);

    return sanitizeLoginUserFn(user);
  }
}
