"use client";

import { useState } from "react";

const meals = [
  {
    name: "Frango grelhado",
    detail: "Frango, arroz e legumes",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Carne moída com abóbora",
    detail: "Uma opção prática para a rotina",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Frango com vegetais",
    detail: "Proteína e acompanhamentos",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
  },
];

const whatsapp =
  "https://wa.me/5532998030038?text=" +
  encodeURIComponent("Olá! Quero conhecer os combos de marmitas da NutriFit.");

export default function MarmitasLandingPage() {
  const [quantity, setQuantity] = useState("5");

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#171914]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#11130f]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" aria-label="NutriFit — página inicial" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#a8b75b] font-black text-[#a8b75b]">NF</span>
            <span className="text-lg font-extrabold tracking-wide">NUTRIFIT</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="#beneficios" className="hover:text-white">Benefícios</a>
            <a href="#cardapio" className="hover:text-white">Cardápio</a>
            <a href="#combos" className="hover:text-white">Combos</a>
            <a href="/empresas" className="hover:text-white">Para empresas</a>
          </nav>
          <a href="#combos" className="rounded-full bg-[#f58220] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#df6d0d]">
            Escolher combo
          </a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#11130f] text-white">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#11130f] via-[#11130f]/85 to-[#11130f]/30" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#a8b75b]/50 bg-[#a8b75b]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#c6d27e]">
              Sua rotina mais prática
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
              Comer bem pode ser <span className="text-[#f58220]">mais simples.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Marmitas preparadas para facilitar sua rotina, com opções para diferentes objetivos e momentos do dia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#combos" className="inline-flex items-center justify-center rounded-full bg-[#f58220] px-6 py-3.5 font-bold text-white transition hover:bg-[#df6d0d]">
                Escolher meu combo <span aria-hidden="true" className="ml-2">→</span>
              </a>
              <a href="#cardapio" className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                Conhecer as marmitas
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
              <span>✓ Opções variadas</span>
              <span>✓ Combos de marmitas</span>
              <span>✓ Atendimento em Juiz de Fora</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#f58220]/20 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=90"
              alt="Refeição colorida com vegetais frescos"
              className="relative aspect-[4/3] w-full rounded-[1.5rem] object-cover shadow-2xl ring-1 ring-white/15"
            />
            <div className="absolute -bottom-4 left-4 rounded-2xl bg-white px-4 py-3 text-[#171914] shadow-xl sm:left-8">
              <p className="text-xs font-semibold text-[#6b6d62]">MAIS PRATICIDADE</p>
              <p className="text-sm font-extrabold">Sua semana, mais organizada</p>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6 sm:py-16">
        {[
          ["01", "Praticidade no dia a dia", "Tenha refeições à mão e simplifique a organização da sua semana."],
          ["02", "Opções para sua rotina", "Conheça diferentes combinações e escolha as refeições que fazem sentido para você."],
          ["03", "Escolha com facilidade", "Veja as linhas, compare os combos e fale com a equipe quando precisar."],
        ].map(([number, title, description]) => (
          <article key={number} className="rounded-2xl border border-[#e7e3d8] bg-white p-6">
            <span className="text-sm font-black text-[#df7418]">{number}</span>
            <h2 className="mt-3 text-xl font-extrabold">{title}</h2>
            <p className="mt-2 leading-6 text-[#66685f]">{description}</p>
          </article>
        ))}
      </section>

      <section id="cardapio" className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6c7c3b]">Conheça as opções</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Variedade para sua rotina</h2>
              <p className="mt-3 max-w-2xl text-[#66685f]">Uma amostra visual do cardápio. Consulte as opções disponíveis no atendimento da NutriFit.</p>
            </div>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="font-bold text-[#b75a0c] underline underline-offset-4">Consultar cardápio completo ↗</a>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <article key={meal.name} className="overflow-hidden rounded-2xl border border-[#e7e3d8] bg-[#faf9f5]">
                <img src={meal.image} alt={meal.name} loading="lazy" className="aspect-[5/3] w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-extrabold">{meal.name}</h3>
                  <p className="mt-1 text-sm text-[#66685f]">{meal.detail}</p>
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-bold text-[#b75a0c]">Consultar disponibilidade →</a>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-[#77786f]">Imagens ilustrativas nesta versão de demonstração; substituir pelas fotografias oficiais dos pratos NutriFit antes da publicação comercial.</p>
        </div>
      </section>

      <section id="combos" className="bg-[#eae9df] py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6c7c3b]">Mais praticidade, menos decisões</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Monte seu combo de marmitas</h2>
            <p className="mt-4 leading-7 text-[#5f6158]">Escolha a quantidade que combina com sua rotina. A equipe confirma o cardápio, a disponibilidade e as condições do pedido.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["5", "7", "10"].map((n) => (
                <button key={n} type="button" onClick={() => setQuantity(n)} aria-pressed={quantity === n} className={`rounded-full border px-5 py-3 text-sm font-extrabold transition ${quantity === n ? "border-[#f58220] bg-[#f58220] text-white" : "border-[#c8c7bc] bg-white text-[#24261f] hover:border-[#f58220]"}`}>
                  {n} marmitas
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#151711] p-6 text-white shadow-xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c2d078]">Seu próximo passo</p>
            <h3 className="mt-3 text-2xl font-black">{quantity} marmitas para planejar sua semana</h3>
            <p className="mt-3 leading-6 text-white/70">Fale com a NutriFit para consultar as combinações disponíveis e confirmar o valor atualizado para o seu combo.</p>
            <a
              href={`https://wa.me/5532998030038?text=${encodeURIComponent(`Olá! Tenho interesse no combo de ${quantity} marmitas da NutriFit. Pode me enviar as opções e os valores atualizados?`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-[#f58220] px-6 py-4 text-center font-extrabold text-white transition hover:bg-[#df6d0d]"
            >
              Consultar combo pelo WhatsApp ↗
            </a>
            <p className="mt-3 text-xs text-white/50">A conversa será aberta no WhatsApp. O pedido ainda não é concluído nesta página.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#151711] px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c2d078]">NutriFit para empresas</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Sua empresa precisa de refeições para a equipe?</h2>
            <p className="mt-3 leading-6 text-white/70">Conheça a possibilidade de fornecimento de refeições e solicite uma conversa comercial.</p>
          </div>
          <a href="/empresas" className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#f58220] px-6 py-3.5 font-bold text-white transition hover:bg-[#f58220]">Conhecer solução B2B →</a>
        </div>
      </section>

      <footer className="bg-[#0d0f0b] px-4 py-7 text-center text-sm text-white/55">
        <p className="font-bold tracking-wide text-white">NUTRIFIT</p>
        <p className="mt-1">Marmitas e refeições em Juiz de Fora, MG.</p>
        <p className="mt-3">© {new Date().getFullYear()} NutriFit. Consulte disponibilidade e condições de atendimento.</p>
      </footer>
    </main>
  );
}
