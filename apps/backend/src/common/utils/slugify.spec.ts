import { slugify } from './slugify.js';

describe('slugify', () => {
  it.each([
    ['Moda Feminina', 'moda-feminina'],
    ['Eletrônicos', 'eletronicos'],
    ['  Casa & Decoração  ', 'casa-decoracao'],
  ])('%s -> %s', (entrada, esperado) => {
    expect(slugify(entrada)).toBe(esperado);
  });
});
