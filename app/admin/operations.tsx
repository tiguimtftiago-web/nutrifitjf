"use client";

import { useEffect, useState, type ReactNode } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Product = { id:string; name:string; category:string; line:string|null; size_grams:number|null; price:number; active:boolean; sku:string|null; };
type Finance = { id:string; created_at:string; type:string; category:string; description:string; amount:number; payment_method:string|null; status:string; paid_at:string|null; };
type Delivery = { id:string; created_at:string; customer_name:string|null; whatsapp:string|null; neighborhood:string|null; delivery_date:string|null; delivery_window:string|null; fee:number; status:string; driver_name:string|null; };
type Production = { id:string; created_at:string; product_id:string|null; recipe_id:string|null; quantity:number; produced_at:string; status:string; notes:string|null; stock_consumed:boolean; };
type Coupon = { id:string; created_at:string; code:string; description:string|null; discount_type:string; discount_value:number; minimum_order_value:number; max_uses:number|null; uses_count:number; starts_at:string|null; expires_at:string|null; active:boolean; };
type InventoryItem = { id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; average_cost:number; supplier:string|null; active:boolean; notes:string|null; };
type Movement = { id:string; created_at:string; item_id:string; movement_type:string; quantity:number; unit_cost:number|null; reason:string|null; };
type Recipe = { id:string; name:string; product_name:string|null; yield_quantity:number; yield_unit:string; active:boolean; };
type RecipeItem = { id:string; recipe_id:string; item_id:string; quantity:number; };
type PurchaseAlert = { item_id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; required_quantity:number; shortage_quantity:number; order_count:number; status:string; };

async function req(path:string, token:string, init:RequestInit={}) {
  const headers:Record<string,string>={apikey:KEY,"Content-Type":"application/json",...((init.headers as Record<string,string>)||{})};
  headers.Authorization="Bearer "+token;
  const r=await fetch(path,{...init,headers});
  const text=await r.text();
  if(r.status===401){
    window.dispatchEvent(new Event("nutrifit-admin-auth-expired"));
    throw new Error("Sessão administrativa expirada.");
  }
  if(!r.ok) throw new Error(text||"Erro");
  return text?JSON.parse(text):null;
}
const money=(v:number)=>"R$ "+Number(v||0).toFixed(2).replace(".",",");
const input="rounded-xl border border-white/10 bg-white/5 px-3 py-3 outline-none";

