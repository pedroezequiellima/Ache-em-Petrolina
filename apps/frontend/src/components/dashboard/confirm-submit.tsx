"use client";

import type { ReactNode } from "react";

// Botão de envio que pergunta antes (apagar, cancelar). Sem JavaScript o formulário é enviado
// direto: a pergunta é só uma proteção contra clique sem querer.
export function ConfirmSubmit({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
