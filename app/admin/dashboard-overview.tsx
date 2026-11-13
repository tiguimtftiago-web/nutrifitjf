"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Bell, CalendarDays, ChartNoAxesColumnIncreasing, ChefHat, CircleAlert,
  CircleCheck, Coins, Factory, Home, Package, RefreshCw, ShoppingBag, ShoppingCart,
  Truck, Users, Wallet, MessageCircle, Settings, Box, ArrowUpRight, ArrowDownRight
} from "lucide-react";

type Order = { id:string; customer_profile_id?:string|null; created_at:string; customer_name:string|null; items:unknown; item_count:number; total:number; status:string; };
type Customer = { id:string; name:string; order_count:number; total_spend:number; created_at:string; };
type InventoryItem = { id:string; name:string; unit:string; current_quantity:number; minimum_quantity:number; active:boolean; };
type PurchaseAlert = { item_id:string; name:string; unit:string; current_quantity:number; minimum_quantity:number; shortage_quantity:number; status:string; };
type Production = { id:string; created_at:string; produced_at:string|null; quantity:number; status:string; };
type Delivery = { id:string; customer_name:string|null; delivery_date:string|null; delivery_window:string|null; status:string; driver_name:string|null; };
type Finance = { id:string; created_at:string; type:string; category?:string|null; amount:number; status:string; paid_at:string|null; };
type ProductLine = { name:string; value:number; color:string };
type DailyPoint = { date:Date; label:string; revenue:number; orders:number };

const URL=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://xdllpyqrbofszvallzxf.supabase.co";
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const money=(v:number)=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const dateKey=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const cancelled=(s:string)=>["cancelado","cancelada","canceled","cancelled"].includes(String(s||"").toLowerCase());
const statusOf=(s:string)=>{
  const v=String(s||"").toLowerCase();
  if(["enviado_whatsapp","novo","confirmado","pago_recebido","pendente","aguardando"].includes(v))return "new";
  if(["em_preparo","em_producao","preparando"].includes(v))return "prep";
  if(["saiu_entrega","em_rota","em_entrega"].includes(v))return "delivery";
  if(["entregue","concluido","concluida","finalizado","finalizada"].includes(v))return "done";
  return "other";
};
const parseItems=(value:unknown):any[]=>{
  let data:any=value;
  if(typeof data==="string"){try{data=JSON.parse(data)}catch{return []}}
  if(data&&!Array.isArray(data)&&typeof data==="object"&&Array.isArray(data.items))data=data.items;
  if(!Array.isArray(data))data=data&&typeof data==="object"?[data]:[];
  const out:any[]=[];
  const add=(x:any)=>{
    if(!x||typeof x!=="object")return;
    if(Array.isArray(x.items)){x.items.forEach(add);return}
    out.push({name:String(x.name||x.product_name||x.title||x.description||"Produto não identificado"),line:String(x.line||x.category||""),quantity:Math.max(1,Number(x.quantity)||1)});
  };
  data.forEach(add);return out;
};
const quantity=(v:number)=>Number(v||0).toLocaleString("pt-BR",{maximumFractionDigits:2});
const stockUnit=(unit:string)=>["g","grama","gramas"].includes(String(unit||"").toLowerCase())?"kg":(["unidade","unidades","un"].includes(String(unit||"").toLowerCase())?"un.":unit||"un.");
const stockValue=(v:number,unit:string)=>["g","grama","gramas"].includes(String(unit||"").toLowerCase())?v/1000:v;
const stockText=(v:number,unit:string)=>quantity(stockValue(v,unit))+" "+stockUnit(unit);

