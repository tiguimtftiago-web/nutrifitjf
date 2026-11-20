"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldCheck, ArrowLeft } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Plan = {id:string;created_at:string;status:string;priority:string;area:string;title:string;description:string;source_diagnosis:any;result:any;completed_at:string|null};
type Audit = {
  id:string; created_at:string; agent_name:string; area:string; event_type:string;
  status:string; priority:string; title:string; details:string; source_table:string|null;
  source_record_id:string|null; evidence:any; changes_made:any; validation:any;
  requires_user_action:boolean; resolved_at:string|null;
};

const label=(v:string)=>({diagnostico:"Diagnóstico",correcao:"Correção",validacao:"Validação",bloqueio:"Bloqueio",alerta:"Alerta",identificado:"Identificado",executado:"Executado",validado:"Validado",bloqueado:"Bloqueado",falhou:"Falhou",sem_acao:"Sem ação",baixa:"Baixa",media:"Média",alta:"Alta",critica:"Crítica"} as Record<string,string>)[v]||v.replaceAll("_"," ");

export default function IntelligenceCenter(){
  const [token,setToken]=useState("");
  const [rows,setRows]=useState<Audit[]>([]);
  const [plans,setPlans]=useState<Plan[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState("abertos");
  const [area,setArea]=useState("todas");

  const load=useCallback(async(t=token)=>{
    if(!t){setLoading(false);return;}
    setLoading(true);setError("");
    try{
      const headers={apikey:KEY,Authorization:"Bearer "+t};
      const [res,planRes]=await Promise.all([fetch(URL+"/rest/v1/agent_audit_log?select=*&order=created_at.desc&limit=300",{headers}),fetch(URL+"/rest/v1/agent_action_plans?select=*&order=created_at.desc&limit=100",{headers})]);
      const body=await res.text(); const planBody=await planRes.text();
      if(!res.ok)throw new Error(res.status===401||res.status===403?"Acesso administrativo não autorizado. Entre novamente pelo painel.":body);
      if(!planRes.ok)throw new Error("Não foi possível carregar os planos compartilhados: "+planBody);
      setRows(body?JSON.parse(body):[]);setPlans(planBody?JSON.parse(planBody):[]);
    }catch(e){setError(e instanceof Error?e.message:"Falha ao consultar o histórico de auditoria.");}
    finally{setLoading(false);}
  },[token]);

  useEffect(()=>{const t=sessionStorage.getItem("nutrifit_admin_token")||"";setToken(t);if(t)void load(t);else setLoading(false);},[load]);

  const areas=useMemo(()=>["todas",...Array.from(new Set(rows.map(r=>r.area).filter(Boolean)))], [rows]);
  const open=rows.filter(r=>!r.resolved_at && (r.requires_user_action || ["identificado","bloqueado","falhou"].includes(r.status)));
  const critical=rows.filter(r=>r.priority==="critica"&&!r.resolved_at);
  const validated=rows.filter(r=>r.status==="validado");
  const visible=rows.filter(r=>{
    const statusOk=filter==="todos" || (filter==="abertos"?(!r.resolved_at&&(r.requires_user_action||["identificado","bloqueado","falhou"].includes(r.status))):filter==="validados"?r.status==="validado":r.status==="executados"?["executado","validado"].includes(r.status):true);
    return statusOk&&(area==="todas"||r.area===area);
  });

  return <main className="min-h-screen bg-[#080a08] px-4 py-5 pb-12 text-white sm:px-6">
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><a href="/admin" className="rounded-xl border border-white/10 p-2 text-white/70"><ArrowLeft size={18}/></a><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit · Governança</div><h1 className="text-2xl font-black sm:text-3xl">Central de Inteligência</h1><p className="mt-1 text-xs text-white/45">Auditoria integrada, pendências e validação dos agentes</p></div></div>
        <button onClick={()=>void load()} disabled={loading||!token} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs font-black disabled:opacity-40"><RefreshCw size={14} className={loading?"animate-spin":""}/>Atualizar</button>
      </div>

      {!token&&<div className="mb-4 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#ffb36b]">Não encontrei uma sessão administrativa ativa. Entre primeiro em <a className="underline" href="/admin">/admin</a>.</div>}
      {error&&<div className="mb-4 rounded-2xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Activity/>} label="Registros auditados" value={rows.length}/>
        <Stat icon={<AlertTriangle/>} label="Pendências abertas" value={open.length} accent={open.length>0}/>
        <Stat icon={<ShieldCheck/>} label="Validações concluídas" value={validated.length}/>
        <Stat icon={<Clock3/>} label="Prioridade crítica" value={critical.length} accent={critical.length>0}/>
      </div>

      <section className="mt-5 rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-6">
        <div className="mb-4"><h2 className="text-lg font-black">Planos compartilhados de ação</h2><p className="mt-1 text-xs text-white/40">Backlog central registrado no banco. Planos propostos ainda não significam execução autorizada.</p></div>
        <div className="mb-5 grid gap-2 md:grid-cols-3">{plans.map(p=><article key={p.id} className="rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-black uppercase text-[#c4d38c]">{p.area}</span><span className="text-[10px] text-white/40">{label(p.priority)}</span></div><h3 className="mt-2 text-sm font-black">{p.title}</h3><p className="mt-1 text-xs leading-5 text-white/55">{p.description}</p><div className="mt-2 text-[10px] text-white/35">Status: {p.status}</div></article>)}</div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-black">Fila de ocorrências e decisões</h2><p className="mt-1 text-xs text-white/40">O histórico mostra evidências registradas. Pendências não são baixadas automaticamente sem validação.</p></div>
          <div className="flex flex-wrap gap-2">
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#171b14] px-3 py-2 text-xs"><option value="abertos">Pendências abertas</option><option value="todos">Todos os registros</option><option value="executados">Executados</option><option value="validados">Validados</option></select>
            <select value={area} onChange={e=>setArea(e.target.value)} className="rounded-xl border border-white/10 bg-[#171b14] px-3 py-2 text-xs">{areas.map(a=><option key={a} value={a}>{a==="todas"?"Todas as áreas":a}</option>)}</select>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {loading&&<p className="py-8 text-center text-sm text-white/40">Carregando auditoria...</p>}
          {!loading&&visible.length===0&&<div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">Nenhum registro nesta seleção.</div>}
          {visible.map(r=><article key={r.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase text-white/65">{r.area}</span><span className={"rounded-full px-2.5 py-1 text-[10px] font-black "+(r.priority==="critica"?"bg-red-500/15 text-red-300":r.priority==="alta"?"bg-orange-500/15 text-orange-300":"bg-white/10 text-white/55")}>{label(r.priority)}</span><span className="text-[10px] text-white/35">{label(r.event_type)} · {label(r.status)}</span></div><h3 className="mt-2 break-words font-black">{r.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/65">{r.details}</p></div><time className="shrink-0 text-[10px] text-white/35">{new Date(r.created_at).toLocaleString("pt-BR")}</time></div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/40"><span>Agente: {r.agent_name}</span>{r.source_table&&<span>Origem: {r.source_table}</span>}{r.source_record_id&&<span>Registro: {r.source_record_id}</span>}{r.requires_user_action&&<span className="font-black text-[#ffb36b]">Requer sua decisão</span>}</div>
            {(r.evidence||r.validation||r.changes_made)&&<details className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-xs font-bold text-[#c4d38c]">Ver evidências, alterações e validação</summary><pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-[10px] leading-5 text-white/55">{JSON.stringify({evidencia:r.evidence,alteracoes:r.changes_made,validacao:r.validation},null,2)}</pre></details>}
          </article>)}
        </div>
      </section>
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[#a7b86a]/20 bg-[#a7b86a]/[.04] p-4 text-xs leading-5 text-white/50"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#a7b86a]"/>A Central é uma camada de supervisão. O processamento automático continua nos ciclos agendados e nas rotinas já integradas; esta tela não simula execução em tempo real.</div>
    </div>
  </main>;
}

function Stat({icon,label,value,accent=false}:{icon:React.ReactNode;label:string;value:number;accent?:boolean}){
  return <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className={accent?"text-[#ffb36b]":"text-[#a7b86a]"}>{icon}</div><div className="mt-3 text-xs text-white/40">{label}</div><div className="mt-1 text-2xl font-black">{value}</div></div>;
}
