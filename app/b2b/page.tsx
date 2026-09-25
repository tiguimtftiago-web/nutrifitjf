"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, MessageCircle } from "lucide-react";

const whatsapp = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

export default function B2BPage() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "🏢 CADASTRO B2B NUTRIFIT",
      "",
      `Empresa: ${form.get("empresa")}`,
      `CNPJ: ${form.get("cnpj") || "Não informado"}`,
      `Responsável: ${form.get("responsavel")}`,
      `WhatsApp: ${form.get("telefone")}`,
      `E-mail: ${form.get("email")}`,
      `Segmento: ${form.get("segmento")}`,
      `Funcionários: ${form.get("funcionarios")}`,
      `Refeições estimadas: ${form.get("refeicoes")}`,
      `Frequência: ${form.get("frequencia")}`,
      "",
      `Observações: ${form.get("observacoes") || "Nenhuma"}`,
    ].join("\n");

    setSent(true);
    window.open(whatsapp(message), "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-[#080a07] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white">
          <ArrowLeft size={16} /> Voltar para o site
        </a>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#10130d]">
          <div className="border-b border-white/10 bg-gradient-to-br from-[#171d10] to-[#0d100c] p-7 md:p-12">
            <div className="flex items-center gap-3 text-[#ef7d18]">
              <Building2 size={25} />
              <span className="text-xs font-black uppercase tracking-[.2em]">Nutrifit B2B</span>
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-black md:text-6xl">
              Alimentação para sua empresa
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
              Cadastre sua empresa e conte para a Nutrifit o que sua equipe precisa.
              O atendimento comercial entra em contato para alinhar quantidade, frequência,
              entrega e condições do fornecimento.
            </p>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_.7fr] md:p-10">
            <form onSubmit={submit} className="grid gap-4">
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
                Observações
                <textarea name="observacoes" rows={4} className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Conte sobre horários, endereço, necessidades da equipe ou outros detalhes." />
              </label>

              <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 font-black text-black hover:brightness-105">
                <MessageCircle size={18} /> Enviar cadastro B2B
              </button>

              {sent && (
                <div className="flex items-center gap-2 rounded-2xl border border-[#a7b86a]/30 bg-[#171d10] p-4 text-sm text-white/70">
                  <CheckCircle2 className="shrink-0 text-[#a7b86a]" size={19} />
                  Cadastro preparado. O WhatsApp da Nutrifit foi aberto com os dados para atendimento.
                </div>
              )}
            </form>

            <aside className="h-fit rounded-3xl border border-[#a7b86a]/20 bg-[#171d10] p-6 md:p-7">
              <h2 className="text-2xl font-black">Como funciona</h2>
              <div className="mt-6 grid gap-5">
                {[
                  ["01", "Cadastre a empresa", "Informe os dados básicos e a necessidade de refeições."],
                  ["02", "Fale com a Nutrifit", "O cadastro abre uma conversa comercial no WhatsApp."],
                  ["03", "Monte o fornecimento", "Alinhe quantidade, frequência, entrega e condições."],
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
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
