import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Papel } from '../../generated/prisma/enums.js';
import { PAPEIS } from '../decorators.js';
import { UsuarioLogado } from '../usuario-logado.js';

// Roda depois do JwtAuthGuard: confere se o papel do usuário pode usar a rota
@Injectable()
export class PapeisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const exigidos = this.reflector.getAllAndOverride<Papel[]>(PAPEIS, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!exigidos?.length) return true;

    const { usuario } = ctx
      .switchToHttp()
      .getRequest<{ usuario?: UsuarioLogado }>();
    if (!usuario || !exigidos.includes(usuario.papel)) {
      throw new ForbiddenException('Seu usuário não tem permissão para isso');
    }
    return true;
  }
}
