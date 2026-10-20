"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Leaf, MessageCircle, ShieldCheck, ShoppingCart } from "lucide-react";

const juices = [
  { name: "Laranja", badge: "SUCO NATURAL", description: "Suco de laranja Nutrifit.", image: "/images/page-42.jpg", color: "#ef7d18" },
  { name: "Green", badge: "DETOX", description: "Conheça o sabor Green da Nutrifit.", image: "/images/page-37.jpg", color: "#a7b86a" },
  { name: "Abacaxi com Hortelã", badge: "SUCO NATURAL", description: "Abacaxi com hortelã.", image: "/images/page-44.jpg", color: "#d2e56b" },
  { name: "Energy", badge: "FUNCIONAL", description: "Conheça o sabor Energy da Nutrifit.", image: "/images/page-36.jpg", color: "#ef7d18" },
  { name: "Purple", badge: "ANTIOXIDANTE", description: "Conheça o sabor Purple da Nutrifit.", image: "/images/page-40.jpg", color: "#a780d4" },
  { name: "Glow", badge: "FUNCIONAL", description: "Conheça o sabor Glow da Nutrifit.", image: "/images/page-41.jpg", color: "#d2e56b" },
  { name: "Pink", badge: "FUNCIONAL", description: "Conheça o sabor Pink da Nutrifit.", image: "/images/page-38.jpg", color: "#ed5d85" },
  { name: "Sun", badge: "REFRESCANTE", description: "Conheça o sabor Sun da Nutrifit.", image: "/images/page-39.jpg", color: "#f4b72d" },
  { name: "Laranja com Acerola", badge: "SUCO NATURAL", description: "Laranja com acerola.", image: "/images/page-43.jpg", color: "#ef7d18" },
];

const sizes = [
  { label: "500 ml", price: "R$ 12,90" },
  { label: "300 ml", price: "R$ 9,90" },
] as const;

export default function SucosInterativosPage() {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<"300 ml" | "500 ml">("500 ml");
  const juice = juices[active];
  const price = size === "500 ml" ? "R$ 12,90" : "R$ 9,90";
  const orderText = encodeURIComponent(`Olá, Nutrifit! Quero pedir ${juice.name}, ${size}, por ${price}.`);
  const whatsapp = `https://wa.me/5532998030038?text=${orderText}`;

  function choose(index: number) {
    setActive((index + juices.length) % juices.length);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050605] text-white">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-7">
          <a href="/" aria-label="Nutrifit início" className="shrink-0 text-2xl font-black tracking-tight sm:text-3xl"><span className="text-[#a7b86a]">NUTRI</span><span className="text-[#ef7d18]">FIT</span></a>
          <nav className="hidden items-center gap-5 text-[10px] font-bold uppercase text-white/75 lg:flex">
            <a href="/#cardapio">Marmitas</a><a href="/#sucos" className="text-[#ef7d18]">Sucos</a><a href="/#lanches">Lanches</a><a href="/#combos">Combos</a><a href="/#empresas">Empresas</a>
          </nav>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-full bg-[#ef7d18] px-4 py-3 text-xs font-black text-white sm:text-sm">Pedir pelo WhatsApp</a>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#050605] shadow-[0_20px_80px_rgba(0,0,0,.35)]">
          <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[minmax(145px,19%)_minmax(0,1fr)_minmax(230px,27%)] xl:min-h-[590px]">
            <aside className="order-2 flex flex-row flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 bg-black/70 p-4 lg:order-1 lg:flex-col lg:items-start lg:justify-center lg:gap-6 lg:border-r lg:border-t-0 lg:px-5 xl:px-7">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-white/85"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#a7b86a]/70 text-[#a7b86a]"><Leaf size={17}/></span><span>Seleção<br/>Nutrifit</span></div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-white/85"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#a7b86a]/70 text-[#a7b86a]"><ShieldCheck size={17}/></span><span>Qualidade<br/>em cada sabor</span></div>
              <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-white/85 lg:flex"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#a7b86a]/70 text-[#a7b86a]"><ShoppingCart size={17}/></span><span>Escolha o volume<br/>e faça seu pedido</span></div>
            </aside>

            <div className="relative order-1 min-h-[470px] overflow-hidden bg-black sm:min-h-[560px] lg:order-2 lg:min-h-0">
              <img key={juice.name} src={juice.image} alt={`Suco Nutrifit ${juice.name} com frutas`} className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
              <div className="absolute left-4 top-4 rounded-full border border-[#a7b86a]/60 bg-black/60 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#d8e7a0] sm:left-6 sm:top-6">Nutrifit • Sucos</div>
              <button type="button" aria-label="Sabor anterior" onClick={() => choose(active - 1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#ef7d18] bg-black/70 text-[#ef7d18] sm:left-5 sm:h-12 sm:w-12"><ArrowLeft size={22}/></button>
              <button type="button" aria-label="Próximo sabor" onClick={() => choose(active + 1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#ef7d18] bg-black/70 text-[#ef7d18] sm:right-5 sm:h-12 sm:w-12"><ArrowRight size={22}/></button>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                <p className="text-[10px] font-black uppercase tracking-[.28em] text-[#d8e7a0]">{juice.badge}</p>
                <h1 className="mt-1 text-4xl font-black leading-none sm:text-6xl xl:text-7xl">{juice.name}</h1>
                <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">{juice.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/30 bg-black/55 px-3 py-2 text-xs font-black">500 ml</span>
                  <span className="rounded-full border border-white/30 bg-black/55 px-3 py-2 text-xs font-black">300 ml</span>
                </div>
              </div>
            </div>

            <aside className="order-3 flex flex-col justify-center border-t border-white/10 bg-[#080a07] p-5 sm:p-7 lg:border-l lg:border-t-0 xl:p-8">
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#a7b86a]">{juice.badge}</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-tight text-[#ef7d18] xl:text-4xl">{juice.name}</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">{juice.description} Escolha o tamanho para adicionar ao pedido.</p>
              <div className="mt-6 space-y-3">
                {sizes.map(option => <button key={option.label} type="button" onClick={() => setSize(option.label)} aria-pressed={size === option.label} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left transition ${size === option.label ? "border-[#ef7d18] bg-[#ef7d18]/15 shadow-[0_0_20px_rgba(239,125,24,.10)]" : "border-white/15 bg-black hover:border-white/35"}`}>
                  <span><span className="block text-sm font-black">{option.label}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-white/45">Selecionar tamanho</span></span>
                  <span className="text-lg font-black text-[#ef7d18]">{option.price}</span>
                </button>)}
              </div>
              <p className="mt-3 text-xs text-white/45">Selecionado: {size} • {price}</p>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-4 py-3 text-center text-sm font-black text-black transition hover:bg-orange-400"><MessageCircle size={17}/> Pedir agora</a>
            </aside>
          </div>

          <div className="border-t border-white/10 bg-[#080a07] p-3 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4"><h3 className="text-base font-black sm:text-lg">Escolha seu sabor</h3><span className="text-xs font-bold text-white/45">{active + 1} / {juices.length}</span></div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {juices.map((item, index) => <button key={item.name} type="button" onClick={() => choose(index)} aria-pressed={active === index} className={`group overflow-hidden rounded-xl border text-left transition ${active === index ? "border-[#ef7d18] bg-[#ef7d18]/10 shadow-[0_0_18px_rgba(239,125,24,.18)]" : "border-white/10 bg-black hover:border-white/30"}`}>
                <img src={item.image} alt={item.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>
                <span className="block truncate px-1.5 py-2 text-center text-[10px] font-black sm:text-xs">{item.name}</span>
              </button>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
