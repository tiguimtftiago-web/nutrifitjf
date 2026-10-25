"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  MessageCircle,
  UtensilsCrossed,
} from "lucide-react";

const whatsapp = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

const SUPABASE_URL = "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";


export default function B2BPage() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [menuQuantities, setMenuQuantities] = useState<Record<string, number>>({});
  const menuDishes: [string, string, string][] = [
    ["Bife acebolado", "Arroz, feijão e batata frita", "/images/bife-acebolado.jpg"],
    ["Costelinha suína assada", "Arroz e feijão tropeiro", "/images/costelinha-suina-assada.jpg"],
    ["Feijoada completa", "Arroz e couve refogada", "/images/feijoada-completa.jpg"],
    ["Carne de panela com batatas", "Arroz e farofa", "/images/carne-de-panela-com-batatas.jpg"],
    ["Pernil assado", "Arroz branco e maionese", "/images/pernil-assado.jpg"],
    ["Frango ensopado", "Arroz, feijão tropeiro e couve refogada", "/images/frango-ensopado.jpg"],
  ];
  const selectedMenuSummary = menuDishes.filter(([name]) => (menuQuantities[name] || 0) > 0).map(([name]) => `${name}: ${menuQuantities[name]} por dia`).join("; ");
  const selectedMenuTotal = Object.values(menuQuantities).reduce((sum, qty) => sum + qty, 0);
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const submitLock = useRef(false);
  const submissionIdRef = useRef<string | null>(null);\n  const formStartedAtRef = useRef(Date.now());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || sent || submitLock.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get("consentimento") !== "sim") return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError(false);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const submissionId = submissionIdRef.current || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lead-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    submissionIdRef.current = submissionId;
    const notes = value("observacoes");
    const message = ["Olá! Quero solicitar uma proposta da Nutrifit Empresas.", `Empresa: ${value("empresa")}`, `Responsável: ${value("responsavel")}`, `WhatsApp: ${value("telefone")}`, `E-mail: ${value("email")}`, `Segmento: ${value("segmento")}`, `Refeições por dia: ${value("refeicoes")}`, `Dias de fornecimento: ${value("dias")}`, `Bairro de entrega: ${value("bairro")}`, `Observações: ${notes || "Não informadas"}`].join("\\n");
    setWhatsappLink(whatsapp(message));
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-b2b-lead`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ submission_id: submissionId, company: value("empresa"), trade_name: value("empresa"), contact_name: value("responsavel"), whatsapp: value("telefone"), email: value("email"), segment: value("segmento"), estimated_meals: value("refeicoes"), delivery_days: value("dias"), neighborhood: value("bairro"), notes, data_consent: true, website: value("website"), form_started_at: formStartedAtRef.current }),
      });
      if (!response.ok) throw new Error(`Falha ao registrar solicitação (HTTP ${response.status}).`);
      setSent(true);
      submissionIdRef.current = null;
      form.reset();\n      formStartedAtRef.current = Date.now();
    } catch (error) {
      console.error("Erro ao registrar solicitação B2B:", error);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  }
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
        <a aria-label="Voltar para a Nutrifit" href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.025] px-4 py-2 text-xs font-black text-white/60 transition hover:border-white/20 hover:text-white">
          <ArrowLeft size={15} /> Voltar para o site
        </a>

        <section className="mt-4 overflow-hidden rounded-[2rem] border border-white/10 bg-[#10130d] shadow-[0_30px_100px_rgba(0,0,0,.35)]">
          <div className="relative min-h-[390px] overflow-hidden">
            <img src="/images/nutrifit-b2b-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-65" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,7,.98)_0%,rgba(8,11,7,.88)_38%,rgba(8,11,7,.48)_72%,rgba(8,11,7,.28)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_52%,rgba(239,125,24,.12),transparent_32%)]" />
            <div className="relative flex min-h-[390px] flex-col justify-between p-6 sm:p-9 lg:p-12">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ef7d18]/25 bg-black/30 px-3.5 py-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ffab62] backdrop-blur"><Building2 size={14} /> Nutrifit para empresas</div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[.98] tracking-[-.04em] sm:text-5xl lg:text-6xl">Marmitas caseiras para sua equipe<span className="block text-[#ef7d18]">entregues no horário em Juiz de Fora.</span></h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">Marmitas caseiras para empresas em Juiz de Fora, com cardápio adaptável, fornecimento planejado e condições comerciais de acordo com a sua operação.</p>
                <a aria-label="Solicitar proposta Nutrifit Empresas" href="#solicitar-proposta" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 text-sm font-black text-black shadow-[0_12px_35px_rgba(239,125,24,.22)] transition hover:-translate-y-0.5 hover:brightness-105">Solicitar proposta gratuita <ArrowRight size={17} /></a>
              </div>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 backdrop-blur-md"><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">Nutrifit Empresas</div><div className="mt-1 text-sm font-bold text-white/75">Refeições para empresas</div></div>
                <div className="hidden items-center gap-2 text-xs font-bold text-white/45 md:flex"><CheckCircle2 size={17} className="text-[#a7b86a]" /> Atendimento corporativo em Juiz de Fora</div>
              </div>
            </div>
          </div>

          <section id="precos-b2b" className="border-t border-white/10 p-5 sm:p-7">
            <div className="rounded-2xl border border-[#ef7d18]/25 bg-[#17130e] p-5 sm:p-7">
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#ffab62]">Proposta comercial personalizada</span>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Condições definidas para a realidade da sua empresa.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Os valores e as condições comerciais são apresentados durante o atendimento, considerando o cardápio escolhido ou personalizado, o volume de refeições, a frequência e a logística de entrega. Converse com a Nutrifit para montarmos uma proposta adequada à sua equipe.</p>
              <a href="#solicitar-proposta" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black transition hover:brightness-105">Solicitar proposta <ArrowRight size={16} /></a>
            </div>
          </section>

          <section id="cardapio-empresarial" className="scroll-mt-8 border-t border-white/10 p-5 sm:p-7">
            <div className="grid gap-5 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Cardápio empresarial</span>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Seis pratos iniciais para sua equipe.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Sua empresa pode começar com estas seis opções. Se preferir, montamos um cardápio personalizado para sua equipe, conforme as preferências, necessidades e rotina de fornecimento. Basta solicitar o atendimento comercial.</p>
              </div>
              <div className="flex flex-col gap-2 sm:min-w-52">
                <button type="button" aria-expanded={menuExpanded} aria-controls="lista-pratos-empresariais" onClick={() => setMenuExpanded(value => !value)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 text-sm font-black text-[#10130d] transition hover:brightness-105">
                  {menuExpanded ? "Ocultar cardápio" : "Ver os 6 pratos iniciais"} <ArrowRight size={16} className={menuExpanded ? "rotate-90 transition-transform" : "transition-transform"} />
                </button>
                <a href="#solicitar-proposta" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ef7d18]/40 px-5 py-3 text-sm font-black text-[#ffab62] transition hover:bg-[#ef7d18]/10">Pedir orçamento <ArrowRight size={15} /></a>
              </div>
            </div>
            {menuExpanded && <div id="lista-pratos-empresariais" className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menuDishes.map(([title, sides, image], index) => (
                  <article key={title} className={`overflow-hidden rounded-xl border transition ${(menuQuantities[title] || 0) > 0 ? "border-[#a7b86a]/70 bg-[#a7b86a]/10" : "border-white/10 bg-[#11140e]"}`}>
                    <img src={image} alt={title} loading="lazy" className="h-44 w-full object-cover" />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${index % 2 === 0 ? "bg-[#ef7d18]/10 text-[#ef7d18]" : "bg-[#a7b86a]/10 text-[#a7b86a]"}`}><UtensilsCrossed size={20} /></div>
                        <div className="min-w-0 flex-1"><h3 className="text-sm font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-white/50">{sides}</p></div>
                      </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-white/60">Unidades por dia</span>
                      <div className="flex items-center gap-3">
                        <button type="button" aria-label={`Diminuir ${title}`} onClick={() => setMenuQuantities(current => ({...current, [title]: Math.max(0, (current[title] || 0) - 1)}))} className="h-9 w-9 rounded-full border border-white/15 text-lg font-bold hover:bg-white/10">−</button>
                        <span className="min-w-5 text-center text-sm font-black tabular-nums">{menuQuantities[title] || 0}</span>
                        <button type="button" aria-label={`Aumentar ${title}`} onClick={() => setMenuQuantities(current => ({...current, [title]: (current[title] || 0) + 1}))} className="h-9 w-9 rounded-full bg-[#a7b86a] text-lg font-black text-[#10130d] hover:brightness-110">+</button>
                      </div>
                    </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ef7d18]/25 bg-[#ef7d18]/5 p-4">
                <div><p className="text-sm font-black">Seleção diária: {selectedMenuTotal} refeições</p><p className="mt-1 text-xs text-white/50">Distribua as quantidades entre os pratos. O mínimo comercial é de 20 refeições por dia.</p></div>
                <button type="button" onClick={() => { if (selectedMenuTotal < 20) { alert("Selecione pelo menos 20 refeições por dia para montar uma proposta empresarial."); return; } const field = formRef.current?.querySelector<HTMLTextAreaElement>('textarea[name="observacoes"]'); if (field) { field.value = [selectedMenuSummary, field.value].filter(Boolean).join("\nObservações: "); field.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("solicitar-proposta")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">Usar seleção na proposta</button>
              </div>
            </div>}
            <p className="mt-3 text-xs leading-5 text-white/35">Cardápio de referência. Disponibilidade, gramatura, acompanhamentos, valores e entrega são confirmados na proposta.</p>
            <p className="mt-2 text-xs leading-5 text-white/35">Escolha a quantidade diária de cada prato. A seleção será incluída na proposta; disponibilidade e condições serão confirmadas pela Nutrifit.</p>
          </section>

          <section id="como-funciona" className="border-t border-white/10 p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl font-black sm:text-3xl">Como funciona</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">{[["01","Conte sua necessidade","Informe volume, dias de fornecimento e bairro. O formulário é rápido."],["02","Receba sua proposta","A Nutrifit avalia cardápio, quantidade e logística para apresentar as condições."],["03","Aprove e programe","Após o aceite, fazemos o cadastro completo e alinhamos a primeira entrega."]].map(([n,t,d]) => <article key={n} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><span className="text-sm font-black text-[#ef7d18]">{n}</span><h3 className="mt-3 font-black">{t}</h3><p className="mt-2 text-sm leading-6 text-white/55">{d}</p></article>)}</div>
          </section>
          
          <section id="degustacao" className="border-t border-white/10 p-6 sm:p-8 lg:p-10"><div className="grid gap-5 rounded-2xl border border-[#ef7d18]/25 bg-[#17130e] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"><div><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#ffab62]">Conheça antes de contratar</span><h2 className="mt-2 text-2xl font-black">Quer provar as refeições da Nutrifit?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Consulte a disponibilidade de degustação empresarial. Vamos alinhar pratos, quantidade de amostras, data e condições.</p></div><a href={whatsapp("Olá! Gostaria de consultar a disponibilidade de degustação empresarial da Nutrifit.")} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3.5 text-sm font-black text-black"><MessageCircle size={16}/> Consultar degustação</a></div></section>
          <section id="confianca" className="border-t border-white/10 p-6 sm:p-8 lg:p-10"><h2 className="text-2xl font-black sm:text-3xl">Uma parceria começa com transparência.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Conheça algumas opções de refeições que podem compor o cardápio da sua equipe.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["Prato caseiro","/images/bife-acebolado.jpg"],["Refeição empresarial","/images/carne-de-panela-com-batatas.jpg"],["Cardápio da equipe","/images/costelinha-suina-assada.jpg"]].map(([t,img])=><article key={t} className="overflow-hidden rounded-2xl border border-white/10"><img src={img} alt={t} loading="lazy" className="h-44 w-full object-cover"/><div className="p-4"><h3 className="font-black">{t}</h3><p className="mt-1 text-xs text-white/40">Opção de refeição para fornecimento empresarial.</p></div></article>)}</div></section>
          <section id="faq" className="border-t border-white/10 p-6 sm:p-8 lg:p-10"><h2 className="text-2xl font-black sm:text-3xl">Perguntas frequentes</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{[["Existe pedido mínimo?","O volume mínimo depende da operação e da logística. Informe a quantidade para avaliarmos a viabilidade."],["Qual é o prazo para começar?","O prazo será confirmado na proposta, conforme produção, cardápio e rota."],["Posso personalizar o cardápio?","Podemos avaliar preferências e ajustes conforme a capacidade de produção."],["A Nutrifit emite nota fiscal?","As condições fiscais e de faturamento serão confirmadas durante a negociação."],["Vocês atendem restrições alimentares?","Informe as necessidades. A equipe avaliará opções possíveis; não presumimos ausência de contaminação cruzada."],["Quais formas de pagamento são aceitas?","Forma e prazo são alinhados na proposta antes do início do fornecimento."],["Quais horários de entrega estão disponíveis?","Os horários dependem do bairro, volume, rota e capacidade operacional."],["Quais bairros são atendidos?","A disponibilidade depende do endereço e da rota. Informe o bairro para confirmarmos."]].map(([q,a])=><details key={q} className="rounded-xl border border-white/10 bg-white/[.025] p-4"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-3 text-sm leading-6 text-white/55">{a}</p></details>)}</div></section>
          <section id="solicitar-proposta" className="scroll-mt-8 border-t border-white/10 p-6 sm:p-8 lg:p-10"><div className="grid gap-8 lg:grid-cols-[1.2fr_.55fr]"><div><span className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Atendimento comercial</span><h2 className="mt-2 text-2xl font-black sm:text-3xl">Solicite uma proposta para sua equipe</h2><p className="mt-2 text-sm leading-6 text-white/55">Preencha os dados iniciais. O cadastro fiscal e financeiro completo será solicitado somente após o aceite da proposta.</p>
            {sent ? <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-[#a7b86a]/30 bg-[#171d10] p-5"><div className="flex items-center gap-2 font-black text-[#c5d879]"><CheckCircle2 size={20}/> Solicitação recebida!</div><p className="mt-3 text-sm leading-6 text-white/70">Obrigado por considerar a Nutrifit. Vamos analisar os dados e entrar em contato para preparar sua proposta.</p><a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3 font-black text-black"><MessageCircle size={16}/> Continuar pelo WhatsApp</a></div> : <form ref={formRef} onSubmit={submit} className="relative mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-6">\n              <label aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><span>Não preencher</span><input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">Nome fantasia *<input required name="empresa" autoComplete="organization" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Nome da empresa"/></label>
                <label className="grid gap-2 text-sm font-bold">Nome do responsável *<input required name="responsavel" autoComplete="name" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Seu nome"/></label>
                <label className="grid gap-2 text-sm font-bold">WhatsApp *<input required name="telefone" type="tel" inputMode="tel" autoComplete="tel" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="(32) 99999-9999"/></label>
                <label className="grid gap-2 text-sm font-bold">E-mail *<input required name="email" type="email" autoComplete="email" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="voce@empresa.com.br"/></label>
                <label className="grid gap-2 text-sm font-bold">Segmento *<select required name="segmento" defaultValue="" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]"><option value="" disabled>Selecione</option>{["Escritório","Clínica","Academia","Indústria","Comércio","Outro"].map(v=><option key={v}>{v}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-bold">Refeições por dia *<select required name="refeicoes" defaultValue="" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]"><option value="" disabled>Selecione uma faixa</option>{["20 a 30","31 a 50","51 a 100","Mais de 100","Ainda não definido"].map(v=><option key={v}>{v}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-bold">Dias de fornecimento *<select required name="dias" defaultValue="" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]"><option value="" disabled>Selecione</option>{["1 a 2 dias por semana","3 a 4 dias por semana","5 dias por semana","6 dias por semana","Todos os dias, incluindo fins de semana","A combinar"].map(v=><option key={v}>{v}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-bold">Bairro de entrega *<input required name="bairro" autoComplete="address-level3" className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Bairro em Juiz de Fora"/></label>
              </div>
              <label className="grid gap-2 text-sm font-bold">Observações<textarea name="observacoes" rows={3} className="resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#a7b86a]" placeholder="Horário desejado, preferências ou detalhes importantes (opcional)"/></label>
              <label className="flex items-start gap-3 text-xs leading-5 text-white/55"><input required type="checkbox" name="consentimento" value="sim" className="mt-1 accent-[#ef7d18]"/><span>Li a <a href="/privacidade" className="underline text-[#c5d879]">Política de Privacidade</a> e estou ciente do tratamento dos dados informados para atendimento desta solicitação comercial.</span></label>
              {submitError && <p role="alert" className="text-sm text-[#ffb56f]">Não conseguimos confirmar o envio. Tente novamente ou fale conosco pelo WhatsApp.</p>}
              <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-4 text-sm font-black text-black disabled:opacity-60">{submitting ? "Enviando solicitação..." : "Solicitar proposta gratuita"} <ArrowRight size={17}/></button><p className="text-xs leading-5 text-white/35">O formulário inicial não pede dados fiscais ou financeiros. Esses dados serão solicitados após o aceite.</p>
            </form>}</div>
            <aside className="h-fit rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-5 sm:p-6 lg:sticky lg:top-6"><div className="flex items-center gap-3"><MessageCircle className="text-[#a7b86a]" size={22}/><h3 className="text-lg font-black">Prefere conversar?</h3></div><p className="mt-3 text-sm leading-6 text-white/55">Fale diretamente com a Nutrifit para tirar dúvidas sobre volume, cardápio, entrega e degustação.</p><a href={whatsapp("Olá! Quero conversar sobre marmitas para empresas em Juiz de Fora e solicitar uma proposta de alimentação corporativa.")} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-5 py-3.5 text-sm font-black text-[#d9e5a5]"><MessageCircle size={17}/> Falar com a Nutrifit</a></aside>
          </div></section>
          <footer className="border-t border-white/10 px-6 py-7 sm:px-10"><div className="flex flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span className="font-bold">Nutrifit • Juiz de Fora/MG</span><span>Atendimento corporativo • Propostas sob consulta</span></div></footer>
        </section>
      </div>
    </main>
  );
}
