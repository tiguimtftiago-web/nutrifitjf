"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileCheck2, LoaderCircle, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
const ADMIN_EMAILS = new Set(["nutrifit.cozinhajf@gmail.com", "tiguimtftiago@gmail.com"]);

type OrderForm = {
  document_number: string; emission_date: string; buyer_name: string; buyer_tax_id: string;
  buyer_address: string; buyer_cep: string; requester: string; reference: string;
  description: string; quantity: string; unit_price: string; payment_method: string;
  payment_status_label: string; payment_received: string; payment_date: string;
};

const initialForm: OrderForm = {
  document_number: "NF-OC-141126-01",
  emission_date: "14/11/2026",
  buyer_name: "MYSA S/A",
  buyer_tax_id: "38.542.718/0001-82",
  buyer_address: "Av. Francisco Bernardino, nº 115, Loja LJ, Centro, Juiz de Fora/MG",
  buyer_cep: "36013-100",
  requester: "Brendha Espinosa",
  reference: "ABC da Construção",
  description: "Marmita personalizada – Linha FIT (300 g)",
  quantity: "24",
  unit_price: "23,00",
  payment_method: "PIX",
  payment_status_label: "PAGO",
  payment_received: "R$ 552,00",
  payment_date: "14/11/2026",
};

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function NewOfficialPurchaseOrderPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [hash, setHash] = useState("");
  const [pdfBase64, setPdfBase64] = useState("");

  const quantity = Math.max(0, Number(form.quantity) || 0);
  const unitPrice = Math.max(0, Number(form.unit_price.replace(",", ".")) || 0);
  const total = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("nutrifit_admin_token") || "";
    const savedEmail = sessionStorage.getItem("nutrifit_admin_email") || "";
    if (savedToken && ADMIN_EMAILS.has(savedEmail.toLowerCase())) {
      setToken(savedToken);
      setEmail(savedEmail);
    }
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setLoginError("");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.access_token || !ADMIN_EMAILS.has(String(data.user?.email || "").toLowerCase())) {
        throw new Error("Acesso restrito aos administradores NutriFit. Confira as credenciais.");
      }
      sessionStorage.setItem("nutrifit_admin_token", data.access_token);
      sessionStorage.setItem("nutrifit_admin_email", data.user.email);
      setToken(data.access_token); setEmail(data.user.email); setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally { setBusy(false); }
  }

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!token) { setMessage("Entre com uma conta administrativa."); return; }
    if (!form.document_number.trim() || !form.buyer_name.trim() || !form.description.trim() || quantity <= 0 || unitPrice < 0) {
      setMessage("Confira o número, comprador, descrição, quantidade e valor unitário."); return;
    }
    setBusy(true); setMessage(""); setVerificationUrl(""); setHash(""); setPdfBase64("");
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/official-documents`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_purchase_order",
          document_number: form.document_number.trim(),
          emission_date: form.emission_date,
          buyer_name: form.buyer_name.trim(),
          buyer_tax_id: form.buyer_tax_id,
          buyer_address: form.buyer_address + (form.buyer_cep ? " · CEP " + form.buyer_cep : ""),
          requester: form.requester,
          reference: form.reference,
          total_amount: total,
          items: [{ description: form.description, quantity, unit_price: unitPrice }],
          payment_method: form.payment_method,
          payment_status_label: form.payment_status_label,
          payment_received: form.payment_received || money(total),
          payment_date: form.payment_date,
          payment_status: form.payment_status_label.toUpperCase() === "PAGO" ? "paid" : "not_informed",
          narrative: `A presente ordem de compra registra a aquisição de ${quantity} marmitas personalizadas da Linha FIT, no valor total de ${money(total)}, com pagamento informado como ${form.payment_status_label} via ${form.payment_method}.`,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha ao gerar a ordem.");
      setVerificationUrl(result.verification_url);
      setHash(result.sha256);
      setPdfBase64(result.pdf_base64 || "");
      setMessage("Ordem gerada e registrada. O PDF contém o QR Code de validação e o original foi armazenado no registro oficial NutriFit.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao gerar a ordem.");
    } finally { setBusy(false); }
  }

  function downloadPdf() {
    if (!pdfBase64) return;
    const binary = atob(pdfBase64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${form.document_number || "ordem-compra"}-NutriFit.pdf`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function logout() {
    sessionStorage.removeItem("nutrifit_admin_token"); sessionStorage.removeItem("nutrifit_admin_email");
    setToken(""); setEmail("");
  }

  const input = "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-[#ef7d18]";
  const field = (label: string, key: keyof OrderForm, type="text") => (
    <label className="block"><span className="mb-2 block text-xs text-white/60">{label}</span>
      <input className={input} type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
    </label>
  );

  return (
    <main className="min-h-screen bg-[#080a07] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button onClick={()=>router.push("/admin/documentos")} className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4"/> Documentos oficiais</button>
        <header className="mb-7 flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold tracking-[.2em] text-[#a2a24c]">NUTRIFIT · EMISSÃO AUTOMÁTICA</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Nova ordem de compra</h1><p className="mt-1 text-sm text-white/55">PDF A4 horizontal com QR Code e registro de autenticidade.</p></div>
          {token && <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"><LogOut className="h-4 w-4"/> Sair</button>}
        </header>
        {!token ? (
          <form onSubmit={signIn} className="rounded-2xl border border-white/10 bg-[#11140f] p-5 sm:p-7">
            <LockKeyhole className="mb-4 h-8 w-8 text-[#ef7d18]"/><h2 className="mb-4 text-lg font-semibold">Acesso administrativo</h2>
            <label className="mb-2 block text-xs text-white/60">E-mail</label><input className={input+" mb-4"} type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
            <label className="mb-2 block text-xs text-white/60">Senha</label><input className={input+" mb-4"} type="password" required value={password} onChange={e=>setPassword(e.target.value)}/>
            {loginError && <p className="mb-3 text-sm text-red-300">{loginError}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#ef7d18] px-4 py-3 font-semibold text-black disabled:opacity-50">{busy?"Entrando...":"Entrar"}</button>
          </form>
        ) : (
          <form onSubmit={generate} className="space-y-5">
            <div className="flex items-center gap-2 rounded-xl border border-[#6eaa67]/25 bg-[#6eaa67]/10 p-3 text-sm text-[#b9e6b1]"><ShieldCheck className="h-5 w-5"/> Administrador autenticado: {email}</div>
            <section className="rounded-2xl border border-white/10 bg-[#11140f] p-5">
              <h2 className="mb-4 font-semibold">Identificação da ordem</h2>
              <div className="grid gap-4 sm:grid-cols-2">{field("Número do documento","document_number")}{field("Data de emissão","emission_date")}</div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#11140f] p-5">
              <h2 className="mb-4 font-semibold">Dados do comprador</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("Razão social","buyer_name")}{field("CNPJ","buyer_tax_id")}
                <div className="sm:col-span-2">{field("Endereço","buyer_address")}</div>
                {field("CEP","buyer_cep")}{field("Solicitante","requester")}{field("Referência","reference")}
              </div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#11140f] p-5">
              <h2 className="mb-4 font-semibold">Itens da ordem</h2>
              <div className="grid gap-4 sm:grid-cols-2">{field("Descrição","description")}{field("Quantidade","quantity","number")}{field("Valor unitário (R$)","unit_price")}</div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#1a1d14] p-4"><span className="text-sm text-white/65">Valor total calculado</span><strong className="text-xl text-[#ffb36b]">{money(total)}</strong></div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-[#11140f] p-5">
              <h2 className="mb-4 font-semibold">Condições de pagamento</h2>
              <div className="grid gap-4 sm:grid-cols-2">{field("Forma de pagamento","payment_method")}{field("Status","payment_status_label")}{field("Valor recebido","payment_received")}{field("Data informada","payment_date")}</div>
            </section>
            <div className="rounded-xl border border-[#ef7d18]/20 bg-[#ef7d18]/[.06] p-4 text-xs leading-relaxed text-white/65">O servidor gera o PDF original, incorpora o QR Code exclusivo, calcula o SHA-256 do arquivo final e registra o documento e a trilha de auditoria. A validação online não equivale a assinatura digital ICP-Brasil.</div>
            {message && <p className="rounded-xl border border-white/10 bg-white/[.05] p-4 text-sm">{message}</p>}
            {verificationUrl && <div className="space-y-3 rounded-2xl border border-[#6eaa67]/30 bg-[#6eaa67]/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-[#b9e6b1]"><FileCheck2 className="h-5 w-5"/> Documento registrado com sucesso</div>
              <p className="break-all text-sm"><a className="text-[#ffb36b] underline" href={verificationUrl} target="_blank" rel="noreferrer">{verificationUrl}</a></p>
              <p className="break-all font-mono text-[10px] text-white/50">SHA-256: {hash}</p>
              <button type="button" onClick={downloadPdf} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef7d18] px-4 py-3 font-semibold text-black"><Download className="h-5 w-5"/> Baixar PDF oficial</button>
            </div>}
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef7d18] px-4 py-4 font-semibold text-black disabled:opacity-50">{busy?<LoaderCircle className="h-5 w-5 animate-spin"/>:<FileCheck2 className="h-5 w-5"/>}{busy?"Gerando e registrando...":"Gerar ordem oficial e registrar autenticidade"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
