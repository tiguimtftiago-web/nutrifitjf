"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Minus, Plus, RotateCcw, Weight, Info, Instagram, MessageCircle, Utensils } from "lucide-react";

type Group = "protein" | "carb" | "vegetable";
type Ingredient = { id: string; name: string; group: Group };

const ingredients: Record<Group, Ingredient[]> = {
  protein: [
    { id: "frango", name: "Peito de frango", group: "protein" },
    { id: "patinho", name: "Patinho moído", group: "protein" },
    { id: "acem", name: "Acém desfiado", group: "protein" },
  ],
  carb: [
    { id: "arroz-integral", name: "Arroz integral", group: "carb" },
    { id: "batata-doce", name: "Batata-doce", group: "carb" },
    { id: "batata-inglesa", name: "Batata inglesa", group: "carb" },
    { id: "mandioca", name: "Mandioca", group: "carb" },
    { id: "macarrao-integral", name: "Macarrão integral", group: "carb" },
  ],
  vegetable: [
    { id: "brocolis", name: "Brócolis", group: "vegetable" },
    { id: "couve-flor", name: "Couve-flor", group: "vegetable" },
    { id: "cenoura", name: "Cenoura", group: "vegetable" },
    { id: "chuchu", name: "Chuchu", group: "vegetable" },
    { id: "espinafre", name: "Espinafre", group: "vegetable" },
  ],
};