export default function Operations({section,token}:{section:"estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons";token:string}) {
  const [products,setProducts]=useState<Product[]>([]);
  const [finance,setFinance]=useState<Finance[]>([]);
  const [deliveries,setDeliveries]=useState<Delivery[]>([]);
  const [production,setProduction]=useState<Production[]>([]);
  const [coupons,setCoupons]=useState<Coupon[]>([]);
  const [inventory,setInventory]=useState<InventoryItem[]>([]);
  const [movements,setMovements]=useState<Movement[]>([]);
  const [recipes,setRecipes]=useState<Recipe[]>([]);
  const [recipeItems,setRecipeItems]=useState<RecipeItem[]>([]);
  const [purchaseAlerts,setPurchaseAlerts]=useState<PurchaseAlert[]>([]);
  const [stockForm,setStockForm]=useState({name:"",category:"insumo",unit:"kg",minimum_quantity:"0",average_cost:"0",supplier:""});
  const [movementForm,setMovementForm]=useState({item_id:"",movement_type:"entrada",quantity:"",unit_cost:"",reason:""});
  const [productionForm,setProductionForm]=useState({recipe_id:"",quantity:"",status:"planejada",notes:""});
  const [recipeForm,setRecipeForm]=useState({name:"",product_name:"",yield_quantity:"350",yield_unit:"g"});
  const [recipeItemForm,setRecipeItemForm]=useState({recipe_id:"",item_id:"",quantity:""});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [product,setProduct]=useState({name:"",category:"marmita",line:"Fit",size_grams:"350",price:""});
  const [editingProduct,setEditingProduct]=useState<Product|null>(null);
  const [expense,setExpense]=useState({type:"despesa",category:"insumos",description:"",amount:"",payment_method:"Pix"});
  const [coupon,setCoupon]=useState({code:"",description:"",discount_type:"percent",discount_value:"",minimum_order_value:"0"});

  async function load(background=false){
    if(!background){setBusy(true);setError("");}
    try{
      const [p,f,d,b,c,i,m,r,ri,a]=await Promise.all([
        req(URL+"/rest/v1/catalog_products?select=id,name,category,line,size_grams,price,active,sku&order=sort_order.asc,name.asc&limit=500",token),
        req(URL+"/rest/v1/financial_transactions?select=*&order=created_at.desc&limit=200",token),
        req(URL+"/rest/v1/delivery_orders?select=*&order=delivery_date.asc,created_at.desc&limit=200",token),
        req(URL+"/rest/v1/production_batches?select=*&order=produced_at.desc&limit=200",token),
        req(URL+"/rest/v1/coupons?select=*&order=created_at.desc&limit=200",token),
        req(URL+"/rest/v1/inventory_items?select=*&order=name.asc&limit=500",token),
        req(URL+"/rest/v1/inventory_movements?select=id,created_at,item_id,movement_type,quantity,unit_cost,reason&order=created_at.desc&limit=100",token),
        req(URL+"/rest/v1/inventory_recipes?select=id,name,product_name,yield_quantity,yield_unit,active&order=name.asc&limit=200",token),
        req(URL+"/rest/v1/inventory_recipe_items?select=id,recipe_id,item_id,quantity&limit=1000",token),
        req(URL+"/rest/v1/inventory_purchase_alerts?select=*&limit=500",token)
      ]);
      setProducts(p||[]);setFinance(f||[]);setDeliveries(d||[]);setProduction(b||[]);setCoupons(c||[]);setInventory(i||[]);setMovements(m||[]);setRecipes(r||[]);setRecipeItems(ri||[]);setPurchaseAlerts(a||[]);
    }catch{
      if(!background)setError("Não foi possível carregar esta área. Tente atualizar novamente.");
    }finally{
      if(!background)setBusy(false);
    }
  }
  useEffect(()=>{
    void load();
    const interval=window.setInterval(()=>{void load(true);},30000);
    return ()=>window.clearInterval(interval);
  },[section]);

  async function addStockItem(){
    if(!stockForm.name.trim())return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/inventory_items",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:stockForm.name.trim(),category:stockForm.category,unit:stockForm.unit,minimum_quantity:Number(stockForm.minimum_quantity||0),average_cost:Number(stockForm.average_cost||0),supplier:stockForm.supplier||null})});
      setStockForm({name:"",category:"insumo",unit:"kg",minimum_quantity:"0",average_cost:"0",supplier:""});await load();
    }catch{setError("Não foi possível cadastrar o insumo.");}finally{setBusy(false);}
  }
  async function deleteStockItem(item:InventoryItem){
    if(!window.confirm('Excluir o insumo "'+item.name+'"? Esta ação só deve ser usada para um cadastro inserido por engano e não pode ser desfeita.'))return;
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/inventory_items?id=eq."+item.id,token,{method:"DELETE",headers:{Prefer:"return=minimal"}});
      await load();
    }catch{
      setError('Não foi possível excluir "'+item.name+'". Este insumo provavelmente já possui histórico ou está vinculado a uma ficha técnica, compra, inventário ou produção. Nesse caso, use "Desativar".');
    }finally{setBusy(false);}
  }
  async function toggleStockItem(item:InventoryItem){
    const action=item.active?"desativar":"reativar";
    if(!window.confirm((item.active?'Desativar':'Reativar')+' o insumo "'+item.name+'"?'))return;
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/inventory_items?id=eq."+item.id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({active:!item.active})});
      await load();
    }catch{
      setError('Não foi possível '+action+' o insumo.');
    }finally{setBusy(false);}
  }

  async function addMovement(){
    if(!movementForm.item_id||!movementForm.quantity)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/inventory_movements",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({item_id:movementForm.item_id,movement_type:movementForm.movement_type,quantity:Number(movementForm.quantity),unit_cost:movementForm.unit_cost?Number(movementForm.unit_cost):null,reason:movementForm.reason||null})});
      setMovementForm({item_id:"",movement_type:"entrada",quantity:"",unit_cost:"",reason:""});await load();
    }catch{setError("Não foi possível registrar a movimentação. Verifique o estoque disponível.");}finally{setBusy(false);}
  }
  async function addRecipe(){
    if(!recipeForm.name.trim()||!recipeForm.yield_quantity)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/inventory_recipes",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:recipeForm.name.trim(),product_name:recipeForm.product_name||null,yield_quantity:Number(recipeForm.yield_quantity),yield_unit:recipeForm.yield_unit||"g"})});
      setRecipeForm({name:"",product_name:"",yield_quantity:"350",yield_unit:"g"});await load();
    }catch{setError("Não foi possível cadastrar a ficha técnica.");}finally{setBusy(false);}
  }
  async function addRecipeItem(){
    if(!recipeItemForm.recipe_id||!recipeItemForm.item_id||!recipeItemForm.quantity)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/inventory_recipe_items",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({recipe_id:recipeItemForm.recipe_id,item_id:recipeItemForm.item_id,quantity:Number(recipeItemForm.quantity)})});
      setRecipeItemForm({...recipeItemForm,item_id:"",quantity:""});await load();
    }catch{setError("Não foi possível adicionar o insumo à ficha técnica.");}finally{setBusy(false);}
  }
  async function addProduction(){
    if(!productionForm.recipe_id||!productionForm.quantity)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/production_batches",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({recipe_id:productionForm.recipe_id,quantity:Number(productionForm.quantity),status:productionForm.status,notes:productionForm.notes||null})});
      setProductionForm({recipe_id:"",quantity:"",status:"planejada",notes:""});await load();
    }catch{setError("Não foi possível criar a produção.");}finally{setBusy(false);}
  }
  async function updateProductionStatus(id:string,status:string){
    setBusy(true);
    try{await req(URL+"/rest/v1/production_batches?id=eq."+id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status})});await load();}
    catch{setError("Não foi possível atualizar a produção. Se estiver concluindo, confira o estoque dos insumos.");}
    finally{setBusy(false);}
  }

  async function addProduct(){
    if(!product.name.trim()||!product.price)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/catalog_products",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:product.name.trim(),category:product.category,line:product.line||null,size_grams:product.size_grams?Number(product.size_grams):null,price:Number(product.price)})});
      setProduct({name:"",category:"marmita",line:"Fit",size_grams:"350",price:""});await load();
    }catch{setError("Não foi possível cadastrar o produto.");}finally{setBusy(false);}
  }
  function startProductEdit(p:Product){
    setEditingProduct(p);
    setProduct({name:p.name,category:p.category,line:p.line||"",size_grams:p.size_grams?String(p.size_grams):"",price:String(p.price)});
  }
  function cancelProductEdit(){
    setEditingProduct(null);
    setProduct({name:"",category:"marmita",line:"Fit",size_grams:"350",price:""});
  }
  async function saveProduct(){
    if(!editingProduct||!product.name.trim()||!product.price)return;
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/catalog_products?id=eq."+editingProduct.id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:product.name.trim(),category:product.category,line:product.line||null,size_grams:product.size_grams?Number(product.size_grams):null,price:Number(product.price)})});
      cancelProductEdit();await load();
    }catch{setError("Não foi possível atualizar o produto.");}finally{setBusy(false);}
  }
  async function toggleProduct(p:Product){
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/catalog_products?id=eq."+p.id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({active:!p.active})});
      await load();
    }catch{setError("Não foi possível alterar o status do produto.");}finally{setBusy(false);}
  }
  async function addFinance(){
    if(!expense.description.trim()||!expense.amount)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/financial_transactions",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({type:expense.type,category:expense.category,description:expense.description.trim(),amount:Number(expense.amount),payment_method:expense.payment_method,status:"pago",paid_at:new Date().toISOString()})});
      setExpense({type:"despesa",category:"insumos",description:"",amount:"",payment_method:"Pix"});await load();
    }catch{setError("Não foi possível registrar o lançamento.");}finally{setBusy(false);}
  }
  async function toggleCoupon(c:Coupon){
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/coupons?id=eq."+c.id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({active:!c.active})});
      await load();
    }catch{setError("Não foi possível alterar o status do cupom.");}finally{setBusy(false);}
  }
  async function deleteCoupon(c:Coupon){
    if(c.uses_count>0){
      if(!window.confirm("Este cupom já foi usado. Ele será desativado para preservar o histórico. Continuar?")) return;
      await toggleCoupon(c);
      return;
    }
    if(!window.confirm("Excluir o cupom "+c.code+" definitivamente?")) return;
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/coupons?id=eq."+c.id,token,{method:"DELETE",headers:{Prefer:"return=minimal"}});
      await load();
    }catch{setError("Não foi possível excluir o cupom.");}finally{setBusy(false);}
  }

  async function addCoupon(){
    if(!coupon.code.trim()||!coupon.discount_value)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/coupons",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({code:coupon.code.trim().toUpperCase(),description:coupon.description||null,discount_type:coupon.discount_type,discount_value:Number(coupon.discount_value),minimum_order_value:Number(coupon.minimum_order_value||0)})});
      setCoupon({code:"",description:"",discount_type:"percent",discount_value:"",minimum_order_value:"0"});await load();
    }catch{setError("Não foi possível criar o cupom.");}finally{setBusy(false);}
  }

  if(section==="produtos")return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Produtos / Cardápio">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <input value={product.name} onChange={e=>setProduct({...product,name:e.target.value})} placeholder="Nome do produto" className={input}/>
      <input value={product.category} onChange={e=>setProduct({...product,category:e.target.value})} placeholder="Categoria" className={input}/>
      <input value={product.line} onChange={e=>setProduct({...product,line:e.target.value})} placeholder="Linha" className={input}/>
      <input value={product.size_grams} onChange={e=>setProduct({...product,size_grams:e.target.value})} placeholder="Gramas" className={input}/>
      <input type="number" step="0.01" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})} placeholder="Preço" className={input}/>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button onClick={()=>void (editingProduct?saveProduct():addProduct())} disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">{editingProduct?"Salvar alterações":"Cadastrar produto"}</button>
      {editingProduct&&<button onClick={cancelProductEdit} disabled={busy} className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold">Cancelar</button>}
    </div>
    <Table><thead><tr><Th>Produto</Th><Th>Linha</Th><Th>Tamanho</Th><Th>Preço</Th><Th>Status</Th><Th>Ações</Th></tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t border-white/5">
      <Td><b>{p.name}</b><div className="text-xs text-white/35">{p.category}</div></Td>
      <Td>{p.line||"—"}</Td><Td>{p.size_grams?p.size_grams+" g":"—"}</Td><Td>{money(p.price)}</Td>
      <Td>{p.active?"Ativo":"Inativo"}</Td>
      <Td><div className="flex gap-2 whitespace-nowrap">
        <button onClick={()=>startProductEdit(p)} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold">Editar</button>
        <button onClick={()=>void toggleProduct(p)} disabled={busy} className="rounded-full border border-[#ef7d18]/30 px-3 py-2 text-xs font-bold text-[#ef7d18]">{p.active?"Desativar":"Ativar"}</button>
      </div></Td>
    </tr>)}</tbody></Table>
  </Panel></div>;
  if(section==="financeiro")return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Financeiro"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><select value={expense.type} onChange={e=>setExpense({...expense,type:e.target.value})} className={input}><option value="despesa">Despesa</option><option value="receita">Receita</option><option value="taxa">Taxa</option><option value="estorno">Estorno</option></select><input value={expense.category} onChange={e=>setExpense({...expense,category:e.target.value})} placeholder="Categoria" className={input}/><input value={expense.description} onChange={e=>setExpense({...expense,description:e.target.value})} placeholder="Descrição" className={input}/><input type="number" step="0.01" value={expense.amount} onChange={e=>setExpense({...expense,amount:e.target.value})} placeholder="Valor" className={input}/><button onClick={()=>void addFinance()} disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black">Lançar</button></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Stat label="Receitas" value={money(finance.filter(x=>x.type==="receita").reduce((s,x)=>s+Number(x.amount),0))}/><Stat label="Despesas" value={money(finance.filter(x=>x.type==="despesa").reduce((s,x)=>s+Number(x.amount),0))}/><Stat label="Saldo" value={money(finance.reduce((s,x)=>s+(x.type==="receita"?Number(x.amount):-Number(x.amount)),0))}/></div><Table><thead><tr><Th>Data</Th><Th>Tipo</Th><Th>Descrição</Th><Th>Valor</Th><Th>Status</Th></tr></thead><tbody>{finance.map(x=><tr key={x.id} className="border-t border-white/5"><Td>{new Date(x.created_at).toLocaleDateString("pt-BR")}</Td><Td>{x.type}</Td><Td>{x.description}<div className="text-xs text-white/35">{x.category}</div></Td><Td>{money(x.amount)}</Td><Td>{x.status}</Td></tr>)}</tbody></Table></Panel></div>;
  async function updateDeliveryStatus(id:string,status:string){
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/delivery_orders?id=eq."+id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status})});
      await load();
    }catch{setError("Não foi possível atualizar o status da entrega.");}finally{setBusy(false);}
  }

  if(section==="entregas")return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Entregas"><div className="mb-4 grid gap-4 sm:grid-cols-4"><Stat label="Pendentes" value={deliveries.filter(x=>x.status==="pendente").length}/><Stat label="Em rota" value={deliveries.filter(x=>x.status==="em_rota").length}/><Stat label="Entregues" value={deliveries.filter(x=>x.status==="entregue").length}/><Stat label="Taxas" value={money(deliveries.reduce((s,x)=>s+Number(x.fee),0))}/></div><Table><thead><tr><Th>Data</Th><Th>Cliente</Th><Th>Bairro</Th><Th>Janela</Th><Th>Status</Th></tr></thead><tbody>{deliveries.map(d=><tr key={d.id} className="border-t border-white/5"><Td>{d.delivery_date?new Date(d.delivery_date+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</Td><Td>{d.customer_name||"—"}<div className="text-xs text-white/35">{d.whatsapp||""}</div></Td><Td>{d.neighborhood||"—"}</Td><Td>{d.delivery_window||"—"}</Td><Td><select value={d.status} onChange={e=>void updateDeliveryStatus(d.id,e.target.value)} disabled={busy} className="rounded-lg bg-white/5 px-2 py-2 text-xs"><option value="pendente">Pendente</option><option value="em_rota">Em rota</option><option value="entregue">Entregue</option><option value="cancelada">Cancelada</option></select></Td></tr>)}</tbody></Table></Panel></div>;
  if(section==="estoque")return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Estoque e insumos">
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="Itens cadastrados" value={inventory.length}/>
      <Stat label="Abaixo do mínimo" value={inventory.filter(x=>Number(x.current_quantity)<=Number(x.minimum_quantity)).length}/>
      <Stat label="Valor em estoque" value={money(inventory.reduce((s,x)=>s+Number(x.current_quantity)*Number(x.average_cost),0))}/>
    </div>
    <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-2 lg:grid-cols-7">
      <input value={stockForm.name} onChange={e=>setStockForm({...stockForm,name:e.target.value})} placeholder="Insumo" className={input}/>
      <input value={stockForm.category} onChange={e=>setStockForm({...stockForm,category:e.target.value})} placeholder="Categoria" className={input}/>
      <input value={stockForm.unit} onChange={e=>setStockForm({...stockForm,unit:e.target.value})} placeholder="Unidade" className={input}/>
      <input type="number" step="0.001" value={stockForm.minimum_quantity} onChange={e=>setStockForm({...stockForm,minimum_quantity:e.target.value})} placeholder="Estoque mínimo" className={input}/>
      <input type="number" step="0.01" value={stockForm.average_cost} onChange={e=>setStockForm({...stockForm,average_cost:e.target.value})} placeholder="Custo médio" className={input}/>
      <input value={stockForm.supplier} onChange={e=>setStockForm({...stockForm,supplier:e.target.value})} placeholder="Fornecedor" className={input}/>
      <button onClick={()=>void addStockItem()} disabled={busy} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">Cadastrar insumo</button>
    </div>
    <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-5">
      <select value={movementForm.item_id} onChange={e=>setMovementForm({...movementForm,item_id:e.target.value})} className={input}><option value="">Selecionar insumo</option>{inventory.filter(x=>x.active).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <select value={movementForm.movement_type} onChange={e=>setMovementForm({...movementForm,movement_type:e.target.value})} className={input}><option value="entrada">Entrada</option><option value="consumo">Consumo</option><option value="perda">Perda</option><option value="ajuste">Ajuste</option><option value="devolucao">Devolução</option></select>
      <input type="number" step="0.001" value={movementForm.quantity} onChange={e=>setMovementForm({...movementForm,quantity:e.target.value})} placeholder="Quantidade" className={input}/>
      <input type="number" step="0.01" value={movementForm.unit_cost} onChange={e=>setMovementForm({...movementForm,unit_cost:e.target.value})} placeholder="Custo unitário" className={input}/>
      <button onClick={()=>void addMovement()} disabled={busy} className="rounded-full bg-[#ef7d18] px-4 py-3 text-sm font-black text-black">Registrar movimentação</button>
    </div>
    <Table><thead><tr><Th>Insumo</Th><Th>Categoria</Th><Th>Fornecedor</Th><Th>Atual</Th><Th>Mínimo</Th><Th>Custo</Th><Th>Situação</Th><Th>Ações</Th></tr></thead><tbody>{inventory.map(x=><tr key={x.id} className="border-t border-white/5"><Td><b>{x.name}</b><div className="text-xs text-white/35">{x.active?"Ativo":"Desativado"}</div></Td><Td>{x.category}</Td><Td>{x.supplier||"—"}</Td><Td>{Number(x.current_quantity).toLocaleString("pt-BR")} {x.unit}</Td><Td>{Number(x.minimum_quantity).toLocaleString("pt-BR")} {x.unit}</Td><Td>{money(x.average_cost)}</Td><Td>{Number(x.current_quantity)<=Number(x.minimum_quantity)?"COMPRAR":"OK"}</Td><Td><div className="flex gap-2 whitespace-nowrap"><button onClick={()=>void toggleStockItem(x)} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold">{x.active?"Desativar":"Reativar"}</button><button onClick={()=>void deleteStockItem(x)} disabled={busy} className="rounded-full border border-[#ef7d18]/30 px-3 py-2 text-xs font-bold text-[#ef7d18]">Excluir</button></div></Td></tr>)}</tbody></Table>
    <div className="mt-5 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-sm font-black text-[#f1b06e]">Lista de compras</div><div className="mt-1 text-xs text-white/45">Necessidades dos pedidos em aberto e itens abaixo do estoque mínimo.</div></div><div className="rounded-full bg-[#ef7d18]/15 px-3 py-1 text-xs font-black text-[#f1b06e]">{purchaseAlerts.length} item(ns)</div><button onClick={()=>{const text="Lista de compras Nutrifit\n"+purchaseAlerts.map(a=>"• "+a.name+": "+Number(a.shortage_quantity||0).toLocaleString("pt-BR")+" "+a.unit).join("\n"); navigator.clipboard?.writeText(text);}} disabled={!purchaseAlerts.length} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black disabled:opacity-40">Copiar lista</button></div>{purchaseAlerts.length===0?<div className="mt-4 text-sm text-white/55">Nenhum item precisa de compra neste momento.</div>:<Table><thead><tr><Th>Insumo</Th><Th>Estoque</Th><Th>Necessário</Th><Th>Falta</Th><Th>Pedidos</Th><Th>Status</Th></tr></thead><tbody>{purchaseAlerts.map(a=><tr key={a.item_id} className="border-t border-white/5"><Td><b>{a.name}</b><div className="text-xs text-white/35">{a.category}</div></Td><Td>{Number(a.current_quantity).toLocaleString("pt-BR")} {a.unit}</Td><Td>{Number(a.required_quantity).toLocaleString("pt-BR")} {a.unit}</Td><Td><b className="text-[#ef9b55]">{Number(a.shortage_quantity).toLocaleString("pt-BR")} {a.unit}</b></Td><Td>{a.order_count||0}</Td><Td>{a.status}</Td></tr>)}</tbody></Table>}</div><div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.15em] text-white/35">Últimas movimentações</div><Table><thead><tr><Th>Data</Th><Th>Tipo</Th><Th>Quantidade</Th><Th>Motivo</Th></tr></thead><tbody>{movements.map(m=><tr key={m.id} className="border-t border-white/5"><Td>{new Date(m.created_at).toLocaleString("pt-BR")}</Td><Td>{m.movement_type}</Td><Td>{m.quantity}</Td><Td>{m.reason||"—"}</Td></tr>)}</tbody></Table></div>
  </Panel></div>;
  if(section==="producao")return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Produção">
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Planejadas" value={production.filter(x=>x.status==="planejada").length}/><Stat label="Em produção" value={production.filter(x=>x.status==="em_producao").length}/><Stat label="Concluídas" value={production.filter(x=>x.status==="concluida").length}/></div>
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4">
      <div className="mb-3 text-sm font-black">Fichas técnicas</div>
      <div className="grid gap-3 sm:grid-cols-4">
        <input value={recipeForm.name} onChange={e=>setRecipeForm({...recipeForm,name:e.target.value})} placeholder="Nome da ficha" className={input}/>
        <input value={recipeForm.product_name} onChange={e=>setRecipeForm({...recipeForm,product_name:e.target.value})} placeholder="Produto / prato" className={input}/>
        <input type="number" step="0.001" value={recipeForm.yield_quantity} onChange={e=>setRecipeForm({...recipeForm,yield_quantity:e.target.value})} placeholder="Rendimento" className={input}/>
        <button onClick={()=>void addRecipe()} disabled={busy} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">Criar ficha</button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <select value={recipeItemForm.recipe_id} onChange={e=>setRecipeItemForm({...recipeItemForm,recipe_id:e.target.value})} className={input}><option value="">Ficha técnica</option>{recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <select value={recipeItemForm.item_id} onChange={e=>setRecipeItemForm({...recipeItemForm,item_id:e.target.value})} className={input}><option value="">Insumo</option>{inventory.map(i=><option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}</select>
        <input type="number" step="0.001" value={recipeItemForm.quantity} onChange={e=>setRecipeItemForm({...recipeItemForm,quantity:e.target.value})} placeholder="Quantidade por rendimento" className={input}/>
        <button onClick={()=>void addRecipeItem()} disabled={busy} className="rounded-full bg-[#ef7d18] px-4 py-3 text-sm font-black text-black">Adicionar insumo</button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{recipes.map(r=><div key={r.id} className="rounded-xl border border-white/5 p-3"><b>{r.name}</b><div className="text-xs text-white/35">{r.product_name||"Sem produto"} · rendimento {r.yield_quantity} {r.yield_unit}</div><div className="mt-2 text-xs text-white/55">{recipeItems.filter(x=>x.recipe_id===r.id).map(x=>{const item=inventory.find(i=>i.id===x.item_id);return item?item.name+" · "+x.quantity+" "+item.unit:null}).filter(Boolean).join(" · ")||"Nenhum insumo cadastrado"}</div></div>)}</div>
    </div>
    <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-4">
      <select value={productionForm.recipe_id} onChange={e=>setProductionForm({...productionForm,recipe_id:e.target.value})} className={input}><option value="">Selecionar ficha técnica</option>{recipes.map(r=><option key={r.id} value={r.id}>{r.name} — rendimento {r.yield_quantity} {r.yield_unit}</option>)}</select>
      <input type="number" step="0.001" value={productionForm.quantity} onChange={e=>setProductionForm({...productionForm,quantity:e.target.value})} placeholder="Quantidade a produzir" className={input}/>
      <select value={productionForm.status} onChange={e=>setProductionForm({...productionForm,status:e.target.value})} className={input}><option value="planejada">Planejada</option><option value="em_producao">Em produção</option><option value="concluida">Concluída</option></select>
      <button onClick={()=>void addProduction()} disabled={busy} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">Criar produção</button>
    </div>
    <Table><thead><tr><Th>Data</Th><Th>Quantidade</Th><Th>Status</Th><Th>Estoque</Th><Th>Observações</Th></tr></thead><tbody>{production.map(p=><tr key={p.id} className="border-t border-white/5"><Td>{new Date(p.produced_at).toLocaleString("pt-BR")}</Td><Td>{p.quantity}</Td><Td><select value={p.status} onChange={e=>void updateProductionStatus(p.id,e.target.value)} className="rounded-lg bg-white/5 px-2 py-1"><option value="planejada">Planejada</option><option value="em_producao">Em produção</option><option value="concluida">Concluída</option></select></Td><Td>{p.stock_consumed?"Baixado":"Pendente"}</Td><Td>{p.notes||"—"}</Td></tr>)}</tbody></Table>
  </Panel></div>;
  return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Cupons e campanhas"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><input value={coupon.code} onChange={e=>setCoupon({...coupon,code:e.target.value})} placeholder="Código" className={input}/><select value={coupon.discount_type} onChange={e=>setCoupon({...coupon,discount_type:e.target.value})} className={input}><option value="percent">Percentual</option><option value="fixed">Valor fixo</option></select><input type="number" step="0.01" value={coupon.discount_value} onChange={e=>setCoupon({...coupon,discount_value:e.target.value})} placeholder="Desconto" className={input}/><input type="number" step="0.01" value={coupon.minimum_order_value} onChange={e=>setCoupon({...coupon,minimum_order_value:e.target.value})} placeholder="Pedido mínimo" className={input}/><button onClick={()=>void addCoupon()} disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">Criar cupom</button></div><Table><thead><tr><Th>Código</Th><Th>Desconto</Th><Th>Usos</Th><Th>Validade</Th><Th>Status</Th><Th>Ações</Th></tr></thead><tbody>{coupons.map(c=><tr key={c.id} className="border-t border-white/5"><Td><b>{c.code}</b><div className="text-xs text-white/35">{c.description||""}</div></Td><Td>{c.discount_type==="percent"?c.discount_value+"%":money(c.discount_value)}</Td><Td>{c.uses_count}{c.max_uses?"/"+c.max_uses:""}</Td><Td>{c.expires_at?new Date(c.expires_at).toLocaleDateString("pt-BR"):"Sem validade"}</Td><Td><span className={"rounded-full px-2.5 py-1 text-xs font-bold "+(c.active?"bg-[#a7b86a]/15 text-[#cbd99a]":"bg-white/5 text-white/40")}>{c.active?"Ativo":"Inativo"}</span></Td><Td><div className="flex flex-wrap gap-2"><button onClick={()=>void toggleCoupon(c)} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black">{c.active?"Desativar":"Ativar"}</button><button onClick={()=>void deleteCoupon(c)} disabled={busy} className="rounded-full border border-[#ef7d18]/30 px-3 py-2 text-xs font-black text-[#ef9b55]">{c.uses_count>0?"Desativar":"Excluir"}</button></div></Td></tr>)}</tbody></Table></Panel></div>;
}
function Panel({title,children}:{title:string;children:ReactNode}){return <div className="rounded-3xl border border-white/10 bg-[#0d110b] p-5 sm:p-6"><h2 className="mb-5 text-2xl font-black">{title}</h2>{children}</div>}
function Table({children}:{children:ReactNode}){return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">{children}</table></div>}
function Th({children}:{children:ReactNode}){return <th className="p-3 text-xs text-white/35">{children}</th>}
function Td({children}:{children:ReactNode}){return <td className="p-3">{children}</td>}
function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-white/35">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>}
