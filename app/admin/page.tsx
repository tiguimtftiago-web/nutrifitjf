"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Operations from "./operations";
import {
  BarChart3, Building2, LogOut, MessageCircle, RefreshCw, Search,
  ShoppingBag, Users, X, Package, Home, MoreHorizontal, ChevronRight, Wallet, Truck, Factory, Ticket, Bot
} from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const FALLBACK_VAPID_PUBLIC_KEY = "BB0vbJzwFpvhg9vRY65tqKh220prqXjozkHCwBXAxesWCJntEJlxmX4QW-m6OAP4bnNcVIbrpJ62v-MawD9rBuc";

type Order = { id:string; created_at:string; customer_name:string|null; whatsapp:string|null; email:string|null; items:unknown; item_count:number; subtotal:number; delivery_fee:number; total:number; cep:string|null; neighborhood:string|null; status:string; };
type Customer = { id:string; created_at:string; name:string; whatsapp:string; email:string|null; marketing_consent:boolean; order_count:number; total_spend:number; };
type Lead = { id:string; created_at:string; company:string; contact_name:string; whatsapp:string; email:string; estimated_meals:string|null; frequency:string|null; status:string; next_follow_up_at:string|null; proposal_value:number|null; owner_notes:string|null; notes:string|null; };
type Message = { id:string; created_at:string; from_phone:string|null; display_name:string|null; message_text:string|null; message_type:string|null; processed:boolean; };
type Section = "resumo"|"pedidos"|"clientes"|"whatsapp"|"b2b"|"estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons";
type InventoryItem = { id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; average_cost:number; supplier:string|null; active:boolean; notes:string|null; };
type OrderRequirement = { id:string; order_id:string; recipe_id:string|null; item_id:string; required_quantity:number; item_name:string; unit:string; current_quantity:number; };
type OrderProduction = { id:string; order_id:string; recipe_id:string|null; quantity:number; status:string; stock_consumed:boolean; recipe_name:string|null; };
type PurchaseAlert = { item_id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; required_quantity:number; shortage_quantity:number; order_count:number; status:string; };

