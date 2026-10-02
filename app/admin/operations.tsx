"use client";

import { useEffect, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Product = { id:string; name:string; category:string; line:string|null; size_grams:number|null; price:number; active:boolean; sku:string|null; };
type Finance = { id:string; created_at:string; type:string; category:string; description:string; amount:number; payment_method:string|null; status:string; paid_at:string|null; };
type Delivery = { id:string; created_at:string; customer_name:string|null; whatsapp:string|null; neighborhood:string|null; delivery_date:string|null; delivery_window:string|null; fee:number; status:string; driver_name:string|null; };
type Production = { id:string; created_at:string; quantity:number; produced_at:string; status:string; notes:string|null; };
type Coupon = { id:string; created_at:string; code:string; description:string|null; discount_type:string; discount_value:number; minimum_order_value:number; max_uses:number|null; uses_count:number; starts_at:string|null; expires_at:string|null; active:boolean; };

async function req(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string>={apikey:KEY,"Content-Type":"application/json",...((init.headers as Record<string,string>)||{})};
  headers.Authorization="Bearer "+token;
  const r=await fetch(path,{...init,headers});
  const text=await r.text();
  if(!r.ok) throw new Error(text||"Erro");
  return text?JSON.parse(text):null;
}
const money=(v:number)=>"R$ "+Number(v||0).toFixed(2).replace(".",",");
const input="rounded-xl border border-white/10 bg-white/5 px-3 py-3 outline-none";

export default function Operations({section,token}:{section:"produtos"|"financeiro"|"entregas"|"producao"|"cupons";token:string}) {
  const [products,setProducts]=useState<Product[]>([]);
  const [finance,setFinance]=useState<Finance[]>([]);
  const [deliveries,setDeliveries]=useState<Delivery[]>([]);
  const [production,setProduction]=useState<Production[]>([]);
  const [coupons,setCoupons]=useState<Coupon[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [product,setProduct]=useState({name:"",category:"marmita",line:"Fit",size_grams:"350",price:""});
  const [expense,setExpense]=useState({type:"despesa",category:"insumos",description:"",amount:"",payment_method:"Pix"});
  const [coupon,setCoupon]=useState({code:"",description:"",discount_type:"percent",discount_value:"",minimum_order_value:"0"});

  async function load(){
    setBusy(true);setError("");
    try{
      const [p,f,d,b,c]=await Promise.all([
        req(URL+"/rest/v1/catalog_products?select=id,name,category,line,size_grams,price,active,sku&order=sort_order.asc,name.asc&limit=500",token),
        req(URL+"/rest/v1/financial_transactions?select=*&order=created_at.desc&limit=200",token),
        req(URL+"/rest/v1/delivery_orders?select=*&order=delivery_date.asc,created_at.desc&limit=200",token),
        req(URL+"/rest/v1/production_batches?select=*&order=produced_at.desc&limit=200",token),
        req(URL+"/rest/v1/coupons?select=*&order=created_at.desc&limit=200",token)
      ]);
      setProducts(p||[]);setFinance(f||[]);setDeliveries(d||[]);setProduction(b||[]);setCoupons(c||[]);
    }catch{setError("Não foi possível carregar esta área.");}finally{setBusy(false);}
  }
  useEffect(()=>{void load();},[section]);

  async function addProduct(){
    if(!product.name.trim()||!product.price)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/catalog_products",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:product.name.trim(),category:product.category,line:product.line||null,size_grams:product.size_grams?Number(product.size_grams):null,price:Number(product.price)})});
      setProduct({name:"",category:"marmita",line:"Fit",size_grams:"350",price:""});await load();
    }catch{setError("Não foi possível cadastrar o produto.");}finally{setBusy(false);}
  }
  async function addFinance(){
    if(!expense.description.trim()||!expense.amount)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/financial_transactions",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({type:expense.type,category:expense.category,description:expense.description.trim(),amount:Number(expense.amount),payment_method:expense.payment_method,status:"pago",paid_at:new Date().toISOString()})});
      setExpense({type:"despesa",category:"insumos",description:"",amount:"",payment_method:"Pix"});await load();
    }catch{setError("Não foi possível registrar o lançamento.");}finally{setBusy(false);}
  }
  async function addCoupon(){
    if(!coupon.code.trim()||!coupon.discount_value)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/coupons",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({code:coupon.code.trim().toUpperCase(),description:coupon.description||null,discount_type:coupon.discount_type,discount_value:Number(coupon.discount_value),minimum_order_value:Number(coupon.minimum_order_value||0)})});
      setCoupon({code:"",description:"",discount_type:"percent",discount_value:"",minimum_order_value:"0"});await load();
    }catch{setError("Não foi possível criar o cupom.");}finally{setBusy(false);}
  }

  if(error)return <div className="rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]">{error}</div>;
  if(section==="produtos")return <Panel title="Produtos / Cardápio"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><input value={product.name} onChange={e=>setProduct({...product,name:e.target.value})} placeholder="Nome do produto" className={input}/><input value={product.category} onChange={e=>setProduct({...product,category:e.target.value})} placeholder="Categoria" className={input}/><input value={product.line} onChange={e=>setProduct({...product,line:e.target.value})} placeholder="Linha" className={input}/><input value={product.size_grams} onChange={e=>setProduct({...product,size_grams:e.target.value})} placeholder="Gramas" className={input}/><input type="number" step="0.01" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})} placeholder="Preço" className={input}/></div><button onClick={()=>void addProduct()} disabled={busy} className="mt-3 rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">Cadastrar produto</button><Table><thead><tr><Th>Produto</Th><Th>Linha</Th><Th>Tamanho</Th><Th>Preço</Th><Th>Status</Th></tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t border-white/5"><Td><b>{p.name}</b><div className="text-xs text-white/35">{p.category}</div></Td><Td>{p.line||"—"}</Td><Td>{p.size_grams?p.size_grams+" g":"—"}</Td><Td>{money(p.price)}</Td><Td>{p.active?"Ativo":"Inativo"}</Td></tr>)}</tbody></Table></Panel>;
  if(section==="financeiro")return <Panel title="Financeiro"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><select value={expense.type} onChange={e=>setExpense({...expense,type:e.target.value})} className={input}><option value="despesa">Despesa</option><option value="receita">Receita</option><option value="taxa">Taxa</option><option value="estorno">Estorno</option></select><input value={expense.category} onChange={e=>setExpense({...expense,category:e.target.value})} placeholder="Categoria" className={input}/><input value={expense.description} onChange={e=>setExpense({...expense,description:e.target.value})} placeholder="Descrição" className={input}/><input type="number" step="0.01" value={expense.amount} onChange={e=>setExpense({...expense,amount:e.target.value})} placeholder="Valor" className={input}/><button onClick={()=>void addFinance()} disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">Lançar</button></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Stat label="Receitas" value={money(finance.filter(x=>x.type==="receita").reduce((s,x)=>s+Number(x.amount),0))}/><Stat label="Despesas" value={money(finance.filter(x=>x.type==="despesa").reduce((s,x)=>s+Number(x.amount),0))}/><Stat label="Saldo" value={money(finance.reduce((s,x)=>s+(x.type==="receita"?Number(x.amount):-Number(x.amount)),0))}/></div><Table><thead><tr><Th>Data</Th><Th>Tipo</Th><Th>Descrição</Th><Th>Valor</Th><Th>Status</Th></tr></thead><tbody>{finance.map(x=><tr key={x.id} className="border-t border-white/5"><Td>{new Date(x.created_at).toLocaleDateString("pt-BR")}</Td><Td>{x.type}</Td><Td>{x.description}<div className="text-xs text-white/35">{x.category}</div></Td><Td>{money(x.amount)}</Td><Td>{x.status}</Td></tr>)}</tbody></Table></Panel>;
  if(section==="entregas")return <Panel title="Entregas"><div className="mb-4 grid gap-4 sm:grid-cols-4"><Stat label="Pendentes" value={deliveries.filter(x=>x.status==="pendente").length}/><Stat label="Em rota" value={deliveries.filter(x=>x.status==="em_rota").length}/><Stat label="Entregues" value={deliveries.filter(x=>x.status==="entregue").length}/><Stat label="Taxas" value={money(deliveries.reduce((s,x)=>s+Number(x.fee),0))}/></div><Table><thead><tr><Th>Data</Th><Th>Cliente</Th><Th>Bairro</Th><Th>Janela</Th><Th>Status</Th></tr></thead><tbody>{deliveries.map(d=><tr key={d.id} className="border-t border-white/5"><Td>{d.delivery_date?new Date(d.delivery_date+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</Td><Td>{d.customer_name||"—"}<div className="text-xs text-white/35">{d.whatsapp||""}</div></Td><Td>{d.neighborhood||"—"}</Td><Td>{d.delivery_window||"—"}</Td><Td>{d.status}</Td></tr>)}</tbody></Table></Panel>;
  if(section==="producao")return <Panel title="Produção"><div className="grid gap-4 sm:grid-cols-3"><Stat label="Planejadas" value={production.filter(x=>x.status==="planejada").length}/><Stat label="Em produção" value={production.filter(x=>x.status==="em_producao").length}/><Stat label="Concluídas" value={production.filter(x=>x.status==="concluida").length}/></div><Table><thead><tr><Th>Data</Th><Th>Quantidade</Th><Th>Status</Th><Th>Observações</Th></tr></thead><tbody>{production.map(p=><tr key={p.id} className="border-t border-white/5"><Td>{new Date(p.produced_at).toLocaleString("pt-BR")}</Td><Td>{p.quantity}</Td><Td>{p.status}</Td><Td>{p.notes||"—"}</Td></tr>)}</tbody></Table></Panel>;
  return <Panel title="Cupons e campanhas"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><input value={coupon.code} onChange={e=>setCoupon({...coupon,code:e.target.value})} placeholder="Código" className={input}/><select value={coupon.discount_type} onChange={e=>setCoupon({...coupon,discount_type:e.target.value})} className={input}><option value="percent">Percentual</option><option value="fixed">Valor fixo</option></select><input type="number" step="0.01" value={coupon.discount_value} onChange={e=>setCoupon({...coupon,discount_value:e.target.value})} placeholder="Desconto" className={input}/><input type="number" step="0.01" value={coupon.minimum_order_value} onChange={e=>setCoupon({...coupon,minimum_order_value:e.target.value})} placeholder="Pedido mínimo" className={input}/><button onClick={()=>void addCoupon()} disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">Criar cupom</button></div><Table><thead><tr><Th>Código</Th><Th>Desconto</Th><Th>Usos</Th><Th>Validade</Th><Th>Status</Th></tr></thead><tbody>{coupons.map(c=><tr key={c.id} className="border-t border-white/5"><Td><b>{c.code}</b><div className="text-xs text-white/35">{c.description||""}</div></Td><Td>{c.discount_type==="percent"?c.discount_value+"%":money(c.discount_value)}</Td><Td>{c.uses_count}{c.max_uses?"/"+c.max_uses:""}</Td><Td>{c.expires_at?new Date(c.expires_at).toLocaleDateString("pt-BR"):"Sem validade"}</Td><Td>{c.active?"Ativo":"Inativo"}</Td></tr>)}</tbody></Table></Panel>;
}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><h2 className="mb-5 text-2xl font-black">{title}</h2>{children}</div>}
function Table({children}:{children:React.ReactNode}){return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">{children}</table></div>}
function Th({children}:{children:React.ReactNode}){return <th className="p-3 text-xs text-white/35">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="p-3">{children}</td>}
function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-white/35">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>}
