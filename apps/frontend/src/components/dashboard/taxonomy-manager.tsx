import { Plus, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/dashboard/confirm-submit";
import { dangerButton, smallButton } from "@/components/dashboard/ui";
import { inputClass } from "@/components/form-fields";
import {
  createTaxonomyAction,
  deleteTaxonomyAction,
  renameTaxonomyAction,
} from "@/lib/actions/taxonomy";
import type { TaxonomyKind } from "@/lib/dashboard/taxonomy";
import type { TaxonomyItem } from "@/lib/types";

const TEXTS: Record<TaxonomyKind, { newLabel: string; usage: [string, string] }> = {
  categorias: { newLabel: "Nova categoria", usage: ["produto", "produtos"] },
  bairros: { newLabel: "Novo bairro", usage: ["loja", "lojas"] },
};

// Lista de categorias ou de bairros: criar, renomear e remover (sem JavaScript também funciona)
export function TaxonomyManager({ kind, items }: { kind: TaxonomyKind; items: TaxonomyItem[] }) {
  const { newLabel, usage } = TEXTS[kind];

  return (
    <>
      <form
        action={createTaxonomyAction}
        className="mb-4 flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200"
      >
        <input type="hidden" name="tipo" value={kind} />
        <label className="min-w-48 flex-1 text-sm font-medium text-stone-800">
          {newLabel}
          <input name="nome" required maxLength={60} className={`${inputClass} mt-1 h-10`} />
        </label>
        <button type="submit" className={`${smallButton} h-10`}>
          <Plus className="size-4" aria-hidden />
          Adicionar
        </button>
      </form>

      <ul className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2 p-3">
            <form action={renameTaxonomyAction} className="flex min-w-0 flex-1 items-center gap-2">
              <input type="hidden" name="tipo" value={kind} />
              <input type="hidden" name="id" value={item.id} />
              <input
                name="nome"
                defaultValue={item.name}
                required
                maxLength={60}
                aria-label={`Nome de ${item.name}`}
                className={`${inputClass} h-9 min-w-0 flex-1 text-sm`}
              />
              <button type="submit" className={smallButton}>
                Renomear
              </button>
            </form>
            <span className="w-24 text-right text-sm text-stone-500">
              {item.usage} {item.usage === 1 ? usage[0] : usage[1]}
            </span>
            <form action={deleteTaxonomyAction}>
              <input type="hidden" name="tipo" value={kind} />
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmit message={`Remover "${item.name}"?`} className={dangerButton}>
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Remover {item.name}</span>
              </ConfirmSubmit>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-stone-500">
        Só dá para remover {kind} sem {usage[1]} ligados. Renomear muda também o endereço usado nos
        filtros do site.
      </p>
    </>
  );
}
