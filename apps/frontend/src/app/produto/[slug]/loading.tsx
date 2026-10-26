export default function ProductLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando produto"
      className="mx-auto max-w-6xl animate-pulse px-4 pt-4"
    >
      <div className="h-5 w-40 rounded bg-stone-200" />
      <div className="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="aspect-square rounded-2xl bg-stone-200" />
        <div className="space-y-3">
          <div className="h-8 w-3/4 rounded bg-stone-200" />
          <div className="h-9 w-1/3 rounded bg-stone-200" />
          <div className="h-6 w-28 rounded-full bg-stone-200" />
          <div className="mt-6 h-48 rounded-2xl bg-stone-200" />
        </div>
      </div>
    </main>
  );
}
