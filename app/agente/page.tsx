"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, ClipboardList, MessageCircle, RefreshCw, Target, TriangleAlert } from "lucide-react";

const DIAG_URL = "https://xdllpyqrbofszvallzxf.supabase.co/functions/v1/nutrifit-agent-diagnosis";
const PLAN_URL = "https://xdllpyqrbofszvallzxf.supabase.co/functions/v1/nutrifit-agent-action-plan";

type Plan = { id: string; status: string; priority: string; area: string; title: string; description: string };
type Diagnosis = {
  generatedAt: string;
  catalog: { fit350Count: number; fit350: { name: string; price: number; sizeGrams: number }[] };
  funnel7d: { events: number; sourceCounts: Record<string, number> };
  orders30d: { count: number; revenue: number; items: number };
  stock: { lowStockCount: number };
  decision: { priority: string; conversion: string; operations: string };
};

const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AgenteNutrifitPage() {
  const [runs, setRuns] = useState(0);
  const [data, setData] = useState<Diagnosis | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [d, p] = await Promise.all([
        fetch(DIAG_URL, { cache: "no-store" }),
        fetch(PLAN_URL, { cache: "no-store" }),
      ]);
      if (!d.ok || !p.ok) throw new Error("Diagnóstico do agente indisponível");
      const diagnosis = await d.json();
      const plan = await p.json();
      setData(diagnosis);
      setPlans(plan.plans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar o agente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decisions = useMemo(() => data ? [
    {
      level: "alta",
      title: data.decision.priority,
      detail: data.catalog.fit350Count
        ? `O banco possui ${data.catalog.fit350Count} produtos Fit 350 g ativos. A prioridade usa o catálogo real.`
        : "Não há Fit 350 g ativos.",
    },
    { level: "media", title: "Levar o cliente para uma ação de compra", detail: data.decision.conversion },
    {
      level: data.stock.lowStockCount ? "alta" : "ok",
      title: "Proteger a operação",
      detail: data.decision.operations,
    },
  ] : [], [data]);

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-[#ef7d18]/60 bg-black font-black text-[#a7b86a]">NF</div>
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Nutrifit</div>
            <h1 className="text-3xl font-black">Agente Central</h1>
          </div>
          <button onClick={() => { setRuns((x) => x + 1); load(); }} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Rodar ciclo
          </button>
        </header>

        <section className="mt-6 rounded-3xl border border-[#ef7d18]/20 bg-[#15120d] p-6">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ef7d18] text-black"><Bot /></div>
            <div>
              <div className="text-xs font-black uppercase tracking-[.18em] text-[#ef7d18]">Missão</div>
              <h2 className="mt-1 text-xl font-black">Observar → Analisar → Decidir → Executar → Medir → Melhorar.</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                O agente lê dados reais e gera planos de ação. A execução externa permanece protegida por aprovação humana.
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-white/30">
            Ciclos nesta sessão: {runs}{data ? ` • ${new Date(data.generatedAt).toLocaleString("pt-BR")}` : ""}
          </div>
          {error && <div className="mt-4 rounded-2xl border border-red-400/20 p-3 text-sm text-red-200">{error}</div>}
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Fit 350 g", data ? String(data.catalog.fit350Count) : "—", "produtos ativos"],
            ["Eventos 7d", data ? String(data.funnel7d.events) : "—", "aquisição"],
            ["Pedidos 30d", data ? String(data.orders30d.count) : "—", "registrados"],
            ["Estoque alerta", data ? String(data.stock.lowStockCount) : "—", "abaixo do mínimo"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
              <div className="text-xs text-white/40">{a}</div>
              <div className="mt-1 text-2xl font-black text-[#ef7d18]">{loading ? "…" : b}</div>
              <div className="text-xs text-white/30">{c}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-6">
            <div className="flex items-center gap-2"><Target className="text-[#a7b86a]" /><h2 className="text-xl font-black">Decisões</h2></div>
            <div className="mt-4 space-y-3">
              {decisions.map((d, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex gap-3">
                    {d.level === "alta" ? <TriangleAlert className="text-[#ef7d18]" /> : <CheckCircle2 className="text-[#a7b86a]" />}
                    <div><b>{d.title}</b><p className="mt-1 text-sm leading-6 text-white/45">{d.detail}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#a7b86a]/20 bg-[#a7b86a]/[.04] p-6">
            <div className="flex items-center gap-2"><MessageCircle className="text-[#a7b86a]" /><b>Leitura comercial</b></div>
            {data && <div className="mt-4 space-y-3 text-sm">
              <div><span className="text-white/40">Receita 30d</span><div className="font-black">{money(data.orders30d.revenue)}</div></div>
              <div><span className="text-white/40">Itens 30d</span><div className="font-black">{data.orders30d.items}</div></div>
              <div><span className="text-white/40">Origens 7d</span>
                {Object.entries(data.funnel7d.sourceCounts).slice(0, 4).map(([k, v]) => <div key={k} className="flex justify-between text-white/60"><span>{k}</span><span>{v}</span></div>)}
              </div>
            </div>}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[.025] p-6">
          <div className="flex items-center gap-2"><ClipboardList className="text-[#ef7d18]" /><h2 className="text-xl font-black">Plano de ação</h2></div>
          <p className="mt-1 text-sm text-white/40">Gerado automaticamente a partir do diagnóstico. Nenhuma ação externa é executada sem aprovação.</p>
          <div className="mt-4 space-y-3">
            {plans.length === 0 && <div className="text-sm text-white/35">Nenhum plano pendente.</div>}
            {plans.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-[#ef7d18]">{p.priority} • {p.area} • {p.status}</div>
                <div className="mt-1 font-black">{p.title}</div>
                <p className="mt-1 text-sm leading-6 text-white/45">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[.025] p-6">
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Fit 350 g • catálogo real</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.catalog.fit350 ?? []).map((x) => (
              <div key={x.name} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70">
                {x.name}<span className="float-right text-[#ef7d18]">{money(x.price)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
