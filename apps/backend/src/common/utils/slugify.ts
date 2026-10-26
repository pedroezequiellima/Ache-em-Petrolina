// "Moda Feminina & Acessórios" -> "moda-feminina-acessorios"
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // remove acentos (\p{M} = marcas de acento separadas pelo NFD)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
