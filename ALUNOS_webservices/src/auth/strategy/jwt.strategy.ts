import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'secret',
      ignoreExpiration: false,
    });
  }

  // Aqui já não vamos à BD.
  // Limitamo-nos a devolver o payload como "user".
  async validate(payload: { sub: string; username?: string }) {
    return {
      userId: payload.sub,
      username: payload.username ?? null,
    };
  }
}
