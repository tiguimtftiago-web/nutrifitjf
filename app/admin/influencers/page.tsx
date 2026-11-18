"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, RefreshCw, Users, PackageCheck, CalendarDays, Plus, Camera, AlertCircle } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const CAMPAIGN_QUOTA = 30;

type Partner = { id:string; name:string; partner_type:string; active:boolean; standard_meal_quantity:number|null; standard_cycle:string|null; operational_notes:string|null };
type Delivery = { id:string; customer_name:string|null; delivery_date:string|null; status:string; meal_quantity:number; notes:string|null; created_at:string };

async function api(path:string, token:string, init:RequestInit={}) {
  const response = await fetch(path,{...init,headers:{apikey:KEY,"Content-Type":"application/json",Authorization:"Bearer "+token,...(init.headers||{})}});
  const body = await response.text();
  if(!response.ok) throw new Error(body||"Falha ao acessar os dados.");
  return body?JSON.parse(body):null;
}
const dateToday=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const money=(value:number)=>value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

export default function InfluencersPage(){
  const [token,setToken]=useState("");
  const [partners,setPartners]=useState<Partner[]>([]);
  const [deliveries,setDeliveries]=useState<Delivery[]>([]);
  const [selected,setSelected]=useState("");
  const [quantity,setQuantity]=useState("1");
  const [deliveryDate,setDeliveryDate]=useState(dateToday());
  const [note,setNote]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");

  async function load(currentToken=token){
    if(!currentToken)return;
    setBusy(true);setError("");
    try{
      const [p,d]=await Promise.all([
        api(URL+"/rest/v1/marketing_partners?select=id,name,partner_type,active,standard_meal_quantity,standard_cycle,operational_notes&active=eq.true&order=name.asc",currentToken),
        api(URL+"/rest/v1/delivery_orders?select=id,customer_name,delivery_date,status,meal_quantity,notes,created_at&notes=like.*NF_INFLUENCER*&order=delivery_date.desc.nullslast",currentToken)
      ]);
      setPartners(Array.isArray(p)?p:[]);
      setDeliveries(Array.isArray(d)?d:[]);
      setSelected((current:string)=>current||((Array.isArray(p)&&p[0]?.id)||""));
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar a área de influencers.");}
    finally{setBusy(false);}
  }

  useEffect(()=>{const saved=sessionStorage.getItem("nutrifit_admin_token")||"";setToken(saved);if(saved)void load(saved);},[]);

  const totals=useMemo(()=>partners.map(partner=>{
    const marker="NF_INFLUENCER:"+partner.id;
    const rows=deliveries.filter(row=>String(row.notes||"").includes(marker)&&row.status==="entregue");
    const delivered=rows.reduce((sum,row)=>sum+Number(row.meal_quantity||0),0);
    return {partner,rows,delivered,remaining:Math.max(0,CAMPAIGN_QUOTA-delivered)};
  }),[partners,deliveries]);
  const totalDelivered=totals.reduce((sum,item)=>sum+item.delivered,0);
  const totalRemaining=Math.max(0,partners.length*CAMPAIGN_QUOTA-totalDelivered);

  async function register(e:FormEvent){
    e.preventDefault();setError("");setSuccess("");
    const amount=Math.floor(Number(quantity));
    const current=totals.find(item=>item.partner.id===selected);
    if(!current){setError("Selecione um influencer.");return;}
    if(!Number.isInteger(amount)||amount<1||amount>current.remaining){setError("A quantidade precisa ser entre 1 e "+current.remaining+".");return;}
    if(!deliveryDate){setError("Informe a data da entrega.");return;}
    setBusy(true);
    try{
      const marker="NF_INFLUENCER:"+current.partner.id;
      await api(URL+"/rest/v1/delivery_orders",token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({
        customer_name:current.partner.name,city:"Juiz de Fora",delivery_date:deliveryDate,status:"entregue",meal_quantity:amount,fee:0,
        notes:marker+(note.trim()?" | "+note.trim():" | Entrega de parceria com influencer")
      })});
      setQuantity("1");setNote("");await load();setSuccess("Entrega registrada. O saldo da parceria foi atualizado.");
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível registrar a entrega.");}
    finally{setBusy(false);}
  }

  if(!token)return <main className="min-h-screen bg-[#080a07] p-6 text-white"><div className="mx-auto mt-20 max-w-md rounded-3xl border border-white/10 bg-[#10130d] p-6"><h1 className="text-xl font-black">Acesso administrativo necessário</h1><p className="mt-2 text-sm text-white/60">Entre no painel Nutrifit e abra novamente a área de influencers.</p><a href="/admin" className="mt-5 inline-flex rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">Ir para o painel</a></div></main>;

  return <main className="min-h-screen bg-[#080a07] px-4 py-5 text-white sm:px-6">
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><a href="/admin" aria-label="Voltar ao painel" className="rounded-full border border-white/10 p-3"><ArrowLeft size={18}/></a><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit • Marketing</div><h1 className="text-2xl font-black sm:text-3xl">Influencers</h1><p className="text-xs text-white/45">Controle de parcerias, entregas e saldo de marmitas</p></div></div>
        <button onClick={()=>void load()} disabled={busy} className="rounded-full border border-white/10 px-4 py-3 text-xs font-black"><RefreshCw size={14} className={"mr-2 inline "+(busy?"animate-spin":"")}/>Atualizar</button>
      </header>

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#a7b86a]/25 bg-[#a7b86a]/[.07] p-5"><div className="text-xs font-bold text-[#c9d89a]">Marmitas previstas</div><div className="mt-2 text-3xl font-black">{partners.length*CAMPAIGN_QUOTA}</div><div className="mt-1 text-xs text-white/45">30 por influencer • ciclo de 30 dias</div></div>
        <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs font-bold text-white/55">Entregues</div><div className="mt-2 text-3xl font-black">{totalDelivered}</div><div className="mt-1 text-xs text-white/45">Somente entregas registradas nesta área</div></div>
        <div className="rounded-3xl border border-[#ef7d18]/25 bg-[#ef7d18]/[.06] p-5"><div className="text-xs font-bold text-[#ffb36b]">Saldo a entregar</div><div className="mt-2 text-3xl font-black">{totalRemaining}</div><div className="mt-1 text-xs text-white/45">Marmitas restantes da parceria</div></div>
      </section>

      {error&&<div className="mb-4 flex gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle size={17} className="shrink-0"/><span className="break-all">{error}</span></div>}
      {success&&<div className="mb-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4 text-sm text-[#d9e5a5]">{success}</div>}

      <section className="mb-5 grid gap-3 md:grid-cols-2">
        {totals.map(({partner,rows,delivered,remaining})=><article key={partner.id} className="rounded-3xl border border-white/10 bg-[#10130d] p-5">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#ef7d18]/15 p-3 text-[#ffb36b]"><Camera size={22}/></div><div><h2 className="text-xl font-black">{partner.name}</h2><p className="text-xs text-white/45">Parceria ativa • 30 dias</p></div></div><span className="rounded-full bg-[#a7b86a]/15 px-3 py-1 text-[10px] font-black text-[#d9e5a5]">ATIVO</span></div>
          <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/[.04] p-3"><div className="text-[10px] text-white/45">Meta</div><div className="mt-1 text-xl font-black">30</div></div><div className="rounded-2xl bg-white/[.04] p-3"><div className="text-[10px] text-white/45">Entregues</div><div className="mt-1 text-xl font-black">{delivered}</div></div><div className="rounded-2xl bg-white/[.04] p-3"><div className="text-[10px] text-white/45">Saldo</div><div className="mt-1 text-xl font-black text-[#ffb36b]">{remaining}</div></div></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#a7b86a]" style={{width:Math.min(100,delivered/CAMPAIGN_QUOTA*100)+"%"}}/></div>
          {partner.operational_notes&&<p className="mt-4 text-xs leading-relaxed text-white/45">{partner.operational_notes}</p>}
          <div className="mt-4 border-t border-white/10 pt-3"><div className="mb-2 flex items-center gap-2 text-xs font-black text-white/65"><CalendarDays size={14}/>Últimas entregas</div>{rows.length?rows.slice(0,3).map(row=><div key={row.id} className="flex justify-between gap-3 py-1 text-xs"><span className="text-white/50">{row.delivery_date?new Date(row.delivery_date+"T12:00:00").toLocaleDateString("pt-BR"):"Data não informada"}</span><b>{row.meal_quantity} marmita(s)</b></div>):<p className="text-xs text-white/35">Nenhuma entrega registrada nesta campanha.</p>}</div>
        </article>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]">
        <form onSubmit={register} className="rounded-3xl border border-white/10 bg-[#10130d] p-5">
          <div className="mb-4 flex items-center gap-2"><PackageCheck className="text-[#a7b86a]"/><h2 className="text-lg font-black">Registrar entrega</h2></div>
          <label className="mb-2 block text-xs font-bold text-white/60">Influencer</label><select value={selected} onChange={e=>setSelected(e.target.value)} className="mb-4 min-h-12 w-full rounded-xl border border-white/10 bg-[#080a07] px-3 text-sm">{partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-xs font-bold text-white/60">Quantidade</label><input type="number" min="1" max={totals.find(x=>x.partner.id===selected)?.remaining||0} value={quantity} onChange={e=>setQuantity(e.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-[#080a07] px-3"/></div><div><label className="mb-2 block text-xs font-bold text-white/60">Data da entrega</label><input type="date" value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-[#080a07] px-3"/></div></div>
          <label className="mb-2 mt-4 block text-xs font-bold text-white/60">Observação (opcional)</label><textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Ex.: entrega referente à semana 1" className="w-full rounded-xl border border-white/10 bg-[#080a07] p-3 text-sm"/>
          <button disabled={busy||!partners.length||totalRemaining===0} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-5 text-sm font-black text-black disabled:opacity-50"><Plus size={17}/>{busy?"Salvando...":"Registrar entrega"}</button>
        </form>
        <aside className="rounded-3xl border border-white/10 bg-[#10130d] p-5"><div className="mb-3 flex items-center gap-2"><Users className="text-[#a7b86a]"/><h2 className="text-lg font-black">Regras da parceria</h2></div><ul className="space-y-3 text-sm leading-relaxed text-white/65"><li>• Alisson: 30 marmitas no ciclo de 30 dias.</li><li>• Millene: 30 marmitas no ciclo de 30 dias.</li><li>• Total previsto: 60 marmitas, sem cobrança aos influencers.</li><li>• Cada entrega deve ser lançada para atualizar o saldo automaticamente.</li></ul><div className="mt-5 rounded-2xl border border-[#ef7d18]/20 bg-[#ef7d18]/[.06] p-3 text-xs leading-relaxed text-[#ffbd85]">O custo financeiro da parceria não é estimado nesta tela. Para calcular o custo real, é necessário vincular o custo unitário validado de cada marmita entregue.</div></aside>
      </section>
      <p className="mt-5 text-center text-[10px] text-white/30">Nutrifit • Controle interno de parcerias • Dados sincronizados com o banco operacional</p>
    </div>
  </main>;
}
