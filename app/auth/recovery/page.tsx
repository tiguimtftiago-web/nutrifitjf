"use client";

import { useEffect, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export default function RecoveryPage() {
  const [accessToken, setAccessToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("validating");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("access_token");
    const type = params.get("type");
    if (token && type === "recovery") {
      setAccessToken(token);
      setStatus("ready");
    } else {
      setStatus("invalid");
    }
  }, []);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setStatus("saving");
    try {
      const response = await fetch(URL + "/auth/v1/user", {
        method: "PUT",
        headers: {
          apikey: KEY,
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) throw new Error(await response.text());
      setStatus("success");
      setTimeout(() => { window.location.href = "/admin"; }, 1800);
    } catch (err) {
      console.error(err);
      setError("O link de recuperação expirou ou não é mais válido. Solicite um novo e-mail.");
      setStatus("ready");
    }
  }

  if (status === "validating") {
    return <main className="min-h-screen bg-[#080a07] grid place-items-center text-white"><p>Validando link...</p></main>;
  }

  if (status === "invalid") {
    return <main className="min-h-screen bg-[#080a07] px-5 py-10 text-white grid place-items-center"><div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10130d] p-8"><h1 className="text-2xl font-black">Link inválido</h1><p className="mt-3 text-sm text-white/55">Solicite novamente a recuperação de senha pelo painel administrativo.</p><a href="/admin" className="mt-6 inline-block rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black">Voltar ao painel</a></div></main>;
  }

  if (status === "success") {
    return <main className="min-h-screen bg-[#080a07] px-5 py-10 text-white grid place-items-center"><div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10130d] p-8"><h1 className="text-2xl font-black">Senha alterada</h1><p className="mt-3 text-sm text-white/55">Sua senha foi atualizada. Redirecionando para o painel...</p></div></main>;
  }

  return <main className="min-h-screen bg-[#080a07] px-5 py-10 text-white grid place-items-center"><div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10130d] p-8"><div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div><h1 className="mt-3 text-3xl font-black">Criar nova senha</h1><p className="mt-2 text-sm text-white/45">Digite a nova senha do painel administrativo.</p><form onSubmit={updatePassword} className="mt-7 grid gap-4"><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nova senha" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"/><input required minLength={6} type="password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder="Confirme a nova senha" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"/>{error&&<p className="text-sm text-red-300">{error}</p>}<button disabled={status==="saving"} className="rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black">{status==="saving"?"Salvando...":"Alterar senha"}</button></form></div></main>;
}
