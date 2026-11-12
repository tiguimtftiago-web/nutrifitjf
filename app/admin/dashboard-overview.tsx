"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity, Bell, CalendarDays, ChartNoAxesColumnIncreasing, ChevronDown, CircleHelp,
  ClipboardList, ChefHat, CircleAlert, CircleCheck, Coins, Factory, HandCoins, Home,
  Package, ShoppingBag, ShoppingCart, Truck, Users, Wallet, Utensils, BarChart3,
  Megaphone, Settings, Building2, Leaf, TrendingUp, ArrowDown, ArrowUp, Clock3
} from "lucide-react";

type Order = { id:string; order_code?:string; created_at:string; customer_name:string|null; items:unknown; item_count:number; total:number; status:string; };
type Customer = { id:string; name:string; order_count:number; total_spend:number; created_at:string; };
type InventoryItem = { id:string; name:string; unit:string; current_quantity:number; minimum_quantity:number; active:boolean; };
type PurchaseAlert = { item_id:string; name:string; unit:string; current_quantity:number; minimum_quantity:number; shortage_quantity:number; status:string; };
type Production = { id:string; created_at:string; produced_at:string; quantity:number; status:string; };
type Delivery = { id:string; customer_name:string|null; delivery_date:string|null; delivery_window:string|null; status:string; driver_name:string|null; route_name?:string|null; item_count?:number|null; };
type Finance = { id:string; created_at:string; type:string; amount:number; status:string; paid_at:string|null; };
type ProductLine = { name:string; value:number; color:string };
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://xdllpyqrbofszvallzxf.supabase.co";
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const money=(v:number)=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const cancelled=(s:string)=>["cancelado","cancelada","canceled","cancelled"].includes(String(s||"").toLowerCase());
const parseItems=(value:unknown):any[]=>{
  let data:any=value;
  if(typeof data==="string"){try{data=JSON.parse(data)}catch{return []}}
  if(data&&!Array.isArray(data)&&typeof data==="object"&&Array.isArray(data.items))data=data.items;
  if(!Array.isArray(data))data=data&&typeof data==="object"?[data]:[];
  const out:any[]=[];
  const add=(x:any)=>{if(!x||typeof x!=="object")return;if(Array.isArray(x.items)){x.items.forEach(add);return}
    out.push({name:String(x.name||x.product_name||x.title||"Produto não identificado"),line:String(x.line||x.category||""),quantity:Math.max(1,Number(x.quantity)||1),weight:String(x.weight||x.size||"")})};
  data.forEach(add);return out;
};
const dateKey=(v:string)=>new Date(v).toLocaleDateString("en-CA");
const startOfDay=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const statusOf=(s:string)=>{
 const v=String(s||"").toLowerCase();
 if(["enviado_whatsapp","novo","confirmado","pago_recebido","pendente","aguardando"].includes(v))return "new";
 if(["em_preparo","em_producao","preparando"].includes(v))return "prep";
 if(["saiu_entrega","em_rota","em_entrega"].includes(v))return "delivery";
 if(["entregue","concluido","concluida","finalizado"].includes(v))return "done";
 return "other";
};
function Donut({values,size=164,stroke=17,center}:{values:ProductLine[];size?:number;stroke?:number;center:ReactNode}){
 const total=values.reduce((s,x)=>s+x.value,0);let offset=0;const radius=(size-stroke)/2;const circumference=2*Math.PI*radius;
 return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="nf-donut">
  <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#303030" strokeWidth={stroke}/>
  {values.map((v,i)=>{const length=total?circumference*v.value/total:0;const node=<circle key={v.name} cx={size/2} cy={size/2} r={radius} fill="none" stroke={v.color} strokeWidth={stroke} strokeDasharray={`${length} ${circumference-length}`} strokeDashoffset={-offset} transform={`rotate(-90 ${size/2} ${size/2})`}/>;offset+=length;return node})}
  <foreignObject x="18%" y="18%" width="64%" height="64%"><div className="nf-donut-center">{center}</div></foreignObject>
 </svg>
}
function Spark({values,color}:{values:number[];color:string}){
 const max=Math.max(1,...values),min=Math.min(0,...values),pts=values.map((v,i)=>`${(i/(Math.max(1,values.length-1)))*100},${35-((v-min)/(max-min||1))*30}`).join(" ");
 return <svg className="nf-spark" viewBox="0 0 100 40" preserveAspectRatio="none"><defs><linearGradient id={`spark-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".3"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs><polygon points={`0,40 ${pts} 100,40`} fill={`url(#spark-${color.replace("#","")})`}/><polyline points={pts} fill="none" stroke={color} strokeWidth="2.3" vectorEffect="non-scaling-stroke"/></svg>
}
function MiniBarChart({orders,days}:{orders:Order[];days:number}){
 const buckets=Array.from({length:days},(_,i)=>{const d=startOfDay();d.setDate(d.getDate()-(days-1-i));return {date:d,value:0}});
 for(const o of orders){if(cancelled(o.status))continue;const k=dateKey(o.created_at);const b=buckets.find(x=>dateKey(x.date.toISOString())===k);if(b)b.value+=Number(o.total||0)}
 const max=Math.max(1,...buckets.map(x=>x.value));
 return <div className="nf-daily-chart"><div className="nf-y-axis">{[max, max*.75,max*.5,max*.25,0].map((n,i)=><span key={i}>{Math.round(n).toLocaleString("pt-BR")}</span>)}</div><div className="nf-chart-area"><div className="nf-gridlines"><i/><i/><i/><i/><i/></div><div className="nf-bars">{buckets.map((b,i)=><div className="nf-bar-wrap" key={i}><div className="nf-bar" title={money(b.value)} style={{height:`${Math.max(b.value?2:0,b.value/max*100)}%`}}/><span>{b.date.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</span></div>)}</div></div></div>
}
export default function DashboardOverview({orders,customers,inventory,purchaseAlerts,token,email,onNavigate,onRefresh}:{orders:Order[];customers:Customer[];inventory:InventoryItem[];purchaseAlerts:PurchaseAlert[];token:string;email:string;onNavigate:(s:string)=>void;onRefresh:()=>void}){
 const [period,setPeriod]=useState(7);const [production,setProduction]=useState<Production[]>([]);const [deliveries,setDeliveries]=useState<Delivery[]>([]);const [finance,setFinance]=useState<Finance[]>([]);const [loading,setLoading]=useState(false);
 async function load(){
  if(!token)return;setLoading(true);
  const req=async(path:string)=>{const r=await fetch(path,{headers:{apikey:KEY,Authorization:"Bearer "+token}});if(!r.ok)throw new Error("Falha ao carregar dados adicionais");return r.json()};
  try{const [p,d,f]=await Promise.all([
   req(URL+"/rest/v1/production_batches?select=id,created_at,produced_at,quantity,status&order=produced_at.desc&limit=500"),
   req(URL+"/rest/v1/delivery_orders?select=id,customer_name,delivery_date,delivery_window,status,driver_name&order=delivery_date.asc&limit=100"),
   req(URL+"/rest/v1/financial_transactions?select=id,created_at,type,amount,status,paid_at&order=created_at.desc&limit=500")
  ]);setProduction(p||[]);setDeliveries(d||[]);setFinance(f||[]);
  }catch{setProduction([]);setDeliveries([]);setFinance([])}finally{setLoading(false)}
 }
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),30000);return()=>window.clearInterval(id)},[token]);
 const today=startOfDay();const todayString=dateKey(today.toISOString());
 const periodStart=new Date(today);periodStart.setDate(periodStart.getDate()-(period-1));
 const previousStart=new Date(periodStart);previousStart.setDate(previousStart.getDate()-period);
 const validOrders=orders.filter(o=>!cancelled(o.status));
 const currentOrders=validOrders.filter(o=>new Date(o.created_at)>=periodStart);
 const previousOrders=validOrders.filter(o=>new Date(o.created_at)>=previousStart&&new Date(o.created_at)<periodStart);
 const sales=currentOrders.reduce((s,o)=>s+Number(o.total||0),0);
 const previousSales=previousOrders.reduce((s,o)=>s+Number(o.total||0),0);
 const change=previousSales?((sales-previousSales)/previousSales)*100:null;
 const average=currentOrders.length?sales/currentOrders.length:0;
 const activeCustomerIds=new Set(validOrders.map(o=>o.customer_name||"").filter(Boolean));
 const activeCustomers=customers.filter(c=>activeCustomerIds.has(c.name)).length;
 const counts={new:orders.filter(o=>statusOf(o.status)==="new").length,prep:orders.filter(o=>statusOf(o.status)==="prep").length,delivery:orders.filter(o=>statusOf(o.status)==="delivery").length,done:orders.filter(o=>statusOf(o.status)==="done").length};
 const lines:ProductLine[]=[{name:"Linha Fit (350 g)",value:0,color:"#7ed321"},{name:"Linha Performance (450 g)",value:0,color:"#ff7a00"},{name:"Linha Tradicional (500 g)",value:0,color:"#a6e82e"},{name:"Sucos e Lanches",value:0,color:"#ffd000"},{name:"Outros",value:0,color:"#777777"}];
 const productTotals=new Map<string,number>();
 for(const o of currentOrders)for(const item of parseItems(o.items)){const l=item.line.toLowerCase();const ix=l.includes("fit")?0:l.includes("performance")?1:l.includes("tradicional")?2:l.includes("suco")||l.includes("lanche")?3:4;lines[ix].value+=item.quantity;productTotals.set(item.name,(productTotals.get(item.name)||0)+item.quantity)}
 const lineTotal=lines.reduce((s,x)=>s+x.value,0);
 const todayBatches=production.filter(p=>dateKey(p.created_at)===todayString);
 const planned=todayBatches.reduce((s,p)=>s+Number(p.quantity||0),0);
 const produced=todayBatches.filter(p=>["concluida","concluido"].includes(p.status)).reduce((s,p)=>s+Number(p.quantity||0),0);
 const progress=planned?Math.min(100,Math.round(produced/planned*100)):0;
 const stockRows=[...inventory.filter(i=>i.active!==false)].sort((a,b)=>{const ar=a.minimum_quantity>0?a.current_quantity/a.minimum_quantity:99;const br=b.minimum_quantity>0?b.current_quantity/b.minimum_quantity:99;return ar-br}).slice(0,4);
 const paidFinance=finance.filter(f=>f.status==="pago"||f.status==="paid"||f.status==="concluido");
 const currentFinance=paidFinance.filter(f=>new Date(f.paid_at||f.created_at)>=periodStart);
 const receipts=currentFinance.filter(f=>f.type==="receita").reduce((s,f)=>s+Number(f.amount||0),0);
 const expenses=currentFinance.filter(f=>f.type==="despesa").reduce((s,f)=>s+Number(f.amount||0),0);
 const profit=receipts-expenses;const margin=receipts?profit/receipts*100:0;
 const topProducts=[...productTotals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
 const nextDeliveries=deliveries.filter(d=>d.delivery_date&&new Date(d.delivery_date)>=today&& !["entregue","cancelado","concluido"].includes(String(d.status||"").toLowerCase())).sort((a,b)=>new Date(a.delivery_date||"").getTime()-new Date(b.delivery_date||"").getTime()).slice(0,4);
 const maxTop=Math.max(1,...topProducts.map(x=>x[1]));
 const spark=currentOrders.slice().reverse().map(o=>Number(o.total||0)).slice(-8);const sparkValues=spark.length?spark:[0,0,0,0,0,0,0,0];
 const pct=(n:number)=>lineTotal?Math.round(n/lineTotal*1000)/10:0;
 const userLabel=email?email.split("@")[0]:"Administrador";
 return <div className="nf-dashboard">
  <aside className="nf-sidebar">
   <div className="nf-brand"><img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit"/><div><div className="nf-brand-word"><span>NUTRI</span><b>FIT</b></div><small>Comida de verdade para todos os estilos de vida</small></div></div>
   <nav className="nf-nav">
    {([{id:"resumo",label:"Dashboard",Icon:Home},{id:"pedidos",label:"Pedidos",Icon:ShoppingCart,badge:orders.filter(o=>statusOf(o.status)==="new").length},{id:"producao",label:"Produção",Icon:ChefHat},{id:"estoque",label:"Estoque",Icon:Package},{id:"estoque",label:"Compras",Icon:ShoppingBag},{id:"produtos",label:"Cardápio",Icon:Utensils},{id:"clientes",label:"Clientes",Icon:Users},{id:"financeiro",label:"Financeiro",Icon:Coins},{id:"financeiro",label:"Relatórios",Icon:ChartNoAxesColumnIncreasing},{id:"b2b",label:"Marketing",Icon:Megaphone},{id:"b2b",label:"B2B Corporativo",Icon:Building2},{id:"resumo",label:"Configurações",Icon:Settings}] as any[]).map(({id,label,Icon,badge})=><button key={label} onClick={()=>onNavigate(id)} className={`nf-nav-item ${id==="resumo"&&label==="Dashboard"?"active":""}`}><Icon size={22}/><span>{label}</span>{badge>0&&<b className="nf-nav-badge">{badge}</b>}</button>)}
   </nav>
   <div className="nf-user"><div className="nf-avatar">{userLabel.slice(0,1).toUpperCase()}</div><div><b>{userLabel}</b><small>Administrador</small></div><ChevronDown size={18}/></div>
  </aside>
  <div className="nf-main">
   <header className="nf-header"><div className="nf-heading"><ChartNoAxesColumnIncreasing/><div><h1>Dashboard Nutrifit <b>V7</b></h1><p>Gestão completa da operação</p></div></div><div className="nf-header-actions"><label className="nf-period"><CalendarDays size={20}/><select value={period} onChange={e=>setPeriod(Number(e.target.value))}><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option></select><ChevronDown size={15}/></label><button className="nf-icon-button" onClick={onRefresh} aria-label="Atualizar"><Bell/><i/></button><button className="nf-icon-button" onClick={()=>onNavigate("resumo")} aria-label="Ajuda"><CircleHelp/></button></div></header>
   <section className="nf-kpis">
    {[{title:"Vendas (Período)",value:money(sales),change,label:"vs. período anterior",color:"green",Icon:ShoppingBag},{title:"Pedidos",value:String(currentOrders.length),change:previousOrders.length?((currentOrders.length-previousOrders.length)/previousOrders.length)*100:null,label:"vs. período anterior",color:"orange",Icon:HandCoins},{title:"Clientes Ativos",value:String(activeCustomers),change:null,label:"clientes com pedidos",color:"green",Icon:Users},{title:"Ticket Médio",value:money(average),change:null,label:"por pedido",color:"orange",Icon:Coins}].map(k=><article className={`nf-kpi ${k.color}`} key={k.title}><div className="nf-kpi-icon"><k.Icon size={28}/></div><div className="nf-kpi-content"><span>{k.title}</span><strong>{k.value}</strong><small>{k.change===null?"—":`${k.change>=0?"↑":"↓"} ${Math.abs(k.change).toLocaleString("pt-BR",{maximumFractionDigits:1})}%`} <em>{k.label}</em></small></div><Spark values={sparkValues} color={k.color==="green"?"#7ed321":"#ff7a00"}/></article>)}
   </section>
   <section className="nf-row nf-row-2">
    <article className="nf-card nf-lines"><h2><Leaf/>Vendas por Linha</h2><div className="nf-lines-body"><Donut values={lines} center={<><b>{lineTotal.toLocaleString("pt-BR")}</b><small>Unidades</small></>}/><div className="nf-legend">{lines.map(l=><div key={l.name}><i style={{background:l.color}}/><span>{l.name}</span><b>{pct(l.value).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})}%</b></div>)}</div></div></article>
    <article className="nf-card"><h2><BarChart3/>Faturamento Diário</h2><MiniBarChart orders={currentOrders} days={period}/></article>
    <article className="nf-card nf-status"><h2>Status dos Pedidos</h2>{([{label:"Novos",value:counts.new,color:"orange",Icon:ShoppingCart},{label:"Em produção",value:counts.prep,color:"yellow",Icon:ChefHat},{label:"Em entrega",value:counts.delivery,color:"green",Icon:Truck},{label:"Concluídos",value:counts.done,color:"green",Icon:CircleCheck}] as any[]).map(x=><div className={`nf-status-row ${x.color}`} key={x.label}><x.Icon/><span>{x.label}</span><b>{x.value}</b></div>)}</article>
   </section>
   <section className="nf-row nf-row-3">
    <article className="nf-card nf-production"><h2><ChefHat/>Produção de Hoje</h2><div className="nf-production-body"><Donut size={138} stroke={16} values={[{name:"feito",value:produced,color:"#7ed321"},{name:"restante",value:Math.max(0,planned-produced),color:"#303030"}]} center={<b>{progress}%</b>}/><div><p>Previsto: <b>{planned||"—"} marmitas</b></p><p>Produzido: <b>{produced||0}</b></p><p className="pending">Pendente: <b>{Math.max(0,planned-produced)}</b></p></div></div></article>
    <article className="nf-card nf-stock"><h2><Package/>Estoque – Itens Críticos</h2>{stockRows.length?stockRows.map(item=>{const critical=item.current_quantity<=item.minimum_quantity;const warn=!critical&&item.current_quantity<=item.minimum_quantity*1.5;return <div className="nf-stock-row" key={item.id}><span className={critical?"red":warn?"yellow":"green"}>{critical?<CircleAlert/>:warn?<CircleAlert/>:<CircleCheck/>}</span><b>{item.name}</b><small>{Number(item.current_quantity).toLocaleString("pt-BR")} {item.unit}</small></div>}):<div className="nf-empty">—</div>}</article>
    <article className="nf-card nf-finance"><h2><HandCoins/>Financeiro (Período)</h2><div className="nf-finance-row"><ArrowUp className="up"/><span>Receitas</span><b>{money(receipts)}</b></div><div className="nf-finance-row"><ArrowDown className="down"/><span>Despesas</span><b>{money(expenses)}</b></div><div className="nf-finance-row"><ChartNoAxesColumnIncreasing className="up"/><span>Lucro Estimado</span><b>{money(profit)}</b></div><div className="nf-margin"><span>Margem de Lucro</span><b>{receipts?margin.toLocaleString("pt-BR",{maximumFractionDigits:1})+"%":"—"}</b></div></article>
   </section>
   <section className="nf-row nf-row-4">
    <article className="nf-card nf-top"><h2><Activity/>Top 5 Mais Vendidos</h2>{Array.from({length:5},(_,i)=>{const item=topProducts[i];return <div className="nf-top-row" key={item?.[0]||i}><b className="nf-rank">{i+1}</b><span>{item?.[0]||"—"}</span><div className="nf-top-track"><i style={{width:item?`${item[1]/maxTop*100}%`:"0%"}}/></div><small>{item?item[1]+" un.":"0 un."}</small></div>})}</article>
    <article className="nf-card nf-deliveries"><h2><Truck/>Próximas Entregas</h2>{Array.from({length:4},(_,i)=>{const d=nextDeliveries[i];return <div className="nf-delivery-row" key={d?.id||i}><time>{d?.delivery_window||"—"}</time><span>{d?d.customer_name||"Cliente": "—"} · {d?(d.item_count??orders.find(o=>o.customer_name===d.customer_name)?.item_count??"—")+" marmitas":"— marmitas"}</span><b>{d?.route_name||"Rota —"}</b><small>{d?.driver_name||""}</small></div>})}</article>
   </section>
   {loading&&<div className="nf-loading">Atualizando dados complementares…</div>}
  </div>
 </div>
}
