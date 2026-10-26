export default function StoreLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando loja"
      className="mx-auto max-w-6xl animate-pulse px-4 pt-6"
    >
      <div className="h-56 rounded-3xl bg-stone-200" />
      <div className="mt-8 h-6 w-40 rounded bg-stone-200" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-200" />
        ))}
      </div>
    </main>
  );
}
