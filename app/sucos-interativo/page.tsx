"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
const JuiceBottle3D = dynamic(() => import("./JuiceBottle3D"), { ssr: false, loading: () => <div className="h-[390px] w-full animate-pulse rounded-full bg-white/[.03] sm:h-[500px]" /> });
import { ArrowLeft, ArrowRight, Leaf, MessageCircle, RotateCcw, MousePointer2 } from "lucide-react";

const juices = [
  { name: "Energy", badge: "FUNCIONAL", ingredients: "Beterraba • Laranja • Maçã • Limão", image: "/images/page-36.jpg", color: "#ef7d18" },
  { name: "Green", badge: "DETOX", ingredients: "Maçã • Pepino • Gengibre • Hortelã • Limão", image: "/images/page-37.jpg", color: "#a7b86a" },
  { name: "Pink", badge: "FUNCIONAL", ingredients: "Morango • Beterraba • Laranja • Limão", image: "/images/page-38.jpg", color: "#ed5d85" },
  { name: "Sun", badge: "REFRESCANTE", ingredients: "Abacaxi • Maracujá • Laranja • Gengibre", image: "/images/page-39.jpg", color: "#f4b72d" },
  { name: "Purple", badge: "ANTIOXIDANTE", ingredients: "Uva • Frutas vermelhas • Limão", image: "/images/page-40.jpg", color: "#a780d4" },
  { name: "Glow", badge: "FUNCIONAL", ingredients: "Morango • Laranja • Cenoura • Beterraba • Limão", image: "/images/page-41.jpg", color: "#d2e56b" },
];

