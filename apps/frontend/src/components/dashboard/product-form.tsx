"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CheckboxField,
  FormAlert,
  FormSection,
  SaveButton,
  SelectField,
  TextArea,
  TextField,
} from "@/components/form-fields";
import { saveProductAction } from "@/lib/actions/products";
import type { FormState } from "@/lib/form";
import type { ManagedProduct, Option } from "@/lib/types";

const initialState: FormState = {};

const toMoney = (value?: number) => (value === undefined ? "" : value.toFixed(2).replace(".", ","));

// Valores iniciais do formulário, com os mesmos nomes dos campos
function initialValues(product?: ManagedProduct): Record<string, string> {
  if (!product) return { estoque: "disponivel" };
  return {
    nome: product.name,
    marca: product.brand ?? "",
    categoriaId: String(product.categoryId),
    lojaId: product.storeId,
    preco: toMoney(product.price),
    precoAntigo: toMoney(product.oldPrice),
    estoque: product.stock,
    destaque: product.featured ? "on" : "",
    descricao: product.description,
    detalhes: product.details.join("\n"),
    fotos: product.images.join("\n"),
    tags: (product.tags ?? []).join(", "),
  };
}

export function ProductForm({
  product,
  categories,
  stores,
}: {
  product?: ManagedProduct;
  categories: Option[];
  // Só para o admin, que escolhe a loja. O lojista cadastra sempre na dele
  stores?: Option[];
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);
  // Depois de um erro, o formulário volta com o que foi digitado
  const values = state.values ?? initialValues(product);

  return (
    <form key={state.attempt} action={formAction} className="space-y-4" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}

      <FormSection title="Produto">
        <TextField label="Nome" name="nome" required maxLength={120} defaultValue={values.nome} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Marca"
            hint="opcional"
            name="marca"
            maxLength={60}
            defaultValue={values.marca}
          />
          <SelectField label="Categoria" name="categoriaId" defaultValue={values.categoriaId ?? ""}>
            <option value="" disabled>
              Escolha...
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
        {stores && (
          <SelectField label="Loja" name="lojaId" defaultValue={values.lojaId ?? ""}>
            <option value="" disabled>
              Escolha...
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
        )}
      </FormSection>

      <FormSection title="Preço e estoque">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Preço"
            hint="R$"
            name="preco"
            inputMode="decimal"
            placeholder="129,90"
            required
            defaultValue={values.preco}
          />
          <TextField
            label="Preço antigo"
            hint="riscado, opcional"
            name="precoAntigo"
            inputMode="decimal"
            placeholder="159,90"
            defaultValue={values.precoAntigo}
          />
          <SelectField label="Estoque" name="estoque" defaultValue={values.estoque}>
            <option value="disponivel">Disponível</option>
            <option value="poucas">Poucas unidades</option>
            <option value="esgotado">Esgotado</option>
          </SelectField>
        </div>
        <CheckboxField
          name="destaque"
          label="Mostrar nos destaques da página inicial"
          defaultChecked={values.destaque === "on"}
        />
      </FormSection>

      <FormSection title="Descrição e fotos">
        <TextArea
          label="Descrição"
          name="descricao"
          maxLength={1000}
          defaultValue={values.descricao}
        />
        <TextArea
          label="Detalhes"
          hint="um por linha, ex.: Tamanhos: 38 ao 44"
          name="detalhes"
          defaultValue={values.detalhes}
        />
        <TextArea
          label="Fotos"
          hint="um link por linha, começando com https://"
          name="fotos"
          rows={3}
          defaultValue={values.fotos}
        />
        <TextField
          label="Palavras para a busca"
          hint="separadas por vírgula, opcional"
          name="tags"
          placeholder="tenis, corrida, academia"
          defaultValue={values.tags}
        />
      </FormSection>

      <FormAlert message={state.error} />
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>
          {product ? "Salvar alterações" : "Cadastrar produto"}
        </SaveButton>
        <Link
          href="/painel/produtos"
          className="text-sm font-medium text-stone-600 hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
