import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Car,
  Footprints,
  Gift,
  Hammer,
  PawPrint,
  Pill,
  Shirt,
  Smartphone,
  Sofa,
} from "lucide-react";

const SIZE = 800;
const VARIACOES = 3;

const categorias = {
  moda: { icon: Shirt, bg: "#f3e8ff", fg: "#7e22ce" },
  calcados: { icon: Footprints, bg: "#ffedd5", fg: "#c2410c" },
  eletronicos: { icon: Smartphone, bg: "#e0e7ff", fg: "#4338ca" },
  casa: { icon: Sofa, bg: "#e0f2fe", fg: "#0369a1" },
  construcao: { icon: Hammer, bg: "#fef9c3", fg: "#a16207" },
  pet: { icon: PawPrint, bg: "#ecfccb", fg: "#4d7c0f" },
  farmacia: { icon: Pill, bg: "#ccfbf1", fg: "#0f766e" },
  presentes: { icon: Gift, bg: "#ffe4e6", fg: "#be123c" },
  automotivo: { icon: Car, bg: "#e4e4e7", fg: "#3f3f46" },
};

function icone(Icon, tamanho, cor) {
  return renderToStaticMarkup(
    createElement(Icon, { size: tamanho, color: cor, strokeWidth: 1.25 }),
  );
}

function ilustracao({ icon, bg, fg }, variacao) {
  const tamanho = variacao === 3 ? 300 : 380;
  const pos = (SIZE - tamanho) / 2;
  const transform =
    variacao === 2
      ? `translate(${pos + 40} ${pos - 10}) rotate(-12 ${tamanho / 2} ${tamanho / 2})`
      : `translate(${pos} ${pos - 20})`;
  const [x1, y1, x2, y2] = variacao === 2 ? [1, 0, 0, 1] : [0, 0, 1, 1];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="2.5" fill="${fg}" fill-opacity="0.08"/>
    </pattern>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#dots)"/>
  ${variacao === 3 ? `<circle cx="${SIZE / 2}" cy="${SIZE / 2 - 20}" r="250" fill="${fg}" fill-opacity="0.08"/>` : ""}
  <g transform="${transform}">${icone(icon, tamanho, fg)}</g>
  <text x="${SIZE / 2}" y="${SIZE - 48}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" fill="${fg}" fill-opacity="0.55">Imagem ilustrativa</text>
</svg>
`;
}

const destino = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "mock");
mkdirSync(destino, { recursive: true });

for (const [slug, estilo] of Object.entries(categorias)) {
  for (let v = 1; v <= VARIACOES; v++) {
    writeFileSync(join(destino, `${slug}-${v}.svg`), ilustracao(estilo, v));
  }
}

console.log(`${Object.keys(categorias).length * VARIACOES} ilustrações geradas em public/mock`);
