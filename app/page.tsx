import { ArrowRight, Check, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";

const whatsapp = "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const products = [
  ["Patinho com Purê de Abóbora","Linha Fit • 350 g","R$ 21,90","Patinho moído bem temperado com purê cremoso de abóbora.","/images/hero.jpg"],
  ["Patinho com Batata-Doce","Linha Fit • 350 g","R$ 21,90","Patinho moído temperado com batata-doce cremosa."],
  ["Frango Grelhado com Mix de Legumes","Linha Fit • 350 g","R$ 21,90","Peito de frango grelhado com mix de legumes selecionados."],
  ["Carne Acebolada com Legumes","Linha Fit • 350 g","R$ 21,90","Carne bovina acebolada acompanhada de legumes variados."],
  ["Lombo Suíno com Legumes Assados","Linha Fit • 350 g","R$ 21,90","Lombo suíno temperado com legumes assados."],
  ["Frango em Cubos ao Molho de Ervas","Linha Fit • 350 g","R$ 21,90","Frango em cubos ao molho de ervas com legumes."],
  ["Patinho com Legumes ao Toque Amanteigado","Linha Fit • 350 g","R$ 21,90","Patinho moído acompanhado de legumes ao toque amanteigado."],
  ["Strogonoff Leve de Frango","Linha Tradicional • 500 g","R$ 26,90","Frango em molho cremoso de strogonoff, arroz e batata palha."],
  ["Frango Cremoso Fit","Linha Tradicional • 500 g","R$ 27,90","Frango ao molho cremoso leve, arroz e legumes."],
  ["Churrasco Fit Mineiro","Linha Tradicional • 500 g","R$ 29,90","Contra-filé grelhado com arroz, vinagrete e farofa caseira."],
  ["Parmegiana Cremosa","Linha Tradicional • 500 g","R$ 29,90","Filé de frango empanado, molho de tomate, queijo e acompanhamento."],
  ["Executive Fit — Lombo Suíno","Linha Tradicional • 500 g","R$ 28,90","Lombo suíno grelhado com macarrão alho e óleo e legumes."],
  ["Feijoada Fit","Linha Tradicional • 500 g","R$ 28,90","Feijoada leve com lombo e calabresa, arroz, couve e farofa."],
  ["Escondidinho Fit","Linha Tradicional • 500 g","R$ 27,90","Purê cremoso com carne temperada e finalização gratinada."],
  ["Beef & Sweet Potato","Linha Performance • 450 g","R$ 29,90","Carne bovina, batata-doce, ovo e brócolis."],
  ["Chicken Rice Performance","Linha Performance • 450 g","R$ 27,90","Frango grelhado, arroz integral, ovo e legumes."],
  ["Patinho Strong","Linha Performance • 450 g","R$ 29,90","Patinho, batata-doce, ovos cozidos e brócolis."],
  ["Chicken Power","Linha Performance • 450 g","R$ 27,90","Frango grelhado em cubos, arroz, ovo e legumes."],
  ["Chicken Sweet Potato","Linha Performance • 450 g","R$ 27,90","Frango grelhado, batata-doce, brócolis e cenoura."],
  ["Salmão Grelhado","Linha Premium • 500 g","R$ 39,90","Salmão grelhado acompanhado de arroz e legumes selecionados."],
  ["Black Angus + Purê Trufado","Linha Premium • 500 g","R$ 39,90","Black Angus grelhado com purê trufado."],
  ["Salada Summer","Saladas • 350 g","R$ 19,90","Alface, tomate-cereja, pepino, repolho roxo, cenoura, molho verde e frango em cubos."],
  ["Crocante Fit","Saladas • 350 g","R$ 18,90","Frango, alface, cenoura, repolho roxo, pepino, milho e molho especial."],
  ["Tropical Fit","Saladas • 350 g","R$ 19,90","Frango, alface, cenoura, abacaxi, tomate-cereja e molho agridoce leve."],
  ["Caesar Fit","Saladas • 350 g","R$ 21,90","Frango, alface, tomate-cereja, cenoura, parmesão e molho Caesar leve."],
  ["Power Salad","Saladas • 350 g","R$ 21,90","Frango, ovo, alface, cenoura, pepino, tomate, milho e molho verde."],
];

