"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Operations from "./operations";
import {
  BarChart3, Building2, LogOut, MessageCircle, RefreshCw, Search,
  ShoppingBag, Users, X, Package, Home, MoreHorizontal, ChevronRight, Wallet, Truck, Factory, Ticket
} from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Order = { id:string; created_at:string; customer_name:string|null; whatsapp:string|null; item_count:number; subtotal:number; delivery_fee:number; total:number; neighborhood:string|null; status:string; };
type Customer = { id:string; created_at:string; name:string; whatsapp:string; email:string|null; marketing_consent:boolean; order_count:number; total_spend:number; };
type Lead = { id:string; created_at:string; company:string; contact_name:string; whatsapp:string; email:string; estimated_meals:string|null; frequency:string|null; status:string; next_follow_up_at:string|null; proposal_value:number|null; owner_notes:string|null; notes:string|null; };
type Message = { id:string; created_at:string; from_phone:string|null; display_name:string|null; message_text:string|null; message_type:string|null; processed:boolean; };
type Section = "resumo"|"pedidos"|"clientes"|"whatsapp"|"b2b"|"estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons";
type InventoryItem = { id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; average_cost:number; supplier:string|null; active:boolean; notes:string|null; };

async function request(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string> = { apikey:KEY, "Content-Type":"application/json", ...((init.headers as Record<string,string>) || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path,{...init,headers});
  const text = await response.text();
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

  async function load(t=token) {
    if (!t) return;
    setBusy(true); setError("");
    try {
      const [o,c,m,l,i] = await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/customer_profiles?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/whatsapp_messages?select=id,created_at,from_phone,display_name,message_text,message_type,processed&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/b2b_leads?select=*&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_items?select=*&order=name.asc&limit=500`,t),
      ]);
      setOrders(o||[]); setCustomers(c||[]); setMessages(m||[]); setLeads(l||[]); setInventory(i||[]);
    } catch (e) {
      console.error(e); setError("Não foi possível carregar os dados. Confirme se sua conta tem acesso administrativo.");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    const saved=sessionStorage.getItem("nutrifit_admin_token")||"";
    if(saved){setToken(saved);void load(saved);}
  },[]);

  useEffect(() => {
    if (!token) return;
    const interval = window.setInterval(() => { void load(token); }, 20000);
    return () => window.clearInterval(interval);
  }, [token]);

  async function login(e:FormEvent){
    e.preventDefault(); setBusy(true); setError("");
    try {
      const data=await request(`${URL}/auth/v1/token?grant_type=password`,"",{method:"POST",body:JSON.stringify({email:email.trim().toLowerCase(),password})});
      if(!data?.access_token) throw new Error("Token ausente");
      sessionStorage.setItem("nutrifit_admin_token",data.access_token);
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
        <a href="/" className="mt-5 block text-center text-xs text-white/30">Voltar para o site</a>
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
          <div className="flex gap-2"><button onClick={()=>void load()} className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-black"><RefreshCw size={14} className={`mr-2 inline ${busy?"animate-spin":""}`}/>Atualizar</button><button onClick={()=>{sessionStorage.removeItem("nutrifit_admin_token");setToken("");}} className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-black"><LogOut size={14} className="mr-2 inline"/>Sair</button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-24 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden h-fit rounded-3xl border border-white/10 bg-[#0d110b] p-2 lg:sticky lg:top-24 lg:block">
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
            <div className="hidden lg:block"><div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Visão geral</div><h1 className="mt-1 text-3xl font-black">Nutrifit</h1></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {label:"Pedidos",value:orders.length,Icon:ShoppingBag},
                {label:"Faturamento",value:money(revenue),Icon:BarChart3},
                {label:"Clientes",value:customers.length,Icon:Users},
                {label:"WhatsApp",value:messages.length,Icon:MessageCircle},
              ].map(({label,value,Icon})=><div key={label} className="rounded-2xl border border-white/10 bg-[#0d110b] p-4 sm:rounded-3xl sm:p-5"><Icon size={18} className="text-[#a7b86a]"/><div className="mt-3 text-xl font-black sm:mt-5 sm:text-2xl">{value}</div><div className="mt-1 text-[11px] text-white/40">{label}</div></div>)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">Em andamento</div><div className="mt-2 text-2xl font-black">{activeOrders}</div><div className="mt-1 text-xs text-white/35">pedidos</div></div>
              <div className="rounded-2xl border border-white/10 bg-[#0d110b] p-4"><div className="text-[10px] font-black uppercase tracking-[.12em] text-white/35">B2B</div><div className="mt-2 text-2xl font-black">{leads.length}</div><div className="mt-1 text-xs text-white/35">leads</div></div>
            </div>
            <div className="mt-5 lg:hidden">
              <div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Ações rápidas</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {id:"pedidos" as Section,label:"Pedidos",Icon:ShoppingBag},
                  {id:"whatsapp" as Section,label:"WhatsApp",Icon:MessageCircle},
                  {id:"estoque" as Section,label:"Estoque",Icon:Package},
                  {id:"b2b" as Section,label:"B2B",Icon:Building2},
                ].map(({id,label,Icon})=><button key={id} onClick={()=>setSection(id)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d110b] p-4 text-left"><span className="flex items-center gap-3 text-sm font-black"><Icon size={18} className="text-[#a7b86a]"/>{label}</span><ChevronRight size={16} className="text-white/25"/></button>)}
              </div>
              <div className="mt-5 rounded-2xl border border-[#ef7d18]/20 bg-[#1b120a] p-4">
                <div className="text-xs font-black uppercase tracking-[.15em] text-[#ef7d18]">Operação</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[{id:"financeiro" as Section,label:"Financeiro",Icon:Wallet},{id:"entregas" as Section,label:"Entregas",Icon:Truck},{id:"producao" as Section,label:"Produção",Icon:Factory},{id:"cupons" as Section,label:"Cupons",Icon:Ticket}].map(({id,label,Icon})=><button key={id} onClick={()=>setSection(id)} className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-3 text-xs font-bold"><Icon size={15}/>{label}</button>)}
                </div>
              </div>
            </div>
          </>}

          {section==="pedidos"&&(
            <Panel title="Pedidos">
              <div className="grid gap-3 lg:hidden">
                {orders.map(o=>(
                  <div key={o.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black">{o.customer_name||"Cliente"}</div>
                        <div className="mt-1 text-xs text-white/40">{new Date(o.created_at).toLocaleString("pt-BR")}</div>
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black">{o.status}</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div className="text-xs text-white/45">{o.item_count} {o.item_count===1?"item":"itens"}</div>
                      <div className="text-lg font-black text-[#ef7d18]">{money(o.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="text-xs text-white/35"><th className="p-3">Data</th><th className="p-3">Cliente</th><th className="p-3">Itens</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o.id} className="border-t border-white/5">
                        <td className="p-3">{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                        <td className="p-3 font-black">{o.customer_name||"—"}<div className="text-xs text-white/35">{o.whatsapp||""}</div></td>
                        <td className="p-3">{o.item_count}</td>
                        <td className="p-3 font-black text-[#ef7d18]">{money(o.total)}</td>
                        <td className="p-3"><span className="rounded-full bg-white/5 px-3 py-1 text-xs">{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

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
                    <div className="mt-3 text-[10px] font-black uppercase tracking-[.12em] text-[#a7b86a]">{m.processed?"Processada":"Pendente"}</div>
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
                        <td className="p-3">{m.processed?"Processada":"Pendente"}</td>
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
            {[{id:"b2b" as Section,label:"B2B",Icon:Building2},{id:"estoque" as Section,label:"Estoque",Icon:Package},{id:"produtos" as Section,label:"Produtos",Icon:ShoppingBag},{id:"financeiro" as Section,label:"Financeiro",Icon:Wallet},{id:"entregas" as Section,label:"Entregas",Icon:Truck},{id:"producao" as Section,label:"Produção",Icon:Factory},{id:"cupons" as Section,label:"Cupons",Icon:Ticket}].map(({id,label,Icon})=><button key={id} onClick={()=>{setSection(id);setMobileMore(false)}} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3 text-left text-xs font-black"><Icon size={17} className="text-[#a7b86a]"/>{label}</button>)}
          </div>
        </div>
      </div>
    </main>
  );
}

function Panel({title,children}:{title:string;children:ReactNode}) {
  return <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><h2 className="mb-5 text-2xl font-black">{title}</h2>{children}</div>;
}
