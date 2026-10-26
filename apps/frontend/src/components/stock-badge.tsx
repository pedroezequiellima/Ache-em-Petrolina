import type { StockLevel } from "@/lib/types";

const STOCK: Record<StockLevel, { label: string; className: string }> = {
  disponivel: { label: "Disponível", className: "bg-emerald-100 text-emerald-800" },
  poucas: { label: "Poucas unidades", className: "bg-amber-100 text-amber-800" },
  esgotado: { label: "Esgotado", className: "bg-stone-200 text-stone-700" },
};

export function StockBadge({ stock, className = "" }: { stock: StockLevel; className?: string }) {
  const { label, className: color } = STOCK[stock];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