const juices = ["Green","Glow","Sun","Energy","Pink","Purple"];
const combos350 = [["5 marmitas","R$ 106,90"],["7 marmitas","R$ 149,90"],["10 marmitas","R$ 214,90"],["14 marmitas","R$ 299,90"],["20 marmitas","R$ 419,90"]];
const combos450 = [["5 marmitas","R$ 139,90"],["7 marmitas","R$ 194,90"],["10 marmitas","R$ 274,90"],["14 marmitas","R$ 384,90"],["20 marmitas","R$ 539,90"]];
const combos500 = [["5 marmitas","R$ 139,90"],["7 marmitas","R$ 194,90"],["10 marmitas","R$ 269,90"],["14 marmitas","R$ 379,90"],["20 marmitas","R$ 529,90"]];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090b08] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b08]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#inicio" className="text-2xl font-black">nutri<span className="text-[#ef7d18]">fit</span></a>
          <nav className="hidden gap-7 text-sm text-white/75 md:flex">
            <a href="#cardapio" className="hover:text-white">Cardápio</a><a href="#combos" className="hover:text-white">Combos</a><a href="#sucos" className="hover:text-white">Sucos</a><a href="#como-pedir" className="hover:text-white">Como pedir</a>
          </nav>
          <a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-4 py-2 text-sm font-bold text-black"><MessageCircle size={17}/>Pedir agora</a>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(167,184,106,.16),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(239,125,24,.1),transparent_28%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[1fr_1fr] md:px-8 md:py-20">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.2em] text-[#c9d88c]"><Sparkles size={14}/>Juiz de Fora</div>
            <h1 className="max-w-2xl text-5xl font-black leading-[.98] md:text-7xl">Comida de verdade.<br/><span className="text-[#a7b86a]">Prática e saborosa.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65 md:text-xl">Marmitas, performance, premium, saladas e sucos para deixar sua rotina mais simples.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#cardapio" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3 font-bold text-black">Ver cardápio <ArrowRight size={18}/></a><a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold">Pedir pelo WhatsApp <MessageCircle size={18}/></a></div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-white/55"><span className="inline-flex items-center gap-2"><Check size={16} className="text-[#a7b86a]"/>Feitas para a rotina</span><span className="inline-flex items-center gap-2"><Check size={16} className="text-[#a7b86a]"/>Opções variadas</span><span className="inline-flex items-center gap-2"><Check size={16} className="text-[#a7b86a]"/>Entrega em Juiz de Fora</span></div>
          </div>
          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-2xl shadow-black/30"><img src="/images/hero.jpg" alt="Marmita Nutrifit" className="h-full min-h-[360px] w-full object-cover"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-7 pt-28"><div className="text-xs font-bold uppercase tracking-[.18em] text-[#a7b86a]">Destaque da casa</div><div className="mt-1 text-2xl font-black">Patinho com purê de abóbora</div><div className="mt-1 text-[#ef7d18] font-bold">R$ 21,90 • 350 g</div></div></div>
        </div>
      </section>

      <section id="cardapio" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="text-sm font-bold uppercase tracking-[.2em] text-[#ef7d18]">Cardápio completo</div><h2 className="mt-2 text-4xl font-black md:text-5xl">Escolha sua Nutrifit</h2></div><div className="text-sm text-white/50">26 opções de refeições + saladas</div></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(([name,category,price,description,image]) => <article key={name} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:bg-white/[.055]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,#26301d,#151914)]">{image ? <img src={image} alt={name} className="h-full w-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center"><span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/50">Foto do produto</span></div>}<div className="absolute left-3 top-3 rounded-full bg-[#a7b86a] px-3 py-1 text-[11px] font-black text-black">{category}</div></div>
            <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black">{name}</h3><span className="whitespace-nowrap font-black text-[#ef7d18]">{price}</span></div><p className="mt-2 text-sm leading-6 text-white/55">{description}</p><a href={whatsapp} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#c9d88c]">Pedir pelo WhatsApp <ArrowRight size={15}/></a></div>
          </article>)}
        </div>
      </section>

      <section id="sucos" className="border-y border-white/10 bg-[#10130d]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8"><div className="text-sm font-bold uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit Mulher</div><h2 className="mt-2 text-4xl font-black md:text-5xl">Sucos naturais • 500 ml</h2><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">{juices.map(j => <a key={j} href={whatsapp} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center transition hover:border-[#a7b86a]/40"><div className="text-xl font-black">{j}</div><div className="mt-2 text-sm text-white/55">500 ml</div><div className="mt-3 font-black text-[#ef7d18]">R$ 12,00</div></a>)}</div></div></section>

      <section id="combos" className="mx-auto max-w-7xl px-5 py-20 md:px-8"><div className="text-sm font-bold uppercase tracking-[.2em] text-[#ef7d18]">Combos</div><h2 className="mt-2 text-4xl font-black md:text-5xl">Monte sua semana e economize</h2><div className="mt-10 grid gap-10 lg:grid-cols-3"><div><div className="mb-4 text-lg font-bold">Combos Linha Fit • 350 g</div><div className="grid gap-3">{combos350.map(([label,price]) => <a key={label} href={whatsapp} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] p-5"><span className="font-semibold">{label}</span><span className="font-black text-[#ef7d18]">{price}</span></a>)}</div></div><div><div className="mb-4 text-lg font-bold">Combos Linha Performance • 450 g</div><div className="grid gap-3">{combos450.map(([label,price]) => <a key={label} href={whatsapp} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] p-5"><span className="font-semibold">{label}</span><span className="font-black text-[#ef7d18]">{price}</span></a>)}</div></div><div><div className="mb-4 text-lg font-bold">Combos Linha Tradicional • 500 g</div><div className="grid gap-3">{combos500.map(([label,price]) => <a key={label} href={whatsapp} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] p-5"><span className="font-semibold">{label}</span><span className="font-black text-[#ef7d18]">{price}</span></a>)}</div></div></div></section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0f110d]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8"><div className="grid gap-5 md:grid-cols-3">{[["01","Escolha","Selecione seus sabores e quantidades."],["02","Monte o pedido","Clique no WhatsApp e envie sua lista."],["03","Receba","Combine entrega e pagamento direto com a Nutrifit."]].map(([n,t,d]) => <div key={n} className="rounded-3xl border border-white/10 bg-white/[.03] p-7"><div className="text-sm font-black text-[#ef7d18]">{n}</div><h3 className="mt-3 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-white/55">{d}</p></div>)}</div><div className="mt-10 flex flex-col items-start justify-between gap-7 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171c11] p-8 md:flex-row md:items-center"><div><div className="text-sm font-bold uppercase tracking-[.2em] text-[#a7b86a]">Pedido rápido</div><div className="mt-2 text-3xl font-black">Fale com a Nutrifit pelo WhatsApp</div><div className="mt-2 text-white/55">(32) 99803-0038 • @nutrifit_jf</div></div><a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3 font-black text-black"><ShoppingBag size={18}/>Iniciar pedido</a></div></div></section>

      <footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/45 md:flex-row md:items-center md:justify-between md:px-8"><div>© 2026 Nutrifit • Juiz de Fora</div><div>@nutrifit_jf • (32) 99803-0038</div></div></footer>
    </main>
  );
}
