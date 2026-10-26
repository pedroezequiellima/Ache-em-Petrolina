import { ForbiddenException } from '@nestjs/common';
import { Papel } from '../generated/prisma/enums.js';

// O que vai dentro do token JWT e fica disponível em cada requisição
export interface UsuarioLogado {
  id: number;
  papel: Papel;
  lojaId: number | null;
}

// ADMIN acessa qualquer loja; LOJISTA só a dele
export function garantirAcessoALoja(usuario: UsuarioLogado, lojaId: number) {
  if (usuario.papel === Papel.ADMIN) return;
  if (usuario.lojaId !== lojaId) {
    throw new ForbiddenException('Você só pode gerenciar a sua própria loja');
  }
}
