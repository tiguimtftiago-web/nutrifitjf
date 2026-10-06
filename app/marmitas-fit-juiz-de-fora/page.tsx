"use client";

import Link from "next/link";

const products = [
  "Marmitas Fit 350 g",
  "Marmitas Performance 450 g",
  "Marmitas Tradicional 500 g",
  "Saladas e sucos",
  "Combos para a semana",
];

export default function LocalSeoPage() {
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <section className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
        <Link href="/" className="text-sm font-black text-[#a7b86a]">
          ← Voltar para a Nutrifit
        </Link>

        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#ef7d18]">
            Nutrifit • Juiz de Fora/MG
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            Marmitas fit e saudáveis em Juiz de Fora
          </h1>
          <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
            A Nutrifit prepara marmitas para quem busca praticidade, sabor e
            refeições organizadas para a semana em Juiz de Fora. Escolha sua
            linha, monte seu combo e faça o pedido online.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product}
              className="rounded-3xl border border-white/10 bg-white/[.025] p-5"
            >
              <h2 className="text-lg font-black">{product}</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Opções Nutrifit para facilitar sua rotina alimentar com entrega
                em Juiz de Fora.
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-[#a7b86a]/20 bg-[#a7b86a]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-black">Por que escolher a Nutrifit?</h2>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/65 sm:grid-cols-2">
            <li>• Cardápio com diferentes linhas e tamanhos.</li>
            <li>• Combos para organizar as refeições da semana.</li>
            <li>• Marmitas, saladas e sucos em um só lugar.</li>
            <li>• Pedido online pelo site e WhatsApp.</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/#cardapio"
            className="rounded-full bg-[#a7b86a] px-6 py-3 text-sm font-black text-black"
          >
            Ver cardápio
          </Link>
          <Link
            href="/#combos"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-black"
          >
            Montar meu combo
          </Link>
        </div>
      </section>
    </main>
  );
}
