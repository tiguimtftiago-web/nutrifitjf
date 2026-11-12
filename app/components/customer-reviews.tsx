"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const endpoint = "https://xdllpyqrbofszvallzxf.supabase.co/functions/v1/customer-reviews";
const key = "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

export default function CustomerReviews() {
  const [stats, setStats] = useState({ count: 0, average: null as number | null, reviews: [] as any[] });
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  const [phone, setPhone] = useState("");
  const [ratings, setRatings] = useState([0, 0, 0, 0, 0]);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [publish, setPublish] = useState(false);
  const [showName, setShowName] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(endpoint, { headers: { apikey: key } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (ratings.some(n => n < 1) || recommend === null) {
      setStatus("Preencha todas as estrelas e responda à pergunta de recomendação.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order, whatsapp: phone,
          food_quality: ratings[0], ingredient_quality: ratings[1],
          portion_size: ratings[2], service: ratings[3], delivery: ratings[4],
          recommend, comment, publish_consent: publish, name_consent: showName
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Não foi possível enviar.");
      setStatus(data.message || "Avaliação recebida. Obrigado!");
      setOrder(""); setPhone(""); setRatings([0,0,0,0,0]); setRecommend(null); setComment("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro ao enviar avaliação.");
    } finally { setBusy(false); }
  }

  const criteria = ["Sabor e qualidade das refeições", "Qualidade dos ingredientes", "Quantidade das porções", "Atendimento", "Entrega e pontualidade"];
  const stars = (value: number, onChange?: (n: number) => void) => <div className="flex gap-1">{[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => onChange?.(n)} aria-label={n + " estrelas"} disabled={!onChange}><Star size={23} className={n <= value ? "fill-[#f5a623] text-[#f5a623]" : "text-white/25"} /></button>)}</div>;

  return <section id="avaliacoes" className="border-t border-white/10 bg-[#080a07]">
    <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#f47b0b]">Experiências reais</p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Quem prova, conta como foi.</h2>
          <p className="mt-2 text-sm text-white/55">A opinião de cada cliente ajuda a Nutrifit a manter a qualidade e melhorar todos os dias.</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
          <article className="flex flex-col items-center justify-center rounded-3xl border border-[#86a51d]/30 bg-[#11160e] p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a8c957]">Satisfação dos clientes</p>
            <div className="mt-2 text-5xl font-black text-white">{stats.average === null ? "—" : Number(stats.average).toFixed(1)}<span className="text-lg text-white/45">/5</span></div>
            {stars(Math.round(stats.average || 0))}
            <p className="mt-2 text-xs text-white/50">{stats.count ? stats.count + " avaliações publicadas" : "Seja o primeiro a avaliar"}</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#10130d] p-5">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f47b0b]">O que nossos clientes dizem</p>
            {stats.reviews.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{stats.reviews.slice(0,4).map((r:any) => <div key={r.id} className="rounded-2xl border border-white/10 p-4">{stars(Math.round(r.rating))}{r.comment && <p className="mt-2 text-sm text-white/75">“{r.comment}”</p>}<p className="mt-3 text-xs font-bold text-[#b6d76a]">{r.customer}</p></div>)}</div> : <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">Ainda não há depoimentos publicados. Sua avaliação pode ser a primeira.</p>}
          </article>
        </div>
        <div className="mt-4 overflow-hidden rounded-3xl border border-[#f47b0b]/30 bg-[#11130e]">
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-5 text-left">
            <span><b className="block text-[10px] uppercase tracking-[.2em] text-[#f47b0b]">Sua vez</b><b className="mt-1 block text-lg text-white">Como foi sua experiência?</b><span className="mt-1 block text-xs text-white/50">Avalie em poucos toques. Leva menos de 1 minuto.</span></span>
            <span className="rounded-full bg-[#f47b0b] px-4 py-3 font-black text-black">{open ? "−" : "+"}</span>
          </button>
          {open && <form onSubmit={submit} className="border-t border-white/10 px-5 pb-6 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-white/75">Referência do pedido<input required value={order} onChange={e=>setOrder(e.target.value)} placeholder="Código enviado no WhatsApp" className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white" /></label>
              <label className="text-xs font-bold text-white/75">WhatsApp usado no pedido<input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(32) 99999-9999" className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white" /></label>
            </div>
            <p className="mt-5 text-sm font-black text-white">Dê sua nota de 1 a 5 estrelas</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{criteria.map((label,i)=><div key={label} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[.025] px-3 py-2"><span className="text-xs text-white/75">{label}</span>{stars(ratings[i],n=>setRatings(old=>old.map((v,j)=>j===i?n:v)))}</div>)}</div>
            <fieldset className="mt-5"><legend className="text-sm font-bold text-white">Você recomendaria a Nutrifit?</legend><div className="mt-2 flex gap-2"><button type="button" onClick={()=>setRecommend(true)} className={recommend===true?"rounded-full border border-[#86a51d] bg-[#86a51d]/15 px-4 py-2 text-xs text-[#c5e27b]":"rounded-full border border-white/15 px-4 py-2 text-xs text-white/65"}>Sim, com certeza</button><button type="button" onClick={()=>setRecommend(false)} className={recommend===false?"rounded-full border border-[#86a51d] bg-[#86a51d]/15 px-4 py-2 text-xs text-[#c5e27b]":"rounded-full border border-white/15 px-4 py-2 text-xs text-white/65"}>Ainda não</button></div></fieldset>
            <label className="mt-5 block text-xs font-bold text-white/75">Comentário (opcional)<textarea value={comment} onChange={e=>setComment(e.target.value.slice(0,1200))} rows={3} placeholder="Conte o que mais gostou ou o que podemos melhorar…" className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white" /></label>
            <div className="mt-4 space-y-2 text-xs leading-5 text-white/65"><label className="flex gap-2"><input type="checkbox" checked={publish} onChange={e=>{setPublish(e.target.checked);if(!e.target.checked)setShowName(false);}} />Autorizo a publicação do meu comentário após análise, inclusive de forma anônima.</label><label className="flex gap-2"><input type="checkbox" disabled={!publish} checked={showName} onChange={e=>setShowName(e.target.checked)} />Autorizo também a exibição do meu nome.</label></div>
            {status && <p role="status" className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-white">{status}</p>}
            <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#f47b0b] px-5 py-3 text-sm font-black text-black disabled:opacity-60">{busy?"Enviando…":"Enviar minha avaliação"}</button>
            <p className="mt-3 text-center text-[10px] text-white/35">Somente pedidos entregues são aceitos. Depoimentos passam por aprovação antes da publicação.</p>
          </form>}
        </div>
      </div>
    </div>
  </section>;
}
