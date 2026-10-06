"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Send, X, ArrowRight, MapPin, ShoppingBag, UserRound } from "lucide-react";

type Msg = { role: "assistant" | "user"; text: string };

const fit = [
  ["Patinho com Abóbora", "R$ 23,97"],
  ["Patinho com Batata-Doce", "R$ 23,97"],
  ["Patinho com Legumes na Manteiga", "R$ 23,97"],
  ["Frango Grelhado com Mix de Legumes", "R$ 23,97"],
  ["Carne Acebolada com Legumes", "R$ 23,97"],
  ["Frango ao Molho de Ervas com Legumes", "R$ 23,97"],
  ["Lombo Suíno com Legumes Assados", "R$ 23,97"],
  ["Pernil Acebolado com Batata Inglesa", "R$ 23,97"],
  ["Frango com Purê de Batata Inglesa", "R$ 23,97"],
  ["Frango ao Molho de Mostarda com Batata", "R$ 23,97"],
  ["Escondidinho de Patinho Fit", "R$ 23,97"],
  ["Frango Empanado Assado com Arroz Integral", "R$ 23,97"],
  ["Pernil Desfiado ao Molho com Arroz Integral", "R$ 23,97"],
] as const;

const combos = [
  ["5 marmitas", "R$ 117,00"],
  ["7 marmitas", "R$ 164,00"],
  ["10 marmitas", "R$ 235,00"],
  ["14 marmitas", "R$ 328,00"],
] as const;

const wa = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

export default function AssistenteNutrifitPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Olá! 👋 Eu sou o assistente da Nutrifit. Posso ajudar você a escolher suas marmitas, montar um combo ou tirar dúvidas. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const total = useMemo(() => selected.reduce((sum, name) => {
    const item = fit.find(([n]) => n === name);
    return sum + (item ? 23.97 : 0);
  }, 0), [selected]);

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
      answer = "Perfeito. O combo Fit de 10 marmitas custa R$ 235,00. Você pode escolher as marmitas e variar os sabores.";
    } else if (normalized.includes("entrega") || normalized.includes("juiz")) {
      answer = "A Nutrifit atende Juiz de Fora. Posso te orientar sobre a entrega ou encaminhar você para o WhatsApp para confirmar o endereço.";
    } else if (normalized.includes("preço") || normalized.includes("preco")) {
      answer = "Na Linha Fit 350 g, as marmitas mostradas aqui estão em R$ 23,97 cada. Também temos combos com desconto.";
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
    window.open(wa(`Olá Nutrifit! Quero finalizar meu pedido. ${list}. Total parcial: R$ ${total.toFixed(2).replace(".", ",")}.`), "_blank");
  };

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1fr_440px]">
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

        <section className="flex min-h-screen items-center justify-center p-3 sm:p-6">
          <div className="flex h-[min(850px,calc(100vh-24px))] w-full max-w-md flex-col overflow-hidden rounded-[34px] border border-white/10 bg-[#0d100c] shadow-2xl">
            <header className="flex items-center gap-3 border-b border-white/10 bg-black/40 px-5 py-4">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-[#ef7d18]/40 bg-black text-sm font-black">
                <span className="text-[#a7b86a]">NF</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black">Assistente Nutrifit</div>
                <div className="flex items-center gap-1.5 text-xs text-[#a7b86a]"><span className="h-1.5 w-1.5 rounded-full bg-[#a7b86a]" /> Online agora</div>
              </div>
              <X size={18} className="text-white/30" />
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
                  {fit.map(([name, price]) => (
                    <button key={name} onClick={() => add(name)} className={`w-full rounded-2xl border px-3 py-3 text-left ${selected.includes(name) ? "border-[#ef7d18] bg-[#ef7d18]/10" : "border-white/10 bg-white/[.025]"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div><div className="text-sm font-black">{name}</div><div className="mt-0.5 text-xs text-white/40">Fit • 350 g</div></div>
                        <div className="text-xs font-black text-[#ef7d18]">{price}</div>
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
                  <button onClick={openWhatsApp} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-4 py-3 font-black text-black">
                    Finalizar no WhatsApp <MessageCircle size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-black/30 p-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] p-1.5">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Digite sua mensagem..." className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-white/30" />
                <button onClick={send} aria-label="Enviar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ef7d18] text-black"><Send size={17} /></button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/25"><ShoppingBag size={12} /> Atendimento Nutrifit • Juiz de Fora</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