async function request(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string> = { apikey:KEY, "Content-Type":"application/json", ...((init.headers as Record<string,string>) || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path,{...init,headers});
  const text = await response.text();
  if (response.status === 401) {
    window.dispatchEvent(new Event("nutrifit-admin-auth-expired"));
    throw new Error("Sessão administrativa expirada.");
  }
  if (!response.ok) throw new Error(text || "Erro na solicitação.");
  return text ? JSON.parse(text) : null;
}

const money = (v:number) => `R$ ${Number(v||0).toFixed(2).replace(".",",")}`;
const statuses = ["Novo lead","Contato realizado","Entendendo necessidade","Proposta enviada","Negociação","Cliente ativo","Sem retorno","Perdido","Reativar depois"];

export default function AdminPage() {
  const [token,setToken] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [section,setSection] = useState<Section>("resumo");
  const [orders,setOrders] = useState<Order[]>([]);
  const [customers,setCustomers] = useState<Customer[]>([]);
  const [messages,setMessages] = useState<Message[]>([]);
  const [leads,setLeads] = useState<Lead[]>([]);
  const [selected,setSelected] = useState<Lead|null>(null);
  const [search,setSearch] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [inventory,setInventory] = useState<InventoryItem[]>([]);
  const [mobileMore,setMobileMore] = useState(false);
  const [selectedOrder,setSelectedOrder] = useState<Order|null>(null);
  const [orderRequirements,setOrderRequirements] = useState<OrderRequirement[]>([]);
  const [orderProductions,setOrderProductions] = useState<OrderProduction[]>([]);
  const [purchaseAlerts,setPurchaseAlerts] = useState<PurchaseAlert[]>([]);
  const [pushStatus,setPushStatus] = useState<"idle"|"loading"|"enabled"|"denied"|"unsupported">("idle");
  const [greeting,setGreeting] = useState("Bom dia");

  async function load(t=token, background=false) {
    if (!t) return;
    if (!background) { setBusy(true); setError(""); }
    try {
      const [o,c,m,l,i,a] = await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/customer_profiles?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/whatsapp_messages?select=id,created_at,from_phone,display_name,message_text,message_type,processed&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/b2b_leads?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_items?select=*&order=name.asc&limit=500`,t),
        request(`${URL}/rest/v1/inventory_purchase_alerts?select=*&limit=500`,t),
      ]);
      setOrders(o||[]); setCustomers(c||[]); setMessages(m||[]); setLeads(l||[]); setInventory(i||[]); setPurchaseAlerts(a||[]);
    } catch (e) {
      console.error(e);
      if (!background) setError("Não foi possível carregar os dados. Confirme se sua conta tem acesso administrativo.");
    } finally {
      if (!background) setBusy(false);
    }
  }

  useEffect(() => {
    const onExpired=()=>{
      sessionStorage.removeItem("nutrifit_admin_token");
      sessionStorage.removeItem("nutrifit_admin_email");
      setToken("");
      setError("Sua sessão administrativa expirou. Entre novamente para continuar.");
    };
    window.addEventListener("nutrifit-admin-auth-expired",onExpired);
    return ()=>window.removeEventListener("nutrifit-admin-auth-expired",onExpired);
  },[]);

  useEffect(() => {
    const saved=sessionStorage.getItem("nutrifit_admin_token")||"";
    const savedEmail=sessionStorage.getItem("nutrifit_admin_email")||"";
    if(savedEmail)setEmail(savedEmail);
    if(saved){setToken(saved);void load(saved);}
  },[]);

  useEffect(() => {
    if (!token) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(token, true);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [token]);

  useEffect(() => {
    setSearch("");
    setMobileMore(false);
  }, [section]);
  useEffect(() => {
    const hour=new Date().getHours();
    setGreeting(hour>=18 ? "Boa noite" : hour>=12 ? "Boa tarde" : "Bom dia");
  },[]);

  useEffect(() => {
    if (!token) return;
    void ensurePush(false);
  }, [token, email]);

  useEffect(() => {
    const count = purchaseAlerts.length;
    try {
      if (count > 0 && "setAppBadge" in navigator) {
        void navigator.setAppBadge(count);
      } else if (count === 0 && "clearAppBadge" in navigator) {
        void navigator.clearAppBadge();
      }
    } catch {}
  }, [purchaseAlerts.length]);

  async function login(e:FormEvent){
    e.preventDefault(); setBusy(true); setError("");
    try {
      const data=await request(`${URL}/auth/v1/token?grant_type=password`,"",{method:"POST",body:JSON.stringify({email:email.trim().toLowerCase(),password})});
      if(!data?.access_token) throw new Error("Token ausente");
      sessionStorage.setItem("nutrifit_admin_token",data.access_token);
      sessionStorage.setItem("nutrifit_admin_email",email.trim().toLowerCase());
      setToken(data.access_token); setPassword(""); await load(data.access_token);
    } catch { sessionStorage.removeItem("nutrifit_admin_token"); setError("E-mail ou senha inválidos."); }
    finally { setBusy(false); }
  }

  async function recover(){
    if(!email){setError("Digite seu e-mail primeiro.");return;}
    setBusy(true);setError("");
    try {
      const r=await fetch(`${URL}/auth/v1/recover`,{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({email,redirect_to:"https://nutrifitjf.com.br/admin"})});
      if(!r.ok) throw new Error();
      setError("E-mail de recuperação enviado. Confira sua caixa de entrada.");
    } catch { setError("Não foi possível enviar o e-mail de recuperação."); }
    finally {setBusy(false);}
  }

  function urlBase64ToUint8Array(base64String:string){
    const padding="=".repeat((4-base64String.length%4)%4); const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
    const raw=window.atob(base64); return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
  }

  async function ensurePush(requestPermission=false){
    if(!token)return;
    try{
      if(!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)){setPushStatus("unsupported");return;}
      let permission=Notification.permission;
      if(requestPermission && permission!=="granted"){
        permission=await Notification.requestPermission();
      }
      if(permission!=="granted"){
        setPushStatus(permission==="denied"?"denied":"idle");
        return;
      }

      const publicKey=await request(URL+"/rest/v1/rpc/get_admin_push_public_key",token,{method:"POST",body:"{}"});
      const vapidPublicKey=publicKey||FALLBACK_VAPID_PUBLIC_KEY;
      let registration=await navigator.serviceWorker.register("/sw.js",{scope:"/"});
      await navigator.serviceWorker.ready;
      let subscription=await registration.pushManager.getSubscription();

      if(subscription){
        let existingCheckOk=true;
        let existing:any[]=[];
        try{
          existing=await request(
            `${URL}/rest/v1/admin_push_subscriptions?select=id&endpoint=eq.${encodeURIComponent(subscription.endpoint)}&active=eq.true&limit=1`,
            token
          );
        }catch{
          existingCheckOk=false;
        }
        if(existingCheckOk && (!Array.isArray(existing)||existing.length===0)){
          await subscription.unsubscribe().catch(()=>{});
          subscription=null;
        }
      }

      if(!subscription){
        try{
          subscription=await registration.pushManager.subscribe({
            userVisibleOnly:true,
            applicationServerKey:urlBase64ToUint8Array(vapidPublicKey)
          });
        }catch(firstError){
          console.warn("Primeira tentativa de push falhou. Recriando os Service Workers.",firstError);
          const registrations=await navigator.serviceWorker.getRegistrations().catch(()=>[]);
          await Promise.all(registrations.map((item)=>item.unregister().catch(()=>false)));
          await new Promise((resolve)=>window.setTimeout(resolve,300));
          registration=await navigator.serviceWorker.register("/sw.js?push-repair=1",{scope:"/"});
          await navigator.serviceWorker.ready;
          await registration.update().catch(()=>{});
          subscription=await registration.pushManager.subscribe({
            userVisibleOnly:true,
            applicationServerKey:urlBase64ToUint8Array(vapidPublicKey)
          });
        }
      }

      const json=subscription.toJSON();
      if(!json.endpoint||!json.keys?.p256dh||!json.keys?.auth)throw new Error("Assinatura incompleta");

      await request(URL+"/rest/v1/admin_push_subscriptions?on_conflict=endpoint",token,{
        method:"POST",
        headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
        body:JSON.stringify({
          endpoint:json.endpoint,
          p256dh:json.keys.p256dh,
          auth:json.keys.auth,
          user_email:email||"admin",
          user_agent:navigator.userAgent,
          active:true
        })
      });
      setPushStatus("enabled");
    }catch(e){
      console.error("Nutrifit push activation error",e);
      setPushStatus("idle");
      if(requestPermission){
        const message=e instanceof Error?e.message:"erro desconhecido";
        const name=e instanceof DOMException?e.name:"";
        if(/permission|notallowed|denied/i.test(message+" "+name)){
          setError("As notificações estão bloqueadas pelo navegador neste dispositivo.");
        }else if(/push|service worker|subscribe|vapid|applicationserverkey/i.test(message+" "+name)){
          setError(`Falha técnica ao criar a assinatura (${name||"erro"}). ${message||"O navegador recusou a assinatura."}`);
        }else{
          setError(`Não foi possível ativar as notificações (${name||"erro"}). ${message||"Tente novamente."}`);
        }
      }
    }
  }

  async function enablePush(){
    setPushStatus("loading");
    await ensurePush(true);
  }

  async function loadOrderProduction(orderId:string){
    try{
      const rows=await request(`${URL}/rest/v1/production_batches?select=id,order_id,recipe_id,quantity,status,stock_consumed,inventory_recipes(name)&order_id=eq.${orderId}&order=created_at.asc`,token);
      setOrderProductions((rows||[]).map((x:any)=>({id:x.id,order_id:x.order_id,recipe_id:x.recipe_id,quantity:Number(x.quantity||0),status:x.status,stock_consumed:Boolean(x.stock_consumed),recipe_name:x.inventory_recipes?.name||null})));
    }catch{setOrderProductions([]);}
  }

  async function loadOrderRequirements(orderId:string){
    try{
      const rows=await request(`${URL}/rest/v1/order_inventory_requirements?select=id,order_id,recipe_id,item_id,required_quantity,inventory_items(name,unit,current_quantity)&order_id=eq.${orderId}&order=required_quantity.desc`,token);
      setOrderRequirements((rows||[]).map((x:any)=>({id:x.id,order_id:x.order_id,recipe_id:x.recipe_id,item_id:x.item_id,required_quantity:Number(x.required_quantity||0),item_name:x.inventory_items?.name||"Insumo",unit:x.inventory_items?.unit||"",current_quantity:Number(x.inventory_items?.current_quantity||0)})));
    }catch{setOrderRequirements([]);}
  }

  async function createProductionFromOrder(order:Order){
    if(!token)return;
    setBusy(true);setError("");
    try{
      const result=await request(URL+"/rest/v1/rpc/create_production_from_order",token,{method:"POST",body:JSON.stringify({p_order_id:order.id})});
      const count=Number(result||0);
      if(count===0){setError("A produção já foi gerada para este pedido ou nenhum item possui ficha técnica ativa.");return;}
      setError("Produção gerada com sucesso. Ela ficará planejada e o estoque só será baixado quando for concluída.");
    }catch(e){console.error(e);setError("Não foi possível gerar a produção deste pedido.");}
    finally{setBusy(false);}
  }

  async function updateOrderStatus(order:Order,status:string){
    setBusy(true); setError("");
    try{
      await request(URL+"/rest/v1/customer_orders?id=eq."+order.id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status})});
      setOrders(prev=>prev.map(x=>x.id===order.id?{...x,status}:x));
      if(["confirmado","pago_recebido","em_preparo","saiu_entrega"].includes(status)){ await loadOrderRequirements(order.id); await loadOrderProduction(order.id); }
      if(status==="cancelado") setOrderRequirements([]);

      if(status==="pago_recebido" && order.whatsapp){
        try{
          const profiles=await request(URL+"/rest/v1/customer_profiles?select=email,name&whatsapp=eq."+encodeURIComponent(order.whatsapp)+"&limit=1",token);
          const profile=Array.isArray(profiles) ? profiles[0] : null;
          if(profile?.email){
            await fetch("/api/club-automation",{
              method:"POST",
              headers:{
                "Content-Type":"application/json",
                Authorization:"Bearer "+token,
              },
              body:JSON.stringify({
                event:"order.purchased",
                email:profile.email,
                firstName:String(profile.name||order.customer_name||"").trim().split(/\\s+/)[0]||"",
                orderId:order.id,
              }),
            });
          }
        }catch(error){ console.error("purchase automation trigger",error); }
      }

      setSelectedOrder(prev=>prev?.id===order.id?{...prev,status}:prev);
    }catch(e){ console.error(e); setError("Não foi possível atualizar o status do pedido."); }
    finally{setBusy(false);}
  }

  async function saveLead(){
    if(!selected)return;
    setBusy(true);
    try{
      await request(`${URL}/rest/v1/b2b_leads?id=eq.${selected.id}`,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({
        status:selected.status,next_follow_up_at:selected.next_follow_up_at||null,proposal_value:selected.proposal_value||null,owner_notes:selected.owner_notes||null,last_contact_at:new Date().toISOString()
      })});
      await load();setSelected(null);
    }catch{setError("Não foi possível salvar o lead.");}
    finally{setBusy(false);}
  }

  const q=search.toLowerCase().trim();
  const filteredCustomers=customers.filter(x=>!q||[x.name,x.whatsapp,x.email||""].join(" ").toLowerCase().includes(q));
  const filteredLeads=leads.filter(x=>!q||[x.company,x.contact_name,x.whatsapp,x.email].join(" ").toLowerCase().includes(q));
  const revenue=orders.reduce((s,x)=>s+Number(x.total||0),0);
  const activeOrders=orders.filter(x=>!["entregue","cancelado"].includes(x.status)).length;
  const todayKey=new Date().toLocaleDateString("pt-BR");
  const todayOrders=orders.filter(x=>new Date(x.created_at).toLocaleDateString("pt-BR")===todayKey);
  const todayRevenue=todayOrders.reduce((s,x)=>s+Number(x.total||0),0);
  const pendingOrders=orders.filter(x=>["enviado_whatsapp","novo","confirmado","pago_recebido"].includes(x.status));
  const prepOrders=orders.filter(x=>["em_preparo"].includes(x.status));
  const deliveryOrders=orders.filter(x=>x.status==="saiu_entrega");
  const todayNewCustomers=customers.filter(x=>new Date(x.created_at).toLocaleDateString("pt-BR")===todayKey).length;

  if(!token) return (
    <main className="min-h-screen bg-[#080a07] px-5 py-10 text-white">
      <div className="mx-auto mt-16 max-w-md rounded-[2rem] border border-white/10 bg-[#10130d] p-8 shadow-2xl">
        <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-12 w-12"/>
        <div className="mt-4 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div>
        <h1 className="mt-1 text-3xl font-black">Área administrativa</h1>
        <p className="mt-2 text-sm text-white/45">Acesso restrito. Use sua conta administrativa do sistema.</p>
        <form onSubmit={login} className="mt-7 grid gap-4">
          <input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none"/>
          <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none"/>
          {error&&<div className="rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-3 text-sm text-[#f1b06e]">{error}</div>}
          <button disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black disabled:opacity-50">{busy?"Aguarde...":"Entrar no painel"}</button>
          <button type="button" onClick={()=>void recover()} disabled={busy} className="text-xs font-bold text-white/45 underline">Esqueci minha senha</button>
        </form>
        <a href="/" className="mt-2 block rounded-full bg-[#a7b86a] px-5 py-3.5 text-center font-black text-black transition hover:opacity-90">Voltar para o site</a>
      </div>
    </main>
  );

  const nav = [
    {id:"resumo" as Section,label:"Resumo",Icon:BarChart3},
    {id:"pedidos" as Section,label:"Pedidos",Icon:ShoppingBag},
    {id:"clientes" as Section,label:"Clientes",Icon:Users},
    {id:"whatsapp" as Section,label:"WhatsApp",Icon:MessageCircle},
    {id:"b2b" as Section,label:"B2B",Icon:Building2},
    {id:"estoque" as Section,label:"Estoque",Icon:Package},
    {id:"produtos" as Section,label:"Produtos",Icon:ShoppingBag},
    {id:"financeiro" as Section,label:"Financeiro",Icon:BarChart3},
    {id:"entregas" as Section,label:"Entregas",Icon:Package},
    {id:"producao" as Section,label:"Produção",Icon:ShoppingBag},
    {id:"cupons" as Section,label:"Cupons",Icon:Package},
  ];

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090c08]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><img src="/images/nutrifit-logo-icon.svg" alt="" className="h-9 w-9"/><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div><div className="font-black">Painel administrativo</div></div></div>
          <div className="flex items-center gap-2">
            <button title={pushStatus==="enabled"?"Alertas ativos":"Ativar alertas"} aria-label={pushStatus==="enabled"?"Alertas ativos":"Ativar alertas"} onClick={()=>void enablePush()} disabled={pushStatus==="loading"||pushStatus==="enabled"} className={`rounded-full border px-3 py-2.5 text-xs font-black sm:px-4 ${pushStatus==="enabled"?"border-[#a7b86a]/40 bg-[#a7b86a]/10 text-[#c4d38c]":"border-[#ef7d18]/30 bg-[#1b120a] text-[#f1b06e]"}`}><span className="sm:hidden">🔔</span><span className="hidden sm:inline">{pushStatus==="enabled"?"🔔 Alertas ativos":pushStatus==="loading"?"Ativando...":"🔔 Ativar alertas"}</span></button>
            <button title="Atualizar dados" aria-label="Atualizar dados" onClick={()=>void load()} className="rounded-full border border-white/10 px-3 py-2.5 text-xs font-black sm:px-4"><RefreshCw size={14} className={`inline ${busy?"animate-spin":""}`}/><span className="ml-2 hidden sm:inline">Atualizar</span></button>
            <button title="Sair" aria-label="Sair" onClick={()=>{sessionStorage.removeItem("nutrifit_admin_token");sessionStorage.removeItem("nutrifit_admin_email");setToken("");}} className="rounded-full border border-white/10 px-3 py-2.5 text-xs font-black sm:px-4"><LogOut size={14} className="inline"/><span className="ml-2 hidden sm:inline">Sair</span></button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-24 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden h-fit rounded-3xl border border-white/10 bg-[#0d110b] p-2 lg:sticky lg:top-24 lg:block">
          <button onClick={()=>{window.location.href="/admin/nf-core"}} className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] px-4 py-3 text-left text-sm font-black text-[#f4aa67] shadow-[0_0_24px_rgba(239,125,24,.08)] hover:border-[#ef7d18]/50 hover:bg-[#21140b]"><Bot size={18}/><span><span className="block">NF CORE</span><span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.12em] text-[#f4aa67]/60">Central inteligente</span></span></button>
          {nav.map(({id,label,Icon})=><button key={id} onClick={()=>setSection(id)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black ${section===id?"bg-[#a7b86a] text-black":"text-white/55 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</button>)}
        </aside>
        <section className="min-w-0">
          <div className="mb-5 lg:hidden">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Painel</div>
                <h1 className="mt-1 text-2xl font-black">{nav.find(n=>n.id===section)?.label || "Resumo"}</h1>
              </div>
              <button onClick={()=>void load()} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"><RefreshCw size={14} className={`inline ${busy?"animate-spin":""}`}/></button>
            </div>
          </div>
          {error&&<div className="mb-5 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]">{error}</div>}

          {["estoque","produtos","financeiro","entregas","producao","cupons"].includes(section)&&<Operations section={section as "estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons"} token={token}/>}

                    {section==="resumo"&&<>
            <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Visão operacional</div>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{greeting}, Tiago e Elaine, o que precisa da sua atenção?</h1>
              <p className="mt-2 text-sm text-white/40 ">Tudo que importa agora, em um único lugar.</p>
            </div>

            {purchaseAlerts.length>0&&<button onClick={()=>setSection("estoque")} className="mb-5 w-full rounded-3xl border border-[#ef7d18]/35 bg-[#1b120a] p-4 text-left transition hover:bg-[#24170d] sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ef7d18]/15 text-[#ef9b55]"><Package size={19}/></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#ef7d18]">Precisa da sua atenção</div>
                  <div className="mt-1 text-lg font-black">{purchaseAlerts.length} {purchaseAlerts.length===1?"item precisa":"itens precisam"} ser comprados</div>
                  <div className="mt-3 flex flex-wrap gap-2">{purchaseAlerts.slice(0,4).map(a=><span key={a.item_id} className="rounded-full bg-[#ef7d18]/10 px-3 py-1.5 text-xs font-bold text-[#f1b06e]">{a.name} • {Number(a.shortage_quantity)>0?("falta "+Number(a.shortage_quantity).toLocaleString("pt-BR")+" "+a.unit):"estoque baixo"}</span>)}</div>
                  {purchaseAlerts.length>4&&<div className="mt-2 text-xs text-white/40">+ {purchaseAlerts.length-4} outro(s) • abrir lista completa</div>}
                </div>
                <ChevronRight size={18} className="mt-2 shrink-0 text-[#ef9b55]"/>
              </div>
            </button>}

            <section>
              <div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Hoje</div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {label:"Pedidos",value:todayOrders.length,sub:pendingOrders.length+" aguardando ação",Icon:ShoppingBag},
                  {label:"Produção",value:prepOrders.length,sub:"em preparo",Icon:Factory},
                  {label:"Estoque",value:purchaseAlerts.length,sub:purchaseAlerts.length===1?"item para comprar":"itens para comprar",Icon:Package},
                  {label:"Entregas",value:deliveryOrders.length,sub:"em rota",Icon:Truck},
                ].map(({label,value,sub,Icon})=><button key={label} onClick={()=>setSection(label==="Pedidos"?"pedidos":label==="Produção"?"producao":label==="Estoque"?"estoque":"entregas")} className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 text-left transition hover:border-white/20 sm:p-5">
                  <Icon size={19} className="text-[#a7b86a]"/>
                  <div className="mt-4 text-2xl font-black">{value}</div>
                  <div className="mt-1 text-sm font-bold">{label}</div>
                  <div className="mt-1 text-xs text-white/35">{sub}</div>
                </button>)}
              </div>
            </section>

            <section className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_.6fr]">
              <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Vendas de hoje</div>
                    <div className="mt-2 text-3xl font-black">{money(todayRevenue)}</div>
                    <div className="mt-1 text-xs text-white/35">{todayOrders.length} {todayOrders.length===1?"pedido":"pedidos"} registrados hoje</div>
                  </div>
                  <BarChart3 className="text-[#a7b86a]" size={22}/>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button onClick={()=>setSection("pedidos")} className="rounded-2xl bg-white/[.035] p-3 text-left">
                    <div className="text-[10px] text-white/35">Pedidos</div><b className="mt-1 block text-sm">{todayOrders.length}</b>
                  </button>
                  <button onClick={()=>setSection("clientes")} className="rounded-2xl bg-white/[.035] p-3 text-left">
                    <div className="text-[10px] text-white/35">Novos clientes</div><b className="mt-1 block text-sm">{todayNewCustomers}</b>
                  </button>
                  <button onClick={()=>setSection("financeiro")} className="rounded-2xl bg-[#a7b86a]/10 p-3 text-left">
                    <div className="text-[10px] text-[#a7b86a]">Financeiro</div><b className="mt-1 block text-sm text-[#d9e5a5]">Abrir</b>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
                <div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Resumo rápido</div>
                <div className="mt-4 space-y-3">
                  <button onClick={()=>setSection("pedidos")} className="flex w-full items-center justify-between text-left"><span className="text-sm font-bold">Pedidos em andamento</span><span className="font-black text-[#ef7d18]">{activeOrders}</span></button>
                  <button onClick={()=>setSection("b2b")} className="flex w-full items-center justify-between text-left"><span className="text-sm font-bold">Leads B2B</span><span className="font-black text-[#a7b86a]">{leads.length}</span></button>
                  <button onClick={()=>setSection("whatsapp")} className="flex w-full items-center justify-between text-left"><span className="text-sm font-bold">Mensagens WhatsApp</span><span className="font-black">{messages.length}</span></button>
                </div>
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Ações rápidas</div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {id:"pedidos" as Section,label:"Novo pedido",Icon:ShoppingBag},
                  {id:"estoque" as Section,label:"Entrada de estoque",Icon:Package},
                  {id:"financeiro" as Section,label:"Registrar despesa",Icon:Wallet},
                  {id:"estoque" as Section,label:"Lista de compras",Icon:Package},
                ].map(({id,label,Icon})=><button key={label} onClick={()=>setSection(id)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d110b] p-4 text-left transition hover:border-white/20">
                  <Icon size={18} className="text-[#a7b86a]"/><span className="text-xs font-black sm:text-sm">{label}</span>
                </button>)}
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Operação</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  {id:"pedidos" as Section,label:"Pedidos",Icon:ShoppingBag},
                  {id:"producao" as Section,label:"Produção",Icon:Factory},
                  {id:"estoque" as Section,label:"Estoque",Icon:Package},
                  {id:"financeiro" as Section,label:"Financeiro",Icon:Wallet},
                  {id:"entregas" as Section,label:"Entregas",Icon:Truck},
                  {id:"b2b" as Section,label:"B2B",Icon:Building2},
                ].map(({id,label,Icon})=><button key={label} onClick={()=>setSection(id)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d110b] p-4 text-left transition hover:border-white/20">
                  <span className="flex items-center gap-2 text-xs font-black"><Icon size={16} className="text-[#a7b86a]"/>{label}</span><ChevronRight size={14} className="text-white/20"/>
                </button>)}
              </div>
            </section>
          </>}

          {section==="pedidos"&&(
            <Panel title="Pedidos">
              <div className="grid gap-3 lg:hidden">
                {orders.map(o=>(
                  <button key={o.id} onClick={()=>setSelectedOrder(o)} className="w-full rounded-2xl border border-white/10 bg-white/[.025] p-4 text-left">
                    <div className="flex items-start justify-between gap-3"><div><div className="font-black">{o.customer_name||"Cliente"}</div><div className="mt-1 text-xs text-white/40">{new Date(o.created_at).toLocaleString("pt-BR")}</div></div><span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black">{o.status}</span></div>
                    <div className="mt-4 flex items-end justify-between"><div className="text-xs text-white/45">{o.item_count} {o.item_count===1?"item":"itens"}</div><div className="text-lg font-black text-[#ef7d18]">{money(o.total)}</div></div>
                    <div className="mt-3 text-xs font-bold text-[#a7b86a]">Abrir pedido →</div>
                  </button>
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead><tr className="text-xs text-white/35"><th className="p-3">Data</th><th className="p-3">Cliente</th><th className="p-3">Itens</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"/></tr></thead>
                  <tbody>{orders.map(o=><tr key={o.id} className="border-t border-white/5"><td className="p-3">{new Date(o.created_at).toLocaleString("pt-BR")}</td><td className="p-3 font-black">{o.customer_name||"—"}<div className="text-xs text-white/35">{o.whatsapp||""}</div></td><td className="p-3">{o.item_count}</td><td className="p-3 font-black text-[#ef7d18]">{money(o.total)}</td><td className="p-3"><span className="rounded-full bg-white/5 px-3 py-1 text-xs">{o.status}</span></td><td className="p-3 text-right"><button onClick={()=>{setSelectedOrder(o);setOrderRequirements([]);setOrderProductions([]);if(["confirmado","pago_recebido","em_preparo","saiu_entrega","entregue"].includes(o.status)){void loadOrderRequirements(o.id);void loadOrderProduction(o.id)}}} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black">Abrir</button></td></tr>)}</tbody>
                </table>
              </div>
            </Panel>
          )}
          {selectedOrder&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#10130d] p-5 shadow-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.15em] text-[#a7b86a]">Pedido</div><h3 className="mt-1 text-2xl font-black">{selectedOrder.customer_name||"Cliente"}</h3><div className="mt-1 text-xs text-white/40">{new Date(selectedOrder.created_at).toLocaleString("pt-BR")}</div></div><button onClick={()=>setSelectedOrder(null)} className="rounded-full bg-white/5 p-2 text-white/60"><X size={18}/></button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[.03] p-4"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Contato</div><div className="mt-2 font-bold">{selectedOrder.whatsapp||"—"}</div><div className="mt-1 text-xs text-white/45">{selectedOrder.email||"Sem e-mail"}</div></div>
                <div className="rounded-2xl bg-white/[.03] p-4"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Entrega</div><div className="mt-2 font-bold">{selectedOrder.neighborhood||"Bairro não informado"}</div><div className="mt-1 text-xs text-white/45">{selectedOrder.cep||"CEP não informado"}</div></div>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 p-4"><div className="text-xs font-black uppercase tracking-[.12em] text-white/35">Itens</div><pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-white/75">{typeof selectedOrder.items==="string"?selectedOrder.items:JSON.stringify(selectedOrder.items,null,2)}</pre></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-white/[.03] p-3"><div className="text-white/35">Subtotal</div><b className="mt-1 block">{money(selectedOrder.subtotal)}</b></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-white/35">Entrega</div><b className="mt-1 block">{money(selectedOrder.delivery_fee)}</b></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-white/35">Total</div><b className="mt-1 block text-[#ef7d18]">{money(selectedOrder.total)}</b></div></div>
              <div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/35">Insumos necessários</div>{orderRequirements.length===0?<div className="rounded-xl border border-white/5 bg-white/[.02] p-4 text-sm text-white/45">{["confirmado","pago_recebido","em_preparo","saiu_entrega"].includes(selectedOrder.status)?"Nenhuma ficha técnica correspondente encontrada para os itens deste pedido.":"Confirme o pedido para calcular automaticamente os insumos necessários."}</div>:<div className="overflow-x-auto rounded-xl border border-white/5"><table className="w-full text-left text-sm"><thead><tr className="text-xs text-white/35"><th className="p-3">Insumo</th><th className="p-3">Necessário</th><th className="p-3">Estoque</th><th className="p-3">Situação</th></tr></thead><tbody>{orderRequirements.map(x=>{const shortage=x.required_quantity>x.current_quantity;return <tr key={x.id} className="border-t border-white/5"><td className="p-3 font-bold">{x.item_name}</td><td className="p-3">{x.required_quantity.toLocaleString("pt-BR",{maximumFractionDigits:3})} {x.unit}</td><td className="p-3">{x.current_quantity.toLocaleString("pt-BR",{maximumFractionDigits:3})} {x.unit}</td><td className={"p-3 font-black "+(shortage?"text-[#ef7d18]":"text-[#a7b86a]")}>{shortage?"Falta "+(x.required_quantity-x.current_quantity).toLocaleString("pt-BR",{maximumFractionDigits:3})+" "+x.unit:"OK"}</td></tr>})}</tbody></table></div>}</div>
<div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/35">Produção</div>{orderProductions.length===0?<><button onClick={()=>void createProductionFromOrder(selectedOrder)} disabled={busy||!["confirmado","pago_recebido","em_preparo"].includes(selectedOrder.status)} className="w-full rounded-xl bg-[#ef7d18] px-4 py-3 text-left text-sm font-black text-black disabled:opacity-40">Gerar produção deste pedido</button><div className="mt-1 text-xs text-white/35">Cria as produções pelas fichas técnicas. O estoque não é baixado agora.</div></>:<div className="space-y-2">{orderProductions.map(p=><div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.02] p-3"><div><b className="text-sm">{p.recipe_name||"Produção"}</b><div className="text-xs text-white/40">{p.quantity} unidade(s) · {p.stock_consumed?"estoque baixado":"estoque pendente"}</div></div><span className="rounded-full bg-[#a7b86a]/15 px-3 py-1 text-xs font-black text-[#d9e5a5]">{p.status==="planejada"?"Planejada":p.status==="em_producao"?"Em produção":p.status==="concluida"?"Concluída":p.status}</span></div>)}</div>}</div><div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/35">Atualizar status</div><div className="grid gap-2 sm:grid-cols-2">{[{v:"enviado_whatsapp",l:"Novo / enviado no WhatsApp"},{v:"confirmado",l:"Confirmado"},{v:"pago_recebido",l:"Pagamento recebido"},{v:"em_preparo",l:"Em preparo"},{v:"saiu_entrega",l:"Saiu para entrega"},{v:"entregue",l:"Entregue"},{v:"cancelado",l:"Cancelado"}].map(s=><button key={s.v} onClick={()=>void updateOrderStatus(selectedOrder,s.v)} disabled={busy||selectedOrder.status===s.v} className={"rounded-xl border px-3 py-3 text-left text-xs font-black "+(selectedOrder.status===s.v?"border-[#a7b86a]/40 bg-[#a7b86a]/15 text-[#d9e5a5]":"border-white/10 bg-white/[.02]")}>{s.l}</button>)}</div></div>
              <button onClick={()=>setSelectedOrder(null)} className="mt-5 w-full rounded-full border border-white/10 px-4 py-3 text-sm font-black">Fechar</button>
            </div>
          </div>}
          {section==="clientes"&&(
            <Panel title="Clientes">
              <div className="mb-4 flex justify-end">
                <Search size={16} className="mr-2 mt-3 text-white/35"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..." className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"/>
              </div>
              <div className="grid gap-3 lg:hidden">
                {filteredCustomers.map(c=>(
                  <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                    <div className="font-black">{c.name}</div>
                    <div className="mt-1 text-xs text-white/40">{c.whatsapp}</div>
                    <div className="mt-4 flex justify-between text-xs"><span>{c.order_count} pedidos</span><strong className="text-[#ef7d18]">{money(c.total_spend)}</strong></div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="text-xs text-white/35"><th className="p-3">Cliente</th><th className="p-3">WhatsApp</th><th className="p-3">E-mail</th><th className="p-3">Pedidos</th><th className="p-3">Total</th></tr></thead>
                  <tbody>
                    {filteredCustomers.map(c=>(
                      <tr key={c.id} className="border-t border-white/5">
                        <td className="p-3 font-black">{c.name}</td><td className="p-3">{c.whatsapp}</td><td className="p-3">{c.email||"—"}</td><td className="p-3">{c.order_count}</td><td className="p-3 font-black text-[#ef7d18]">{money(c.total_spend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {section==="whatsapp"&&(
            <Panel title="WhatsApp">
              <div className="grid gap-3 lg:hidden">
                {messages.map(m=>(
                  <div key={m.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                    <div className="flex justify-between gap-3"><div className="font-black">{m.display_name||"Contato"}</div><span className="text-[10px] text-white/35">{new Date(m.created_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span></div>
                    <div className="mt-1 text-xs text-white/35">{m.from_phone||""}</div>
                    <div className="mt-3 text-sm leading-6 text-white/75">{m.message_text||(`Mensagem ${m.message_type||"não textual"}`)}</div>
                    <div className="mt-3 flex items-center justify-between gap-3"><div className="text-[10px] font-black uppercase tracking-[.12em] text-[#a7b86a]">{m.processed?"Processada":"Pendente"}</div>{m.from_phone&&<a href={"https://wa.me/"+m.from_phone.replace(/\D/g,"")} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="rounded-full bg-[#25D366] px-3 py-1.5 text-[10px] font-black text-black">Abrir WhatsApp</a>}</div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="text-xs text-white/35"><th className="p-3">Data</th><th className="p-3">Contato</th><th className="p-3">Mensagem</th><th className="p-3">Status</th></tr></thead>
                  <tbody>
                    {messages.map(m=>(
                      <tr key={m.id} className="border-t border-white/5">
                        <td className="p-3">{new Date(m.created_at).toLocaleString("pt-BR")}</td>
                        <td className="p-3 font-black">{m.display_name||"Contato"}<div className="text-xs text-white/35">{m.from_phone||""}</div></td>
                        <td className="p-3">{m.message_text||(`Mensagem ${m.message_type||"não textual"}`)}</td>
                        <td className="p-3"><div className="flex items-center gap-2"><span>{m.processed?"Processada":"Pendente"}</span>{m.from_phone&&<a href={"https://wa.me/"+m.from_phone.replace(/\D/g,"")} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-2.5 py-1 text-[10px] font-black text-black">WhatsApp</a>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {section==="b2b"&&(
            <Panel title="Leads B2B">
              <div className="mb-4 flex justify-end">
                <Search size={16} className="mr-2 mt-3 text-white/35"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empresa..." className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"/>
              </div>
              <div className="grid gap-3 lg:hidden">
                {filteredLeads.map(l=>(
                  <button key={l.id} onClick={()=>setSelected(l)} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 text-left">
                    <div className="flex items-start justify-between gap-3"><div><div className="font-black">{l.company}</div><div className="mt-1 text-xs text-white/40">{l.contact_name} · {l.whatsapp}</div></div><ChevronRight size={17} className="mt-1 text-white/25"/></div>
                    <div className="mt-4 flex items-center justify-between text-xs"><span>{l.estimated_meals||"Refeições não informadas"}</span><span className="rounded-full bg-white/5 px-2.5 py-1 font-bold">{l.status}</span></div>
                  </button>
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead><tr className="text-xs text-white/35"><th className="p-3">Empresa</th><th className="p-3">Contato</th><th className="p-3">Refeições</th><th className="p-3">Status</th><th/></tr></thead>
                  <tbody>
                    {filteredLeads.map(l=>(
                      <tr key={l.id} className="border-t border-white/5">
                        <td className="p-3 font-black">{l.company}</td>
                        <td className="p-3">{l.contact_name}<div className="text-xs text-white/35">{l.whatsapp}</div></td>
                        <td className="p-3">{l.estimated_meals||"—"}</td>
                        <td className="p-3">{l.status}</td>
                        <td className="p-3 text-right"><button onClick={()=>setSelected(l)} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black">Abrir</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </section>
      </div>

      {selected&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 md:items-center"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#10130d] p-6"><div className="flex justify-between"><div><div className="text-xs text-[#a7b86a]">LEAD B2B</div><h2 className="text-2xl font-black">{selected.company}</h2><p className="text-sm text-white/45">{selected.contact_name} · {selected.whatsapp}</p></div><button onClick={()=>setSelected(null)}><X/></button></div><div className="mt-6 grid gap-4"><div className="rounded-xl bg-white/[.035] p-4 text-sm">{selected.email}<br/>{selected.estimated_meals||"Refeições não informadas"} · {selected.frequency||"Frequência não informada"}</div><label className="grid gap-2 text-sm font-bold">Status<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal">{statuses.map(s=><option key={s}>{s}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Próximo contato<input type="date" value={selected.next_follow_up_at?.slice(0,10)||""} onChange={e=>setSelected({...selected,next_follow_up_at:e.target.value?`${e.target.value}T12:00:00.000Z`:null})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-2 text-sm font-bold">Valor da proposta<input type="number" step="0.01" value={selected.proposal_value??""} onChange={e=>setSelected({...selected,proposal_value:e.target.value?Number(e.target.value):null})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-2 text-sm font-bold">Observações internas<textarea rows={4} value={selected.owner_notes||""} onChange={e=>setSelected({...selected,owner_notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><div className="flex gap-2"><a href={`https://wa.me/${selected.whatsapp.split("").filter(ch=>ch>="0"&&ch<="9").join("")}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#a7b86a]/30 px-4 py-3 text-sm font-black text-[#d9e5a5]"><MessageCircle size={16} className="mr-2 inline"/>WhatsApp</a><button onClick={()=>void saveLead()} disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">{busy?"Salvando...":"Salvar"}</button></div></div></div></div>}
      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/10 bg-[#10130d]/95 p-2 shadow-2xl backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button onClick={()=>setSection("resumo")} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${section==="resumo"?"bg-[#a7b86a] text-black":"text-white/55"}`}><Home size={17}/><span>Início</span></button>
          <button onClick={()=>setSection("pedidos")} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${section==="pedidos"?"bg-[#a7b86a] text-black":"text-white/55"}`}><ShoppingBag size={17}/><span>Pedidos</span></button>
          <button onClick={()=>setSection("whatsapp")} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${section==="whatsapp"?"bg-[#a7b86a] text-black":"text-white/55"}`}><MessageCircle size={17}/><span>WhatsApp</span></button>
          <button onClick={()=>setMobileMore(v=>!v)} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${mobileMore||!["resumo","pedidos","whatsapp"].includes(section)?"bg-[#a7b86a] text-black":"text-white/55"}`}><MoreHorizontal size={17}/><span>Mais</span></button>
        </div>
      </nav>
      {mobileMore&&<div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={()=>setMobileMore(false)}>
        <div className="absolute inset-x-3 bottom-24 rounded-3xl border border-white/10 bg-[#10130d] p-4 shadow-2xl" onClick={e=>e.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[.15em] text-[#a7b86a]">Mais opções</div><div className="mt-1 text-xs text-white/35">Gestão operacional</div></div><button onClick={()=>setMobileMore(false)} className="rounded-full bg-white/5 p-2"><X size={16}/></button></div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>{window.location.href="/admin/painel"}} className="col-span-2 flex items-center gap-3 rounded-2xl border border-[#ef7d18]/40 bg-[#1b120a] p-3 text-left shadow-[0_0_28px_rgba(239,125,24,.10)]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ef7d18]/15"><BarChart3 size={19} className="text-[#ef7d18]"/></span><span><span className="block text-sm font-black text-[#f4aa67]">PAINEL DO DONO</span><span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.12em] text-white/35">Vendas, gráficos, clientes e alertas</span></span><ChevronRight size={16} className="ml-auto text-[#ef7d18]"/></button><button onClick={()=>{window.location.href="/admin/nf-core"}} className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3 text-left"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5"><Bot size={19} className="text-[#a7b86a]"/></span><span><span className="block text-sm font-black">NF CORE</span><span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.12em] text-white/35">Central inteligente da Nutrifit</span></span><ChevronRight size={16} className="ml-auto text-white/30"/></button>
            {[{id:"b2b" as Section,label:"B2B",Icon:Building2},{id:"estoque" as Section,label:"Estoque",Icon:Package},{id:"produtos" as Section,label:"Produtos",Icon:ShoppingBag},{id:"financeiro" as Section,label:"Financeiro",Icon:Wallet},{id:"entregas" as Section,label:"Entregas",Icon:Truck},{id:"producao" as Section,label:"Produção",Icon:Factory},{id:"cupons" as Section,label:"Cupons",Icon:Ticket}].map(({id,label,Icon})=><button key={id} onClick={()=>{setSection(id);setMobileMore(false)}} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3 text-left text-xs font-black"><Icon size={17} className="text-[#a7b86a]"/>{label}</button>)}
          </div>
        </div>
      </div>}
    </main>
  );
}

function Panel({title,children}:{title:string;children:ReactNode}) {
  return <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><h2 className="mb-5 text-2xl font-black">{title}</h2>{children}</div>;
}
