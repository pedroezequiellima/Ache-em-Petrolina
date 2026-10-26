import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { Papel } from '../../generated/prisma/enums.js';
import { PUBLICO } from '../decorators.js';
import { UsuarioLogado } from '../usuario-logado.js';

interface PayloadJwt {
  sub: number;
  papel: Papel;
  lojaId: number | null;
}

// Roda antes de TODA rota (registrado como guard global no AppModule).
// Seguro por padrão: sem @Publico(), a rota exige um token válido.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const publico = this.reflector.getAllAndOverride<boolean>(PUBLICO, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (publico) return true;

    const req = ctx
      .switchToHttp()
      .getRequest<Request & { usuario?: UsuarioLogado }>();
    const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Faça login para acessar esta rota');
    }

    try {
      const payload = await this.jwt.verifyAsync<PayloadJwt>(token);
      req.usuario = {
        id: payload.sub,
        papel: payload.papel,
        lojaId: payload.lojaId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
