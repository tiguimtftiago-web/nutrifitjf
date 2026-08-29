import { ArrowRight, Check, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";

const whatsapp = "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const products = [
  { name: "Patinho com Abóbora", category: "Linha Fit 350g", price: "R$ 21,90", description: "Patinho moído bem temperado com purê de abóbora." },
  { name: "Patinho com Batata-Doce", category: "Linha Fit 350g", price: "R$ 21,90", description: "Uma combinação prática para sua rotina alimentar." },
  { name: "Frango Grelhado", category: "Linha Performance 450g", price: "R$ 27,90", description: "Frango grelhado com acompanhamentos equilibrados e saborosos." },
  { name: "Performance Bovina", category: "Linha Performance 450g", price: "R$ 29,90", description: "Proteína bovina e acompanhamentos pensados para performance." },
];

const combos = [
  ["5 marmitas", "R$ 109,90"],
  ["7 marmitas", "R$ 149,90"],
  ["10 marmitas", "R$ 209,90"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0d0a] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d0a]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#inicio" className="text-2xl font-black tracking-tight">nutri<span className="text-[#a7b86a]">fit</span></a>
          <nav className="hidden gap-7 text-sm font-medium text-white/80 md:flex">
            <a href="#cardapio" className="transition hover:text-white">Cardápio</a>
            <a href="#combos" className="transition hover:text-white">Combos</a>
            <a href="#como-pedir" className="transition hover:text-white">Como pedir</a>
          </nav>
          <a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-4 py-2 text-sm font-bold text-black transition hover:scale-[1.02]"><MessageCircle size={17} /> Pedir agora</a>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(167,184,106,0.22),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(239,125,24,0.12),transparent_25%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.05fr_.95fr] md:px-8 md:py-28">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#c9d88c]"><Sparkles size={14} /> Juiz de Fora</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">Sua rotina saudável, <span className="text-[#a7b86a]">mais prática.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70 md:text-xl">Marmitas pensadas para facilitar seus dias, com sabor de verdade e opções para diferentes objetivos.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#cardapio" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3 font-bold text-black transition hover:scale-[1.02]">Ver cardápio <ArrowRight size={18} /></a>
              <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold transition hover:bg-white/10">Pedir pelo WhatsApp <MessageCircle size={18} /></a>
            </div>
            <div className="mt-9 flex flex-wrap gap-5 text-sm text-white/60">
              <span className="inline-flex items-center gap-2"><Check size={16} className="text-[#a7b86a]" /> Feitas para a rotina</span>
              <span className="inline-flex items-center gap-2"><Check size={16} className="text-[#a7b86a]" /> Opções variadas</span>
              <span className="inline-flex items-center gap-2"><Check size={16} className="text-[#a7b86a]" /> Pedido simples</span>
            </div>
          </div>

          <div className="relative z-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#161b13] to-[#10120f] p-6 shadow-2xl shadow-black/30">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/40 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a7b86a]">Destaque</div>
              <div className="mt-2 text-3xl font-black">Combos Nutrifit</div>
              <p className="mt-2 max-w-sm text-white/60">Mais praticidade para organizar sua semana e economizar no pedido.</p>
              <div className="mt-6 space-y-3">
                {combos.map(([label, price]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"><span className="font-semibold">{label}</span><span className="font-black text-[#ef7d18]">{price}</span></div>)}
              </div>
              <a href="#combos" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef7d18] px-5 py-3 font-bold text-black">Quero meu combo <ShoppingBag size={18} /></a>
            </div>
          </div>
        </div>
      </section>

      <section id="cardapio" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="text-sm font-bold uppercase tracking-[0.2em] text-[#ef7d18]">Cardápio</div><h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Escolha sua Nutrifit</h2></div><a href={whatsapp} className="text-sm font-bold text-[#c9d88c] hover:text-white">Tirar dúvida no WhatsApp →</a></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {products.map((product) => <article key={product.name} className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]"><div className="aspect-[16/10] rounded-2xl bg-[linear-gradient(135deg,#26301d,#151914)] p-4"><div className="flex h-full items-end justify-between rounded-xl border border-white/5 bg-black/20 p-4"><span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white/70">Foto do prato</span><span className="rounded-full bg-[#a7b86a] px-3 py-1 text-xs font-black text-black">{product.category}</span></div></div><div className="mt-5 flex items-start justify-between gap-4"><div><h3 className="text-xl font-black">{product.name}</h3><p className="mt-2 text-sm leading-6 text-white/60">{product.description}</p></div><div className="whitespace-nowrap text-lg font-black text-[#ef7d18]">{product.price}</div></div></article>)}
        </div>
      </section>

      <section id="combos" className="border-y border-white/10 bg-[#10130d]"><div className="mx-auto max-w-6xl px-5 py-20 md:px-8"><div className="max-w-2xl"><div className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7b86a]">Combos</div><h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Organize sua semana</h2><p className="mt-4 leading-7 text-white/60">Escolha a quantidade de marmitas e concentre seu pedido em uma única compra.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{combos.map(([label, price]) => <a key={label} href={whatsapp} className="rounded-3xl border border-white/10 bg-black/20 p-6 transition hover:-translate-y-1 hover:border-[#a7b86a]/40"><div className="text-sm font-semibold text-white/60">Plano</div><div className="mt-2 text-2xl font-black">{label}</div><div className="mt-5 text-3xl font-black text-[#ef7d18]">{price}</div><div className="mt-6 text-sm font-bold text-[#c9d88c]">Pedir agora →</div></a>)}</div></div></section>

      <section id="como-pedir" className="mx-auto max-w-6xl px-5 py-20 md:px-8"><div className="grid gap-8 md:grid-cols-3">{["Escolha", "Monte o pedido", "Receba e aproveite"].map((step, index) => <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><div className="text-sm font-black text-[#ef7d18]">0{index + 1}</div><h3 className="mt-3 text-2xl font-black">{step}</h3><p className="mt-3 leading-7 text-white/60">{index === 0 && "Escolha suas marmitas, linha e quantidade."}{index === 1 && "Clique no WhatsApp e envie seu pedido de forma rápida."}{index === 2 && "Combine os detalhes do pedido diretamente com a Nutrifit."}</p></div>)}</div></section>

      <section className="px-5 pb-20 md:px-8"><div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#a7b86a]/20 bg-gradient-to-r from-[#1a2114] to-[#12150f] p-8 md:p-12"><div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><div className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7b86a]">Pronto?</div><h2 className="mt-2 text-4xl font-black tracking-tight">Seu próximo pedido começa aqui.</h2></div><a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-7 py-4 font-black text-black transition hover:scale-[1.02]"><MessageCircle size={20} /> Pedir pelo WhatsApp</a></div></div></section>

      <footer className="border-t border-white/10"><div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8"><div><div className="text-xl font-black">nutri<span className="text-[#a7b86a]">fit</span></div><div className="mt-1 text-sm text-white/50">Juiz de Fora • Marmitas e alimentação prática</div></div><div className="flex flex-wrap items-center gap-4 text-sm text-white/60"><a href="https://instagram.com/nutrifit_jf" className="inline-flex items-center gap-2 hover:text-white">Instagram: @nutrifit_jf</a><span>WhatsApp: (32) 99803-0038</span></div></div></footer>
    </main>
  );
}