function pctChange(current:number,previous:number){
  if(previous===0)return null;
  return ((current-previous)/Math.abs(previous))*100;
}
function Variation({value}:{value:number|null}){
  if(value===null)return <small className="nf-variation neutral">Sem base anterior · vs. anterior</small>;
  if(Math.abs(value)<0.05)return <small className="nf-variation neutral">— 0% · vs. anterior</small>;
  const up=value>0;
  return <small className={"nf-variation "+(up?"positive":"negative")}>{up?"▲":"▼"} {Math.abs(value).toLocaleString("pt-BR",{maximumFractionDigits:1})}% · vs. anterior</small>;
}
function smoothPath(points:{x:number;y:number}[]){
  if(!points.length)return "";
  if(points.length===1)return "M "+points[0].x+" "+points[0].y;
  let d="M "+points[0].x+" "+points[0].y;
  for(let i=1;i<points.length;i++){
    const p0=points[i-1],p1=points[i],dx=(p1.x-p0.x)/3;
    d+=" C "+(p0.x+dx)+" "+p0.y+", "+(p1.x-dx)+" "+p1.y+", "+p1.x+" "+p1.y;
  }
  return d;
}
function DailyChart({data}:{data:DailyPoint[]}){
  if(!data.some(x=>x.revenue>0||x.orders>0))return <div className="nf-chart-empty">Sem vendas ou pedidos registrados neste período.</div>;
  const W=720,H=250,left=42,right=42,top=18,bottom=34,plotW=W-left-right,plotH=H-top-bottom;
  const maxRevenue=Math.max(1,...data.map(x=>x.revenue));
  const maxOrders=Math.max(1,...data.map(x=>x.orders));
  const x=(i:number)=>left+(data.length===1?plotW/2:(i/(data.length-1))*plotW);
  const revenuePoints=data.map((p,i)=>({x:x(i),y:top+plotH-(p.revenue/maxRevenue)*plotH}));
  const orderPoints=data.map((p,i)=>({x:x(i),y:top+plotH-(p.orders/maxOrders)*plotH}));
  const revenuePath=smoothPath(revenuePoints),orderPath=smoothPath(orderPoints);
  const areaPath=revenuePath+" L "+revenuePoints[revenuePoints.length-1].x+" "+(top+plotH)+" L "+revenuePoints[0].x+" "+(top+plotH)+" Z";
  const peakIndex=data.reduce((best,p,i)=>p.revenue>data[best].revenue?i:best,0);
  const peak=revenuePoints[peakIndex];
  const labelEvery=Math.max(1,Math.ceil(data.length/7));
  return <div className="nf-chart-wrap">
    <div className="nf-chart-legend"><span><i className="orange-dot"/>Receita de pedidos</span><span><i className="green-dot"/>Quantidade de pedidos</span></div>
    <svg className="nf-daily-svg" viewBox={"0 0 "+W+" "+H} role="img" aria-label="Gráfico de linhas com receita de pedidos em reais e quantidade diária de pedidos">
      <defs>
        <linearGradient id="nf-revenue-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF7A00" stopOpacity=".28"/><stop offset="100%" stopColor="#FF7A00" stopOpacity="0"/></linearGradient>
        <linearGradient id="nf-orders-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9BE22A" stopOpacity=".14"/><stop offset="100%" stopColor="#9BE22A" stopOpacity="0"/></linearGradient>
      </defs>
      {[0,1,2,3].map(n=><g key={n}><line x1={left} x2={W-right} y1={top+(plotH*n/3)} y2={top+(plotH*n/3)} stroke="#292929" strokeDasharray="3 5"/><text x={left-8} y={top+(plotH*n/3)+4} textAnchor="end" className="nf-axis-label">{money(maxRevenue*(1-n/3)).replace(",00","")}</text><text x={W-right+8} y={top+(plotH*n/3)+4} textAnchor="start" className="nf-axis-label">{Math.round(maxOrders*(1-n/3))}</text></g>)}
      <path d={areaPath} fill="url(#nf-revenue-area)"/>
      <path d={smoothPath(orderPoints)+" L "+orderPoints[orderPoints.length-1].x+" "+(top+plotH)+" L "+orderPoints[0].x+" "+(top+plotH)+" Z"} fill="url(#nf-orders-area)"/>
      <path d={revenuePath} fill="none" stroke="#FF7A00" strokeWidth="3.5" strokeLinecap="round"/>
      <path d={orderPath} fill="none" stroke="#9BE22A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1={peak.x} x2={peak.x} y1={top} y2={top+plotH} stroke="#FF7A00" strokeDasharray="4 5" opacity=".85"/>
      <circle cx={peak.x} cy={peak.y} r="5.5" fill="#FF7A00" stroke="#080808" strokeWidth="2"/>
      <rect x={Math.max(left,Math.min(W-right-110,peak.x-52))} y={Math.max(2,peak.y-30)} width="104" height="23" rx="7" fill="#FF7A00"/>
      <text x={Math.max(left,Math.min(W-right-110,peak.x-52))+52} y={Math.max(2,peak.y-30)+15} textAnchor="middle" className="nf-peak-label">{money(data[peakIndex].revenue)}</text>
      {data.map((p,i)=>(i%labelEvery===0||i===data.length-1)?<text key={i} x={x(i)} y={H-8} textAnchor="middle" className="nf-axis-label">{p.label}</text>:null)}
    </svg>
  </div>;
}

