"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Leaf, MessageCircle, ShieldCheck, ShoppingCart } from "lucide-react";


const juices = [
  { name: "Laranja", badge: "SUCO NATURAL", description: "Suco de laranja Nutrifit.", image: "/images/page-42.jpg", color: "#ef7d18" },
  { name: "Green", badge: "REFRESCANTE", description: "Conheça o sabor Green da Nutrifit.", image: "/images/page-37.jpg", color: "#a7b86a" },
  { name: "Abacaxi com Hortelã", badge: "SUCO NATURAL", description: "Abacaxi com hortelã.", image: "/images/page-44.jpg", color: "#d2e56b" },
  { name: "Energy", badge: "FUNCIONAL", description: "Conheça o sabor Energy da Nutrifit.", image: "/images/page-36.jpg", color: "#ef7d18" },
  { name: "Purple", badge: "FRUTADO", description: "Conheça o sabor Purple da Nutrifit.", image: "/images/page-40.jpg", color: "#a780d4" },
  { name: "Glow", badge: "FUNCIONAL", description: "Conheça o sabor Glow da Nutrifit.", image: "/images/page-41.jpg", color: "#d2e56b" },
  { name: "Pink", badge: "FUNCIONAL", description: "Conheça o sabor Pink da Nutrifit.", image: "/images/page-38.jpg", color: "#ed5d85" },
  { name: "Sun", badge: "REFRESCANTE", description: "Conheça o sabor Sun da Nutrifit.", image: "/images/page-39.jpg", color: "#f4b72d" },
  { name: "Laranja com Acerola", badge: "SUCO NATURAL", description: "Laranja com acerola.", image: "/images/page-43.jpg", color: "#ef7d18" },
];

const juiceDetails: Record<string, { recipe: string[]; estimate500: [number, number, number, number, number]; profile: string; ingredientNotes: string }> = {
  "Laranja": { recipe: ["Suco de laranja natural — 500 ml"], estimate500: [185,42.5,3.5,0.5,1.0], profile: "Bebida cítrica feita com suco de laranja natural.", ingredientNotes: "A laranja fornece carboidratos e pode contribuir com vitamina C; o teor depende da fruta e do preparo." },
  "Green": { recipe: ["Maçã com casca, sem sementes — 150 g","Pepino com casca — 100 g","Suco de limão Tahiti — 20 ml","Gengibre fresco — 2 g","Hortelã — 4 g","Água filtrada — aprox. 300 ml; completar até 500 ml"], estimate500: [102,27.1,1.4,0.2,3.3], profile: "Maçã como base, com pepino, limão, hortelã e gengibre em segundo plano.", ingredientNotes: "A maçã fornece carboidratos; pepino e água contribuem para o perfil refrescante; hortelã e gengibre dão aroma." },
  "Abacaxi com Hortelã": { recipe: ["Abacaxi — 250 g","Hortelã — 5 g","Água filtrada — aprox. 245 ml; completar até 500 ml"], estimate500: [125,29.4,1.9,0.3,2.8], profile: "Abacaxi com toque herbal de hortelã.", ingredientNotes: "O abacaxi fornece carboidratos e pode contribuir com vitamina C; a hortelã acrescenta aroma e frescor." },
  "Energy": { recipe: ["Laranja descascada, sem sementes — 220 g","Maçã com casca, sem sementes — 120 g","Beterraba crua — 45 g","Suco de limão Tahiti — 15 ml","Água filtrada — aprox. 260 ml; completar até 500 ml"], estimate500: [173,43.8,3.3,0.3,4.9], profile: "Perfil frutado e cítrico; a beterraba fica moderada para não dominar o sabor.", ingredientNotes: "Laranja e maçã fornecem carboidratos; a beterraba contribui com folato e pigmentos naturais." },
  "Purple": { recipe: ["Uva sem sementes — 160 g","Morango — 90 g","Maçã com casca, sem sementes — 120 g","Suco de limão Tahiti — 15 ml","Água filtrada — aprox. 230 ml; completar até 500 ml"], estimate500: [182,47.2,2.3,0.6,4.6], profile: "Uva e maçã dão corpo e doçura natural; o limão realça o sabor.", ingredientNotes: "Uva, maçã e morango fornecem carboidratos e compostos vegetais próprios das frutas." },
  "Glow": { recipe: ["Laranja descascada, sem sementes — 300 g","Suco de limão Tahiti — 15 ml","Gengibre fresco — 2 g","Cúrcuma fresca — 3 g","Água filtrada — aprox. 230 ml; completar até 500 ml"], estimate500: [118,28.5,2.8,0.4,2.5], profile: "Perfil cítrico e aromático; gengibre e cúrcuma ficam em segundo plano.", ingredientNotes: "A laranja pode contribuir com vitamina C; gengibre e cúrcuma acrescentam aroma e sabor, sem implicar efeito terapêutico." },
  "Pink": { recipe: ["Morango — 120 g","Laranja descascada, sem sementes — 220 g","Beterraba crua — 35 g","Suco de limão Tahiti — 15 ml","Água filtrada — aprox. 250 ml; completar até 500 ml"], estimate500: [137,32.7,3.8,0.6,5.0], profile: "Frutado e cítrico, com a beterraba em quantidade moderada.", ingredientNotes: "Morango e laranja fornecem carboidratos e podem contribuir com vitamina C; beterraba acrescenta cor e nutrientes vegetais." },
  "Sun": { recipe: ["Abacaxi — 170 g","Laranja descascada, sem sementes — 160 g","Polpa de maracujá — 35 g","Gengibre fresco — 2 g","Água filtrada — aprox. 220 ml; completar até 500 ml"], estimate500: [168,38.6,3.3,1.1,3.4], profile: "Abacaxi e laranja sustentam o sabor; maracujá e gengibre acrescentam aroma e acidez.", ingredientNotes: "As frutas fornecem carboidratos; maracujá e gengibre acrescentam aroma e perfil sensorial." },
  "Laranja com Acerola": { recipe: ["Suco de laranja natural — 350 ml","Acerola — 120 g","Água filtrada — aprox. 50 ml; ajustar ao volume final"], estimate500: [169,39.4,3.5,0.6,2.5], profile: "Combinação cítrica de laranja e acerola.", ingredientNotes: "A acerola é conhecida pelo teor de vitamina C; o valor final depende da matéria-prima, processamento e rendimento." }
};

