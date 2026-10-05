"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, ChevronRight, Factory, MessageCircle, Package, RefreshCw, Search, ShoppingBag, Sparkles, Truck, Users, Wallet } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Order = { id:string; created_at:string; customer_name:string|null; item_count:number; total:number; status:string };
type Inventory = { id:string; name:string; unit:string; current_quantity:number; minimum_quantity:number; average_cost:number; active:boolean };
type Lead = { id:string; company:string; contact_name:string; status:string; estimated_meals:string|null };
type Message = { id:string; created_at:string; display_name:string|null; message_text:string|null; processed:boolean };

async function request(path:string, token:string) {
  const r=await fetch(path,{headers:{apikey:KEY,Authorization:`Bearer ${token}`}});
  const t=await r.text();
  if(!r.ok) throw new Error(t||"Erro");
  return t?JSON.parse(t):null;
}

const money=(v:number)=>`R$ ${Number(v||0).toFixed(2).replace(".",",")}`;

export default function NFCorePage(){
  const [token,setToken]=useState("");
  const [email,setEmail]=useState("");
  const [orders,setOrders]=useState<Order[]>([]);
  const [inventory,setInventory]=useState<Inventory[]>([]);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [messages,setMessages]=useState<Message[]>([]);
  const [recipes,setRecipes]=useState<any[]>([]);
  const [recipeItems,setRecipeItems]=useState<any[]>([]);
  const [catalog,setCatalog]=useState<any[]>([]);
  const [planning,setPlanning]=useState(false);
  const [command,setCommand]=useState("");
  const [answer,setAnswer]=useState("Estou pronto. Pergunte sobre vendas, pedidos, estoque, produção, B2B ou WhatsApp.");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [purchaseDraft,setPurchaseDraft]=useState(false);
  const [purchaseMessage,setPurchaseMessage]=useState("");

  async function load(t=token){
    if(!t)return;
    setBusy(true);setError("");
    try{
      const [o,i,l,m,r,ri,cp]=await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=id,created_at,customer_name,item_count,total,status&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_items?select=id,name,unit,current_quantity,minimum_quantity,average_cost,active&active=eq.true&order=name.asc&limit=500`,t),
        request(`${URL}/rest/v1/b2b_leads?select=id,company,contact_name,status,estimated_meals&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/whatsapp_messages?select=id,created_at,display_name,message_text,processed&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_recipes?select=id,name,product_name,yield_quantity,yield_unit,active,catalog_product_id&active=eq.true&limit=500`,t),
        request(`${URL}/rest/v1/inventory_recipe_items?select=id,recipe_id,item_id,quantity&limit=5000`,t),
        request(`${URL}/rest/v1/catalog_products?select=id,name,active,line,size_grams&active=eq.true&limit=500`,t)
      ]);
      setOrders(o||[]);setInventory(i||[]);setLeads(l||[]);setMessages(m||[]);setRecipes(r||[]);setRecipeItems(ri||[]);setCatalog(cp||[]);
    }catch(e){setError("Não consegui carregar os dados do painel.");}
    finally{setBusy(false);}
  }

  useEffect(()=>{
    const t=sessionStorage.getItem("nutrifit_admin_token")||"";
    const e=sessionStorage.getItem("nutrifit_admin_email")||"";
    setToken(t);setEmail(e);
    if(t)void load(t);
  },[]);

  const today=new Date().toLocaleDateString("pt-BR");
  const todayOrders=orders.filter(o=>new Date(o.created_at).toLocaleDateString("pt-BR")===today);
  const todayRevenue=todayOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const lowStock=inventory.filter(i=>Number(i.current_quantity)<=Number(i.minimum_quantity));
  const pending=orders.filter(o=>["enviado_whatsapp","novo","confirmado","pago_recebido"].includes(o.status));
  const prep=orders.filter(o=>o.status==="em_preparo");
  const delivery=orders.filter(o=>o.status==="saiu_entrega");
  const openLeads=leads.filter(l=>!["Perdido","Cliente ativo"].includes(l.status));
  const actionableOrders=orders.filter(o=>["confirmado","pago_recebido","em_preparo"].includes(o.status));
  const inventoryMap=useMemo(()=>new Map(inventory.map(i=>[i.id,i])),[inventory]);
  const recipeMap=useMemo(()=>new Map(recipes.map(r=>[r.catalog_product_id,r])),[recipes]);
  const plannedNeeds=useMemo(()=>{const totals=new Map<string,number>();let mapped=0;for(const order of actionableOrders){const raw:any=(order as any).items;const lines=Array.isArray(raw)?raw:(raw?.items&&Array.isArray(raw.items)?raw.items:[]);for(const line of lines){const qty=Number(line.quantity||line.qty||line.amount||1);if(!qty)continue;const pid=line.product_id||line.productId||line.catalog_product_id||line.id;const name=String(line.name||line.product_name||line.product||"").trim();const recipe=recipeMap.get(pid)||recipes.find(r=>r.name===name||r.product_name===name);if(!recipe)continue;mapped+=qty;const yieldQty=Number(recipe.yield_quantity||1)||1;for(const ri of recipeItems.filter(x=>x.recipe_id===recipe.id)){const need=Number(ri.quantity||0)*(qty/yieldQty);totals.set(ri.item_id,(totals.get(ri.item_id)||0)+need);}}}const rows=[...totals.entries()].map(([item_id,required])=>{const i=inventoryMap.get(item_id);const current=Number(i?.current_quantity||0);return {item_id,required,current,shortage:Math.max(required-current,0),name:i?.name||"Insumo não cadastrado",unit:i?.unit||"un",cost:Number(i?.average_cost||0)};}).filter(x=>x.required>0).sort((a,b)=>b.shortage-a.shortage);return {rows,mapped};},[actionableOrders,inventoryMap,recipeItems,recipes,recipeMap]);
  const productionSummary=useMemo(()=>({orders:actionableOrders.length,mapped:plannedNeeds.mapped,items:plannedNeeds.rows.filter(x=>x.shortage>0).length,estimated:plannedNeeds.rows.reduce((s,x)=>s+x.shortage*x.cost,0)}),[actionableOrders.length,plannedNeeds]);

  const insight=useMemo(()=>{
    if(lowStock.length)return `Atenção: ${lowStock.length} item(ns) estão no mínimo ou abaixo dele. O primeiro é ${lowStock[0].name}.`;
    if(pending.length)return `Há ${pending.length} pedido(s) aguardando uma ação.`;
    if(prep.length)return `Há ${prep.length} pedido(s) em preparo.`;
    return "A operação não apresenta alertas críticos nos dados carregados.";
  },[lowStock.length,pending.length,prep.length]);

  async function createPurchaseDraft(){
    if(!token||!lowStock.length)return;
    setBusy(true);setPurchaseMessage("");
    try{
      const response=await fetch(`${URL}/rest/v1/inventory_purchases`,{method:"POST",headers:{apikey:KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({status:"rascunho",total_cost:0,notes:"Rascunho gerado pelo NF CORE a partir dos alertas de estoque."})});
      const created=await response.json();
      if(!response.ok)throw new Error(JSON.stringify(created));
      const id=created?.[0]?.id;
      if(id){
        const items=lowStock.map(i=>{const q=Math.max(Number(i.minimum_quantity)-Number(i.current_quantity),1);return {purchase_id:id,item_id:i.id,quantity:q,unit_cost:Number(i.average_cost||0),total_cost:q*Number(i.average_cost||0),is_promotion:false};});
        const itemResponse=await fetch(`${URL}/rest/v1/inventory_purchase_items`,{method:"POST",headers:{apikey:KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(items)});
        if(!itemResponse.ok)throw new Error(await itemResponse.text());
      }
      setPurchaseMessage("Rascunho de compra criado. Ele ainda não foi enviado nem marcado como recebido.");
      setPurchaseDraft(false);
    }catch(e){console.error(e);setPurchaseMessage("Não foi possível criar o rascunho de compra.");}
    finally{setBusy(false);}
  }

  function runCommand(raw=command){
    const q=raw.toLowerCase().trim();
    if(!q)return;
    if(/produção|producao|produzir/.test(q)){setAnswer(productionSummary.orders?"Tenho "+productionSummary.orders+" pedido(s) prontos para planejamento. Consegui mapear "+productionSummary.mapped+" unidade(s) pelas fichas técnicas. "+productionSummary.items+" insumo(s) apresentam falta.":"Não há pedidos em confirmado, pago ou em preparo para planejar agora.");}else if(/estoque|comprar|compra/.test(q)){
      setAnswer(lowStock.length
        ? `Encontrei ${lowStock.length} item(ns) que merecem atenção: ${lowStock.slice(0,8).map(i=>`${i.name} (${i.current_quantity} ${i.unit}, mínimo ${i.minimum_quantity} ${i.unit})`).join("; ")}.`
        : "O estoque está acima dos mínimos cadastrados.");
    }else if(/venda|fatur|faturamento|quanto.*hoje/.test(q)){
      setAnswer(`Hoje: ${todayOrders.length} pedido(s) e ${money(todayRevenue)} em vendas.`);
    }else if(/pedido|pedidos/.test(q)){
      setAnswer(`Existem ${pending.length} pedido(s) aguardando ação, ${prep.length} em preparo e ${delivery.length} em rota.`);
    }else if(/b2b|empresa|lead/.test(q)){
      setAnswer(`Tenho ${openLeads.length} lead(s) B2B em aberto de ${leads.length} cadastrados.`);
    }else if(/whatsapp|mensagem/.test(q)){
      setAnswer(`Há ${messages.length} mensagens recentes carregadas no painel; ${messages.filter(m=>!m.processed).length} ainda estão pendentes de processamento.`);
    }else if(/produção|producao/.test(q)){
      setAnswer(`Há ${prep.length} pedido(s) marcado(s) como em preparo. A produção detalhada continua na área Produção.`);
    }else if(/resumo|status|atenção|atencao|como.*está|como.*esta/.test(q)){
      setAnswer(insight+` Hoje são ${todayOrders.length} pedido(s), ${money(todayRevenue)} em vendas e ${openLeads.length} lead(s) B2B em aberto.`);
    }else{
      setAnswer("Consigo responder, nesta primeira versão, sobre vendas, pedidos, estoque, produção, B2B e WhatsApp. Tente: “o que precisa da minha atenção?”");
    }
    setCommand("");
  }

  if(!token)return <main className="min-h-screen bg-[#080a07] p-6 text-white"><div className="mx-auto mt-20 max-w-md rounded-3xl border border-white/10 bg-[#0d110b] p-6"><Bot className="text-[#a7b86a]" size={32}/><h1 className="mt-4 text-2xl font-black">NF CORE</h1><p className="mt-2 text-sm text-white/50">Entre no painel administrativo primeiro para usar o agente.</p><a href="/admin" className="mt-5 block rounded-full bg-[#a7b86a] px-5 py-3 text-center font-black text-black">Abrir painel</a></div></main>;

  const cards=[
    {label:"Vendas hoje",value:money(todayRevenue),icon:Wallet},
    {label:"Pedidos pendentes",value:pending.length,icon:ShoppingBag},
    {label:"Estoque crítico",value:lowStock.length,icon:Package},
    {label:"B2B em aberto",value:openLeads.length,icon:Users},
  ];

  return <main className="min-h-screen bg-[#080a07] text-white">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090c08]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <a href="/admin" className="rounded-full border border-white/10 p-2" aria-label="Voltar"><ArrowLeft size={17}/></a>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a7b86a] text-black"><Bot size={22}/></div>
          <div><div className="text-[10px] font-black uppercase tracking-[.22em] text-[#a7b86a]">Nutrifit</div><div className="font-black">NF CORE</div></div>
        </div>
        <button onClick={()=>void load()} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black"><RefreshCw size={14} className={busy?"animate-spin":""}/></button>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-4 py-6 pb-12 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-[#a7b86a]/20 bg-gradient-to-br from-[#11170d] to-[#0c0f0a] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]"><Sparkles size={15}/> Inteligência operacional</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">NF CORE</h1>
            <p className="mt-3 text-sm leading-6 text-white/45">O núcleo inteligente da Nutrifit. Nesta primeira versão ele já lê os dados do painel e transforma a operação em respostas rápidas.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45"><span className="text-white/70">Conectado como</span><br/><b className="text-[#d9e5a5]">{email||"Administrador"}</b></div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/35"><Bot size={15} className="text-[#a7b86a]"/> Comando NF CORE</div>
          <div className="mt-3 flex gap-2">
            <input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")runCommand()}} placeholder="Ex.: O que precisa da minha atenção?" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]"/>
            <button onClick={()=>runCommand()} className="rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black">Executar</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["O que precisa da minha atenção?","Como estão as vendas hoje?","O que preciso comprar?","Quantos pedidos estão pendentes?","Criar rascunho de compra"].map(x=><button key={x} onClick={()=>runCommand(x)} className="rounded-full border border-white/10 px-3 py-2 text-[11px] font-bold text-white/55 hover:border-[#a7b86a]/40 hover:text-white">{x}</button>)}
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-[#a7b86a]/20 bg-[#a7b86a]/5 p-5">
          <div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[#a7b86a]" size={19}/><p className="text-sm leading-6 text-white/75">{answer}</p></div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/35"><Factory size={16}/> Planejamento inteligente</div><h2 className="mt-2 text-xl font-black">Produção baseada nos pedidos</h2><p className="mt-1 text-sm leading-6 text-white/45">O NF CORE cruza pedidos, fichas técnicas e estoque para estimar o que falta antes da produção.</p></div><button onClick={()=>{setPlanning(true);setAnswer(productionSummary.orders?"Planejamento atualizado: "+productionSummary.orders+" pedido(s), "+productionSummary.mapped+" unidade(s) mapeadas e "+productionSummary.items+" insumo(s) com falta.":"Não há pedidos elegíveis para planejamento.")}} className="rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">{planning?"Atualizar planejamento":"Calcular produção"}</button></div>{planning&&<div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="rounded-2xl bg-white/[.03] p-4"><div className="text-2xl font-black">{productionSummary.orders}</div><div className="text-xs text-white/40">Pedidos</div></div><div className="rounded-2xl bg-white/[.03] p-4"><div className="text-2xl font-black">{productionSummary.mapped}</div><div className="text-xs text-white/40">Unidades mapeadas</div></div><div className="rounded-2xl bg-white/[.03] p-4"><div className="text-2xl font-black">{productionSummary.items}</div><div className="text-xs text-white/40">Faltas de insumo</div></div><div className="rounded-2xl bg-white/[.03] p-4"><div className="text-2xl font-black">{money(productionSummary.estimated)}</div><div className="text-xs text-white/40">Custo estimado da falta</div></div></div>}{planning&&plannedNeeds.rows.length>0&&<div className="mt-4 space-y-2">{plannedNeeds.rows.slice(0,8).map(x=><div key={x.item_id} className="flex items-center justify-between rounded-2xl bg-white/[.025] p-3"><div><div className="text-sm font-bold">{x.name}</div><div className="text-[11px] text-white/35">Necessário {x.required.toFixed(1)} {x.unit} • disponível {x.current.toFixed(1)} {x.unit}</div></div><b className={x.shortage>0?"text-[#ef7d18]":"text-[#a7b86a]"}>{x.shortage>0?"Comprar "+x.shortage.toFixed(1)+" "+x.unit:"OK"}</b></div>)}</div>}{planning&&plannedNeeds.mapped===0&&<div className="mt-4 rounded-2xl border border-[#ef7d18]/20 bg-[#1b120a] p-4 text-sm text-[#f1b06e]">Nenhum pedido conseguiu ser ligado a uma ficha técnica. Confira se os itens do pedido carregam o ID do produto do catálogo.</div>}</section>
      {lowStock.length>0&&<section className="mt-5 rounded-3xl border border-[#ef7d18]/25 bg-[#1b120a] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="text-xs font-black uppercase tracking-[.15em] text-[#ef7d18]">Ação assistida</div><h2 className="mt-1 text-xl font-black">NF CORE encontrou {lowStock.length} item(ns) para compra.</h2><p className="mt-1 text-sm text-white/45">Preparar rascunho com as quantidades mínimas. Nada será enviado ao fornecedor.</p></div>
          <button onClick={()=>setPurchaseDraft(true)} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">Preparar compra</button>
        </div>
        {purchaseMessage&&<div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/65">{'{'}purchaseMessage{'}'}</div>}
      </section>}
      {purchaseDraft&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#10130d] p-6 shadow-2xl"><div className="text-xs font-black uppercase tracking-[.15em] text-[#a7b86a]">Confirmação necessária</div><h2 className="mt-2 text-2xl font-black">Criar rascunho de compra?</h2><p className="mt-3 text-sm leading-6 text-white/50">O NF CORE registrará a compra como rascunho. Não haverá envio, pagamento ou entrada no estoque.</p><div className="mt-5 flex gap-2"><button onClick={()=>setPurchaseDraft(false)} className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm font-black">Cancelar</button><button onClick={()=>void createPurchaseDraft()} disabled={busy} className="flex-1 rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">{'{'}busy?"Criando...":"Confirmar"{'}'}</button></div></div></div>}
      {error&&<div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]">{error}</div>}

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({label,value,icon:Icon})=><div key={label} className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-5"><Icon size={19} className="text-[#a7b86a]"/><div className="mt-4 text-2xl font-black">{value}</div><div className="mt-1 text-xs font-bold text-white/40">{label}</div></div>)}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/35"><Package size={16}/> Atenção</div>
          <h2 className="mt-2 text-xl font-black">{insight}</h2>
          <div className="mt-4 space-y-2">{lowStock.slice(0,6).map(i=><div key={i.id} className="flex items-center justify-between rounded-2xl bg-white/[.025] p-3"><span className="text-sm font-bold">{i.name}</span><span className="text-xs font-black text-[#ef7d18]">{i.current_quantity} {i.unit} / mín. {i.minimum_quantity}</span></div>)}{!lowStock.length&&<p className="text-sm text-white/40">Nenhum alerta de estoque.</p>}</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/35"><Factory size={16}/> Operação</div>
          <div className="mt-4 space-y-3">
            <a href="/admin" className="flex items-center justify-between rounded-2xl bg-white/[.025] p-4"><span className="flex items-center gap-3 text-sm font-black"><ShoppingBag size={17} className="text-[#a7b86a]"/> Pedidos</span><span className="text-xs text-white/40">{orders.length} carregados <ChevronRight size={15} className="ml-1 inline"/></span></a>
            <a href="/admin" className="flex items-center justify-between rounded-2xl bg-white/[.025] p-4"><span className="flex items-center gap-3 text-sm font-black"><Truck size={17} className="text-[#a7b86a]"/> Entregas em rota</span><b className="text-[#d9e5a5]">{delivery.length}</b></a>
            <a href="/admin" className="flex items-center justify-between rounded-2xl bg-white/[.025] p-4"><span className="flex items-center gap-3 text-sm font-black"><MessageCircle size={17} className="text-[#a7b86a]"/> WhatsApp pendente</span><b className="text-[#d9e5a5]">{messages.filter(m=>!m.processed).length}</b></a>
          </div>
        </div>
      </section>

      <div className="mt-5 text-xs text-white/25">NF CORE v1 • leitura operacional conectada ao painel Nutrifit. Ações de alteração ainda exigirão confirmação explícita.</div>
    </div>
  </main>;
}
