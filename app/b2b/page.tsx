"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, MessageCircle, PackageCheck, Truck, Users } from "lucide-react";

const whatsapp = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export default function B2BPage() {
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "🏢 SOLICITAÇÃO DE PROPOSTA B2B NUTRIFIT",
      "",
      `Empresa: ${form.get("empresa")}`,
      `CNPJ: ${form.get("cnpj") || "Não informado"}`,
      `Responsável: ${form.get("responsavel")}`,
      `WhatsApp: ${form.get("telefone")}`,
      `E-mail: ${form.get("email")}`,
      `Segmento: ${form.get("segmento") || "Não informado"}`,
      `Funcionários: ${form.get("funcionarios") || "Não informado"}`,
      `Refeições estimadas: ${form.get("refeicoes") || "Não informado"}`,
      `Frequência: ${form.get("frequencia") || "Não informado"}`,
      `Tipo de atendimento: ${form.get("tipo") || "Não informado"}`,
      "",
      `Observações: ${form.get("observacoes") || "Nenhuma"}`,
    ].join("\n");

    try {
      const payload = {
        company: String(form.get("empresa") || ""), cnpj: String(form.get("cnpj") || ""),
        contact_name: String(form.get("responsavel") || ""), whatsapp: String(form.get("telefone") || ""),
        email: String(form.get("email") || ""), segment: String(form.get("segmento") || ""),
        employees: String(form.get("funcionarios") || ""), estimated_meals: String(form.get("refeicoes") || ""),
        frequency: String(form.get("frequencia") || ""), service_type: String(form.get("tipo") || ""),
        notes: String(form.get("observacoes") || ""),
      };
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase não configurado.");
      const response = await fetch(`${SUPABASE_URL}/rest/v1/b2b_leads`, {
        method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(payload),
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
    <main className="min-h-screen bg-[#080a07] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white">
          <ArrowLeft size={16} /> Voltar para o site
        </a>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#10130d]">
          <div className="border-b border-white/10 bg-gradient-to-br from-[#171d10] to-[#0d100c] p-7 md:p-12">
            <div className="flex items-center gap-3 text-[#ef7d18]">
              <Building2 size={25} />
              <span className="text-xs font-black uppercase tracking-[.2em]">Nutrifit para empresas</span>
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-black md:text-6xl">
              Refeições para sua equipe, sem complicação.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
              A Nutrifit atende empresas em Juiz de Fora com marmitas, saladas e outras opções
              para equipes, reuniões, eventos e demandas recorrentes.
            </p>
            <a
              href="#solicitar-proposta"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3.5 text-sm font-black text-black"
            >
              <MessageCircle size={18} /> Solicitar proposta
            </a>
          </div>

          <div className="grid gap-3 border-b border-white/10 p-6 md:grid-cols-4 md:p-8">
            {[
              [PackageCheck, "Refeições prontas", "Opções para diferentes perfis de equipe."],
              [Users, "Pedidos em quantidade", "Atendimento para demandas corporativas."],
              [Truck, "Entrega em Juiz de Fora", "Combine logística e frequência com a equipe."],
              [MessageCircle, "Proposta personalizada", "Condições alinhadas ao seu volume."],
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
                <Icon size={21} className="text-[#a7b86a]" />
                <h2 className="mt-3 font-black">{title as string}</h2>
                <p className="mt-1 text-sm leading-6 text-white/45">{text as string}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 border-b border-white/10 p-6 md:grid-cols-[1.1fr_.9fr] md:p-10">
            <div>
              <span className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Para quem é</span>
              <h2 className="mt-2 text-3xl font-black">Uma solução para a rotina da empresa</h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/50">
                Ideal para empresas que querem oferecer refeições aos colaboradores ou precisam
                de alimentação para reuniões, eventos, equipes e operações recorrentes.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Escritórios", "Clínicas", "Academias", "Lojas", "Indústrias", "Obras", "Eventos", "Reuniões"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[.035] px-3.5 py-2 text-xs font-bold text-white/70">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#a7b86a]/20 bg-[#171d10] p-6">
              <h2 className="text-2xl font-black">Como funciona</h2>
              <div className="mt-6 grid gap-5">
                {[
                  ["01", "Você informa a necessidade", "Quantidade, frequência e tipo de refeição."],
                  ["02", "A Nutrifit prepara a proposta", "Alinhamos volume, logística e condições."],
                  ["03", "Combinamos o fornecimento", "Definimos entrega, pagamento e rotina."],
                  ["04", "Sua empresa recebe as refeições", "Atendimento conforme o combinado."],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex gap-4">
                    <span className="text-sm font-black text-[#ef7d18]">{number}</span>
                    <div>
                      <h3 className="font-black">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/45">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="solicitar-proposta" className="grid scroll-mt-24 gap-8 p-6 md:grid-cols-[1fr_.7fr] md:p-10">
            <form onSubmit={submit} className="grid gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Solicite uma proposta</span>
                <h2 className="mt-2 text-3xl font-black">Conte o que sua empresa precisa</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">Ao enviar, o WhatsApp da Nutrifit será aberto com os dados preenchidos.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Empresa *
                  <input required name="empresa" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Nome da empresa" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  CNPJ
                  <input name="cnpj" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="00.000.000/0000-00" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Responsável *
                  <input required name="responsavel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Nome do responsável" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  WhatsApp *
                  <input required name="telefone" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="(32) 99999-9999" />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold">
                E-mail comercial *
                <input required type="email" name="email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="contato@empresa.com.br" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Segmento
                  <input name="segmento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Ex.: escritório, indústria, clínica" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Nº de funcionários
                  <input name="funcionarios" type="number" min="1" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Ex.: 50" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Refeições estimadas
                  <input name="refeicoes" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Ex.: 30 por dia" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Frequência
                  <select name="frequencia" defaultValue="" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]">
                    <option value="" disabled>Selecione</option>
                    <option>Diária</option>
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Conforme demanda</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold">
                Tipo de atendimento
                <select name="tipo" defaultValue="" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]">
                  <option value="" disabled>Selecione</option>
                  <option>Refeições para colaboradores</option>
                  <option>Reuniões</option>
                  <option>Eventos</option>
                  <option>Equipe / operação</option>
                  <option>Outro</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Observações
                <textarea name="observacoes" rows={4} className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Horários, endereço, necessidades da equipe ou outros detalhes." />
              </label>

              <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 font-black text-black hover:brightness-105">
                <MessageCircle size={18} /> Quero receber uma proposta
              </button>

              {sent && (
                <div className="flex items-center gap-2 rounded-2xl border border-[#a7b86a]/30 bg-[#171d10] p-4 text-sm text-white/70">
                  <CheckCircle2 className="shrink-0 text-[#a7b86a]" size={19} />
                  Solicitação preparada. O WhatsApp da Nutrifit foi aberto com os dados para atendimento.
                </div>
              )}
            </form>

            <aside className="h-fit rounded-3xl border border-[#ef7d18]/20 bg-[#171d10] p-6 md:p-7">
              <div className="flex items-center gap-3">
                <Building2 className="text-[#ef7d18]" size={22} />
                <h2 className="text-xl font-black">Atendimento corporativo</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/50">
                Envie sua necessidade. A equipe da Nutrifit poderá avaliar o volume e alinhar
                diretamente com você os detalhes do fornecimento.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-[#a7b86a]">Importante</div>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  A proposta é definida conforme quantidade, frequência, logística e necessidade
                  da empresa.
                </p>
              </div>
              <a href="https://wa.me/5532998030038" target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-5 py-3.5 text-sm font-black text-[#d9e5a5]">
                <MessageCircle size={17} /> Falar com a Nutrifit
              </a>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
