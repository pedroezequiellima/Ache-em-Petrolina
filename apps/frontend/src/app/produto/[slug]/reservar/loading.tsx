export default function ReserveLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando reserva"
      className="mx-auto max-w-xl animate-pulse px-4 pt-4"
    >
      <div className="h-5 w-40 rounded bg-stone-200" />
      <div className="mt-3 h-8 w-32 rounded bg-stone-200" />
      <div className="mt-5 h-24 rounded-2xl bg-stone-200" />
      <div className="mt-4 h-72 rounded-2xl bg-stone-200" />
    </main>
  );
}
