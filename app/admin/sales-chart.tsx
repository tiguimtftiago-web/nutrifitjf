"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

type Order = {
  created_at: string;
  total: number;
  status: string;
};

const money = (value: number) =>
  `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SalesChart({ orders }: { orders: Order[] }) {
  const days = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = date.toLocaleDateString("pt-BR");
      const dayOrders = orders.filter((order) =>
        new Date(order.created_at).toLocaleDateString("pt-BR") === key &&
        order.status !== "cancelado"
      );
      return {
        key,
        label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        revenue: dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        count: dayOrders.length,
      };
    });
  }, [orders]);

  const maxRevenue = Math.max(1, ...days.map((day) => day.revenue));
  const total = days.reduce((sum, day) => sum + day.revenue, 0);
  const count = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-white/40">
            <BarChart3 size={15} className="text-[#a7b86a]" /> Desempenho de vendas
          </div>
          <div className="mt-2 text-2xl font-black">{money(total)}</div>
          <p className="mt-1 text-xs text-white/40">Total registrado nos últimos 7 dias · {count} pedidos não cancelados</p>
        </div>
        <div className="rounded-2xl border border-[#a7b86a]/20 bg-[#a7b86a]/10 p-3 text-[#c4d38c]">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 items-end gap-2" role="img" aria-label="Gráfico de faturamento registrado por dia nos últimos sete dias">
        {days.map((day) => (
          <div key={day.key} className="flex min-w-0 flex-col items-center gap-2">
            <div className="text-center text-[10px] font-bold text-white/45">{day.revenue > 0 ? money(day.revenue).replace(",00", "") : "—"}</div>
            <div className="flex h-32 w-full items-end overflow-hidden rounded-t-lg bg-white/[.035]">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#6f8736] to-[#b3c978] transition-all"
                style={{ height: day.revenue > 0 ? `${Math.max(5, (day.revenue / maxRevenue) * 100)}%` : "2px" }}
                title={`${day.key}: ${money(day.revenue)} · ${day.count} pedidos`}
              />
            </div>
            <div className="text-[10px] font-bold capitalize text-white/50">{day.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-white/30">
        Valores calculados a partir dos pedidos carregados no painel, excluindo cancelamentos. Este gráfico representa valores de pedidos registrados, não confirma recebimentos bancários.
      </p>
    </section>
  );
}
