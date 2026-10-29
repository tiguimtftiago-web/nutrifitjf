"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Minus, Plus, RotateCcw, Weight, Info, Camera, MessageCircle, Utensils } from "lucide-react";

type Group = "protein" | "carb" | "vegetable";
type Ingredient = { id: string; name: string; group: Group };

const ingredients: Record<Group, Ingredient[]> = {
  protein: [
    { id: "frango-peito", name: "Peito de frango grelhado", group: "protein" },
    { id: "frango-desfiado", name: "Frango desfiado", group: "protein" },
    { id: "sobrecoxa", name: "Sobrecoxa de frango", group: "protein" },
    { id: "frango-empanado", name: "Frango empanado assado", group: "protein" },
    { id: "patinho-moido", name: "Patinho moído", group: "protein" },
    { id: "patinho-tiras", name: "Patinho em tiras", group: "protein" },
    { id: "acem", name: "Acém desfiado", group: "protein" },
    { id: "carne-acebolada", name: "Carne bovina acebolada", group: "protein" },
    { id: "contra-file", name: "Contra-filé", group: "protein" },
    { id: "carne-panela", name: "Carne de panela", group: "protein" },
    { id: "cupim", name: "Cupim", group: "protein" },
    { id: "black-angus", name: "Black Angus", group: "protein" },
    { id: "lombo-suino", name: "Lombo suíno", group: "protein" },
    { id: "pernil", name: "Pernil suíno", group: "protein" },
    { id: "costelinha", name: "Costelinha suína", group: "protein" },
    { id: "calabresa", name: "Linguiça calabresa", group: "protein" },
    { id: "tilapia", name: "Tilápia", group: "protein" },
    { id: "salmao", name: "Salmão", group: "protein" },
  ],
  carb: [
    { id: "arroz-integral", name: "Arroz integral", group: "carb" },
    { id: "arroz-branco", name: "Arroz branco", group: "carb" },
    { id: "arroz-primavera", name: "Arroz primavera", group: "carb" },
    { id: "arroz-brocolis", name: "Arroz com brócolis", group: "carb" },
    { id: "batata-doce", name: "Batata-doce", group: "carb" },
    { id: "batata-inglesa", name: "Batata inglesa", group: "carb" },
    { id: "pure-batata", name: "Purê de batata inglesa", group: "carb" },
    { id: "mandioca", name: "Mandioca", group: "carb" },
    { id: "macarrao-integral", name: "Macarrão integral", group: "carb" },
    { id: "feijao-preto", name: "Feijão preto", group: "carb" },
    { id: "feijao-tropeiro", name: "Feijão tropeiro", group: "carb" },
    { id: "farofa", name: "Farofa", group: "carb" },
    { id: "batata-palha", name: "Batata palha", group: "carb" },
    { id: "milho", name: "Milho", group: "carb" },
    { id: "ervilha", name: "Ervilha", group: "carb" },
  ],
  vegetable: [
    { id: "abobora", name: "Abóbora", group: "vegetable" },
    { id: "brocolis", name: "Brócolis", group: "vegetable" },
    { id: "couve-flor", name: "Couve-flor", group: "vegetable" },
    { id: "cenoura", name: "Cenoura", group: "vegetable" },
    { id: "chuchu", name: "Chuchu", group: "vegetable" },
    { id: "espinafre", name: "Espinafre", group: "vegetable" },
    { id: "couve", name: "Couve", group: "vegetable" },
    { id: "beterraba", name: "Beterraba", group: "vegetable" },
    { id: "abobrinha", name: "Abobrinha", group: "vegetable" },
    { id: "pepino", name: "Pepino", group: "vegetable" },
    { id: "tomate", name: "Tomate", group: "vegetable" },
    { id: "tomate-cereja", name: "Tomate-cereja", group: "vegetable" },
    { id: "repolho-roxo", name: "Repolho roxo", group: "vegetable" },
    { id: "alface-mix-folhas", name: "Alface / mix de folhas", group: "vegetable" },
    { id: "cebola", name: "Cebola", group: "vegetable" },
    { id: "vinagrete", name: "Vinagrete", group: "vegetable" },
    { id: "mix-legumes", name: "Mix de legumes", group: "vegetable" },
    { id: "legumes-salteados", name: "Legumes salteados", group: "vegetable" },
  ],
};;

