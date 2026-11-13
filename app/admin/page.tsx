"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./admin-dashboard.css";
import Operations from "./operations";
import DashboardOverview from "./dashboard-overview";
import {
  ArrowLeft, BarChart3, Building2, LogOut, MessageCircle, RefreshCw, Search,
  ShoppingBag, Users, X, Package, Home, MoreHorizontal, ChevronRight, Wallet, Truck, Factory, Ticket, Bot, Settings
} from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const FALLBACK_VAPID_PUBLIC_KEY = "BB0vbJzwFpvhg9vRY65tqKh220prqXjozkHCwBXAxesWCJntEJlxmX4QW-m6OAP4bnNcVIbrpJ62v-MawD9rBuc";

type DeliveryRecord = { id:string; order_id:string|null; customer_name:string|null; delivery_date:string|null; status:string; meal_quantity:number; notes:string|null; created_at:string; };
type Order = { order_code:string; id:string; customer_profile_id:string|null; created_at:string; customer_name:string|null; whatsapp:string|null; email:string|null; items:unknown; item_count:number; subtotal:number; delivery_fee:number; total:number; cep:string|null; neighborhood:string|null; status:string; };
type Customer = { id:string; created_at:string; name:string; whatsapp:string; email:string|null; marketing_consent:boolean; order_count:number; total_spend:number; };
type Lead = { id:string; created_at:string; company:string; contact_name:string; whatsapp:string; email:string; estimated_meals:string|null; frequency:string|null; status:string; next_follow_up_at:string|null; proposal_value:number|null; owner_notes:string|null; notes:string|null; };
type ContactEvent = { id:string; lead_id:string; recipient_email:string; subject:string|null; event_type:string; event_at:string; evidence_note:string|null; };
type Message = { id:string; created_at:string; from_phone:string|null; display_name:string|null; message_text:string|null; message_type:string|null; processed:boolean; };
type Section = "resumo"|"pedidos"|"clientes"|"whatsapp"|"b2b"|"estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons"|"embalagens"|"configuracoes";
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

function orderStatusStyle(status:string) {
  const labelByStatus:Record<string,string> = {
    enviado_whatsapp:"Pedido recebido",
    confirmado:"Pedido confirmado",
    pago_recebido:"Pagamento recebido",
    em_preparo:"Em produção",
    saiu_entrega:"Saiu para entrega",
    entregue:"Pedido finalizado",
    cancelado:"Cancelado",
  };
  if(status === "cancelado") {
    return { card:"border-red-500/50 bg-red-500/[.06]", badge:"bg-red-500/15 text-red-300", label:labelByStatus[status] };
  }
  if(status === "entregue") {
    return { card:"border-[#ef7d18]/65 bg-[#ef7d18]/[.08]", badge:"bg-[#ef7d18]/20 text-[#ffb36b]", label:labelByStatus[status] };
  }
  return {
    card:"border-[#6eaa67]/65 bg-[#6eaa67]/[.08]",
    badge:"bg-[#6eaa67]/20 text-[#b9e6b1]",
    label:labelByStatus[status] || status.replaceAll("_"," "),
  };
}

type OrderItemView = { name:string; line:string; price:number|null; weight:string; quantity:number; };
function parseOrderItems(value:unknown):OrderItemView[] {
  let data:any=value;
  if(typeof data==="string") {
    try { data=JSON.parse(data); } catch { return []; }
  }
  if(data && !Array.isArray(data) && typeof data==="object" && Array.isArray(data.items)) data=data.items;
  if(!Array.isArray(data)) data=data && typeof data==="object" ? [data] : [];
  const parsed:OrderItemView[]=[];
  const add=(item:any)=>{
    if(!item || typeof item!=="object") return;
    if(Array.isArray(item.items)){
      item.items.forEach((child:any)=>add(child));
      return;
    }
    const name=String(item.name||item.product_name||item.title||item.description||"Item do pedido");
    const line=String(item.line||item.category||"");
    const weight=String(item.weight||item.size||item.description_weight||"");
    const price=Number.isFinite(Number(item.price)) && item.price!==null && item.price!=="" ? Number(item.price) : null;
    const quantity=Math.max(1,Number(item.quantity)||1);
    const key=[name.trim().toLocaleLowerCase(),line.trim().toLocaleLowerCase(),weight.trim().toLocaleLowerCase()].join("|");
    const existing=parsed.find(x=>[x.name.trim().toLocaleLowerCase(),x.line.trim().toLocaleLowerCase(),x.weight.trim().toLocaleLowerCase()].join("|")===key);
    if(existing){
      existing.quantity+=quantity;
      if(existing.price!==price) existing.price=null;
    }else parsed.push({name,line,weight,price,quantity});
  };
  data.forEach(add);
  return parsed;
}
const statuses = ["Novo lead","Contato realizado","Entendendo necessidade","Proposta enviada","Negociação","Cliente ativo","Sem retorno","Perdido","Reativar depois"];

