import type { NextConfig } from "next";

// Cabeçalhos de segurança em todas as páginas. HSTS e HTTPS ficam no Nginx, em produção.
const securityHeaders = [
  // Nenhum site pode abrir o nosso dentro de um <iframe> (evita "clickjacking" na tela de login)
  { key: "X-Frame-Options", value: "DENY" },
  // O navegador não "adivinha" o tipo de um arquivo diferente do que o servidor informou
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Outros sites recebem só o domínio de onde o visitante veio, nunca a URL completa
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // O site não usa câmera, microfone nem localização
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Não anuncia "X-Powered-By: Next.js"
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
