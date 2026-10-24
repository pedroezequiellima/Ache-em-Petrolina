// Popula o banco com os dados de exemplo do front (8 lojas e 30 produtos de Petrolina).
// Os JSON em seed-data/ foram exportados de apps/frontend/src/data (dados FICTÍCIOS:
// os WhatsApp usam o prefixo 9 0000, que não existe).
//
// Também cria o admin (ADMIN_EMAIL/ADMIN_SENHA do .env) e um lojista de exemplo
// por loja: <slug-da-loja>@lojista.local com a senha SEED_SENHA_LOJISTA.
//
// Rodar: npm run db:seed   (pode rodar de novo: atualiza pelo slug/e-mail, não duplica)
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { gerarHashDaSenha } from '../src/auth/senha.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Papel, StatusEstoque } from '../src/generated/prisma/enums.js';

interface CategoriaFront {
  slug: string;
  name: string;
}
interface BairroFront {
  slug: string;
  name: string;
}
interface HorarioFront {
  open: string;
  close: string;
}
interface LojaFront {
  id: string;
  slug: string;
  name: string;
  neighborhoodSlug: string;
  address: string;
  cep: string;
  whatsapp: string;
  phone: string;
  hours: (HorarioFront | null)[];
  rating: number;
  reviewCount: number;
}
interface ProdutoFront {
  slug: string;
  name: string;
  brand?: string;
  categorySlug: string;
  storeId: string;
  price: number;
  oldPrice?: number;
  stock: 'disponivel' | 'poucas' | 'esgotado';
  description: string;
  details: string[];
  images: string[];
  featured?: boolean;
  tags?: string[];
}

const ESTOQUE = {
  disponivel: StatusEstoque.DISPONIVEL,
  poucas: StatusEstoque.POUCAS_UNIDADES,
  esgotado: StatusEstoque.ESGOTADO,
};

function ler<T>(arquivo: string): T[] {
  const url = new URL(`./seed-data/${arquivo}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as T[];
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const categorias = new Map<string, number>();
  for (const c of ler<CategoriaFront>('categorias')) {
    const { id } = await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nome: c.name },
      create: { slug: c.slug, nome: c.name },
    });
    categorias.set(c.slug, id);
  }

  const bairros = new Map<string, number>();
  for (const b of ler<BairroFront>('bairros')) {
    const { id } = await prisma.bairro.upsert({
      where: { slug: b.slug },
      update: { nome: b.name },
      create: { slug: b.slug, nome: b.name },
    });
    bairros.set(b.slug, id);
  }

  const lojas = new Map<string, number>(); // id do front ("loja-1") -> id do banco
  for (const l of ler<LojaFront>('lojas')) {
    const dados = {
      nome: l.name,
      endereco: l.address,
      cep: l.cep,
      whatsapp: l.whatsapp,
      telefone: l.phone,
      avaliacao: l.rating,
      totalAvaliacoes: l.reviewCount,
      bairroId: bairros.get(l.neighborhoodSlug)!,
    };
    // índice do array = dia da semana; null = fechado (não vira registro)
    const horarios = l.hours.flatMap((h, diaSemana) =>
      h ? [{ diaSemana, abre: h.open, fecha: h.close }] : [],
    );
    const { id } = await prisma.loja.upsert({
      where: { slug: l.slug },
      update: { ...dados, horarios: { deleteMany: {}, create: horarios } },
      create: { slug: l.slug, ...dados, horarios: { create: horarios } },
    });
    lojas.set(l.id, id);
  }

  const produtos = ler<ProdutoFront>('produtos');
  for (const p of produtos) {
    const dados = {
      nome: p.name,
      marca: p.brand ?? null,
      descricao: p.description,
      detalhes: p.details,
      preco: p.price,
      precoAntigo: p.oldPrice ?? null,
      fotos: p.images,
      tags: p.tags ?? [],
      destaque: p.featured ?? false,
      statusEstoque: ESTOQUE[p.stock],
      lojaId: lojas.get(p.storeId)!,
      categoriaId: categorias.get(p.categorySlug)!,
    };
    await prisma.produto.upsert({
      where: { slug: p.slug },
      update: dados,
      create: { slug: p.slug, ...dados },
    });
  }

  // Usuários: 1 admin (do .env) + 1 lojista de exemplo por loja
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminSenha = process.env.ADMIN_SENHA;
  if (!adminEmail || !adminSenha || adminSenha.length < 8) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_SENHA (8+ caracteres) no .env');
  }
  const adminHash = await gerarHashDaSenha(adminSenha);
  await prisma.usuario.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { senhaHash: adminHash, papel: Papel.ADMIN, lojaId: null },
    create: {
      nome: 'Administrador',
      email: adminEmail.toLowerCase(),
      senhaHash: adminHash,
      papel: Papel.ADMIN,
    },
  });

  const lojistaHash = await gerarHashDaSenha(
    process.env.SEED_SENHA_LOJISTA ?? 'lojista-dev-123',
  );
  for (const l of ler<LojaFront>('lojas')) {
    const email = `${l.slug}@lojista.local`;
    await prisma.usuario.upsert({
      where: { email },
      update: { senhaHash: lojistaHash, lojaId: lojas.get(l.id)! },
      create: {
        nome: `Lojista ${l.name}`,
        email,
        senhaHash: lojistaHash,
        papel: Papel.LOJISTA,
        lojaId: lojas.get(l.id)!,
      },
    });
  }

  console.log(
    `Seed ok: ${categorias.size} categorias, ${bairros.size} bairros, ${lojas.size} lojas, ${produtos.length} produtos, 1 admin + ${lojas.size} lojistas`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
