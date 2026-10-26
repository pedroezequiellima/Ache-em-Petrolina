"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleCheck, MessageCircle } from "lucide-react";
import { CheckboxField, FormAlert, SaveButton, TextField } from "@/components/form-fields";
import { reserveAction, type ReservationState } from "@/lib/actions/reservation";
import { formatDateTime, formatPrice, reservationWhatsappLink } from "@/lib/format";

const initialState: ReservationState = {};

export function ReservationForm({
  productId,
  productSlug,
  storeName,
}: {
  productId: string;
  productSlug: string;
  storeName: string;
}) {
  const [state, formAction, pending] = useActionState(reserveAction, initialState);
  const { reservation } = state;

  if (reservation) {
    return (
      <div role="status" className="space-y-4">
        <div className="flex items-start gap-3">
          <CircleCheck className="size-8 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-lg font-semibold text-stone-900">
              Reserva nº {reservation.id} enviada!
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {reservation.quantity}x {reservation.product.name} ·{" "}
              {formatPrice(reservation.product.price * reservation.quantity)}
            </p>
          </div>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
          <li>
            A <strong>{storeName}</strong> vai confirmar pelo seu WhatsApp. A reserva só vale depois
            dessa confirmação.
          </li>
          <li>
            Retire até <strong>{formatDateTime(reservation.expiresAt)}</strong>. Depois disso a
            reserva expira.
          </li>
          <li>O pagamento é feito na loja, na hora da retirada.</li>
        </ul>
        <a
          href={reservationWhatsappLink(reservation)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800"
        >
          <MessageCircle className="size-5" aria-hidden />
          Avisar a loja no WhatsApp
        </a>
        <Link
          href={`/produto/${productSlug}`}
          className="block text-center text-sm font-medium text-brand-700 hover:underline"
        >
          Voltar para o produto
        </Link>
      </div>
    );
  }

  const values = state.values;

  return (
    // key: depois de um erro o React limpa o formulário; assim ele volta com o que foi digitado
    <form key={state.attempt} action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="produtoId" value={productId} />
      <TextField
        label="Seu nome"
        name="nome"
        autoComplete="name"
        required
        maxLength={120}
        defaultValue={values?.nome}
      />
      <TextField
        label="Seu WhatsApp"
        hint="com DDD"
        name="whatsapp"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(87) 98888-7777"
        required
        maxLength={20}
        defaultValue={values?.whatsapp}
      />
      <TextField
        label="Quantidade"
        name="quantidade"
        type="number"
        inputMode="numeric"
        min={1}
        max={99}
        required
        defaultValue={values?.quantidade ?? "1"}
        className="max-w-32"
      />
      <CheckboxField
        name="aceite"
        label={
          <>
            Concordo em enviar meu nome e WhatsApp para a {storeName}, só para combinar esta reserva
            (LGPD).
          </>
        }
      />
      <FormAlert message={state.error} />
      <SaveButton pending={pending} pendingLabel="Enviando...">
        Reservar
      </SaveButton>
    </form>
  );
}
