import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // Método usado pelo AuthController
  async signIn(dto: any) {
    const payload = {
      sub: dto?.userId ?? 'demo-user',
      username: dto?.username ?? dto?.email ?? 'demo',
    };

    const secret = this.config.get<string>('JWT_SECRET') ?? 'dev-secret';

    return {
      access_token: this.jwtService.sign(payload, { secret }),
    };
  }

  // Caso em algum lado usem "login"
  async login(user: any) {
    const payload = {
      sub: user?.id ?? 'demo-user',
      username: user?.username ?? 'demo',
    };

    const secret = this.config.get<string>('JWT_SECRET') ?? 'dev-secret';

    return {
      access_token: this.jwtService.sign(payload, { secret }),
    };
  }
}