function JuiceDetails({ name }: { name: string }) {
  const data = juiceDetails[name];
  const [activeTab, setActiveTab] = useState<"info" | "ingredients" | "nutrition" | "benefits">("info");
  if (!data) return null;
  const nutrients = [
    ["Energia", "kcal", data.estimate500[0]],
    ["Carboidratos", "g", data.estimate500[1]],
    ["Proteínas", "g", data.estimate500[2]],
    ["Gorduras totais", "g", data.estimate500[3]],
    ["Fibras alimentares", "g", data.estimate500[4]]
  ] as const;
  const fmt = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const tabs = [
    { id: "info" as const, label: "Informações" },
    { id: "ingredients" as const, label: "Ingredientes" },
    { id: "nutrition" as const, label: "Nutricional" },
    { id: "benefits" as const, label: "Benefícios" }
  ];
  return (
    <details className="group mt-3 rounded-xl border border-[#a7b86a]/25 bg-black/65">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-3 text-left transition hover:bg-white/[.04]">
        <span className="min-w-0">
          <span className="block text-xs font-black text-white">Conheça este suco</span>
          <span className="mt-0.5 block text-[10px] text-[#a7b86a]">Ingredientes, nutrição e características</span>
        </span>
        <span className="shrink-0 text-lg font-bold text-[#ef7d18] transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-white/10">
        <div role="tablist" aria-label={"Informações do suco " + name} className="grid grid-cols-2 gap-1 border-b border-white/10 p-1 sm:grid-cols-4">
          {tabs.map(tab => (
            <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}
              className={"rounded-lg px-2 py-2 text-[10px] font-black transition sm:text-[11px] " + (activeTab === tab.id ? "bg-[#ff650b] text-white shadow-[0_0_12px_rgba(255,101,11,.18)]" : "text-white/65 hover:bg-white/[.06] hover:text-white")}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="min-h-[132px] p-3 sm:p-4">
          {activeTab === "info" && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a7b86a]">Sobre este suco</p>
              <p className="mt-1.5 text-xs leading-5 text-white/85">{data.profile}</p>
              <div className="mt-3 rounded-lg border border-white/10 bg-white/[.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#ef7d18]">Perfil de sabor</p>
                <p className="mt-1 text-[11px] leading-4 text-white/75">{data.ingredientNotes}</p>
              </div>
              <p className="mt-2 text-[9px] leading-4 text-white/45">As características podem variar conforme a fruta, o processamento e o preparo.</p>
            </div>
          )}
          {activeTab === "ingredients" && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a7b86a]">Receita-base • 500 ml</p>
              <ul className="mt-2 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
                {data.recipe.map(line => <li key={line} className="bg-white/[.025] px-3 py-2 text-[11px] leading-4 text-white/85">{line}</li>)}
              </ul>
              <p className="mt-2 text-[10px] leading-4 text-white/50">Formulação de referência. O preparo final deve seguir a ficha técnica validada da Nutrifit.</p>
            </div>
          )}
          {activeTab === "nutrition" && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#ef7d18]">Estimativa nutricional preliminar</p>
              <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-white/[.07] px-2.5 py-2 text-[9px] font-black uppercase text-white/75"><span>Nutriente</span><span className="text-right">300 ml</span><span className="text-right">500 ml</span></div>
                {nutrients.map(([label, unit, value], i) => <div key={label} className={"grid grid-cols-[1fr_auto_auto] gap-2 px-2.5 py-2 text-[10px] " + (i % 2 === 0 ? "bg-white/[.04]" : "")}><span className="text-white/85">{label}</span><span className="text-right font-bold text-[#a7b86a]">{fmt(value*0.6)} {unit}</span><span className="text-right font-bold text-[#a7b86a]">{fmt(value)} {unit}</span></div>)}
              </div>
              <p className="mt-2 text-[9px] leading-4 text-white/50">Estimativas baseadas em composição média dos ingredientes, considerando 500 ml, sem açúcar adicionado e polpa mantida quando há fruta inteira. Não são laudo laboratorial nem tabela nutricional legal validada. Açúcares, sódio e micronutrientes ainda precisam ser confirmados.</p>
            </div>
          )}
          {activeTab === "benefits" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-[#a7b86a]/20 bg-[#a7b86a]/[.06] p-3">
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a7b86a]">O que os ingredientes oferecem</p>
                <p className="mt-1.5 text-[11px] leading-5 text-white/80">{data.ingredientNotes}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#ef7d18]">Quando consumir</p>
                <p className="mt-1 text-[11px] leading-5 text-white/75">Pode fazer parte da alimentação ao longo do dia, conforme sua preferência e rotina. O suco não substitui, por si só, uma alimentação variada e equilibrada.</p>
              </div>
              <p className="text-[9px] leading-4 text-white/45">Informações gerais sobre alimentos, não recomendações médicas. Não atribuímos ao suco prevenção, tratamento, cura ou efeito detox.</p>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

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
              <Image key={juice.name} src={juice.image} alt={`Suco Nutrifit ${juice.name} com frutas`} fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover object-center transition-opacity duration-300" />
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
                  <span className="rounded-full border border-[#a7b86a]/60 bg-black/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#d8e7a0]">Ingredientes selecionados</span>
                  <span className="rounded-full border border-white/25 bg-black/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/85">Escolha seu tamanho ao lado</span>
                </div>
              </div>
            </div>

            <aside className="order-3 flex flex-col justify-center border-t border-white/10 bg-[#080a07] p-5 sm:p-7 lg:border-l lg:border-t-0 xl:p-8">
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#a7b86a]">{juice.badge}</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-tight text-[#ef7d18] xl:text-4xl">{juice.name}</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">{juice.description} Escolha o tamanho para adicionar ao pedido.</p>
              <JuiceDetails name={juice.name} />
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
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:gap-3">
              {juices.map((item, index) => <button key={item.name} type="button" onClick={() => choose(index)} aria-pressed={active === index} className={`group w-[31%] shrink-0 snap-start overflow-hidden rounded-xl border text-left transition sm:w-[23.5%] md:w-[18.5%] lg:w-[13.8%] ${active === index ? "border-[#ef7d18] bg-[#ef7d18]/10 shadow-[0_0_18px_rgba(239,125,24,.18)]" : "border-white/10 bg-black hover:border-white/30"}`}>
                <Image src={item.image} alt={item.name} width={400} height={300} sizes="(max-width: 640px) 31vw, (max-width: 1024px) 23vw, 14vw" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"/>
                <span className="block truncate px-1.5 py-2 text-center text-[10px] font-black sm:text-xs">{item.name === "Abacaxi com Hortelã" ? "Abacaxi" : item.name}</span>
              </button>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
