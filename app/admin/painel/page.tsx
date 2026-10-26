"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Bell, ChevronDown, ChevronRight, CircleDollarSign, Copy, Package, ShoppingBag, Users } from "lucide-react";

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
  acquisition_source: string | null;
  acquisition_campaign: string | null;
  acquisition_medium: string | null;
  acquisition_content: string | null;
};

type Customer = {
  id: string;
  created_at: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  coupon_code: string | null;
  coupon_used: boolean;
  last_order_at: string | null;
  order_count: number;
  total_spend: number;
  birth_date: string | null;
  nutrifit_club_member: boolean;
  nutrifit_club_joined_at: string | null;
  acquisition_source: string | null;
  acquisition_campaign: string | null;
  acquisition_medium: string | null;
  acquisition_content: string | null;
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

type AcquisitionEvent = {
  id: string;
  created_at: string;
  event: string;
  source: string;
  page: string | null;
  metadata: { campaign?: string | null; medium?: string | null; content?: string | null } | null;
};

type Finance = {
  id: string;
  created_at: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string | null;
  status: string;
  paid_at: string | null;
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
  const [finance, setFinance] = useState<Finance[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [inventoryPurchases, setInventoryPurchases] = useState<any[]>([]);
  const [acquisitionEvents, setAcquisitionEvents] = useState<AcquisitionEvent[]>([]);
  const [copiedLink, setCopiedLink] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"Visão geral" | "Clientes" | "Financeiro">("Visão geral");
  const [darkMode, setDarkMode] = useState(false);
  const [period, setPeriod] = useState("Últimos 7 dias");
  const [tableFilter, setTableFilter] = useState("");

  async function load(t: string) {
    try {
      setError("");
      const [o, c, a, f, ae, inv, purchases] = await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=id,created_at,customer_name,item_count,total,status,items,acquisition_source,acquisition_campaign,acquisition_medium,acquisition_content&order=created_at.desc&limit=500`, t),
        request(`${URL}/rest/v1/customer_profiles?select=id,created_at,name,whatsapp,email,marketing_consent,marketing_consent_at,coupon_code,coupon_used,last_order_at,order_count,total_spend,birth_date,nutrifit_club_member,nutrifit_club_joined_at,acquisition_source,acquisition_campaign,acquisition_medium,acquisition_content&order=created_at.desc&limit=500`, t),
        request(`${URL}/rest/v1/inventory_purchase_alerts?select=item_id,name,current_quantity,minimum_quantity,required_quantity,shortage_quantity,status&limit=100`, t),
        request(`${URL}/rest/v1/financial_transactions?select=id,created_at,type,category,description,amount,payment_method,status,paid_at&order=created_at.desc&limit=500`, t),
        request(`${URL}/rest/v1/acquisition_events?select=id,created_at,event,source,page,metadata&order=created_at.desc&limit=1000`, t),
        request(`${URL}/rest/v1/inventory_items?select=id,name,unit,current_quantity,minimum_quantity,average_cost,active&active=eq.true&limit=500`, t),
        request(`${URL}/rest/v1/inventory_purchases?select=id,created_at,total_cost,status&order=created_at.desc&limit=200`, t),
      ]);
      setOrders(o || []);
      setCustomers(c || []);
      setAlerts(a || []);
      setFinance(f || []);
      setInventoryItems(inv || []);
      setInventoryPurchases(purchases || []);
      setAcquisitionEvents(ae || []);
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
  const periodStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (period === "Últimos 7 dias") start.setDate(start.getDate() - 6);
    else if (period === "Este mês") start.setDate(1);
    else if (period === "Últimos 30 dias") start.setDate(start.getDate() - 29);
    return start;
  }, [period]);
  const periodEnd = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }, [today]);
  const inSelectedPeriod = (value: string | null | undefined) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date >= periodStart && date <= periodEnd;
  };
  const periodOrders = orders.filter(o => inSelectedPeriod(o.created_at));
  const periodRevenue = periodOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const periodMeals = periodOrders.reduce((sum, o) => sum + Number(o.item_count || 0), 0);
  const ticket = periodOrders.length ? periodRevenue / periodOrders.length : 0;
  // Pedidos registrados não equivalem automaticamente a dinheiro recebido.
  const periodReceived = periodOrders
    .filter(o => o.status === "pago_recebido")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + Number(item.current_quantity || 0) * Number(item.average_cost || 0), 0);
  const lowStockItems = inventoryItems.filter(item => Number(item.minimum_quantity || 0) > 0 && Number(item.current_quantity || 0) <= Number(item.minimum_quantity || 0));
  const purchaseSpend30Days = inventoryPurchases.filter(p => p.status === "recebida" && Date.now() - new Date(p.created_at).getTime() <= 30 * 86400000).reduce((sum, p) => sum + Number(p.total_cost || 0), 0);
  const pending = orders.filter(o => ["novo", "enviado_whatsapp", "confirmado", "pago_recebido"].includes(o.status)).length;
  const newCustomers = customers.filter(c => dayKey(new Date(c.created_at)) === today).length;
  const clubMembers = customers.filter(c => c.nutrifit_club_member);
  const clubNewToday = clubMembers.filter(c => dayKey(new Date(c.nutrifit_club_joined_at || c.created_at)) === today).length;
  const clubWithoutPurchase = clubMembers.filter(c => Number(c.order_count || 0) === 0 && c.marketing_consent && c.email);

  const campaignLinks = [
    {
      label: "Instagram • Bio",
      description: "Link principal do perfil",
      url: "https://nutrifitjf.com.br/?utm_source=instagram&utm_medium=bio&utm_campaign=perfil",
    },
    {
      label: "Instagram • Reels",
      description: "Para Reels de divulgação",
      url: "https://nutrifitjf.com.br/?utm_source=instagram&utm_medium=reel&utm_campaign=combo&utm_content=reel_combo",
    },
    {
      label: "Instagram • Stories",
      description: "Para Stories com chamada para pedido",
      url: "https://nutrifitjf.com.br/?utm_source=instagram&utm_medium=story&utm_campaign=combo&utm_content=story_combo",
    },
    {
      label: "WhatsApp • Status",
      description: "Para publicar no Status",
      url: "https://nutrifitjf.com.br/?utm_source=whatsapp&utm_medium=status&utm_campaign=combo",
    },
    {
      label: "Google • Perfil",
      description: "Para o Perfil da Empresa no Google",
      url: "https://nutrifitjf.com.br/?utm_source=google&utm_medium=perfil&utm_campaign=local",
    },
  ];

  const acquisition = useMemo(() => {
    const sources = new Set<string>([
      ...customers.map(c => c.acquisition_source || "direct"),
      ...orders.map(o => o.acquisition_source || "direct"),
      ...acquisitionEvents.map(e => e.source || "direct"),
    ]);
    return Array.from(sources).map(source => {
      const customerCount = customers.filter(c => (c.acquisition_source || "direct") === source).length;
      const sourceOrders = orders.filter(o => (o.acquisition_source || "direct") === source);
      const revenue = sourceOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const leads = acquisitionEvents.filter(e => e.event === "lead_captured" && (e.source || "direct") === source).length;
      const visits = acquisitionEvents.filter(e => e.event === "site_visit" && (e.source || "direct") === source).length;
      return { source, customerCount, orders: sourceOrders.length, revenue, leads, visits };
    }).sort((a, b) => b.revenue - a.revenue || b.customerCount - a.customerCount);
  }, [customers, orders, acquisitionEvents]);

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

  const formatMoney = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  const recentFinance = finance.filter(f => !tableFilter || [f.description, f.category, f.type, f.status].join(" ").toLowerCase().includes(tableFilter.toLowerCase()));
  const visibleCustomers = customers.filter(c => !tableFilter || [c.name, c.whatsapp || "", c.email || ""].join(" ").toLowerCase().includes(tableFilter.toLowerCase()));
  const visibleOrders = orders.filter(o => !tableFilter || [o.customer_name || "", o.status, o.id].join(" ").toLowerCase().includes(tableFilter.toLowerCase()));
  const surface = darkMode ? "bg-[#151a24] text-[#f3f4f6]" : "bg-[#F6F7F9] text-[#111827]";
  const card = darkMode ? "bg-[#1d2430] border-[#303949]" : "bg-white border-[#E8EAEE]";
  if (loading) return <main className={`min-h-screen ${surface} p-10 text-center`}>Carregando dados reais da NutriFit…</main>;

  return (
    <main className={`min-h-screen ${surface}`}>
      <style jsx global>{`
        .nf-scroll::-webkit-scrollbar{height:7px;width:7px}.nf-scroll::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:8px}
        .nf-focus:focus-visible{outline:3px solid #3B6BF566;outline-offset:2px}
        @keyframes nf-in{from{opacity:0;transform:translateY(5px);filter:blur(2px)}to{opacity:1;transform:none;filter:blur(0)}}
        .nf-in{animation:nf-in .22s ease-out both}
      `}</style>
      <div className="flex min-h-screen">
        <aside className={`hidden w-[200px] shrink-0 flex-col border-r md:flex ${card} `}>
          <div className="flex items-center gap-2 px-4 py-5"><img src="/images/nutrifit-logo-icon.svg" className="h-7 w-7" alt="NutriFit"/><b className="text-[17px] tracking-tight">NutriFit</b><button className="ml-auto text-[#9ca3af]" aria-label="Recolher menu">◧</button></div>
          <div className="px-5 pb-2 text-[10px] font-bold tracking-[.13em] text-[#9ca3af]">MENU</div>
          <nav className="grid gap-1 px-2">
            {(["Visão geral","Clientes","Financeiro"] as const).map((item,i)=><button key={item} onClick={()=>setView(item)} className={`nf-focus flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] transition-colors ${view===item?(darkMode?"bg-[#303949] font-semibold":"bg-[#F1F2F5] font-semibold"):"text-[#6b7280] hover:bg-black/[.035]"}`}><span className="w-4 text-center">{["▦","♙","▤"][i]}</span>{item}</button>)}
            <a href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] text-[#6b7280] hover:bg-black/[.035]"><span className="w-4 text-center">←</span>Administração</a>
          </nav>
          <div className="mt-7 px-5 pb-2 text-[10px] font-bold tracking-[.13em] text-[#9ca3af]">SEGMENTOS</div>
          <div className="grid gap-1 px-4 text-[12px] text-[#6b7280]"><div className="flex items-center gap-2 py-2"><i className="h-2 w-2 rounded-full bg-[#e6a23c]"/>Escritórios</div><div className="flex items-center gap-2 py-2"><i className="h-2 w-2 rounded-full bg-[#48a9a6]"/>Clínicas</div><div className="flex items-center gap-2 py-2"><i className="h-2 w-2 rounded-full bg-[#9b87d9]"/>Academias</div></div>
          <div className="mt-auto border-t p-3" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}><button onClick={()=>setDarkMode(!darkMode)} className="flex w-full items-center justify-between px-2 py-3 text-[11px] text-[#6b7280]">Modo escuro <span className={`rounded-full px-2 py-1 ${darkMode?"bg-[#3B6BF5] text-white":"bg-[#F1F2F5]"}`}>{darkMode?"Ligado":"Desligado"}</span></button><div className="grid grid-cols-2 gap-2"><button onClick={()=>alert("Convites de equipe devem ser configurados pelo administrador.")} className="rounded-lg border px-2 py-2 text-[11px]" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}>♧ Convidar</button><button onClick={()=>alert("Ajuda: escolha uma seção do menu e use a busca para filtrar os dados.")} className="rounded-lg border px-2 py-2 text-[11px]" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}>? Ajuda</button></div></div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className={`flex min-h-[62px] flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-7 ${card}`}>
            <div className="relative w-full max-w-[260px]"><span className="absolute left-3 top-2 text-lg text-[#9ca3af]">⌕</span><input value={tableFilter} onChange={e=>setTableFilter(e.target.value)} placeholder="Buscar..." className="nf-focus w-full rounded-lg border bg-transparent py-2 pl-9 pr-3 text-[12px]" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}/></div>
            <div className="flex items-center gap-3 text-[11px] text-[#6b7280]"><span className="hidden lg:inline">Última atualização: {new Date().toLocaleDateString("pt-BR")}</span><button className="relative rounded-lg border px-2.5 py-2" style={{borderColor:darkMode?"#303949":"#E8EAEE"}} aria-label="Notificações">♧<i className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500"/></button><button className="rounded-lg border px-2.5 py-2" style={{borderColor:darkMode?"#303949":"#E8EAEE"}} aria-label="Configurações">⚙</button><span className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}><span className="grid h-6 w-6 place-items-center rounded-full bg-[#e6e9f3] font-bold text-[#4c5b88]">NF</span><b>NutriFit Admin</b>⌄</span></div>
          </header>
          <div className="mx-auto max-w-[1500px] p-4 md:p-7">
            {error&&<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center"><h1 className="text-[22px] font-semibold tracking-tight">{view}</h1><div className="flex flex-wrap items-center gap-2"><select value={period} onChange={e=>setPeriod(e.target.value)} className={`nf-focus h-[34px] rounded-lg border px-3 text-[11px] ${darkMode?"bg-[#1d2430]":"bg-white"}`} style={{borderColor:darkMode?"#303949":"#E8EAEE"}}><option>Hoje</option><option>Últimos 7 dias</option><option>Este mês</option><option>Últimos 30 dias</option></select><span className="text-[11px] text-[#6b7280]">comparar com</span><button onClick={()=>alert("A comparação de período é demonstrativa nesta versão.")} className={`h-[34px] rounded-lg border px-3 text-[11px] ${darkMode?"border-[#303949]":"border-[#E8EAEE]"}`}>Período anterior⌄</button><button onClick={()=>alert(view==="Visão geral"?"Nova proposta: utilize a área administrativa para registrar.":view==="Clientes"?"Novo cliente: cadastre pela área administrativa.":"Nova fatura: registre em Financeiro.")} className="h-8 rounded-lg bg-[#3B6BF5] px-3 text-[12px] font-medium text-white">＋ {view==="Visão geral"?"Nova proposta":view==="Clientes"?"Novo cliente":"Nova fatura"}</button></div></div>
            <section className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {(view==="Visão geral"?[
                ["Refeições nos pedidos",periodMeals.toLocaleString("pt-BR"),period+" · dados registrados","#b46cdb","▣"],
                ["Pedidos no período",periodOrders.length.toLocaleString("pt-BR"),period+" · registros encontrados","#4f6fe8","▤"],
                ["Ticket médio",formatMoney(ticket),period+" · por pedido","#315e4c","◷"],
                ["Faturamento registrado",formatMoney(periodRevenue),period+" · pedidos registrados","#f16b2c","⌁"]
              ]:view==="Clientes"?[
                ["Clientes cadastrados",customers.length.toLocaleString("pt-BR"),"Registros reais","#b46cdb","♙"],
                ["Novos hoje",newCustomers.toLocaleString("pt-BR"),"Pelo cadastro","#4f6fe8","＋"],
                ["Membros NutriFit Club",clubMembers.length.toLocaleString("pt-BR"),"Cadastros com adesão","#315e4c","✓"],
                ["Total gasto registrado",formatMoney(customers.reduce((n,c)=>n+Number(c.total_spend||0),0)),"Soma dos perfis","#f16b2c","R$"]
              ]:[
                ["Faturamento de pedidos",formatMoney(orders.reduce((n,o)=>n+Number(o.total||0),0)),"Total registrado","#b46cdb","▣"],
                ["Recebido confirmado",formatMoney(finance.filter(f=>f.type!=="despesa"&&f.status==="pago").reduce((n,f)=>n+Number(f.amount||0),0)),"Lançamentos pagos","#4f6fe8","✓"],
                ["A receber",formatMoney(finance.filter(f=>f.type!=="despesa"&&f.status!=="pago").reduce((n,f)=>n+Number(f.amount||0),0)),"Lançamentos não pagos","#315e4c","◷"],
                ["Despesas registradas",formatMoney(finance.filter(f=>f.type==="despesa").reduce((n,f)=>n+Number(f.amount||0),0)),"Não equivale a lucro","#f16b2c","↘"]
              ]).map((m,i)=><article key={m[0]} className={`nf-in relative min-h-[108px] rounded-xl border p-4 ${card}`} style={{animationDelay:`${i*55}ms`}}><span className="text-[11px] text-[#6b7280]">{m[0]}</span><button className="absolute right-3 top-1 text-lg text-[#9ca3af]" aria-label="Opções">⋮</button><div className="my-2 text-[27px] font-semibold tracking-tight">{m[1]}</div><div className="text-[10px] text-[#6b7280]">{m[2]}</div><span className="absolute bottom-2 right-2 grid h-[22px] w-[22px] place-items-center rounded-md text-[12px] text-white" style={{background:m[3]}}>{m[4]}</span></article>)}
            </section>
            <section className={`mb-3 rounded-xl border p-4 md:p-5 ${card}`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[13px] font-semibold">{view==="Visão geral"?"Desempenho geral":view==="Clientes"?"Evolução de clientes":"Faturamento mensal"} <span className="grid h-4 w-4 place-items-center rounded-full border text-[9px] text-[#9ca3af]">i</span></div><div className="flex items-center gap-2"><button onClick={()=>setPeriod("Últimos 7 dias")} className="rounded-lg border px-3 py-1.5 text-[11px]" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}>7 dias</button><span className="text-[11px] text-[#6b7280]">Dados reais por dia</span></div></div>
              <div className="nf-scroll overflow-x-auto"><div className="flex h-[230px] min-w-[520px] gap-3 border-b pb-2" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}>
                {week.map((d,i)=><div key={d.label} className="flex min-w-0 flex-1 flex-col justify-end gap-2"><div className="text-center text-[10px] text-[#6b7280]">{d.value?formatMoney(d.value):"—"}</div><div className="relative flex flex-1 items-end rounded-t-md bg-[#3B6BF5]/[.07]"><div className="w-full rounded-t-md bg-gradient-to-b from-[#B9C6FB] to-[#8EA3F6] transition-all duration-300" style={{height:`${Math.max(3,d.value/maxWeek*100)}%`}}/></div><div className="text-center text-[10px] text-[#6b7280]">{d.label}</div></div>)}
              </div></div>
              <p className="mt-3 text-[10px] text-[#9ca3af]">Gráfico baseado nos pedidos registrados nos últimos sete dias. Valores ausentes são exibidos como zero; não representa meta mensal.</p>
            </section>
            <section className={`overflow-hidden rounded-xl border ${card}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}><div className="flex flex-wrap gap-4 text-[11px] font-medium"><button onClick={()=>setView("Visão geral")} className={view==="Visão geral"?"border-b-2 border-black pb-1 font-bold": "pb-1 text-[#6b7280]"}>Propostas / Pedidos</button><button onClick={()=>setView("Clientes")} className={view==="Clientes"?"border-b-2 border-black pb-1 font-bold":"pb-1 text-[#6b7280]"}>Clientes</button><button onClick={()=>setView("Financeiro")} className={view==="Financeiro"?"border-b-2 border-black pb-1 font-bold":"pb-1 text-[#6b7280]"}>Financeiro</button></div><span className="text-[10px] text-[#6b7280]">{view==="Visão geral"?visibleOrders.length:view==="Clientes"?visibleCustomers.length:recentFinance.length} registros encontrados</span></div>
              <div className="nf-scroll overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-[11px]"><thead className={darkMode?"bg-[#202b3b] text-[#9ca3af]":"bg-[#f8f9fb] text-[#737b89]"}><tr>{(view==="Visão geral"?["Pedido / cliente","Criado em","Itens","Valor","Status"]:view==="Clientes"?["Cliente","Desde","Segmento","Pedidos","Total gasto"]:["Descrição","Data","Tipo","Valor","Status"]).map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody>
              {view==="Visão geral"&&visibleOrders.slice(0,20).map(o=><tr key={o.id} className="border-t" style={{borderColor:darkMode?"#303949":"#edf0f3"}}><td className="h-12 px-4 font-medium">{o.customer_name||"Cliente"}<span className="ml-1 rounded bg-[#f0f1f4] px-1 py-0.5 text-[9px] text-[#858b96]">pedido</span></td><td className="px-4 text-[#6b7280]">{new Date(o.created_at).toLocaleString("pt-BR")}</td><td className="px-4">{o.item_count||0}</td><td className="px-4">{formatMoney(Number(o.total||0))}</td><td className="px-4"><span className={o.status==="pago_recebido"?"text-emerald-600":"text-[#6b7280]"}>{o.status}</span></td></tr>)}
              {view==="Clientes"&&visibleCustomers.slice(0,50).map(c=><tr key={c.id} className="border-t" style={{borderColor:darkMode?"#303949":"#edf0f3"}}><td className="h-12 px-4 font-medium">{c.name}</td><td className="px-4 text-[#6b7280]">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td><td className="px-4">{c.nutrifit_club_member?"NutriFit Club":"Cliente"}</td><td className="px-4">{c.order_count}</td><td className="px-4">{formatMoney(Number(c.total_spend||0))}</td></tr>)}
              {view==="Financeiro"&&recentFinance.slice(0,50).map(f=><tr key={f.id} className="border-t" style={{borderColor:darkMode?"#303949":"#edf0f3"}}><td className="h-12 px-4 font-medium">{f.description}</td><td className="px-4 text-[#6b7280]">{new Date(f.created_at).toLocaleDateString("pt-BR")}</td><td className="px-4">{f.type} · {f.category}</td><td className="px-4">{formatMoney(Number(f.amount||0))}</td><td className="px-4"><span className={f.status==="pago"?"text-emerald-600":f.status==="atrasado"?"text-red-500":"text-[#6b7280]"}>{f.status}</span></td></tr>)}
              {((view==="Visão geral"&&!visibleOrders.length)||(view==="Clientes"&&!visibleCustomers.length)||(view==="Financeiro"&&!recentFinance.length))&&<tr><td colSpan={5} className="p-8 text-center text-[#9ca3af]">Nenhum registro encontrado para essa busca.</td></tr>}
              </tbody></table></div>
            </section>
            {view==="Visão geral"&&<section className={`mt-3 grid gap-3 xl:grid-cols-2`}><div className={`rounded-xl border p-4 ${card}`}><h2 className="mb-3 text-[13px] font-semibold">Estoque e compras</h2><div className="grid grid-cols-2 gap-3"><div><div className="text-xl font-semibold">{inventoryItems.length}</div><div className="text-[11px] text-[#6b7280]">Insumos ativos</div></div><div><div className="text-xl font-semibold">{formatMoney(inventoryValue)}</div><div className="text-[11px] text-[#6b7280]">Valor estimado em estoque</div></div><div><div className="text-xl font-semibold">{lowStockItems.length}</div><div className="text-[11px] text-[#6b7280]">Itens no mínimo/abaixo</div></div><div><div className="text-xl font-semibold">{formatMoney(purchaseSpend30Days)}</div><div className="text-[11px] text-[#6b7280]">Compras recebidas · 30 dias</div></div></div>{lowStockItems.length>0&&<div className="mt-4 border-t pt-3 text-[11px] text-[#6b7280]" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}>Conferir: {lowStockItems.slice(0,8).map(i=>i.name).join(", ")}</div>}</div><div className={`rounded-xl border p-4 ${card}`}><h2 className="mb-3 text-[13px] font-semibold">Origem dos clientes e vendas</h2><div className="nf-scroll overflow-x-auto"><table className="w-full min-w-[440px] text-left text-[11px]"><thead className="text-[#6b7280]"><tr><th className="py-2">Origem</th><th>Clientes</th><th>Pedidos</th><th>Faturamento</th></tr></thead><tbody>{acquisition.slice(0,6).map(row=><tr key={row.source} className="border-t" style={{borderColor:darkMode?"#303949":"#E8EAEE"}}><td className="py-2 capitalize">{row.source}</td><td>{row.customerCount}</td><td>{row.orders}</td><td>{formatMoney(row.revenue)}</td></tr>)}</tbody></table></div></div></section>}
            <p className="mt-4 text-[10px] leading-relaxed text-[#9ca3af]">Os valores apresentados vêm das tabelas atuais do Supabase. Pedidos registrados não equivalem automaticamente a recebimentos; faturamento e saldo dependem dos lançamentos existentes. Nenhum dado demonstrativo foi lançado no banco.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