const basePrice = 23.97;
const initial = { protein: { id: "frango", grams: 150 }, carb: { id: "arroz-integral", grams: 120 }, vegetable: { id: "brocolis", grams: 80 } };
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MontarRefeicaoPage() {
  const [selection, setSelection] = useState(initial);
  const [showDetails, setShowDetails] = useState(true);
  const [showTestInfo, setShowTestInfo] = useState(false);
  const [saved, setSaved] = useState(false);
  const total = selection.protein.grams + selection.carb.grams + selection.vegetable.grams;
  const extra = Math.max(0, total - 350);
  const remaining = Math.max(0, 350 - total);
  const progress = Math.min(100, (total / 350) * 100);
  const chosen = useMemo(() => (Object.keys(selection) as Group[]).map((group) => {
    const item = ingredients[group].find((ingredient) => ingredient.id === selection[group].id)!;
    return { ...item, grams: selection[group].grams };
  }), [selection]);

  const update = (group: Group, patch: Partial<{ id: string; grams: number }>) => {
    setSelection((current) => ({ ...current, [group]: { ...current[group], ...patch } }));
    setSaved(false);
  };
  const reset = () => { setSelection(initial); setSaved(false); };
  const adjust = (group: Group, delta: number) => update(group, { grams: Math.max(0, Math.min(500, selection[group].grams + delta)) });

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <div className="border-b border-[#a7b86a]/20 bg-[#a7b86a]/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#c7d69a]"><span className="rounded-full bg-[#a7b86a] px-2.5 py-1 text-[10px] text-black">TESTE</span>Montador de refeição</div>
          <button type="button" onClick={() => setShowTestInfo((value) => !value)} className="inline-flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white"><Info size={15} /> Sobre o teste</button>
        </div>
        {showTestInfo && <div className="mx-auto max-w-6xl px-4 pb-3 text-sm leading-6 text-white/65 sm:px-6">Protótipo de validação visual. Não envia pedidos, não altera estoque nem grava dados no sistema. A cobrança por grama excedente está prevista, mas as tarifas por ingrediente precisam ser configuradas e validadas antes de exibir um total final.</div>}
      </div>

      <header className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-7">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Voltar ao cardápio Nutrifit</Link>
        <div className="mt-8 grid gap-7 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.22em] text-[#a7b86a]">Do seu jeito • Linha FIT</p><h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl">Monte sua refeição, ingrediente por ingrediente.</h1><p className="mt-4 max-w-xl text-base leading-7 text-white/60">Escolha a proteína, o carboidrato e os legumes. Ajuste os pesos e acompanhe a gramatura em tempo real.</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[.04] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-white/60">Preço-base FIT 350 g</span><Utensils size={19} className="text-[#a7b86a]" /></div><div className="mt-2 text-3xl font-black">{money(basePrice)}</div><p className="mt-1 text-xs leading-5 text-white/40">Referência da unidade FIT. O valor final depende das regras de gramatura e das tarifas configuradas.</p></div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {(Object.keys(selection) as Group[]).map((group) => {
            const labels: Record<Group, { title: string; subtitle: string; accent: string }> = {
              protein: { title: "1. Escolha sua proteína", subtitle: "Peso do ingrediente já preparado", accent: "Proteína" },
              carb: { title: "2. Escolha o carboidrato", subtitle: "Ajuste a quantidade em gramas", accent: "Carboidrato" },
              vegetable: { title: "3. Escolha os legumes", subtitle: "Complete sua combinação", accent: "Legumes" },
            };
            const label = labels[group];
            const current = selection[group];
            return (
              <section key={group} className="overflow-hidden rounded-3xl border border-white/10 bg-[#11140f]">
                <div className="flex items-start justify-between gap-3 border-b border-white/[.07] px-4 py-4 sm:px-5"><div><h2 className="text-lg font-black">{label.title}</h2><p className="mt-1 text-xs text-white/45">{label.subtitle}</p></div><span className="rounded-full bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#b8c888]">{label.accent}</span></div>
                <div className="grid gap-4 p-4 sm:grid-cols-[1fr_180px] sm:items-center sm:p-5">
                  <label className="block"><span className="mb-2 block text-xs font-bold text-white/55">Ingrediente</span><span className="relative block"><select value={current.id} onChange={(event) => update(group, { id: event.target.value })} className="min-h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#090b08] px-4 pr-10 text-sm font-bold outline-none transition focus:border-[#a7b86a]">{ingredients[group].map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45" /></span></label>
                  <div><span className="mb-2 block text-xs font-bold text-white/55">Quantidade</span><div className="flex min-h-12 items-center justify-between rounded-2xl border border-white/10 bg-[#090b08] p-1.5"><button type="button" aria-label={"Diminuir " + label.accent} onClick={() => adjust(group, -10)} disabled={current.grams <= 0} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.07] transition hover:bg-white/[.13] disabled:opacity-30"><Minus size={16} /></button><div className="text-center"><span className="text-lg font-black tabular-nums">{current.grams}</span><span className="ml-1 text-xs text-white/45">g</span></div><button type="button" aria-label={"Aumentar " + label.accent} onClick={() => adjust(group, 10)} disabled={current.grams >= 500} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a] text-black transition hover:bg-[#c1d48b] disabled:opacity-30"><Plus size={16} /></button></div><div className="mt-2 flex gap-2">{[50, 100, 150].map((amount) => <button key={amount} type="button" onClick={() => update(group, { grams: amount })} className={"flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition " + (current.grams === amount ? "border-[#a7b86a] bg-[#a7b86a]/10 text-[#d5e5a7]" : "border-white/10 text-white/50 hover:text-white")}>{amount} g</button>)}</div></div>
                </div>
              </section>
            );
          })}
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white/45 transition hover:text-white"><RotateCcw size={14} /> Restaurar combinação inicial</button>
        </div>

        <aside className="h-fit rounded-3xl border border-[#a7b86a]/30 bg-[#11140f] p-5 sm:p-6 lg:sticky lg:top-5">
          <div className="flex items-center gap-2"><Weight size={19} className="text-[#a7b86a]" /><h2 className="text-xl font-black">Sua refeição</h2></div>
          <div className="mt-5 flex items-end justify-between gap-3"><div><span className="text-3xl font-black tabular-nums">{total}</span><span className="ml-1 text-sm text-white/50">g</span></div><span className="text-xs font-bold text-white/45">Meta-base: 350 g</span></div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"><div className={"h-full rounded-full transition-all " + (extra > 0 ? "bg-[#f29a38]" : "bg-[#a7b86a]")} style={{ width: progress + "%" }} /></div>
          <p className="mt-2 text-xs leading-5 text-white/50">{extra > 0 ? (extra + " g acima da gramatura-base.") : remaining > 0 ? ("Faltam " + remaining + " g para completar a gramatura-base.") : "Gramatura-base completa."}</p>
          {extra > 0 && <div className="mt-3 rounded-2xl border border-[#f29a38]/30 bg-[#f29a38]/10 p-3 text-xs leading-5 text-[#ffd2a1]">A gramatura excedente será calculada por ingrediente quando as tarifas por grama forem configuradas. Nenhuma taxa foi inventada neste protótipo.</div>}
          <div className="mt-5 space-y-3 border-t border-white/10 pt-4"><button type="button" onClick={() => setShowDetails((value) => !value)} className="flex w-full items-center justify-between text-sm font-black"><span>Ingredientes selecionados</span><ChevronDown size={16} className={"transition " + (showDetails ? "rotate-180" : "")} /></button>
            {showDetails && <div className="space-y-3">{chosen.map((item) => <div key={item.group} className="flex items-start justify-between gap-3 text-sm"><div><p className="font-bold">{item.name}</p><p className="mt-0.5 text-xs text-white/40">{item.group === "protein" ? "Proteína" : item.group === "carb" ? "Carboidrato" : "Legumes"}</p></div><span className="whitespace-nowrap font-black tabular-nums">{item.grams} g</span></div>)}</div>}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-center justify-between text-sm text-white/55"><span>Preço-base da unidade</span><span>{money(basePrice)}</span></div><div className="mt-2 flex items-center justify-between text-sm text-white/55"><span>Adicional por gramas</span><span>A configurar</span></div><div className="mt-4 flex items-end justify-between gap-3"><span className="text-sm font-bold">Total de referência</span><span className="text-2xl font-black">{money(basePrice)}*</span></div><p className="mt-2 text-[10px] leading-4 text-white/35">* Apenas referência-base. Não representa cotação final quando a gramatura ultrapassa 350 g.</p></div>
          <button type="button" onClick={() => setSaved(true)} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#a7b86a] px-4 py-3 text-sm font-black text-black transition hover:bg-[#c1d48b]"><Check size={17} /> Validar combinação de teste</button>
          {saved && <p role="status" className="mt-3 rounded-xl bg-[#a7b86a]/10 p-3 text-xs font-bold leading-5 text-[#d5e5a7]">Combinação validada apenas nesta tela. Nenhum pedido ou dado foi salvo.</p>}
          <p className="mt-4 text-center text-[10px] leading-4 text-white/35">Ambiente de teste • sem checkout • sem gravação no banco</p>
        </aside>
      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] md:py-10">
          <div><div className="text-lg font-black tracking-tight">NUTRI<span className="text-[#a7b86a]">FIT</span></div><p className="mt-2 max-w-xs text-sm leading-6 text-white/45">Marmitas, saladas e sucos para facilitar sua rotina em Juiz de Fora.</p><div className="mt-4 flex gap-3"><a href="https://www.instagram.com/nutrifit_jf/" target="_blank" rel="noreferrer" aria-label="Instagram Nutrifit" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:text-[#a7b86a]"><Instagram size={18} /></a><a href="https://wa.me/5532998030038" target="_blank" rel="noreferrer" aria-label="WhatsApp Nutrifit" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:text-[#a7b86a]"><MessageCircle size={18} /></a></div></div>
          <div><h3 className="text-xs font-black uppercase tracking-[.16em] text-white/75">Acesso rápido</h3><nav className="mt-3 grid gap-2 text-sm text-white/45"><Link href="/" className="hover:text-white">Página inicial</Link><Link href="/#cardapio" className="hover:text-white">Cardápio</Link><Link href="/#combos" className="hover:text-white">Montar combo</Link><Link href="/assistente" className="hover:text-white">Assistente Nutrifit</Link><Link href="/privacidade" className="hover:text-white">Política de privacidade</Link></nav></div>
          <div><h3 className="text-xs font-black uppercase tracking-[.16em] text-white/75">Atendimento e compra</h3><p className="mt-3 text-sm leading-6 text-white/45">Juiz de Fora/MG<br />Entrega ou retirada conforme confirmação do pedido.</p><p className="mt-3 text-xs leading-5 text-white/35">Formas de pagamento e disponibilidade são confirmadas no atendimento antes da finalização.</p><a href="https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit%21%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20pedido." target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#a7b86a] px-4 py-2.5 text-xs font-black text-black"><MessageCircle size={15} /> Falar com a Nutrifit</a></div>
        </div>
        <div className="border-t border-white/5 px-4 py-4 text-center text-[10px] text-white/30">© {new Date().getFullYear()} Nutrifit • Juiz de Fora/MG • Todos os direitos reservados.</div>
      </footer>
    </main>
  );
}
