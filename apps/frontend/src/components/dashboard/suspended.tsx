import { Suspense, type ReactNode } from "react";

// Toda página do painel lê a sessão (cookie) e chama a API a cada visita. Com Cache Components,
// essa leitura precisa ficar dentro de um <Suspense> da PRÓPRIA página: ao navegar entre páginas
// do painel, o layout já está montado e o Suspense dele não aparece de novo. Uso:
//   export default suspended(async function ProdutosPage(props) { ... })
export function suspended<P extends object>(Page: (props: P) => Promise<ReactNode>) {
  function SuspendedPage(props: P) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Page {...props} />
      </Suspense>
    );
  }
  SuspendedPage.displayName = `suspended(${Page.name})`;
  return SuspendedPage;
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-stone-200" />
      <div className="h-24 rounded-2xl bg-stone-200" />
      <div className="h-24 rounded-2xl bg-stone-200" />
    </div>
  );
}
