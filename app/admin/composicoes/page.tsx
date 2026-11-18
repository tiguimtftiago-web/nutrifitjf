"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2, Utensils, ClipboardList } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Item = { id:string; name:string; unit:string; active:boolean; category:string; current_quantity:number };
type Recipe = { id:string; name:string; product_name:string|null; yield_quantity:number; yield_unit:string; active:boolean };
type Order = { id:string; order_code:string; customer_name:string|null; created_at:string; status:string; items:any[] };
type ComponentDraft = { source:"item"|"recipe"; source_id:string; name:string; quantity:string; unit:string; notes:string };

async function api(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string>={apikey:KEY,"Content-Type":"application/json",Authorization:"Bearer "+token,...((init.headers as Record<string,string>)||{})};
  const response=await fetch(URL+"/rest/v1/"+path,{...init,headers});
  const body=await response.text();
  if(!response.ok) throw new Error(body||"Falha ao acessar o banco.");
  return body?JSON.parse(body):null;
}

const blankComponent=():ComponentDraft=>({source:"item",source_id:"",name:"",quantity:"",unit:"g",notes:""});

export default function ComposicoesPage(){
  const [token,setToken]=useState("");
  const [items,setItems]=useState<Item[]>([]);
  const [recipes,setRecipes]=useState<Recipe[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [compositions,setCompositions]=useState<any[]>([]);
  const [name,setName]=useState("");
  const [category,setCategory]=useState("personalizada");
  const [yieldQty,setYieldQty]=useState("450");
  const [yieldUnit,setYieldUnit]=useState("g");
  const [notes,setNotes]=useState("");
  const [orderId,setOrderId]=useState("");
  const [mealPeriod,setMealPeriod]=useState("outro");
  const [lineQty,setLineQty]=useState("1");
  const [components,setComponents]=useState<ComponentDraft[]>([blankComponent()]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    const saved=sessionStorage.getItem("nutrifit_admin_token")||"";
    setToken(saved);
  },[]);

  async function load(t=token){
    if(!t)return;
    const [i,r,o,c]=await Promise.all([
      api("inventory_items?select=id,name,unit,active,category,current_quantity&active=eq.true&order=name.asc&limit=500",t),
      api("inventory_recipes?select=id,name,product_name,yield_quantity,yield_unit,active&active=eq.true&order=name.asc&limit=300",t),
      api("customer_orders?select=id,order_code,customer_name,created_at,status,items&status=in.(confirmado,pago_recebido,em_preparo)&order=created_at.desc&limit=100",t),
      api("meal_compositions?select=id,name,category,default_yield_quantity,default_yield_unit,active,validated,created_at&order=created_at.desc&limit=100",t)
    ]);
    setItems(i||[]);setRecipes(r||[]);setOrders(o||[]);setCompositions(c||[]);
  }
  useEffect(()=>{if(token)void load(token).catch(e=>setError(e.message));},[token]);

  const options=useMemo(()=>components.map(c=>c.source==="item"?items.find(i=>i.id===c.source_id):recipes.find(r=>r.id===c.source_id)),[components,items,recipes]);

  function updateComponent(index:number,patch:Partial<ComponentDraft>){
    setComponents(prev=>prev.map((c,i)=>i===index?{...c,...patch}:c));
  }
  function changeSource(index:number,source:"item"|"recipe"){
    updateComponent(index,{source,source_id:"",name:"",unit:source==="item"?"g":"g"});
  }
  function chooseSource(index:number,id:string){
    const c=components[index];
    if(c.source==="item"){
      const found=items.find(x=>x.id===id);
      updateComponent(index,{source_id:id,name:found?.name||"",unit:found?.unit||""});
    }else{
      const found=recipes.find(x=>x.id===id);
      updateComponent(index,{source_id:id,name:found?.product_name||found?.name||"",unit:found?.yield_unit||"g"});
    }
  }

  async function save(){
    setError("");setMessage("");
    if(!token){setError("Sessão administrativa não encontrada. Entre novamente no painel.");return;}
    if(!name.trim()){setError("Informe o nome da composição.");return;}
    if(!components.length||components.some(c=>!c.source_id||!c.quantity||Number(c.quantity)<=0)){setError("Complete todos os componentes com uma quantidade válida.");return;}
    setBusy(true);
    try{
      const comp=await api("meal_compositions?select=id",token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({name:name.trim(),category,default_yield_quantity:yieldQty?Number(yieldQty):null,default_yield_unit:yieldUnit,active:true,validated:false,source_order_id:orderId||null,notes:notes.trim()||null})});
      const compositionId=comp?.[0]?.id;
      if(!compositionId)throw new Error("A composição foi salva sem retornar o identificador.");
      const componentRows=components.map((c,index)=>({composition_id:compositionId,sort_order:index,recipe_id:c.source==="recipe"?c.source_id:null,item_id:c.source==="item"?c.source_id:null,component_name_snapshot:c.name,quantity:Number(c.quantity),unit:c.unit,notes:c.notes||null}));
      await api("meal_composition_components",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(componentRows)});
      if(orderId){
        const order=orders.find(o=>o.id===orderId);
        const line=await api("customer_order_meal_lines?select=id",token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({order_id:orderId,source_composition_id:compositionId,meal_period:mealPeriod,display_name:name.trim(),quantity:Number(lineQty),portion_total_quantity:yieldQty?Number(yieldQty):null,portion_unit:yieldUnit,validation_status:"pendente",validation_notes:"Aguardando validação de unidades, rendimentos e conferência de cozinha.",composition_snapshot:componentRows.map(({recipe_id,item_id,component_name_snapshot,quantity,unit})=>({recipe_id,item_id,name:component_name_snapshot,quantity_per_portion:quantity,unit})),order_item_snapshot:{order_code:order?.order_code,customer_name:order?.customer_name}})});
        const lineId=line?.[0]?.id;
        if(lineId){
          const snapshotRows=componentRows.map(row=>({meal_line_id:lineId,sort_order:row.sort_order,recipe_id:row.recipe_id,item_id:row.item_id,component_name_snapshot:row.component_name_snapshot,quantity_per_portion:row.quantity,total_quantity:row.quantity*Number(lineQty),unit:row.unit,notes:row.notes}));
          await api("customer_order_meal_components",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(snapshotRows)});
        }
      }
      setMessage(orderId?"Composição salva e vinculada ao pedido como pendente de validação. Nenhuma baixa de estoque foi realizada.":"Composição salva na biblioteca para reutilização.");
      setName("");setNotes("");setOrderId("");setComponents([blankComponent()]);await load();
    }catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar.");}
    finally{setBusy(false);}
  }

  return <main className="min-h-screen bg-[#090d09] px-4 py-6 text-white sm:px-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b4c276]"><ArrowLeft size={16}/> Voltar ao painel</Link>
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]"><Utensils size={15}/> Nutrifit 360 · Produção</div>
        <h1 className="mt-2 text-3xl font-black">Composições personalizadas</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">Monte refeições com preparações e insumos já cadastrados. A composição fica salva para reutilização; o vínculo com um pedido permanece pendente até a validação operacional.</p>
      </header>

      {(error||message)&&<div className={"mb-5 rounded-xl border p-4 text-sm "+(error?"border-red-500/30 bg-red-500/10 text-red-200":"border-[#a7b86a]/30 bg-[#a7b86a]/10 text-[#d8e5a2]")}>{error||message}</div>}

      <section className="rounded-2xl border border-white/10 bg-[#111710] p-4 sm:p-6">
        <h2 className="text-lg font-extrabold">Nova composição</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/65">Nome da refeição<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Frango grelhado com arroz" className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label>
          <label className="text-sm text-white/65">Categoria<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"><option value="personalizada">Personalizada</option><option value="almoco">Almoço</option><option value="jantar">Jantar</option><option value="performance">Performance</option><option value="fit">Fit</option><option value="tradicional">Tradicional</option></select></label>
          <label className="text-sm text-white/65">Rendimento total por marmita<input type="number" min="0" step="0.001" value={yieldQty} onChange={e=>setYieldQty(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label>
          <label className="text-sm text-white/65">Unidade do rendimento<select value={yieldUnit} onChange={e=>setYieldUnit(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"><option value="g">g</option><option value="ml">ml</option><option value="un">un</option></select></label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3"><h3 className="font-bold">Componentes da refeição</h3><button onClick={()=>setComponents(p=>[...p,blankComponent()])} className="inline-flex items-center gap-1 rounded-full bg-[#a7b86a] px-3 py-2 text-xs font-black text-black"><Plus size={14}/> Adicionar</button></div>
        <div className="mt-3 space-y-3">
          {components.map((c,index)=><div key={index} className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[120px_1fr_120px_90px_36px] sm:items-end">
            <label className="text-xs text-white/55">Tipo<select value={c.source} onChange={e=>changeSource(index,e.target.value as "item"|"recipe")} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-2 text-white"><option value="item">Insumo</option><option value="recipe">Preparação</option></select></label>
            <label className="text-xs text-white/55">Componente<select value={c.source_id} onChange={e=>chooseSource(index,e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-2 text-white"><option value="">Selecione...</option>{(c.source==="item"?items:recipes).map(x=><option key={x.id} value={x.id}>{c.source==="item"?(x as Item).name:((x as Recipe).product_name||(x as Recipe).name)}</option>)}</select></label>
            <label className="text-xs text-white/55">Quantidade por marmita<input type="number" min="0" step="0.001" value={c.quantity} onChange={e=>updateComponent(index,{quantity:e.target.value})} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-2 text-white"/></label>
            <label className="text-xs text-white/55">Unidade<input value={c.unit} onChange={e=>updateComponent(index,{unit:e.target.value})} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-2 text-white"/></label>
            <button aria-label="Remover componente" onClick={()=>setComponents(p=>p.filter((_,i)=>i!==index))} className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={17}/></button>
            {c.name&&<div className="sm:col-span-5 text-[11px] text-white/35">Selecionado: {c.name}{options[index]?" · unidade original: "+(c.source==="item"?(options[index] as Item).unit:(options[index] as Recipe).yield_unit):""}</div>}
          </div>)}
        </div>

        <label className="mt-4 block text-sm text-white/60">Observações<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Substituições, restrições ou instruções da cozinha..." className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"/></label>

        <div className="mt-6 rounded-xl border border-[#ef9b55]/25 bg-[#ef9b55]/[.06] p-4">
          <div className="flex items-center gap-2 font-bold text-[#f1b06e]"><ClipboardList size={17}/> Vincular a um pedido (opcional)</div>
          <p className="mt-1 text-xs text-white/45">O vínculo cria um registro de composição pendente. Não gera lote nem movimenta estoque.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-white/55 sm:col-span-3">Pedido<select value={orderId} onChange={e=>setOrderId(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-3 text-white"><option value="">Salvar somente na biblioteca</option>{orders.map(o=><option key={o.id} value={o.id}>{o.customer_name||"Cliente"} · {o.order_code} · {new Date(o.created_at).toLocaleDateString("pt-BR")}</option>)}</select></label>
            {orderId&&<><label className="text-xs text-white/55">Refeição<select value={mealPeriod} onChange={e=>setMealPeriod(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-3 text-white"><option value="almoco">Almoço</option><option value="jantar">Jantar</option><option value="outro">Outro</option></select></label><label className="text-xs text-white/55">Quantidade de marmitas<input type="number" min="1" value={lineQty} onChange={e=>setLineQty(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#151c14] p-3 text-white"/></label></>}
          </div>
        </div>

        <button disabled={busy} onClick={()=>void save()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#a7b86a] px-5 py-3 font-black text-black disabled:opacity-50"><Save size={17}/>{busy?"Salvando...":"Salvar composição"}</button>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-[#111710] p-4 sm:p-6">
        <h2 className="font-extrabold">Biblioteca de composições</h2>
        <div className="mt-3 divide-y divide-white/10">
          {compositions.length===0?<p className="py-4 text-sm text-white/40">Nenhuma composição salva ainda.</p>:compositions.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><div className="font-bold">{c.name}</div><div className="text-xs text-white/45">{c.category} · rendimento {c.default_yield_quantity??"não definido"} {c.default_yield_unit}</div></div><span className={"rounded-full px-3 py-1 text-[11px] font-bold "+(c.validated?"bg-[#a7b86a]/15 text-[#c6d88c]":"bg-[#ef9b55]/15 text-[#f1b06e]")}>{c.validated?"Validada":"Aguardando validação"}</span></div>)}
        </div>
      </section>
    </div>
  </main>;
}
