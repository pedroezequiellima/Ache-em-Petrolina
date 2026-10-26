import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Papel } from '../generated/prisma/enums.js';
import { UsuarioLogado } from './usuario-logado.js';

export const PUBLICO = 'publico';
export const PAPEIS = 'papeis';

// Libera a rota sem login (por padrão TODAS exigem login)
export const Publico = () => SetMetadata(PUBLICO, true);

// Restringe a rota a certos papéis, ex: @Papeis(Papel.ADMIN)
export const Papeis = (...papeis: Papel[]) => SetMetadata(PAPEIS, papeis);

// Injeta no método o usuário que veio no token
export const UsuarioAtual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UsuarioLogado =>
    ctx.switchToHttp().getRequest<{ usuario: UsuarioLogado }>().usuario,
);