const basePrice = 23.97;
const initial = { protein: { id: "frango-peito", grams: 150 }, carb: { id: "arroz-integral", grams: 120 }, vegetable: { id: "brocolis", grams: 80 } };
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MontarRefeicaoPage() {
  const [selection, setSelection] = useState(initial);
  const [showDetails, setShowDetails] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<Group, boolean>>({ protein: true, carb: false, vegetable: false });
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

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-28 sm:px-6 sm:pb-12 lg:grid-cols-[1fr_340px]">
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
                <button type="button" aria-expanded={openGroups[group]} onClick={() => setOpenGroups((current) => ({ ...current, [group]: !current[group] }))} className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-white/[.025] sm:px-5"><div className="min-w-0"><h2 className="text-lg font-black">{label.title}</h2><p className="mt-1 text-xs text-white/45">{label.subtitle}</p>{!openGroups[group] && <p className="mt-2 truncate text-xs font-bold text-[#d5e5a7]">{ingredients[group].find((ingredient) => ingredient.id === current.id)?.name} · {current.grams} g</p>}</div><div className="flex shrink-0 items-center gap-2"><span className="hidden rounded-full bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#b8c888] sm:inline-flex">{label.accent}</span><ChevronDown size={18} className={"mt-1 text-white/50 transition-transform " + (openGroups[group] ? "rotate-180" : "")} /></div></button>
                {openGroups[group] && <div className="grid gap-4 border-t border-white/[.07] p-4 sm:grid-cols-[1fr_180px] sm:items-center sm:p-5">
                  <label className="block"><span className="mb-2 block text-xs font-bold text-white/55">Ingrediente</span><span className="relative block"><select value={current.id} onChange={(event) => update(group, { id: event.target.value })} className="min-h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#090b08] px-4 pr-10 text-sm font-bold outline-none transition focus:border-[#a7b86a]">{ingredients[group].map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45" /></span></label>
                  <div><span className="mb-2 block text-xs font-bold text-white/55">Quantidade</span><div className="flex min-h-12 items-center justify-between rounded-2xl border border-white/10 bg-[#090b08] p-1.5"><button type="button" aria-label={"Diminuir " + label.accent} onClick={() => adjust(group, -10)} disabled={current.grams <= 0} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.07] transition hover:bg-white/[.13] disabled:opacity-30"><Minus size={16} /></button><div className="text-center"><span className="text-lg font-black tabular-nums">{current.grams}</span><span className="ml-1 text-xs text-white/45">g</span></div><button type="button" aria-label={"Aumentar " + label.accent} onClick={() => adjust(group, 10)} disabled={current.grams >= 500} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a] text-black transition hover:bg-[#c1d48b] disabled:opacity-30"><Plus size={16} /></button></div><div className="mt-2 flex gap-2">{[50, 100, 150].map((amount) => <button key={amount} type="button" onClick={() => update(group, { grams: amount })} className={"flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition " + (current.grams === amount ? "border-[#a7b86a] bg-[#a7b86a]/10 text-[#d5e5a7]" : "border-white/10 text-white/50 hover:text-white")}>{amount} g</button>)}</div></div>
                </div>}
              </section>
            );
          })}
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white/45 transition hover:text-white"><RotateCcw size={14} /> Restaurar combinação inicial</button>
        </div>

        <aside id="montador-resumo" className="h-fit rounded-3xl border border-[#a7b86a]/30 bg-[#11140f] p-5 sm:p-6 lg:sticky lg:top-5">
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#a7b86a]/30 bg-[#080a07]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.28)] backdrop-blur sm:hidden"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-white/55">Sua marmita FIT</p><p className="text-lg font-black tabular-nums text-white">{total} g <span className="text-xs font-bold text-white/45">/ 350 g</span></p></div><button type="button" onClick={() => { setShowDetails(true); document.getElementById("montador-resumo")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="min-h-11 shrink-0 rounded-xl bg-[#a7b86a] px-4 text-xs font-black text-black transition active:scale-[.98]">{extra > 0 ? `${extra} g excedentes` : "Ver resumo"} <span aria-hidden="true">↓</span></button></div></div>\n\n      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] md:py-10">
          <div><div className="text-lg font-black tracking-tight">NUTRI<span className="text-[#a7b86a]">FIT</span></div><p className="mt-2 max-w-xs text-sm leading-6 text-white/45">Marmitas, saladas e sucos para facilitar sua rotina em Juiz de Fora.</p><div className="mt-4 flex gap-3"><a href="https://www.instagram.com/nutrifit_jf/" target="_blank" rel="noreferrer" aria-label="Instagram Nutrifit" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:text-[#a7b86a]"><Camera size={18} /></a><a href="https://wa.me/5532998030038" target="_blank" rel="noreferrer" aria-label="WhatsApp Nutrifit" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:text-[#a7b86a]"><MessageCircle size={18} /></a></div></div>
          <div><h3 className="text-xs font-black uppercase tracking-[.16em] text-white/75">Acesso rápido</h3><nav className="mt-3 grid gap-2 text-sm text-white/45"><Link href="/" className="hover:text-white">Página inicial</Link><Link href="/#cardapio" className="hover:text-white">Cardápio</Link><Link href="/#combos" className="hover:text-white">Montar combo</Link><Link href="/assistente" className="hover:text-white">Assistente Nutrifit</Link><Link href="/privacidade" className="hover:text-white">Política de privacidade</Link></nav></div>
          <div><h3 className="text-xs font-black uppercase tracking-[.16em] text-white/75">Atendimento e compra</h3><p className="mt-3 text-sm leading-6 text-white/45">Juiz de Fora/MG<br />Entrega ou retirada conforme confirmação do pedido.</p><p className="mt-3 text-xs leading-5 text-white/35">Formas de pagamento e disponibilidade são confirmadas no atendimento antes da finalização.</p><a href="https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit%21%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20pedido." target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#a7b86a] px-4 py-2.5 text-xs font-black text-black"><MessageCircle size={15} /> Falar com a Nutrifit</a></div>
        </div>
        <div className="border-t border-white/5 px-4 py-4 text-center text-[10px] text-white/30">© {new Date().getFullYear()} Nutrifit • Juiz de Fora/MG • Todos os direitos reservados.</div>
      </footer>
    </main>
  );
}
