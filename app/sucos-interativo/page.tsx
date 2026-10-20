"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Leaf, MessageCircle } from "lucide-react";

const juices = [
  { name: "Energy", badge: "FUNCIONAL", ingredients: "Beterraba • Laranja • Maçã • Limão", image: "/images/page-36.jpg", color: "#ef7d18" },
  { name: "Green", badge: "DETOX", ingredients: "Maçã • Pepino • Gengibre • Hortelã • Limão", image: "/images/page-37.jpg", color: "#a7b86a" },
  { name: "Pink", badge: "FUNCIONAL", ingredients: "Morango • Beterraba • Laranja • Limão", image: "/images/page-38.jpg", color: "#ed5d85" },
  { name: "Sun", badge: "REFRESCANTE", ingredients: "Abacaxi • Maracujá • Laranja • Gengibre", image: "/images/page-39.jpg", color: "#f4b72d" },
  { name: "Purple", badge: "ANTIOXIDANTE", ingredients: "Uva • Frutas vermelhas • Limão", image: "/images/page-40.jpg", color: "#a780d4" },
  { name: "Glow", badge: "FUNCIONAL", ingredients: "Morango • Laranja • Cenoura • Beterraba • Limão", image: "/images/page-41.jpg", color: "#d2e56b" },
  { name: "Laranja", badge: "NATURAL", ingredients: "Laranja fresca", image: "/images/page-42.jpg", color: "#ef7d18" },
  { name: "Laranja com Acerola", badge: "NATURAL", ingredients: "Laranja • Acerola", image: "/images/page-43.jpg", color: "#ef7d18" },
  { name: "Abacaxi", badge: "REFRESCANTE", ingredients: "Abacaxi • Hortelã", image: "/images/page-44.jpg", color: "#d2e56b" },
];

export default function SucosInterativosPage() {
  const [active, setActive] = useState(0);
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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-10">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[.28em] text-[#a7b86a]">Linha de sucos Nutrifit</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Escolha seu sabor. <span className="text-[#ef7d18]">Peça do seu jeito.</span></h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">Toque em um sabor abaixo para ver o produto em destaque. Escolha 300 ml ou 500 ml para pedir.</p>
        </div>

        <div className="grid overflow-hidden rounded-[26px] border border-white/10 bg-[#080a07] shadow-[0_20px_80px_rgba(0,0,0,.35)] lg:grid-cols-[1.45fr_.75fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-black sm:min-h-[510px]">
            <div className="absolute inset-0" style={{background: `radial-gradient(ellipse at center, ${juice.color}35, #050505 74%)`}} />
            <img key={juice.name} src={juice.image} alt={`Suco Nutrifit ${juice.name} com frutas`} className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
            <span className="absolute left-4 top-4 rounded-full border border-[#a7b86a]/60 bg-black/75 px-3 py-2 text-[10px] font-black tracking-wider text-[#d8e7a0] sm:left-6 sm:top-6 sm:text-xs">NUTRIFIT • SUCOS NATURAIS</span>
            <button type="button" aria-label="Sabor anterior" onClick={() => choose(active - 1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ef7d18] bg-black/80 text-[#ef7d18] sm:left-5 sm:h-12 sm:w-12"><ArrowLeft/></button>
            <button type="button" aria-label="Próximo sabor" onClick={() => choose(active + 1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ef7d18] bg-black/80 text-[#ef7d18] sm:right-5 sm:h-12 sm:w-12"><ArrowRight/></button>
            <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
              <p className="text-[10px] font-black uppercase tracking-[.25em] text-[#d8e7a0]">{juice.badge}</p>
              <h2 className="mt-1 text-3xl font-black sm:text-5xl">{juice.name}</h2>
              <p className="mt-2 text-sm text-white/80">{juice.ingredients}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 p-4 sm:p-6 lg:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#a7b86a]">Escolha o tamanho</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {([{size:"300 ml",price:"R$ 9,90"},{size:"500 ml",price:"R$ 12,90"}] as const).map((option) => <button key={option.size} type="button" onClick={() => {setSize(option.size); window.open(`https://wa.me/5532998030038?text=${encodeURIComponent(`Olá, Nutrifit! Quero pedir o suco ${juice.name}, ${option.size}, por ${option.price}.`) }`, "_blank", "noopener,noreferrer");}} className="rounded-xl border border-[#ef7d18]/60 bg-[#ef7d18]/10 px-3 py-4 text-left transition hover:bg-[#ef7d18]/20 active:scale-[.98]">
                  <span className="block text-xs font-bold text-white/70">{option.size}</span>
                  <span className="mt-1 block text-lg font-black text-[#ef7d18] sm:text-xl">{option.price}</span>
                  <span className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/60"><MessageCircle size={12}/> Pedir pelo WhatsApp</span>
                </button>)}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between"><h3 className="font-black">Escolha seu sabor</h3><span className="text-xs text-white/40">{active + 1} / {juices.length}</span></div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {juices.map((item,index) => <button key={item.name} type="button" onClick={() => choose(index)} aria-pressed={active===index} className={`overflow-hidden rounded-xl border text-left transition ${active===index ? "border-[#ef7d18] bg-[#ef7d18]/10" : "border-white/10 bg-black hover:border-white/30"}`}>
                  <img src={item.image} alt="" loading="lazy" className="aspect-square w-full object-cover"/>
                  <span className="block truncate px-2 py-2 text-[10px] font-black sm:text-xs">{item.name}</span>
                </button>)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/40">Selecionado</p>
              <p className="mt-1 text-lg font-black">{juice.name} • {size}</p>
              <p className="mt-1 text-2xl font-black text-[#ef7d18]">{price}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
