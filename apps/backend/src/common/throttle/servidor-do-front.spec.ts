import type { ExecutionContext } from '@nestjs/common';
import {
  CABECALHO_IP_CLIENTE,
  CABECALHO_TOKEN_FRONT,
  liberarLeiturasDoFront,
  rastrearClienteDoFront,
} from './servidor-do-front.js';

const TOKEN = 'token-de-teste-com-mais-de-32-caracteres';

function contexto(method: string, headers: Record<string, unknown> = {}) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ method, headers }) }),
  } as unknown as ExecutionContext;
}

describe('liberarLeiturasDoFront', () => {
  const pular = liberarLeiturasDoFront(TOKEN);

  it('libera GET com o token certo', () => {
    expect(pular(contexto('GET', { [CABECALHO_TOKEN_FRONT]: TOKEN }))).toBe(
      true,
    );
  });

  it('mantém o limite sem token ou com token errado', () => {
    expect(pular(contexto('GET'))).toBe(false);
    expect(
      pular(contexto('GET', { [CABECALHO_TOKEN_FRONT]: TOKEN + 'x' })),
    ).toBe(false);
    expect(
      pular(contexto('GET', { [CABECALHO_TOKEN_FRONT]: 'x'.repeat(40) })),
    ).toBe(false);
  });

  it('mantém o limite em login, reservas e cadastros, mesmo com o token', () => {
    for (const method of ['POST', 'PATCH', 'DELETE']) {
      expect(pular(contexto(method, { [CABECALHO_TOKEN_FRONT]: TOKEN }))).toBe(
        false,
      );
    }
  });

  it('não libera nada se o FRONTEND_TOKEN não estiver configurado', () => {
    const semToken = liberarLeiturasDoFront(undefined);
    expect(semToken(contexto('GET', { [CABECALHO_TOKEN_FRONT]: '' }))).toBe(
      false,
    );
  });
});

describe('rastrearClienteDoFront', () => {
  const rastrear = rastrearClienteDoFront(TOKEN);
  const req = (headers: Record<string, unknown>) => ({
    ip: '10.0.0.5',
    headers,
  });

  it('com o token, conta pelo IP do visitante que o Next repassou', () => {
    expect(
      rastrear(
        req({
          [CABECALHO_TOKEN_FRONT]: TOKEN,
          [CABECALHO_IP_CLIENTE]: '200.1.2.3',
        }),
      ),
    ).toBe('front:200.1.2.3');
  });

  it('sem o token, ignora o IP repassado (senão daria para fugir do limite)', () => {
    expect(rastrear(req({ [CABECALHO_IP_CLIENTE]: '200.1.2.3' }))).toBe(
      '10.0.0.5',
    );
    expect(
      rastrear(
        req({
          [CABECALHO_TOKEN_FRONT]: 'x'.repeat(TOKEN.length),
          [CABECALHO_IP_CLIENTE]: '200.1.2.3',
        }),
      ),
    ).toBe('10.0.0.5');
  });

  it('ignora um IP repassado que não é IP', () => {
    expect(
      rastrear(
        req({
          [CABECALHO_TOKEN_FRONT]: TOKEN,
          [CABECALHO_IP_CLIENTE]: 'qualquer-coisa',
        }),
      ),
    ).toBe('10.0.0.5');
  });
});
