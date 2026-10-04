"use client";

import { useEffect, useState, type FormEvent } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

export default function AdminNotificationTest() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("nutrifit_admin_token") || localStorage.getItem("nutrifit_admin_token") || "";
    const e = sessionStorage.getItem("nutrifit_admin_email") || localStorage.getItem("nutrifit_admin_email") || "";
    setToken(t);
    setEmail(e);
    if (!t) setLoginOpen(true);
  }, []);

  function save(data:any, e:string) {
    setToken(data.access_token);
    setEmail(e);
    sessionStorage.setItem("nutrifit_admin_token", data.access_token);
    sessionStorage.setItem("nutrifit_admin_email", e);
    localStorage.setItem("nutrifit_admin_token", data.access_token);
    localStorage.setItem("nutrifit_admin_email", e);
    if (data.refresh_token) localStorage.setItem("nutrifit_admin_refresh_token", data.refresh_token);
  }

  async function login(event:FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
        method:"POST",
        headers:{apikey:KEY,"Content-Type":"application/json"},
        body:JSON.stringify({email:email.trim().toLowerCase(),password})
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok || !data.access_token) throw new Error("E-mail ou senha inválidos.");
      save(data,email.trim().toLowerCase());
      setPassword(""); setLoginOpen(false);
      setMessage("Acesso validado. Agora envie o teste.");
    } catch(e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível validar o acesso.");
    } finally { setBusy(false); }
  }

  async function refresh() {
    const rt = localStorage.getItem("nutrifit_admin_refresh_token") || "";
    if (!rt) return "";
    const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, {
      method:"POST",
      headers:{apikey:KEY,"Content-Type":"application/json"},
      body:JSON.stringify({refresh_token:rt})
    });
    const data = await r.json().catch(()=>({}));
    if (!r.ok || !data.access_token) return "";
    save(data,email);
    return data.access_token;
  }

  async function send() {
    setBusy(true); setMessage("");
    try {
      let t = token || sessionStorage.getItem("nutrifit_admin_token") || localStorage.getItem("nutrifit_admin_token") || "";
      if (!t) { setLoginOpen(true); throw new Error("Valide o acesso administrativo primeiro."); }

      const call = (access:string) => fetch(`${URL}/functions/v1/nutrifit-admin-push-test`, {
        method:"POST",
        headers:{apikey:KEY,Authorization:`Bearer ${access}`,"Content-Type":"application/json"},
        body:"{}"
      });

      let r = await call(t);
      if (r.status === 401) {
        const fresh = await refresh();
        if (fresh) r = await call(fresh);
      }

      const data = await r.json().catch(()=>({}));
      if (!r.ok) {
        if (r.status === 401) { setLoginOpen(true); throw new Error("A sessão expirou. Valide o acesso novamente."); }
        throw new Error(data.error || "Falha ao enviar a notificação.");
      }
      setMessage(`✅ Teste enviado para ${data.sent} dispositivo(s). ${data.removed ? data.removed+" inscrição(ões) inválida(s) foram removidas." : ""}`);
    } catch(e) {
      setMessage(e instanceof Error ? e.message : "Erro no teste.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#080a07] px-4 py-8 text-white">
    <div className="mx-auto max-w-xl">
      <a href="/admin" className="text-xs font-bold text-white/45">← Voltar ao painel</a>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d110b] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-10 w-10"/>
          <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit Admin</div><h1 className="text-2xl font-black">Teste de notificações</h1></div>
        </div>
        <p className="mt-5 text-sm leading-6 text-white/55">Teste real do push administrativo. A autorização usa sua conta administrativa e não expõe o segredo interno do servidor.</p>

        {loginOpen && <form onSubmit={login} className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4">
          <div className="text-xs font-black uppercase tracking-[.12em] text-white/40">Validar acesso</div>
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"/>
          <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"/>
          <button disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black disabled:opacity-50">{busy ? "Validando..." : "Entrar e autorizar"}</button>
        </form>}

        <button onClick={()=>void send()} disabled={busy||loginOpen} className="mt-6 w-full rounded-full bg-[#ef7d18] px-5 py-4 text-sm font-black text-black disabled:opacity-50">{busy ? "Enviando..." : "🔔 Enviar notificação de teste"}</button>
        {message && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/75">{message}</div>}
      </div>
    </div>
  </main>;
}
