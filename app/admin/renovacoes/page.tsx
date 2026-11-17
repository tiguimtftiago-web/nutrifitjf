"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Clock3, MessageCircle, Pause, Play, Plus, RefreshCw, Search, Users, X } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Customer = { id:string; name:string; whatsapp:string|null; email:string|null; created_at:string; last_order_at:string|null; order_count:number };
type Order = { id:string; customer_profile_id:string|null; customer_name:string|null; created_at:string; item_count:number; total:number; status:string; notes:string|null };
type Plan = { id:string; customer_profile_id:string; cycle_type:"weekly"|"fortnightly"|"monthly"|"custom"; cycle_days:number; planned_quantity:number; cycle_anchor_date:string; next_order_date:string; reminder_date:string; status:"active"|"paused"|"contacted"|"confirmed"|"declined"; last_contact_at:string|null; notes:string|null };
type Filter = "all"|"due"|"unconfigured"|"active";

const cycleLabels:Record<string,string> = { weekly:"Semanal", fortnightly:"Quinzenal", monthly:"Mensal", custom:"Personalizado" };
const statusLabels:Record<string,string> = { active:"Ativo", paused:"Pausado", contacted:"Contato realizado", confirmed:"Renovação confirmada", declined:"Não vai renovar" };
const todayISO = () => { const d=new Date(); return localISO(d); };
function localISO(d:Date) { return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); }
function addDays(date:string, days:number) { const d=new Date(date+"T12:00:00"); d.setDate(d.getDate()+days); return localISO(d); }
function dateLabel(date:string|null|undefined) { if(!date)return "Não informado"; const d=new Date(date.length===10?date+"T12:00:00":date); return Number.isNaN(d.getTime())?"Não informado":d.toLocaleDateString("pt-BR"); }
function phoneDigits(phone:string|null|undefined) { return String(phone||"").replace(/\D/g,""); }
function money(value:number) { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value||0)); }

async function api(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string>={apikey:KEY,"Content-Type":"application/json",...(init.headers as Record<string,string>||{})};
  if(token) headers.Authorization="Bearer "+token;
  const response=await fetch(path,{...init,headers});
  const raw=await response.text();
  if(response.status===401) throw new Error("Sessão expirada. Entre novamente.");
  if(!response.ok) throw new Error(raw||"Falha ao consultar o banco de dados.");
  return raw?JSON.parse(raw):null;
}

