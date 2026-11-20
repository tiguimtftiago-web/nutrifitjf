"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2, RefreshCw, Printer, ClipboardList } from "lucide-react";

const URL=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://xdllpyqrbofszvallzxf.supabase.co";
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";
type OrderItem={name:string;line:string;weight:string;quantity:number;raw:any};
type Order={id:string;order_code:string;customer_name:string|null;created_at:string;status:string;items:any};
type InventoryItem={id:string;name:string;unit:string;category:string;active:boolean};
type Recipe={id:string;name:string;product_name:string|null;yield_unit:string;active:boolean};
type ComponentDraft={key:string;source:"item"|"recipe"|"manual";source_id:string;name:string;quantity:string;unit:string;notes:string};
type MealDraft={lineId:string|null;displayName:string;quantity:string;mealPeriod:string;components:ComponentDraft[];notes:string;orderItem:OrderItem};

async function api(path:string,token:string,init:RequestInit={}){
 const headers:Record<string,string>={apikey:KEY,"Content-Type":"application/json",Authorization:"Bearer "+token,...((init.headers as Record<string,string>)||{})};
 const response=await fetch(URL+"/rest/v1/"+path,{...init,headers});const body=await response.text();
 if(!response.ok){let message=body;try{const parsed=JSON.parse(body);message=parsed.message||parsed.details||parsed.hint||body}catch{}throw new Error(message||"Falha ao acessar o banco.")}
 return body?JSON.parse(body):null;
}
const newKey=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():String(Date.now())+Math.random();
const blankComponent=():ComponentDraft=>({key:newKey(),source:"manual",source_id:"",name:"",quantity:"",unit:"g",notes:""});
const normalize=(v:string)=>v.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
function parseOrderItems(value:any):OrderItem[]{
 let data=value;if(typeof data==="string"){try{data=JSON.parse(data)}catch{return []}}
 if(data&&!Array.isArray(data)&&Array.isArray(data.items))data=data.items;if(!Array.isArray(data))return [];
 return data.flatMap((x:any)=>!x||typeof x!=="object"?[]:[{name:String(x.name||x.product_name||x.title||"Item sem nome"),line:String(x.line||x.category||""),weight:String(x.weight||x.size||""),quantity:Math.max(1,Number(x.quantity)||1),raw:x}]);
}
function seedFabrício(item:OrderItem):ComponentDraft[]{
 const name=normalize(item.name);
 const row=(source:"item"|"manual",source_id:string,label:string,quantity:number,notes=""):ComponentDraft=>({key:newKey(),source,source_id,name:label,quantity:String(quantity),unit:"g",notes});
 if(name.includes("carne de panela"))return [row("item","7f21756a-63eb-49fd-9ee7-b11d068b10df","Carne de panela",120),row("manual","","Batata e cenoura — peso combinado",140,"140 g no total; divisão entre batata e cenoura ainda não especificada.")];
 if(name.includes("cupim"))return [row("item","7011cb95-e5c9-4ce7-a61c-6642f4de332b","Cupim",120),row("item","f32f768f-e346-4753-93b2-14b65b16dd7d","Mandioca",140)];
 if(name.includes("frango empanado"))return [row("item","f6b9590c-f24d-40d0-a337-24779efa0419","Frango empanado",120),row("item","bb7f72fa-32c7-43b3-a856-894622b0b754","Arroz branco",70)];
 if(name.includes("patinho"))return [row("item","b2dcb2da-3144-4254-9ffd-df64d2d72977","Patinho",120)];
 if(name.includes("pernil"))return [row("item","4c251a0b-b0cb-44e0-bc7b-f6c12cb6200b","Pernil suíno",120),row("item","bb7f72fa-32c7-43b3-a856-894622b0b754","Arroz branco",70)];
 return [];
}
function seedNotes(item:OrderItem):string{
 const name=normalize(item.name);
 if(name.includes("frango empanado"))return "Legumes e feijão: gramaturas ainda não confirmadas. Não produzir esses componentes até registrar as quantidades.";
 if(name.includes("patinho"))return "Abóbora: gramatura ainda não confirmada. Não estimar nem completar o peso da marmita.";
 if(name.includes("pernil"))return "Legumes e feijão: gramaturas ainda não confirmadas. Não produzir esses componentes até registrar as quantidades.";
 return "";
}

