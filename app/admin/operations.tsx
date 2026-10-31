"use client";

import { useEffect, useState, type ReactNode } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Product = { id:string; name:string; category:string; line:string|null; size_grams:number|null; price:number; active:boolean; sku:string|null; description:string|null; image_url:string|null; };
type ComboPrice = { id:string; name:string; quantity:number; price:number; active:boolean; notes:string|null; };
type Finance = { id:string; created_at:string; type:string; category:string; description:string; amount:number; payment_method:string|null; status:string; paid_at:string|null; };
type Delivery = { id:string; created_at:string; customer_name:string|null; whatsapp:string|null; neighborhood:string|null; delivery_date:string|null; delivery_window:string|null; fee:number; status:string; driver_name:string|null; };
type Production = { id:string; created_at:string; product_id:string|null; recipe_id:string|null; order_id:string|null; quantity:number; produced_at:string; status:string; notes:string|null; stock_consumed:boolean; };
type CustomerOrder = { id:string; created_at:string; customer_name:string|null; whatsapp:string|null; items:Array<{name?:string;line?:string;weight?:string;quantity?:number}>; item_count:number; subtotal:number; total:number; status:string; notes:string|null; };
type Coupon = { id:string; created_at:string; code:string; description:string|null; discount_type:string; discount_value:number; minimum_order_value:number; max_uses:number|null; uses_count:number; starts_at:string|null; expires_at:string|null; active:boolean; };
type InventoryItem = { id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; average_cost:number; supplier:string|null; active:boolean; notes:string|null; purchase_pack_size?:number|null; purchase_pack_cost?:number|null; };
type Movement = { id:string; created_at:string; item_id:string; movement_type:string; quantity:number; unit_cost:number|null; reason:string|null; };
type Recipe = { id:string; name:string; product_name:string|null; yield_quantity:number; yield_unit:string; active:boolean; };
type RecipeItem = { id:string; recipe_id:string; item_id:string; quantity:number; };
type PurchaseAlert = { item_id:string; name:string; category:string; unit:string; current_quantity:number; minimum_quantity:number; required_quantity:number; shortage_quantity:number; order_count:number; status:string; };
type Supplier = { id:string; name:string; active:boolean; };
type InventoryPurchase = { id:string; created_at:string; total_cost:number; status:string; invoice_number:string|null; notes:string|null; supplier_id:string|null; suppliers?:{name:string}|null; inventory_purchase_items?:{id:string}[]; };

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
const input="min-w-0 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 outline-none";

function inventoryImage(item:InventoryItem):string {
  const n=(item.name+" "+item.category).toLocaleLowerCase("pt-BR");
  if(n.includes("purê")||n.includes("pure")||n.includes("batata")) return "/images/frango-pure-batata-inglesa.webp";
  if(n.includes("tilápia")||n.includes("tilapia")||n.includes("peixe")||n.includes("salmão")||n.includes("salmao")) return "/images/tilapia-fit-350-web.jpg";
  if(n.includes("lombo")||n.includes("pernil")||n.includes("suíno")||n.includes("suino")||n.includes("porco")) return "/images/pernil-acebolado-batata-real.jpg";
  if(n.includes("frango")||n.includes("galinha")||n.includes("peito")) return "/images/frango-ensopado.jpg";
  if(n.includes("carne")||n.includes("patinho")||n.includes("acém")||n.includes("acem")||n.includes("moída")||n.includes("moida")||n.includes("bovina")||n.includes("boi")) return "/images/carne-de-panela-com-batatas.jpg";
  if(n.includes("cenoura")||n.includes("beterraba")||n.includes("chuchu")||n.includes("brócolis")||n.includes("brocolis")||n.includes("couve")||n.includes("legume")||n.includes("verdura")) return "/images/frango-empanado-arroz-com-ervilha-e-cenoura.jpg";
  if(n.includes("arroz")||n.includes("feijão")||n.includes("feijao")||n.includes("macarrão")||n.includes("macarrao")||n.includes("massa")) return "/images/pernil-desfiado-molho-arroz-integral-cenoura.jpg";
  return "/images/nutrifit-fit-350-frango-com-pure-de-batata-inglesa.png";
}

