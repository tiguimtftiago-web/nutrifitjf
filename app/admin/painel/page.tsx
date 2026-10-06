"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Bell, ChevronRight, CircleDollarSign, Package, ShoppingBag, Users } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Order = {
  id: string;
  created_at: string;
  customer_name: string | null;
  item_count: number | null;
  total: number | null;
  status: string;
  items: unknown;
};

type Customer = {
  id: string;
  created_at: string;
  name: string;
};

type Alert = {
  item_id: string;
  name: string;
  current_quantity: number;
  minimum_quantity: number;
  required_quantity: number;
  shortage_quantity: number;
  status: string;
};

const money = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

async function request(path: string, token: string) {
  const response = await fetch(path, {
    headers: { apikey: KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await response.text();
  if (response.status === 401) {
    sessionStorage.removeItem("nutrifit_admin_token");
    window.location.href = "/admin";
    throw new Error("Sessão expirada.");
  }
  if (!response.ok) throw new Error(text || "Erro ao carregar dados.");
  return text ? JSON.parse(text) : null;
}

function dayKey(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default function PainelNutrifit() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(t: string) {
    try {
      setError("");
      const [o, c, a] = await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=id,created_at,customer_name,item_count,total,status,items&order=created_at.desc&limit=500`, t),
        request(`${URL}/rest/v1/customer_profiles?select=id,created_at,name&order=created_at.desc&limit=500`, t),
        request(`${URL}/rest/v1/inventory_purchase_alerts?select=item_id,name,current_quantity,minimum_quantity,required_quantity,shortage_quantity,status&limit=100`, t),
      ]);
      setOrders(o || []);
      setCustomers(c || []);
      setAlerts(a || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar o painel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("nutrifit_admin_token") || "";
    if (!saved) {
      window.location.href = "/admin";
      return;
    }
    setToken(saved);
    void load(saved);
    const timer = window.setInterval(() => void load(saved), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const today = dayKey(new Date());
  const todayOrders = useMemo(() => orders.filter(o => dayKey(new Date(o.created_at)) === today), [orders, today]);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const todayMeals = todayOrders.reduce((sum, o) => sum + Number(o.item_count || 0), 0);
  const ticket = todayOrders.length ? todayRevenue / todayOrders.length : 0;
  const pending = orders.filter(o => ["novo", "enviado_whatsapp", "confirmado", "pago_recebido"].includes(o.status)).length;
  const newCustomers = customers.filter(c => dayKey(new Date(c.created_at)) === today).length;

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - index));
      const key = dayKey(d);
      const value = orders.filter(o => dayKey(new Date(o.created_at)) === key).reduce((sum, o) => sum + Number(o.total || 0), 0);
      return {
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        value,
      };
    });
  }, [orders]);

  const maxWeek = Math.max(...week.map(d => d.value), 1);

  if (loading) {
    return <main className="min-h-screen bg-[#080a07] p-6 text-white"><div className="mx-auto max-w-7xl py-16 text-center text-white/50">Carregando painel Nutrifit...</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090c08]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = "/admin"} className="rounded-xl border border-white/10 p-2 text-white/60 hover:text-white" aria-label="Voltar"><ArrowLeft size={18}/></button>
            <img src="/images/nutrifit-logo-icon.svg" className="h-9 w-9" alt="Nutrifit"/>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div>
              <div className="font-black">Painel do dono</div>
            </div>
          </div>
          <div className="rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-2 text-xs font-black text-[#d9e5a5]"><Bell size={14} className="mr-1 inline"/> Atualiza a cada 1 min</div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 pb-10 sm:px-6">
        <div className="mb-6">
          <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Visão geral</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Como está a Nutrifit hoje?</h1>
          <p className="mt-2 text-sm text-white/40">Dados reais dos pedidos, clientes e estoque disponíveis no sistema.</p>
        </div>

        {error && <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Vendas hoje", money(todayRevenue), CircleDollarSign],
            ["Pedidos hoje", String(todayOrders.length), ShoppingBag],
            ["Marmitas hoje", String(todayMeals), Package],
            ["Ticket médio", money(ticket), CircleDollarSign],
          ].map(([label, value, Icon]: any) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-5">
              <Icon size={19} className="text-[#a7b86a]"/>
              <div className="mt-4 text-2xl font-black">{value}</div>
              <div className="mt-1 text-sm font-bold">{label}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_.5fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Vendas dos últimos 7 dias</div>
                <div className="mt-1 text-sm text-white/40">O gráfico é atualizado automaticamente.</div>
              </div>
              <BarChart3 size={22} className="text-[#a7b86a]"/>
            </div>
            <div className="mt-7 flex h-52 items-end gap-2 sm:gap-4">
              {week.map((d) => (
                <div key={d.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <div className="text-center text-[10px] font-bold text-white/35">{d.value ? money(d.value).replace("R$ ", "R$") : "—"}</div>
                  <div className="relative flex flex-1 items-end">
                    <div className="w-full rounded-t-xl bg-[#a7b86a] transition-all" style={{ height: `${Math.max((d.value / maxWeek) * 100, d.value ? 5 : 2)}%` }} />
                  </div>
                  <div className="text-center text-[10px] font-black uppercase text-white/35">{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
            <div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Clientes</div>
            <div className="mt-2 text-3xl font-black">{customers.length}</div>
            <div className="mt-1 text-xs text-white/35">clientes cadastrados</div>
            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#a7b86a]"><Users size={15}/> {newCustomers} novos hoje</div>
            <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/45"><b className="text-white">{pending}</b> pedidos aguardando ação</div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Alertas importantes</div><div className="mt-1 text-sm text-white/40">O que pode exigir ação hoje.</div></div><ChevronRight size={18} className="text-white/20"/></div>
            {alerts.length === 0 ? <div className="rounded-2xl bg-[#a7b86a]/10 p-4 text-sm font-bold text-[#d9e5a5]">Nenhum alerta de compra no momento.</div> :
              <div className="space-y-2">{alerts.slice(0, 6).map(a => <div key={a.item_id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#ef7d18]/20 bg-[#1b120a] p-3"><div><div className="text-sm font-black">{a.name}</div><div className="text-xs text-white/40">Estoque {a.current_quantity} · mínimo {a.minimum_quantity}</div></div><span className="rounded-full bg-[#ef7d18]/10 px-2.5 py-1 text-[10px] font-black text-[#efb06e]">Comprar</span></div>)}</div>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6">
            <div className="mb-4"><div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Últimos pedidos</div><div className="mt-1 text-sm text-white/40">Movimentação mais recente.</div></div>
            <div className="space-y-2">{orders.slice(0, 5).map(o => <div key={o.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[.035] p-3"><div><div className="text-sm font-black">{o.customer_name || "Cliente"}</div><div className="text-xs text-white/35">{new Date(o.created_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })} · {o.item_count || 0} itens</div></div><div className="text-right"><div className="text-sm font-black">{money(Number(o.total || 0))}</div><div className="text-[10px] font-bold text-[#a7b86a]">{o.status}</div></div></div>)}</div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[#ef7d18]/20 bg-[#1b120a] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-xs font-black uppercase tracking-[.15em] text-[#ef7d18]">Próxima evolução</div><div className="mt-1 text-lg font-black">Recompra e produção inteligente</div><div className="mt-1 text-sm text-white/45">A base já está pronta para receber previsão de produção, clientes para recompra e indicadores de conversão.</div></div>
            <a href="/admin" className="rounded-full bg-[#ef7d18] px-5 py-3 text-center text-xs font-black text-black">Voltar ao painel operacional</a>
          </div>
        </section>
      </div>
    </main>
  );
}
