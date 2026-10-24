import {
  buscarEOrdenar,
  ProdutoBuscavel,
  quebrarTermos,
  relevancia,
} from './busca.js';

function produto(
  nome: string,
  extra: Partial<ProdutoBuscavel> = {},
): ProdutoBuscavel {
  return {
    nome,
    marca: null,
    descricao: null,
    detalhes: [],
    tags: [],
    destaque: false,
    statusEstoque: 'DISPONIVEL',
    preco: 100,
    categoria: { nome: 'Calçados' },
    loja: { nome: 'Passo Certo' },
    ...extra,
  };
}

describe('quebrarTermos', () => {
  it('tira acento, palavras vazias e plural simples', () => {
    expect(quebrarTermos('Tênis da Nike 42')).toEqual(['teni', 'nike', '42']);
    expect(quebrarTermos('botas para festa')).toEqual(['bota', 'festa']);
  });
});

describe('relevancia', () => {
  const tenis = produto('Tênis Nike Revolution 7', {
    marca: 'Nike',
    tags: ['42', 'corrida'],
  });

  it('acha sem acento e pelo tamanho nas tags (exemplo do README do front)', () => {
    expect(relevancia(tenis, quebrarTermos('tenis nike 42'))).toBeGreaterThan(
      0,
    );
  });

  it('vale mais no nome (3) do que no resto (1)', () => {
    expect(relevancia(tenis, ['nike'])).toBe(3);
    expect(relevancia(tenis, ['corrida'])).toBe(1);
  });

  it('retorna -1 se algum termo não aparece', () => {
    expect(relevancia(tenis, ['nike', 'adidas'])).toBe(-1);
  });
});

describe('buscarEOrdenar', () => {
  const lista = [
    produto('Bota Couro', { preco: 300, statusEstoque: 'ESGOTADO' }),
    produto('Sandália', { preco: 50 }),
    produto('Tênis', { preco: 200, destaque: true }),
  ];

  it('sem busca, devolve tudo com esgotado por último', () => {
    const nomes = buscarEOrdenar(lista).map((p) => p.nome);
    expect(nomes).toEqual(['Tênis', 'Sandália', 'Bota Couro']);
  });

  it('ordena por menor preço, mas esgotado continua no fim', () => {
    const nomes = buscarEOrdenar(lista, '', 'menor-preco').map((p) => p.nome);
    expect(nomes).toEqual(['Sandália', 'Tênis', 'Bota Couro']);
  });

  it('ordena por maior preço', () => {
    const nomes = buscarEOrdenar(lista, '', 'maior-preco').map((p) => p.nome);
    expect(nomes).toEqual(['Tênis', 'Sandália', 'Bota Couro']);
  });

  it('filtra pelo termo buscado', () => {
    const nomes = buscarEOrdenar(lista, 'sandalias').map((p) => p.nome);
    expect(nomes).toEqual(['Sandália']);
  });
});
