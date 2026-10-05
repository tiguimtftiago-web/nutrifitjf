"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle, ArrowRight, BarChart3, Bell, Building2, ChevronRight,
  CircleDollarSign, ClipboardList, Factory, Package, ShoppingBag, Truck, Users
} from "lucide-react";

const money=(v:number)=>`R$ ${v.toFixed(2).replace(".",",")}`;

export default function DashboardPreview(){
  const [attention,setAttention]=useState(true);
  const [greeting,setGreeting]=useState("Bom dia");

  useEffect(()=>{
    const hour=new Date().getHours();
    setGreeting(hour>=18 ? "Boa noite" : hour>=12 ? "Boa tarde" : "Bom dia");
  },[]);
  const actions=[
    {label:"Novo pedido",icon:ShoppingBag},
    {label:"Entrada de estoque",icon:Package},
    {label:"Registrar despesa",icon:CircleDollarSign},
    {label:"Lista de compras",icon:ClipboardList},
  ];
  const modules=[
    {label:"Pedidos",value:"8",sub:"2 aguardando ação",icon:ShoppingBag},
    {label:"Produção",value:"6",sub:"para hoje",icon:Factory},
    {label:"Estoque",value:"3",sub:"itens para comprar",icon:Package},
    {label:"Entregas",value:"5",sub:"em andamento",icon:Truck},
  ];
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090c08]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/images/nutrifit-logo-icon.svg" className="h-9 w-9" alt="Nutrifit"/>
            <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit</div><div className="font-black">Painel operacional</div></div>
          </div>
          <button className="rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-2 text-xs font-black text-[#d9e5a5]"><Bell size={14} className="mr-1 inline"/> Alertas ativos</button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 pb-10 sm:px-6">
        <div className="mb-6"><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Visão operacional</div><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{greeting}. O que precisa de atenção?</h1><p className="mt-2 text-sm text-white/40">Tudo que importa agora, em um único lugar.</p></div>
        {attention&&<button onClick={()=>setAttention(false)} className="mb-5 w-full rounded-3xl border border-[#ef7d18]/35 bg-[#1b120a] p-4 text-left sm:p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ef7d18]/15 text-[#ef9b55]"><AlertTriangle size={19}/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-[.16em] text-[#ef7d18]">Precisa da sua atenção</div><div className="mt-1 text-lg font-black">3 itens precisam ser comprados</div><div className="mt-3 flex flex-wrap gap-2">{["Frango • falta 8 kg","Arroz • falta 4 kg","Batata-doce • estoque baixo"].map(x=><span key={x} className="rounded-full bg-[#ef7d18]/10 px-3 py-1.5 text-xs font-bold text-[#f1b06e]">{x}</span>)}</div></div><ArrowRight size={18} className="mt-2 shrink-0 text-[#ef9b55]"/></div></button>}
        <section><div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Hoje</div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{modules.map(({label,value,sub,icon:Icon})=><div key={label} className="rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-5"><Icon size={19} className="text-[#a7b86a]"/><div className="mt-4 text-2xl font-black">{value}</div><div className="mt-1 text-sm font-bold">{label}</div><div className="mt-1 text-xs text-white/35">{sub}</div></div>)}</div></section>
        <section className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Resultado de hoje</div><div className="mt-2 text-3xl font-black">{money(487.90)}</div></div><BarChart3 className="text-[#a7b86a]" size={22}/></div><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/[.035] p-3"><div className="text-[10px] text-white/35">Vendas</div><b className="mt-1 block text-sm">{money(487.90)}</b></div><div className="rounded-2xl bg-white/[.035] p-3"><div className="text-[10px] text-white/35">Despesas</div><b className="mt-1 block text-sm">{money(126.40)}</b></div><div className="rounded-2xl bg-[#a7b86a]/10 p-3"><div className="text-[10px] text-[#a7b86a]">Resultado</div><b className="mt-1 block text-sm text-[#d9e5a5]">{money(361.50)}</b></div></div></div><div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><div className="text-xs font-black uppercase tracking-[.15em] text-white/35">Clientes</div><div className="mt-2 text-3xl font-black">42</div><div className="mt-1 text-xs text-white/35">clientes cadastrados</div><div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#a7b86a]"><Users size={15}/> 3 novos hoje</div></div></section>
        <section className="mt-6"><div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Ações rápidas</div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{actions.map(({label,icon:Icon})=><button key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d110b] p-4 text-left"><Icon size={18} className="text-[#a7b86a]"/><span className="text-xs font-black sm:text-sm">{label}</span></button>)}</div></section>
        <section className="mt-6"><div className="mb-3 text-xs font-black uppercase tracking-[.15em] text-white/35">Operação</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[["Pedidos",ShoppingBag],["Produção",Factory],["Estoque",Package],["Financeiro",CircleDollarSign],["Entregas",Truck],["B2B",Building2]].map(([label,Icon]:any)=><button key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d110b] p-4 text-left"><span className="flex items-center gap-2 text-xs font-black"><Icon size={16} className="text-[#a7b86a]"/>{label}</span><ChevronRight size={14} className="text-white/20"/></button>)}</div></section>
      </div>
    </main>
  );
}