function Donut({values,size=160,stroke=18,center}:{values:ProductLine[];size?:number;stroke?:number;center:React.ReactNode}){
  const total=values.reduce((s,x)=>s+x.value,0);let offset=0;const radius=(size-stroke)/2,circumference=2*Math.PI*radius;
  return <svg width={size} height={size} viewBox={"0 0 "+size+" "+size} className="nf-donut" role="img" aria-label={"Distribuição das vendas por linha. Total de "+total+" unidades."}>
    <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#303030" strokeWidth={stroke}/>
    {values.map(v=>{const length=total?circumference*v.value/total:0;const node=<circle key={v.name} cx={size/2} cy={size/2} r={radius} fill="none" stroke={v.color} strokeWidth={stroke} strokeDasharray={length+" "+(circumference-length)} strokeDashoffset={-offset} transform={"rotate(-90 "+size/2+" "+size/2+")"}/>;offset+=length;return node})}
    <foreignObject x="18%" y="18%" width="64%" height="64%"><div className="nf-donut-center">{center}</div></foreignObject>
  </svg>;
}

export default function DashboardOverview({orders,customers,inventory,purchaseAlerts,token,email,onNavigate,onRefresh}:{orders:Order[];customers:Customer[];inventory:InventoryItem[];purchaseAlerts:PurchaseAlert[];token:string;email:string;onNavigate:(s:string)=>void;onRefresh:()=>void}){
  const [period,setPeriod]=useState(7);
  const [dashboardOrders,setDashboardOrders]=useState<Order[]|null>(null);
  const [production,setProduction]=useState<Production[]>([]);
  const [deliveries,setDeliveries]=useState<Delivery[]>([]);
  const [finance,setFinance]=useState<Finance[]>([]);
  const [loading,setLoading]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const touchStart=useRef<number|null>(null);
  const pullTriggered=useRef(false);

  async function load(){
    if(!token)return;
    setLoading(true);
    const req=async(path:string)=>{const r=await fetch(path,{headers:{apikey:KEY,Authorization:"Bearer "+token},cache:"no-store"});if(!r.ok)throw new Error("Falha ao carregar dados complementares");return r.json()};
    try{
      const [o,p,d,f]=await Promise.all([
        req(URL+"/rest/v1/customer_orders?select=id,customer_profile_id,created_at,customer_name,items,item_count,total,status&order=created_at.desc&limit=1000"),
        req(URL+"/rest/v1/production_batches?select=id,created_at,produced_at,quantity,status&order=produced_at.desc&limit=500"),
        req(URL+"/rest/v1/delivery_orders?select=id,customer_name,delivery_date,delivery_window,status,driver_name&order=delivery_date.asc&limit=200"),
        req(URL+"/rest/v1/financial_transactions?select=id,created_at,type,category,amount,status,paid_at&order=created_at.desc&limit=500")
      ]);
      setDashboardOrders(o||[]);setProduction(p||[]);setDeliveries(d||[]);setFinance(f||[]);
    }catch{setDashboardOrders(null);setProduction([]);setDeliveries([]);setFinance([])}
    finally{setLoading(false)}
  }

  useEffect(()=>{void load();const id=window.setInterval(()=>void load(),30000);return()=>window.clearInterval(id)},[token]);
  useEffect(()=>{
    const start=(event:TouchEvent)=>{if(window.scrollY<=2&&event.touches.length===1){touchStart.current=event.touches[0].clientY;pullTriggered.current=false}else touchStart.current=null};
    const move=(event:TouchEvent)=>{if(touchStart.current===null||pullTriggered.current||window.scrollY>2||event.touches.length!==1)return;if(event.touches[0].clientY-touchStart.current>88){pullTriggered.current=true;void refreshAll()}};
    const end=()=>{touchStart.current=null};
    window.addEventListener("touchstart",start,{passive:true});window.addEventListener("touchmove",move,{passive:true});window.addEventListener("touchend",end,{passive:true});
    return()=>{window.removeEventListener("touchstart",start);window.removeEventListener("touchmove",move);window.removeEventListener("touchend",end)};
  });

  async function refreshAll(){
    if(refreshing)return;
    setRefreshing(true);
    try{await Promise.all([load(),Promise.resolve(onRefresh())])}finally{setRefreshing(false)}
  }

  const sourceOrders=dashboardOrders??orders;
  const now=new Date();
  const today=new Date(now);today.setHours(0,0,0,0);
  const periodStart=new Date(today);periodStart.setDate(periodStart.getDate()-(period-1));
  const previousStart=new Date(periodStart);previousStart.setDate(previousStart.getDate()-period);
  const validOrders=sourceOrders.filter(o=>!cancelled(o.status));
  const currentOrders=validOrders.filter(o=>{const d=new Date(o.created_at);return d>=periodStart&&d<=now});
  const previousOrders=validOrders.filter(o=>{const d=new Date(o.created_at);return d>=previousStart&&d<periodStart});
  const sales=currentOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const previousSales=previousOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const avg=currentOrders.length?sales/currentOrders.length:0;
  const customerIds=new Set(currentOrders.map(o=>o.customer_profile_id).filter(Boolean));
  const customerNames=new Set(currentOrders.map(o=>o.customer_name||"").filter(Boolean));
  const activeCustomers=customerIds.size||customerNames.size;
  const daily:DailyPoint[]=Array.from({length:period},(_,i)=>{const d=new Date(periodStart);d.setDate(d.getDate()+i);const key=dateKey(d);const rows=currentOrders.filter(o=>dateKey(new Date(o.created_at))===key);return {date:d,label:d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),revenue:rows.reduce((s,o)=>s+Number(o.total||0),0),orders:rows.length}});
  const counts={new:currentOrders.filter(o=>statusOf(o.status)==="new").length,prep:currentOrders.filter(o=>statusOf(o.status)==="prep").length,delivery:currentOrders.filter(o=>statusOf(o.status)==="delivery").length,done:currentOrders.filter(o=>statusOf(o.status)==="done").length};
  const lines:ProductLine[]=[];
  const lineColors:Record<string,string>={"Fit":"#9BE22A","Performance":"#FF7A00","Tradicional":"#4AA3FF","Sucos e Lanches":"#EC4899","Outros":"#A9A9B8"};
  const lineTotals=new Map<string,number>(),productTotals=new Map<string,number>();
  currentOrders.forEach(o=>parseItems(o.items).forEach(item=>{
    const raw=String(item.line||"").toLowerCase();
    const line=raw.includes("fit")?"Fit":raw.includes("performance")?"Performance":raw.includes("tradicional")?"Tradicional":raw.includes("suco")||raw.includes("lanche")?"Sucos e Lanches":"Outros";
    lineTotals.set(line,(lineTotals.get(line)||0)+item.quantity);
    productTotals.set(item.name,(productTotals.get(item.name)||0)+item.quantity);
  }));
  ["Fit","Performance","Tradicional","Sucos e Lanches","Outros"].forEach(name=>{const value=lineTotals.get(name)||0;if(value>0)lines.push({name,value,color:lineColors[name]})});
  const lineTotal=lines.reduce((s,x)=>s+x.value,0);
  const topProducts=[...productTotals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxTop=Math.max(1,...topProducts.map(x=>x[1]));
  const criticalStock=inventory.filter(i=>i.active!==false&&(Number(i.current_quantity||0)<=0||(Number(i.minimum_quantity||0)>0&&Number(i.current_quantity||0)<Number(i.minimum_quantity||0)))).sort((a,b)=>Number(a.current_quantity||0)-Number(b.current_quantity||0)).slice(0,5);
  const lowStockCount=inventory.filter(i=>i.active!==false&&(Number(i.current_quantity||0)<=0||(Number(i.minimum_quantity||0)>0&&Number(i.current_quantity||0)<Number(i.minimum_quantity||0)))).length;
  const todayBatches=production.filter(p=>dateKey(new Date(p.produced_at||p.created_at))===dateKey(today)&&!cancelled(p.status));
  const planned=todayBatches.reduce((s,p)=>s+Number(p.quantity||0),0);
  const produced=todayBatches.filter(p=>["concluida","concluido","finalizada","finalizado"].includes(String(p.status||"").toLowerCase())).reduce((s,p)=>s+Number(p.quantity||0),0);
  const nextDeliveries=deliveries.filter(d=>d.delivery_date&&new Date(d.delivery_date+"T00:00:00")>=today&&!["entregue","cancelado","concluido"].includes(String(d.status||"").toLowerCase())).sort((a,b)=>new Date(a.delivery_date||"").getTime()-new Date(b.delivery_date||"").getTime()).slice(0,4);
  const paidFinance=finance.filter(f=>["pago","paid","concluido"].includes(String(f.status||"").toLowerCase())&&new Date(f.paid_at||f.created_at)>=periodStart&&new Date(f.paid_at||f.created_at)<=now);
  const expenses=paidFinance.filter(f=>["despesa","expense"].includes(String(f.type||"").toLowerCase())).reduce((s,f)=>s+Number(f.amount||0),0);
  const inputExpenses=paidFinance.filter(f=>["despesa","expense"].includes(String(f.type||"").toLowerCase())&&String(f.category||"").toLowerCase().includes("insumo")).reduce((s,f)=>s+Number(f.amount||0),0);
  const profit=sales-expenses;
  const inputMargin=sales>0&&inputExpenses>0?(sales-inputExpenses)/sales*100:null;
  const actionNew=sourceOrders.filter(o=>statusOf(o.status)==="new"&&!cancelled(o.status)).length;
  const actionDelivery=sourceOrders.filter(o=>statusOf(o.status)==="delivery"&&!cancelled(o.status)).length;
  const startLabel=periodStart.toLocaleDateString("pt-BR");
  const endLabel=now.toLocaleDateString("pt-BR");
  const periodLabel=startLabel+" a "+endLabel;
  const nav=[
    {id:"resumo",label:"Dashboard",Icon:Home},
    {id:"pedidos",label:"Pedidos",Icon:ShoppingCart,badge:actionNew},
    {id:"producao",label:"Produção",Icon:Factory},
    {id:"estoque",label:"Estoque",Icon:Package},
    {id:"entregas",label:"Entregas",Icon:Truck},
    {id:"clientes",label:"Clientes",Icon:Users},
    {id:"financeiro",label:"Financeiro",Icon:Wallet},
    {id:"embalagens",label:"Embalagens",Icon:Box},
    {id:"whatsapp",label:"WhatsApp",Icon:MessageCircle},
    {id:"configuracoes",label:"Configurações",Icon:Settings}
  ];
  const stockStatus=(item:InventoryItem)=>{
    const current=Number(item.current_quantity||0),minimum=Number(item.minimum_quantity||0);
    if(current<=0)return "Zerado";
    if(minimum>0&&current<minimum)return "Baixo";
    return "OK";
  };
  const stockPercent=(item:InventoryItem)=>{
    const current=stockValue(Number(item.current_quantity||0),item.unit),minimum=stockValue(Number(item.minimum_quantity||0),item.unit);
    return Math.max(0,Math.min(100,current/Math.max(current,minimum*1.5,1)*100));
  };
  const userLabel=email?email.split("@")[0]:"Administrador";

  return <div className="nf-dashboard">
    <aside className="nf-sidebar">
      <div className="nf-brand"><img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit"/><div><div className="nf-brand-word"><span>NUTRI</span><b>FIT</b></div><small>Comida de verdade para todos os estilos de vida</small></div></div>
      <nav className="nf-nav" aria-label="Navegação principal">{nav.map(({id,label,Icon,badge})=><button type="button" key={id} onClick={()=>onNavigate(id)} className={"nf-nav-item "+(id==="resumo"?"active":"")} aria-current={id==="resumo"?"page":undefined}><Icon size={19}/><span>{label}</span>{badge? <b className="nf-nav-badge">{badge}</b>:null}</button>)}</nav>
      <div className="nf-stock-warning"><span><CircleAlert size={16}/></span><div><b>{lowStockCount} itens com estoque baixo</b><small>Verifique a reposição</small></div></div>
      <div className="nf-user"><div className="nf-avatar">{userLabel.slice(0,1).toUpperCase()}</div><div><b>{userLabel}</b><small>Administrador</small></div></div>
    </aside>
    <div className="nf-main">
      <header className="nf-header">
        <div className="nf-heading"><div><div className="nf-eyebrow">CENTRAL DE OPERAÇÕES</div><h1>Dashboard Nutrifit <b>V7</b></h1><p>{periodLabel}</p></div></div>
        <div className="nf-header-actions">
          <label className="nf-period"><CalendarDays size={18}/><select value={period} onChange={e=>setPeriod(Number(e.target.value))} aria-label="Filtrar período"><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option></select></label>
          <button type="button" className="nf-refresh" onClick={()=>void refreshAll()} disabled={refreshing||loading}><RefreshCw size={16} className={refreshing||loading?"nf-spin":""}/><span>{refreshing||loading?"Atualizando":"Atualizar"}</span></button>
        </div>
      </header>

      <section className="nf-actions" aria-label="Precisa de ação agora">
        <div className="nf-section-heading"><div><span className="nf-eyebrow">PRIORIDADES</span><h2>Precisa de ação agora</h2></div><span className="nf-updated">{loading?"Sincronizando dados…":"Dados do Supabase"}</span></div>
        <div className="nf-action-grid">
          <button type="button" className="nf-action-card orange" onClick={()=>onNavigate("pedidos:new")}><span className="nf-action-icon"><ShoppingCart size={19}/></span><span><small>Pedidos novos</small><b>{actionNew}</b></span><ArrowUpRight size={17}/></button>
          <button type="button" className="nf-action-card yellow" onClick={()=>onNavigate("estoque")}><span className="nf-action-icon"><Package size={19}/></span><span><small>Estoque baixo / zerado</small><b>{lowStockCount}</b></span><ArrowUpRight size={17}/></button>
          <button type="button" className="nf-action-card blue" onClick={()=>onNavigate("entregas")}><span className="nf-action-icon"><Truck size={19}/></span><span><small>Em entrega</small><b>{actionDelivery}</b></span><ArrowUpRight size={17}/></button>
        </div>
      </section>

      <section className="nf-kpis" aria-label="Indicadores do período">
        <article className="nf-kpi orange"><div className="nf-kpi-top"><span>Vendas por pedidos</span><ShoppingBag size={19}/></div><strong>{money(sales)}</strong><Variation value={pctChange(sales,previousSales)}/></article>
        <article className="nf-kpi green"><div className="nf-kpi-top"><span>Pedidos</span><ShoppingCart size={19}/></div><strong>{currentOrders.length}</strong><Variation value={pctChange(currentOrders.length,previousOrders.length)}/></article>
        <article className="nf-kpi blue"><div className="nf-kpi-top"><span>Clientes ativos</span><Users size={19}/></div><strong>{activeCustomers}</strong><small className="nf-variation neutral">Com pedidos no período</small></article>
        <article className="nf-kpi yellow"><div className="nf-kpi-top"><span>Ticket médio</span><Coins size={19}/></div><strong>{money(avg)}</strong><small className="nf-variation neutral">Por pedido no período</small></article>
      </section>

      <section className="nf-grid nf-grid-primary">
        <article className="nf-card nf-revenue-card">
          <div className="nf-card-heading"><div><span className="nf-eyebrow">DESEMPENHO</span><h2>Faturamento diário</h2></div><span className="nf-card-period">{periodLabel}</span></div>
          <DailyChart data={daily}/>
          <div className="nf-finance-summary">
            <div><small>Receitas de pedidos</small><b>{money(sales)}</b></div>
            <div><small>Despesas pagas</small><b>{money(expenses)}</b></div>
            <div><small>Lucro estimado</small><b className={profit>=0?"positive":"negative"}>{money(profit)}</b></div>
            <div><small>Margem sobre insumos</small><b>{inputMargin===null?"—":inputMargin.toLocaleString("pt-BR",{maximumFractionDigits:1})+"%"}</b></div>
          </div>
          {inputMargin===null?<p className="nf-footnote">Sem custo de insumos pago e identificado no período. A margem não foi estimada.</p>:<p className="nf-footnote">Receitas = total dos pedidos não cancelados. Margem = vendas menos despesas categorizadas como insumos.</p>}
        </article>
        <article className="nf-card nf-lines-card">
          <div className="nf-card-heading"><div><span className="nf-eyebrow">MIX DE PRODUTOS</span><h2>Vendas por linha</h2></div></div>
          {lineTotal>0?<div className="nf-lines-body"><Donut values={lines} center={<><b>{lineTotal.toLocaleString("pt-BR")}</b><small>un.</small></>}/><div className="nf-legend">{lines.sort((a,b)=>b.value-a.value).map(l=><div key={l.name}><i style={{background:l.color}}/><span>{l.name}</span><b>{(l.value/lineTotal*100).toLocaleString("pt-BR",{maximumFractionDigits:1})}%</b></div>)}</div></div>:<div className="nf-chart-empty">Sem vendas por linha neste período.</div>}
        </article>
      </section>

      <section className="nf-grid nf-grid-secondary">
        <article className="nf-card nf-top-card"><div className="nf-card-heading"><div><span className="nf-eyebrow">DESTAQUES</span><h2>Top 5 mais vendidos</h2></div></div>
          {topProducts.length?<div className="nf-top-list">{topProducts.map(([name,value],i)=><div className="nf-top-row" key={name}><b className={"nf-rank rank-"+i}>{i+1}</b><div className="nf-top-info"><span>{name}</span><div className="nf-top-track"><i style={{width:(value/maxTop*100)+"%"}}/></div></div><strong>{value} <small>un.</small></strong></div>)}</div>:<div className="nf-chart-empty">Nenhum produto vendido neste período.</div>}
        </article>
        <article className="nf-card nf-status-card"><div className="nf-card-heading"><div><span className="nf-eyebrow">OPERAÇÃO</span><h2>Status dos pedidos</h2></div><b className="nf-total-pill">{currentOrders.length} no período</b></div>
          {currentOrders.length?<><div className="nf-status-bar" role="group" aria-label="Distribuição dos pedidos no período">{[{key:"new",label:"Novos",value:counts.new,color:"#FF7A00"},{key:"prep",label:"Produção",value:counts.prep,color:"#F5C518"},{key:"delivery",label:"Entrega",value:counts.delivery,color:"#4AA3FF"},{key:"done",label:"Concluídos",value:counts.done,color:"#9BE22A"}].map(x=><button key={x.key} type="button" style={{width:(x.value/currentOrders.length*100)+"%",background:x.color}} title={x.label+" · "+x.value} aria-label={x.label+": "+x.value} onClick={()=>onNavigate("pedidos:"+x.key)}>{x.value>0?x.value:""}</button>)}</div><div className="nf-status-legend">{[{key:"new",label:"Novos",value:counts.new,color:"#FF7A00"},{key:"prep",label:"Produção",value:counts.prep,color:"#F5C518"},{key:"delivery",label:"Entrega",value:counts.delivery,color:"#4AA3FF"},{key:"done",label:"Concluídos",value:counts.done,color:"#9BE22A"}].map(x=><button key={x.key} type="button" onClick={()=>onNavigate("pedidos:"+x.key)}><i style={{background:x.color}}/><span>{x.label}</span><b>{x.value}</b></button>)}</div></>:<div className="nf-chart-empty">Nenhum pedido no período selecionado.</div>}
        </article>
        <article className="nf-card nf-stock-card"><div className="nf-card-heading"><div><span className="nf-eyebrow">ABASTECIMENTO</span><h2>Estoque crítico</h2></div><span className="nf-current-label">Atual</span></div>
          {criticalStock.length?<div className="nf-stock-list">{criticalStock.map(item=>{const status=stockStatus(item),isZero=status==="Zerado",current=Number(item.current_quantity||0),minimum=Number(item.minimum_quantity||0);const pct=stockPercent(item);return <button key={item.id} type="button" className="nf-stock-item" onClick={()=>onNavigate("estoque")}><span className="nf-stock-name">{item.name}</span><span className={"nf-stock-tag "+(isZero?"zero":"low")}>{status} · {stockText(current,item.unit)} / {stockText(minimum,item.unit)}</span><span className="nf-stock-level"><i style={{width:pct+"%"}}/><b style={{left:(Math.min(100,Math.max(0,stockValue(minimum,item.unit)/Math.max(stockValue(current,item.unit),stockValue(minimum,item.unit)*1.5,1)*100)))+"%"}}/></span></button>})}</div>:<div className="nf-chart-empty">Nenhum item abaixo do mínimo cadastrado.</div>}
          <button type="button" className="nf-purchase-button" onClick={()=>onNavigate("estoque")}>Criar lista de compras <ShoppingBag size={15}/></button>
        </article>
      </section>

      <section className="nf-grid nf-grid-bottom">
        <article className="nf-card nf-delivery-card"><div className="nf-card-heading"><div><span className="nf-eyebrow">LOGÍSTICA</span><h2>Entregas</h2></div><span className="nf-current-label">Agenda atual</span></div>
          {nextDeliveries.length?<div className="nf-delivery-list">{nextDeliveries.map(d=><div className="nf-delivery-row" key={d.id}><time>{d.delivery_window||new Date(d.delivery_date+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</time><span>{d.customer_name||"Cliente"}</span><small>{d.driver_name||"Responsável não definido"}</small></div>)}</div>:<div className="nf-chart-empty">Nenhuma entrega agendada.</div>}
        </article>
        <article className="nf-card nf-production-card"><div className="nf-card-heading"><div><span className="nf-eyebrow">COZINHA</span><h2>Produção de hoje</h2></div><span className="nf-current-label">Hoje</span></div>
          {planned>0?<div className="nf-production-content"><div className="nf-production-ring" style={{background:"conic-gradient(#9BE22A "+Math.min(100,produced/planned*100)+"%,#303030 0)"}}><div><b>{Math.round(produced/planned*100)}%</b><small>concluído</small></div></div><div className="nf-production-stats"><p>Previsto <b>{planned} marmitas</b></p><p>Produzido <b>{produced} marmitas</b></p><p>Pendente <b>{Math.max(0,planned-produced)} marmitas</b></p></div></div>:<div className="nf-production-empty"><p>Sem produção planejada para hoje.</p><button type="button" onClick={()=>onNavigate("producao")}>Planejar produção <ArrowUpRight size={15}/></button></div>}
        </article>
      </section>
      <div className="nf-dashboard-foot">{loading?"Sincronizando informações…":"Atualização automática a cada 30 segundos"} · {refreshing?"Atualizando…":"Dados reais registrados"}</div>
    </div>
  </div>;
}