export default function PersonalizedOrdersPage(){
 const [token,setToken]=useState("");const [orders,setOrders]=useState<Order[]>([]);const [items,setItems]=useState<InventoryItem[]>([]);const [recipes,setRecipes]=useState<Recipe[]>([]);
 const [selectedOrderId,setSelectedOrderId]=useState("");const [meals,setMeals]=useState<MealDraft[]>([]);const [loading,setLoading]=useState(false);const [savingId,setSavingId]=useState("");const [error,setError]=useState("");const [message,setMessage]=useState("");
 useEffect(()=>{setToken(sessionStorage.getItem("nutrifit_admin_token")||"")},[]);
 const loadBase=useCallback(async(t:string)=>{if(!t)return;const [o,i,r]=await Promise.all([
  api("customer_orders?select=id,order_code,customer_name,created_at,status,items&status=neq.cancelado&order=created_at.desc&limit=150",t),
  api("inventory_items?select=id,name,unit,category,active&active=eq.true&order=name.asc&limit=600",t),
  api("inventory_recipes?select=id,name,product_name,yield_unit,active&active=eq.true&order=name.asc&limit=400",t)
 ]);setOrders(o||[]);setItems(i||[]);setRecipes(r||[]);if(!selectedOrderId&&o?.length){const preferred=o.find((x:Order)=>x.order_code==="NF-534B60");setSelectedOrderId((preferred||o[0]).id)}},[selectedOrderId]);
 useEffect(()=>{if(token)void loadBase(token).catch(e=>setError(e.message))},[token,loadBase]);

 const loadOrderMeals=useCallback(async(orderId:string)=>{
  if(!token||!orderId)return;setLoading(true);setError("");setMessage("");
  try{
   const order=orders.find(o=>o.id===orderId);if(!order){setMeals([]);return}
   const lines=await api("customer_order_meal_lines?select=id,display_name,quantity,meal_period,validation_status,validation_notes,order_item_snapshot,composition_snapshot&order_id=eq."+orderId+"&order=created_at.asc",token);
   const ids=(lines||[]).map((x:any)=>x.id);
   const componentRows=ids.length?await api("customer_order_meal_components?select=id,meal_line_id,sort_order,item_id,recipe_id,component_name_snapshot,quantity_per_portion,unit,notes&meal_line_id=in.("+ids.join(",")+")&order=sort_order.asc",token):[];
   const drafts=parseOrderItems(order.items).map(orderItem=>{
    const line=(lines||[]).find((x:any)=>normalize(x.display_name)===normalize(orderItem.name));
    const linked=(componentRows||[]).filter((x:any)=>x.meal_line_id===line?.id);
    const components:ComponentDraft[]=line?linked.map((x:any)=>({key:x.id||newKey(),source:x.item_id?"item":x.recipe_id?"recipe":"manual",source_id:x.item_id||x.recipe_id||"",name:x.component_name_snapshot,quantity:String(x.quantity_per_portion),unit:x.unit,notes:x.notes||""})):order.order_code==="NF-534B60"?seedFabrício(orderItem):[];
    return {lineId:line?.id||null,displayName:orderItem.name,quantity:String(line?.quantity??orderItem.quantity),mealPeriod:line?.meal_period||"outro",components,notes:line?.validation_notes||(!line&&order.order_code==="NF-534B60"?seedNotes(orderItem):""),orderItem};
   });setMeals(drafts);
  }catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar as refeições do pedido.")}
  finally{setLoading(false)}
 },[token,orders]);
 useEffect(()=>{if(selectedOrderId&&orders.length)void loadOrderMeals(selectedOrderId)},[selectedOrderId,orders,loadOrderMeals]);

 const selectedOrder=orders.find(o=>o.id===selectedOrderId)||null;
 const totalFor=(meal:MealDraft)=>{const valid=meal.components.filter(c=>c.quantity.trim()&&Number(c.quantity)>0);if(!valid.length)return null;const units=[...new Set(valid.map(c=>c.unit.trim()))];if(units.length!==1)return null;return {quantity:valid.reduce((sum,c)=>sum+Number(c.quantity),0),unit:units[0]}};
 const updateMeal=(index:number,patch:Partial<MealDraft>)=>setMeals(prev=>prev.map((m,i)=>i===index?{...m,...patch}:m));
 const updateComponent=(mi:number,ci:number,patch:Partial<ComponentDraft>)=>setMeals(prev=>prev.map((m,i)=>i===mi?{...m,components:m.components.map((c,j)=>j===ci?{...c,...patch}:c)}:m));
 const addComponent=(mi:number)=>setMeals(prev=>prev.map((m,i)=>i===mi?{...m,components:[...m.components,blankComponent()]}:m));
 const removeComponent=(mi:number,ci:number)=>setMeals(prev=>prev.map((m,i)=>i===mi?{...m,components:m.components.filter((_,j)=>j!==ci)}:m));
 function chooseSource(mi:number,ci:number,source:"item"|"recipe"|"manual"){updateComponent(mi,ci,{source,source_id:"",name:"",unit:"g"})}
 function chooseInventorySource(mi:number,ci:number,id:string){
  const component=meals[mi]?.components[ci];if(!component)return;
  if(component.source==="item"){const found=items.find(x=>x.id===id);updateComponent(mi,ci,{source_id:id,name:found?.name||"",unit:found?.unit||"g"})}
  else if(component.source==="recipe"){const found=recipes.find(x=>x.id===id);updateComponent(mi,ci,{source_id:id,name:found?.product_name||found?.name||"",unit:found?.yield_unit||"g"})}
 }
 async function saveMeal(meal:MealDraft){
  if(!token||!selectedOrder){setError("Sessão administrativa ou pedido não identificado.");return}
  if(!meal.displayName.trim()||!meal.components.length){setError("Cada refeição precisa ter nome e ao menos um componente.");return}
  if(meal.components.some(c=>!c.name.trim()||!c.quantity.trim()||!Number.isFinite(Number(c.quantity))||Number(c.quantity)<=0||!c.unit.trim())){setError("Preencha nome, quantidade positiva e unidade em todos os componentes.");return}
  if(meal.components.some(c=>c.source!=="manual"&&!c.source_id)){setError("Selecione o insumo ou preparação de cada componente vinculado.");return}
  setSavingId(meal.displayName);setError("");setMessage("");
  try{
   await api("rpc/save_customer_order_meal_composition",token,{method:"POST",body:JSON.stringify({
    p_order_id:selectedOrder.id,p_line_id:meal.lineId,p_display_name:meal.displayName.trim(),p_quantity:Number(meal.quantity),p_meal_period:meal.mealPeriod,
    p_validation_status:"pendente",p_validation_notes:meal.notes.trim()||null,
    p_order_item_snapshot:{order_code:selectedOrder.order_code,name:meal.orderItem.name,line:"Dieta individual",weight:(totalFor(meal)?String(totalFor(meal)?.quantity)+" "+String(totalFor(meal)?.unit):"Composição parcial"),catalog_line:meal.orderItem.line,catalog_weight:meal.orderItem.weight,quantity:meal.orderItem.quantity},
    p_components:meal.components.map(c=>({item_id:c.source==="item"?c.source_id:null,recipe_id:c.source==="recipe"?c.source_id:null,component_name_snapshot:c.name.trim(),quantity_per_portion:Number(c.quantity),unit:c.unit.trim(),notes:c.notes.trim()||null}))
   })});
   setMessage("Composição de "+meal.displayName+" salva no pedido "+selectedOrder.order_code+". Status pendente de validação; nenhuma baixa de estoque ou alteração comercial foi realizada.");
   await loadOrderMeals(selectedOrder.id);
  }catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar a composição.")}
  finally{setSavingId("")}
 }
 const input="mt-1 w-full min-w-0 rounded-xl border border-white/10 bg-[#0a0e09] px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]";
 const formatWeight=(value:number)=>Number(value.toFixed(3)).toLocaleString("pt-BR",{maximumFractionDigits:3});

 return <main className="min-h-screen bg-[#090d09] px-4 py-6 text-white sm:px-8">
  <div className="mx-auto max-w-6xl">
   <div className="mb-6">
    <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b4c276]"><ArrowLeft size={16}/> Voltar ao painel</Link>
    <header>
     <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]"><ClipboardList size={15}/> Nutrifit · Administração e produção</div>
     <h1 className="mt-2 text-3xl font-black">Dietas e refeições personalizadas</h1>
     <p className="mt-2 max-w-3xl text-sm text-white/55">Use esta tela quando a composição for definida pela dieta individual do cliente. Registre cada componente pelo peso pronto. O sistema não completa a marmita até 350 g, 450 g ou 500 g. Para itens escolhidos diretamente do cardápio, mantenha a ficha técnica padrão.</p>
     <div className="mt-4 rounded-xl border border-[#ef9b55]/25 bg-[#ef9b55]/[.06] p-3 text-xs leading-5 text-[#f1c18e]">As quantidades são por marmita e em alimento pronto. Componentes manuais ficam registrados, mas não são associados automaticamente a um insumo de estoque. Nenhum registro nesta tela baixa estoque ou cria lote.</div>
    </header>
   </div>
   {(error||message)&&<div role="alert" className={"mb-4 rounded-xl border p-3 text-sm "+(error?"border-red-500/30 bg-red-500/10 text-red-200":"border-[#a7b86a]/30 bg-[#a7b86a]/10 text-[#d8e5a2]")}>{error||message}</div>}
   {!token?<div className="rounded-2xl border border-white/10 bg-[#111710] p-5 text-sm text-white/60">Entre no painel administrativo para acessar as fichas personalizadas.</div>:<>
    <section className="mb-6 rounded-2xl border border-white/10 bg-[#111710] p-4 sm:p-5">
     <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 text-xs font-bold text-white/60">Selecionar pedido<select value={selectedOrderId} onChange={e=>setSelectedOrderId(e.target.value)} className={input}><option value="">Selecione um pedido</option>{orders.map(o=><option key={o.id} value={o.id}>{o.customer_name||"Cliente"} · {o.order_code} · {o.status}</option>)}</select></label>
      <button type="button" onClick={()=>{if(token)void loadBase(token).then(()=>{if(selectedOrderId)void loadOrderMeals(selectedOrderId)}).catch(e=>setError(e.message))}} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-black text-white/75 disabled:opacity-50"><RefreshCw size={15} className={loading?"animate-spin":""}/> Atualizar</button>
      {selectedOrder&&<button type="button" onClick={()=>window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ef7d18] px-4 text-xs font-black text-black"><Printer size={15}/> Imprimir fichas</button>}
     </div>
     {selectedOrder&&<div className="mt-3 grid gap-2 text-xs text-white/45 sm:grid-cols-3"><div>Cliente: <b className="text-white">{selectedOrder.customer_name||"—"}</b></div><div>Pedido: <b className="text-white">{selectedOrder.order_code}</b></div><div>Status comercial: <b className="text-white">{selectedOrder.status}</b> (não alterado)</div></div>}
    </section>
    {loading?<div className="rounded-2xl border border-white/10 bg-[#111710] p-5 text-sm text-white/60">Carregando refeições...</div>:<div className="space-y-4">
     {meals.map((meal,index)=>{
      const total=totalFor(meal);const manualCount=meal.components.filter(c=>c.source==="manual").length;
      return <section key={meal.lineId||meal.displayName} className="rounded-2xl border border-white/10 bg-[#111710] p-4 sm:p-5 print:border-black print:bg-white print:text-black">
       <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-[.15em] text-[#a7b86a]">Refeição {index+1} · {meal.lineId?"Composição cadastrada":"Ainda sem ficha vinculada"}</div><h2 className="mt-1 break-words text-xl font-black">{meal.displayName}</h2><div className="mt-1 text-xs text-white/45">Composição e peso definidos pela dieta individual; a gramatura comercial do cardápio não é aplicada nesta ficha.</div></div><div className="rounded-xl border border-[#ef9b55]/25 bg-[#ef9b55]/[.06] px-3 py-2 text-right"><div className="text-[9px] font-black uppercase tracking-wider text-[#f1b06e]">Total calculado</div><div className="text-xl font-black text-[#ffb36b]">{total?formatWeight(total.quantity)+" "+total.unit:"—"}</div></div></div>
       <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-xs text-white/55">Quantidade de marmitas<input type="number" min="1" step="1" value={meal.quantity} onChange={e=>updateMeal(index,{quantity:e.target.value})} className={input+" w-28"}/></label>
        <label className="text-xs text-white/55">Refeição<select value={meal.mealPeriod} onChange={e=>updateMeal(index,{mealPeriod:e.target.value})} className={input+" w-36"}><option value="almoco">Almoço</option><option value="jantar">Jantar</option><option value="outro">Outro</option></select></label>
        <span className="text-xs text-white/40">Peso calculado = soma dos componentes informados; não existe peso-alvo automático.</span>
       </div>
       <div className="mt-4 space-y-2">
        {meal.components.map((c,ci)=><div key={c.key} className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[115px_minmax(160px,1fr)_110px_75px_36px] sm:items-end">
         <label className="text-[10px] text-white/55">Origem<select value={c.source} onChange={e=>chooseSource(index,ci,e.target.value as "item"|"recipe"|"manual")} className={input}><option value="item">Insumo</option><option value="recipe">Preparação</option><option value="manual">Manual</option></select></label>
         {c.source==="manual"?<label className="text-[10px] text-white/55">Componente<input value={c.name} onChange={e=>updateComponent(index,ci,{name:e.target.value})} placeholder="Nome do componente" className={input}/></label>:<label className="text-[10px] text-white/55">Componente<select value={c.source_id} onChange={e=>chooseInventorySource(index,ci,e.target.value)} className={input}><option value="">Selecione...</option>{(c.source==="item"?items:recipes).map(x=><option key={x.id} value={x.id}>{c.source==="item"?(x as InventoryItem).name:((x as Recipe).product_name||(x as Recipe).name)}</option>)}</select></label>}
         <label className="text-[10px] text-white/55">Peso pronto<input type="number" min="0" step="0.001" value={c.quantity} onChange={e=>updateComponent(index,ci,{quantity:e.target.value})} className={input}/></label>
         <label className="text-[10px] text-white/55">Unidade<input value={c.unit} onChange={e=>updateComponent(index,ci,{unit:e.target.value})} className={input}/></label>
         <button type="button" aria-label="Remover componente" onClick={()=>removeComponent(index,ci)} className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={16}/></button>
         {c.notes&&<div className="sm:col-span-5 text-[10px] text-white/40">{c.notes}</div>}
        </div>)}
       </div>
       <button type="button" onClick={()=>addComponent(index)} className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#a7b86a]/35 px-3 py-2 text-xs font-bold text-[#c6d88c]"><Plus size={14}/> Adicionar componente</button>
       <label className="mt-4 block text-xs text-white/55">Pendências e instruções da dieta<textarea rows={2} value={meal.notes} onChange={e=>updateMeal(index,{notes:e.target.value})} placeholder="Registre componentes ainda sem gramatura confirmada. Não estime." className={input}/></label>
       <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3"><div className="text-xs text-white/45">{meal.components.length} componente(s) · {manualCount?manualCount+" manual(is), sem vínculo automático com estoque":"componentes vinculados a insumos/preparações"}</div><button type="button" disabled={!!savingId||!meal.components.length} onClick={()=>void saveMeal(meal)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#a7b86a] px-4 text-xs font-black text-black disabled:opacity-50"><Save size={15}/>{savingId===meal.displayName?"Salvando...":"Salvar ficha pendente"}</button></div>
      </section>
     })}
     {meals.length===0&&<div className="rounded-2xl border border-white/10 bg-[#111710] p-5 text-sm text-white/55">Este pedido não tem itens reconhecidos para montar fichas.</div>}
    </div>}
   </>}
  </div>
 </main>;
}
