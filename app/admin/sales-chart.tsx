"use client";

import { useMemo, useState } from "react";
import { BarChart3, TrendingUp, ShoppingBag, Clock3, CheckCircle2, XCircle } from "lucide-react";

type Order = { created_at: string; total: number; status: string };
type Period = "7" | "30" | "90";

const money = (value: number) =>
  `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const normalize = (status: string) => (status || "").trim().toLowerCase();
const cancelled = (status: string) => ["cancelado", "cancelada", "canceled", "cancelled"].includes(normalize(status));

export default function SalesChart({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<Period>("7");
  const chart = useMemo(() => {
    const days = Number(period);
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { key: date.toLocaleDateString("pt-BR"), date, revenue: 0, count: 0 };
    });
    const byDay = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    for (const order of orders) {
      if (cancelled(order.status)) continue;
      const key = new Date(order.created_at).toLocaleDateString("pt-BR");
      const bucket = byDay.get(key);
      if (bucket) {
        bucket.revenue += Number(order.total || 0);
        bucket.count += 1;
      }
    }
    return buckets;
  }, [orders, period]);

  const maxRevenue = Math.max(1, ...chart.map((day) => day.revenue));
  const total = chart.reduce((sum, day) => sum + day.revenue, 0);
  const count = chart.reduce((sum, day) => sum + day.count, 0);
  const statusGroups = useMemo(() => {
    const groups = [
      { label: "Aguardando", match: (s: string) => ["pendente", "aguardando", "aguardando_pagamento", "pending"].includes(normalize(s)), color: "bg-[#ef7d18]", Icon: Clock3 },
      { label: "Em andamento", match: (s: string) => ["preparando", "em preparo", "em_preparo", "confirmado", "pago", "em rota", "em_rota", "processing"].includes(normalize(s)), color: "bg-[#a7b86a]", Icon: ShoppingBag },
      { label: "Concluídos", match: (s: string) => ["entregue", "concluido", "concluído", "finalizado", "completed", "delivered"].includes(normalize(s)), color: "bg-sky-400", Icon: CheckCircle2 },
      { label: "Cancelados", match: cancelled, color: "bg-rose-400", Icon: XCircle },
    ];
    return groups.map((group) => ({ ...group, count: orders.filter((order) => group.match(order.status)).length }));
  }, [orders]);

  return (
    <section className="mt-6 grid gap-3 xl:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/40">
              <BarChart3 size={15} className="text-[#a7b86a]" /> Desempenho de vendas
            </div>
            <div className="mt-2 text-2xl font-black">{money(total)}</div>
            <p className="mt-1 text-xs text-white/40">Total registrado · {count} pedidos não cancelados</p>
          </div>
          <div className="flex rounded-full border border-white/10 bg-black/20 p-1" aria-label="Período do gráfico">
            {([{ value: "7", label: "7 dias" }, { value: "30", label: "30 dias" }, { value: "90", label: "90 dias" }] as const).map((option) => (
              <button key={option.value} type="button" onClick={() => setPeriod(option.value)} aria-pressed={period === option.value}
                className={`rounded-full px-3 py-2 text-[11px] font-black transition ${period === option.value ? "bg-[#a7b86a] text-black" : "text-white/50 hover:text-white"}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 items-end gap-2 sm:grid-cols-10 lg:grid-cols-14" role="img" aria-label={`Gráfico de vendas registradas nos últimos ${period} dias`}>
          {chart.filter((_, index) => period === "7" || index % (period === "30" ? 3 : 9) === 0 || index === chart.length - 1).map((day) => {
            const label = period === "7"
              ? day.date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
              : day.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            return <div key={day.key} className="flex min-w-0 flex-col items-center gap-2">
              <div className="text-center text-[9px] font-bold text-white/40">{day.revenue > 0 ? money(day.revenue).replace(",00", "") : "—"}</div>
              <div className="flex h-28 w-full items-end overflow-hidden rounded-t-md bg-white/[.035]">
                <div className="w-full rounded-t-md bg-gradient-to-t from-[#6f8736] to-[#b3c978] transition-all"
                  style={{ height: day.revenue > 0 ? `${Math.max(5, (day.revenue / maxRevenue) * 100)}%` : "2px" }}
                  title={`${day.key}: ${money(day.revenue)} · ${day.count} pedidos`} />
              </div>
              <div className="text-center text-[9px] font-bold capitalize text-white/45">{label}</div>
            </div>;
          })}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-white/30">
          Baseado nos pedidos carregados no painel, excluindo cancelamentos do total de vendas. Valores de pedidos registrados não confirmam recebimentos bancários.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/40">
          <ShoppingBag size={15} className="text-[#ef7d18]" /> Pedidos por status
        </div>
        <p className="mt-2 text-xs text-white/35">Distribuição dos pedidos carregados no painel</p>
        <div className="mt-5 space-y-4">
          {statusGroups.map(({ label, count: statusCount, color, Icon }) => {
            const pct = orders.length ? Math.round(statusCount / orders.length * 100) : 0;
            return <div key={label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold"><Icon size={15} className="text-white/45" />{label}</div>
                <div className="text-sm font-black">{statusCount} <span className="text-xs font-medium text-white/35">({pct}%)</span></div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[.06]"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
            </div>;
          })}
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/5 bg-white/[.025] p-3 text-[11px] leading-relaxed text-white/35">
          <TrendingUp size={14} className="mt-0.5 shrink-0 text-[#a7b86a]" />
          Status desconhecidos ou novos permanecem fora das categorias até que sejam mapeados; por isso, as categorias podem não somar 100%.
        </div>
      </div>
    </section>
  );
}