export default function RenewalsPage() {
  const [token,setToken]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [plans,setPlans]=useState<Plan[]>([]);
  const [filter,setFilter]=useState<Filter>("all");
  const [search,setSearch]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [editing,setEditing]=useState<Customer|null>(null);
  const [form,setForm]=useState({cycle_type:"monthly" as Plan["cycle_type"],cycle_days:30,planned_quantity:0,cycle_anchor_date:todayISO(),next_order_date:addDays(todayISO(),30),status:"active" as Plan["status"],notes:""});

  const load=useCallback(async(t=token)=>{
    if(!t)return;
    setBusy(true);setError("");
    try {
      const [c,o,p]=await Promise.all([
        api(URL+"/rest/v1/customer_profiles?select=id,name,whatsapp,email,created_at,last_order_at,order_count&order=name.asc&limit=1000",t),
        api(URL+"/rest/v1/customer_orders?select=id,customer_profile_id,customer_name,created_at,item_count,total,status,notes&order=created_at.desc&limit=2000",t),
        api(URL+"/rest/v1/customer_recurrence_plans?select=*&limit=1000",t)
      ]);
      setCustomers(c||[]);setOrders(o||[]);setPlans(p||[]);
    } catch(e) {
      const message=e instanceof Error?e.message:"Não foi possível carregar os dados.";
      setError(message);
      if(message.includes("Sessão expirada")){sessionStorage.removeItem("nutrifit_admin_token");setToken("");}
    } finally {setBusy(false);}
  },[token]);

  useEffect(()=>{
    const saved=sessionStorage.getItem("nutrifit_admin_token")||"";
    const savedEmail=sessionStorage.getItem("nutrifit_admin_email")||"";
    if(savedEmail)setEmail(savedEmail);
    if(saved){setToken(saved);void load(saved);}
  },[load]);

  const orderByCustomer=useMemo(()=>{
    const map=new Map<string,Order>();
    for(const order of orders){
      if(!order.customer_profile_id||order.status==="cancelado"||Number(order.total||0)===0||String(order.notes||"").toLowerCase().includes("teste interno"))continue;
      if(!map.has(order.customer_profile_id))map.set(order.customer_profile_id,order);
    }
    return map;
  },[orders]);
  const planByCustomer=useMemo(()=>new Map(plans.map(p=>[p.customer_profile_id,p])),[plans]);
  const rows=useMemo(()=>customers.map(customer=>{
    const lastOrder=orderByCustomer.get(customer.id)||null;
    const plan=planByCustomer.get(customer.id)||null;
    const due=!!plan&&plan.status!=="paused"&&plan.status!=="declined"&&plan.reminder_date<=todayISO();
    return {customer,lastOrder,plan,due};
  }).filter(row=>{
    const q=search.trim().toLocaleLowerCase("pt-BR");
    if(q&&!row.customer.name.toLocaleLowerCase("pt-BR").includes(q)&&!phoneDigits(row.customer.whatsapp).includes(phoneDigits(q)))return false;
    if(filter==="due")return row.due;
    if(filter==="unconfigured")return !row.plan;
    if(filter==="active")return !!row.plan&&row.plan.status!=="paused"&&row.plan.status!=="declined";
    return true;
  }),[customers,orderByCustomer,planByCustomer,filter,search]);

  const today=todayISO();
  const dueCount=customers.filter(c=>{const p=planByCustomer.get(c.id);return !!p&&p.status!=="paused"&&p.status!=="declined"&&p.reminder_date<=today;}).length;
  const activeCount=plans.filter(p=>p.status!=="paused"&&p.status!=="declined").length;
  const noPlanCount=customers.length-plans.length;

  function openEditor(customer:Customer) {
    const lastOrder=orderByCustomer.get(customer.id);
    const existing=planByCustomer.get(customer.id);
    const anchor=existing?.cycle_anchor_date|| (lastOrder?localISO(new Date(lastOrder.created_at)):todayISO());
    const days=existing?.cycle_days||30;
    setEditing(customer);
    setForm({
      cycle_type:existing?.cycle_type||"monthly",
      cycle_days:days,
      planned_quantity:existing?.planned_quantity||lastOrder?.item_count||0,
      cycle_anchor_date:anchor,
      next_order_date:existing?.next_order_date||addDays(anchor,days),
      status:existing?.status||"active",
      notes:existing?.notes||""
    });
    setError("");setNotice("");
  }

  function changeCycle(type:Plan["cycle_type"]) {
    const days=type==="weekly"?7:type==="fortnightly"?15:type==="monthly"?30:form.cycle_days;
    setForm(f=>({...f,cycle_type:type,cycle_days:days,next_order_date:addDays(f.cycle_anchor_date,days)}));
  }

  async function savePlan(e:FormEvent) {
    e.preventDefault();if(!editing||!token)return;
    if(!form.cycle_anchor_date||!form.next_order_date||form.cycle_days<1){setError("Informe as datas e um ciclo válido.");return;}
    setBusy(true);setError("");setNotice("");
    try {
      const payload={customer_profile_id:editing.id,cycle_type:form.cycle_type,cycle_days:Number(form.cycle_days),planned_quantity:Number(form.planned_quantity||0),cycle_anchor_date:form.cycle_anchor_date,next_order_date:form.next_order_date,status:form.status,notes:form.notes.trim()||null,updated_at:new Date().toISOString()};
      await api(URL+"/rest/v1/customer_recurrence_plans?on_conflict=customer_profile_id",token,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
      setEditing(null);setNotice("Planejamento de recorrência salvo.");await load();
    } catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar o planejamento.");}
    finally{setBusy(false);}
  }

  async function updatePlan(plan:Plan,patch:Partial<Plan>) {
    setBusy(true);setError("");setNotice("");
    try {
      await api(URL+"/rest/v1/customer_recurrence_plans?id=eq."+encodeURIComponent(plan.id),token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({...patch,updated_at:new Date().toISOString()})});
      setNotice("Planejamento atualizado.");await load();
    } catch(e){setError(e instanceof Error?e.message:"Não foi possível atualizar.");}
    finally{setBusy(false);}
  }

  async function login(e:FormEvent) {
    e.preventDefault();setBusy(true);setError("");
    try {
      const data=await api(URL+"/auth/v1/token?grant_type=password","",{method:"POST",body:JSON.stringify({email:email.trim().toLowerCase(),password})});
      if(!data?.access_token)throw new Error("Token não recebido.");
      sessionStorage.setItem("nutrifit_admin_token",data.access_token);
      sessionStorage.setItem("nutrifit_admin_email",email.trim().toLowerCase());
      setPassword("");setToken(data.access_token);await load(data.access_token);
    } catch {setError("E-mail ou senha inválidos, ou conta sem acesso administrativo.");}
    finally{setBusy(false);}
  }

  function openWhatsApp(customer:Customer,plan:Plan) {
    const phone=phoneDigits(customer.whatsapp);
    if(!phone)return;
    const text="Olá, "+customer.name.split(" ")[0]+"! Tudo bem? Estamos organizando nossa programação de produção da Nutrifit e gostaríamos de confirmar se você deseja renovar seu pedido de "+(plan.planned_quantity||"marmitas")+" marmitas para o próximo ciclo. Podemos reservar sua produção?";
    window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");
  }

  async function markRenewed(plan:Plan) {
    const anchor=todayISO();
    await updatePlan(plan,{cycle_anchor_date:anchor,next_order_date:addDays(anchor,plan.cycle_days),status:"active"});
  }

  if(!token) return <main className="min-h-screen bg-[#080a07] text-white flex items-center justify-center p-5"><form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10150d] p-6 shadow-2xl"><a href="/admin" className="mb-5 inline-flex items-center gap-2 text-sm text-[#c5d58d]"><ArrowLeft size={16}/> Voltar ao painel</a><div className="mb-2 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit • Gestão comercial</div><h1 className="text-2xl font-black">Renovação de pedidos</h1><p className="mt-2 text-sm text-white/55">Entre com a mesma conta administrativa do painel Nutrifit.</p><label className="mt-5 block text-xs font-bold text-white/65">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-[#a7b86a]"/></label><label className="mt-3 block text-xs font-bold text-white/65">Senha<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-[#a7b86a]"/></label>{error&&<p className="mt-3 text-sm text-orange-300">{error}</p>}<button disabled={busy} className="mt-5 w-full rounded-xl bg-[#a7b86a] p-3 font-black text-black">{busy?"Entrando...":"Entrar"}</button></form></main>;

  return <main className="min-h-screen bg-[#080a07] px-4 pb-12 pt-5 text-white sm:px-6">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><a href="/admin" className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70"><ArrowLeft size={18}/></a><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit • Gestão comercial</div><h1 className="text-2xl font-black sm:text-3xl">Renovação de pedidos</h1><p className="mt-1 text-sm text-white/45">Antecipe contatos e organize a demanda recorrente.</p></div></div>
        <button onClick={()=>void load()} disabled={busy} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold"><RefreshCw size={15} className={"mr-2 inline "+(busy?"animate-spin":"")}/> Atualizar</button>
      </header>
      {error&&<div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">{error}</div>}
      {notice&&<div className="mb-4 rounded-xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-3 text-sm text-[#dce8ad]">{notice}</div>}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[{label:"Clientes cadastrados",value:customers.length,icon:Users},{label:"Ciclos ativos",value:activeCount,icon:Play},{label:"Contatos para fazer",value:dueCount,icon:CalendarClock},{label:"Sem ciclo definido",value:noPlanCount,icon:Clock3}].map(({label,value,icon:Icon})=><article key={label} className="rounded-2xl border border-white/10 bg-[#10150d] p-4"><div className="flex items-center justify-between text-xs text-white/45"><span>{label}</span><Icon size={17} className="text-[#a7b86a]"/></div><div className="mt-2 text-3xl font-black text-[#e5edc5]">{value}</div></article>)}
      </section>
      <section className="mb-5 rounded-2xl border border-white/10 bg-[#10150d] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">Carteira de clientes</h2><p className="text-xs text-white/45">A data do último pedido vem do histórico vinculado; o ciclo só é previsto depois de configurado.</p></div><div className="relative w-full sm:max-w-xs"><Search size={15} className="absolute left-3 top-3 text-white/35"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente ou WhatsApp" className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#a7b86a]"/></div></div>
        <div className="mt-4 flex flex-wrap gap-2">{([{id:"all",label:"Todos"},{id:"due",label:"Contatar agora"},{id:"unconfigured",label:"Sem ciclo"},{id:"active",label:"Ciclos ativos"}] as {id:Filter;label:string}[]).map(item=><button key={item.id} onClick={()=>setFilter(item.id)} className={"rounded-full px-3 py-2 text-xs font-black "+(filter===item.id?"bg-[#a7b86a] text-black":"border border-white/10 bg-white/5 text-white/60")}>{item.label}</button>)}</div>
      </section>
      <section className="grid gap-3 lg:grid-cols-2">
        {rows.map(({customer,lastOrder,plan,due})=><article key={customer.id} className={"rounded-2xl border p-4 "+(due?"border-[#ef7d18]/45 bg-[#17120c]":"border-white/10 bg-[#10150d]")}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{customer.name}</h3><p className="mt-1 text-xs text-white/45">{customer.whatsapp||"WhatsApp não informado"} • {customer.email||"E-mail não informado"}</p></div><span className={"rounded-full px-2.5 py-1 text-[10px] font-black "+(due?"bg-[#ef7d18]/15 text-[#ffb36b]":plan?.status==="paused"?"bg-white/10 text-white/55":"bg-[#a7b86a]/10 text-[#d5e3a0]")}>{due?"Contato pendente":plan?statusLabels[plan.status]:"Período a definir"}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-black/25 p-3"><span className="text-white/40">Último pedido</span><p className="mt-1 font-bold">{lastOrder?dateLabel(lastOrder.created_at):"Sem pedido vinculado"}</p><p className="mt-1 text-white/40">{lastOrder?lastOrder.item_count+" marmitas • "+money(lastOrder.total):"Não há histórico associado"}</p></div><div className="rounded-xl bg-black/25 p-3"><span className="text-white/40">Frequência</span><p className="mt-1 font-bold">{plan?cycleLabels[plan.cycle_type]+" ("+plan.cycle_days+" dias)":"Não definida"}</p><p className="mt-1 text-white/40">{plan?(plan.planned_quantity||"Qtd. a definir")+" marmitas previstas":"Configure o ciclo"}</p></div></div>
          {plan&&<div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><span className="text-white/40">Próximo pedido previsto</span><p className="mt-1 font-bold text-[#dce8ad]">{dateLabel(plan.next_order_date)}</p></div><div><span className="text-white/40">Lembrar em (D-2)</span><p className={"mt-1 font-bold "+(due?"text-[#ffb36b]":"text-white")}>{dateLabel(plan.reminder_date)}</p></div></div>}
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>openEditor(customer)} className="rounded-xl bg-[#a7b86a] px-3 py-2 text-xs font-black text-black"><Plus size={14} className="mr-1 inline"/>{plan?"Editar ciclo":"Configurar recorrência"}</button>{plan&&<><button onClick={()=>updatePlan(plan,{status:plan.status==="paused"?"active":"paused"})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold">{plan.status==="paused"?<Play size={13} className="mr-1 inline"/>:<Pause size={13} className="mr-1 inline"}/>{plan.status==="paused"?"Retomar":"Pausar"}</button><button onClick={()=>openWhatsApp(customer,plan)} disabled={!phoneDigits(customer.whatsapp)} className="rounded-xl border border-[#25d366]/30 bg-[#25d366]/10 px-3 py-2 text-xs font-bold text-[#8be4a7]"><MessageCircle size={13} className="mr-1 inline"/>WhatsApp</button>{due&&<button onClick={()=>updatePlan(plan,{status:"contacted",last_contact_at:new Date().toISOString()})} className="rounded-xl border border-[#ef7d18]/30 bg-[#ef7d18]/10 px-3 py-2 text-xs font-bold text-[#ffb36b]">Marcar contato feito</button>}{plan.status==="contacted"&&<button onClick={()=>markRenewed(plan)} className="rounded-xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-2 text-xs font-bold text-[#dce8ad]"><CheckCircle2 size={13} className="mr-1 inline"/>Registrar renovação</button>}</>}</div>
        </article>)}
        {rows.length===0&&<div className="rounded-2xl border border-white/10 bg-[#10150d] p-8 text-center text-sm text-white/45">Nenhum cliente encontrado neste filtro.</div>}
      </section>
      <p className="mt-6 text-xs text-white/35">Previsões são estimativas comerciais, não pedidos confirmados. Clientes sem ciclo configurado permanecem sem data calculada. Pedidos cancelados e registros identificados como teste não entram no cálculo do último pedido.</p>
    </div>
    {editing&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-5"><form onSubmit={savePlan} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#10150d] p-5 shadow-2xl sm:rounded-3xl"><div className="mb-5 flex items-start justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Planejamento individual</div><h2 className="mt-1 text-xl font-black">{editing.name}</h2><p className="mt-1 text-xs text-white/45">Configure a previsão de consumo e o contato D-2.</p></div><button type="button" onClick={()=>setEditing(null)} className="rounded-full bg-white/5 p-2"><X size={17}/></button></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-white/65">Frequência<select value={form.cycle_type} onChange={e=>changeCycle(e.target.value as Plan["cycle_type"])} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"><option value="weekly">Semanal (7 dias)</option><option value="fortnightly">Quinzenal (15 dias)</option><option value="monthly">Mensal (30 dias)</option><option value="custom">Personalizado</option></select></label><label className="text-xs font-bold text-white/65">Intervalo em dias<input required type="number" min="1" max="365" value={form.cycle_days} onChange={e=>setForm(f=>({...f,cycle_days:Number(e.target.value),next_order_date:addDays(f.cycle_anchor_date,Number(e.target.value)||1)}))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label><label className="text-xs font-bold text-white/65">Data-base do ciclo<input required type="date" value={form.cycle_anchor_date} onChange={e=>setForm(f=>({...f,cycle_anchor_date:e.target.value,next_order_date:addDays(e.target.value,f.cycle_days)}))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label><label className="text-xs font-bold text-white/65">Próximo pedido previsto<input required type="date" value={form.next_order_date} onChange={e=>setForm(f=>({...f,next_order_date:e.target.value}))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label><label className="text-xs font-bold text-white/65">Quantidade prevista<input type="number" min="0" value={form.planned_quantity} onChange={e=>setForm(f=>({...f,planned_quantity:Number(e.target.value)}))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label><label className="text-xs font-bold text-white/65">Situação<select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as Plan["status"]}))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"><option value="active">Ativo</option><option value="paused">Pausado</option><option value="declined">Não vai renovar</option></select></label></div>
      <label className="mt-3 block text-xs font-bold text-white/65">Observações<textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" placeholder="Ex.: cliente contrata 30 marmitas para consumo ao longo do mês."/></label>
      <div className="mt-4 rounded-xl border border-[#a7b86a]/20 bg-[#a7b86a]/[.06] p-3 text-xs text-[#dce8ad]">Próximo contato sugerido: <b>{dateLabel(addDays(form.next_order_date,-2))}</b> (dois dias antes do próximo pedido previsto).</div>
      {error&&<p className="mt-3 text-sm text-orange-300">{error}</p>}
      <div className="mt-5 flex gap-2"><button type="button" onClick={()=>setEditing(null)} className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-bold">Cancelar</button><button disabled={busy} className="flex-1 rounded-xl bg-[#a7b86a] p-3 text-sm font-black text-black">{busy?"Salvando...":"Salvar planejamento"}</button></div>
    </form></div>}
  </main>;
}