export default function Operations({section,token}:{section:"estoque"|"produtos"|"financeiro"|"entregas"|"producao"|"cupons";token:string}) {
  const [products,setProducts]=useState<Product[]>([]);
  const [comboPrices,setComboPrices]=useState<ComboPrice[]>([]);
  const [editingCombo,setEditingCombo]=useState<ComboPrice|null>(null);
  const [comboPriceInput,setComboPriceInput]=useState("");
  const [finance,setFinance]=useState<Finance[]>([]);
  const [inventoryPurchases,setInventoryPurchases]=useState<InventoryPurchase[]>([]);
  const [financeSearch,setFinanceSearch]=useState("");
  const [financePeriod,setFinancePeriod]=useState("30");
  const [deliveries,setDeliveries]=useState<Delivery[]>([]);
  const [production,setProduction]=useState<Production[]>([]);
  const [customerOrders,setCustomerOrders]=useState<CustomerOrder[]>([]);
  const [productionFilter,setProductionFilter]=useState<string>("todas");
  const [selectedProduction,setSelectedProduction]=useState<Production|null>(null);
  const [coupons,setCoupons]=useState<Coupon[]>([]);
  const [inventory,setInventory]=useState<InventoryItem[]>([]);
  const [movements,setMovements]=useState<Movement[]>([]);
  const [recipes,setRecipes]=useState<Recipe[]>([]);
  const [recipeItems,setRecipeItems]=useState<RecipeItem[]>([]);
  const [purchaseAlerts,setPurchaseAlerts]=useState<PurchaseAlert[]>([]);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [supplierForm,setSupplierForm]=useState({name:"",contact_name:"",whatsapp:"",email:""});
  const [purchaseSupplier,setPurchaseSupplier]=useState<string>("Todos os fornecedores");
  const [inventorySearch,setInventorySearch]=useState("");
  const [inventoryCategory,setInventoryCategory]=useState("Todas as categorias");
  const [recipeSearch,setRecipeSearch]=useState("");
  const [stockForm,setStockForm]=useState({name:"",category:"insumo",unit:"kg",minimum_quantity:"0",average_cost:"0",supplier:""});
  const [movementForm,setMovementForm]=useState({item_id:"",movement_type:"entrada",quantity:"",unit_cost:"",reason:""});
  const [purchaseForm,setPurchaseForm]=useState({item_id:"",quantity:"",unit_cost:"",supplier_id:"",is_promotion:false,notes:""});
  const [productionForm,setProductionForm]=useState({recipe_id:"",quantity:"",status:"planejada",notes:""});
  const [recipeForm,setRecipeForm]=useState({name:"",product_name:"",yield_quantity:"350",yield_unit:"g"});
  const [recipeItemForm,setRecipeItemForm]=useState({recipe_id:"",item_id:"",quantity:""});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [product,setProduct]=useState({name:"",category:"marmita",line:"Fit",size_grams:"350",price:"",description:"",image_url:"",sku:""});
  const [editingProduct,setEditingProduct]=useState<Product|null>(null);
  const [expense,setExpense]=useState({type:"despesa",category:"insumos",description:"",amount:"",payment_method:"Pix"});
  const [coupon,setCoupon]=useState({code:"",description:"",discount_type:"percent",discount_value:"",minimum_order_value:"0"});

  async function load(background=false){
    if(!background){setBusy(true);setError("");}
    try{
      const [p,f,ip,d,b,c,i,m,r,ri,a,s,orders,comboData]=await Promise.all([
        req(URL+"/rest/v1/catalog_products?select=id,name,category,line,size_grams,price,active,sku,description,image_url&order=sort_order.asc,name.asc&limit=500",token),
        req(URL+"/rest/v1/financial_transactions?select=*&order=created_at.desc&limit=500",token),
        req(URL+"/rest/v1/inventory_purchases?select=id,created_at,total_cost,status,invoice_number,notes,supplier_id,suppliers(name),inventory_purchase_items(id)&order=created_at.desc&limit=500",token),
        req(URL+"/rest/v1/delivery_orders?select=*&order=delivery_date.asc,created_at.desc&limit=200",token),
        req(URL+"/rest/v1/production_batches?select=*&order=produced_at.desc&limit=200",token),
        req(URL+"/rest/v1/coupons?select=*&order=created_at.desc&limit=200",token),
        req(URL+"/rest/v1/inventory_items?select=*&order=name.asc&limit=500",token),
        req(URL+"/rest/v1/inventory_movements?select=id,created_at,item_id,movement_type,quantity,unit_cost,reason&order=created_at.desc&limit=100",token),
        req(URL+"/rest/v1/inventory_recipes?select=id,name,product_name,yield_quantity,yield_unit,active&order=name.asc&limit=200",token),
        req(URL+"/rest/v1/inventory_recipe_items?select=id,recipe_id,item_id,quantity&limit=1000",token),
        req(URL+"/rest/v1/inventory_purchase_alerts?select=*&limit=500",token),
        req(URL+"/rest/v1/suppliers?select=id,name,active&active=eq.true&order=name.asc&limit=200",token),
        req(URL+"/rest/v1/customer_orders?select=id,created_at,customer_name,whatsapp,items,item_count,subtotal,total,status,notes&order=created_at.desc&limit=200",token),
        req(URL+"/rest/v1/catalog_combos?select=id,name,quantity,price,active,notes&order=name.asc,quantity.asc&limit=200",token)
      ]);
      setProducts(p||[]);setFinance(f||[]);setInventoryPurchases(ip||[]);setDeliveries(d||[]);setProduction(b||[]);setCustomerOrders(orders||[]);setCoupons(c||[]);setInventory(i||[]);setMovements(m||[]);setRecipes(r||[]);setRecipeItems(ri||[]);setPurchaseAlerts(a||[]);setSuppliers(s||[]);setComboPrices(comboData||[]);
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

  async function createProductionPlan(order:CustomerOrder){
    const existing=production.filter(p=>p.order_id===order.id);
    // Evita novas tentativas automáticas sobre pedidos que já possuem lotes.
    // A reconciliação de quantidades existentes deve ser manual antes de gerar novamente.
    if(existing.length){
      setError("Este pedido já possui registros de produção. Confira os lotes existentes antes de gerar novamente, para evitar duplicidade ou quantidades incorretas.");
      return;
    }
    setBusy(true);setError("");
    try{
      const result=await req(URL+"/rest/v1/rpc/create_production_from_order",token,{
        method:"POST",
        body:JSON.stringify({p_order_id:order.id})
      });
      const count=Number(result||0);
      if(count===0){
        setError("Nenhum lote foi criado. Confira se o pedido está confirmado, pago ou em preparo e se todos os pratos possuem fichas técnicas ativas com insumos.");
        return;
      }
      await load();
      setError("Plano de produção criado com validação transacional. Nenhum lote parcial será mantido se a validação do banco falhar.");
    }catch(e){
      let detail=e instanceof Error?e.message:"";
      try{const parsed=JSON.parse(detail);detail=parsed.message||parsed.details||detail;}catch{}
      setError("Não foi possível criar o plano. Confira as fichas técnicas e o status do pedido antes de tentar novamente. "+(detail||"Falha ao criar o plano."));
      await load(true);
    }finally{setBusy(false);}
  }

  function printOrderProductionSheet(order:CustomerOrder){
    const items=Array.isArray(order.items)?order.items:[];
    const esc=(v:unknown)=>String(v??"").replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]||ch));
    const rows=items.map(item=>'<tr><td>'+esc(item.name||"Item")+'</td><td>'+esc(item.line||"—")+'</td><td>'+esc(item.weight||"—")+'</td><td>'+Number(item.quantity||0)+'</td><td>☐</td><td>☐</td></tr>').join("");
    const norm=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    const ingredientRows=items.flatMap(item=>{
      const name=String(item.name||"").trim();const weight=String(item.weight||"").trim();const qty=Number(item.quantity||0);
      const sameNameDifferentWeight=items.some(other=>norm(String(other.name||""))===norm(name)&&String(other.weight||"").trim()!==weight&&String(other.weight||"").trim()!=="");
      const exactName=name+(sameNameDifferentWeight&&weight?" — "+weight:"");
      const activeRecipes=recipes.filter(r=>r.active);
      const recipe=activeRecipes.find(r=>norm(r.product_name||"")===norm(exactName))||
        activeRecipes.find(r=>norm(r.name)===norm(exactName))||
        (!sameNameDifferentWeight?activeRecipes.find(r=>norm(r.product_name||"")===norm(name)||norm(r.name)===norm(name)):undefined);
      if(!recipe)return [{dish:name||"Item sem nome",ingredient:"Ficha técnica não encontrada/ativa",required:"—",stock:"—",state:"Cadastrar ficha"}];
      const ingredients=recipeItems.filter(ri=>ri.recipe_id===recipe.id);
      if(!ingredients.length)return [{dish:name,ingredient:"Ficha técnica sem insumos",required:"—",stock:"—",state:"Completar ficha"}];
      return ingredients.map(ri=>{
        const inv=inventory.find(x=>x.id===ri.item_id);const required=Number(ri.quantity||0)*qty;
        return {dish:name,ingredient:inv?.name||"Insumo não encontrado",required:Number.isFinite(required)?required.toLocaleString("pt-BR"): "—",stock:inv?Number(inv.current_quantity||0).toLocaleString("pt-BR")+" "+inv.unit:"—",state:inv&&Number(inv.current_quantity||0)>=required?"Estoque suficiente":inv?"Conferir falta":"Conferir cadastro"};
      });
    }).map(x=>'<tr><td>'+esc(x.dish)+'</td><td>'+esc(x.ingredient)+'</td><td>'+esc(x.required)+'</td><td>'+esc(x.stock)+'</td><td>'+esc(x.state)+'</td></tr>').join("");
    const w=window.open("","_blank");
    if(!w){setError("O navegador bloqueou a ficha. Permita janelas pop-up para imprimir.");return;}
    w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ficha de produção Nutrifit</title><style>body{font:14px Arial,sans-serif;color:#111;padding:24px}h1{margin:0 0 4px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.box{border:1px solid #bbb;padding:10px}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #bbb;padding:9px;text-align:left}th{background:#eee}.checks{margin-top:20px;line-height:2}</style></head><body><h1>NUTRIFIT — Ficha de produção</h1><small>Conferência de pedido e preparo</small><div class="meta"><div class="box"><b>Cliente</b><br>'+esc(order.customer_name||"Não informado")+'</div><div class="box"><b>Pedido</b><br>'+esc(order.id)+'</div><div class="box"><b>Recebido em</b><br>'+new Date(order.created_at).toLocaleString("pt-BR")+'</div><div class="box"><b>Status do pedido</b><br>'+esc(order.status||"—")+'</div></div><b>Itens solicitados</b><table><thead><tr><th>Prato</th><th>Linha</th><th>Peso</th><th>Qtd.</th><th>Preparado</th><th>Conferido</th></tr></thead><tbody>'+rows+'</tbody></table><div class="checks"><b>Conferência final</b><br>☐ Quantidades conferidas<br>☐ Etiquetas conferidas<br>☐ Pedido completo<br>☐ Estoque registrado conforme produção efetiva</div><h2 style="margin-top:28px">Conferência de insumos (estimativa pela ficha técnica)</h2><table><thead><tr><th>Prato</th><th>Insumo</th><th>Necessário</th><th>Estoque atual</th><th>Conferência</th></tr></thead><tbody>'+ingredientRows+'</tbody></table><p><small>Quantidades estimadas com base nos insumos cadastrados e na quantidade do pedido. Confirme unidades e rendimento da ficha. Esta impressão não altera nem baixa o estoque.</small></p><script>window.onload=()=>window.print()</script></body></html>');
    w.document.close();
  }
  async function addSupplier(){
    if(!supplierForm.name.trim())return;
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/suppliers",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:supplierForm.name.trim(),contact_name:supplierForm.contact_name.trim()||null,whatsapp:supplierForm.whatsapp.trim()||null,email:supplierForm.email.trim()||null,active:true})});
      setSupplierForm({name:"",contact_name:"",whatsapp:"",email:""});await load();
    }catch{setError("Não foi possível cadastrar o fornecedor. Confira se o nome já existe.");}
    finally{setBusy(false);}
  }
  async function toggleSupplier(s:Supplier){
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/suppliers?id=eq."+s.id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({active:!s.active})});
      if(purchaseSupplier===s.name&&s.active)setPurchaseSupplier("Todos os fornecedores");
      await load();
    }catch{setError("Não foi possível alterar o fornecedor.");}
    finally{setBusy(false);}
  }

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

  async function addPurchase(){
    if(!purchaseForm.item_id||!purchaseForm.quantity||!purchaseForm.unit_cost)return;
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/rpc/register_inventory_purchase",token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({p_item_id:purchaseForm.item_id,p_quantity:Number(purchaseForm.quantity),p_unit_cost:Number(purchaseForm.unit_cost),p_supplier_id:purchaseForm.supplier_id||null,p_is_promotion:purchaseForm.is_promotion,p_notes:purchaseForm.notes||null})});
      setPurchaseForm({item_id:"",quantity:"",unit_cost:"",supplier_id:"",is_promotion:false,notes:""});
      await load();
    }catch(e){setError("Não foi possível registrar a compra. Confira o insumo, a quantidade e o preço informado.");}
    finally{setBusy(false);}
  }
  async function addMovement(){
    if(!movementForm.item_id||!movementForm.quantity)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/inventory_movements",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({item_id:movementForm.item_id,movement_type:movementForm.movement_type,quantity:Number(movementForm.quantity),unit_cost:movementForm.unit_cost?Number(movementForm.unit_cost):null,reason:movementForm.reason||null})});
      setMovementForm({item_id:"",movement_type:"entrada",quantity:"",unit_cost:"",reason:""});await load();
    }catch{setError("Não foi possível registrar a movimentação. Verifique o estoque disponível.");}finally{setBusy(false);}
  }
  function readableError(e:unknown,fallback:string){
    const raw=e instanceof Error?e.message:String(e||"");
    try{
      const parsed=JSON.parse(raw);
      const detail=parsed.message||parsed.details||parsed.hint||parsed.error_description;
      return detail?fallback+" Detalhe: "+String(detail):fallback+" Detalhe: "+raw;
    }catch{
      return raw?fallback+" Detalhe: "+raw:fallback;
    }
  }
  async function addRecipe(){
    const name=recipeForm.name.trim();
    const yieldQuantity=Number(recipeForm.yield_quantity);
    if(!name){setError("Informe o nome da ficha técnica.");return;}
    if(!Number.isFinite(yieldQuantity)||yieldQuantity<=0){setError("Informe um rendimento maior que zero.");return;}
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/inventory_recipes",token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({name,product_name:recipeForm.product_name.trim()||null,yield_quantity:yieldQuantity,yield_unit:recipeForm.yield_unit||"g"})});
      setRecipeForm({name:"",product_name:"",yield_quantity:"350",yield_unit:"g"});
      await load();
      setError("");
    }catch(e){setError(readableError(e,"Não foi possível salvar a ficha técnica."));}
    finally{setBusy(false);}
  }
  async function addRecipeItem(){
    const quantity=Number(recipeItemForm.quantity);
    if(!recipeItemForm.recipe_id){setError("Selecione a ficha técnica.");return;}
    if(!recipeItemForm.item_id){setError("Selecione o insumo.");return;}
    if(!Number.isFinite(quantity)||quantity<=0){setError("Informe uma quantidade do insumo maior que zero.");return;}
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/inventory_recipe_items",token,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({recipe_id:recipeItemForm.recipe_id,item_id:recipeItemForm.item_id,quantity})});
      setRecipeItemForm({...recipeItemForm,item_id:"",quantity:""});
      await load();
      setError("");
    }catch(e){setError(readableError(e,"Não foi possível salvar o insumo na ficha técnica."));}
    finally{setBusy(false);}
  }
  function printRecipe(recipe:Recipe){
    const ingredients=recipeItems.filter(x=>x.recipe_id===recipe.id).map(ri=>{
      const item=inventory.find(i=>i.id===ri.item_id);
      return item?{name:item.name,quantity:Number(ri.quantity),unit:item.unit,cost:Number(ri.quantity)*Number(item.average_cost||0)}:null;
    }).filter((x):x is {name:string;quantity:number;unit:string;cost:number}=>Boolean(x));
    const missingCostItems=recipeItems.filter(x=>x.recipe_id===recipe.id).filter(ri=>{const item=inventory.find(i=>i.id===ri.item_id);return !item||!Number.isFinite(Number(item.average_cost))||Number(item.average_cost)<=0;}).map(ri=>inventory.find(i=>i.id===ri.item_id)?.name||"Insumo não encontrado");
    const total=ingredients.reduce((sum,item)=>sum+item.cost,0);
    const fmt=(n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
    const w=window.open("","_blank");
    if(!w){setError("O navegador bloqueou a impressão. Permita pop-ups para este site e tente novamente.");return;}
    w.document.write("<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>Ficha técnica Nutrifit</title><style>body{font:14px Arial,sans-serif;color:#111;margin:24mm}h1{font-size:22px;margin-bottom:4px}p{color:#444}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #bbb;padding:9px;text-align:left}th{background:#eee}.total{font-weight:bold;margin-top:18px}.warning{border:1px solid #b45309;background:#fff7ed;padding:10px;color:#9a3412}.note{margin-top:28px;font-size:11px;color:#555}</style></head><body><h1>Nutrifit — Ficha técnica</h1><p><b>"+esc(recipe.name)+"</b></p><p>Produto: "+esc(recipe.product_name||"Não informado")+" · Rendimento: "+recipe.yield_quantity+" "+esc(recipe.yield_unit)+"</p><table><thead><tr><th>Insumo</th><th>Quantidade</th><th>Custo estimado</th></tr></thead><tbody>"+ingredients.map(i=>"<tr><td>"+esc(i.name)+"</td><td>"+i.quantity.toLocaleString("pt-BR")+" "+esc(i.unit)+"</td><td>"+fmt(i.cost)+"</td></tr>").join("")+"</tbody></table><p class='total'>Custo estimado dos insumos: "+fmt(total)+"</p>"+(missingCostItems.length?"<p class='warning'><b>Atenção:</b> custo ausente ou zerado para: "+esc(missingCostItems.join(", "))+". O total pode estar subestimado.</p>":"")+"<p class='note'>Estimativa com base no custo médio cadastrado no estoque. Não inclui embalagem, mão de obra, energia, perdas ou outros custos indiretos. Confirme se as unidades de medida são compatíveis.</p><script>window.onload=()=>window.print()</script></body></html>");
    w.document.close();
  }
  async function addProduction(){
    if(!productionForm.recipe_id||!productionForm.quantity)return;
    const qty=Number(productionForm.quantity);
    const recipe=recipes.find(r=>r.id===productionForm.recipe_id);
    const ingredients=recipeItems.filter(x=>x.recipe_id===productionForm.recipe_id);
    if(!recipe||!recipe.active){setError("Não é possível produzir: selecione uma ficha técnica ativa.");return;}
    if(!Number.isFinite(qty)||qty<=0){setError("Informe uma quantidade de produção maior que zero.");return;}
    if(ingredients.length===0){setError("Produção bloqueada: esta ficha técnica não possui insumos cadastrados.");return;}
    if(productionForm.status==="concluida"){
      const shortage=ingredients.map(ri=>{const item=inventory.find(i=>i.id===ri.item_id);const required=Number(ri.quantity)*qty;return item&&Number(item.current_quantity)<required?item.name+" (necessário "+required+" "+item.unit+", disponível "+item.current_quantity+")":null;}).filter(Boolean);
      if(shortage.length){setError("Produção bloqueada por estoque insuficiente: "+shortage.join("; "));return;}
    }
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/production_batches",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({recipe_id:productionForm.recipe_id,quantity:qty,status:productionForm.status,notes:productionForm.notes||null})});
      setProductionForm({recipe_id:"",quantity:"",status:"planejada",notes:""});await load();
    }catch(e){let detail=e instanceof Error?e.message:"";try{const parsed=JSON.parse(detail);detail=parsed.message||parsed.details||detail;}catch{}setError(detail||"Não foi possível criar a produção.");}finally{setBusy(false);}
  }
  async function updateProductionStatus(id:string,status:string){
    const batch=production.find(p=>p.id===id);
    if(status==="concluida"&&batch){
      const ingredients=recipeItems.filter(x=>x.recipe_id===batch.recipe_id);
      if(!ingredients.length){setError("Conclusão bloqueada: a ficha técnica não possui insumos cadastrados.");return;}
      const shortage=ingredients.map(ri=>{const item=inventory.find(i=>i.id===ri.item_id);const required=Number(ri.quantity)*Number(batch.quantity);return item&&Number(item.current_quantity)<required?item.name+" (necessário "+required+" "+item.unit+", disponível "+item.current_quantity+")":null;}).filter(Boolean);
      if(shortage.length){setError("Conclusão bloqueada por estoque insuficiente: "+shortage.join("; "));return;}
    }
    setBusy(true);setError("");
    try{await req(URL+"/rest/v1/production_batches?id=eq."+id,token,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status})});await load();}
    catch(e){let detail=e instanceof Error?e.message:"";try{const parsed=JSON.parse(detail);detail=parsed.message||parsed.details||detail;}catch{}setError(detail||"Não foi possível atualizar a produção. Confira o estoque dos insumos.");}
    finally{setBusy(false);}
  }

  async function addProduct(){
    if(!product.name.trim()||!product.price)return;
    setBusy(true);
    try{
      await req(URL+"/rest/v1/catalog_products",token,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({name:product.name.trim(),category:product.category,line:product.line||null,size_grams:product.size_grams?Number(product.size_grams):null,price:Number(product.price),description:product.description.trim()||null,image_url:product.image_url.trim()||null,sku:product.sku.trim()||null})});
      setProduct({name:"",category:"marmita",line:"Fit",size_grams:"350",price:"",description:"",image_url:"",sku:""});await load();
    }catch{setError("Não foi possível cadastrar o produto.");}finally{setBusy(false);}
  }
  function startProductEdit(p:Product){
    setEditingProduct(p);
    setProduct({name:p.name,category:p.category,line:p.line||"",size_grams:p.size_grams?String(p.size_grams):"",price:String(p.price),description:p.description||"",image_url:p.image_url||"",sku:p.sku||""});
  }
  function cancelProductEdit(){
    setEditingProduct(null);
    setProduct({name:"",category:"marmita",line:"Fit",size_grams:"350",price:"",description:"",image_url:"",sku:""});
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
  function startComboEdit(combo:ComboPrice){
    setEditingCombo(combo);
    setComboPriceInput(String(combo.price));
  }
  function cancelComboEdit(){
    setEditingCombo(null);
    setComboPriceInput("");
  }
  async function saveComboPrice(){
    if(!editingCombo||!comboPriceInput.trim())return;
    const price=Number(comboPriceInput.replace(",","."));
    if(!Number.isFinite(price)||price<=0){setError("Informe um preço válido para o combo.");return;}
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/catalog_combos?id=eq."+editingCombo.id,token,{
        method:"PATCH",
        headers:{Prefer:"return=minimal"},
        body:JSON.stringify({price})
      });
      cancelComboEdit();
      await load();
    }catch{setError("Não foi possível atualizar o preço do combo.");}
    finally{setBusy(false);}
  }
  async function toggleComboPrice(combo:ComboPrice){
    setBusy(true);setError("");
    try{
      await req(URL+"/rest/v1/catalog_combos?id=eq."+combo.id,token,{
        method:"PATCH",
        headers:{Prefer:"return=minimal"},
        body:JSON.stringify({active:!combo.active})
      });
      await load();
    }catch{setError("Não foi possível alterar o status do preço.");}
    finally{setBusy(false);}
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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <input value={product.name} onChange={e=>setProduct({...product,name:e.target.value})} placeholder="Nome do produto" className={input}/>
      <input value={product.category} onChange={e=>setProduct({...product,category:e.target.value})} placeholder="Categoria" className={input}/>
      <input value={product.line} onChange={e=>setProduct({...product,line:e.target.value})} placeholder="Linha" className={input}/>
      <input value={product.size_grams} onChange={e=>setProduct({...product,size_grams:e.target.value})} placeholder="Gramas / ml" className={input}/>
      <input type="number" step="0.01" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})} placeholder="Preço" className={input}/>
      <input value={product.sku} onChange={e=>setProduct({...product,sku:e.target.value})} placeholder="SKU (opcional)" className={input}/>
      <input value={product.image_url} onChange={e=>setProduct({...product,image_url:e.target.value})} placeholder="Caminho da imagem (ex.: /images/prato.jpg)" className={input}/>
      <textarea value={product.description} onChange={e=>setProduct({...product,description:e.target.value})} placeholder="Descrição exibida no cardápio" rows={2} className={input+" sm:col-span-2"}/>
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
  </Panel>
  <Panel title="Preços dos combos e planos">
    <p className="mb-4 text-sm text-white/55">Os valores abaixo alimentam o montador e são conferidos novamente pelo servidor no fechamento do pedido. Alterações são aplicadas ao cardápio após a atualização da página.</p>
    {editingCombo&&<div className="mb-4 rounded-2xl border border-[#f47b0b]/30 bg-[#f47b0b]/[.06] p-4">
      <div className="font-black">Editar {editingCombo.name} • {editingCombo.quantity} marmitas</div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input type="number" min="0.01" step="0.01" value={comboPriceInput} onChange={e=>setComboPriceInput(e.target.value)} placeholder="Novo preço" className={input}/>
        <button onClick={()=>void saveComboPrice()} disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">Salvar preço</button>
        <button onClick={cancelComboEdit} disabled={busy} className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold">Cancelar</button>
      </div>
    </div>}
    <Table><thead><tr><Th>Linha</Th><Th>Quantidade</Th><Th>Preço</Th><Th>Tipo</Th><Th>Status</Th><Th>Ações</Th></tr></thead><tbody>{comboPrices.map(combo=><tr key={combo.id} className="border-t border-white/5">
      <Td><b>{combo.name}</b></Td>
      <Td>{combo.quantity} marmitas</Td>
      <Td>{money(combo.price)}</Td>
      <Td>{combo.notes?.startsWith("Plano mensal")?"Plano mensal":"Combo"}</Td>
      <Td>{combo.active?"Ativo":"Inativo"}</Td>
      <Td><div className="flex gap-2 whitespace-nowrap">
        <button onClick={()=>startComboEdit(combo)} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold">Editar preço</button>
        <button onClick={()=>void toggleComboPrice(combo)} disabled={busy} className="rounded-full border border-[#ef7d18]/30 px-3 py-2 text-xs font-bold text-[#ef7d18]">{combo.active?"Desativar":"Ativar"}</button>
      </div></Td>
    </tr>)}</tbody></Table>
    {!comboPrices.length&&<p className="mt-3 text-sm text-white/40">Nenhum preço cadastrado.</p>}
  </Panel></div>;
  if(section==="financeiro") {
    const now=new Date();
    const cutoff=new Date(now);
    cutoff.setDate(cutoff.getDate()-(financePeriod==="all"?36500:Number(financePeriod)));
    const inPeriod=(date:string)=>financePeriod==="all"||new Date(date)>=cutoff;
    const visibleFinance=finance.filter(x=>inPeriod(x.created_at)&&[x.description,x.category,x.type,x.status].join(" ").toLowerCase().includes(financeSearch.toLowerCase()));
    const visiblePurchases=inventoryPurchases.filter(x=>inPeriod(x.created_at)&&[x.invoice_number||"",x.notes||"",x.suppliers?.name||"",x.status].join(" ").toLowerCase().includes(financeSearch.toLowerCase()));
    const periodPurchases=inventoryPurchases.filter(x=>inPeriod(x.created_at));
    const sum=(rows:Finance[],type:string)=>rows.filter(x=>x.type===type&&x.status!=="cancelado").reduce((v,x)=>v+Number(x.amount||0),0);
    const revenue=sum(finance.filter(x=>inPeriod(x.created_at)), "receita");
    const expenses=sum(finance.filter(x=>inPeriod(x.created_at)), "despesa");
    const fees=sum(finance.filter(x=>inPeriod(x.created_at)), "taxa");
    const orderTotal=customerOrders.filter(x=>inPeriod(x.created_at)&&x.status!=="cancelado").reduce((v,x)=>v+Number(x.total||0),0);
    const paidOrderTotal=customerOrders.filter(x=>inPeriod(x.created_at)&&x.status==="pago_recebido").reduce((v,x)=>v+Number(x.total||0),0);
    const confirmedReceipts=finance.filter(x=>inPeriod(x.created_at)&&x.type==="receita"&&x.status==="pago").reduce((v,x)=>v+Number(x.amount||0),0);
    const paidExpenses=finance.filter(x=>inPeriod(x.created_at)&&x.type==="despesa"&&x.status==="pago").reduce((v,x)=>v+Number(x.amount||0),0);
    const purchasesTotal=periodPurchases.filter(x=>x.status==="recebida").reduce((v,x)=>v+Number(x.total_cost||0),0);
    const purchaseCount=periodPurchases.filter(x=>x.status==="recebida").length;
    const pending=finance.filter(x=>inPeriod(x.created_at)&&x.status==="pendente"&&x.type!=="receita").reduce((v,x)=>v+Number(x.amount||0),0);
    const paidFinance=finance.filter(x=>inPeriod(x.created_at)&&x.status==="pago");
    const paidRevenue=sum(paidFinance,"receita");
    const paidExpenseTotal=sum(paidFinance,"despesa");
    const paidFeeTotal=sum(paidFinance,"taxa");
    const paidRefunds=sum(paidFinance,"estorno");
    // Estornos reduzem o caixa, independentemente do sinal usado no lançamento.
    const balance=paidRevenue-paidExpenseTotal-paidFeeTotal-Math.abs(paidRefunds);
    return <div className="space-y-5">
      {error&&<div className="flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-3 py-2 text-xs font-black">Fechar</button></div>}
      <Panel title="Financeiro NutriFit">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input value={financeSearch} onChange={e=>setFinanceSearch(e.target.value)} placeholder="Buscar descrição, fornecedor ou categoria..." className={input}/>
          <select value={financePeriod} onChange={e=>setFinancePeriod(e.target.value)} className={input+" sm:max-w-[220px]"}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Todo o histórico</option></select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#151711] p-5 sm:p-6"><div className="text-sm font-bold text-white/55">Valor dos pedidos não cancelados</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(orderTotal)}</div><div className="mt-2 text-xs text-white/40">Pedidos registrados, não dinheiro recebido</div></div>
          <div className="min-w-0 rounded-2xl border border-[#b2bf78]/30 bg-[#1a1d12] p-5 sm:p-6"><div className="text-sm font-bold text-[#b2bf78]">Pedidos no status pago_recebido</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(paidOrderTotal)}</div><div className="mt-2 text-xs text-white/50">Somente pedidos neste status; não inclui entregues</div></div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#151711] p-5 sm:p-6"><div className="text-sm font-bold text-white/55">Recebimentos confirmados</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(confirmedReceipts)}</div><div className="mt-2 text-xs text-white/40">Lançamentos de receita com status pago</div></div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#151711] p-5 sm:p-6"><div className="text-sm font-bold text-white/55">Despesas pagas</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(paidExpenses)}</div><div className="mt-2 text-xs text-white/40">Somente despesas com status pago</div></div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#151711] p-5 sm:p-6"><div className="text-sm font-bold text-white/55">Despesas e taxas lançadas</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(expenses+fees)}</div><div className="mt-2 text-xs text-white/40">Todos os lançamentos não cancelados</div></div>
          <div className={"min-w-0 rounded-2xl border p-5 sm:p-6 "+(balance<0?"border-[#ef7d18]/30 bg-[#21170f]":"border-white/10 bg-[#151711]")}><div className="text-sm font-bold text-white/55">Resultado dos lançamentos pagos</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(balance)}</div><div className="mt-2 text-xs text-white/40">Somente lançamentos financeiros com status pago; não equivale ao saldo bancário</div></div>
          <div className="min-w-0 rounded-2xl border border-[#b2bf78]/30 bg-[#1a1d12] p-5 sm:p-6"><div className="text-sm font-bold text-[#b2bf78]">Compras recebidas no estoque</div><div className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{money(purchasesTotal)}</div><div className="mt-2 text-xs text-white/50">{purchaseCount} compra(s) registrada(s) no período</div></div>
        </div>
        {confirmedReceipts===0&&paidExpenses>0&&<div role="status" className="rounded-2xl border border-[#ef7d18]/35 bg-[#ef7d18]/[.08] p-4 text-sm leading-6 text-[#f1b06e]"><b>Conferência necessária:</b> não há recebimentos financeiros confirmados neste período, mas há despesas pagas. O resultado dos lançamentos pagos ficará negativo até que as receitas reais sejam registradas; isso não significa, por si só, que a conta bancária esteja negativa.</div>}
        <p className="text-xs leading-5 text-white/40">Os indicadores consideram até 200 pedidos, 500 lançamentos financeiros e 500 compras carregadas. “Pedidos no status pago_recebido” e “Recebimentos confirmados” vêm de fontes diferentes e não devem ser somados; o valor de um pedido não comprova, por si só, o recebimento.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="text-sm font-bold text-white/60">Contas pendentes lançadas</div><div className="mt-2 text-2xl font-black">{money(pending)}</div><div className="mt-1 text-xs text-white/40">Baseado no status dos lançamentos financeiros</div></div>
          <div className="rounded-2xl border border-[#ef7d18]/25 bg-[#ef7d18]/[.06] p-4"><div className="text-sm font-bold text-[#f1b06e]">Conferência necessária</div><p className="mt-2 text-sm leading-6 text-white/70">Compras do estoque e despesas financeiras aparecem em listas separadas até serem conciliadas. Isso evita somar a mesma compra duas vezes. Confira os registros abaixo antes de fechar o caixa.</p></div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-black">Lançamentos financeiros</h3><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/60">{visibleFinance.length} registro(s)</span></div>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/[.04] text-white/55"><tr><th className="p-4">Data</th><th className="p-4">Tipo / categoria</th><th className="p-4">Descrição</th><th className="p-4">Valor</th><th className="p-4">Status</th></tr></thead><tbody>{visibleFinance.map(x=><tr key={x.id} className="border-t border-white/10"><td className="whitespace-nowrap p-4">{new Date(x.created_at).toLocaleDateString("pt-BR")}</td><td className="p-4"><div className="font-bold">{x.type}</div><div className="mt-1 text-xs text-white/45">{x.category}</div></td><td className="max-w-[320px] whitespace-normal break-words p-4">{x.description}</td><td className="whitespace-nowrap p-4 font-black">{money(x.amount)}</td><td className="p-4"><span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-bold">{x.status}</span></td></tr>)}</tbody></table>{visibleFinance.length===0&&<div className="p-6 text-sm text-white/50">Nenhum lançamento encontrado com esses filtros.</div>}</div>
      </Panel>
      <Panel title="Compras registradas no estoque">
        <p className="mb-4 text-sm leading-6 text-white/55">Este histórico mostra as compras recebidas e os valores registrados na entrada de estoque. Elas ficam separadas do total de despesas até existir conciliação segura com o financeiro.</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-white/[.04] text-white/55"><tr><th className="p-4">Data</th><th className="p-4">Fornecedor</th><th className="p-4">Documento / observações</th><th className="p-4">Itens</th><th className="p-4">Total</th><th className="p-4">Situação</th></tr></thead><tbody>{visiblePurchases.map(x=><tr key={x.id} className="border-t border-white/10 align-top"><td className="whitespace-nowrap p-4">{new Date(x.created_at).toLocaleDateString("pt-BR")}</td><td className="p-4 font-bold">{x.suppliers?.name||"Fornecedor não vinculado"}</td><td className="max-w-[360px] whitespace-normal break-words p-4"><div>{x.invoice_number||"Sem número de documento"}</div>{x.notes&&<details className="mt-2"><summary className="cursor-pointer text-xs font-bold text-[#b2bf78]">Ver detalhes da compra</summary><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-white/55">{x.notes}</p></details>}</td><td className="p-4">{x.inventory_purchase_items?.length??"—"}</td><td className="whitespace-nowrap p-4 font-black">{money(x.total_cost)}</td><td className="p-4"><span className={"inline-flex rounded-full px-3 py-1 text-xs font-bold "+(x.status==="recebida"?"bg-[#b2bf78]/15 text-[#cbd69b]":x.status==="cancelada"?"bg-red-500/10 text-red-300":"bg-white/10 text-white/60")}>{x.status}</span></td></tr>)}</tbody></table>{visiblePurchases.length===0&&<div className="p-6 text-sm text-white/50">Nenhuma compra encontrada com esses filtros.</div>}</div>
      </Panel>
      <Panel title="Novo lançamento financeiro">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><select value={expense.type} onChange={e=>setExpense({...expense,type:e.target.value})} className={input}><option value="despesa">Despesa</option><option value="receita">Receita</option><option value="taxa">Taxa</option><option value="estorno">Estorno</option></select><input value={expense.category} onChange={e=>setExpense({...expense,category:e.target.value})} placeholder="Categoria" className={input}/><input value={expense.description} onChange={e=>setExpense({...expense,description:e.target.value})} placeholder="Descrição" className={input}/><input type="number" step="0.01" value={expense.amount} onChange={e=>setExpense({...expense,amount:e.target.value})} placeholder="Valor" className={input}/><button onClick={()=>void addFinance()} disabled={busy} className="rounded-full bg-[#ef7d18] px-5 py-3 text-sm font-black text-black disabled:opacity-50">{busy?"Salvando...":"Lançar"}</button></div>
      </Panel>
    </div>;
  }
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
  if(section==="estoque"){
    const plannedProductionByItem=new Map<string,number>();
    production.filter(p=>(p.status==="planejada"||p.status==="em_producao")&&!p.order_id).forEach(p=>{
      const recipe=recipes.find(r=>r.id===p.recipe_id);
      if(!recipe||!Number(recipe.yield_quantity))return;
      recipeItems.filter(ri=>ri.recipe_id===recipe.id).forEach(ri=>{
        const needed=Number(p.quantity||0)*Number(ri.quantity||0);
        plannedProductionByItem.set(ri.item_id,(plannedProductionByItem.get(ri.item_id)||0)+needed);
      });
    });
    const purchasePlans=inventory.filter(i=>i.active).map(item=>{
      const alert=purchaseAlerts.find(a=>a.item_id===item.id);
      const current=Number(item.current_quantity||0);
      const minimum=Number(item.minimum_quantity||0);
      const orderRequired=Number(alert?.required_quantity||0);
      const plannedProduction=Number(plannedProductionByItem.get(item.id)||0);
      const availableAfterOrders=current-orderRequired;
      const availableAfterAll=availableAfterOrders-plannedProduction;
      const purchaseQuantity=Math.max(0,minimum-availableAfterAll);
      const packSize=Number(item.purchase_pack_size||0);
      const packCost=Number(item.purchase_pack_cost||0);
      const packagesToBuy=packSize>0&&purchaseQuantity>0?Math.ceil(purchaseQuantity/packSize):0;
      const estimatedPurchaseCost=packagesToBuy>0&&packCost>0?packagesToBuy*packCost:purchaseQuantity*Number(item.average_cost||0);
      const priority=availableAfterAll<=0?"Comprar hoje":availableAfterAll<=minimum?"Comprar em breve":"Acompanhar";
      return {
        item_id:item.id,name:item.name,category:item.category,unit:item.unit,
        current_quantity:current,minimum_quantity:minimum,
        required_quantity:orderRequired,shortage_quantity:purchaseQuantity,
        order_count:Number(alert?.order_count||0),status:priority,
        supplier:item.supplier||"Sem fornecedor",
        planned_production_quantity:plannedProduction,
        available_after_orders:availableAfterOrders,
        available_after_all:availableAfterAll,
        purchase_quantity:purchaseQuantity,
        purchase_pack_size:packSize,
        purchase_pack_cost:packCost,
        packages_to_buy:packagesToBuy,
        estimated_purchase_cost:estimatedPurchaseCost
      };
    }).filter(a=>a.purchase_quantity>0);
    const filteredPurchasePlans=purchasePlans.filter(a=>purchaseSupplier==="Todos os fornecedores"||a.supplier===purchaseSupplier);
    const today=purchasePlans.filter(a=>a.status==="Comprar hoje").length;
    const soon=purchasePlans.filter(a=>a.status==="Comprar em breve").length;
    const sufficient=Math.max(0,inventory.filter(x=>x.active).length-purchasePlans.length);
    const inventoryCategories=[...new Set(inventory.map(x=>x.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
    const itemsWithoutMinimum=inventory.filter(x=>x.active&&Number(x.minimum_quantity||0)<=0).length;
    const filteredInventory=inventory.filter(x=>{
      const q=inventorySearch.trim().toLocaleLowerCase("pt-BR");
      const matchesSearch=!q||x.name.toLocaleLowerCase("pt-BR").includes(q)||x.category.toLocaleLowerCase("pt-BR").includes(q)||(x.supplier||"").toLocaleLowerCase("pt-BR").includes(q);
      const matchesCategory=inventoryCategory==="Todas as categorias"||x.category===inventoryCategory;
      return matchesSearch&&matchesCategory;
    });
    const activeFilteredInventory=filteredInventory.filter(x=>x.active);
    const inStockItems=activeFilteredInventory.filter(x=>Number(x.current_quantity)>0);
    const zeroStockItems=activeFilteredInventory.filter(x=>Number(x.current_quantity)<=0);
    const inactiveItems=filteredInventory.filter(x=>!x.active);
    const renderInventorySection=(title:string,items:InventoryItem[],subtitle:string,emptyText:string,accent:"green"|"orange"|"muted"="green")=><div className="mt-4 rounded-2xl border border-white/10 bg-white/[.025] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div><div className="flex items-center gap-2 text-sm font-black">{title}<span className={"rounded-full px-2.5 py-1 text-[10px] font-black "+(accent==="green"?"bg-[#a7b86a]/15 text-[#c4d38c]":accent==="orange"?"bg-[#ef7d18]/15 text-[#f1b06e]":"bg-white/10 text-white/50")}>{items.length}</span></div><div className="mt-1 text-xs text-white/40">{subtitle}</div></div>
      </div>
      {items.length===0?<div className="rounded-xl border border-white/5 bg-black/10 p-4 text-sm text-white/45">{emptyText}</div>:<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map(x=>{
        const qty=Number(x.current_quantity||0);
        const isReady=qty>0;
        const low=isReady&&qty<=Number(x.minimum_quantity||0);
        const status=!x.active?"Desativado":qty<=0?"Sem estoque":low?"Estoque baixo":"Disponível para produção";
        const statusClass=!x.active||qty<=0?"border-white/10 bg-white/5 text-white/50":low?"border-[#ef7d18]/30 bg-[#ef7d18]/10 text-[#f1b06e]":"border-[#a7b86a]/25 bg-[#a7b86a]/10 text-[#c4d38c]";
        return <article key={x.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#10140d]">
          <div className="relative h-36 overflow-hidden bg-[#20251a] sm:h-40">
            <img src={inventoryImage(x)} alt={x.name} loading="lazy" className="h-full w-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e09]/90 via-transparent to-black/10"/>
            <span className={"absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black "+statusClass}>{status}</span>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-white/65">{x.category||"Estoque Nutrifit"}</div>
              <h3 className="mt-1 text-lg font-black leading-tight text-white">{x.name}</h3>
            </div>
          </div>
          <div className="p-3.5">
            <div className="flex items-end justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
              <div><div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Disponível</div><div className="mt-1 text-2xl font-black leading-none text-[#c4d38c]">{qty.toLocaleString("pt-BR")} <span className="text-sm font-bold text-white/60">{x.unit}</span></div></div>
              <div className="text-right"><div className="text-[10px] text-white/40">Custo médio</div><div className="mt-1 text-sm font-black">{money(x.average_cost)}</div></div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[.035] p-2.5"><div className="text-[10px] text-white/40">Estoque mínimo</div><div className="mt-1 text-sm font-bold">{Number(x.minimum_quantity||0).toLocaleString("pt-BR")} {x.unit}</div></div>
              <div className="rounded-xl bg-white/[.035] p-2.5"><div className="text-[10px] text-white/40">Fornecedor</div><div className="mt-1 truncate text-sm font-bold">{x.supplier||"Não informado"}</div></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={()=>void toggleStockItem(x)} disabled={busy} className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold">{x.active?"Desativar":"Reativar"}</button>
              <button onClick={()=>void deleteStockItem(x)} disabled={busy} className="flex-1 rounded-xl border border-[#ef7d18]/30 px-3 py-2.5 text-xs font-bold text-[#ef9b55]">Excluir</button>
            </div>
          </div>
        </article>;
      })}</div>}
    </div>;
    return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Estoque e insumos">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Itens cadastrados" value={inventory.length}/>
      <Stat label="Comprar agora" value={today}/>
      <Stat label="Estoque baixo" value={inventory.filter(x=>Number(x.current_quantity)>0&&Number(x.current_quantity)<=Number(x.minimum_quantity)).length}/>
      <Stat label="Valor em estoque" value={money(inventory.reduce((s,x)=>s+Number(x.current_quantity)*Number(x.average_cost),0))}/>
    </div>
    {itemsWithoutMinimum>0&&<div role="status" className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#ef7d18]/[.07] p-4 text-sm leading-6 text-[#f1b06e]"><b>Estoque mínimo a revisar:</b> {itemsWithoutMinimum} item(ns) ativo(s) estão sem um limite mínimo positivo cadastrado. O indicador “Estoque baixo” depende desse limite para alertar antes da falta; revise os parâmetros conforme a necessidade real de cada insumo.</div>}
    <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-2 lg:grid-cols-7">
      <input value={stockForm.name} onChange={e=>setStockForm({...stockForm,name:e.target.value})} placeholder="Insumo" aria-label="Nome do insumo" className={input}/>
      <input value={stockForm.category} onChange={e=>setStockForm({...stockForm,category:e.target.value})} placeholder="Categoria" aria-label="Categoria do insumo" className={input}/>
      <input value={stockForm.unit} onChange={e=>setStockForm({...stockForm,unit:e.target.value})} placeholder="Unidade" aria-label="Unidade (kg, g, L ou un.)" className={input}/>
      <div className="min-w-0">
        <input type="number" min="0" step="0.001" value={stockForm.minimum_quantity} onChange={e=>setStockForm({...stockForm,minimum_quantity:e.target.value})} placeholder="Estoque mínimo" aria-label="Estoque mínimo" className={input}/>
        <div className="mt-1 px-1 text-[11px] leading-4 text-white/40">Quantidade mínima que deve permanecer no estoque. Ex.: 10 kg.</div>
      </div>
      <div className="min-w-0">
        <input type="number" min="0" step="0.01" value={stockForm.average_cost} onChange={e=>setStockForm({...stockForm,average_cost:e.target.value})} placeholder="Custo médio" aria-label="Custo médio por unidade" className={input}/>
        <div className="mt-1 px-1 text-[11px] leading-4 text-white/40">Custo médio por unidade. Ex.: R$ 18,50/kg.</div>
      </div>
      <select value={stockForm.supplier} onChange={e=>setStockForm({...stockForm,supplier:e.target.value})} className={input}>
        <option value="">Fornecedor (opcional)</option>
        {suppliers.filter(s=>s.active).map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
      <button onClick={()=>void addStockItem()} disabled={busy} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">Cadastrar insumo</button>
    </div>
    <div className="mt-5 rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/[.05] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="text-sm font-black">Registrar compra</div><div className="mt-1 text-xs text-white/45">A entrada atualiza o estoque e recalcula automaticamente o custo médio do insumo.</div></div>
        <div className="rounded-full bg-[#a7b86a]/15 px-3 py-1 text-xs font-black text-[#c4d38c]">Compra real</div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <select value={purchaseForm.item_id} onChange={e=>setPurchaseForm({...purchaseForm,item_id:e.target.value})} className={input}><option value="">Insumo comprado</option>{inventory.filter(x=>x.active).map(x=><option key={x.id} value={x.id}>{x.name} ({x.unit})</option>)}</select>
        <input type="number" step="0.001" value={purchaseForm.quantity} onChange={e=>setPurchaseForm({...purchaseForm,quantity:e.target.value})} placeholder="Quantidade comprada" className={input}/>
        <input type="number" step="0.01" value={purchaseForm.unit_cost} onChange={e=>setPurchaseForm({...purchaseForm,unit_cost:e.target.value})} placeholder="Preço por unidade" className={input}/>
        <select value={purchaseForm.supplier_id} onChange={e=>setPurchaseForm({...purchaseForm,supplier_id:e.target.value})} className={input}><option value="">Fornecedor</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input value={purchaseForm.notes} onChange={e=>setPurchaseForm({...purchaseForm,notes:e.target.value})} placeholder="Observação (opcional)" className={input}/>
        <button onClick={()=>void addPurchase()} disabled={busy} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">Registrar compra</button>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-bold"><input type="checkbox" checked={purchaseForm.is_promotion} onChange={e=>setPurchaseForm({...purchaseForm,is_promotion:e.target.checked})}/><span>Foi comprado em promoção</span></label>
      <div className="mt-3 text-xs text-white/45">Exemplo: comprar 20 kg a R$ 10,00/kg em promoção atualiza o saldo e recalcula o custo médio junto com o estoque que já existia.</div>
    </div>
    <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-5">
      <select value={movementForm.item_id} onChange={e=>setMovementForm({...movementForm,item_id:e.target.value})} className={input}><option value="">Selecionar insumo</option>{inventory.filter(x=>x.active).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <select value={movementForm.movement_type} onChange={e=>setMovementForm({...movementForm,movement_type:e.target.value})} className={input}><option value="entrada">Entrada</option><option value="consumo">Consumo</option><option value="perda">Perda</option><option value="ajuste">Ajuste</option><option value="devolucao">Devolução</option></select>
      <input type="number" step="0.001" value={movementForm.quantity} onChange={e=>setMovementForm({...movementForm,quantity:e.target.value})} placeholder="Quantidade" className={input}/>
      <input type="number" step="0.01" value={movementForm.unit_cost} onChange={e=>setMovementForm({...movementForm,unit_cost:e.target.value})} placeholder="Custo unitário" className={input}/>
      <button onClick={()=>void addMovement()} disabled={busy} className="rounded-full bg-[#ef7d18] px-4 py-3 text-sm font-black text-black">Registrar movimentação</button>
    </div>
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-black">Insumos cadastrados</div>
          <div className="mt-1 text-xs text-white/40">{inStockItems.length} com estoque · {zeroStockItems.length} zerados · {inactiveItems.length} desativados</div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">⌕</span>
            <input
              value={inventorySearch}
              onChange={e=>setInventorySearch(e.target.value)}
              placeholder="Buscar insumo..."
              aria-label="Buscar insumo"
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-10 outline-none focus:border-[#a7b86a]/60"
            />
            {inventorySearch&&<button onClick={()=>setInventorySearch("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-black text-white/55 hover:bg-white/10">×</button>}
          </div>
          <select value={inventoryCategory} onChange={e=>setInventoryCategory(e.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 outline-none sm:w-56">
            <option>Todas as categorias</option>
            {inventoryCategories.map(category=><option key={category}>{category}</option>)}
          </select>
        </div>
      </div>
    </div>
    {filteredInventory.length===0&&<div className="mt-3 rounded-2xl border border-white/10 bg-white/[.025] p-6 text-center text-sm text-white/50">Nenhum insumo encontrado. Tente outro nome ou categoria.</div>}
    {renderInventorySection("Com estoque",inStockItems,"Ingredientes com quantidade disponível no estoque físico.","Nenhum ingrediente com saldo disponível para os filtros selecionados.","green")}
    {renderInventorySection("Sem estoque",zeroStockItems,"Ingredientes ativos com saldo igual a zero; use esta seção para planejar reposições.","Nenhum ingrediente zerado para os filtros selecionados.","orange")}
    {inactiveItems.length>0&&renderInventorySection("Cadastros desativados",inactiveItems,"Itens desativados não entram nas listas de estoque disponível ou zerado.","Nenhum cadastro desativado.","muted")}
    <div className="mb-5 rounded-2xl border border-white/10 bg-white/[.025] p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="text-sm font-black">Fornecedores</div><div className="mt-1 text-xs text-white/40">Cadastre os fornecedores para aparecerem no estoque e no registro de compras.</div></div>
        <div className="text-xs font-bold text-white/35">{suppliers.length} fornecedor(es)</div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input value={supplierForm.name} onChange={e=>setSupplierForm({...supplierForm,name:e.target.value})} placeholder="Nome do fornecedor *" className={input}/>
        <input value={supplierForm.contact_name} onChange={e=>setSupplierForm({...supplierForm,contact_name:e.target.value})} placeholder="Contato" className={input}/>
        <input value={supplierForm.whatsapp} onChange={e=>setSupplierForm({...supplierForm,whatsapp:e.target.value})} placeholder="WhatsApp" className={input}/>
        <input type="email" value={supplierForm.email} onChange={e=>setSupplierForm({...supplierForm,email:e.target.value})} placeholder="E-mail" className={input}/>
        <button onClick={()=>void addSupplier()} disabled={busy||!supplierForm.name.trim()} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black disabled:opacity-40">Cadastrar fornecedor</button>
      </div>
      {suppliers.length>0&&<div className="mt-3 flex flex-wrap gap-2">{suppliers.map(s=><button key={s.id} onClick={()=>void toggleSupplier(s)} disabled={busy} title={s.active?"Desativar fornecedor":"Reativar fornecedor"} className={"rounded-full border px-3 py-2 text-xs font-bold "+(s.active?"border-[#a7b86a]/30 bg-[#a7b86a]/10 text-[#c4d38c]":"border-white/10 bg-white/5 text-white/40")}>{s.name} · {s.active?"Ativo":"Inativo"}</button>)}</div>}
    </div>
    <div className="mb-5">
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ef7d18]/35 bg-[#ef7d18]/10 p-4"><div className="text-xs text-[#f1b06e]">🔴 Comprar hoje</div><div className="mt-1 text-2xl font-black">{today}</div></div>
        <div className="rounded-2xl border border-[#ef9b55]/25 bg-[#ef9b55]/5 p-4"><div className="text-xs text-[#f1b06e]">🟠 Comprar em breve</div><div className="mt-1 text-2xl font-black">{soon}</div></div>
        <div className="rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/5 p-4"><div className="text-xs text-[#c4d38c]">🟢 Estoque suficiente</div><div className="mt-1 text-2xl font-black">{sufficient}</div></div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
        <div className="text-sm font-black">Central de compras</div>
        <div className="mt-1 text-xs text-white/45">Agora considera estoque atual, necessidades dos pedidos e também toda produção planejada ou em produção.</div>
        {purchasePlans.some(a=>a.planned_production_quantity>0)&&<div className="mt-3 rounded-xl border border-[#ef7d18]/20 bg-[#ef7d18]/5 p-3 text-xs text-[#f1b06e]">Atenção: a previsão de produção já está reservada no cálculo para evitar que os insumos acabem antes da produção.</div>}
      </div>
    </div>
    <div className="mt-5 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-sm font-black text-[#f1b06e]">Lista de compras</div><div className="mt-1 text-xs text-white/45">Itens agrupados por fornecedor, considerando pedidos, produção planejada e estoque mínimo.</div></div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={purchaseSupplier} onChange={e=>setPurchaseSupplier(e.target.value)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black"><option>Todos os fornecedores</option>{[...new Set(inventory.filter(x=>x.supplier).map(x=>x.supplier as string))].sort().map(s=><option key={s}>{s}</option>)}</select>
          <div className="rounded-full bg-[#ef7d18]/15 px-3 py-1 text-xs font-black text-[#f1b06e]">{filteredPurchasePlans.length} item(ns)</div>
          <button onClick={()=>{const groups=new Map<string,typeof filteredPurchasePlans>();filteredPurchasePlans.forEach(a=>{if(!groups.has(a.supplier))groups.set(a.supplier,[]);groups.get(a.supplier)!.push(a);});const text="LISTA DE COMPRAS NUTRIFIT\n"+[...groups.entries()].map(([s,items])=>"\n"+s+"\n"+items.map(a=>"• "+a.name+": "+Number(a.purchase_quantity||0).toLocaleString("pt-BR")+" "+a.unit).join("\n")).join("\n");navigator.clipboard?.writeText(text);}} disabled={!filteredPurchasePlans.length} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black disabled:opacity-40">Copiar lista</button>
        </div>
      </div>
      {filteredPurchasePlans.length===0?<div className="mt-4 text-sm text-white/55">Nenhum item precisa de compra neste momento.</div>:<Table><thead><tr><Th>Insumo</Th><Th>Estoque</Th><Th>Pedidos</Th><Th>Produção planejada</Th><Th>Disponível após tudo</Th><Th>Comprar</Th><Th>Pacotes</Th><Th>Custo estimado</Th><Th>Prioridade</Th></tr></thead><tbody>{filteredPurchasePlans.map(a=><tr key={a.item_id} className="border-t border-white/5"><Td><b>{a.name}</b><div className="text-xs text-white/35">{a.category} · {a.supplier}</div></Td><Td>{Number(a.current_quantity).toLocaleString("pt-BR")} {a.unit}</Td><Td>{Number(a.required_quantity).toLocaleString("pt-BR")} {a.unit}<div className="text-xs text-white/35">{a.order_count} pedido(s)</div></Td><Td>{Number(a.planned_production_quantity).toLocaleString("pt-BR")} {a.unit}</Td><Td>{Number(a.available_after_all).toLocaleString("pt-BR")} {a.unit}</Td><Td><b className="text-[#ef9b55]">{Number(a.purchase_quantity).toLocaleString("pt-BR")} {a.unit}</b></Td><Td>{a.packages_to_buy>0?<><b>{a.packages_to_buy}</b><div className="text-xs text-white/35">{a.purchase_pack_size} un/pacote</div></>:"—"}</Td><Td>{a.estimated_purchase_cost>0?money(a.estimated_purchase_cost):<span className="font-bold text-[#ef7d18]">Cadastrar custo</span>}</Td><Td>{a.status==="Comprar hoje"?<span className="inline-flex rounded-full bg-[#ef7d18]/15 px-2.5 py-1 text-[11px] font-black text-[#f1b06e]">COMPRAR HOJE</span>:<span className="inline-flex rounded-full bg-[#ef9b55]/10 px-2.5 py-1 text-[11px] font-black text-[#f1b06e]">COMPRAR EM BREVE</span>}</Td></tr>)}</tbody></Table>}
    </div>
    <div className="mt-5"><div className="mb-2 text-xs font-black uppercase tracking-[.15em] text-white/35">Últimas movimentações</div><Table><thead><tr><Th>Data</Th><Th>Tipo</Th><Th>Quantidade</Th><Th>Motivo</Th></tr></thead><tbody>{movements.map(m=><tr key={m.id} className="border-t border-white/5"><Td>{new Date(m.created_at).toLocaleString("pt-BR")}</Td><Td>{m.movement_type}</Td><Td>{m.quantity}</Td><Td>{m.reason||"—"}</Td></tr>)}</tbody></Table></div>
  </Panel></div>;
  }
  if(section==="producao"){
    const recipeQuery=recipeSearch.trim().toLocaleLowerCase("pt-BR");
    const filteredRecipes=recipes.filter(r=>{
      if(!recipeQuery)return true;
      return [r.name,r.product_name||""].join(" ").toLocaleLowerCase("pt-BR").includes(recipeQuery);
    });
    return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Produção">
    <div className="mb-5 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/[.06] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Central de pedidos e preparo</div><h2 className="mt-1 text-xl font-black">O que precisa ser preparado</h2><p className="mt-1 text-sm text-white/50">Cliente, pratos, quantidades e ficha de preparo em um só lugar.</p></div><button type="button" onClick={()=>void load(true)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold">Atualizar lista</button></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{label:"Pedidos ativos",value:customerOrders.filter(o=>!["cancelado","cancelada","cancelled"].includes(String(o.status||"").toLowerCase())).length},{label:"Planejadas",value:production.filter(p=>p.status==="planejada").length},{label:"Em preparo",value:production.filter(p=>p.status==="em_producao").length},{label:"Concluídas",value:production.filter(p=>p.status==="concluida").length}].map(s=><div key={s.label} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-xs text-white/45">{s.label}</div><div className="mt-1 text-2xl font-black">{s.value}</div></div>)}</div>
      <div className="mt-4 space-y-3">{customerOrders.filter(o=>!["cancelado","cancelada","cancelled"].includes(String(o.status||"").toLowerCase())).length===0?<div className="rounded-xl border border-white/10 p-4 text-sm text-white/45">Nenhum pedido ativo encontrado.</div>:customerOrders.filter(o=>!["cancelado","cancelada","cancelled"].includes(String(o.status||"").toLowerCase())).map(order=>{
        const items=Array.isArray(order.items)?order.items:[];const linked=production.filter(p=>p.order_id===order.id);
        const statusLabel=(s:string)=>s==="pago_recebido"?"Pago / recebido":s==="enviado_whatsapp"?"Enviado pelo WhatsApp":s==="em_producao"?"Em produção":s==="concluido"||s==="concluida"?"Concluído":s.replace(/_/g," ");
        return <article key={order.id} className="rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4"><div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"><div className="min-w-0"><div className="text-xs text-white/40">Pedido #{order.id.slice(0,8)} · {new Date(order.created_at).toLocaleString("pt-BR")}</div><h3 className="mt-1 break-words text-lg font-black">{order.customer_name||"Cliente sem nome"}</h3><div className="mt-1 text-sm text-white/60">{order.item_count||items.reduce((n,x)=>n+Number(x.quantity||0),0)} marmita(s) · {money(Number(order.total||0))}</div></div><span className="rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-3 py-1.5 text-xs font-bold text-[#c4d38c]">{statusLabel(order.status||"recebido")}</span></div>
        <div className="mt-3 rounded-xl border border-white/5 bg-white/[.025] p-3"><div className="mb-2 text-xs font-black uppercase tracking-wider text-white/45">Itens solicitados</div><div className="space-y-2">{items.map((item,i)=><div key={i} className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0"><div className="min-w-0"><div className="break-words text-sm font-semibold">{item.name||"Item sem nome"}</div><div className="mt-0.5 text-xs text-white/40">{item.line||"Linha não informada"} · {item.weight||"Peso não informado"}</div></div><div className="shrink-0 rounded-lg bg-white/5 px-2.5 py-1.5 text-sm font-black">×{Number(item.quantity||0)}</div></div>)}</div></div>
        {order.notes&&<div className="mt-3 rounded-lg bg-white/[.025] p-3 text-sm text-white/65"><b>Observações:</b> {order.notes}</div>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="text-xs text-white/45">{linked.length?linked.length+" registro(s) de produção vinculado(s)":"Sem registro de produção vinculado"}</div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void createProductionPlan(order)} className="rounded-full border border-[#a7b86a]/50 px-4 py-2.5 text-sm font-black text-[#c4d38c] disabled:opacity-50">Gerar plano de produção</button><button type="button" onClick={()=>printOrderProductionSheet(order)} className="rounded-full bg-[#ef7d18] px-4 py-2.5 text-sm font-black text-black">Imprimir ficha</button></div></div>
        {linked.length>0&&<div className="mt-3 space-y-2">{linked.map(p=><button type="button" key={p.id} onClick={()=>setSelectedProduction(p)} className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 p-3 text-left"><span className="text-sm font-semibold">{recipes.find(r=>r.id===p.recipe_id)?.name||products.find(x=>x.id===p.product_id)?.name||"Produção vinculada"} · {p.quantity} un.</span><span className="text-xs text-[#c4d38c]">{statusLabel(p.status)}</span></button>)}</div>}</article>
      })}</div>
    </div><div className="grid gap-3 sm:grid-cols-3">{([{key:"planejada",label:"Planejadas",count:production.filter(x=>x.status==="planejada").length},{key:"em_producao",label:"Em produção",count:production.filter(x=>x.status==="em_producao").length},{key:"concluida",label:"Concluídas",count:production.filter(x=>x.status==="concluida").length}] as const).map(s=><button key={s.key} type="button" onClick={()=>setProductionFilter(productionFilter===s.key?"todas":s.key)} aria-pressed={productionFilter===s.key} className={"rounded-2xl border p-4 text-left transition "+(productionFilter===s.key?"border-[#a7b86a] bg-[#a7b86a]/10":"border-white/10 bg-white/[.025] hover:border-[#a7b86a]/50")}><div className="text-sm text-white/55">{s.label}</div><div className="mt-2 text-3xl font-black">{s.count}</div><div className="mt-2 text-xs text-[#c4d38c]">Toque para filtrar</div></button>)}</div>
    <div className="mt-5 min-w-0 rounded-2xl border border-white/10 bg-white/[.025] p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-black">Fichas técnicas</div>
          <div className="mt-1 text-xs text-white/40">Cadastre o rendimento e associe os insumos de cada preparo.</div>
        </div>
        <div className="text-xs font-bold text-white/35">{filteredRecipes.length} ficha(s) exibida(s)</div>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input value={recipeForm.name} onChange={e=>setRecipeForm({...recipeForm,name:e.target.value})} placeholder="Nome da ficha" className={input}/>
        <input value={recipeForm.product_name} onChange={e=>setRecipeForm({...recipeForm,product_name:e.target.value})} placeholder="Produto / prato" className={input}/>
        <input type="number" step="0.001" value={recipeForm.yield_quantity} onChange={e=>setRecipeForm({...recipeForm,yield_quantity:e.target.value})} placeholder="Rendimento" className={input}/>
        <button onClick={()=>void addRecipe()} disabled={busy} className="w-full min-w-0 rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black sm:w-auto">Criar ficha</button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
        <div className="relative">
          <input
            value={recipeSearch}
            onChange={e=>setRecipeSearch(e.target.value)}
            placeholder="Buscar ficha técnica ou prato..."
            aria-label="Buscar ficha técnica ou prato"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 outline-none focus:border-[#a7b86a]/60"
          />
          {recipeSearch&&<button type="button" onClick={()=>setRecipeSearch("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-black text-white/55 hover:bg-white/10">×</button>}
        </div>
      </div>

      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
        <select value={recipeItemForm.recipe_id} onChange={e=>setRecipeItemForm({...recipeItemForm,recipe_id:e.target.value})} className={input}>
          <option value="">Ficha técnica</option>
          {recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={recipeItemForm.item_id} onChange={e=>setRecipeItemForm({...recipeItemForm,item_id:e.target.value})} className={input}>
          <option value="">Insumo</option>
          {inventory.map(i=><option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
        </select>
        <input type="number" step="0.001" value={recipeItemForm.quantity} onChange={e=>setRecipeItemForm({...recipeItemForm,quantity:e.target.value})} placeholder="Quantidade por rendimento" className={input}/>
        <button onClick={()=>void addRecipeItem()} disabled={busy} className="w-full min-w-0 rounded-full bg-[#ef7d18] px-4 py-3 text-sm font-black text-black sm:w-auto">Adicionar insumo</button>
      </div>

      {filteredRecipes.length===0&&<div className="mt-3 rounded-2xl border border-white/10 bg-white/[.025] p-5 text-center text-sm text-white/45">Nenhuma ficha técnica encontrada. Tente outro nome.</div>}
      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
        {filteredRecipes.map(r=><div key={r.id} className="min-w-0 overflow-hidden rounded-xl border border-white/5 bg-black/10 p-3">
          <div className="truncate font-black">{r.name}</div>
          <div className="mt-1 truncate text-xs text-white/35">{r.product_name||"Sem produto"} · rendimento {r.yield_quantity} {r.yield_unit}</div>
          <div className="mt-2 break-words text-xs text-white/55">{recipeItems.filter(x=>x.recipe_id===r.id).map(x=>{const item=inventory.find(i=>i.id===x.item_id);return item?item.name+" · "+x.quantity+" "+item.unit:null}).filter(Boolean).join(" · ")||"Nenhum insumo cadastrado"}</div>
          <div className="mt-2 text-xs text-white/60">Custo estimado dos insumos: <b>{money(recipeItems.filter(x=>x.recipe_id===r.id).reduce((sum,x)=>{const item=inventory.find(i=>i.id===x.item_id);return sum+Number(x.quantity)*Number(item?.average_cost||0)},0))}</b></div>
          <button type="button" onClick={()=>printRecipe(r)} className="mt-3 rounded-full border border-[#ef7d18]/40 px-3 py-2 text-xs font-bold text-[#f1b06e]">Imprimir / salvar PDF</button>
        </div>)}
      </div>
    </div>
    <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-4">
      <select value={productionForm.recipe_id} onChange={e=>setProductionForm({...productionForm,recipe_id:e.target.value})} className={input}><option value="">Selecionar ficha técnica</option>{recipes.map(r=><option key={r.id} value={r.id}>{r.name} — rendimento {r.yield_quantity} {r.yield_unit}</option>)}</select>
      <input type="number" step="0.001" value={productionForm.quantity} onChange={e=>setProductionForm({...productionForm,quantity:e.target.value})} placeholder="Quantidade a produzir" className={input}/>
      <select value={productionForm.status} onChange={e=>setProductionForm({...productionForm,status:e.target.value})} className={input}><option value="planejada">Planejada</option><option value="em_producao">Em produção</option><option value="concluida">Concluída</option></select>
      <button onClick={()=>void addProduction()} disabled={busy} className="rounded-full bg-[#a7b86a] px-4 py-3 text-sm font-black text-black">Criar produção</button>
    </div>
    <div className="mt-5 min-w-0"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><div className="font-black">Fila e histórico de produção</div><div className="text-xs text-white/40">Toque em um registro para consultar os detalhes.</div></div><button type="button" onClick={()=>setProductionFilter("todas")} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold">Mostrar todas</button></div>{production.filter(p=>productionFilter==="todas"||p.status===productionFilter).length===0?<div className="rounded-xl border border-white/10 p-4 text-sm text-white/45">Nenhuma produção nesta situação.</div>:<Table><thead><tr><Th>Data</Th><Th>Prato / ficha</Th><Th>Qtd.</Th><Th>Status</Th><Th>Estoque</Th><Th>Pedido vinculado</Th></tr></thead><tbody>{production.filter(p=>productionFilter==="todas"||p.status===productionFilter).map(p=>{const recipe=recipes.find(r=>r.id===p.recipe_id);const product=products.find(x=>x.id===p.product_id);return <tr key={p.id} onClick={()=>setSelectedProduction(p)} className="cursor-pointer border-t border-white/5 hover:bg-white/[.04]"><Td>{new Date(p.produced_at||p.created_at).toLocaleString("pt-BR")}</Td><Td><b>{recipe?.name||product?.name||"Prato não identificado"}</b><div className="text-xs text-white/35">{recipe?.product_name||product?.name||""}</div></Td><Td>{p.quantity}</Td><Td>{p.status==="planejada"?"Planejada":p.status==="em_producao"?"Em produção":p.status==="concluida"?"Concluída":p.status}</Td><Td>{p.stock_consumed?"Baixado":"Pendente"}</Td><Td>{p.order_id?"#"+p.order_id.slice(0,8):"Sem vínculo"}</Td></tr>})}</tbody></Table>}</div>{selectedProduction&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center" onClick={()=>setSelectedProduction(null)}><div role="dialog" aria-modal="true" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d110b] p-5 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-widest text-[#a7b86a]">Detalhes da produção</div><h3 className="mt-2 text-xl font-black">{recipes.find(r=>r.id===selectedProduction.recipe_id)?.name||products.find(x=>x.id===selectedProduction.product_id)?.name||"Produção"}</h3></div><button type="button" onClick={()=>setSelectedProduction(null)} className="rounded-full border border-white/10 px-3 py-2 text-sm">Fechar</button></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Quantidade</div><div className="mt-1 text-lg font-bold">{selectedProduction.quantity}</div></div><div className="rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Situação</div><div className="mt-1 font-bold">{selectedProduction.status==="planejada"?"Planejada":selectedProduction.status==="em_producao"?"Em produção":selectedProduction.status==="concluida"?"Concluída":selectedProduction.status}</div></div><div className="rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Data</div><div className="mt-1 text-sm">{new Date(selectedProduction.produced_at||selectedProduction.created_at).toLocaleString("pt-BR")}</div></div><div className="rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Baixa de estoque</div><div className="mt-1 font-bold">{selectedProduction.stock_consumed?"Concluída":"Pendente"}</div></div></div><div className="mt-3 rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Cliente / pedido</div><div className="mt-1 break-all text-sm">{selectedProduction.order_id?"ID do pedido: "+selectedProduction.order_id:"Esta produção não tem pedido vinculado."}</div></div><div className="mt-3 rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Produto / prato</div><div className="mt-1">{recipes.find(r=>r.id===selectedProduction.recipe_id)?.product_name||products.find(x=>x.id===selectedProduction.product_id)?.name||"Não identificado"}</div></div><div className="mt-3 rounded-xl border border-white/10 p-3"><div className="text-xs text-white/40">Observações</div><div className="mt-1 whitespace-pre-wrap">{selectedProduction.notes||"Nenhuma observação registrada."}</div></div><div className="mt-4"><label className="mb-2 block text-sm font-bold">Atualizar situação</label><select value={selectedProduction.status} onChange={e=>{void updateProductionStatus(selectedProduction.id,e.target.value);setSelectedProduction({...selectedProduction,status:e.target.value});}} className={input}><option value="planejada">Planejada</option><option value="em_producao">Em produção</option><option value="concluida">Concluída</option></select><p className="mt-2 text-xs text-white/40">A conclusão continua sujeita às validações de estoque.</p></div></div></div>}
  </Panel></div>;
  }
  return <div>
    {error&&<div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]" role="alert"><span>{error}</span><button onClick={()=>setError("")} className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-xs font-black">Fechar</button></div>}
    <Panel title="Cupons e campanhas"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><input value={coupon.code} onChange={e=>setCoupon({...coupon,code:e.target.value})} placeholder="Código" className={input}/><select value={coupon.discount_type} onChange={e=>setCoupon({...coupon,discount_type:e.target.value})} className={input}><option value="percent">Percentual</option><option value="fixed">Valor fixo</option></select><input type="number" step="0.01" value={coupon.discount_value} onChange={e=>setCoupon({...coupon,discount_value:e.target.value})} placeholder="Desconto" className={input}/><input type="number" step="0.01" value={coupon.minimum_order_value} onChange={e=>setCoupon({...coupon,minimum_order_value:e.target.value})} placeholder="Pedido mínimo" className={input}/><button onClick={()=>void addCoupon()} disabled={busy} className="rounded-full bg-[#a7b86a] px-5 py-3 text-sm font-black text-black">Criar cupom</button></div><Table><thead><tr><Th>Código</Th><Th>Desconto</Th><Th>Usos</Th><Th>Validade</Th><Th>Status</Th><Th>Ações</Th></tr></thead><tbody>{coupons.map(c=><tr key={c.id} className="border-t border-white/5"><Td><b>{c.code}</b><div className="text-xs text-white/35">{c.description||""}</div></Td><Td>{c.discount_type==="percent"?c.discount_value+"%":money(c.discount_value)}</Td><Td>{c.uses_count}{c.max_uses?"/"+c.max_uses:""}</Td><Td>{c.expires_at?new Date(c.expires_at).toLocaleDateString("pt-BR"):"Sem validade"}</Td><Td><span className={"rounded-full px-2.5 py-1 text-xs font-bold "+(c.active?"bg-[#a7b86a]/15 text-[#cbd99a]":"bg-white/5 text-white/40")}>{c.active?"Ativo":"Inativo"}</span></Td><Td><div className="flex flex-wrap gap-2"><button onClick={()=>void toggleCoupon(c)} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black">{c.active?"Desativar":"Ativar"}</button><button onClick={()=>void deleteCoupon(c)} disabled={busy} className="rounded-full border border-[#ef7d18]/30 px-3 py-2 text-xs font-black text-[#ef9b55]">{c.uses_count>0?"Desativar":"Excluir"}</button></div></Td></tr>)}</tbody></Table></Panel></div>;
}
function Panel({title,children}:{title:string;children:ReactNode}){return <div className="min-w-0 w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0d110b] p-4 sm:p-6"><h2 className="mb-5 text-2xl font-black">{title}</h2>{children}</div>}
function Table({children}:{children:ReactNode}){return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">{children}</table></div>}
function Th({children}:{children:ReactNode}){return <th className="p-3 text-xs text-white/35">{children}</th>}
function Td({children}:{children:ReactNode}){return <td className="p-3">{children}</td>}
function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-white/35">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>}
