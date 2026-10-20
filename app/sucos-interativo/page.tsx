"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Leaf, MessageCircle } from "lucide-react";

const juices = [
  { name: "Laranja", badge: "NATURAL", ingredients: "Suco natural Nutrifit", image: "/images/page-42.jpg", color: "#ef7d18" },
  { name: "Green", badge: "DETOX", ingredients: "Suco funcional Nutrifit", image: "/images/page-37.jpg", color: "#a7b86a" },
  { name: "Abacaxi com Hortelã", badge: "NATURAL", ingredients: "Suco natural Nutrifit", image: "/images/page-44.jpg", color: "#d2e56b" },
  { name: "Energy", badge: "FUNCIONAL", ingredients: "Suco funcional Nutrifit", image: "/images/page-36.jpg", color: "#ef7d18" },
  { name: "Purple", badge: "ANTIOXIDANTE", ingredients: "Suco funcional Nutrifit", image: "/images/page-40.jpg", color: "#a780d4" },
  { name: "Glow", badge: "FUNCIONAL", ingredients: "Suco funcional Nutrifit", image: "/images/page-41.jpg", color: "#d2e56b" },
  { name: "Pink", badge: "FUNCIONAL", ingredients: "Suco funcional Nutrifit", image: "/images/page-38.jpg", color: "#ed5d85" },
  { name: "Sun", badge: "REFRESCANTE", ingredients: "Suco funcional Nutrifit", image: "/images/page-39.jpg", color: "#f4b72d" },
  { name: "Laranja com Acerola", badge: "NATURAL", ingredients: "Suco natural Nutrifit", image: "/images/page-43.jpg", color: "#ef7d18" },
];

export default function SucosInterativosPage() {
  const [active, setActive] = useState(0);
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

      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050605]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="relative min-h-[400px] overflow-hidden bg-black sm:min-h-[540px]">
              <img key={juice.name} src={juice.image} alt={`Nutrifit ${juice.name}: garrafa e frutas do sabor`} className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300"/>
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/65"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5"/>
              <span className="absolute left-4 top-4 rounded-full border border-[#a7b86a]/60 bg-black/75 px-3 py-2 text-[10px] font-black tracking-wider text-[#d8e7a0] sm:left-6 sm:top-6">NUTRIFIT • SUCOS NATURAIS</span>
              <button type="button" aria-label="Sabor anterior" onClick={() => choose(active-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ef7d18] bg-black/75 text-[#ef7d18] sm:left-5"><ArrowLeft/></button>
              <button type="button" aria-label="Próximo sabor" onClick={() => choose(active+1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#ef7d18] bg-black/75 text-[#ef7d18] sm:right-5"><ArrowRight/></button>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                <p className="text-[10px] font-black uppercase tracking-[.25em] text-[#d8e7a0]">{juice.badge}</p>
                <h1 className="mt-1 text-4xl font-black sm:text-6xl">{juice.name}</h1>
                <p className="mt-2 text-sm text-white/85 sm:text-base">{juice.ingredients}</p>
              </div>
            </div>
            <aside className="flex flex-col justify-center border-t border-white/10 bg-[#080a07] p-5 sm:p-6 lg:border-l lg:border-t-0">
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#a7b86a]">Suco natural</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-none text-[#ef7d18]">{juice.name}</h2>
              <p className="mt-3 text-sm leading-5 text-white/65">{juice.ingredients}. Escolha o volume e faça seu pedido.</p>
              <div className="mt-5 space-y-3 text-xs text-white/75">
                <div className="flex items-center gap-2"><Leaf size={16} className="text-[#a7b86a]"/> Ingredientes selecionados</div>
                <div className="flex items-center gap-2"><Leaf size={16} className="text-[#a7b86a]"/> Prático para o seu dia</div>
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[.16em] text-white/60">Escolha o tamanho</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([{size:"500 ml",price:"R$ 12,90"},{size:"300 ml",price:"R$ 9,90"}] as const).map(option => <button key={option.size} type="button" onClick={() => setSize(option.size)} aria-pressed={size===option.size} className={`rounded-xl border px-2 py-3 text-center transition ${size===option.size ? "border-[#ef7d18] bg-[#ef7d18]/15" : "border-white/15 bg-black"}`}>
                  <span className="block text-[10px] font-bold text-white/65">{option.size}</span><span className="mt-1 block text-sm font-black text-white">{option.price}</span>
                </button>)}
              </div>
              <p className="mt-4 text-xs text-white/55">Selecionado: {size}</p>
              <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => {}} className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-3 py-3 text-center text-xs font-black text-black transition hover:bg-orange-400"><MessageCircle size={15}/> Pedir agora pelo WhatsApp</a>
            </aside>
          </div>
          <div className="border-t border-white/10 bg-[#080a07] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-black">Escolha seu sabor</h3><span className="text-xs text-white/45">{active+1} / {juices.length}</span></div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
              {juices.map((item,index) => <button key={item.name} type="button" onClick={() => choose(index)} aria-pressed={active===index} className={`overflow-hidden rounded-xl border text-left transition ${active===index ? "border-[#ef7d18] bg-[#ef7d18]/10 shadow-[0_0_18px_rgba(239,125,24,.16)]" : "border-white/10 bg-black hover:border-white/30"}`}>
                <img src={item.image} alt={item.name} loading="lazy" className="aspect-[4/3] w-full object-cover"/>
                <span className="block truncate px-1.5 py-2 text-center text-[10px] font-black sm:text-xs">{item.name}</span>
              </button>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
