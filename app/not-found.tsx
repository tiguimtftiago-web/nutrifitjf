import Link from "next/link";

export default function NotFound() {
  return (
    <main aria-labelledby="not-found-title" className="flex min-h-screen items-center justify-center bg-[#080a07] px-6 py-12 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[.04] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#b7dc62] text-2xl font-black text-black">
          NF
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b7dc62]">
          Nutrifit
        </p>
        <h1 id="not-found-title" className="text-2xl font-black md:text-3xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
          Essa página não existe ou o endereço mudou. Volte ao cardápio para
          continuar seu pedido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#b7dc62] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.01]"
        >
          Voltar para a Nutrifit
        </Link>
      </section>
    </main>
  );
}
