"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, LogOut, MessageCircle, RefreshCw, Search, Users, UserRound, X } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const statuses = ["Novo lead","Contato realizado","Entendendo necessidade","Proposta enviada","Negociação","Cliente ativo","Sem retorno","Perdido","Reativar depois"];

type Lead = {
  id:string; created_at:string; company:string; contact_name:string; whatsapp:string; email:string;
  estimated_meals:string|null; frequency:string|null; status:string; next_follow_up_at:string|null;
  proposal_value:number|null; owner_notes:string|null; notes:string|null;
};
type Customer = {
  id:string; created_at:string; name:string; whatsapp:string; email:string|null;
  marketing_consent:boolean;
};

async function request(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string> = {
    apikey: KEY,
    "Content-Type": "application/json",
    ...((init.headers as Record<string,string>) || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, { ...init, headers });
  if (!response.ok) throw new Error(await response.text());
  return response;
}

export default function AdminPage() {
  const [token,setToken] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [leads,setLeads] = useState<Lead[]>([]);
  const [customers,setCustomers] = useState<Customer[]>([]);
  const [selected,setSelected] = useState<Lead|null>(null);
  const [search,setSearch] = useState("");
  const [customerSearch,setCustomerSearch] = useState("");
  const [section,setSection] = useState<"b2b"|"customers">("b2b");
  const [error,setError] = useState("");
  const [recoverySent,setRecoverySent] = useState(false);
  const [busy,setBusy] = useState(false);

  async function load(t=token) {
    if (!t) return;
    setBusy(true);
    try {
      const [leadResponse, customerResponse] = await Promise.all([
        request(`${URL}/rest/v1/b2b_leads?select=*&order=created_at.desc`, t),
        request(`${URL}/rest/v1/customer_profiles?select=*&order=created_at.desc`, t)
      ]);
      setLeads(await leadResponse.json());
      setCustomers(await customerResponse.json());
      setError("");
    } catch (err) {
      console.error(err);
      setError("Login realizado, mas não foi possível carregar os dados.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("nutrifit_admin_token") || "";
    if (saved) {
      setToken(saved);
      void load(saved);
    }
  }, []);

  async function login(e:React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await request(`${URL}/auth/v1/token?grant_type=password`, "", {
        method:"POST",
        body:JSON.stringify({ email:email.trim().toLowerCase(), password })
      });
      const data = await response.json();
      if (!data.access_token) throw new Error("Token ausente");
      sessionStorage.setItem("nutrifit_admin_token", data.access_token);
      setToken(data.access_token);
      setPassword("");
      await load(data.access_token);
    } catch (err) {
      console.error(err);
      sessionStorage.removeItem("nutrifit_admin_token");
      setToken("");
      setError("E-mail ou senha inválidos.");
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    setError("");
    setRecoverySent(false);
    if (!email) {
      setError("Digite seu e-mail primeiro.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${URL}/auth/v1/recover`, {
        method:"POST",
        headers:{ apikey:KEY, "Content-Type":"application/json" },
        body:JSON.stringify({
          email,
          redirect_to:"https://nutrifitjf.com.br/auth/recovery"
        })
      });
      if (!response.ok) throw new Error(await response.text());
      setRecoverySent(true);
    } catch (err) {
      console.error(err);
      setError("Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setBusy(false);
    }
  }

  async function saveLead() {
    if (!selected) return;
    setBusy(true);
    try {
      await request(`${URL}/rest/v1/b2b_leads?id=eq.${selected.id}`, token, {
        method:"PATCH",
        headers:{ Prefer:"return=minimal" },
        body:JSON.stringify({
          status:selected.status,
          next_follow_up_at:selected.next_follow_up_at || null,
          proposal_value:selected.proposal_value || null,
          owner_notes:selected.owner_notes || null,
          last_contact_at:new Date().toISOString()
        })
      });
      await load();
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(x => [x.company,x.contact_name,x.email,x.whatsapp].join(" ").toLowerCase().includes(q));
  }, [leads,search]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(x => [x.name,x.email || "",x.whatsapp].join(" ").toLowerCase().includes(q));
  }, [customers,customerSearch]);

  if (!token) {
    return (
      <main className="min-h-screen bg-[#080a07] px-5 py-10 text-white">
        <div className="mx-auto mt-20 max-w-md rounded-[2rem] border border-white/10 bg-[#10130d] p-8">
          <Building2 className="text-[#ef7d18]" />
          <h1 className="mt-4 text-3xl font-black">Painel B2B</h1>
          <p className="mt-2 text-sm text-white/45">Área administrativa da Nutrifit.</p>
          <form onSubmit={login} className="mt-7 grid gap-4">
            <input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
            <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
            {error && <p className="text-sm text-red-300">{error}</p>}
            {recoverySent && <p className="text-sm text-[#d9e5a5]">E-mail de recuperação enviado.</p>}
            <button disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black">
              {busy ? "Aguarde..." : "Entrar"}
            </button>
            <button type="button" onClick={()=>void recover()} disabled={busy} className="text-sm font-bold text-white/55 underline underline-offset-4">
              Esqueci minha senha
            </button>
          </form>
        </div>
      </main>
    );
  }

  const count = (status:string) => leads.filter(x=>x.status===status).length;
  const marketingCustomers = customers.filter(x=>x.marketing_consent).length;

  return (
    <main className="min-h-screen bg-[#080a07] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div>
            <h1 className="text-3xl font-black">Painel administrativo</h1>
            <p className="mt-1 text-sm text-white/40">B2B e cadastro de clientes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>void load()} className="rounded-full border border-white/10 px-4 py-2 text-sm"><RefreshCw size={15} className="mr-2 inline" />Atualizar</button>
            <button onClick={()=>{sessionStorage.removeItem("nutrifit_admin_token");setToken("");}} className="rounded-full border border-white/10 px-4 py-2 text-sm"><LogOut size={15} className="mr-2 inline" />Sair</button>
          </div>
        </header>

        <div className="mt-6 flex gap-2">
          <button onClick={()=>setSection("b2b")} className={section==="b2b" ? "rounded-full bg-[#a7b86a] px-5 py-2.5 text-sm font-black text-black" : "rounded-full border border-white/10 px-5 py-2.5 text-sm font-black text-white/65"}><Building2 size={15} className="mr-2 inline" />B2B</button>
          <button onClick={()=>setSection("customers")} className={section==="customers" ? "rounded-full bg-[#a7b86a] px-5 py-2.5 text-sm font-black text-black" : "rounded-full border border-white/10 px-5 py-2.5 text-sm font-black text-white/65"}><Users size={15} className="mr-2 inline" />Clientes</button>
        </div>

        {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}

        {section==="b2b" ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-black">Leads B2B</h2>
                <p className="text-sm text-white/40">{leads.length} leads cadastrados</p>
              </div>
              <label className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm">
                <Search size={15} />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empresa..." className="w-44 bg-transparent outline-none" />
              </label>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-white/[.035] p-4"><b className="text-2xl">{leads.length}</b><div className="text-xs text-white/40">Leads</div></div>
              <div className="rounded-xl bg-white/[.035] p-4"><b className="text-2xl">{count("Novo lead")}</b><div className="text-xs text-white/40">Novos</div></div>
              <div className="rounded-xl bg-white/[.035] p-4"><b className="text-2xl">{count("Proposta enviada")+count("Negociação")}</b><div className="text-xs text-white/40">Propostas</div></div>
              <div className="rounded-xl bg-white/[.035] p-4"><b className="text-2xl">{count("Cliente ativo")}</b><div className="text-xs text-white/40">Ativos</div></div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-white/35"><tr><th className="p-3">Empresa</th><th className="p-3">Contato</th><th className="p-3">Refeições</th><th className="p-3">Status</th><th /></tr></thead>
                <tbody>
                  {filteredLeads.map(l=>(
                    <tr key={l.id} className="border-t border-white/5">
                      <td className="p-3 font-black">{l.company}</td>
                      <td className="p-3">{l.contact_name}<div className="text-xs text-white/35">{l.whatsapp}</div></td>
                      <td className="p-3">{l.estimated_meals || "—"}</td>
                      <td className="p-3"><span className="rounded-full bg-[#a7b86a]/15 px-2.5 py-1 text-xs">{l.status}</span></td>
                      <td className="p-3 text-right"><button onClick={()=>setSelected(l)} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black">Abrir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-black">Clientes cadastrados</h2><p className="text-sm text-white/40">{customers.length} clientes · {marketingCustomers} autorizados para marketing</p></div>
              <label className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm"><Search size={15} /><input value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)} placeholder="Buscar cliente..." className="w-44 bg-transparent outline-none" /></label>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="text-xs text-white/35"><tr><th className="p-3">Cliente</th><th className="p-3">WhatsApp</th><th className="p-3">E-mail</th><th className="p-3">Marketing</th><th className="p-3">Cadastro</th></tr></thead>
                <tbody>
                  {filteredCustomers.map(x=>(
                    <tr key={x.id} className="border-t border-white/5">
                      <td className="p-3 font-black">{x.name}</td>
                      <td className="p-3">{x.whatsapp}</td>
                      <td className="p-3 text-white/65">{x.email || "—"}</td>
                      <td className="p-3"><span className={x.marketing_consent ? "rounded-full bg-[#a7b86a]/15 px-2.5 py-1 text-xs text-[#d9e5a5]" : "rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/45"}>{x.marketing_consent ? "Autorizado" : "Não autorizado"}</span></td>
                      <td className="p-3 text-white/55">{new Date(x.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredCustomers.length && <div className="py-10 text-center text-sm text-white/40"><UserRound className="mx-auto mb-2" size={24} />Nenhum cliente encontrado.</div>}
            </div>
          </section>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 md:items-center">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#10130d] p-6">
              <div className="flex justify-between">
                <div><div className="text-xs text-[#a7b86a]">LEAD B2B</div><h2 className="text-2xl font-black">{selected.company}</h2><p className="text-sm text-white/45">{selected.contact_name} · {selected.whatsapp}</p></div>
                <button onClick={()=>setSelected(null)}><X /></button>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-xl bg-white/[.035] p-4 text-sm">{selected.email}<br />{selected.estimated_meals || "Refeições não informadas"} · {selected.frequency || "Frequência não informada"}</div>
                <label className="grid gap-2 text-sm font-bold">Status<select value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal">{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-bold">Próximo contato<input type="date" value={selected.next_follow_up_at?.slice(0,10) || ""} onChange={e=>setSelected({...selected,next_follow_up_at:e.target.value ? `${e.target.value}T12:00:00.000Z` : null})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-bold">Valor da proposta<input type="number" step="0.01" value={selected.proposal_value ?? ""} onChange={e=>setSelected({...selected,proposal_value:e.target.value ? Number(e.target.value) : null})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal" /></label>
                <label className="grid gap-2 text-sm font-bold">Observações internas<textarea rows={4} value={selected.owner_notes || ""} onChange={e=>setSelected({...selected,owner_notes:e.target.value})} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-normal" /></label>
                <div className="flex flex-wrap gap-2">
                  <a href={`https://wa.me/${selected.whatsapp.replace(/\\D/g,"")}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#a7b86a]/30 px-4 py-3 text-sm font-black text-[#d9e5a5]"><MessageCircle className="mr-2 inline" size={16} />WhatsApp</a>
                  <button onClick={()=>void saveLead()} disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">{busy ? "Salvando..." : "Salvar"}</button>
                </div>
                {selected.notes && <div className="rounded-xl bg-black/20 p-4 text-sm text-white/55">{selected.notes}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
