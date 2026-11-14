"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileCheck2, LockKeyhole, LoaderCircle, Upload, ShieldCheck, LogOut } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const ADMIN_EMAILS = new Set(["nutrifit.cozinhajf@gmail.com", "tiguimtftiago@gmail.com"]);

export default function OfficialDocumentsAdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [issuedUrl, setIssuedUrl] = useState("");
  const [issuedHash, setIssuedHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    document_number: "",
    document_type: "purchase_order",
    buyer_name: "",
    buyer_tax_id: "",
    total_amount: "",
    payment_status: "not_informed",
    description: "",
  });

  useEffect(() => {
    const savedToken = sessionStorage.getItem("nutrifit_admin_token") || "";
    const savedEmail = sessionStorage.getItem("nutrifit_admin_email") || "";
    if (savedToken && ADMIN_EMAILS.has(savedEmail.toLowerCase())) {
      setToken(savedToken);
      setEmail(savedEmail);
    }
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.access_token || !ADMIN_EMAILS.has(String(data.user?.email || "").toLowerCase())) {
        throw new Error("Acesso restrito aos administradores NutriFit. Confira as credenciais.");
      }
      sessionStorage.setItem("nutrifit_admin_token", data.access_token);
      sessionStorage.setItem("nutrifit_admin_email", data.user.email);
      setToken(data.access_token);
      setEmail(data.user.email);
      setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function issue(event: FormEvent) {
    event.preventDefault();
    if (!token || !file) {
      setMessage("Entre como administrador e selecione o PDF original.");
      return;
    }
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
      setMessage("Selecione um arquivo PDF de até 10 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    setIssuedUrl("");
    setIssuedHash("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Falha ao ler PDF."));
        reader.onerror = () => reject(new Error("Falha ao ler PDF."));
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${SUPABASE_URL}/functions/v1/official-documents`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          document_number: form.document_number,
          document_type: form.document_type,
          buyer_name: form.buyer_name,
          buyer_tax_id: form.buyer_tax_id,
          total_amount: form.total_amount ? Number(form.total_amount.replace(",", ".")) : null,
          payment_status: form.payment_status,
          document_data: { description: form.description },
          pdf_base64: dataUrl,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha ao registrar documento.");
      setIssuedUrl(result.verification_url);
      setIssuedHash(result.sha256);
      setMessage("Documento registrado. O PDF original foi armazenado e seu hash SHA-256 foi calculado no servidor.");
      setForm({ document_number: "", document_type: "purchase_order", buyer_name: "", buyer_tax_id: "", total_amount: "", payment_status: "not_informed", description: "" });
      setFile(null);
      const input = document.getElementById("official-pdf") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao registrar documento.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("nutrifit_admin_token");
    sessionStorage.removeItem("nutrifit_admin_email");
    setToken("");
  }

  return (
    <main className="min-h-screen bg-[#080a07] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => router.push("/admin")} className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Voltar ao painel</button>
        <div className="mb-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => router.push("/admin/documentos/nova-ordem")} className="inline-flex items-center gap-2 rounded-xl bg-[#ef7d18] px-4 py-3 text-sm font-semibold text-black">
            <FileCheck2 className="h-4 w-4" /> Gerar ordem com QR Code
          </button>
        </div>
        <header className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.2em] text-[#a2a24c]">NUTRIFIT · SEGURANÇA</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Documentos oficiais</h1>
            <p className="mt-1 text-sm text-white/55">Registro de emissão, hash SHA-256 e validação pública.</p>
          </div>
          {token && <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"><LogOut className="h-4 w-4" /> Sair</button>}
        </header>

        {!token ? (
          <form onSubmit={signIn} className="rounded-2xl border border-white/10 bg-[#11140f] p-5 sm:p-7">
            <LockKeyhole className="mb-4 h-8 w-8 text-[#ef7d18]" />
            <h2 className="mb-4 text-lg font-semibold">Acesso administrativo</h2>
            <label className="mb-2 block text-xs text-white/60">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" />
            <label className="mb-2 block text-xs text-white/60">Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" />
            {loginError && <p className="mb-3 text-sm text-red-300">{loginError}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#ef7d18] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Entrando..." : "Entrar"}</button>
          </form>
        ) : (
          <form onSubmit={issue} className="space-y-5 rounded-2xl border border-white/10 bg-[#11140f] p-5 sm:p-7">
            <div className="flex items-center gap-2 rounded-xl border border-[#6eaa67]/25 bg-[#6eaa67]/10 p-3 text-sm text-[#b9e6b1]"><ShieldCheck className="h-5 w-5" /> Administrador autenticado: {email}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-2 block text-xs text-white/60">Número do documento</label><input required maxLength={80} value={form.document_number} onChange={e => setForm({...form,document_number:e.target.value})} placeholder="NF-OC-141126-01" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" /></div>
              <div><label className="mb-2 block text-xs text-white/60">Tipo</label><select value={form.document_type} onChange={e => setForm({...form,document_type:e.target.value})} className="w-full rounded-xl border border-white/10 bg-[#171a14] px-4 py-3"><option value="purchase_order">Ordem de compra</option><option value="quote">Orçamento</option><option value="production_order">Ordem de produção</option><option value="commercial_receipt">Comprovante comercial</option><option value="other">Outro</option></select></div>
              <div><label className="mb-2 block text-xs text-white/60">Comprador / cliente</label><input required maxLength={180} value={form.buyer_name} onChange={e => setForm({...form,buyer_name:e.target.value})} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" /></div>
              <div><label className="mb-2 block text-xs text-white/60">CNPJ / CPF (opcional)</label><input maxLength={32} value={form.buyer_tax_id} onChange={e => setForm({...form,buyer_tax_id:e.target.value})} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" /></div>
              <div><label className="mb-2 block text-xs text-white/60">Valor total (R$)</label><input inputMode="decimal" value={form.total_amount} onChange={e => setForm({...form,total_amount:e.target.value})} placeholder="552,00" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" /></div>
              <div><label className="mb-2 block text-xs text-white/60">Situação do pagamento</label><select value={form.payment_status} onChange={e => setForm({...form,payment_status:e.target.value})} className="w-full rounded-xl border border-white/10 bg-[#171a14] px-4 py-3"><option value="not_informed">Não informado</option><option value="pending">Pendente</option><option value="paid">Pago</option><option value="partially_paid">Parcialmente pago</option><option value="cancelled">Cancelado</option></select></div>
            </div>
            <div><label className="mb-2 block text-xs text-white/60">Descrição / itens (opcional)</label><textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ef7d18]" /></div>
            <div><label className="mb-2 block text-xs text-white/60">PDF final que será registrado (máximo 10 MB)</label><input id="official-pdf" required type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#ef7d18] file:px-3 file:py-2 file:font-semibold file:text-black" /></div>
            <div className="rounded-xl border border-[#ef7d18]/20 bg-[#ef7d18]/[.06] p-3 text-xs leading-relaxed text-white/65">O sistema registra exatamente o PDF enviado e calcula o SHA-256 no servidor. O registro online não altera o conteúdo do PDF nem equivale a uma assinatura ICP-Brasil. A versão com QR Code incorporado ao arquivo será adicionada ao fluxo de geração.</div>
            {message && <p className="rounded-lg bg-white/[.05] p-3 text-sm text-white/80">{message}</p>}
            {issuedUrl && <div className="rounded-xl border border-[#6eaa67]/30 bg-[#6eaa67]/10 p-4"><div className="mb-2 flex items-center gap-2 font-semibold text-[#b9e6b1]"><FileCheck2 className="h-5 w-5" /> Registro concluído</div><a className="break-all text-sm text-[#ffb36b] underline" href={issuedUrl} target="_blank" rel="noreferrer">{issuedUrl}</a><p className="mt-3 break-all font-mono text-[10px] text-white/50">SHA-256: {issuedHash}</p></div>}
            <button disabled={busy || !file} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef7d18] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}{busy ? "Registrando documento..." : "Registrar e proteger PDF"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
