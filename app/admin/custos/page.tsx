"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Save, Trash2, Search, Calculator, UserRound, Receipt, TrendingDown, RefreshCw, LogIn } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Order = { id:string; created_at:string; customer_name:string|null; total:number; status:string; };
type CostRecord = { id:string; order_id:string; customer_name:string; revenue:number; amount_paid:number; status:string; notes:string|null; profile_snapshot:Record<string,unknown>; created_at:string; };
type CostItem = { id:string; cost_record_id:string; category:string; item_name:string; quantity:number; unit:string; unit_price:number; total_cost:number; is_estimate:boolean; notes:string|null; sort_order:number; };
type Profile = { id:string; customer_name:string; usual_preferences:Record<string,unknown>; notes:string|null; };
type DraftItem = { category:string; item_name:string; quantity:string; unit:string; unit_price:string; is_estimate:boolean; notes:string; };

const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v||0));
const fmtDate=(v:string)=>new Date(v).toLocaleDateString("pt-BR");
const num=(v:unknown)=>Number.isFinite(Number(v))?Number(v):0;
const blankItem:DraftItem={category:"ingrediente",item_name:"",quantity:"1",unit:"un",unit_price:"0",is_estimate:false,notes:""};

async function api(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string>={apikey:KEY,"Content-Type":"application/json",...(init.headers as Record<string,string>||{})};
  if(token)headers.Authorization="Bearer "+token;
  const response=await fetch(path.startsWith("http")?path:URL+path,{...init,headers});
  const body=await response.text();
  if(response.status===401)throw new Error("Sessão expirada. Entre novamente.");
  if(!response.ok)throw new Error(body||"Falha ao consultar o banco de dados.");
  return body?JSON.parse(body):null;
}

