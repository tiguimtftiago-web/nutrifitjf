"use client";

import { useState } from "react";

const whatsapp = (message: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(message)}`;

const meals = [
  {
    name: "Frango Grelhado com Mix de Legumes",
    detail: "Linha Fit · 350 g",
    image: "/images/page-6.jpg",
  },
  {
    name: "Carne Acebolada com Legumes",
    detail: "Linha Fit · 350 g",
    image: "/images/page-5.jpg",
  },
  {
    name: "Tilápia Fit com Arroz e Legumes",
    detail: "Linha Fit · 350 g",
    image: "/images/tilapia-fit-350-web.jpg",
  },
];

const lines = [
  {
    name: "Fit",
    weight: "350 g",
    description: "Opções práticas para o dia a dia.",
    image: "/images/page-6.jpg",
  },
  {
    name: "Performance",
    weight: "450 g",
    description: "Refeições para uma rotina ativa.",
    image: "/images/page-14.jpg",
  },
  {
    name: "Traditional",
    weight: "500 g",
    description: "Pratos completos com sabor caseiro.",
    image: "/images/page-31.jpg",
  },
];

export default function MarmitasLandingPage() {
  const [quantity, setQuantity] = useState("5");

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#171914]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#11130f]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" aria-label="NutriFit — página inicial" className="flex items-center gap-2">
            <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-10 w-10 object-contain" />
            <span className="text-lg font-extrabold tracking-wide">NUTRIFIT</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="#linhas" className="hover:text-white">Linhas</a>
            <a href="#cardapio" className="hover:text-white">Pratos</a>
            <a href="#combos" className="hover:text-white">Combos</a>
          </nav>
          <a href="/#combos" className="rounded-full bg-[#f58220] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#df6d0d]">
            Ver combos
          </a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#11130f] text-white">
        <div className="absolute inset-0 -z-10">
          <img src="/images/banner-site-1.jpg" alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#11130f] via-[#11130f]/85 to-[#11130f]/35" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#a7b86a]/50 bg-[#a7b86a]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#c6d27e]">
              NutriFit · Juiz de Fora
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
              Sua rotina mais prática. <span className="text-[#f58220]">Seu prato do seu jeito.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Explore nossas marmitas, conheça as linhas e escolha um combo para facilitar a organização das suas refeições.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/#combos" className="inline-flex items-center justify-center rounded-full bg-[#f58220] px-6 py-3.5 font-bold text-white transition hover:bg-[#df6d0d]">
                Escolher meu combo <span aria-hidden="true" className="ml-2">→</span>
              </a>
              <a href="#cardapio" className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                Conhecer os pratos
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
              <span>✓ Diferentes linhas e porções</span>
              <span>✓ Combos disponíveis no site</span>
              <span>✓ Atendimento em Juiz de Fora</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#f58220]/20 blur-2xl" />
            <img
              src="/images/page-6.jpg"
              alt="Prato da linha Fit NutriFit"
              className="relative aspect-[4/3] w-full rounded-[1.5rem] object-cover shadow-2xl ring-1 ring-white/15"
            />
            <div className="absolute -bottom-4 left-4 rounded-2xl bg-white px-4 py-3 text-[#171914] shadow-xl sm:left-8">
              <p className="text-xs font-semibold text-[#6b6d62]">ESCOLHA COM FACILIDADE</p>
              <p className="text-sm font-extrabold">Conheça o cardápio NutriFit</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6 sm:py-16">
        {[
          ["01", "Praticidade", "Organize suas refeições com opções prontas para sua rotina."],
          ["02", "Variedade", "Explore diferentes pratos, proteínas e acompanhamentos."],
          ["03", "Escolha simples", "Consulte as linhas e siga para o catálogo e os combos do site."],
        ].map(([number, title, description]) => (
          <article key={number} className="rounded-2xl border border-[#e7e3d8] bg-white p-6">
            <span className="text-sm font-black text-[#df7418]">{number}</span>
            <h2 className="mt-3 text-xl font-extrabold">{title}</h2>
            <p className="mt-2 leading-6 text-[#66685f]">{description}</p>
          </article>
        ))}
      </section>

      <section id="linhas" className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6c7c3b]">Conheça nossas linhas</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Uma opção para cada rotina</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {lines.map((line) => (
              <article key={line.name} className="overflow-hidden rounded-2xl border border-[#e7e3d8] bg-[#faf9f5]">
                <img src={line.image} alt={`Exemplo de prato da linha ${line.name}`} loading="lazy" className="aspect-[5/3] w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-extrabold">{line.name}</h3>
                    <span className="rounded-full bg-[#e9eddb] px-3 py-1 text-xs font-bold text-[#46552a]">{line.weight}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#66685f]">{line.description}</p>
                  <a href="/#cardapio" className="mt-4 inline-flex font-bold text-[#b75a0c]">Ver opções no catálogo →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cardapio" className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6c7c3b]">Alguns pratos do cardápio</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Comida que combina com sua rotina</h2>
              <p className="mt-3 max-w-2xl text-[#66685f]">Veja alguns exemplos e consulte o catálogo do site para conferir todas as opções e os preços atualizados.</p>
            </div>
            <a href="/#cardapio" className="font-bold text-[#b75a0c] underline underline-offset-4">Abrir catálogo completo ↗</a>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <article key={meal.name} className="overflow-hidden rounded-2xl border border-[#e7e3d8] bg-white">
                <img src={meal.image} alt={meal.name} loading="lazy" className="aspect-[5/3] w-full object-cover" />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6c7c3b]">{meal.detail}</p>
                  <h3 className="mt-2 text-lg font-extrabold">{meal.name}</h3>
                  <a href="/#cardapio" className="mt-4 inline-flex font-bold text-[#b75a0c]">Ver no catálogo →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="combos" className="bg-[#eae9df] py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6c7c3b]">Mais praticidade</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Monte seu combo de marmitas</h2>
            <p className="mt-4 leading-7 text-[#5f6158]">Escolha uma quantidade para seguir ao site principal, onde você pode consultar as opções disponíveis, conferir os preços atuais e montar seu pedido.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["5", "7", "10", "14", "20"].map((n) => (
                <button key={n} type="button" onClick={() => setQuantity(n)} aria-pressed={quantity === n} className={`rounded-full border px-5 py-3 text-sm font-extrabold transition ${quantity === n ? "border-[#f58220] bg-[#f58220] text-white" : "border-[#c8c7bc] bg-white text-[#24261f] hover:border-[#f58220]"}`}>
                  {n} marmitas
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#151711] p-6 text-white shadow-xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c2d078]">Próximo passo</p>
            <h3 className="mt-3 text-2xl font-black">Consultar combo de {quantity} marmitas</h3>
            <p className="mt-3 leading-6 text-white/70">Os valores dependem da linha escolhida. Consulte o catálogo atual antes de confirmar seu pedido.</p>
            <a href={`/#combos`} className="mt-6 flex w-full items-center justify-center rounded-full bg-[#f58220] px-6 py-4 text-center font-extrabold text-white transition hover:bg-[#df6d0d]">
              Continuar para montagem do combo ↗
            </a>
            <a href={whatsapp(`Olá! Tenho interesse em um combo de ${quantity} marmitas da NutriFit. Pode me orientar sobre as opções e valores atualizados?`)} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-center font-bold text-white transition hover:bg-white/10">
              Tirar dúvida pelo WhatsApp
            </a>
            <p className="mt-3 text-xs text-white/50">Esta página encaminha para o catálogo existente; o pedido é confirmado no fluxo atual.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#151711] px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c2d078]">NutriFit para empresas</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Sua empresa precisa de refeições para a equipe?</h2>
            <p className="mt-3 leading-6 text-white/70">Converse com nossa equipe sobre fornecimento de refeições e condições para empresas.</p>
          </div>
          <a href={whatsapp("Olá! Represento uma empresa e gostaria de conversar sobre fornecimento de refeições pela NutriFit.")} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#f58220] px-6 py-3.5 font-bold text-white transition hover:bg-[#f58220]">Falar sobre atendimento B2B ↗</a>
        </div>
      </section>

      <footer className="bg-[#0d0f0b] px-4 py-7 text-center text-sm text-white/55">
        <a href="/" className="font-bold tracking-wide text-white">NUTRIFIT</a>
        <p className="mt-1">Marmitas e refeições em Juiz de Fora, MG.</p>
        <p className="mt-3">© {new Date().getFullYear()} NutriFit. Consulte disponibilidade e condições de atendimento.</p>
      </footer>
    </main>
  );
}
