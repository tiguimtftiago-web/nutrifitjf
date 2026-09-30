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

    const yesNo = (name: string) => form.get(name) === "sim" ? "Sim" : "Não";
    const selectedDays = form.getAll("dias").map(String);
    if (!selectedDays.length) {
      alert("Selecione pelo menos um dia de fornecimento.");
      return;
    }
    const days = selectedDays.join(", ");
    const billingAddress = form.get("cobranca_mesmo_endereco") === "sim"
      ? "Mesmo da entrega"
      : `${value("cobranca_rua")}, nº ${value("cobranca_numero")}, ${value("cobranca_bairro")}, ${value("cobranca_cidade")}`;

    const message = [
      "🟧 *NOVO LEAD B2B — NUTRIFIT*",
      "",
      "🏢 *1. DADOS DA EMPRESA*",
      `Nome fantasia: ${value("empresa")}`,
      `Razão social: ${value("razao_social")}`,
      `CNPJ: ${value("cnpj")}`,
      `Inscrição Estadual: ${value("inscricao_estadual")}`,
      `Inscrição Municipal: ${value("inscricao_municipal")}`,
      `Segmento: ${value("segmento")}`,
      `Funcionários: ${value("funcionarios")}`,
      `Site: ${value("site")}`,
      "",
      "👤 *2. RESPONSÁVEIS*",
      `Responsável pelo atendimento: ${value("responsavel")}`,
      `Cargo: ${value("cargo")}`,
      `WhatsApp: ${value("telefone")}`,
      `Telefone alternativo: ${value("telefone_alternativo")}`,
      `E-mail: ${value("email")}`,
      `Responsável pela aprovação: ${value("aprovador")}`,
      `WhatsApp do aprovador: ${value("aprovador_whatsapp")}`,
      `E-mail do aprovador: ${value("aprovador_email")}`,
      "",
      "📍 *3. ENDEREÇO DE ENTREGA*",
      `CEP: ${value("cep")}`,
      `Endereço: ${value("rua")}, nº ${value("numero")}`,
      `Complemento: ${value("complemento")}`,
      `Bloco: ${value("bloco")}`,
      `Andar: ${value("andar")}`,
      `Sala: ${value("sala")}`,
      `Galpão: ${value("galpao")}`,
      `Bairro: ${value("bairro")}`,
      `Cidade/UF: ${value("cidade")}/${value("estado")}`,
      `Referência: ${value("referencia")}`,
      `Portaria/recepção: ${yesNo("portaria")}`,
      `Exige identificação: ${yesNo("identificacao")}`,
      `Quem recebe: ${value("recebedor")}`,
      `Telefone do recebimento: ${value("telefone_recebedor")}`,
      `Instruções de entrega: ${value("instrucoes_entrega")}`,
      "",
      "🍱 *4. PEDIDO E OPERAÇÃO*",
      `Tipo de refeição: ${value("tipo_refeicao")}`,
      `Linha: ${value("linha")}`,
      `Refeições estimadas/dia: ${value("refeicoes")}`,
      `Dias: ${days}`,
      `Frequência: ${value("frequencia")}`,
      `Horário de entrega: ${value("horario_entrega")}`,
      `Horário limite: ${value("horario_limite")}`,
      `Horário de consumo: ${value("horario_consumo")}`,
      `Intervalo da equipe: ${value("intervalo")}`,
      `Entregas por dia: ${value("entregas_dia")}`,
      `Entrega: ${value("modo_entrega")}`,
      `Mais de um endereço: ${yesNo("multiplos_enderecos")}`,
      `Outros endereços: ${value("outros_enderecos")}`,
      "",
      "🥗 *5. CARDÁPIO E RESTRIÇÕES*",
      `Preferências de cardápio: ${value("preferencias_cardapio")}`,
      `Refeições especiais: ${value("refeicoes_especiais")}`,
      `Restrições alimentares: ${value("restricoes")}`,
      `Alergias informadas: ${value("alergias")}`,
      "",
      "💰 *6. FATURAMENTO E PAGAMENTO*",
      `Nota fiscal: ${yesNo("nota_fiscal")}`,
      `E-mail da NF: ${value("email_nf")}`,
      `Financeiro: ${value("financeiro_nome")}`,
      `Telefone financeiro: ${value("financeiro_telefone")}`,
      `E-mail financeiro: ${value("financeiro_email")}`,
      `Forma de pagamento: ${value("forma_pagamento")}`,
      `Prazo: ${value("prazo_pagamento")}`,
      `Exige pedido de compra: ${yesNo("pedido_compra")}`,
      `Processo de aprovação: ${value("processo_aprovacao")}`,
      `Endereço de cobrança: ${value("cobranca_mesmo_endereco") === "sim" ? "Mesmo da entrega" : "Diferente da entrega"}`,
      `Endereço cobrança: ${value("cobranca_endereco")}`,
      "",
      "📅 *7. INÍCIO DO FORNECIMENTO*",
      `Início desejado: ${value("data_inicio")}`,
      `Primeiro pedido: ${value("primeiro_pedido")}`,
      "",
      "📝 *8. OBSERVAÇÕES*",
      value("observacoes", "Nenhuma"),
      "",
      "━━━━━━━━━━━━━━━━━━",
      "🟢 *LEAD RECEBIDO PELO SITE*",
      "📍 Nutrifit Empresas",
      "📋 Cadastro completo para proposta",
    ].join("\n");

    const payload = {
      company: value("empresa", ""), trade_name: value("empresa", ""), legal_name: value("razao_social", ""), cnpj: value("cnpj", ""),
      state_registration: value("inscricao_estadual", ""), municipal_registration: value("inscricao_municipal", ""), website: value("site", ""),
      contact_name: value("responsavel", ""), contact_role: value("cargo", ""), whatsapp: value("telefone", ""), alternate_phone: value("telefone_alternativo", ""), email: value("email", ""),
      approval_contact_name: value("aprovador", ""), approval_contact_whatsapp: value("aprovador_whatsapp", ""), approval_contact_email: value("aprovador_email", ""),
      segment: value("segmento", ""), employees: value("funcionarios", ""),
      cep: value("cep", ""), street: value("rua", ""), street_number: value("numero", ""), complement: value("complemento", ""), block: value("bloco", ""), floor: value("andar", ""), room: value("sala", ""), warehouse: value("galpao", ""), neighborhood: value("bairro", ""), city: value("cidade", ""), state: value("estado", ""), address_reference: value("referencia", ""),
      has_reception: form.get("portaria") === "sim", requires_identification: form.get("identificacao") === "sim", receiver_name: value("recebedor", ""), receiver_phone: value("telefone_recebedor", ""), delivery_notes: value("instrucoes_entrega", ""),
      meal_type: value("tipo_refeicao", ""), delivery_days: days, delivery_time: value("horario_entrega", ""), delivery_deadline: value("horario_limite", ""), consumption_time: value("horario_consumo", ""), employee_break_time: value("intervalo", ""), meal_line: value("linha", ""),
      menu_preferences: value("preferencias_cardapio", ""), special_meals: value("refeicoes_especiais", ""), dietary_restrictions: value("restricoes", ""), allergies: value("alergias", ""), estimated_meals: value("refeicoes", ""),
      billing_same_as_delivery: form.get("cobranca_mesmo_endereco") !== "nao", billing_cep: value("cobranca_cep", ""), billing_street: value("cobranca_rua", ""), billing_number: value("cobranca_numero", ""), billing_complement: value("cobranca_complemento", ""), billing_neighborhood: value("cobranca_bairro", ""), billing_city: value("cobranca_cidade", ""), billing_state: value("cobranca_estado", ""),
      invoice_required: form.get("nota_fiscal") === "sim", invoice_email: value("email_nf", ""), finance_contact_name: value("financeiro_nome", ""), finance_phone: value("financeiro_telefone", ""), finance_email: value("financeiro_email", ""), payment_method: value("forma_pagamento", ""), payment_terms: value("prazo_pagamento", ""), requires_purchase_order: form.get("pedido_compra") === "sim", approval_process: value("processo_aprovacao", ""),
      delivery_mode: value("modo_entrega", ""), deliveries_per_day: value("entregas_dia", ""), multiple_delivery_addresses: form.get("multiplos_enderecos") === "sim", additional_delivery_addresses: value("outros_enderecos", ""),
      start_date: value("data_inicio", "") || null, first_order_date: value("primeiro_pedido", "") || null, notes: value("observacoes", ""), data_confirmation: form.get("confirmacao_dados") === "sim", data_consent: form.get("consentimento") === "sim",
    };

    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase não configurado.");
      const response = await fetch(`${SUPABASE_URL}/rest/v1/b2b_leads`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
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
            <img src="https://media.canva.com/v2/image-resize/format:JPG/height:112/quality:75/uri:ifs%3A%2F%2FM%2F6c02fefc-3772-4ccf-b53b-89723b068035/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAMoQpFc86TQeIPMN6QiYEeCBYAlS936Y1DjseXlajoun&exp=1790823448&osig=AAAAAAAAAAAAAAAAAAAAACGtr-eQr6X862uH39T0IsSm14MPYEx2TMndt24CBCIS&signer=media-rpc&x-canva-quality=thumbnail" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-65" />
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
            <div className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#ef7d18]/20 bg-[#11140e]">
              <img
                src="/images/nutrifit-fit-350-frango-com-pure-de-batata-inglesa.png"
                alt="Marmita Nutrifit de frango com purê de batata inglesa"
                className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,20,14,.98)_0%,rgba(17,20,14,.93)_32%,rgba(17,20,14,.68)_55%,rgba(17,20,14,.18)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_52%,rgba(239,125,24,.18),transparent_28%)]" />
              <div className="relative z-10 flex min-h-[360px] items-center p-7 sm:p-10 lg:p-12">
                <div className="max-w-2xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef7d18] text-black shadow-[0_10px_30px_rgba(239,125,24,.2)]"><ClipboardList size={21} /></div>
                  <span className="mt-5 block text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Atendimento corporativo</span>
                  <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-5xl">Sua empresa precisa de refeições para a equipe?</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">Solicite uma proposta e conte para a Nutrifit o volume, a frequência e o tipo de atendimento que sua empresa precisa.</p>
                  <a href="#solicitar-proposta" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 text-sm font-black text-black shadow-[0_12px_30px_rgba(239,125,24,.2)] transition hover:-translate-y-0.5 hover:brightness-105">Solicite uma proposta <ArrowRight size={17} /></a>
                </div>
              </div>
            </div>
          </section>

          <section id="solicitar-proposta" className="scroll-mt-8 border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_.55fr]">
              <form onSubmit={submit} className="grid gap-5">
                <div><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Cadastro B2B completo</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Cadastre sua empresa para receber uma proposta.</h2><p className="mt-2 text-sm leading-6 text-white/45">Preencha os dados com atenção. As informações de entrega, operação e faturamento serão usadas para preparar o atendimento.</p></div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a]/10 text-[#a7b86a] font-black">1</div><div><h3 className="font-black">Dados da empresa</h3><p className="text-xs text-white/40">Identificação fiscal e comercial.</p></div></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">Nome fantasia *<input required name="empresa" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome usado pela empresa" /></label>
                    <label className="grid gap-2 text-sm font-bold">Razão social *<input required name="razao_social" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Razão social completa" /></label>
                    <label className="grid gap-2 text-sm font-bold">CNPJ *<input required name="cnpj" inputMode="numeric" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="00.000.000/0000-00" /></label>
                    <label className="grid gap-2 text-sm font-bold">Segmento *<input required name="segmento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: indústria, escritório, clínica" /></label>
                    <label className="grid gap-2 text-sm font-bold">Inscrição Estadual<input name="inscricao_estadual" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Se houver" /></label>
                    <label className="grid gap-2 text-sm font-bold">Inscrição Municipal<input name="inscricao_municipal" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Se houver" /></label>
                    <label className="grid gap-2 text-sm font-bold">Nº de funcionários *<input required name="funcionarios" type="number" min="1" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 40" /></label>
                    <label className="grid gap-2 text-sm font-bold">Site<input name="site" type="url" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="https://empresa.com.br" /></label>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a]/10 text-[#a7b86a] font-black">2</div><div><h3 className="font-black">Responsáveis</h3><p className="text-xs text-white/40">Contato operacional e pessoa que aprova a contratação.</p></div></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">Responsável pelo atendimento *<input required name="responsavel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome completo" /></label>
                    <label className="grid gap-2 text-sm font-bold">Cargo/Função<input name="cargo" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: RH, compras, administrativo" /></label>
                    <label className="grid gap-2 text-sm font-bold">WhatsApp *<input required name="telefone" inputMode="tel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="(32) 99999-9999" /></label>
                    <label className="grid gap-2 text-sm font-bold">Telefone alternativo<input name="telefone_alternativo" inputMode="tel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Telefone fixo ou outro contato" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">E-mail comercial *<input required type="email" name="email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="contato@empresa.com.br" /></label>
                    <label className="grid gap-2 text-sm font-bold">Responsável pela aprovação<input name="aprovador" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome do aprovador" /></label>
                    <label className="grid gap-2 text-sm font-bold">WhatsApp do aprovador<input name="aprovador_whatsapp" inputMode="tel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="(32) 99999-9999" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">E-mail do aprovador<input type="email" name="aprovador_email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="aprovador@empresa.com.br" /></label>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#ef7d18]/20 bg-[#17120d] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef7d18]/10 text-[#ef7d18] font-black">3</div><div><h3 className="font-black">Endereço de entrega</h3><p className="text-xs text-white/40">A parte mais importante para a logística.</p></div></div>
                  <div className="grid gap-4 md:grid-cols-6">
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">CEP *<input required name="cep" inputMode="numeric" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="00000-000" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-4">Rua/Avenida *<input required name="rua" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome da rua ou avenida" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Número *<input required name="numero" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 1500" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-4">Complemento<input name="complemento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Prédio, portão ou referência interna" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Bloco<input name="bloco" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: B" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Andar<input name="andar" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 2º" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Sala<input name="sala" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 204" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Galpão<input name="galpao" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: Galpão 2" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Bairro *<input required name="bairro" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Bairro" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Cidade *<input required name="cidade" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Juiz de Fora" /></label>
                    <label className="grid gap-2 text-sm font-bold">UF *<input required name="estado" maxLength={2} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="MG" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-6">Ponto de referência *<input required name="referencia" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Entrada pela portaria 2, ao lado de..." /></label>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <fieldset className="grid gap-2 text-sm font-bold"><legend>A empresa possui portaria/recepção?</legend><div className="flex gap-2">{["sim","nao"].map(v => <label key={v} className="cursor-pointer"><input type="radio" name="portaria" value={v} defaultChecked={v==="sim"} className="peer sr-only" /><span className="inline-flex min-w-20 justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs peer-checked:border-[#a7b86a] peer-checked:bg-[#a7b86a]/15">{v==="sim"?"Sim":"Não"}</span></label>)}</div></fieldset>
                    <fieldset className="grid gap-2 text-sm font-bold"><legend>É necessário se identificar?</legend><div className="flex gap-2">{["sim","nao"].map(v => <label key={v} className="cursor-pointer"><input type="radio" name="identificacao" value={v} defaultChecked={v==="sim"} className="peer sr-only" /><span className="inline-flex min-w-20 justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs peer-checked:border-[#a7b86a] peer-checked:bg-[#a7b86a]/15">{v==="sim"?"Sim":"Não"}</span></label>)}</div></fieldset>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">Quem recebe a entrega? *<input required name="recebedor" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome da pessoa ou setor" /></label>
                    <label className="grid gap-2 text-sm font-bold">Telefone do recebimento *<input required name="telefone_recebedor" inputMode="tel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="(32) 99999-9999" /></label>
                    <label className="grid gap-2 text-sm font-bold md:col-span-2">Instruções para o entregador<input name="instrucoes_entrega" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Portaria, estacionamento, elevador, local de entrega etc." /></label>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a]/10 text-[#a7b86a] font-black">4</div><div><h3 className="font-black">Pedido e operação</h3><p className="text-xs text-white/40">Dados que a produção e a entrega precisam saber.</p></div></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">Tipo de refeição *<select required name="tipo_refeicao" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option value="">Selecione</option><option>Almoço</option><option>Jantar</option><option>Café da manhã</option><option>Lanche</option><option>Outro</option></select></label>
                    <label className="grid gap-2 text-sm font-bold">Linha desejada *<select required name="linha" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option value="">Selecione</option><option>Fit 350 g</option><option>Performance 450 g</option><option>Traditional 500 g</option><option>Personalizado</option></select></label>
                    <label className="grid gap-2 text-sm font-bold">Refeições estimadas por dia *<input required name="refeicoes" type="number" min="1" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 30" /></label>
                    <label className="grid gap-2 text-sm font-bold">Frequência *<select required name="frequencia" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option value="">Selecione</option><option>Diária</option><option>Semanal</option><option>Quinzenal</option><option>Mensal</option><option>Conforme demanda</option></select></label>
                  </div>
                  <fieldset className="mt-4 grid gap-2 text-sm font-bold"><legend>Dias de fornecimento *</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"].map(day => <label key={day} className="cursor-pointer"><input type="checkbox" name="dias" value={day} className="peer sr-only" /><span className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 text-xs text-white/60 peer-checked:border-[#ef7d18] peer-checked:bg-[#ef7d18]/10 peer-checked:text-[#ffb56f]">{day}</span></label>)}</div></fieldset>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">Horário desejado para entrega *<input required type="time" name="horario_entrega" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Horário limite para receber *<input required type="time" name="horario_limite" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Horário de consumo<input type="time" name="horario_consumo" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Intervalo da equipe<input name="intervalo" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Ex.: 11h30 às 13h30" /></label>
                    <label className="grid gap-2 text-sm font-bold">Entregas por dia<select name="entregas_dia" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option>1</option><option>2</option><option>3</option><option>Mais de 3</option></select></label>
                    <label className="grid gap-2 text-sm font-bold">Tipo de entrega<select name="modo_entrega" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option>Entrega única</option><option>Recorrente</option><option>Mais de uma entrega por dia</option></select></label>
                  </div>
                  <fieldset className="mt-4 grid gap-2 text-sm font-bold"><legend>Há mais de um endereço de entrega?</legend><div className="flex gap-2">{["nao","sim"].map(v => <label key={v} className="cursor-pointer"><input type="radio" name="multiplos_enderecos" value={v} defaultChecked={v==="nao"} className="peer sr-only" /><span className="inline-flex min-w-20 justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs peer-checked:border-[#ef7d18] peer-checked:bg-[#ef7d18]/10">{v==="sim"?"Sim":"Não"}</span></label>)}</div></fieldset>
                  <label className="mt-4 grid gap-2 text-sm font-bold">Outros endereços / distribuição por unidade<textarea name="outros_enderecos" rows={3} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Informe unidades, endereços e quantidade por local, se houver." /></label>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a]/10 text-[#a7b86a] font-black">5</div><div><h3 className="font-black">Cardápio e restrições</h3><p className="text-xs text-white/40">Informações para montar a proposta e evitar incompatibilidades.</p></div></div>
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm font-bold">Preferências de cardápio<textarea name="preferencias_cardapio" rows={3} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Ex.: frango 50%, carne 30%, vegetariana 20%; pratos preferidos..." /></label>
                    <label className="grid gap-2 text-sm font-bold">Quantidade de refeições especiais<textarea name="refeicoes_especiais" rows={2} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Ex.: 2 sem lactose, 1 vegetariana..." /></label>
                    <label className="grid gap-2 text-sm font-bold">Restrições alimentares<textarea name="restricoes" rows={2} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Informe quantidades e quais restrições, se houver." /></label>
                    <label className="grid gap-2 text-sm font-bold">Alergias alimentares<textarea name="alergias" rows={2} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Informe alergias e quantidade de pessoas, se houver." /></label>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef7d18]/10 text-[#ef7d18] font-black">6</div><div><h3 className="font-black">Faturamento e pagamento</h3><p className="text-xs text-white/40">Evita retrabalho no financeiro.</p></div></div>
                  <fieldset className="grid gap-2 text-sm font-bold"><legend>A empresa precisa de nota fiscal?</legend><div className="flex gap-2">{["sim","nao"].map(v => <label key={v} className="cursor-pointer"><input type="radio" name="nota_fiscal" value={v} defaultChecked={v==="sim"} className="peer sr-only" /><span className="inline-flex min-w-20 justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs peer-checked:border-[#a7b86a] peer-checked:bg-[#a7b86a]/15">{v==="sim"?"Sim":"Não"}</span></label>)}</div></fieldset>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">E-mail para NF<input type="email" name="email_nf" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="financeiro@empresa.com.br" /></label>
                    <label className="grid gap-2 text-sm font-bold">Responsável financeiro<input name="financeiro_nome" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Nome completo" /></label>
                    <label className="grid gap-2 text-sm font-bold">Telefone financeiro<input name="financeiro_telefone" inputMode="tel" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="(32) 99999-9999" /></label>
                    <label className="grid gap-2 text-sm font-bold">E-mail financeiro<input type="email" name="financeiro_email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="financeiro@empresa.com.br" /></label>
                    <label className="grid gap-2 text-sm font-bold">Forma de pagamento<select name="forma_pagamento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option>Pix</option><option>Cartão</option><option>Link de pagamento</option><option>Boleto</option><option>Faturamento empresarial</option></select></label>
                    <label className="grid gap-2 text-sm font-bold">Prazo de pagamento<select name="prazo_pagamento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]"><option>À vista</option><option>7 dias</option><option>15 dias</option><option>21 dias</option><option>30 dias</option><option>Outro</option></select></label>
                  </div>
                  <fieldset className="mt-4 grid gap-2 text-sm font-bold"><legend>A empresa exige pedido de compra (PO)?</legend><div className="flex gap-2">{["nao","sim"].map(v => <label key={v} className="cursor-pointer"><input type="radio" name="pedido_compra" value={v} defaultChecked={v==="nao"} className="peer sr-only" /><span className="inline-flex min-w-20 justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs peer-checked:border-[#a7b86a] peer-checked:bg-[#a7b86a]/15">{v==="sim"?"Sim":"Não"}</span></label>)}</div></fieldset>
                  <label className="mt-4 grid gap-2 text-sm font-bold">Processo de aprovação / observações do financeiro<textarea name="processo_aprovacao" rows={3} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Ex.: enviar orçamento para compras antes do primeiro pedido." /></label>
                  <fieldset className="mt-4 grid gap-2 text-sm font-bold"><legend>Endereço de cobrança</legend><div className="flex gap-2">{["sim","nao"].map(v => <label key={v} className="cursor-pointer"><input type="radio" name="cobranca_mesmo_endereco" value={v} defaultChecked={v==="sim"} className="peer sr-only" /><span className="inline-flex min-w-24 justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs peer-checked:border-[#a7b86a] peer-checked:bg-[#a7b86a]/15">{v==="sim"?"Mesmo da entrega":"Outro endereço"}</span></label>)}</div></fieldset>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold">CEP cobrança<input name="cobranca_cep" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="00000-000" /></label>
                    <label className="grid gap-2 text-sm font-bold">Rua cobrança<input name="cobranca_rua" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Número cobrança<input name="cobranca_numero" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Complemento cobrança<input name="cobranca_complemento" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Bairro cobrança<input name="cobranca_bairro" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label>
                    <label className="grid gap-2 text-sm font-bold">Cidade/UF cobrança<input name="cobranca_cidade" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" placeholder="Cidade/MG" /></label>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a7b86a]/10 text-[#a7b86a] font-black">7</div><div><h3 className="font-black">Início do fornecimento</h3><p className="text-xs text-white/40">Para organizar produção e primeiro atendimento.</p></div></div>
                  <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Data desejada para início *<input required type="date" name="data_inicio" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label><label className="grid gap-2 text-sm font-bold">Data do primeiro pedido<input type="date" name="primeiro_pedido" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a]" /></label></div>
                  <label className="mt-4 grid gap-2 text-sm font-bold">Observações gerais<textarea name="observacoes" rows={4} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-[#a7b86a] resize-none" placeholder="Tudo que a Nutrifit precisa saber para atender sem erro." /></label>
                </div>

                <div className="rounded-[1.5rem] border border-[#a7b86a]/25 bg-[#171d10] p-5 sm:p-6">
                  <h3 className="font-black">Confirmação do cadastro</h3>
                  <div className="mt-4 grid gap-3 text-sm text-white/65">
                    <label className="flex cursor-pointer gap-3"><input required type="checkbox" name="confirmacao_dados" value="sim" className="mt-1 accent-[#ef7d18]" />Confirmo que os dados da empresa, endereço, quantidade, horários e faturamento informados estão corretos.</label>
                    <label className="flex cursor-pointer gap-3"><input required type="checkbox" name="consentimento" value="sim" className="mt-1 accent-[#ef7d18]" />Autorizo a Nutrifit a utilizar os dados fornecidos para atendimento, proposta, faturamento e entrega do pedido.</label>
                  </div>
                  <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 font-black text-black transition hover:-translate-y-0.5 hover:brightness-105"><MessageCircle size={18} /> Enviar cadastro e abrir WhatsApp</button>
                  {sent && <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#a7b86a]/30 bg-[#11140e] p-4 text-sm text-white/70"><CheckCircle2 className="shrink-0 text-[#a7b86a]" size={19} /> Cadastro registrado. O WhatsApp da Nutrifit foi aberto com a ficha completa.</div>}
                </div>
              </form>

              <aside className="h-fit overflow-hidden rounded-[2rem] border border-[#ef7d18]/20 bg-[#171d10] lg:sticky lg:top-6">
                <div className="relative h-48"><img src="/images/nutrifit-fit-350-frango-com-pure-de-batata-inglesa.png" alt="" className="h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-[#171d10] via-[#171d10]/15 to-transparent" /></div>
                <div className="p-6 md:p-7"><div className="flex items-center gap-3"><Handshake className="text-[#ef7d18]" size={22} /><h2 className="text-xl font-black">Cadastro Nutrifit Empresas</h2></div><p className="mt-4 text-sm leading-6 text-white/50">Quanto mais completo o cadastro, menos dúvidas ficam para orçamento, produção, entrega e faturamento.</p><div className="mt-6 grid gap-3">{["Empresa e responsáveis","Endereço completo de entrega","Quantidade e horários","Cardápio e restrições","Faturamento e pagamento","Início do fornecimento"].map(item => <div key={item} className="flex items-start gap-2 text-sm text-white/65"><Check size={16} className="mt-0.5 shrink-0 text-[#a7b86a]" />{item}</div>)}</div><a href="https://wa.me/5532998030038" target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-5 py-3.5 text-sm font-black text-[#d9e5a5] transition hover:bg-[#a7b86a]/15"><MessageCircle size={17} /> Falar com a Nutrifit</a></div>
              </aside>
            </div>
          </section>
          <footer className="border-t border-white/10 px-6 py-7 sm:px-10"><div className="flex flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span className="font-bold">Nutrifit • Juiz de Fora/MG</span><span>Atendimento corporativo • Propostas sob consulta</span></div></footer>
        </section>
      </div>
    </main>
  );
}
