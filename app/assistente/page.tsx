"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, MapPin, MessageCircle, Send, ShoppingBag, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const initialMessages: Message[] = [{
  role: "assistant",
  content: "Olá! Eu sou o assistente virtual da Nutrifit. Posso consultar nosso cardápio e combos, ajudar você a escolher e encaminhar seu atendimento para a equipe. O que gostaria de saber?"
}];

export default function AssistenteNutrifitPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  async function sendMessage(value: string) {
    const text = value.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível responder agora.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  const quickActions = [
    { label: "Ver cardápio", prompt: "Consulte o cardápio ativo da Nutrifit e me mostre as opções.", icon: "🍱" },
    { label: "Conhecer os combos", prompt: "Quais combos estão disponíveis e quais são os preços?", icon: "📦" },
    { label: "Entrega", prompt: "Como funciona a entrega da Nutrifit em Juiz de Fora?", icon: "📍" },
    { label: "Falar com a equipe", prompt: "Quero falar com um atendente humano.", icon: "💬" }
  ];

  return (
    <main className="min-h-[100dvh] bg-[#080a07] text-white">
      <div className="mx-auto grid min-h-[100dvh] max-w-6xl lg:grid-cols-[1fr_440px]">
        <section className="hidden flex-col justify-center px-8 py-12 lg:flex xl:px-16">
          <div className="text-xs font-black uppercase tracking-[.24em] text-[#ef7d18]">Atendimento inteligente</div>
          <h1 className="mt-4 max-w-xl text-6xl font-black leading-[.95]">Nutrifit, com informação do catálogo em tempo real.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/50">
            Tire dúvidas sobre produtos e combos cadastrados. Para confirmar entrega, pedidos ou atendimento nutricional, nossa equipe continua disponível no WhatsApp.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {quickActions.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
                <div className="text-2xl">{item.icon}</div>
                <div className="mt-3 font-black">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[100dvh] items-center justify-center p-2 sm:p-6">
          <div className="flex h-[min(850px,calc(100dvh-16px))] w-full max-w-md flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0d100c] shadow-2xl sm:rounded-[34px]">
            <header className="flex items-center gap-3 border-b border-white/10 bg-black/40 px-5 py-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[#ef7d18]/55 bg-black">
                <img src="/images/nutrifit-logo-icon.svg" alt="Logo Nutrifit" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black">Assistente Nutrifit</div>
                <div className="flex items-center gap-1.5 text-xs text-[#a7b86a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a7b86a]" /> Atendimento virtual
                </div>
              </div>
              <button type="button" onClick={() => router.replace("/")} aria-label="Fechar atendimento e voltar ao site" title="Fechar atendimento" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7b86a]">
                <X size={21} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#a7b86a] text-black" : "rounded-bl-md bg-white/[.06] text-white/85"}`}>
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-3xl rounded-bl-md bg-white/[.06] px-4 py-3 text-sm text-white/55">
                    <LoaderCircle size={15} className="animate-spin" /> Consultando informações...
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-[#ef7d18]/30 bg-[#ef7d18]/10 p-3 text-sm text-white/80">
                  {error}
                  <button onClick={() => void sendMessage(messages[messages.length - 1]?.content || "Pode me ajudar?")} className="ml-2 font-bold text-[#ef9a4b] underline">Tentar novamente</button>
                </div>
              )}

              {messages.length === 1 && (
                <div className="grid gap-2 pt-2">
                  {quickActions.map((item) => (
                    <button key={item.label} onClick={() => void sendMessage(item.prompt)} disabled={loading} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] px-4 py-3 text-left text-sm font-bold transition hover:border-[#a7b86a]/50 disabled:opacity-50">
                      <span>{item.icon} {item.label}</span>
                      <ArrowRight size={16} className="text-[#a7b86a]" />
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-white/10 bg-black/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] p-1.5">
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Digite sua mensagem..." maxLength={2000} disabled={loading} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-white/30 disabled:opacity-50" />
                <button type="submit" disabled={loading || !input.trim()} aria-label="Enviar mensagem" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ef7d18] text-black disabled:opacity-40">
                  <Send size={17} />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/25">
                <ShoppingBag size={12} /> Nutrifit • Juiz de Fora
                <a href="https://wa.me/5532998030038" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#a7b86a]"><MessageCircle size={12} /> WhatsApp</a>
                <span className="hidden"><MapPin size={12} /></span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
