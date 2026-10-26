// Busca do catálogo: mesma regra que o front usava em src/lib/catalog.ts,
// agora no backend. Funções puras (sem banco) para dar para testar.

export type Ordem = 'relevancia' | 'menor-preco' | 'maior-preco';

export interface ProdutoBuscavel {
  nome: string;
  marca: string | null;
  descricao: string | null;
  detalhes: string[];
  tags: string[];
  destaque: boolean;
  statusEstoque: 'DISPONIVEL' | 'POUCAS_UNIDADES' | 'ESGOTADO';
  preco: { toNumber(): number } | number;
  categoria: { nome: string };
  loja: { nome: string };
}

const PALAVRAS_IGNORADAS = new Set([
  'a',
  'o',
  'as',
  'os',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'para',
  'pra',
  'com',
  'um',
  'uma',
]);

const PESO_ESTOQUE = {
  DISPONIVEL: 0,
  POUCAS_UNIDADES: 1,
  ESGOTADO: 2,
} as const;

// "Tênis" -> "tenis"
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

// "Tênis da Nike 42" -> ["teni", "nike", "42"] (tira acento, palavras vazias e plural simples)
export function quebrarTermos(busca: string): string[] {
  return normalizar(busca)
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !PALAVRAS_IGNORADAS.has(t))
    .map((t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t));
}

// Todos os termos precisam aparecer. No nome/marca vale 3, no resto vale 1.
// Retorna -1 se algum termo não aparece.
export function relevancia(produto: ProdutoBuscavel, termos: string[]): number {
  const titulo = normalizar(`${produto.nome} ${produto.marca ?? ''}`);
  const corpo = normalizar(
    [
      produto.categoria.nome,
      produto.loja.nome,
      produto.descricao ?? '',
      ...produto.detalhes,
      ...produto.tags,
    ].join(' '),
  );

  let pontos = 0;
  for (const termo of termos) {
    if (titulo.includes(termo)) pontos += 3;
    else if (corpo.includes(termo)) pontos += 1;
    else return -1;
  }
  return pontos;
}

function preco(p: ProdutoBuscavel): number {
  return typeof p.preco === 'number' ? p.preco : p.preco.toNumber();
}

// Filtra pela busca e ordena. Esgotados sempre por último.
export function buscarEOrdenar<T extends ProdutoBuscavel>(
  produtos: T[],
  busca = '',
  ordem: Ordem = 'relevancia',
): T[] {
  const termos = quebrarTermos(busca);
  const comPontos = produtos
    .map((produto) => ({ produto, pontos: relevancia(produto, termos) }))
    .filter(({ pontos }) => pontos >= 0);

  comPontos.sort((a, b) => {
    const esgotado =
      Number(a.produto.statusEstoque === 'ESGOTADO') -
      Number(b.produto.statusEstoque === 'ESGOTADO');
    if (esgotado !== 0) return esgotado;

    if (ordem === 'menor-preco') return preco(a.produto) - preco(b.produto);
    if (ordem === 'maior-preco') return preco(b.produto) - preco(a.produto);

    return (
      b.pontos - a.pontos ||
      Number(b.produto.destaque) - Number(a.produto.destaque) ||
      PESO_ESTOQUE[a.produto.statusEstoque] -
        PESO_ESTOQUE[b.produto.statusEstoque] ||
      a.produto.nome.localeCompare(b.produto.nome, 'pt-BR')
    );
  });

  return comPontos.map(({ produto }) => produto);
}
