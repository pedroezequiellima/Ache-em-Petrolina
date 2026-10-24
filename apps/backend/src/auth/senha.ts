import bcrypt from 'bcryptjs';

// Custo 10 = ~2^10 rodadas: lento o bastante para atrapalhar quem tenta
// adivinhar senhas, rápido o bastante para o login não demorar.
const CUSTO = 10;

export function gerarHashDaSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO);
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

// Hash real de uma senha aleatória, gerado uma vez quando a API sobe.
// Usado quando o e-mail não existe, para o login demorar o mesmo tempo
// nos dois casos (senão daria para descobrir quais e-mails estão
// cadastrados medindo o tempo de resposta).
export const HASH_FALSO = bcrypt.hashSync(crypto.randomUUID(), CUSTO);
