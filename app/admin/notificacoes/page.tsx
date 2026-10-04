"use client";

import { useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

export default function AdminNotificationsPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sendTest() {
    setBusy(true);
    setMessage("");
    try {
      const token = sessionStorage.getItem("nutrifit_admin_token") || "";
      if (!token) throw new Error("Sua sessão administrativa expirou. Volte ao painel e entre novamente.");

      const response = await fetch(`${URL}/functions/v1/nutrifit-admin-push-test`, {
        method: "POST",
        headers: {
          apikey: KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Não foi possível enviar o teste.");
      setMessage(`Teste enviado: ${data.sent} dispositivo(s). ${data.removed ? `${data.removed} inscrição(ões) antiga(s) foram removidas. ` : ""}Confira seu celular.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar o teste.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080a07] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-xl">
        <a href="/admin" className="text-xs font-bold text-white/45">← Voltar ao painel</a>
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d110b] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-10 w-10" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit Admin</div>
              <h1 className="text-2xl font-black">Teste de notificações</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-white/55">
            Envie uma notificação push real para os dispositivos ativos da área administrativa.
            Este teste usa sua sessão de administrador e não expõe o token interno do sistema.
          </p>

          <button
            onClick={() => void sendTest()}
            disabled={busy}
            className="mt-6 w-full rounded-full bg-[#ef7d18] px-5 py-4 text-sm font-black text-black disabled:opacity-50"
          >
            {busy ? "Enviando..." : "🔔 Enviar notificação de teste"}
          </button>

          {message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/75">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
