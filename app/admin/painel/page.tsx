"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Bell, Box, ChefHat, CircleDollarSign, ClipboardList, HelpCircle, Home, Package, RefreshCw, ShoppingCart, Truck, Users, Wallet, ChartNoAxesColumn, Utensils, Megaphone, Settings, CalendarDays } from "lucide-react";

const API = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
type Row = Record<string, any>;
const brl = (n:number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const safeDate = (v:any) => v ? new Date(v) : null;
const isCancelled = (s:string) => ["cancelado","cancelada","canceled","cancelled"].includes(String(s||"").toLowerCase());
const itemRows = (raw:any):Row[] => {
  let value=raw;
  if(typeof value==="string"){try{value=JSON.parse(value)}catch{return []}}
  if(value && !Array.isArray(value) && Array.isArray(value.items)) value=value.items;
  if(!Array.isArray(value)) value=value && typeof value==="object" ? [value] : [];
  const result:Row[]=[];
  const visit=(item:any)=>{if(!item||typeof item!=="object")return;if(Array.isArray(item.items)){item.items.forEach(visit);return;}const name=String(item.name||item.product_name||item.title||item.description||"");if(name)result.push({name,quantity:Math.max(1,Number(item.quantity)||1),line:item.line||item.category||""});};
  value.forEach(visit);return result;
};

export default function AdminDashboardV7(){
  const [token,setToken]=useState("");
  const [orders,setOrders]=useState<Row[]>([]);
  const [customers,setCustomers]=useState<Row[]>([]);
  const [alerts,setAlerts]=useState<Row[]>([]);
  const [batches,setBatches]=useState<Row[]>([]);
  const [finance,setFinance]=useState<Row[]>([]);
  const [inventory,setInventory]=useState<Row[]>([]);
  const [period,setPeriod]=useState("7");
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState("");
  const [active,setActive]=useState("Dashboard");
  const [now,setNow]=useState(new Date());

  async function get(path:string,t:string){const r=await fetch(path,{headers:{apikey:KEY,Authorization:"Bearer "+t},cache:"no-store"});if(r.status===401){sessionStorage.removeItem("nutrifit_admin_token");window.location.href="/admin";throw new Error("Sessão expirada.");}const body=await r.text();if(!r.ok)throw new Error(body||"Falha ao consultar dados.");return body?JSON.parse(body):[];}
  async function load(t:string){setError("");const [o,c,a,b,f,i]=await Promise.all([
    get(API+"/rest/v1/customer_orders?select=*&order=created_at.desc&limit=500",t),
    get(API+"/rest/v1/customer_profiles?select=*&order=created_at.desc&limit=500",t),
    get(API+"/rest/v1/inventory_purchase_alerts?select=*&limit=100",t),
    get(API+"/rest/v1/production_batches?select=*&order=created_at.desc&limit=300",t),
    get(API+"/rest/v1/financial_transactions?select=*&order=created_at.desc&limit=500",t),
    get(API+"/rest/v1/inventory_items?select=*&active=eq.true&order=name.asc&limit=500",t)
  ]);setOrders(o||[]);setCustomers(c||[]);setAlerts(a||[]);setBatches(b||[]);setFinance(f||[]);setInventory(i||[]);setNow(new Date());}
  useEffect(()=>{const t=sessionStorage.getItem("nutrifit_admin_token")||"";if(!t){window.location.href="/admin";return;}setToken(t);load(t).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  useEffect(()=>{if(!token)return;const id=window.setInterval(()=>load(token).catch(e=>setError(e.message)),60000);return()=>window.clearInterval(id);},[token]);
  const start=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-Number(period)+1);return d;},[period,now.toDateString()]);
  const activeOrders=orders.filter(o=>!isCancelled(o.status));
  const scoped=activeOrders.filter(o=>{const d=safeDate(o.created_at);return d&&d>=start&&d<=now;});
  const revenue=scoped.reduce((s,o)=>s+Number(o.total||0),0);
  const average=scoped.length?revenue/scoped.length:0;
  const pending=activeOrders.filter(o=>["novo","enviado_whatsapp","confirmado","pago_recebido"].includes(o.status)).length;
  const inProduction=activeOrders.filter(o=>["em_preparo","em_producao"].includes(o.status)).length;
  const inDelivery=activeOrders.filter(o=>["saiu_entrega","em_entrega"].includes(o.status)).length;
  const completed=activeOrders.filter(o=>o.status==="entregue").length;
  const lowStock=inventory.filter(i=>Number(i.minimum_quantity||0)>0&&Number(i.current_quantity||0)<=Number(i.minimum_quantity||0));
  const mealCount=scoped.reduce((s,o)=>s+Number(o.item_count||0),0);
  const productCounts=new Map<string,number>();
  scoped.forEach(o=>itemRows(o.items).forEach(i=>productCounts.set(i.name,(productCounts.get(i.name)||0)+i.quantity)));
  const topProducts=[...productCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  const daily=Array.from({length:Number(period)},(_,index)=>{const d=new Date(start);d.setDate(start.getDate()+index);const key=d.toLocaleDateString("pt-BR");const value=scoped.filter(o=>new Date(o.created_at).toLocaleDateString("pt-BR")===key).reduce((s,o)=>s+Number(o.total||0),0);return {label:d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),value};});
  const maxDaily=Math.max(1,...daily.map(d=>d.value));
  const lineTotals=new Map<string,number>();scoped.forEach(o=>itemRows(o.items).forEach(i=>{const k=String(i.line||"Outros");lineTotals.set(k,(lineTotals.get(k)||0)+i.quantity);}));
  const totalLines=[...lineTotals.values()].reduce((a,b)=>a+b,0)||1;
  const productionDone=batches.filter(b=>["concluida","concluído","concluido","finalizada","finalizado"].includes(String(b.status||"").toLowerCase())).reduce((s,b)=>s+Number(b.quantity||0),0);
  const productionPlanned=batches.filter(b=>!["cancelada","cancelado"].includes(String(b.status||"").toLowerCase())).reduce((s,b)=>s+Number(b.quantity||0),0);
  const receipts=finance.filter(f=>f.type!=="despesa"&&f.status==="pago").reduce((s,f)=>s+Number(f.amount||0),0);
  const expenses=finance.filter(f=>f.type==="despesa"&&f.status==="pago").reduce((s,f)=>s+Number(f.amount||0),0);
  const margin=receipts>0?(receipts-expenses)/receipts*100:0;
  const upcoming=activeOrders.filter(o=>["confirmado","pago_recebido","em_preparo","saiu_entrega"].includes(o.status)).slice(0,4);
  const nav=[["Dashboard",Home],["Pedidos",ShoppingCart],["Produção",ChefHat],["Estoque",Package],["Compras",Box],["Cardápio",Utensils],["Clientes",Users],["Financeiro",Wallet],["Relatórios",ChartNoAxesColumn],["Marketing",Megaphone],["B2B Corporativo",ClipboardList],["Configurações",Settings]] as const;
  if(loading)return <main className="min-h-screen bg-[#050705] p-10 text-center text-white">Carregando Dashboard Nutrifit V7…</main>;
  return <main className="min-h-screen bg-[#050705] text-white"><style jsx global>{`
    .v7-card{background:linear-gradient(145deg,#10130f,#080a08);border:1px solid #343a32;border-radius:18px;box-shadow:inset 0 1px 0 #ffffff08}
    .v7-muted{color:#a3a89f}.v7-green{color:#a8ed00}.v7-orange{color:#ff7900}
    .v7-scroll::-webkit-scrollbar{height:6px;width:6px}.v7-scroll::-webkit-scrollbar-thumb{background:#41483d;border-radius:8px}
    @media(max-width:767px){.v7-sidebar{display:none}.v7-main{padding:14px}.v7-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.v7-charts{grid-template-columns:1fr}.v7-lower{grid-template-columns:1fr}.v7-bottom{grid-template-columns:1fr}}
  `}</style>
  <div className="flex min-h-screen">
    <aside className="v7-sidebar sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-[#242820] bg-[#080a08] px-3 py-5">
      <div className="mb-7 flex items-center gap-3 px-2"><img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit" className="h-14 w-14 object-contain"/><div><div className="text-[23px] font-black italic tracking-tight">NUTRI<span className="text-[#ff7900]">FIT</span></div><div className="text-[10px] text-white/65">Comida de verdade para todos</div><div className="text-[10px] text-white/65">os estilos de vida</div></div></div>
      <nav className="grid gap-1">{nav.map(([label,Icon])=><button key={label} onClick={()=>{setActive(label);if(label!=="Dashboard")window.location.href="/admin";}} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold transition ${active===label?"bg-[#ff7900] text-white":"text-white/85 hover:bg-white/[.06]"}`}><Icon size={20}/>{label}{label==="Pedidos"&&pending>0&&<span className="ml-auto rounded-full bg-[#ff7900] px-2 py-0.5 text-xs text-black">{pending}</span>}</button>)}</nav>
      <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Users size={21}/></div><div><div className="text-sm font-bold">Nutrifit JF</div><div className="text-xs text-white/55">Administrador</div></div></div>
    </aside>
    <section className="v7-main min-w-0 flex-1 p-6 xl:p-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><ChartNoAxesColumn className="text-[#a8ed00]" size={34}/><div><h1 className="text-2xl font-black sm:text-[30px]">Dashboard Nutrifit <span className="text-[#ff7900]">V7</span></h1><p className="text-sm text-white/55">Gestão completa da operação</p></div></div><div className="flex items-center gap-3"><select value={period} onChange={e=>setPeriod(e.target.value)} className="rounded-xl border border-white/15 bg-[#10130f] px-4 py-3 text-sm"><option value="7">Últimos 7 dias</option><option value="14">Últimos 14 dias</option><option value="30">Últimos 30 dias</option></select><button onClick={()=>{setRefreshing(true);load(token).catch(e=>setError(e.message)).finally(()=>setRefreshing(false));}} className="rounded-xl border border-white/15 p-3" aria-label="Atualizar"><RefreshCw size={18} className={refreshing?"animate-spin":""}/></button><Bell size={20} className="text-white/70"/><HelpCircle size={20} className="text-white/70"/></div></header>
      {error&&<div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      <div className="v7-kpis mb-4 grid grid-cols-4 gap-3">
        {[[ "Vendas (Período)",brl(revenue),scoped.length+" pedidos registrados",ShoppingCart,"#a8ed00"],["Pedidos",String(scoped.length),pending+" aguardando andamento",ClipboardList,"#ff7900"],["Clientes Ativos",String(customers.length),"Cadastros registrados",Users,"#a8ed00"],["Ticket Médio",brl(average),"Por pedido no período",CircleDollarSign,"#ff7900"]].map(([label,value,sub,Icon,color]:any)=><article key={label} className="v7-card relative min-h-[112px] overflow-hidden p-4"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl" style={{background:color+"22",color}}><Icon size={25}/></span><div className="min-w-0"><div className="text-sm text-white/70">{label}</div><div className="mt-1 text-[25px] font-black leading-none">{value}</div><div className="mt-2 text-[11px] text-white/50">{sub}</div></div></div><div className="absolute bottom-0 right-3 text-4xl opacity-[.08]">⌁</div></article>)}
      </div>
      <div className="v7-charts mb-3 grid grid-cols-[1.1fr_1fr_.68fr] gap-3">
        <article className="v7-card min-h-[235px] p-4"><h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Activity className="v7-green"/> Vendas por Linha</h2><div className="flex items-center gap-5"><div className="relative h-[165px] w-[165px] shrink-0 rounded-full" style={{background:`conic-gradient(#a8ed00 0 ${(lineTotals.get("Fit")||0)/totalLines*100}%,#ff7900 0 ${((lineTotals.get("Fit")||0)+(lineTotals.get("Performance")||0))/totalLines*100}%,#e8c51a 0 78%,#555 0 100%)`}}><div className="absolute inset-[25px] grid place-items-center rounded-full bg-[#090b09] text-center"><div><b className="text-lg">{brl(revenue)}</b><div className="text-xs text-white/55">Total</div></div></div></div><div className="min-w-0 flex-1 space-y-3 text-xs">{[...lineTotals.entries()].slice(0,5).map(([name,n],i)=><div key={name} className="flex items-center gap-2"><i className="h-3 w-3 shrink-0 rounded-sm" style={{background:["#a8ed00","#ff7900","#e8c51a","#777","#4b9c91"][i%5]}}/><span className="min-w-0 flex-1 truncate">{name}</span><b>{(n/totalLines*100).toFixed(1).replace(".",",")}%</b></div>)}{lineTotals.size===0&&<p className="text-white/45">Sem itens classificados por linha neste período.</p>}</div></div></article>
        <article className="v7-card min-h-[235px] p-4"><h2 className="mb-4 text-lg font-black">Faturamento Diário</h2><div className="flex h-[170px] items-end gap-2 border-b border-white/10 pb-2">{daily.map(d=><div key={d.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"><div className="text-center text-[9px] text-white/60">{d.value?Math.round(d.value):""}</div><div className="flex h-[125px] items-end rounded-t bg-white/[.035]"><div className="w-full rounded-t-md bg-gradient-to-t from-[#4f8700] to-[#a8ed00]" style={{height:`${Math.max(2,d.value/maxDaily*100)}%`}}/></div><div className="text-center text-[9px] text-white/55">{d.label}</div></div>)}</div></article>
        <article className="v7-card min-h-[235px] p-4"><h2 className="mb-4 text-lg font-black">Status dos Pedidos</h2><div className="space-y-3">{[["Novos",pending,"#ff7900"],["Em produção",inProduction,"#e8c51a"],["Em entrega",inDelivery,"#a8ed00"],["Concluídos",completed,"#a8ed00"]].map(([label,n,color]:any)=><div key={label} className="flex items-center justify-between rounded-lg bg-white/[.035] px-3 py-2"><span className="text-sm">{label}</span><b className="rounded-full px-3 py-0.5 text-black" style={{background:color}}>{n}</b></div>)}</div></article>
      </div>
      <div className="v7-lower mb-3 grid grid-cols-3 gap-3">
        <article className="v7-card min-h-[180px] p-4"><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><ChefHat className="v7-orange"/> Produção de Hoje</h2><div className="flex items-center gap-5"><div className="grid h-[112px] w-[112px] shrink-0 place-items-center rounded-full border-[12px] border-[#a8ed00] text-2xl font-black">{productionPlanned?Math.round(productionDone/productionPlanned*100):0}%</div><div className="space-y-2 text-sm"><p>Previsto: <b>{productionPlanned} marmitas</b></p><p>Produzido: <b>{productionDone}</b></p><p className="text-[#ff7900]">Pendente: <b>{Math.max(0,productionPlanned-productionDone)}</b></p></div></div><p className="mt-2 text-[10px] text-white/35">Baseado nos lotes registrados; não representa contagem manual da cozinha.</p></article>
        <article className="v7-card min-h-[180px] p-4"><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><Package className="v7-orange"/> Estoque – Itens Críticos</h2><div className="space-y-2">{(alerts.length?alerts:lowStock).slice(0,5).map((a:any)=><div key={a.item_id||a.id||a.name} className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 text-sm"><span className="truncate">{a.name}</span><b className="shrink-0">{a.current_quantity} {a.unit||""}</b></div>)}{!alerts.length&&!lowStock.length&&<p className="text-sm text-white/45">Nenhum item crítico retornado pelo estoque.</p>}</div></article>
        <article className="v7-card min-h-[180px] p-4"><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><CircleDollarSign className="v7-orange"/> Financeiro (Período)</h2><div className="space-y-3 text-sm"><div className="flex justify-between"><span>Receitas pagas</span><b className="v7-green">{brl(receipts)}</b></div><div className="flex justify-between"><span>Despesas pagas</span><b className="text-red-400">{brl(expenses)}</b></div><div className="flex justify-between border-t border-white/10 pt-2"><span>Resultado registrado</span><b>{brl(receipts-expenses)}</b></div><div className="flex justify-between rounded-lg bg-[#315900] px-3 py-2 font-black"><span>Margem registrada</span><span className="v7-green">{margin.toFixed(1).replace(".",",")}%</span></div></div></article>
      </div>
      <div className="v7-bottom grid grid-cols-2 gap-3">
        <article className="v7-card min-h-[205px] p-4"><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><ChartNoAxesColumn className="v7-orange"/> Top 5 Mais Vendidos</h2><div className="space-y-3">{topProducts.map(([name,n],i)=><div key={name} className="flex items-center gap-3 text-sm"><b className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ff7900] text-black">{i+1}</b><span className="min-w-0 flex-1 truncate">{name}</span><div className="h-3 w-[30%] overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#a8ed00]" style={{width:`${n/(topProducts[0]?.[1]||1)*100}%`}}/></div><b className="w-12 text-right">{n} un.</b></div>)}{!topProducts.length&&<p className="text-sm text-white/45">Não há itens de pedidos no período selecionado.</p>}</div></article>
        <article className="v7-card min-h-[205px] p-4"><h2 className="mb-3 flex items-center gap-2 text-lg font-black"><Truck className="v7-orange"/> Próximas Entregas</h2><div className="space-y-2">{upcoming.map(o=><div key={o.id} className="flex items-center gap-3 border-b border-white/10 pb-2 text-sm"><span className="rounded-lg bg-white/10 px-3 py-1 text-xs">{o.delivery_time||"A definir"}</span><span className="min-w-0 flex-1 truncate">{o.customer_name||"Cliente"} · {o.item_count||0} itens</span><span className="rounded-md bg-[#a8ed00] px-2 py-1 text-xs font-black text-black">{o.status==="saiu_entrega"?"Em rota":"Programar"}</span></div>)}{!upcoming.length&&<p className="text-sm text-white/45">Nenhuma entrega pendente registrada.</p>}</div></article>
      </div>
      <p className="mt-4 text-[10px] text-white/35">Indicadores calculados a partir dos registros disponíveis no Supabase. Dados ausentes permanecem sem preenchimento; margens e produção não são estimadas a partir de pedidos.</p>
    </section>
  </div></main>;
}
