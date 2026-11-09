"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SESSION_KEY = "nutrifit360.session";

type Session = { access_token: string; refresh_token: string; user: { id: string; email?: string; user_metadata?: { full_name?: string } } };
type Profile = { user_id: string; full_name: string; primary_goal: string };

async function authRequest(path: string, body: unknown) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Não foi possível autenticar.");
  return data;
}

export default function AreaAuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("bem_estar");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setSession(JSON.parse(saved));
    } catch { localStorage.removeItem(SESSION_KEY); }
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;
    let cancelled = false;
    const activeSession = session;
    async function loadOrCreateProfile() {
      try {
        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${activeSession.access_token}` };
        const response = await fetch(`${SUPABASE_URL}/rest/v1/nutrifit360_profiles?select=user_id,full_name,primary_goal&user_id=eq.${activeSession.user.id}&limit=1`, {
          headers, cache: "no-store",
        });
        if (response.status === 401) throw new Error("Sua sessão expirou. Entre novamente.");
        if (!response.ok) throw new Error("Não foi possível carregar seu perfil.");
        const rows = await response.json() as Profile[];
        if (rows[0]) {
          if (!cancelled) {
            setProfile(rows[0]);
            setName(rows[0].full_name);
            setGoal(rows[0].primary_goal);
          }
          return;
        }
        const fullName = (activeSession.user.user_metadata?.full_name || name).trim();
        if (fullName.length >= 2) {
          const created = await fetch(`${SUPABASE_URL}/rest/v1/nutrifit360_profiles`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify({ user_id: activeSession.user.id, full_name: fullName, primary_goal: "bem_estar" }),
          });
          if (!created.ok) throw new Error("Sua conta foi criada, mas não foi possível concluir seu perfil. Tente novamente.");
          const saved = await created.json() as Profile[];
          if (!cancelled) setProfile(saved[0] || { user_id: activeSession.user.id, full_name: fullName, primary_goal: "bem_estar" });
        } else if (!cancelled) {
          setName("");
          setProfile(null);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Não foi possível carregar seu perfil.");
          if (error instanceof Error && error.message.includes("sessão expirou")) logout();
        }
      }
    }
    void loadOrCreateProfile();
    return () => { cancelled = true; };
  }, [session]);

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setProfile(null);
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const data = mode === "login"
        ? await authRequest("token?grant_type=password", { email: email.trim(), password })
        : await authRequest("signup", { email: email.trim(), password, data: { full_name: name.trim() } });
      if (!data.access_token) {
        setMessage("Cadastro recebido. Confirme seu e-mail e depois entre para continuar.");
      } else {
        const next = data as Session;
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
        setSession(next);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao acessar."); }
    finally { setBusy(false); }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); if (!session) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/nutrifit360_profiles`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({ user_id: session.user.id, full_name: name.trim(), primary_goal: goal }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Não foi possível salvar seu perfil.");
      }
      const rows = await response.json();
      setProfile(rows[0] || { user_id: session.user.id, full_name: name.trim(), primary_goal: goal });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao salvar perfil."); }
    finally { setBusy(false); }
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) return <AuthShell><h1>Configuração pendente</h1><p>O acesso seguro ainda não está configurado neste ambiente.</p></AuthShell>;
  if (session && profile) return <>{children}</>;
  return <AuthShell>
    <div className="brand">NUTRIFIT <span>360°</span></div>
    {!session ? <>
      <p className="eyebrow">SUA ÁREA PESSOAL</p>
      <h1>{mode === "login" ? "Entre na sua conta" : "Crie seu acesso"}</h1>
      <p className="muted">Seus registros e sua evolução ficam vinculados ao seu usuário.</p>
      <form onSubmit={submitAuth}>
        {mode === "signup" && <label>Seu nome<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} autoComplete="name" /></label>}
        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        <button disabled={busy}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar minha conta"}</button>
      </form>
      <button className="switch" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setMessage("");}}>{mode === "login" ? "Ainda não tenho conta · Criar acesso" : "Já tenho conta · Entrar"}</button>
    </> : <>
      <p className="eyebrow">PRIMEIRO ACESSO</p>
      <h1>Vamos configurar seu perfil</h1>
      <p className="muted">Informe como devemos identificar sua jornada no Nutrifit 360°.</p>
      <form onSubmit={saveProfile}>
        <label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} autoComplete="name" /></label>
        <label>Objetivo principal<select value={goal} onChange={e=>setGoal(e.target.value)}><option value="bem_estar">Bem-estar e saúde</option><option value="emagrecimento">Emagrecimento</option><option value="hipertrofia">Hipertrofia</option><option value="condicionamento">Condicionamento físico</option></select></label>
        <button disabled={busy}>{busy ? "Salvando..." : "Salvar perfil e continuar"}</button>
      </form>
      <button className="switch" onClick={logout}>Sair desta conta</button>
    </>}
    {message && <p className="message" role="status">{message}</p>}
    <p className="foot">Seus dados são privados e protegidos por regras de acesso por usuário.</p>
    <style jsx>{`
      .brand{font-weight:900;letter-spacing:3px;color:#f4f5ef;font-size:13px;margin-bottom:30px}.brand span{color:#a4c64a}.eyebrow{font-size:10px;letter-spacing:2px;color:#a4c64a;font-weight:700}h1{font-size:28px;line-height:1.15;margin:8px 0}.muted{color:#9ca595;font-size:13px;line-height:1.6;margin:0 0 24px}form{display:grid;gap:15px}label{display:grid;gap:7px;color:#dce2d5;font-size:12px}input,select{width:100%;background:#0a0e0a;border:1px solid #35402f;border-radius:9px;color:#f4f5ef;padding:13px;font-size:16px;outline:none}input:focus,select:focus{border-color:#a4c64a}form button{margin-top:5px;background:#f28a22;border:0;border-radius:9px;padding:14px;color:#1a1209;font-weight:800;font-size:13px}button:disabled{opacity:.6}.switch{width:100%;background:transparent;border:0;color:#b9d879;padding:16px 8px;font-size:12px}.message{color:#ffc17b;font-size:12px;line-height:1.5;background:#2a1d12;padding:11px;border-radius:8px}.foot{border-top:1px solid #273025;padding-top:16px;color:#75806f;font-size:10px;line-height:1.5;margin-top:20px}
    `}</style>
  </AuthShell>;
}

function AuthShell({ children }: { children: ReactNode }) {
  return <main style={{minHeight:"100svh",background:"radial-gradient(ellipse at 75% 0%,#1b2516 0,transparent 38%),#090b09",color:"#f4f5ef",display:"grid",placeItems:"center",padding:20,fontFamily:"Arial, sans-serif"}}>
    <section style={{width:"100%",maxWidth:440,border:"1px solid #2b3528",borderRadius:18,padding:26,background:"#111611",boxShadow:"0 20px 80px #0008"}}>{children}</section>
  </main>;
}