export default function SucosInterativosPage() {
  const [active, setActive] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [size, setSize] = useState<"300 ml" | "500 ml">("500 ml");
  const juice = juices[active];
  const price = size === "500 ml" ? "R$ 12,90" : "R$ 9,90";
  const orderText = encodeURIComponent(`Olá, Nutrifit! Quero pedir o suco ${juice.name}, ${size}, por ${price}.`);
  const whatsapp = `https://wa.me/5532998030038?text=${orderText}`;

  function choose(index: number) {
    setActive((index + juices.length) % juices.length);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080a07] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <a href="/" aria-label="Nutrifit início" className="text-2xl font-black tracking-tight sm:text-3xl"><span className="text-[#a7b86a]">NUTRI</span><span className="text-[#ef7d18]">FIT</span></a>
          <span className="hidden text-xs font-bold uppercase tracking-[.2em] text-white/50 sm:block">Experiência interativa • Sucos</span>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-full bg-[#ef7d18] px-4 py-3 text-sm font-black text-white transition hover:bg-orange-500">Pedir pelo WhatsApp</a>
        </div>
      </header>

      <section className="relative isolate mx-auto grid min-h-[640px] max-w-7xl items-center gap-4 px-4 py-10 sm:px-7 md:min-h-[690px] md:grid-cols-[.85fr_1.15fr] md:py-14">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_45%,rgba(239,125,24,.18),transparent_42%),radial-gradient(ellipse_at_20%_70%,rgba(167,184,106,.12),transparent_38%)]" />
        <div className="relative z-10 order-2 md:order-1">
          <p className="text-xs font-black uppercase tracking-[.3em] text-[#a7b86a]">Sucos naturais Nutrifit</p>
          <h1 className="mt-4 text-5xl font-black leading-[.94] tracking-[-.055em] sm:text-6xl lg:text-7xl">Mais sabor.<br/><span style={{ color: juice.color }}>Mais movimento.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/65 sm:text-lg">Explore os sabores da nossa linha de sucos. Escolha o seu, alterne o tamanho e peça diretamente pelo WhatsApp.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="flex items-center gap-2 rounded-full border border-[#a7b86a]/35 bg-white/[.03] px-4 py-2 text-sm text-white/80"><Leaf size={17} className="text-[#a7b86a]"/> Linha de sucos</span>
            <span className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-sm text-white/70">300 ml e 500 ml</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 font-black shadow-[0_10px_40px_rgba(239,125,24,.2)] transition hover:scale-[1.02]"><MessageCircle size={20}/> Pedir {juice.name} <ArrowRight size={19}/></a>
            <button onClick={() => setResetKey((value) => value + 1)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 px-5 font-bold text-white/75 hover:border-white/40"><RotateCcw size={17}/> Recentrar</button>
          </div>
          <p className="mt-4 text-xs text-white/35">A garrafa é um objeto 3D real: arraste para girar e explore o rótulo em diferentes ângulos.</p>
        </div>

        <div className="order-1 flex min-w-0 flex-col items-center md:order-2">
          <div className="relative flex w-full max-w-[620px] items-center justify-center">
            <div className="absolute h-[72%] w-[72%] rounded-full blur-3xl transition-colors duration-500" style={{ background: juice.color, opacity: .18 }} />
            <div className="relative z-10 w-full">
              <JuiceBottle3D key={`${juice.name}-${resetKey}`} flavor={juice.name} color={juice.color} label={juice.badge} />
            </div>
            <button aria-label="Sabor anterior" onClick={() => choose(active - 1)} className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 backdrop-blur transition hover:border-[#ef7d18] sm:h-14 sm:w-14"><ArrowLeft/></button>
            <button aria-label="Próximo sabor" onClick={() => choose(active + 1)} className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/65 backdrop-blur transition hover:border-[#ef7d18] sm:h-14 sm:w-14"><ArrowRight/></button>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-white/35"><MousePointer2 size={14}/> Arraste a garrafa 3D para girar</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.25em] text-[#a7b86a]">Linha funcional</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Escolha seu sabor</h2></div>
          <div className="flex rounded-full border border-white/10 bg-white/[.03] p-1">
            {(["300 ml", "500 ml"] as const).map((option) => <button key={option} onClick={() => setSize(option)} className={`rounded-full px-4 py-2.5 text-sm font-black transition ${size === option ? "bg-[#a7b86a] text-black" : "text-white/60 hover:text-white"}`}>{option}<span className="ml-2">{option === "300 ml" ? "R$ 9,90" : "R$ 12,90"}</span></button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {juices.map((item, index) => <button key={item.name} onClick={() => choose(index)} className={`group overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 ${active === index ? "border-[#ef7d18] bg-[#ef7d18]/[.08] shadow-[0_0_25px_rgba(239,125,24,.1)]" : "border-white/10 bg-white/[.025] hover:border-white/30"}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-black"><img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></div>
            <div className="p-3 sm:p-4"><span className="text-[9px] font-black uppercase tracking-wider" style={{ color: item.color }}>{item.badge}</span><div className="mt-1 text-lg font-black">{item.name}</div><div className="mt-2 text-sm font-black text-[#ef7d18]">{price}</div><div className="mt-1 text-[10px] text-white/40">{size}</div></div>
          </button>)}
        </div>
        <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:flex-row sm:px-7">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/40">Selecionado</p><p className="mt-1 text-2xl font-black">{juice.name} <span className="text-base font-semibold text-white/45">• {size}</span></p><p className="mt-1 text-sm text-white/55">{juice.ingredients}</p></div>
          <div className="flex w-full items-center justify-between gap-5 sm:w-auto"><span className="text-2xl font-black text-[#ef7d18]">{price}</span><a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-full bg-[#ef7d18] px-5 py-3.5 text-sm font-black hover:bg-orange-500">Pedir agora</a></div>
        </div>
        <p className="mt-5 text-center text-[11px] leading-5 text-white/30">Modelo 3D demonstrativo gerado por geometria. A garrafa e o rótulo são ilustrativos; para representar a embalagem exata da Nutrifit, substituiremos este modelo pelo arquivo 3D ou medidas reais do produto.</p>
      </section>
    </main>
  );
}
