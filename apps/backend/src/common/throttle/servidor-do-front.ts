import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// O site (Next.js) chama a API pelo servidor dele, então TODAS as visitas
// chegam aqui com o mesmo IP. Sem isto, os limites por IP valeriam para o
// site inteiro (ex: 5 logins por minuto para todo mundo). O servidor do Next
// manda este cabeçalho com um token que só ele e a API conhecem
// (FRONTEND_TOKEN); quem não tem o token continua com o limite normal por IP.
export const CABECALHO_TOKEN_FRONT = 'x-frontend-token';

// IP do visitante, repassado pelo servidor do Next (login e outras ações)
export const CABECALHO_IP_CLIENTE = 'x-cliente-ip';

// true se a requisição traz o token certo
function veioDoServidorDoFront(req: Request, esperado: Buffer): boolean {
  const recebido = req.headers[CABECALHO_TOKEN_FRONT];
  if (typeof recebido !== 'string') return false;

  // timingSafeEqual: compara em tempo constante, para o tempo da resposta
  // não revelar quantos caracteres do token estão certos
  const buffer = Buffer.from(recebido);
  return buffer.length === esperado.length && timingSafeEqual(buffer, esperado);
}

// Devolve o skipIf do ThrottlerModule. Só libera LEITURA (GET): login,
// reservas e cadastros continuam limitados mesmo com o token.
export function liberarLeiturasDoFront(token?: string) {
  if (!token) return () => false;
  const esperado = Buffer.from(token);

  return (context: ExecutionContext): boolean => {
    const req = context.switchToHttp().getRequest<Request>();
    return req.method === 'GET' && veioDoServidorDoFront(req, esperado);
  };
}

// Devolve o getTracker do ThrottlerModule: de quem é cada requisição.
// Com o token certo, conta pelo IP do visitante que o Next repassou, para o
// limite de login (5/min) valer por pessoa e não para o site todo. Sem o
// token, o cabeçalho é ignorado: senão qualquer um inventaria um IP novo a
// cada tentativa para fugir do limite.
export function rastrearClienteDoFront(token?: string) {
  const esperado = token ? Buffer.from(token) : undefined;

  return (req: Record<string, any>): string => {
    const request = req as Request;
    const ipDireto = request.ip ?? 'desconhecido';
    if (!esperado || !veioDoServidorDoFront(request, esperado)) return ipDireto;

    const ipCliente = request.headers[CABECALHO_IP_CLIENTE];
    if (typeof ipCliente !== 'string' || !isIP(ipCliente)) return ipDireto;
    return `front:${ipCliente}`;
  };
}