export default function CustomerCostsPage(){
  const [token,setToken]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [records,setRecords]=useState<CostRecord[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [items,setItems]=useState<CostItem[]>([]);
  const [allCostItems,setAllCostItems]=useState<CostItem[]>([]);
  const [selectedId,setSelectedId]=useState("");
  const [search,setSearch]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [draft,setDraft]=useState<DraftItem>(blankItem);
  const [recordDraft,setRecordDraft]=useState({revenue:"",amount_paid:"",status:"em_apuracao",notes:""});
  const [profileDraft,setProfileDraft]=useState({usual_preferences:"",notes:""});

  const load=useCallback(async(t=token)=>{
    if(!t)return;
    setBusy(true);setError("");
    try{
      const [r,o,p,allItems]=await Promise.all([
        api("/rest/v1/customer_order_costs?select=*&order=created_at.desc&limit=500",t),
        api("/rest/v1/customer_orders?select=id,created_at,customer_name,total,status&order=created_at.desc&limit=200",t),
        api("/rest/v1/customer_cost_profiles?select=*&order=customer_name.asc&limit=500",t),
        api("/rest/v1/customer_order_cost_items?select=*&order=created_at.asc&limit=5000",t)
      ]);
      setRecords((r||[]) as CostRecord[]);setOrders((o||[]) as Order[]);setProfiles((p||[]) as Profile[]);setAllCostItems((allItems||[]) as CostItem[]);
      const saved=records.length?selectedId:"";
      const next=(r||[]) as CostRecord[];
      const chosen=next.find(x=>x.id===saved)||next[0];
      setSelectedId(chosen?.id||"");
      if(chosen){
        const its=await api("/rest/v1/customer_order_cost_items?select=*&cost_record_id=eq."+chosen.id+"&order=sort_order.asc,created_at.asc",t);
        setItems((its||[]) as CostItem[]);
        setRecordDraft({revenue:String(chosen.revenue??0),amount_paid:String(chosen.amount_paid??0),status:chosen.status||"em_apuracao",notes:chosen.notes||""});
        const prof=((p||[]) as Profile[]).find(x=>x.customer_name.toLowerCase()===chosen.customer_name.toLowerCase());
        setProfileDraft({usual_preferences:JSON.stringify(prof?.usual_preferences||{},null,2),notes:prof?.notes||""});
      }else{setItems([]);}
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar os custos.");}
    finally{setBusy(false);}
  },[token,selectedId,records.length]);

  useEffect(()=>{
    const saved=sessionStorage.getItem("nutrifit_admin_token")||"";
    const savedEmail=sessionStorage.getItem("nutrifit_admin_email")||"";
    if(savedEmail)setEmail(savedEmail);
    if(saved){setToken(saved);void load(saved);}
  },[]);

  async function login(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");
    try{
      const data=await api("/auth/v1/token?grant_type=password","",{method:"POST",body:JSON.stringify({email:email.trim().toLowerCase(),password})});
      if(!data?.access_token)throw new Error("Token ausente");
      sessionStorage.setItem("nutrifit_admin_token",data.access_token);
      sessionStorage.setItem("nutrifit_admin_email",email.trim().toLowerCase());
      setToken(data.access_token);setPassword("");await load(data.access_token);
    }catch(e){setError(e instanceof Error?e.message:"E-mail ou senha inválidos.");}
    finally{setBusy(false);}
  }

  const selected=records.find(r=>r.id===selectedId)||null;
  const selectedItems=useMemo(()=>items.filter(i=>i.cost_record_id===selectedId),[items,selectedId]);
  const customerHistory=useMemo(()=>records.filter(r=>selected&&r.customer_name.toLowerCase()===selected.customer_name.toLowerCase()).map(r=>{const costs=allCostItems.filter(i=>i.cost_record_id===r.id).reduce((sum,i)=>sum+num(i.total_cost),0);const profit=num(r.revenue)-costs;return {...r,costs,profit,margin:num(r.revenue)>0?profit/num(r.revenue)*100:0,estimated:allCostItems.some(i=>i.cost_record_id===r.id&&i.is_estimate)};}).sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime()),[records,selected,allCostItems]);
  const costTotal=selectedItems.reduce((s,i)=>s+num(i.total_cost),0);
  const profit=num(recordDraft.revenue)-costTotal;
  const margin=num(recordDraft.revenue)>0?profit/num(recordDraft.revenue)*100:0;
  const filtered=records.filter(r=>r.customer_name.toLowerCase().includes(search.toLowerCase())||r.order_id.toLowerCase().includes(search.toLowerCase()));
  const uncapturedOrders=orders.filter(o=>o.customer_name&&!records.some(r=>r.order_id===o.id));

  async function chooseRecord(r:CostRecord){
    setSelectedId(r.id);setRecordDraft({revenue:String(r.revenue??0),amount_paid:String(r.amount_paid??0),status:r.status||"em_apuracao",notes:r.notes||""});
    setError("");setNotice("");
    try{
      const [its,ps]=await Promise.all([
        api("/rest/v1/customer_order_cost_items?select=*&cost_record_id=eq."+r.id+"&order=sort_order.asc,created_at.asc",token),
        api("/rest/v1/customer_cost_profiles?select=*&customer_name=eq."+encodeURIComponent(r.customer_name)+"&limit=1",token)
      ]);
      setItems((prev)=>[...prev.filter(i=>i.cost_record_id!==r.id),...((its||[]) as CostItem[])]);
      const p=(ps||[])[0] as Profile|undefined;
      setProfileDraft({usual_preferences:JSON.stringify(p?.usual_preferences||{},null,2),notes:p?.notes||""});
    }catch(e){setError(e instanceof Error?e.message:"Erro ao abrir ficha.");}
  }

  async function createForOrder(order:Order){
    setBusy(true);setError("");setNotice("");
    try{
      const body={order_id:order.id,customer_name:order.customer_name||"Cliente sem nome",revenue:num(order.total),amount_paid:0,status:"em_apuracao",notes:"Ficha criada a partir do pedido. Registrar os custos reais e confirmar o valor efetivamente pago.",profile_snapshot:{}};
      const created=await api("/rest/v1/customer_order_costs?select=*",token,{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(body)});
      const rec=(created||[])[0] as CostRecord;
      if(!rec)throw new Error("A ficha não foi retornada pelo banco.");
      setRecords(prev=>[rec,...prev]);setSelectedId(rec.id);setItems([]);setRecordDraft({revenue:String(rec.revenue),amount_paid:"0",status:rec.status,notes:rec.notes||""});
      setNotice("Ficha de custos criada.");setProfileDraft({usual_preferences:"{}",notes:""});
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível criar a ficha.");}
    finally{setBusy(false);}
  }

  async function saveRecord(){
    if(!selected)return;setBusy(true);setError("");setNotice("");
    try{
      const revenue=num(recordDraft.revenue), paid=num(recordDraft.amount_paid);
      await api("/rest/v1/customer_order_costs?id=eq."+selected.id,token,{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({revenue,amount_paid:paid,status:recordDraft.status,notes:recordDraft.notes,updated_at:new Date().toISOString()})});
      setRecords(prev=>prev.map(r=>r.id===selected.id?{...r,revenue,amount_paid:paid,status:recordDraft.status,notes:recordDraft.notes}:r));
      let preferences:Record<string,unknown>={};
      try{preferences=JSON.parse(profileDraft.usual_preferences||"{}");if(!preferences||Array.isArray(preferences)||typeof preferences!=="object")throw new Error();}catch{throw new Error("As preferências precisam estar em JSON válido (objeto).");}
      const found=profiles.find(p=>p.customer_name.toLowerCase()===selected.customer_name.toLowerCase());
      const profileBody={customer_name:selected.customer_name,usual_preferences:preferences,notes:profileDraft.notes,updated_at:new Date().toISOString()};
      if(found){
        await api("/rest/v1/customer_cost_profiles?id=eq."+found.id,token,{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify(profileBody)});
        setProfiles(prev=>prev.map(p=>p.id===found.id?{...p,...profileBody}:p));
      }else{
        const created=await api("/rest/v1/customer_cost_profiles?select=*",token,{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(profileBody)});
        setProfiles(prev=>[...(created||[]),...prev]);
      }
      setNotice("Dados financeiros e ficha habitual salvos.");
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar.");}
    finally{setBusy(false);}
  }

  async function addItem(e:FormEvent){
    e.preventDefault();if(!selected)return;
    if(!draft.item_name.trim()){setError("Informe o nome do custo.");return;}
    const quantity=num(draft.quantity),unitPrice=num(draft.unit_price),total=Math.round(quantity*unitPrice*100)/100;
    setBusy(true);setError("");setNotice("");
    try{
      const payload={cost_record_id:selected.id,category:draft.category,item_name:draft.item_name.trim(),quantity,unit:draft.unit,unit_price:unitPrice,total_cost:total,is_estimate:draft.is_estimate,notes:draft.notes||null,sort_order:selectedItems.length+1};
      const result=await api("/rest/v1/customer_order_cost_items?select=*",token,{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify(payload)});
      setItems(prev=>[...prev,...((result||[]) as CostItem[])]);setAllCostItems(prev=>[...prev,...((result||[]) as CostItem[])]);setDraft(blankItem);setNotice("Custo adicionado.");
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível adicionar o custo.");}
    finally{setBusy(false);}
  }

  async function updateItem(item:CostItem,patch:Partial<CostItem>){
    setError("");setNotice("");
    const next={...item,...patch};
    if(patch.quantity!==undefined||patch.unit_price!==undefined)next.total_cost=Math.round(num(next.quantity)*num(next.unit_price)*100)/100;
    setItems(prev=>prev.map(i=>i.id===item.id?next:i));setAllCostItems(prev=>prev.map(i=>i.id===item.id?next:i));
    try{
      await api("/rest/v1/customer_order_cost_items?id=eq."+item.id,token,{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({category:next.category,item_name:next.item_name,quantity:next.quantity,unit:next.unit,unit_price:next.unit_price,total_cost:next.total_cost,is_estimate:next.is_estimate,notes:next.notes})});
      setNotice("Item atualizado.");
    }catch(e){setItems(prev=>prev.map(i=>i.id===item.id?item:i));setAllCostItems(prev=>prev.map(i=>i.id===item.id?item:i));setError(e instanceof Error?e.message:"Falha ao atualizar item.");}
  }

  async function removeItem(item:CostItem){
    if(!confirm("Excluir este custo da ficha?"))return;
    setBusy(true);setError("");setNotice("");
    try{await api("/rest/v1/customer_order_cost_items?id=eq."+item.id,token,{method:"DELETE"});setItems(prev=>prev.filter(i=>i.id!==item.id));setAllCostItems(prev=>prev.filter(i=>i.id!==item.id));setNotice("Custo excluído.");}
    catch(e){setError(e instanceof Error?e.message:"Falha ao excluir custo.");}
    finally{setBusy(false);}
  }

  if(!token)return <main className="min-h-screen bg-[#080b07] px-4 py-10 text-white"><div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#10130d] p-6"><div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit · Gestão</div><h1 className="mt-2 text-2xl font-black">Controle de custos por cliente</h1><p className="mt-2 text-sm text-white/55">Entre com a mesma conta administrativa do site.</p><form onSubmit={login} className="mt-6 grid gap-3"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail administrativo" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"/><button disabled={busy} className="flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-4 py-3 font-black text-black disabled:opacity-50"><LogIn size={17}/>{busy?"Entrando...":"Entrar"}</button></form>{error&&<p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}</div></main>;

  return <main className="min-h-screen bg-[#080b07] px-3 pb-12 pt-5 text-white sm:px-6">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><a href="/admin" className="rounded-full border border-white/10 p-2.5" aria-label="Voltar ao painel"><ArrowLeft size={18}/></a><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit · Financeiro</div><h1 className="text-2xl font-black sm:text-3xl">Custos por cliente</h1><p className="mt-1 text-xs text-white/45">Ficha técnica, margem e comparação entre pedidos</p></div></div><button onClick={()=>void load()} disabled={busy} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-bold"><RefreshCw size={15}/>Atualizar</button></header>
      {error&&<div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
      {notice&&<div className="mb-4 rounded-xl border border-[#a7b86a]/20 bg-[#a7b86a]/10 p-3 text-sm text-[#d9e5a5]">{notice}</div>}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-[#0d110b] p-4">
          <div className="mb-3 flex items-center gap-2"><Search size={16} className="text-white/35"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente ou pedido" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"/></div>
          <div className="mb-3 text-[10px] font-black uppercase tracking-[.15em] text-white/35">Fichas registradas ({filtered.length})</div>
          <div className="grid gap-2">{filtered.map(r=><button key={r.id} onClick={()=>void chooseRecord(r)} className={"rounded-2xl border p-3 text-left "+(selectedId===r.id?"border-[#ef7d18]/50 bg-[#ef7d18]/10":"border-white/10 bg-white/[.02]")}><div className="flex items-start justify-between gap-2"><span className="font-black">{r.customer_name}</span><span className="text-xs text-[#ef7d18]">{money(r.revenue)}</span></div><div className="mt-1 truncate text-[10px] text-white/35">Pedido {r.order_id.slice(0,8)} · {fmtDate(r.created_at)}</div><div className="mt-2 text-xs text-white/50">{r.status==="completo"?"Apuração completa":r.status==="cancelado"?"Cancelado":"Em apuração"}</div></button>)}</div>
          {uncapturedOrders.length>0&&<details className="mt-4 rounded-2xl border border-white/10 p-3"><summary className="cursor-pointer text-xs font-bold text-[#a7b86a]">Criar ficha de outro pedido ({uncapturedOrders.length})</summary><div className="mt-3 grid gap-2">{uncapturedOrders.map(o=><button key={o.id} disabled={busy} onClick={()=>void createForOrder(o)} className="rounded-xl bg-white/5 p-3 text-left text-xs"><span className="block font-bold">{o.customer_name}</span><span className="mt-1 block text-white/45">{money(num(o.total))} · {fmtDate(o.created_at)}</span></button>)}</div></details>}
        </aside>
        {!selected?<section className="rounded-3xl border border-white/10 bg-[#0d110b] p-8 text-center"><Receipt size={32} className="mx-auto text-white/30"/><h2 className="mt-3 text-xl font-black">Selecione uma ficha</h2><p className="mt-2 text-sm text-white/45">Abra a ficha do Daniel ou crie uma a partir de outro pedido.</p></section>:
        <section className="grid min-w-0 gap-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className="text-xs text-white/45">Valor do pedido</div><div className="mt-2 text-2xl font-black">{money(num(recordDraft.revenue))}</div></div>
            <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className="text-xs text-white/45">Custos registrados</div><div className="mt-2 text-2xl font-black">{money(costTotal)}</div><div className="mt-1 text-[10px] text-white/35">Pode haver despesas faltantes</div></div>
            <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className="text-xs text-white/45">Saldo parcial</div><div className={"mt-2 text-2xl font-black "+(profit>=0?"text-[#a7b86a]":"text-red-300")}>{money(profit)}</div></div>
            <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className="text-xs text-white/45">Margem parcial</div><div className="mt-2 text-2xl font-black">{margin.toFixed(1).replace(".",",")}%</div><div className="mt-1 text-[10px] text-white/35">Sobre o valor do pedido</div></div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2"><TrendingDown size={18} className="text-[#a7b86a]"/><h2 className="text-lg font-black">Histórico e comparação deste cliente</h2></div>
            <p className="mb-3 text-xs text-white/45">Compara os pedidos registrados do mesmo cliente. O saldo é parcial enquanto houver custos estimados ou despesas ainda não lançadas.</p>
            <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="text-white/45"><tr><th className="px-2 py-2">Data</th><th className="px-2 py-2">Pedido</th><th className="px-2 py-2">Receita</th><th className="px-2 py-2">Custos lançados</th><th className="px-2 py-2">Saldo parcial</th><th className="px-2 py-2">Margem parcial</th><th className="px-2 py-2">Apuração</th></tr></thead><tbody>{customerHistory.map(h=><tr key={h.id} className={"border-t border-white/10 "+(h.id===selectedId?"bg-white/[.04]":"")}><td className="px-2 py-3">{fmtDate(h.created_at)}</td><td className="px-2 py-3"><button onClick={()=>void chooseRecord(h)} className="font-bold text-[#ef7d18]">#{h.order_id.slice(0,8)}</button></td><td className="px-2 py-3">{money(h.revenue)}</td><td className="px-2 py-3">{money(h.costs)}</td><td className="px-2 py-3">{money(h.profit)}</td><td className="px-2 py-3">{h.margin.toFixed(1).replace(".",",")}%</td><td className="px-2 py-3">{h.estimated?"Tem estimativas":h.costs===0?"Sem custos lançados":"Custos lançados"}</td></tr>)}</tbody></table></div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2"><Receipt size={18} className="text-[#ef7d18]"/><h2 className="text-lg font-black">Resumo financeiro do pedido</h2></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-1 text-xs text-white/55">Valor cobrado (R$)<input type="number" min="0" step=".01" value={recordDraft.revenue} onChange={e=>setRecordDraft({...recordDraft,revenue:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
              <label className="grid gap-1 text-xs text-white/55">Valor efetivamente pago (R$)<input type="number" min="0" step=".01" value={recordDraft.amount_paid} onChange={e=>setRecordDraft({...recordDraft,amount_paid:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
              <label className="grid gap-1 text-xs text-white/55">Status da apuração<select value={recordDraft.status} onChange={e=>setRecordDraft({...recordDraft,status:e.target.value})} className="rounded-xl border border-white/10 bg-[#10130d] px-3 py-2.5 text-sm text-white"><option value="em_apuracao">Em apuração</option><option value="completo">Completo</option><option value="cancelado">Cancelado</option></select></label>
              <div className="flex items-end"><button onClick={()=>void saveRecord()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-4 py-3 text-sm font-black text-black disabled:opacity-50"><Save size={16}/>Salvar resumo e ficha</button></div>
            </div>
            <label className="mt-3 grid gap-1 text-xs text-white/55">Observações do pedido<textarea rows={2} value={recordDraft.notes} onChange={e=>setRecordDraft({...recordDraft,notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2"><Calculator size={18} className="text-[#a7b86a]"/><h2 className="text-lg font-black">Itens de custo</h2></div>
            <div className="grid gap-3">{selectedItems.map(item=><div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.02] p-3">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.3fr_.8fr_.55fr_.55fr_.65fr_auto]">
                <label className="grid gap-1 text-[10px] text-white/45">Item<input value={item.item_name} onChange={e=>setItems(prev=>prev.map(x=>x.id===item.id?{...x,item_name:e.target.value}:x))} onBlur={()=>void updateItem(item,{item_name:items.find(x=>x.id===item.id)?.item_name||item.item_name})} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white"/></label>
                <label className="grid gap-1 text-[10px] text-white/45">Categoria<select value={item.category} onChange={e=>void updateItem(item,{category:e.target.value})} className="rounded-lg border border-white/10 bg-[#10130d] px-2 py-2 text-xs text-white"><option value="ingrediente">Ingrediente</option><option value="embalagem">Embalagem</option><option value="identificacao">Etiqueta/lacre</option><option value="transporte">Transporte</option><option value="operacional">Operacional</option><option value="outro">Outro</option></select></label>
                <label className="grid gap-1 text-[10px] text-white/45">Quantidade<input type="number" min="0" step=".001" value={item.quantity} onChange={e=>setItems(prev=>prev.map(x=>x.id===item.id?{...x,quantity:num(e.target.value)}:x))} onBlur={()=>void updateItem(item,{quantity:items.find(x=>x.id===item.id)?.quantity??item.quantity})} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white"/></label>
                <label className="grid gap-1 text-[10px] text-white/45">Unidade<input value={item.unit} onChange={e=>setItems(prev=>prev.map(x=>x.id===item.id?{...x,unit:e.target.value}:x))} onBlur={()=>void updateItem(item,{unit:items.find(x=>x.id===item.id)?.unit||item.unit})} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white"/></label>
                <label className="grid gap-1 text-[10px] text-white/45">Preço unitário<input type="number" min="0" step=".0001" value={item.unit_price} onChange={e=>setItems(prev=>prev.map(x=>x.id===item.id?{...x,unit_price:num(e.target.value)}:x))} onBlur={()=>void updateItem(item,{unit_price:items.find(x=>x.id===item.id)?.unit_price??item.unit_price})} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white"/></label>
                <button onClick={()=>void removeItem(item)} title="Excluir item" className="self-end rounded-lg border border-red-400/20 p-2 text-red-300"><Trash2 size={16}/></button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><label className="flex items-center gap-2 text-[11px] text-white/55"><input type="checkbox" checked={item.is_estimate} onChange={e=>void updateItem(item,{is_estimate:e.target.checked})}/>Estimativa (confirmar)</label><div className="text-right"><span className="mr-2 text-[10px] text-white/35">Subtotal</span><strong>{money(num(item.total_cost))}</strong></div></div>
              <label className="mt-2 grid gap-1 text-[10px] text-white/45">Observação<input value={item.notes||""} onChange={e=>setItems(prev=>prev.map(x=>x.id===item.id?{...x,notes:e.target.value}:x))} onBlur={()=>void updateItem(item,{notes:items.find(x=>x.id===item.id)?.notes||""})} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white"/></label>
            </div>)}</div>
            <form onSubmit={addItem} className="mt-4 rounded-2xl border border-dashed border-white/20 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black"><Plus size={16}/>Adicionar gasto</h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1 text-xs text-white/55">Descrição<input required value={draft.item_name} onChange={e=>setDraft({...draft,item_name:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white" placeholder="Ex.: caixa térmica"/></label>
                <label className="grid gap-1 text-xs text-white/55">Categoria<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})} className="rounded-xl border border-white/10 bg-[#10130d] px-3 py-2.5 text-sm text-white"><option value="ingrediente">Ingrediente</option><option value="embalagem">Embalagem</option><option value="identificacao">Etiqueta/lacre</option><option value="transporte">Transporte</option><option value="operacional">Operacional</option><option value="outro">Outro</option></select></label>
                <label className="grid gap-1 text-xs text-white/55">Quantidade<input required type="number" min="0" step=".001" value={draft.quantity} onChange={e=>setDraft({...draft,quantity:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
                <label className="grid gap-1 text-xs text-white/55">Unidade<input required value={draft.unit} onChange={e=>setDraft({...draft,unit:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
                <label className="grid gap-1 text-xs text-white/55">Preço por unidade (R$)<input required type="number" min="0" step=".0001" value={draft.unit_price} onChange={e=>setDraft({...draft,unit_price:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
                <label className="flex items-center gap-2 text-xs text-white/55"><input type="checkbox" checked={draft.is_estimate} onChange={e=>setDraft({...draft,is_estimate:e.target.checked})}/>É estimativa</label>
                <label className="grid gap-1 text-xs text-white/55 sm:col-span-2">Observação<input value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
                <div className="flex items-end"><button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black disabled:opacity-50"><Plus size={16}/>Adicionar item</button></div>
              </div>
            </form>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2"><UserRound size={18} className="text-[#a7b86a]"/><h2 className="text-lg font-black">Ficha habitual do cliente</h2></div>
            <p className="mb-3 text-xs text-white/45">Guarde porções, cortes preferidos, acompanhamentos e instruções recorrentes. Esses dados servem de referência para novos pedidos, sem alterar pedidos anteriores.</p>
            <label className="grid gap-1 text-xs text-white/55">Preferências e porções (JSON)<textarea rows={5} value={profileDraft.usual_preferences} onChange={e=>setProfileDraft({...profileDraft,usual_preferences:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs text-white"/></label>
            <label className="mt-3 grid gap-1 text-xs text-white/55">Observações do cliente<textarea rows={2} value={profileDraft.notes} onChange={e=>setProfileDraft({...profileDraft,notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"/></label>
            <button onClick={()=>void saveRecord()} disabled={busy} className="mt-3 flex items-center gap-2 rounded-full border border-[#a7b86a]/30 px-4 py-2.5 text-sm font-bold text-[#d9e5a5]"><Save size={15}/>Salvar ficha habitual</button>
          </div>
        </section>}
      </div>
      <footer className="mt-6 flex items-start gap-2 text-xs text-white/40"><TrendingDown size={15} className="mt-0.5 shrink-0"/><p>O saldo e a margem são parciais enquanto houver itens estimados ou despesas não lançadas. Os custos ficam vinculados ao pedido e não alteram o valor cobrado nem o fluxo normal de compra.</p></footer>
    </div>
  </main>;
}
