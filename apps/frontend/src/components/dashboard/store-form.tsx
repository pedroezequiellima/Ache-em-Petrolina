"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  FormAlert,
  FormSection,
  inputClass,
  SaveButton,
  SelectField,
  TextArea,
  TextField,
} from "@/components/form-fields";
import { saveStoreAction } from "@/lib/actions/stores";
import { DAY_LABELS, formatWhatsapp } from "@/lib/format";
import type { FormState } from "@/lib/form";
import type { Option, StoreDetails } from "@/lib/types";

const initialState: FormState = {};
// Segunda a domingo (o índice segue o JavaScript: 0 = domingo)
const WEEK = [1, 2, 3, 4, 5, 6, 0];

function initialValues(store?: StoreDetails): Record<string, string> {
  const values: Record<string, string> = {};
  for (const day of WEEK) {
    // Loja nova: segunda a sábado, das 8h às 18h
    const hours = store ? store.hours[day] : day === 0 ? null : { open: "08:00", close: "18:00" };
    values[`aberto-${day}`] = hours ? "on" : "";
    values[`abre-${day}`] = hours?.open ?? "08:00";
    values[`fecha-${day}`] = hours?.close ?? "18:00";
  }
  if (!store) return values;
  return {
    ...values,
    nome: store.name,
    descricao: store.description,
    whatsapp: formatWhatsapp(store.whatsapp),
    telefone: store.phone,
    email: store.email,
    instagram: store.instagram,
    endereco: store.address,
    cep: store.cep,
    bairroId: String(store.neighborhood.id),
    logoUrl: store.logoUrl,
    avaliacao: store.rating ? String(store.rating).replace(".", ",") : "",
    totalAvaliacoes: String(store.reviewCount),
  };
}

export function StoreForm({
  store,
  neighborhoods,
  isAdmin,
  cancelHref,
}: {
  store?: StoreDetails;
  neighborhoods: Option[];
  isAdmin: boolean;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(saveStoreAction, initialState);
  const values = state.values ?? initialValues(store);

  return (
    <form key={state.attempt} action={formAction} className="space-y-4" noValidate>
      {store && <input type="hidden" name="id" value={store.id} />}

      <FormSection title="Loja">
        <TextField label="Nome" name="nome" required maxLength={120} defaultValue={values.nome} />
        <TextArea
          label="Descrição"
          hint="opcional"
          name="descricao"
          rows={2}
          maxLength={500}
          defaultValue={values.descricao}
        />
        <TextField
          label="Logo"
          hint="link da imagem, opcional"
          name="logoUrl"
          placeholder="https://..."
          defaultValue={values.logoUrl}
        />
      </FormSection>

      <FormSection title="Contato">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="WhatsApp"
            hint="com DDD"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="(87) 98888-7777"
            required
            defaultValue={values.whatsapp}
          />
          <TextField
            label="Telefone"
            hint="opcional"
            name="telefone"
            type="tel"
            maxLength={20}
            placeholder="(87) 3861-0000"
            defaultValue={values.telefone}
          />
          <TextField
            label="E-mail"
            hint="opcional"
            name="email"
            type="email"
            defaultValue={values.email}
          />
          <TextField
            label="Instagram"
            hint="opcional"
            name="instagram"
            placeholder="@sualoja"
            defaultValue={values.instagram}
          />
        </div>
      </FormSection>

      <FormSection title="Endereço">
        <TextField
          label="Endereço"
          name="endereco"
          placeholder="Av. Souza Filho, 512"
          required
          defaultValue={values.endereco}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Bairro" name="bairroId" defaultValue={values.bairroId ?? ""}>
            <option value="" disabled>
              Escolha...
            </option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="CEP"
            hint="opcional"
            name="cep"
            inputMode="numeric"
            placeholder="56304-000"
            defaultValue={values.cep}
          />
        </div>
      </FormSection>

      <FormSection title="Horário de funcionamento">
        <p className="text-sm text-stone-600">Marque os dias em que a loja abre.</p>
        <ul className="space-y-2">
          {WEEK.map((day) => (
            <li key={day} className="flex flex-wrap items-center gap-3">
              <label className="flex w-20 items-center gap-2 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  name={`aberto-${day}`}
                  defaultChecked={values[`aberto-${day}`] === "on"}
                  className="size-5 accent-brand-700"
                />
                {DAY_LABELS[day]}
              </label>
              <input
                type="time"
                name={`abre-${day}`}
                aria-label={`${DAY_LABELS[day]}: abre às`}
                defaultValue={values[`abre-${day}`]}
                className={`${inputClass} h-10 w-32`}
              />
              <span className="text-sm text-stone-500">às</span>
              <input
                type="time"
                name={`fecha-${day}`}
                aria-label={`${DAY_LABELS[day]}: fecha às`}
                defaultValue={values[`fecha-${day}`]}
                className={`${inputClass} h-10 w-32`}
              />
            </li>
          ))}
        </ul>
      </FormSection>

      {isAdmin && (
        <FormSection title="Avaliação (só o admin)">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nota média"
              hint="0 a 5"
              name="avaliacao"
              inputMode="decimal"
              placeholder="4,7"
              defaultValue={values.avaliacao}
            />
            <TextField
              label="Número de avaliações"
              name="totalAvaliacoes"
              type="number"
              min={0}
              defaultValue={values.totalAvaliacoes ?? "0"}
            />
          </div>
        </FormSection>
      )}

      <FormAlert message={state.error} />
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{store ? "Salvar alterações" : "Cadastrar loja"}</SaveButton>
        <Link href={cancelHref} className="text-sm font-medium text-stone-600 hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
