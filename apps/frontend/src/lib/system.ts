import "server-only";
import { ApiError, apiGet } from "@/lib/api";

// Saúde do sistema para a página /status: a API responde e consegue falar com o banco?

export interface SystemStatus {
  api: boolean;
  database: boolean;
  // Quanto a API levou para responder, em milissegundos
  latencyMs: number | null;
  checkedAt: string;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const start = performance.now();
  const checkedAt = new Date().toISOString();
  try {
    const health = await apiGet<{ status: string; database: string }>("/health");
    return {
      api: health.status === "ok",
      database: health.database === "up",
      latencyMs: Math.round(performance.now() - start),
      checkedAt,
    };
  } catch (error) {
    // A API respondeu com erro: ela está no ar, mas não conseguiu falar com o banco
    if (error instanceof ApiError) {
      return {
        api: true,
        database: false,
        latencyMs: Math.round(performance.now() - start),
        checkedAt,
      };
    }
    // Sem resposta: a API está fora do ar (e não dá para saber o estado do banco)
    return { api: false, database: false, latencyMs: null, checkedAt };
  }
}
