"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X, ArrowRight, MapPin, ShoppingBag, UserRound } from "lucide-react";

type Msg = { role: "assistant" | "user"; text: string };

type FitProduct = { name: string; price: number };
type FitCombo = { quantity: number; price: number };

const SUPABASE_URL = "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const formatBRL = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const wa = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

export default function AssistenteNutrifitPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Olá! 👋 Eu sou o assistente da Nutrifit. Posso ajudar você a escolher suas marmitas, montar um combo ou tirar dúvidas. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [fit, setFit] = useState<FitProduct[]>([]);
  const [combos, setCombos] = useState<FitCombo[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const headers = { apikey: SUPABASE_PUBLISHABLE_KEY };
        const [productsResponse, combosResponse] = await Promise.all([
          fetch(SUPABASE_URL + "/rest/v1/catalog_products?select=name,line,size_grams,price,category&active=eq.true&category=eq.marmita&line=eq.Fit&order=name.asc", { headers, cache: "no-store" }),
          fetch(SUPABASE_URL + "/rest/v1/catalog_combos?select=name,quantity,price&active=eq.true&name=eq.FIT&order=quantity.asc", { headers, cache: "no-store" }),
        ]);
        if (!productsResponse.ok || !combosResponse.ok) throw new Error("Catálogo indisponível");
        const products = await productsResponse.json() as Array<{ name: string; price: number | string; size_grams: number }>;
        const comboRows = await combosResponse.json() as Array<{ quantity: number; price: number | string }>;
        const fitProducts = products.filter((item) => Number(item.size_grams) === 350 && Number(item.price) > 0)
          .map((item) => ({ name: item.name, price: Number(item.price) }));
        const fitCombos = comboRows.filter((item) => Number(item.quantity) > 0 && Number(item.price) > 0)
          .map((item) => ({ quantity: Number(item.quantity), price: Number(item.price) }));
        if (!fitProducts.length || !fitCombos.length) throw new Error("Catálogo incompleto");
        if (active) {
          setFit(fitProducts);
          setCombos(fitCombos);
          setCatalogStatus("ready");
        }
      } catch {
        if (active) setCatalogStatus("error");
      }
    };
    void loadCatalog();
    return () => { active = false; };
  }, []);

  const total = useMemo(() => selected.reduce((sum, name) => {
    const item = fit.find((product) => product.name === name);
    return sum + (item?.price ?? 0);
  }, 0), [selected, fit]);

  const reply = (text: string) => setMessages((m) => [...m, { role: "user", text }]);

  const choose = (text: string, answer: string) => {
    reply(text);
    setTimeout(() => setMessages((m) => [...m, { role: "assistant", text: answer }]), 120);
  };

  const send = () => {
    const value = input.trim();
    if (!value) return;
    reply(value);
    setInput("");
    const normalized = value.toLowerCase();
    let answer = "Posso ajudar com marmitas, combos, preços, entrega em Juiz de Fora ou encaminhar você para o WhatsApp. Escolha uma opção abaixo.";
    if (normalized.includes("10") && normalized.includes("marmita")) {
      const combo = combos.find((item) => item.quantity === 10);
      answer = combo
        ? `Perfeito. O combo Fit de 10 marmitas custa ${formatBRL(combo.price)}. Você pode escolher os sabores e variar o pedido.`
        : "Não encontrei um preço ativo para esse combo. Consulte a equipe Nutrifit pelo WhatsApp.";
    } else if (normalized.includes("entrega") || normalized.includes("juiz")) {
      answer = "A Nutrifit atende Juiz de Fora. Posso te orientar sobre a entrega ou encaminhar você para o WhatsApp para confirmar o endereço.";
    } else if (normalized.includes("preço") || normalized.includes("preco")) {
      const unitPrices = [...new Set(fit.map((item) => item.price))];
      answer = unitPrices.length === 1
        ? `As marmitas Fit 350 g custam ${formatBRL(unitPrices[0])} cada. Também temos combos com valores cadastrados no catálogo.`
        : "Os preços variam conforme o prato. Veja os valores atualizados na lista de opções abaixo.";
    } else if (normalized.includes("frango")) {
      answer = "Temos várias opções de frango na Linha Fit. Toque em “Ver opções” para escolher.";
    }
    setTimeout(() => setMessages((m) => [...m, { role: "assistant", text: answer }]), 120);
  };

  const add = (name: string) => {
    setSelected((s) => s.includes(name) ? s : [...s, name]);
  };

  const openWhatsApp = () => {
    const list = selected.length ? selected.join(", ") : "Quero ajuda para escolher minhas marmitas";
    if (catalogStatus !== "ready") return;
    window.open(wa(`Olá Nutrifit! Quero finalizar meu pedido. ${list}. Total parcial: ${formatBRL(total)}.`), "_blank");
  };

  return (
    <main className="min-h-[100dvh] bg-[#080a07] text-white">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl lg:grid-cols-[1fr_440px]">
        <section className="hidden flex-col justify-center px-8 py-12 lg:flex xl:px-16">
          <div className="text-xs font-black uppercase tracking-[.24em] text-[#ef7d18]">Protótipo Nutrifit</div>
          <h1 className="mt-4 max-w-xl text-6xl font-black leading-[.95]">Seu atendimento Nutrifit, dentro do site.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/50">
            O agente conversa com o cliente, apresenta as opções e pode levar o pedido direto para o WhatsApp.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              ["🍱", "Cardápio", "Apresenta as opções certas."],
              ["📦", "Combo", "Ajuda a montar o pedido."],
              ["📍", "Entrega", "Orienta sobre Juiz de Fora."],
              ["💬", "WhatsApp", "Entrega o cliente para a equipe."],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
                <div className="text-2xl">{icon}</div>
                <div className="mt-3 font-black">{title}</div>
                <div className="mt-1 text-sm leading-6 text-white/40">{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[100dvh] items-center justify-center p-2 sm:p-6">
          <div className="flex h-[min(850px,calc(100dvh-16px))] w-full max-w-md flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0d100c] sm:rounded-[34px] shadow-2xl">
            <header className="flex items-center gap-3 border-b border-white/10 bg-black/40 px-5 py-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[#ef7d18]/55 bg-black">
                <img src="/images/nutrifit-logo-icon.svg" alt="Logo Nutrifit" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black">Assistente Nutrifit</div>
                <div className="flex items-center gap-1.5 text-xs text-[#a7b86a]"><span className="h-1.5 w-1.5 rounded-full bg-[#a7b86a]" /> Online agora</div>
              </div>
              <button type="button" onClick={() => router.replace("/")} aria-label="Fechar atendimento e voltar ao site" title="Fechar atendimento" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7b86a]"><X size={21} /></button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "rounded-br-md bg-[#a7b86a] text-black" : "rounded-bl-md bg-white/[.06] text-white/80"}`}>
                    {m.text}
                  </div>
                </div>
              ))}

              <div className="grid gap-2 pt-2">
                {!messages.some((m) => m.role === "user" && m.text === "Ver marmitas") && (
                  <button onClick={() => choose("Ver marmitas", "Aqui estão algumas opções da Linha Fit 350 g. Escolha as que você gostaria de colocar no seu pedido.")} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] px-4 py-3 text-left text-sm font-bold hover:border-[#a7b86a]/50">
                    🍱 Ver marmitas <ArrowRight size={16} className="text-[#a7b86a]" />
                  </button>
                )}
                {!messages.some((m) => m.role === "user" && m.text === "Montar meu combo") && (
                  <button onClick={() => choose("Montar meu combo", "Claro. Qual quantidade você quer montar?")} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] px-4 py-3 text-left text-sm font-bold hover:border-[#a7b86a]/50">
                    📦 Montar meu combo <ArrowRight size={16} className="text-[#a7b86a]" />
                  </button>
                )}
                {!messages.some((m) => m.role === "user" && m.text === "Entrega em Juiz de Fora") && (
                  <button onClick={() => choose("Entrega em Juiz de Fora", "Sim. Posso orientar sobre a entrega e, para confirmar o endereço e a taxa, encaminhar você para o WhatsApp.")} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] px-4 py-3 text-left text-sm font-bold hover:border-[#a7b86a]/50">
                    <span className="flex items-center gap-2"><MapPin size={16} /> Entrega em Juiz de Fora</span><ArrowRight size={16} className="text-[#a7b86a]" />
                  </button>
                )}
              </div>

              {messages.some((m) => m.text.includes("opções da Linha Fit")) && (
                <div className="space-y-2">
                  {catalogStatus === "loading" && <p className="rounded-xl border border-white/10 p-3 text-xs text-white/55">Carregando cardápio e preços oficiais...</p>}
                  {catalogStatus === "error" && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">Não foi possível carregar o catálogo. Tente novamente mais tarde ou fale com a equipe.</p>}
                  {catalogStatus === "ready" && fit.map((item) => (
                    <button key={item.name} onClick={() => add(item.name)} className={`w-full rounded-2xl border px-3 py-3 text-left ${selected.includes(item.name) ? "border-[#ef7d18] bg-[#ef7d18]/10" : "border-white/10 bg-white/[.025]"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div><div className="text-sm font-black">{item.name}</div><div className="mt-0.5 text-xs text-white/40">Fit • 350 g</div></div>
                        <div className="text-xs font-black text-[#ef7d18]">{formatBRL(item.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selected.length > 0 && (
                <div className="rounded-3xl border border-[#a7b86a]/25 bg-[#a7b86a]/[.07] p-4">
                  <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Seu pedido</div>
                  <div className="mt-2 text-sm text-white/65">{selected.length} marmita(s) selecionada(s)</div>
                  <div className="mt-1 text-lg font-black">R$ {total.toFixed(2).replace(".", ",")}</div>
                  <button disabled={catalogStatus !== "ready"} onClick={openWhatsApp} aria-label="Falar com a equipe Nutrifit pelo WhatsApp" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-4 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-50">
                    Finalizar no WhatsApp <MessageCircle size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-black/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] p-1.5">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} aria-label="Mensagem para o Assistente Nutrifit" placeholder="Digite sua mensagem..." className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-white/30" />
                <button onClick={send} aria-label="Enviar" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ef7d18] text-black"><Send size={17} /></button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/25"><ShoppingBag size={12} /> Atendimento Nutrifit • Juiz de Fora</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