export default function AdminPage() {
  const [token,setToken] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [section,setSection] = useState<Section>("resumo");
  const [sectionHistory,setSectionHistory] = useState<Section[]>([]);
  const navigateSection = (next:Section) => { if(next===section) return; setSectionHistory(history=>[...history,section]); setSection(next); };
  const goBackSection = () => { setSectionHistory(history=>{ const previous=history[history.length-1] || "resumo"; setSection(previous); return history.slice(0,-1); }); };
  const [orders,setOrders] = useState<Order[]>([]);
  const [deliveryRecords,setDeliveryRecords] = useState<DeliveryRecord[]>([]);
  const [deliveryQuantity,setDeliveryQuantity] = useState("1");
  const [deliveryDate,setDeliveryDate] = useState("");
  const [deliveryNote,setDeliveryNote] = useState("");
  const [showCancelledOrders,setShowCancelledOrders] = useState(false);
  const [orderStatusFilter,setOrderStatusFilter] = useState("all");
  const [orderListView,setOrderListView] = useState<"active"|"history">("active");
  const [customers,setCustomers] = useState<Customer[]>([]);
  const [messages,setMessages] = useState<Message[]>([]);
  const [leads,setLeads] = useState<Lead[]>([]);
   const [contactEvents,setContactEvents] = useState<ContactEvent[]>([]);
  const [selected,setSelected] = useState<Lead|null>(null);
  const [showNewLead,setShowNewLead] = useState(false);
  const [leadForm,setLeadForm] = useState({company:"",contact_name:"",whatsapp:"",email:"",notes:"",next_follow_up_at:""});
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
      const [o,c,m,l,i,a,events,deliveries] = await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/customer_profiles?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/whatsapp_messages?select=id,created_at,from_phone,display_name,message_text,message_type,processed&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/b2b_leads?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_items?select=*&order=name.asc&limit=500`,t),
        request(`${URL}/rest/v1/inventory_purchase_alerts?select=*&limit=500`,t),
        request(`${URL}/rest/v1/b2b_contact_events?select=id,lead_id,recipient_email,subject,event_type,event_at,evidence_note&order=event_at.desc&limit=500`,t),
        request(`${URL}/rest/v1/delivery_orders?select=id,order_id,customer_name,delivery_date,status,meal_quantity,notes,created_at&order=delivery_date.desc&limit=1000`,t),
      ]);
      setOrders(o||[]); setDeliveryRecords(deliveries||[]); setCustomers((c||[]).map((profile:Customer)=>{ const linked=(o||[]).filter((order:Order)=>order.customer_profile_id===profile.id && order.status!=="cancelado"); return {...profile,order_count:linked.length,total_spend:linked.reduce((sum:number,order:Order)=>sum+Number(order.total||0),0)}; })); setMessages(m||[]); setLeads(l||[]); setInventory(i||[]); setPurchaseAlerts(a||[]); setContactEvents(events||[]);
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
      const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
      const isStandalone=window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & {standalone?:boolean}).standalone===true;
      if(requestPermission && isIOS && !isStandalone){
        setPushStatus("idle");
        setError("No iPhone, as notificações web só funcionam quando o Nutrifit está instalado na Tela de Início. Abra o site no Safari, toque em Compartilhar e escolha Adicionar à Tela de Início. Depois abra o ícone instalado e ative os alertas.");
        return;
      }
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
    }catch(e){
      console.error(e);
      let detail=e instanceof Error?e.message:"";
      try{const parsed=JSON.parse(detail);detail=parsed.message||parsed.details||detail;}catch{}
      setError(detail||"Não foi possível gerar a produção deste pedido.");
    }
    finally{setBusy(false);}
  }

  async function registerPartialDelivery(order:Order) {
    const quantity=Math.floor(Number(deliveryQuantity));
    const delivered=deliveryRecords.filter(d=>d.order_id===order.id&&d.status==="entregue").reduce((sum,d)=>sum+Number(d.meal_quantity||0),0);
    const remaining=Math.max(0,Number(order.item_count||0)-delivered);
    if(!Number.isInteger(quantity)||quantity<1||quantity>remaining){setError(`Informe uma quantidade entre 1 e ${remaining}.`);return;}
    if(!deliveryDate){setError("Informe a data da entrega.");return;}
    setBusy(true);setError("");
    try{
      await request(`${URL}/rest/v1/delivery_orders`,token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({order_id:order.id,customer_name:order.customer_name,city:"Juiz de Fora",delivery_date:deliveryDate,status:"entregue",meal_quantity:quantity,notes:deliveryNote.trim()||null})});
      setDeliveryQuantity("1");setDeliveryNote("");
      await load(token,true);
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível registrar a entrega.");}
    finally{setBusy(false);}
  }

  async function updateOrderStatus(order:Order,status:string){
    if(!token||busy)return;
    if(order.status===status){setError("Este pedido já está nesse status.");return;}
    if(status==="entregue"){
      // Revalida no banco para não depender de um histórico de entregas desatualizado no celular.
      const latestDeliveries=await request(
        URL+"/rest/v1/delivery_orders?select=id,meal_quantity,status&order_id=eq."+order.id+"&status=eq.entregue",
        token
      ).catch(()=>null);
      if(!Array.isArray(latestDeliveries)){
        setError("Não foi possível conferir as entregas deste pedido. Atualize a lista e tente novamente.");
        return;
      }
      const delivered=latestDeliveries.reduce((sum:number,d:any)=>sum+Number(d.meal_quantity||0),0);
      const remaining=Math.max(0,Number(order.item_count||0)-delivered);
      if(remaining>0){
        setError(`Ainda faltam ${remaining} marmita(s) para registrar a entrega. Registre as entregas parciais antes de finalizar.`);
        return;
      }
    }
    if(status==="cancelado" && !window.confirm("Confirma o cancelamento deste pedido? O registro será mantido no histórico e sairá da lista principal."))return;
    setBusy(true);setError("");
    try{
      const updated=await request(URL+"/rest/v1/customer_orders?id=eq."+order.id,token,{
        method:"PATCH",
        headers:{Prefer:"return=representation"},
        body:JSON.stringify({status})
      });
      if(!Array.isArray(updated)||updated.length!==1){
        throw new Error("O banco não confirmou a atualização do pedido. Verifique sua permissão administrativa e tente novamente.");
      }
      setOrders(prev=>prev.map(x=>x.id===order.id?{...x,status}:x));
      if(["confirmado","pago_recebido","em_preparo","saiu_entrega"].includes(status)){
        await Promise.all([loadOrderRequirements(order.id),loadOrderProduction(order.id)]);
      }
      if(status==="cancelado")setOrderRequirements([]);
      if(status==="pago_recebido"&&order.whatsapp){
        try{
          const profiles=await request(URL+"/rest/v1/customer_profiles?select=email,name&whatsapp=eq."+encodeURIComponent(order.whatsapp)+"&limit=1",token);
          const profile=Array.isArray(profiles)?profiles[0]:null;
          if(profile?.email){
            await fetch("/api/club-automation",{
              method:"POST",
              headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
              body:JSON.stringify({
                event:"order.purchased",
                email:profile.email,
                firstName:String(profile.name||order.customer_name||"").trim().split(/\s+/)[0]||"",
                orderId:order.id
              })
            });
          }
        }catch(error){console.error("purchase automation trigger",error);}
      }
      await load(token,true);
      if(status==="entregue")setSelectedOrder(null);
      else setSelectedOrder(prev=>prev?.id===order.id?{...prev,status}:prev);
      setError(status==="entregue"?"Pedido finalizado e atualizado com sucesso.":"Status do pedido atualizado com sucesso.");
    }catch(e){
      console.error("updateOrderStatus",e);
      setError(e instanceof Error?e.message:"Não foi possível atualizar o status do pedido.");
    }finally{setBusy(false);}
  }

  async function saveLead(){
    if(!selected)return;
    setBusy(true);
    try{
      await request(`${URL}/rest/v1/b2b_leads?id=eq.${selected.id}`,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({
        status:selected.status,next_follow_up_at:selected.next_follow_up_at||null,proposal_value:selected.proposal_value||null,owner_notes:selected.owner_notes||null
      })});
      await load();setSelected(null);
    }catch{setError("Não foi possível salvar o lead.");}
    finally{setBusy(false);}
  }

  async function createLead(e:FormEvent){
    e.preventDefault();
    if(!leadForm.company.trim()){setError("Informe o nome da empresa.");return;}
    setBusy(true);setError("");
    try{
      await request(`${URL}/rest/v1/b2b_leads`,token,{
        method:"POST",
        headers:{Prefer:"return=minimal"},
        body:JSON.stringify({
          company:leadForm.company.trim(),
          contact_name:leadForm.contact_name.trim()||"Responsável a identificar",
          whatsapp:leadForm.whatsapp.trim(),
          email:leadForm.email.trim(),
          notes:leadForm.notes.trim()||null,
          status:"Novo lead",
          next_follow_up_at:leadForm.next_follow_up_at?new Date(leadForm.next_follow_up_at+"T12:00:00").toISOString():null
        })
      });
      setLeadForm({company:"",contact_name:"",whatsapp:"",email:"",notes:"",next_follow_up_at:""});
      setShowNewLead(false);
      await load();
    }catch(e){console.error(e);setError("Não foi possível cadastrar o lead. Confira os campos e tente novamente.");}
    finally{setBusy(false);}
  }

  const q=search.toLowerCase().trim();
  const filteredCustomers=customers.filter(x=>!q||[x.name,x.whatsapp,x.email||""].join(" ").toLowerCase().includes(q));
  const filteredLeads=leads.filter(x=>!q||[x.company,x.contact_name,x.whatsapp,x.email].join(" ").toLowerCase().includes(q));
  const activeOrderStatuses=["enviado_whatsapp","novo","confirmado","pago_recebido","em_preparo","em_producao","saiu_entrega","em_entrega"];
  const historyOrderStatuses=["entregue","concluido","concluida","cancelado"];
  const visibleOrders=orders.filter(x=>(orderListView==="active"?activeOrderStatuses.includes(x.status):historyOrderStatuses.includes(x.status))&&(showCancelledOrders||x.status!=="cancelado")&&(orderStatusFilter==="all"||(orderStatusFilter==="new"&&["enviado_whatsapp","novo","confirmado","pago_recebido"].includes(x.status))||(orderStatusFilter==="prep"&&["em_preparo","em_producao"].includes(x.status))||(orderStatusFilter==="delivery"&&["saiu_entrega","em_entrega"].includes(x.status))||(orderStatusFilter==="done"&&["entregue","concluido","concluida"].includes(x.status))));
  const cancelledOrdersCount=orders.filter(x=>x.status==="cancelado").length;
  const revenue=orders.reduce((s,x)=>s+Number(x.total||0),0);
  const activeOrders=orders.filter(x=>!["entregue","cancelado"].includes(x.status)).length;
  const todayKey=new Date().toLocaleDateString("pt-BR");
  const todayOrders=orders.filter(x=>new Date(x.created_at).toLocaleDateString("pt-BR")===todayKey);
  const todayRevenue=todayOrders.filter(x=>!["cancelado","cancelada","canceled","cancelled"].includes((x.status||"").trim().toLowerCase())).reduce((s,x)=>s+Number(x.total||0),0);
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
    {id:"resumo" as Section,label:"Dashboard",Icon:Home},
    {id:"pedidos" as Section,label:"Pedidos",Icon:ShoppingBag},
    {id:"producao" as Section,label:"Produção",Icon:Factory},
    {id:"estoque" as Section,label:"Estoque",Icon:Package},
    {id:"entregas" as Section,label:"Entregas",Icon:Truck},
    {id:"clientes" as Section,label:"Clientes",Icon:Users},
    {id:"financeiro" as Section,label:"Financeiro",Icon:Wallet},
    {id:"embalagens" as Section,label:"Embalagens",Icon:Package},
    {id:"whatsapp" as Section,label:"WhatsApp",Icon:MessageCircle},
    {id:"configuracoes" as Section,label:"Configurações",Icon:Settings},
  ];

  return (
    <main className="nf-admin-root min-h-screen bg-[#080a07] text-white">
      <header className="relative z-30 border-b border-white/10 bg-[#090c08]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><img src="/images/nutrifit-logo-icon.svg" alt="" className="h-9 w-9"/><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div><div className="font-black">Dashboard Nutrifit <span className="text-[#ef7d18]">V7</span></div></div></div>
          <div className="flex items-center gap-2">
            {sectionHistory.length>0&&<button title="Voltar à aba anterior" aria-label="Voltar à aba anterior" onClick={goBackSection} className="rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-2.5 text-xs font-black text-[#d9e5a5] sm:px-4"><ArrowLeft size={14} className="inline"/><span className="ml-2 hidden sm:inline">Voltar</span></button>}
            <button title={pushStatus==="enabled"?"Alertas ativos":"Ativar alertas"} aria-label={pushStatus==="enabled"?"Alertas ativos":"Ativar alertas"} onClick={()=>void enablePush()} disabled={pushStatus==="loading"||pushStatus==="enabled"} className={`rounded-full border px-3 py-2.5 text-xs font-black sm:px-4 ${pushStatus==="enabled"?"border-[#a7b86a]/40 bg-[#a7b86a]/10 text-[#c4d38c]":"border-[#ef7d18]/30 bg-[#1b120a] text-[#f1b06e]"}`}><span className="sm:hidden">🔔</span><span className="hidden sm:inline">{pushStatus==="enabled"?"🔔 Alertas ativos":pushStatus==="loading"?"Ativando...":"🔔 Ativar alertas"}</span></button>
            <button title="Atualizar dados" aria-label="Atualizar dados" onClick={()=>void load()} className="rounded-full border border-white/10 px-3 py-2.5 text-xs font-black sm:px-4"><RefreshCw size={14} className={`inline ${busy?"animate-spin":""}`}/><span className="ml-2 hidden sm:inline">Atualizar</span></button>
            <button title="Sair" aria-label="Sair" onClick={()=>{sessionStorage.removeItem("nutrifit_admin_token");sessionStorage.removeItem("nutrifit_admin_email");setToken("");}} className="rounded-full border border-white/10 px-3 py-2.5 text-xs font-black sm:px-4"><LogOut size={14} className="inline"/><span className="ml-2 hidden sm:inline">Sair</span></button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-none gap-6 px-4 py-6 pb-36 sm:px-6 md:pb-8 md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="nf-outer-sidebar hidden h-fit max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#080a08] p-2 md:sticky md:top-24 md:block" aria-label="Navegação do Dashboard">
          <div className="nf-outer-brand"><img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit"/><span>NUTRI<b>FIT</b></span></div>
          <nav className="nf-outer-nav">{nav.map(({id,label,Icon})=><button key={id} onClick={()=>{if(id==="pedidos")setOrderStatusFilter("all");navigateSection(id);}} aria-current={section===id?"page":undefined} className={"nf-outer-nav-item "+(section===id?"active":"")}><Icon size={18}/><span>{label}</span>{id==="pedidos"&&pendingOrders.length>0?<b className="nf-nav-badge">{pendingOrders.length}</b>:null}</button>)}<a href="/admin/avaliacoes" className="nf-outer-nav-item"><span>⭐</span><span>Avaliações de clientes</span></a></nav>
          <div className="nf-outer-more"><div className="nf-outer-more-label">Mais módulos</div><button type="button" onClick={()=>navigateSection("b2b")} className={"nf-outer-nav-item "+(section==="b2b"?"active":"")}><Building2 size={18}/><span>B2B corporativo</span></button><button type="button" onClick={()=>navigateSection("produtos")} className={"nf-outer-nav-item "+(section==="produtos"?"active":"")}><ShoppingBag size={18}/><span>Cardápio</span></button><button type="button" onClick={()=>navigateSection("cupons")} className={"nf-outer-nav-item "+(section==="cupons"?"active":"")}><Ticket size={18}/><span>Cupons</span></button></div>
          <div className="nf-outer-stock-warning"><Package size={17}/><span><b>{purchaseAlerts.length} alertas de estoque</b><small>Verifique a reposição</small></span></div>
        </aside>
        <section className="min-w-0">
          {section!=="resumo"&&<div className="mb-5 md:hidden">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Painel</div>
                <h1 className="mt-1 text-2xl font-black">{nav.find(n=>n.id===section)?.label || "Resumo"}</h1>
              </div>
              <button onClick={()=>void load()} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"><RefreshCw size={14} className={`inline ${busy?"animate-spin":""}`}/></button>
            </div>
            <a href="/admin/embalagens" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#a7b86a]/30 bg-[#a7b86a]/[.07] px-3 py-2.5 text-xs font-black text-[#d9e5a5]"><Package size={15}/>Embalagens e materiais</a>
          </div>}
          {error&&<div className="mb-5 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]">{error}</div>}

          {["estoque","produtos","financeiro","entregas","producao","cupons","embalagens"].includes(section)&&<Operations key={section} section={section==="embalagens"?"estoque":section as "estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons"} token={token} initialCategory={section==="embalagens"?"embalagem":undefined}/>}

          {section==="resumo"&&<DashboardOverview
            orders={orders}
            customers={customers}
            inventory={inventory}
            purchaseAlerts={purchaseAlerts}
            token={token}
            email={email}
            onNavigate={(next)=>{const parts=next.split(":");const target=parts[0] as Section;if(target==="pedidos")setOrderStatusFilter(parts[1]||"all");navigateSection(target);}}
            onRefresh={()=>{void load();}}
          />}

          {section==="configuracoes"&&<Panel title="Configurações"><div className="grid gap-4"><div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-white/45">Conta administrativa</div><div className="mt-1 break-all text-sm font-bold">{email||"Conta autenticada"}</div></div><div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-sm font-bold">Notificações administrativas</div><p className="mt-1 text-xs text-white/45">{pushStatus==="enabled"?"Notificações ativas neste dispositivo.":pushStatus==="denied"?"Permissão bloqueada pelo navegador.":"Ative alertas de pedidos e estoque neste dispositivo."}</p><button type="button" onClick={()=>void enablePush()} disabled={pushStatus==="enabled"||pushStatus==="loading"||pushStatus==="unsupported"} className="mt-3 min-h-11 rounded-xl bg-[#ef7d18] px-4 text-xs font-black text-black disabled:opacity-50">{pushStatus==="enabled"?"Notificações ativas":pushStatus==="loading"?"Ativando…":"Ativar notificações"}</button></div></div></Panel>}
          {section==="pedidos"&&(
            <Panel title="Pedidos">
              {<div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-1"><button type="button" onClick={()=>{setOrderListView("active");setOrderStatusFilter("all");setShowCancelledOrders(false);}} className={"min-h-11 rounded-xl px-3 text-xs font-black "+(orderListView==="active"?"bg-[#a7b86a] text-black":"text-white/55")}>Ativos <span className="ml-1 opacity-70">{orders.filter(o=>activeOrderStatuses.includes(o.status)).length}</span></button><button type="button" onClick={()=>{setOrderListView("history");setOrderStatusFilter("all");setShowCancelledOrders(true);}} className={"min-h-11 rounded-xl px-3 text-xs font-black "+(orderListView==="history"?"bg-[#a7b86a] text-black":"text-white/55")}>Histórico <span className="ml-1 opacity-70">{orders.filter(o=>historyOrderStatuses.includes(o.status)).length}</span></button></div>}
              {orderStatusFilter!=="all"&&<div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#ef7d18]/25 bg-[#ef7d18]/[.07] px-3 py-2"><span className="text-xs text-[#ffb36b]">Filtro: {({new:"Novos",prep:"Em produção",delivery:"Em entrega",done:"Concluídos"} as Record<string,string>)[orderStatusFilter]||"Pedidos"}</span><button type="button" onClick={()=>setOrderStatusFilter("all")} className="min-h-10 px-3 text-xs font-bold text-white/70">Limpar filtro</button></div>}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-white/45">{showCancelledOrders?"Exibindo todos os pedidos, inclusive cancelados.":"Pedidos cancelados ficam ocultos da lista principal."}</p>
                <button type="button" onClick={()=>setShowCancelledOrders(v=>!v)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-[#a7b86a] hover:bg-white/5">
                  {showCancelledOrders?"Ocultar cancelados":"Mostrar cancelados"} ({cancelledOrdersCount})
                </button>
              </div>
              <div className="grid gap-3 md:hidden">
                {visibleOrders.map(o=>(
                  <button key={o.id} onClick={()=>{setSelectedOrder(o);setOrderRequirements([]);setOrderProductions([]);setDeliveryDate(new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10));setDeliveryQuantity("1");setDeliveryNote("");setError("");if(["confirmado","pago_recebido","em_preparo","saiu_entrega","entregue"].includes(o.status)){void loadOrderRequirements(o.id);void loadOrderProduction(o.id);}}} className={"w-full rounded-2xl border-l-4 border-y border-r p-4 text-left transition " + orderStatusStyle(o.status).card + " " + (o.status==="enviado_whatsapp" ? "border-l-[#ef7d18]" : o.status==="confirmado" ? "border-l-[#d6a43b]" : o.status==="pago_recebido"||o.status==="em_preparo" ? "border-l-[#a7b86a]" : o.status==="saiu_entrega" ? "border-l-[#5b9de0]" : o.status==="cancelado" ? "border-l-red-500" : "border-l-white/20")}>
                    <div className="flex items-start justify-between gap-3"><div><div className="font-black">{o.customer_name||"Cliente"}</div><div className="mt-1 text-xs text-white/40">{new Date(o.created_at).toLocaleString("pt-BR")}</div></div><span className={"rounded-full px-2.5 py-1 text-[10px] font-black " + orderStatusStyle(o.status).badge}>{orderStatusStyle(o.status).label}</span></div>
                    <div className="mt-4 flex items-end justify-between">
                      <div className="text-xs text-white/45">{o.item_count} {o.item_count === 1 ? "item" : "itens"}</div>
                      <div className="text-lg font-black text-[#ef7d18]">{money(Number(o.total || 0))}</div>
                    </div>
                    <div className="mt-3 text-xs font-bold text-[#a7b86a]">Abrir pedido →</div>
                  </button>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead><tr className="text-xs text-white/35"><th className="p-3">Data</th><th className="p-3">Cliente</th><th className="p-3">Itens</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"/></tr></thead>
                  <tbody>{visibleOrders.map(o=><tr key={o.id} className={`border-t border-white/5 transition ${o.status==="cancelado"?"bg-red-500/[.04]":o.status==="em_preparo"?"bg-[#6eaa67]/[.05]":o.status==="saiu_entrega"?"bg-[#5b9de0]/[.05]":o.status==="enviado_whatsapp"?"bg-[#ef7d18]/[.04]":""}`}><td className="p-3">{new Date(o.created_at).toLocaleString("pt-BR")}</td><td className="p-3 font-black">{o.customer_name||"—"}<div className="text-xs text-white/35">{o.whatsapp||""}</div></td><td className="p-3">{o.item_count}</td><td className="p-3 font-black text-[#ef7d18]">{money(o.total)}</td><td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusStyle(o.status).badge}`}>{orderStatusStyle(o.status).label}</span></td><td className="p-3 text-right"><button onClick={()=>{setSelectedOrder(o);setOrderRequirements([]);setOrderProductions([]);if(["confirmado","pago_recebido","em_preparo","saiu_entrega","entregue"].includes(o.status)){void loadOrderRequirements(o.id);void loadOrderProduction(o.id)}}} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black">Abrir</button></td></tr>)}</tbody>
                </table>
              </div>
            </Panel>
          )}
          {selectedOrder&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
            <div className="max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-[2rem] border border-white/10 bg-[#10130d] p-5 shadow-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.15em] text-[#a7b86a]">Pedido</div><h3 className="mt-1 text-2xl font-black">{selectedOrder.customer_name||"Cliente"}</h3><div className="mt-3 inline-flex flex-col rounded-xl border border-[#ef7d18]/35 bg-[#ef7d18]/[.08] px-4 py-2"><span className="text-[9px] font-black uppercase tracking-[.16em] text-[#f4a45d]">Código Nutrifit</span><strong className="mt-0.5 text-xl font-black tracking-[.12em] text-[#ffad62]">{selectedOrder.order_code||"Código não disponível"}</strong></div><div className="mt-2 text-xs text-white/40">{new Date(selectedOrder.created_at).toLocaleString("pt-BR")}</div></div><button onClick={()=>setSelectedOrder(null)} className="rounded-full bg-white/5 p-2 text-white/60"><X size={18}/></button></div>
              {error&&<div className="mt-4 rounded-xl border border-[#ef7d18]/35 bg-[#1b120a] p-3 text-sm leading-5 text-[#f1b06e]" role="alert">{error}</div>}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[.03] p-4"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Contato</div><div className="mt-2 font-bold">{selectedOrder.whatsapp||"—"}</div><div className="mt-1 text-xs text-white/45">{selectedOrder.email||"Sem e-mail"}</div></div>
                <div className="rounded-2xl bg-white/[.03] p-4"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Entrega</div><div className="mt-2 font-bold">{selectedOrder.neighborhood||"Bairro não informado"}</div><div className="mt-1 text-xs text-white/45">{selectedOrder.cep||"CEP não informado"}</div></div>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 p-4"><div className="flex items-center justify-between gap-3"><div className="text-xs font-black uppercase tracking-[.12em] text-white/35">Itens do pedido</div><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-white/60">{parseOrderItems(selectedOrder.items).reduce((sum,item)=>sum+item.quantity,0)||selectedOrder.item_count||0} unidade(s)</span></div>{parseOrderItems(selectedOrder.items).length>0?<div className="mt-3 space-y-2">{parseOrderItems(selectedOrder.items).map((item,index)=>{const subtotal=item.price===null?null:item.price*item.quantity;return <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[.025] p-4"><div className="min-w-0 flex-1"><div className="break-words text-base font-extrabold leading-snug text-white sm:text-lg">{item.name}</div>{item.line&&<div className="mt-1 text-xs text-[#a7b86a]">{item.line}</div>}{item.weight&&<div className="mt-1 break-words text-xs text-white/45">{item.weight}</div>}{subtotal!==null&&<div className="mt-1 text-sm font-bold text-[#ef7d18]">{money(subtotal)}</div>}</div><div className="shrink-0 rounded-xl bg-[#ef7d18]/15 px-3 py-2 text-center"><div className="text-[10px] font-black uppercase tracking-wide text-[#ef7d18]">Qtd.</div><div className="text-xl font-black leading-tight text-[#ef7d18]">{item.quantity}×</div></div></div>})}</div>:<div className="mt-3 rounded-xl border border-white/5 bg-white/[.025] p-3 text-sm leading-6 text-white/60">{typeof selectedOrder.items==="string"&&selectedOrder.items.trim()?selectedOrder.items:"Os itens deste pedido não estão disponíveis em formato reconhecido."}</div>}</div>
              {(()=>{const records=deliveryRecords.filter(d=>d.order_id===selectedOrder.id).sort((a,b)=>(a.delivery_date||"").localeCompare(b.delivery_date||""));const delivered=records.filter(d=>d.status==="entregue").reduce((sum,d)=>sum+Number(d.meal_quantity||0),0);const total=Math.max(0,Number(selectedOrder.item_count||0));const remaining=Math.max(0,total-delivered);const percent=total?Math.min(100,delivered/total*100):0;return <section className="mt-5 rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/[.045] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs font-black uppercase tracking-[.12em] text-[#a7b86a]">Controle de entregas</div><p className="mt-1 text-xs text-white/45">Entregas parciais vinculadas a este pedido</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-black ${remaining>0?"bg-[#ef7d18]/15 text-[#ffb36b]":"bg-[#a7b86a]/15 text-[#d9e5a5]"}`}>{remaining>0?"Entrega parcial":"Pedido totalmente entregue"}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-black/20 p-3"><b className="block text-2xl">{total}</b><span className="text-[10px] text-white/45">Contratadas</span></div><div className="rounded-xl bg-black/20 p-3"><b className="block text-2xl text-[#a7b86a]">{delivered}</b><span className="text-[10px] text-white/45">Entregues</span></div><div className="rounded-xl bg-black/20 p-3"><b className="block text-2xl text-[#ffb36b]">{remaining}</b><span className="text-[10px] text-white/45">Pendentes</span></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#a7b86a]" style={{width:`${percent}%`}}/></div><div className="mt-4"><div className="mb-2 text-[10px] font-black uppercase tracking-[.12em] text-white/40">Histórico de entregas</div>{records.length===0?<p className="rounded-xl bg-black/20 p-3 text-xs text-white/40">Nenhuma entrega registrada para este pedido.</p>:<div className="space-y-2">{records.map(d=><div key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2"><div><b className="text-sm">{d.meal_quantity} marmita(s)</b><div className="text-[10px] text-white/45">{d.delivery_date?new Date(d.delivery_date+"T12:00:00").toLocaleDateString("pt-BR"):"Data não informada"}</div>{d.notes&&<div className="mt-1 text-[10px] text-white/35">{d.notes}</div>}</div><span className="text-[10px] font-bold text-[#a7b86a]">{d.status==="entregue"?"Confirmada":d.status}</span></div>)}</div>}</div>{remaining>0&&<div className="mt-4 border-t border-white/10 pt-4"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/45">Registrar nova entrega</div><div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-[10px] font-bold text-white/55">Quantidade<input type="number" min="1" max={remaining} step="1" value={deliveryQuantity} onChange={e=>setDeliveryQuantity(e.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"/></label><label className="grid gap-1 text-[10px] font-bold text-white/55">Data<input type="date" value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"/></label></div><label className="mt-2 grid gap-1 text-[10px] font-bold text-white/55">Observação (opcional)<input value={deliveryNote} onChange={e=>setDeliveryNote(e.target.value)} placeholder="Ex.: entrega complementar" className="min-h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/25"/></label><button type="button" onClick={()=>void registerPartialDelivery(selectedOrder)} disabled={busy||!deliveryDate||Number(deliveryQuantity)<1||Number(deliveryQuantity)>remaining} className="mt-3 min-h-11 w-full rounded-xl bg-[#ef7d18] px-4 py-3 text-sm font-black text-black disabled:opacity-40">{busy?"Registrando…":`Confirmar entrega de ${deliveryQuantity||0} marmita(s)`}</button><p className="mt-2 text-[10px] text-white/35">O sistema bloqueia automaticamente quantidades acima do saldo do pedido.</p></div>}</section>})()}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-white/[.03] p-3"><div className="text-white/35">Subtotal</div><b className="mt-1 block">{money(selectedOrder.subtotal)}</b></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-white/35">Entrega</div><b className="mt-1 block">{money(selectedOrder.delivery_fee)}</b></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-white/35">Total</div><b className="mt-1 block text-[#ef7d18]">{money(selectedOrder.total)}</b></div></div>
              <div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/35">Insumos necessários</div>{orderRequirements.length===0?<div className="rounded-xl border border-white/5 bg-white/[.02] p-4 text-sm text-white/45">{["confirmado","pago_recebido","em_preparo","saiu_entrega"].includes(selectedOrder.status)?"Nenhuma ficha técnica correspondente encontrada para os itens deste pedido.":"Confirme o pedido para calcular automaticamente os insumos necessários."}</div>:<div className="overflow-x-auto rounded-xl border border-white/5"><table className="w-full text-left text-sm"><thead><tr className="text-xs text-white/35"><th className="p-3">Insumo</th><th className="p-3">Necessário</th><th className="p-3">Estoque</th><th className="p-3">Situação</th></tr></thead><tbody>{orderRequirements.map(x=>{const shortage=x.required_quantity>x.current_quantity;return <tr key={x.id} className="border-t border-white/5"><td className="p-3 font-bold">{x.item_name}</td><td className="p-3">{x.required_quantity.toLocaleString("pt-BR",{maximumFractionDigits:3})} {x.unit}</td><td className="p-3">{x.current_quantity.toLocaleString("pt-BR",{maximumFractionDigits:3})} {x.unit}</td><td className={"p-3 font-black "+(shortage?"text-[#ef7d18]":"text-[#a7b86a]")}>{shortage?"Falta "+(x.required_quantity-x.current_quantity).toLocaleString("pt-BR",{maximumFractionDigits:3})+" "+x.unit:"OK"}</td></tr>})}</tbody></table></div>}</div>
<div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/35">Produção</div>{orderProductions.length===0?<><button onClick={()=>void createProductionFromOrder(selectedOrder)} disabled={busy||!["confirmado","pago_recebido","em_preparo"].includes(selectedOrder.status)} className="w-full rounded-xl bg-[#ef7d18] px-4 py-3 text-left text-sm font-black text-black disabled:opacity-40">Gerar produção deste pedido</button><div className="mt-1 text-xs text-white/35">Cria as produções pelas fichas técnicas. O estoque não é baixado agora.</div></>:<div className="space-y-2">{orderProductions.map(p=><div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.02] p-3"><div><b className="text-sm">{p.recipe_name||"Produção"}</b><div className="text-xs text-white/40">{p.quantity} unidade(s) · {p.stock_consumed?"estoque baixado":"estoque pendente"}</div></div><span className="rounded-full bg-[#a7b86a]/15 px-3 py-1 text-xs font-black text-[#d9e5a5]">{p.status==="planejada"?"Planejada":p.status==="em_producao"?"Em produção":p.status==="concluida"?"Concluída":p.status}</span></div>)}</div>}</div><div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white/35">Atualizar status</div><div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{[{v:"enviado_whatsapp",l:"Novo"},{v:"confirmado",l:"Confirmado"},{v:"pago_recebido",l:"Pago"},{v:"em_preparo",l:"Em preparo"},{v:"saiu_entrega",l:"Em entrega"},{v:"entregue",l:"Entregue"},{v:"cancelado",l:"Cancelado"}].map(s=><button key={s.v} onClick={()=>void updateOrderStatus(selectedOrder,s.v)} disabled={busy||selectedOrder.status===s.v} className={"min-h-10 shrink-0 rounded-full border px-3 py-2 text-xs font-black "+(selectedOrder.status===s.v?"border-[#a7b86a]/40 bg-[#a7b86a]/15 text-[#d9e5a5]":"border-white/10 bg-white/[.02] text-white/75")}>{s.l}</button>)}</div></div>
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
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-white/50">{leads.length} empresa(s) cadastrada(s) · {leads.filter(l=>l.next_follow_up_at&&new Date(l.next_follow_up_at)<=new Date()).length} acompanhamento(s) vencido(s)</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Search size={16} className="text-white/35"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empresa..." className="min-w-0 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"/>
                  <button onClick={()=>setShowNewLead(true)} className="rounded-full bg-[#ef7d18] px-4 py-2.5 text-sm font-black text-black">+ Novo lead</button>
                </div>
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

      {showNewLead&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 md:items-center"><form onSubmit={createLead} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#10130d] p-6"><div className="flex items-start justify-between"><div><div className="text-xs text-[#a7b86a]">PROSPECÇÃO B2B</div><h2 className="mt-1 text-2xl font-black">Novo lead</h2><p className="mt-1 text-sm text-white/45">Cadastre a empresa e defina o próximo acompanhamento.</p></div><button type="button" onClick={()=>setShowNewLead(false)}><X/></button></div><div className="mt-5 grid gap-3"><label className="grid gap-1 text-sm font-bold">Empresa *<input required value={leadForm.company} onChange={e=>setLeadForm({...leadForm,company:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-1 text-sm font-bold">Responsável<input value={leadForm.contact_name} onChange={e=>setLeadForm({...leadForm,contact_name:e.target.value})} placeholder="Nome ou deixe em branco" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-1 text-sm font-bold">E-mail<input type="email" value={leadForm.email} onChange={e=>setLeadForm({...leadForm,email:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-1 text-sm font-bold">Telefone / WhatsApp empresarial<input value={leadForm.whatsapp} onChange={e=>setLeadForm({...leadForm,whatsapp:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-1 text-sm font-bold">Próximo acompanhamento<input type="date" value={leadForm.next_follow_up_at} onChange={e=>setLeadForm({...leadForm,next_follow_up_at:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-1 text-sm font-bold">Observações<textarea rows={3} value={leadForm.notes} onChange={e=>setLeadForm({...leadForm,notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><button disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 font-black text-black disabled:opacity-50">{busy?"Cadastrando...":"Cadastrar empresa"}</button></div></form></div>}
      {selected&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 md:items-center"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#10130d] p-6"><div className="flex justify-between"><div><div className="text-xs text-[#a7b86a]">LEAD B2B</div><h2 className="text-2xl font-black">{selected.company}</h2><p className="text-sm text-white/45">{selected.contact_name} · {selected.whatsapp}</p></div><button onClick={()=>setSelected(null)}><X/></button></div><div className="mt-6 grid gap-4"><div className="rounded-xl bg-white/[.035] p-4 text-sm">{selected.email}<br/>{selected.estimated_meals||"Refeições não informadas"} · {selected.frequency||"Frequência não informada"}</div><div className="rounded-xl border border-white/10 p-4"><div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h3 className="min-w-0 break-words text-base font-black leading-tight">Histórico de contatos por e-mail</h3><span className="shrink-0 self-start rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/55 sm:self-auto">{contactEvents.filter(e=>e.lead_id===selected.id).length} registro(s)</span></div>{contactEvents.filter(e=>e.lead_id===selected.id).length===0?<p className="text-sm text-white/45">Nenhum evento de e-mail registrado para este lead.</p>:<div className="grid gap-3">{contactEvents.filter(e=>e.lead_id===selected.id).map(e=><div key={e.id} className="rounded-lg bg-white/[.035] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">{e.event_type==="delivered"?"Entregue ao servidor":e.event_type==="sent"?"Enviado":e.event_type==="bounced"?"Falhou na entrega":e.event_type==="opened"?"Aberto":e.event_type==="clicked"?"Link clicado":e.event_type==="replied"?"Resposta recebida":e.event_type}</span><time className="text-xs text-white/45">{new Date(e.event_at).toLocaleString("pt-BR")}</time></div><p className="mt-1 text-xs text-white/60">{e.recipient_email}</p><p className="mt-1 text-sm">{e.subject||"Sem assunto registrado"}</p>{e.evidence_note&&<p className="mt-2 text-xs text-white/45">{e.evidence_note}</p>}</div>)}</div>}</div><label className="grid gap-2 text-sm font-bold">Status<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal">{statuses.map(s=><option key={s}>{s}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Próximo contato<input type="date" value={selected.next_follow_up_at?.slice(0,10)||""} onChange={e=>setSelected({...selected,next_follow_up_at:e.target.value?`${e.target.value}T12:00:00.000Z`:null})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-2 text-sm font-bold">Valor da proposta<input type="number" step="0.01" value={selected.proposal_value??""} onChange={e=>setSelected({...selected,proposal_value:e.target.value?Number(e.target.value):null})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><label className="grid gap-2 text-sm font-bold">Observações internas<textarea rows={4} value={selected.owner_notes||""} onChange={e=>setSelected({...selected,owner_notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal"/></label><div className="flex gap-2"><a href={`https://wa.me/${selected.whatsapp.split("").filter(ch=>ch>="0"&&ch<="9").join("")}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#a7b86a]/30 px-4 py-3 text-sm font-black text-[#d9e5a5]"><MessageCircle size={16} className="mr-2 inline"/>WhatsApp</a><button onClick={()=>void saveLead()} disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">{busy?"Salvando...":"Salvar"}</button></div></div></div></div>}
      {typeof document !== "undefined" && createPortal(<nav className="nf-admin-mobile-nav fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[9999] rounded-2xl border border-white/10 bg-[#10130d]/95 p-2 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button onClick={()=>navigateSection("resumo")} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${section==="resumo"?"bg-[#a7b86a] text-black":"text-white/55"}`}><Home size={17}/><span>Início</span></button>
          <button onClick={()=>{setOrderStatusFilter("all");navigateSection("pedidos");}} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${section==="pedidos"?"bg-[#a7b86a] text-black":"text-white/55"}`}><ShoppingBag size={17}/><span>Pedidos</span></button>
          <button onClick={()=>navigateSection("whatsapp")} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${section==="whatsapp"?"bg-[#a7b86a] text-black":"text-white/55"}`}><MessageCircle size={17}/><span>WhatsApp</span></button>
          <button onClick={()=>setMobileMore(v=>!v)} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black ${mobileMore||!["resumo","pedidos","whatsapp"].includes(section)?"bg-[#a7b86a] text-black":"text-white/55"}`}><MoreHorizontal size={17}/><span>Mais</span></button>
        </div>
      </nav>, document.body)}
      {mobileMore&&<div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={()=>setMobileMore(false)}>
        <div className="absolute inset-x-3 bottom-24 rounded-3xl border border-white/10 bg-[#10130d] p-4 shadow-2xl" onClick={e=>e.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[.15em] text-[#a7b86a]">Mais opções</div><div className="mt-1 text-xs text-white/35">Gestão operacional</div></div><button onClick={()=>setMobileMore(false)} className="rounded-full bg-white/5 p-2"><X size={16}/></button></div>
          <div className="grid grid-cols-2 gap-2">
            
            
            {[{id:"clientes" as Section,label:"Clientes",Icon:Users},{id:"estoque" as Section,label:"Estoque",Icon:Package},{id:"embalagens" as Section,label:"Embalagens",Icon:Package},{id:"financeiro" as Section,label:"Financeiro",Icon:Wallet},{id:"entregas" as Section,label:"Entregas",Icon:Truck},{id:"producao" as Section,label:"Produção",Icon:Factory},{id:"configuracoes" as Section,label:"Configurações",Icon:Settings},{id:"b2b" as Section,label:"B2B",Icon:Building2},{id:"produtos" as Section,label:"Produtos",Icon:ShoppingBag},{id:"cupons" as Section,label:"Cupons",Icon:Ticket}].map(({id,label,Icon})=><button key={id} onClick={()=>{if(id==="pedidos")setOrderStatusFilter("all");navigateSection(id);setMobileMore(false)}} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3 text-left text-xs font-black"><Icon size={17} className="text-[#a7b86a]"/>{label}</button>)}
          </div>
        </div>
      </div>}
    </main>
  );
}

function Panel({title,children}:{title:string;children:ReactNode}) {
  return <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><h2 className="mb-5 text-2xl font-black">{title}</h2>{children}</div>;
}
