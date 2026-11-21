"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, MessageCircle, Plus, ShieldCheck, Utensils, X } from "lucide-react";

const WHATSAPP = "5532998030038";
const lines = [
  { name: "Fit", weight: "350 g", description: "Linha Fit" },
  { name: "Performance", weight: "450 g", description: "Linha Performance" },
  { name: "Tradicional", weight: "500 g", description: "Linha Tradicional" },
  { name: "Ainda não sei", weight: "A definir", description: "A equipe ajuda a escolher" },
];

export default function PersonalizedOrdersPage() {
  const [name, setName] = useState("");
  const [line, setLine] = useState("Fit");
  const [quantity, setQuantity] = useState("10");
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [vegetables, setVegetables] = useState("");
  const [grams, setGrams] = useState("");
  const [frequency, setFrequency] = useState("Pedido único");
  const [special, setSpecial] = useState("");
  const [notes, setNotes] = useState("");
  const [accepted, setAccepted] = useState(false);

  const selectedLine = lines.find((item) => item.name === line) ?? lines[0];
  const message = useMemo(() => [
    "Olá, Nutrifit! Quero solicitar um orçamento de pedido personalizado.",
    "",
    "DADOS DO CLIENTE",
    `Nome: ${name.trim() || "A informar"}`,
    `Linha de referência: ${selectedLine.description} (${selectedLine.weight})`,
    `Quantidade: ${quantity} refeições`,
    `Frequência: ${frequency}`,
    "",
    "COMPOSIÇÃO DESEJADA",
    `Proteínas: ${protein.trim() || "A definir"}`,
    `Carboidratos: ${carb.trim() || "A definir"}`,
    `Legumes/acompanhamentos: ${vegetables.trim() || "A definir"}`,
    `Gramaturas solicitadas: ${grams.trim() || "A avaliar"}`,
    `Restrições/substituições: ${special.trim() || "Não informado"}`,
    `Observações: ${notes.trim() || "Nenhuma"}`,
    "",
    "Entendi que este formulário é uma solicitação de orçamento, não um pedido confirmado. Aguardo avaliação e valor final antes da produção.",
  ].join("\n"), [name, selectedLine, quantity, frequency, protein, carb, vegetables, grams, special, notes]);
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="border-b border-white/10 bg-[#0d100b]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17}/> Voltar ao site</a>
          <a href="/" aria-label="Nutrifit - início"><img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit" className="h-10 w-10 object-contain"/></a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#f47b0b]">Atendimento sob medida</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Monte seu pedido personalizado</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">Conte como você precisa das refeições. Nossa equipe avalia a composição, a operação e os ingredientes para preparar um orçamento claro antes de iniciar a produção.</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
          <section className="rounded-2xl border border-white/10 bg-[#11150f] p-4 sm:p-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#86a51d]/15 text-[#a8c83c]"><Utensils size={22}/></span>
              <div><h2 className="text-lg font-black">1. Dados do pedido</h2><p className="text-xs text-white/50">Comece definindo o tamanho da encomenda.</p></div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">Seu nome
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos chamar você?" className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black/30 px-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold">Quantidade de refeições
                <input type="number" min="1" max="500" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black/30 px-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold sm:col-span-2">Linha de referência
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {lines.map((item) => <button type="button" key={item.name} onClick={() => setLine(item.name)} className={`rounded-xl border p-3 text-left transition ${line === item.name ? "border-[#86a51d] bg-[#86a51d]/10" : "border-white/10 bg-black/20 hover:border-white/30"}`}><span className="block text-sm font-black">{item.name}</span><span className="mt-1 block text-xs text-white/55">{item.weight}</span></button>)}
                </div>
              </label>
              <label className="text-sm font-bold sm:col-span-2">Frequência
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090b08] px-3 text-sm font-normal outline-none focus:border-[#86a51d]">
                  <option>Pedido único</option><option>Semanal</option><option>Quinzenal</option><option>Mensal</option><option>A combinar</option>
                </select>
              </label>
            </div>

            <div className="mt-7 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f47b0b]/10 text-[#f47b0b]"><ClipboardList size={22}/></span>
              <div><h2 className="text-lg font-black">2. Como você deseja suas refeições?</h2><p className="text-xs text-white/50">Preencha o que já souber. O restante pode ser combinado.</p></div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">Proteínas desejadas
                <textarea value={protein} onChange={(e) => setProtein(e.target.value)} rows={3} placeholder="Ex.: frango, patinho, peixe..." className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold">Carboidratos desejados
                <textarea value={carb} onChange={(e) => setCarb(e.target.value)} rows={3} placeholder="Ex.: arroz, batata-doce, macarrão..." className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold">Legumes e acompanhamentos
                <textarea value={vegetables} onChange={(e) => setVegetables(e.target.value)} rows={3} placeholder="Informe os acompanhamentos desejados." className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold">Gramaturas por refeição
                <textarea value={grams} onChange={(e) => setGrams(e.target.value)} rows={3} placeholder="Ex.: 120 g de proteína, 80 g de arroz..." className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold sm:col-span-2">Restrições, substituições ou ingredientes especiais
                <textarea value={special} onChange={(e) => setSpecial(e.target.value)} rows={2} placeholder="Informe ingredientes que devem ser evitados ou substituídos." className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
              <label className="text-sm font-bold sm:col-span-2">Outras observações
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Conte algo importante para a equipe avaliar." className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm font-normal outline-none focus:border-[#86a51d]"/>
              </label>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/65">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#86a51d]"/>
              <span>Entendi que esta é uma solicitação de orçamento. O envio não confirma o pedido nem fixa preço ou prazo. A Nutrifit avaliará a solicitação e apresentará as condições para minha aprovação antes da produção.</span>
            </label>
            <a href={accepted ? whatsappUrl : undefined} onClick={(e) => { if (!accepted) e.preventDefault(); }} target="_blank" rel="noreferrer" className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition ${accepted ? "bg-[#86a51d] text-black hover:brightness-110" : "cursor-not-allowed bg-white/10 text-white/35"}`}><MessageCircle size={19}/> Enviar solicitação pelo WhatsApp</a>
            {!accepted && <p className="mt-2 text-center text-xs text-white/40">Marque a confirmação acima para habilitar o envio.</p>}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-5">
            <div className="rounded-2xl border border-[#86a51d]/30 bg-[#12180d] p-5">
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#a8c83c]">Resumo da solicitação</p>
              <h2 className="mt-2 text-xl font-black">{selectedLine.name} · {selectedLine.weight}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-white/10 pb-3"><span className="text-white/55">Quantidade</span><strong>{quantity || "—"} refeições</strong></div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-3"><span className="text-white/55">Frequência</span><strong>{frequency}</strong></div>
                <div className="flex justify-between gap-3"><span className="text-white/55">Valor</span><strong className="text-[#f4a340]">Aguardando orçamento</strong></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/55">Não exibimos preço automático porque cada personalização precisa ser avaliada conforme ingredientes, gramaturas, volume e trabalho de produção.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#11150f] p-5">
              <div className="flex items-center gap-2"><ShieldCheck className="text-[#86a51d]" size={20}/><h3 className="font-black">Como funciona</h3></div>
              <ol className="mt-4 space-y-3 text-sm text-white/65">
                <li className="flex gap-3"><span className="font-black text-[#f47b0b]">01</span> Você descreve o que precisa.</li>
                <li className="flex gap-3"><span className="font-black text-[#f47b0b]">02</span> Nossa equipe avalia ingredientes, gramaturas e produção.</li>
                <li className="flex gap-3"><span className="font-black text-[#f47b0b]">03</span> Você recebe o orçamento e as condições.</li>
                <li className="flex gap-3"><span className="font-black text-[#f47b0b]">04</span> A produção só começa após sua aprovação.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 text-xs leading-5 text-white/45">As orientações alimentares e gramaturas devem ser fornecidas pelo cliente ou pelo profissional responsável. A Nutrifit avalia a viabilidade de produção e não substitui acompanhamento nutricional.</div>
          </aside>
        </div>
      </section>
    </main>
  );
}
