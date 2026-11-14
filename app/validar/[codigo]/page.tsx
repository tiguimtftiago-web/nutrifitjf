"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, ShieldAlert, FileCheck2, Copy, LoaderCircle, ExternalLink } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Verification = {
  valid: boolean;
  status: "valid" | "cancelled" | "superseded" | "not_found" | "unavailable" | "invalid";
  message: string;
  document?: {
    document_number: string;
    verification_code: string;
    document_type: string;
    issued_at: string;
    issuer_name: string;
    buyer_name: string;
    total_amount: number | null;
    currency: string;
    payment_status: string;
    document_data: { items: Array<{description?:string;quantity?:number;unit_price?:number}>; description: string | null; public_document_number?: string };
    pdf_sha256: string;
    signature_type: string;
    signature_status: string;
  };
};

const money = (value: number | null) =>
  value === null ? "Não informado" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const labels: Record<string, string> = {
  purchase_order: "Ordem de compra",
  quote: "Orçamento",
  production_order: "Ordem de produção",
  commercial_receipt: "Comprovante comercial",
  other: "Documento comercial",
};

const paymentLabels: Record<string, string> = {
  not_informed: "Não informado",
  pending: "Pendente",
  paid: "Pago",
  partially_paid: "Parcialmente pago",
  cancelled: "Cancelado",
};

export default function ValidateOfficialDocumentPage() {
  const params = useParams<{ codigo: string }>();
  const code = decodeURIComponent(params.codigo || "").toUpperCase();
  const [result, setResult] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${SUPABASE_URL}/functions/v1/official-documents?code=${encodeURIComponent(code)}`, {
      headers: { apikey: SUPABASE_KEY },
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok && response.status !== 404) throw new Error(data.message || "Falha na consulta.");
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setResult({ valid: false, status: "unavailable", message: "Não foi possível consultar o registro oficial. Tente novamente mais tarde." });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [code]);

  const copyHash = async () => {
    if (!result?.document?.pdf_sha256) return;
    await navigator.clipboard.writeText(result.document.pdf_sha256);
    setCopied(true);
  };

  return (
    <main className="min-h-screen bg-[#080a07] px-4 py-8 text-white sm:py-14">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#8b8b32] bg-[#16190d] text-[#ef7d18]">
            <span className="text-xl font-black">NF</span>
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide">NUTRIFIT</p>
            <p className="text-xs uppercase tracking-[.18em] text-white/50">Central de autenticidade documental</p>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#11140f] p-5 shadow-2xl sm:p-8">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-white/60">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#ef7d18]" />
              Consultando registro oficial...
            </div>
          ) : result?.valid && result.document ? (
            <>
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#6eaa67]/30 bg-[#6eaa67]/10 p-4">
                <ShieldCheck className="h-9 w-9 shrink-0 text-[#8ac47e]" />
                <div>
                  <p className="font-semibold text-[#b9e6b1]">Documento localizado no registro oficial</p>
                  <p className="text-sm text-white/65">Os dados abaixo correspondem ao registro de emissão da NutriFit.</p>
                </div>
              </div>
              <p className="mb-1 text-xs uppercase tracking-widest text-white/45">{labels[result.document.document_type] || "Documento comercial"}</p>
              <h1 className="mb-6 text-2xl font-bold">{result.document.document_data.public_document_number || result.document.document_number}</h1>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><dt className="text-xs text-white/45">Emitido por</dt><dd className="mt-1 font-medium">NutriFit</dd></div>
                <div><dt className="text-xs text-white/45">Comprador</dt><dd className="mt-1 font-medium">{result.document.buyer_name}</dd></div>
                <div><dt className="text-xs text-white/45">Data de emissão</dt><dd className="mt-1 font-medium">{new Date(result.document.issued_at).toLocaleString("pt-BR")}</dd></div>
                <div><dt className="text-xs text-white/45">Valor registrado</dt><dd className="mt-1 font-medium">{money(result.document.total_amount)}</dd></div>
                <div><dt className="text-xs text-white/45">Pagamento informado</dt><dd className="mt-1 font-medium">{paymentLabels[result.document.payment_status] || result.document.payment_status}</dd></div>
                <div><dt className="text-xs text-white/45">Código de validação</dt><dd className="mt-1 font-mono font-semibold text-[#f49a4f]">{result.document.verification_code}</dd></div>
              </dl>
              {result.document.document_data.description && (
                <div className="mt-5 rounded-xl bg-white/[.04] p-4">
                  <p className="mb-1 text-xs text-white/45">Descrição</p>
                  <p className="text-sm">{result.document.document_data.description}</p>
                </div>
              )}
              {result.document.document_data.items?.length > 0 && (
                <div className="mt-5 rounded-xl bg-white/[.04] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">Itens registrados</p>
                  <div className="space-y-2">
                    {result.document.document_data.items.map((item,index) => (
                      <div key={index} className="flex items-start justify-between gap-3 border-b border-white/10 pb-2 text-sm last:border-0 last:pb-0">
                        <span>{item.description || "Item"} <span className="text-white/45">· {item.quantity || 0} un.</span></span>
                        <span className="whitespace-nowrap font-medium">{money((Number(item.quantity)||0)*(Number(item.unit_price)||0))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Integridade do arquivo (SHA-256)</p>
                  <button onClick={copyHash} className="inline-flex items-center gap-1 text-xs text-[#f49a4f]">
                    <Copy className="h-3.5 w-3.5" /> {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="break-all rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-white/65">{result.document.pdf_sha256}</p>
                <p className="mt-2 text-xs text-white/45">O hash identifica o PDF original armazenado no registro. Para confirmar que uma cópia recebida é idêntica, compare o SHA-256 dessa cópia com este código.</p>
              </div>
              <div className="mt-5 rounded-xl border border-[#ef7d18]/25 bg-[#ef7d18]/[.06] p-4 text-sm">
                <p className="font-semibold text-[#ffb36b]">Assinatura digital</p>
                <p className="mt-1 text-white/65">{result.document.signature_type === "icp_brasil" ? "Há um registro de assinatura ICP-Brasil associado. A validação criptográfica deve ser conferida no validador oficial." : "Este documento foi registrado com hash e validação online, mas não possui assinatura digital ICP-Brasil."}</p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-[#ef7d18]" />
              <h1 className="text-xl font-bold">Não foi possível confirmar o documento</h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/60">{result?.message || "Código não localizado."}</p>
              <p className="mt-5 font-mono text-sm text-white/45">{code}</p>
            </div>
          )}
        </section>
        <footer className="mt-6 flex items-center justify-between gap-3 text-xs text-white/40">
          <span>NutriFit · Juiz de Fora/MG</span>
          <a href="https://www.nutrifitjf.com.br" className="inline-flex items-center gap-1 hover:text-white">Site oficial <ExternalLink className="h-3 w-3" /></a>
        </footer>
      </div>
    </main>
  );
}
