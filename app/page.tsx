"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Minus, Plus, ShoppingBag, Trash2, X, MessageCircle, Sparkles } from "lucide-react";

const WHATSAPP_NUMBER = "5532998030038";
const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Product = { id: string; name: string; line: string; weight: string; price: number | null; description: string; image?: string };

type Combo = { id: string; line: string; weight: string; quantity: number; price: number };

const products: Product[] = [
  { id: "fit-abobora", name: "Patinho com Abóbora", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Patinho moído temperado com purê cremoso de abóbora.", image: "/images/hero.jpg" },
  { id: "fit-batata", name: "Patinho com Batata-Doce", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Patinho moído com batata-doce cremosa." },
  { id: "fit-frango-legumes", name: "Frango Grelhado com Mix de Legumes", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Peito de frango grelhado com mix de legumes." },
  { id: "fit-carne-legumes", name: "Carne Acebolada com Legumes", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Carne bovina acebolada com legumes selecionados." },
  { id: "fit-lombo", name: "Lombo Suíno com Legumes Assados", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Lombo suíno grelhado com legumes assados." },
  { id: "fit-frango-ervas", name: "Frango ao Molho de Ervas com Legumes", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Frango grelhado ao molho de ervas com legumes." },
  { id: "fit-patinho-legumes", name: "Patinho com Legumes", line: "Linha Fit", weight: "350 g", price: 19.9, description: "Patinho moído com legumes selecionados." },
  { id: "perf-beef-sweet", name: "Beef & Sweet Potato", line: "Performance", weight: "450 g", price: 29.9, description: "Carne bovina grelhada, batata-doce e acompanhamentos." },
  { id: "perf-chicken-rice", name: "Chicken Rice Performance", line: "Performance", weight: "450 g", price: 27.9, description: "Frango grelhado, arroz e legumes." },
  { id: "perf-patinho", name: "Patinho Strong", line: "Performance", weight: "450 g", price: 29.9, description: "Patinho temperado, purê e acompanhamentos." },
  { id: "perf-chicken-power", name: "Chicken Power", line: "Performance", weight: "450 g", price: 27.9, description: "Frango grelhado em cubos com acompanhamentos." },
  { id: "perf-sweet", name: "Chicken Sweet Potato", line: "Performance", weight: "450 g", price: 27.9, description: "Frango grelhado com batata-doce e legumes." },
  { id: "trad-strogonoff", name: "Strogonoff Leve", line: "Tradicional", weight: "500 g", price: 26.9, description: "Strogonoff leve de frango, arroz e batata palha." },
  { id: "trad-frango", name: "Frango Cremoso Fit", line: "Tradicional", weight: "500 g", price: 27.9, description: "Frango cremoso com arroz e legumes." },
  { id: "trad-churrasco", name: "Churrasco Fit Mineiro", line: "Tradicional", weight: "500 g", price: 29.9, description: "Contra-filé grelhado com arroz, vinagrete e farofa." },
  { id: "trad-parmegiana", name: "Parmegiana Cremosa", line: "Tradicional", weight: "500 g", price: 29.9, description: "Filé empanado, molho artesanal, queijo e acompanhamentos." },
  { id: "trad-executive", name: "Executive Fit", line: "Tradicional", weight: "500 g", price: 28.9, description: "Lombo suíno, macarrão alho e óleo e legumes." },
  { id: "trad-feijoada", name: "Feijoada Fit", line: "Tradicional", weight: "500 g", price: 28.9, description: "Feijoada com lombo e calabresa, arroz, couve e farofa." },
  { id: "trad-escondidinho", name: "Escondidinho Fit", line: "Tradicional", weight: "500 g", price: 27.9, description: "Purê cremoso com recheio bem temperado." },
  { id: "premium-salmao", name: "Salmão Grelhado", line: "Premium", weight: "500 g", price: 39.9, description: "Salmão grelhado com acompanhamentos selecionados." },
  { id: "premium-angus", name: "Black Angus + Purê Trufado", line: "Premium", weight: "500 g", price: 39.9, description: "Black Angus grelhado com purê trufado." },
  { id: "salada-summer", name: "Summer Salad", line: "Saladas", weight: "350 g", price: 19.9, description: "Mix de folhas, frango, legumes e molho especial." },
  { id: "salada-crocante", name: "Crocante Fit", line: "Saladas", weight: "350 g", price: 18.9, description: "Salada crocante com frango e ingredientes frescos." },
  { id: "salada-tropical", name: "Tropical Fit", line: "Saladas", weight: "350 g", price: 19.9, description: "Frango, folhas e ingredientes tropicais." },
  { id: "salada-caesar", name: "Caesar Fit", line: "Saladas", weight: "350 g", price: 21.9, description: "Frango, folhas, parmesão e molho Caesar." },
  { id: "salada-power", name: "Power Salad", line: "Saladas", weight: "350 g", price: 21.9, description: "Salada reforçada em proteína." },
  { id: "salada-green", name: "Green Power", line: "Saladas", weight: "350 g", price: null, description: "Linha Saladas Nutrifit." },
  { id: "salada-mango", name: "Mango Fresh", line: "Saladas", weight: "350 g", price: null, description: "Linha Saladas Nutrifit." },
  { id: "salada-avocado", name: "Avocado Chicken", line: "Saladas", weight: "350 g", price: null, description: "Linha Saladas Nutrifit." },
];

const juices = ["Pink", "Energy", "Green", "Sun", "Purple", "Glow"];
const traditionalJuices = ["Laranja", "Laranja com Acerola", "Abacaxi com Hortelã"];

const combos: Combo[] = [
  ...[[5, 106.9], [7, 149.9], [10, 214.9], [14, 299.9], [20, 419.9]].map(([q, p]) => ({ id: `fit-${q}`, line: "Fit", weight: "350 g", quantity: q as number, price: p as number })),
  ...[[5, 139.9], [7, 194.9], [10, 274.9], [14, 384.9], [20, 539.9]].map(([q, p]) => ({ id: `perf-${q}`, line: "Performance", weight: "450 g", quantity: q as number, price: p as number })),
  ...[[5, 139.9], [7, 194.9], [10, 269.9], [14, 379.9], [20, 529.9]].map(([q, p]) => ({ id: `trad-${q}`, line: "Tradicional", weight: "500 g", quantity: q as number, price: p as number })),
];

export default function Home() {
  const [cart, setCart] = useState<Array<{ product: Product | Combo; quantity: number }>>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [checkout, setCheckout] = useState(false);

  const filtered = useMemo(() => filter === "Todos" ? products : products.filter(p => p.line === filter), [filter]);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + ("price" in item.product && item.product.price ? item.product.price : 0) * item.quantity, 0);

  const add = (product: Product | Combo) => {
    if (product.price == null) return;
    setCart(current => {
      const found = current.find(item => item.product.id === product.id);
      return found
        ? current.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQty = (id: string, delta: number) => setCart(current => current.map(item => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  const remove = (id: string) => setCart(current => current.filter(item => item.product.id !== id));

  const sendOrder = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const lines = cart.map(item => `${item.quantity}x ${item.product.name} (${"weight" in item.product ? item.product.weight : ""}) — ${money((item.product as any).price * item.quantity)}`).join("\n");
    const message = `Olá Nutrifit!\n\nQuero fazer este pedido:\n${lines}\n\nTotal: ${money(total)}\n\nNome: ${data.get("nome")}\nTelefone: ${data.get("telefone")}\nEndereço: ${data.get("endereco")}\nNúmero: ${data.get("numero")}\nBairro: ${data.get("bairro")}\nPagamento: ${data.get("pagamento")}\nObservações: ${data.get("observacoes") || "-"}`;
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#090b08] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b08]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="text-xl font-black tracking-[.18em]">NUTRIF<span className="text-[#ef7d18]">IT</span></a>
          <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex"><a href="#cardapio" className="hover:text-white">Cardápio</a><a href="#combos" className="hover:text-white">Combos</a><a href="#bebidas" className="hover:text-white">Bebidas</a><a href="#como-pedir" className="hover:text-white">Como pedir</a></nav>
          <button onClick={() => setCartOpen(true)} className="relative inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-4 py-2 text-sm font-black text-black"><ShoppingBag size={17}/> Carrinho{totalItems > 0 && <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">{totalItems}</span>}</button>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(167,184,106,.16),transparent_30%),radial-gradient(circle_at_20%_90%,rgba(239,125,24,.12),transparent_30%)]"/>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] text-[#c9d88c]"><Sparkles size={14}/> Juiz de Fora - MG</div>
            <h1 className="mt-6 text-5xl font-black leading-[.95] sm:text-6xl lg:text-7xl">Comida de verdade.<br/><span className="text-[#a7b86a]">Prática e saborosa.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Marmitas Fit, Performance, Tradicional, Premium, saladas e sucos para deixar sua rotina mais simples.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#cardapio" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3 font-bold text-black">Ver cardápio <ArrowRight size={18}/></a><a href={whatsappLink("Olá Nutrifit! Quero fazer um pedido.")} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-bold"><MessageCircle size={18}/> Pedir pelo WhatsApp</a></div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-white/55"><span className="inline-flex items-center gap-2"><Check size={15} className="text-[#a7b86a]"/> Ingredientes selecionados</span><span className="inline-flex items-center gap-2"><Check size={15} className="text-[#a7b86a]"/> Opções variadas</span><span className="inline-flex items-center gap-2"><Check size={15} className="text-[#a7b86a]"/> Entrega em Juiz de Fora</span></div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40"><img src="/images/hero.jpg" alt="Marmita Nutrifit" className="aspect-[16/10] w-full object-cover"/></div>
        </div>
      </section>

      <section id="cardapio" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#ef7d18]">Cardápio completo</p><h2 className="mt-2 text-4xl font-black sm:text-5xl">Escolha sua refeição</h2></div><p className="text-sm text-white/50">{products.length} opções cadastradas</p></div>
        <div className="mt-8 flex flex-wrap gap-2">{["Todos","Linha Fit","Performance","Tradicional","Premium","Saladas"].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${filter === item ? "border-[#a7b86a] bg-[#a7b86a] text-black" : "border-white/10 bg-white/[.03] text-white/70 hover:border-white/20"}`}>{item}</button>)}</div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(product => <article key={product.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,#26301d,#151914)]"><img src={product.image || "/images/hero.jpg"} alt={product.name} className="h-full w-full object-cover" loading="lazy"/><span className="absolute left-3 top-3 rounded-full bg-[#a7b86a] px-3 py-1 text-[11px] font-black text-black">{product.line} • {product.weight}</span></div>
            <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black">{product.name}</h3><span className="whitespace-nowrap font-black text-[#ef7d18]">{product.price == null ? "Consultar" : money(product.price)}</span></div><p className="mt-2 text-sm leading-6 text-white/55">{product.description}</p><button onClick={() => product.price == null ? window.open(whatsappLink(`Olá! Gostaria de saber o valor de ${product.name}.`), "_blank", "noopener,noreferrer") : add(product)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef7d18] px-4 py-3 font-black text-black">{product.price == null ? "Consultar no WhatsApp" : "Adicionar ao carrinho"} <ArrowRight size={16}/></button></div>
          </article>)}
        </div>
      </section>

      <section id="combos" className="border-y border-white/10 bg-[#10130d]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#a7b86a]">Combos oficiais</p><h2 className="mt-2 text-4xl font-black sm:text-5xl">Monte sua semana e economize</h2><p className="mt-3 max-w-2xl text-white/55">Os valores abaixo seguem os combos oficiais por linha e tamanho.</p><div className="mt-10 grid gap-8 lg:grid-cols-3">{["Fit","Performance","Tradicional"].map(line => <div key={line}><h3 className="mb-4 text-xl font-black">{line}</h3><div className="space-y-3">{combos.filter(c => c.line === line).map(c => <button key={c.id} onClick={() => add(c)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 text-left hover:border-[#a7b86a]/50"><span><span className="block font-bold">{c.quantity} marmitas</span><span className="text-xs text-white/45">{c.weight}</span></span><span className="font-black text-[#ef7d18]">{money(c.price)}</span></button>)}</div></div>)}</div></div>
      </section>

      <section id="bebidas" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#ef7d18]">Bebidas</p><h2 className="mt-2 text-4xl font-black sm:text-5xl">Sucos para acompanhar</h2><div className="mt-10 grid gap-8 md:grid-cols-2"><div className="rounded-3xl border border-[#a7b86a]/20 bg-[#11150e] p-6"><h3 className="text-2xl font-black">Nutrifit Mulher · 500 ml</h3><p className="mt-2 text-sm text-white/55">Pink, Energy, Green, Sun, Purple e Glow · R$ 12,00.</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{juices.map(j => <a key={j} href={whatsappLink(`Olá! Quero o suco Nutrifit Mulher ${j}.`)} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center font-black hover:border-[#a7b86a]/50">{j}<span className="mt-1 block text-xs font-normal text-white/40">500 ml</span><span className="mt-2 block text-[#ef7d18]">R$ 12,00</span></a>)}</div></div><div className="rounded-3xl border border-white/10 bg-[#11110f] p-6"><h3 className="text-2xl font-black">Sucos tradicionais · 500 ml</h3><p className="mt-2 text-sm text-white/55">Valores não exibidos até confirmação comercial.</p><div className="mt-5 grid gap-3">{traditionalJuices.map(j => <a key={j} href={whatsappLink(`Olá! Quero saber o valor do suco ${j}.`)} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 font-bold hover:border-white/20"><span>{j}</span><span className="text-sm text-[#c9d88c]">Consultar</span></a>)}</div></div></div></section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0f110d]"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="grid gap-5 md:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><span className="text-3xl font-black text-[#a7b86a]">01</span><h3 className="mt-4 text-xl font-black">Escolha</h3><p className="mt-2 text-sm leading-6 text-white/55">Selecione suas marmitas e combos e adicione ao carrinho.</p></div><div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><span className="text-3xl font-black text-[#a7b86a]">02</span><h3 className="mt-4 text-xl font-black">Confira</h3><p className="mt-2 text-sm leading-6 text-white/55">Revise quantidades, endereço e forma de pagamento.</p></div><div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><span className="text-3xl font-black text-[#a7b86a]">03</span><h3 className="mt-4 text-xl font-black">Envie</h3><p className="mt-2 text-sm leading-6 text-white/55">Envie o pedido pronto para o WhatsApp da Nutrifit.</p></div></div><div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/10 bg-white/[.04] p-8 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-black">Pronto para pedir?</h2><p className="mt-1 text-white/55">WhatsApp: (32) 99803-0038 · Instagram: @nutrifit_jf</p></div><button onClick={() => setCartOpen(true)} className="rounded-full bg-[#ef7d18] px-6 py-3 font-black text-black">Abrir carrinho</button></div></div></section>

      <footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-white/45 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"><span className="font-black tracking-[.18em] text-white">NUTRIF<span className="text-[#ef7d18]">IT</span></span><span>Juiz de Fora - MG</span><a href="https://www.instagram.com/nutrifit_jf/" target="_blank" rel="noreferrer">@nutrifit_jf</a><a href={whatsappLink("Olá Nutrifit! Quero fazer um pedido.")} target="_blank" rel="noreferrer">(32) 99803-0038</a></div></footer>

      {cartOpen && <div className="fixed inset-0 z-[100] bg-black/70" onClick={() => setCartOpen(false)}><aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d100c] shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between border-b border-white/10 p-5"><div><h2 className="text-xl font-black">Seu carrinho</h2><p className="text-xs text-white/45">{totalItems} {totalItems === 1 ? "item" : "itens"}</p></div><button onClick={() => setCartOpen(false)} aria-label="Fechar carrinho"><X/></button></div><div className="flex-1 space-y-3 overflow-y-auto p-5">{cart.length === 0 ? <div className="py-16 text-center text-white/45">Seu carrinho está vazio.</div> : cart.map(item => <div key={item.product.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.product.name}</h3><p className="mt-1 text-xs text-white/45">{"weight" in item.product ? item.product.weight : ""}</p></div><button onClick={() => remove(item.product.id)} aria-label={`Remover ${item.product.name}`}><Trash2 size={16} className="text-white/45"/></button></div><div className="mt-4 flex items-center justify-between"><span className="font-black text-[#ef7d18]">{money(((item.product as any).price || 0) * item.quantity)}</span><div className="flex items-center gap-2 rounded-full border border-white/10 px-2 py-1"><button onClick={() => changeQty(item.product.id, -1)} aria-label="Diminuir"><Minus size={15}/></button><span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span><button onClick={() => changeQty(item.product.id, 1)} aria-label="Aumentar"><Plus size={15}/></button></div></div></div>)}</div><div className="border-t border-white/10 p-5"><div className="flex items-center justify-between text-lg font-black"><span>Total</span><span className="text-[#ef7d18]">{money(total)}</span></div><button disabled={cart.length === 0} onClick={() => { setCartOpen(false); setCheckout(true); }} className="mt-4 w-full rounded-2xl bg-[#a7b86a] px-4 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-30">Finalizar pedido</button></div></aside></div>}

      {checkout && <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/80 p-4"><div className="mx-auto my-8 max-w-xl rounded-3xl border border-white/10 bg-[#0d100c] p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a7b86a]">Finalização</p><h2 className="mt-1 text-3xl font-black">Enviar pedido</h2></div><button onClick={() => setCheckout(false)} aria-label="Fechar"><X/></button></div><form className="mt-7 grid gap-4" onSubmit={e => { e.preventDefault(); sendOrder(e.currentTarget); }}><input required name="nome" placeholder="Nome" className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 outline-none focus:border-[#a7b86a]"/><input required name="telefone" placeholder="Telefone" className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 outline-none focus:border-[#a7b86a]"/><input required name="endereco" placeholder="Endereço" className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 outline-none focus:border-[#a7b86a]"/><div className="grid gap-4 sm:grid-cols-2"><input required name="numero" placeholder="Número" className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 outline-none focus:border-[#a7b86a]"/><input required name="bairro" placeholder="Bairro" className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 outline-none focus:border-[#a7b86a]"/></div><select required name="pagamento" className="rounded-2xl border border-white/10 bg-[#131610] px-4 py-3 outline-none focus:border-[#a7b86a]"><option value="">Forma de pagamento</option><option>Pix</option><option>Dinheiro</option><option>Cartão</option></select><textarea name="observacoes" placeholder="Observações (opcional)" rows={3} className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 outline-none focus:border-[#a7b86a]"/><div className="mt-2 rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex items-center justify-between font-black"><span>Total do pedido</span><span className="text-[#ef7d18]">{money(total)}</span></div></div><button type="submit" className="rounded-2xl bg-[#ef7d18] px-4 py-4 font-black text-black">Enviar pedido pelo WhatsApp</button></form></div></div>}
    </main>
  );
}
