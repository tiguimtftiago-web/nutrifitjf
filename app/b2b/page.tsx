"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Handshake,
  MessageCircle,
  Stethoscope,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";

const whatsapp = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const reasons = [
  { icon: UtensilsCrossed, title: "Refeições prontas", text: "Uma solução prática para a rotina da equipe, sem depender de cozinha própria." },
  { icon: Users, title: "Atendimento para equipes", text: "Pedidos em quantidade para colaboradores, reuniões, eventos e operações." },
  { icon: CalendarDays, title: "Frequência flexível", text: "Organize o fornecimento conforme a rotina e a necessidade da empresa." },
  { icon: Truck, title: "Logística alinhada", text: "Combine volume, frequência e entrega em Juiz de Fora com a Nutrifit." },
];

const audiences = [
  { icon: Building2, title: "Escritórios e empresas", text: "Refeições para colaboradores durante a rotina de trabalho.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85" },
  { icon: Stethoscope, title: "Clínicas e consultórios", text: "Uma alternativa prática para equipes com agenda apertada.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85" },
  { icon: Dumbbell, title: "Academias e estúdios", text: "Alimentação pronta para equipes e parceiros do segmento fitness.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85" },
  { icon: Store, title: "Lojas, obras e operações", text: "Fornecimento para equipes que precisam de praticidade no dia a dia.", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85" },
];

const steps = [
  ["01", "Você informa a necessidade", "Quantidade, frequência e tipo de atendimento."],
  ["02", "A Nutrifit prepara a proposta", "Alinhamos volume, logística e condições."],
  ["03", "Combinamos o fornecimento", "Definimos entrega, pagamento e rotina."],
  ["04", "Sua empresa recebe", "As refeições chegam conforme o combinado."],
];

export default function B2BPage() {
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const value = (name: string, fallback = "Não informado") => {
      const item = form.get(name);
      const text = String(item ?? "").trim();
      return text || fallback;
    };

    const message = [
      "🟧 *NOVO LEAD B2B — NUTRIFIT*",
      "",
      "🏢 *DADOS DA EMPRESA*",
      `Empresa: ${value("empresa")}`,
      `CNPJ: ${value("cnpj")}`,
      `Segmento: ${value("segmento")}`,
      "",
      "👤 *RESPONSÁVEL*",
      `Nome: ${value("responsavel")}`,
      `WhatsApp: ${value("telefone")}`,
      `E-mail: ${value("email")}`,
      "",
      "🍱 *NECESSIDADE*",
      `Funcionários: ${value("funcionarios")}`,
      `Refeições estimadas: ${value("refeicoes")}`,
      `Frequência: *${value("frequencia") }*`,
      `Tipo de atendimento: *${value("tipo") }*`,
      "",
      "📝 *OBSERVAÇÕES*",
      value("observacoes", "Nenhuma"),
      "",
      "━━━━━━━━━━━━━━━━━━",
      "🟢 *LEAD RECEBIDO PELO SITE*",
      "📍 Nutrifit Empresas",
      "📋 Solicitação de proposta",
    ].join("\n");

    try {
      const payload = {
        company: String(form.get("empresa") || ""),
        cnpj: String(form.get("cnpj") || ""),
        contact_name: String(form.get("responsavel") || ""),
        whatsapp: String(form.get("telefone") || ""),
        email: String(form.get("email") || ""),
        segment: String(form.get("segmento") || ""),
        employees: String(form.get("funcionarios") || ""),
        estimated_meals: String(form.get("refeicoes") || ""),
        frequency: String(form.get("frequencia") || ""),
        service_type: String(form.get("tipo") || ""),
        notes: String(form.get("observacoes") || ""),
      };

      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase não configurado.");

      const response = await fetch(`${SUPABASE_URL}/rest/v1/b2b_leads`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha ao registrar lead.");

      setSent(true);
      window.open(whatsapp(message), "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      window.open(whatsapp(message), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
        <a href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.025] px-4 py-2 text-xs font-black text-white/60 transition hover:border-white/20 hover:text-white">
          <ArrowLeft size={15} /> Voltar para o site
        </a>

        <section className="mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-[#10130d] shadow-[0_30px_100px_rgba(0,0,0,.35)]">
          <div className="relative min-h-[560px] overflow-hidden">
            <img src="/images/nutrifit-b2b-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-65" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,7,.98)_0%,rgba(8,11,7,.88)_38%,rgba(8,11,7,.48)_72%,rgba(8,11,7,.28)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_52%,rgba(239,125,24,.12),transparent_32%)]" />
            <div className="relative flex min-h-[560px] flex-col justify-between p-7 sm:p-10 lg:p-14">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ef7d18]/25 bg-black/30 px-3.5 py-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ffab62] backdrop-blur"><Building2 size={14} /> Nutrifit para empresas</div>
                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[.98] tracking-[-.04em] sm:text-5xl lg:text-7xl">Alimentação de qualidade<span className="block text-[#ef7d18]">para sua equipe.</span></h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">Refeições práticas e equilibradas para empresas que querem facilitar a rotina dos colaboradores, com atendimento ajustado ao volume e à frequência de cada equipe.</p>
                <a href="#solicitar-proposta" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 text-sm font-black text-black shadow-[0_12px_35px_rgba(239,125,24,.22)] transition hover:-translate-y-0.5 hover:brightness-105">Solicitar proposta <ArrowRight size={17} /></a>
              </div>
              <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 backdrop-blur-md"><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">Nutrifit Empresas</div><div className="mt-1 text-sm font-bold text-white/75">Alimentação para a rotina da sua equipe</div></div>
                <div className="hidden items-center gap-2 text-xs font-bold text-white/45 md:flex"><CheckCircle2 size={17} className="text-[#a7b86a]" /> Atendimento corporativo em Juiz de Fora</div>
              </div>
            </div>
          </div>

          <section className="border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="max-w-2xl"><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Por que escolher a Nutrifit?</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Uma estrutura pensada para a rotina da empresa.</h2></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{reasons.map(({ icon: Icon, title, text }) => <div key={title} className="group rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 transition hover:-translate-y-0.5 hover:border-[#a7b86a]/30 hover:bg-[#a7b86a]/[.04]"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a7b86a]/10 text-[#a7b86a]"><Icon size={21} /></div><h3 className="mt-5 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{text}</p></div>)}</div>
          </section>

          <section className="border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Para quem é</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Alimentação que acompanha diferentes equipes.</h2></div><p className="max-w-md text-sm leading-6 text-white/45">Para empresas que querem oferecer refeições aos colaboradores ou precisam de alimentação para reuniões, eventos e operações recorrentes.</p></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(({ icon: Icon, title, text, image }) => <article key={title} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#11140e]"><div className="relative h-44 overflow-hidden"><img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#11140e] via-transparent to-transparent" /><div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/55 text-[#ef7d18] backdrop-blur"><Icon size={18} /></div></div><div className="p-5"><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{text}</p></div></article>)}</div>
          </section>

          <section className="border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-6 sm:p-8 lg:p-10"><div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">Como funciona</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Simples para sua empresa.</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/50">Você conta o que precisa e a Nutrifit organiza o atendimento de acordo com a sua operação.</p></div><div className="grid gap-5 sm:grid-cols-2">{steps.map(([number, title, text]) => <div key={number} className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ef7d18] text-xs font-black text-black">{number}</div><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-white/45">{text}</p></div></div>)}</div></div></div>
          </section>

          <section className="border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-[#11140e]"><div className="absolute inset-0 bg-[linear-gradient(90deg,#171d10_0%,#171d10_43%,rgba(23,29,16,.78)_66%,rgba(23,29,16,.18)_100%)]" /><div className="absolute right-[-3%] bottom-[-20%] hidden h-[360px] w-[360px] rotate-[-8deg] md:block"><img src="/images/nutrifit-fit-350-frango-com-pure-de-batata-inglesa.png" alt="" className="h-full w-full object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,.55)]" /></div><div className="relative max-w-2xl p-7 sm:p-10 lg:p-12"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef7d18] text-black"><ClipboardList size={21} /></div><span className="mt-5 block text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Atendimento corporativo</span><h2 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-5xl">Sua empresa precisa de refeições para a equipe?</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/50 sm:text-base">Solicite uma proposta e conte para a Nutrifit o volume, a frequência e o tipo de atendimento que sua empresa precisa.</p><a href="#solicitar-proposta" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 text-sm font-black text-black transition hover:brightness-105">Solicite uma proposta <ArrowRight size={17} /></a></div></div>
          </section>

          <section id="solicitar-proposta" className="scroll-mt-8 border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_.55fr]">
              <form onSubmit={submit} className="grid gap-4">
                <div><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Solicite uma proposta</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Conte o que sua empresa precisa.</h2><p className="mt-2 text-sm leading-6 text-white/45">Ao enviar, o WhatsApp da Nutrifit será aberto com os dados preenchidos.</p></div>
                <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Empresa *<input required name="empresa" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome da empresa" /></label><label className="grid gap-2 text-sm font-bold">CNPJ<input name="cnpj" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="00.000.000/0000-00" /></label></div>
                <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Responsável *<input required name="responsavel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome do responsável" /></label><label className="grid gap-2 text-sm font-bold">WhatsApp *<input required name="telefone" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="(32) 99999-9999" /></label></div>
                <label className="grid gap-2 text-sm font-bold">E-mail comercial *<input required type="email" name="email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="contato@empresa.com.br" /></label>
                <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Segmento<input name="segmento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: escritório, indústria, clínica" /></label><label className="grid gap-2 text-sm font-bold">Nº de funcionários<input name="funcionarios" type="number" min="1" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 50" /></label></div>
                <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Refeições estimadas<input name="refeicoes" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 30 por dia" /></label><fieldset className="grid gap-2 text-sm font-bold"><legend>Frequência</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{["Diária", "Semanal", "Quinzenal", "Mensal", "Conforme demanda"].map((option) => <label key={option} className="cursor-pointer"><input type="radio" name="frequencia" value={option} className="peer sr-only" /><span className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-bold text-white/60 transition peer-checked:border-[#a7b86a] peer-checked:bg-[#a7b86a]/15 peer-checked:text-[#d9e5a5] hover:border-white/20 hover:bg-white/[.08]">{option}</span></label>)}</div></fieldset></div>
                <fieldset className="grid gap-2 text-sm font-bold"><legend>Tipo de atendimento</legend><div className="grid gap-2 sm:grid-cols-2">{["Refeições para colaboradores", "Reuniões", "Eventos", "Equipe / operação", "Outro"].map((option) => <label key={option} className="cursor-pointer"><input type="radio" name="tipo" value={option} className="peer sr-only" /><span className="flex min-h-12 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/60 transition peer-checked:border-[#ef7d18] peer-checked:bg-[#ef7d18]/10 peer-checked:text-[#ffb56f] hover:border-white/20 hover:bg-white/[.08]">{option}</span></label>)}</div></fieldset>
                <label className="grid gap-2 text-sm font-bold">Observações<textarea name="observacoes" rows={4} className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Horários, endereço, necessidades da equipe ou outros detalhes." /></label>
                <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 font-black text-black transition hover:-translate-y-0.5 hover:brightness-105"><MessageCircle size={18} /> Quero receber uma proposta</button>
                {sent && <div className="flex items-center gap-2 rounded-2xl border border-[#a7b86a]/30 bg-[#171d10] p-4 text-sm text-white/70"><CheckCircle2 className="shrink-0 text-[#a7b86a]" size={19} /> Solicitação preparada. O WhatsApp da Nutrifit foi aberto com os dados para atendimento.</div>}
              </form>
              <aside className="h-fit overflow-hidden rounded-[2rem] border border-[#ef7d18]/20 bg-[#171d10]"><div className="relative h-48"><img src="/images/nutrifit-fit-350-frango-com-pure-de-batata-inglesa.png" alt="" className="h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-[#171d10] via-[#171d10]/15 to-transparent" /></div><div className="p-6 md:p-7"><div className="flex items-center gap-3"><Handshake className="text-[#ef7d18]" size={22} /><h2 className="text-xl font-black">Atendimento corporativo</h2></div><p className="mt-4 text-sm leading-6 text-white/50">Envie sua necessidade. A equipe da Nutrifit poderá avaliar o volume e alinhar diretamente com você os detalhes do fornecimento.</p><div className="mt-6 grid gap-3">{["Volume e frequência sob consulta", "Atendimento em Juiz de Fora", "Proposta alinhada à necessidade"].map((item) => <div key={item} className="flex items-start gap-2 text-sm text-white/65"><Check size={16} className="mt-0.5 shrink-0 text-[#a7b86a]" />{item}</div>)}</div><a href="https://wa.me/5532998030038" target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-5 py-3.5 text-sm font-black text-[#d9e5a5] transition hover:bg-[#a7b86a]/15"><MessageCircle size={17} /> Falar com a Nutrifit</a></div></aside>
            </div>
          </section>

          <footer className="border-t border-white/10 px-6 py-7 sm:px-10"><div className="flex flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span className="font-bold">Nutrifit • Juiz de Fora/MG</span><span>Atendimento corporativo • Propostas sob consulta</span></div></footer>
        </section>
      </div>
    </main>
  );
}
