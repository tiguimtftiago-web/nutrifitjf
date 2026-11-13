"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Loader2, RefreshCw, Send, X } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Review = {
  id:string; order_id:string; customer_name:string; food_quality:number;
  ingredient_quality:number; portion_size:number; service:number; delivery:number;
  overall_rating:number; recommend:boolean; comment:string|null;
  publish_consent:boolean; name_consent:boolean; status:string; created_at:string;
  whatsapp_notification_status:"not_sent"|"sent"|"failed"|"not_configured";
  whatsapp_sent_at:string|null; whatsapp_notification_error:string|null;
};

export default function AdminReviewsPage() {
  const [token,setToken] = useState("");
  const [reviews,setReviews] = useState<Review[]>([]);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState("");
  const [error,setError] = useState("");

  async function load(currentToken:string) {
    setLoading(true);setError("");
    try {
      const response=await fetch(URL+"/rest/v1/customer_reviews?select=*&order=created_at.desc",{
        headers:{apikey:KEY,Authorization:"Bearer "+currentToken}
      });
      if(!response.ok) throw new Error(response.status===401?"Sessão expirada. Entre novamente no painel principal.":"Não foi possível carregar as avaliações.");
      setReviews(await response.json());
    } catch(e) {setError(e instanceof Error?e.message:"Erro ao carregar.");}
    finally {setLoading(false);}
  }

  useEffect(()=>{
    const saved=sessionStorage.getItem("nutrifit_admin_token")||"";
    setToken(saved);
    if(saved) void load(saved); else setLoading(false);
  },[]);

  async function moderate(review:Review,status:"approved"|"rejected") {
    if(!token)return;
    setBusy(review.id);setError("");
    try {
      const response=await fetch(URL+"/rest/v1/customer_reviews?id=eq."+encodeURIComponent(review.id),{
        method:"PATCH",
        headers:{apikey:KEY,Authorization:"Bearer "+token,"Content-Type":"application/json",Prefer:"return=minimal"},
        body:JSON.stringify({status,moderated_at:new Date().toISOString()})
      });
      if(!response.ok) throw new Error("Não foi possível atualizar a avaliação. Verifique sua permissão administrativa.");
      await load(token);
    } catch(e) {setError(e instanceof Error?e.message:"Erro ao atualizar.");}
    finally {setBusy("");}
  }

  async function resendWhatsApp(review:Review) {
    if(!token)return;
    setBusy(review.id);setError("");
    try {
      const response=await fetch("https://xdllpyqrbofszvallzxf.supabase.co/functions/v1/customer-reviews",{
        method:"POST",
        headers:{apikey:KEY,Authorization:"Bearer "+token,"Content-Type":"application/json"},
        body:JSON.stringify({action:"resend_whatsapp",review_id:review.id})
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Não foi possível reenviar a notificação.");
      await load(token);
    } catch(e) {setError(e instanceof Error?e.message:"Erro ao reenviar WhatsApp.");}
    finally {setBusy("");}
  }

  const pending=reviews.filter(r=>r.status==="pending");
  const published=reviews.filter(r=>r.status==="approved");
  return <main className="min-h-screen bg-[#080a07] px-4 py-6 text-white sm:px-6">
    <div className="mx-auto max-w-5xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ChevronLeft size={17}/>Voltar ao painel</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#f47b0b]">Nutrifit · Gestão</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Avaliações de clientes</h1><p className="mt-1 text-sm text-white/50">Confira os pedidos e aprove os depoimentos autorizados.</p></div>
        <button onClick={()=>token&&load(token)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold"><RefreshCw size={15}/>Atualizar</button>
      </div>
      {!token&&<div className="mt-6 rounded-2xl border border-[#f47b0b]/30 bg-[#10130d] p-5 text-sm text-white/70">Entre primeiro no <Link href="/admin" className="font-bold text-[#f5a623] underline">painel administrativo</Link>. Depois, abra novamente esta página para revisar as avaliações.</div>}
      {error&&<p role="alert" className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {token&&<div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#f47b0b]/30 bg-[#11130e] p-4"><p className="text-xs text-white/50">Aguardando análise</p><p className="mt-1 text-3xl font-black text-[#f5a623]">{pending.length}</p></div>
        <div className="rounded-2xl border border-[#86a51d]/30 bg-[#11160e] p-4"><p className="text-xs text-white/50">Publicadas</p><p className="mt-1 text-3xl font-black text-[#b6d76a]">{published.length}</p></div>
        <div className="rounded-2xl border border-white/10 bg-[#10130d] p-4"><p className="text-xs text-white/50">Total recebidas</p><p className="mt-1 text-3xl font-black">{reviews.length}</p></div>
      </div>}
      {loading?<div className="mt-8 flex items-center gap-2 text-sm text-white/50"><Loader2 className="animate-spin" size={18}/>Carregando avaliações…</div>:token&&<div className="mt-7 space-y-4">
        {reviews.length===0?<div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">Nenhuma avaliação recebida até agora.</div>:reviews.map(review=><article key={review.id} className="rounded-2xl border border-white/10 bg-[#10130d] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{review.customer_name}</p><p className="mt-1 text-[11px] text-white/40">{review.order_id ? "Pedido vinculado" : "Sem pedido vinculado"} · {new Date(review.created_at).toLocaleString("pt-BR")}</p></div><span className={review.status==="approved"?"rounded-full bg-[#86a51d]/15 px-3 py-1 text-xs text-[#b6d76a]":review.status==="rejected"?"rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300":"rounded-full bg-[#f47b0b]/15 px-3 py-1 text-xs text-[#ffb36b]"}>{review.status==="approved"?"Publicada":review.status==="rejected"?"Reprovada":"Pendente"}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">{[["Sabor",review.food_quality],["Ingredientes",review.ingredient_quality],["Porção",review.portion_size],["Atendimento",review.service],["Entrega",review.delivery],["Média",Number(review.overall_rating).toFixed(1)]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-white/[.035] p-3"><span className="text-white/45">{label}</span><b className="ml-2 text-[#f5a623]">{value}/5</b></div>)}</div>
          <p className="mt-3 text-xs text-white/55">Recomendaria a Nutrifit: <b className="text-white">{review.recommend?"Sim":"Não"}</b></p>
          {review.comment&&<blockquote className="mt-3 rounded-xl border-l-2 border-[#f47b0b] bg-white/[.025] p-3 text-sm leading-6 text-white/80">“{review.comment}”</blockquote>}
          <p className="mt-3 text-[11px] text-white/45">Publicação autorizada: {review.publish_consent?"Sim":"Não"} · Exibir nome: {review.name_consent?"Sim":"Não"} · Compra verificada: {review.order_id?"Sim":"Não"}</p>
          <p className="mt-2 text-xs text-white/55">WhatsApp: <b className={review.whatsapp_notification_status==="sent"?"text-[#b6d76a]":review.whatsapp_notification_status==="failed"?"text-red-300":"text-[#ffb36b]"}>{review.whatsapp_notification_status==="sent"?"Notificação enviada":review.whatsapp_notification_status==="failed"?"Falha no envio":review.whatsapp_notification_status==="not_configured"?"Integração não configurada":"Aguardando envio"}</b>{review.whatsapp_sent_at? ` · ${new Date(review.whatsapp_sent_at).toLocaleString("pt-BR")}`:""}</p>
          {review.whatsapp_notification_error&&<p className="mt-1 break-words text-[10px] text-red-300/80">Detalhe do envio: {review.whatsapp_notification_error}</p>}
          {review.whatsapp_notification_status!=="sent"&&<button disabled={busy===review.id} onClick={()=>resendWhatsApp(review)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#f47b0b]/35 px-3 py-2 text-xs font-bold text-[#ffb36b] disabled:opacity-50"><Send size={14}/>{busy===review.id?"Enviando…":"Enviar / reenviar aviso no WhatsApp"}</button>}
          {review.status==="pending"&&<div className="mt-4 flex flex-wrap gap-2"><button disabled={busy===review.id} onClick={()=>moderate(review,"approved")} className="inline-flex items-center gap-2 rounded-xl bg-[#86a51d] px-4 py-2.5 text-xs font-black text-black disabled:opacity-50"><Check size={15}/>Aprovar publicação</button><button disabled={busy===review.id} onClick={()=>moderate(review,"rejected")} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-300 disabled:opacity-50"><X size={15}/>Reprovar</button></div>}
        </article>)}
      </div>}
    </div>
  </main>;
}
