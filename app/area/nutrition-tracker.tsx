"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type MealType = "cafe_da_manha" | "almoco" | "jantar" | "lanche" | "outro";
type Food = { id:string; name:string; category:string; preparation:string; calories_per_100g:number; protein_g_per_100g:number; carbs_g_per_100g:number; fat_g_per_100g:number; source_name:string; source_reference:string|null };
type Portion = { food:Food; grams:number };
type SavedFood = { food_id:string; name:string; preparation:string; grams:number; calories:number; protein_g:number; carbs_g:number; fat_g:number; source_name:string; source_reference:string|null };
type Meal = { id:string; meal_name:string; meal_type:MealType; consumed_at:string; calories:number; protein_g:number; carbs_g:number; fat_g:number; notes:string|null; foods?:SavedFood[] };
type Session = { access_token?:string };
const mealLabels:Record<MealType,string>={cafe_da_manha:"Café da manhã",almoco:"Almoço",jantar:"Jantar",lanche:"Lanche",outro:"Outro"};
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const n=(v:number)=>Number(v.toFixed(1));
function nutrition(food:Food,grams:number){const f=grams/100;return {calories:n(Number(food.calories_per_100g)*f),protein_g:n(Number(food.protein_g_per_100g)*f),carbs_g:n(Number(food.carbs_g_per_100g)*f),fat_g:n(Number(food.fat_g_per_100g)*f)};}

export default function NutritionTracker(){
 const [rows,setRows]=useState<Meal[]>([]);
 const [foods,setFoods]=useState<Food[]>([]);
 const [portions,setPortions]=useState<Portion[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [selectedFood,setSelectedFood]=useState("");
 const [grams,setGrams]=useState("100");
 const [type,setType]=useState<MealType>("almoco");
 const [date,setDate]=useState(todayISO);
 const [notes,setNotes]=useState("");
 const config=useMemo(()=>({url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}),[]);
 const requestHeaders=useCallback(()=>{
  const raw=localStorage.getItem("nutrifit360.session");
  const session:Session=raw?JSON.parse(raw) as Session:{};
  if(!config.url||!config.key||!session.access_token) throw new Error("Sua sessão expirou. Entre novamente para acessar o diário alimentar.");
  return {apikey:config.key,Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"};
 },[config]);
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   const headers=requestHeaders();
   const [mealResponse,foodResponse]=await Promise.all([
    fetch(`${config.url}/rest/v1/nutrifit360_meal_entries?select=id,meal_name,meal_type,consumed_at,calories,protein_g,carbs_g,fat_g,notes,foods&order=consumed_at.desc,created_at.desc&limit=30`,{headers,cache:"no-store"}),
    fetch(`${config.url}/rest/v1/nutrifit360_foods?select=id,name,category,preparation,calories_per_100g,protein_g_per_100g,carbs_g_per_100g,fat_g_per_100g,source_name,source_reference&active=eq.true&order=name.asc&limit=300`,{headers,cache:"no-store"})
   ]);
   if(!mealResponse.ok) throw new Error("Não foi possível carregar suas refeições.");
   if(!foodResponse.ok) throw new Error("Não foi possível carregar a base nutricional. Tente novamente.");
   setRows(await mealResponse.json() as Meal[]);
   const available=await foodResponse.json() as Food[];
   setFoods(available);
   setSelectedFood(current=>available.some(f=>f.id===current)?current:(available[0]?.id??""));
  }catch(e){setError(e instanceof Error?e.message:"Falha ao carregar o diário.");}
  finally{setLoading(false);}
 },[config,requestHeaders]);
 useEffect(()=>{void load();},[load]);
 const filteredFoods=useMemo(()=>{const q=search.trim().toLocaleLowerCase("pt-BR");return foods.filter(f=>!q||`${f.name} ${f.preparation} ${f.category}`.toLocaleLowerCase("pt-BR").includes(q));},[foods,search]);
 const totals=useMemo(()=>rows.filter(r=>r.consumed_at===todayISO()).reduce((a,r)=>({calories:a.calories+Number(r.calories),protein:a.protein+Number(r.protein_g),carbs:a.carbs+Number(r.carbs_g),fat:a.fat+Number(r.fat_g)}),{calories:0,protein:0,carbs:0,fat:0}),[rows]);
 const mealTotals=useMemo(()=>portions.reduce((a,p)=>{const v=nutrition(p.food,p.grams);return {calories:a.calories+v.calories,protein:a.protein+v.protein_g,carbs:a.carbs+v.carbs_g,fat:a.fat+v.fat_g};},{calories:0,protein:0,carbs:0,fat:0}),[portions]);
 const mealName=portions.map(p=>p.food.name).filter((v,i,a)=>a.indexOf(v)===i).join(" + ");
 const macroKcal=[totals.carbs*4,totals.protein*4,totals.fat*9];
 const macroTotal=macroKcal.reduce((a,b)=>a+b,0);
 const circumference=2*Math.PI*48;
 const segments=macroKcal.map(v=>macroTotal>0?v/macroTotal*circumference:0);
 function addFood(){
  setError("");
  const food=foods.find(f=>f.id===selectedFood);
  const amount=Number(grams);
  if(!food){setError("Selecione um alimento cadastrado.");return;}
  if(!Number.isFinite(amount)||amount<=0||amount>3000){setError("Informe uma quantidade entre 1 e 3.000 gramas.");return;}
  setPortions(current=>[...current,{food,grams:amount}]);
  setGrams("100");
 }
 function removeFood(index:number){setPortions(current=>current.filter((_,i)=>i!==index));}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");
  if(!portions.length){setError("Adicione pelo menos um alimento à refeição.");return;}
  setSaving(true);
  try{
   const headers=requestHeaders();
   const foodsSnapshot:SavedFood[]=portions.map(p=>({food_id:p.food.id,name:p.food.name,preparation:p.food.preparation,grams:p.grams,...nutrition(p.food,p.grams),source_name:p.food.source_name,source_reference:p.food.source_reference}));
   const response=await fetch(`${config.url}/rest/v1/nutrifit360_meal_entries`,{method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({meal_name:mealName.slice(0,120),meal_type:type,consumed_at:date,calories:n(mealTotals.calories),protein_g:n(mealTotals.protein),carbs_g:n(mealTotals.carbs),fat_g:n(mealTotals.fat),notes:notes.trim()||null,foods:foodsSnapshot})});
   if(!response.ok){const detail=await response.text();console.error("Nutrition entry save failed",detail.slice(0,400));throw new Error("Não foi possível salvar. Atualize a página e tente novamente.");}
   setPortions([]);setNotes("");await load();
  }catch(e){setError(e instanceof Error?e.message:"Falha ao salvar a refeição.");}
  finally{setSaving(false);}
 }
 return <section className="nf-nutrition-tracker" aria-labelledby="nf-nutrition-title">
  <div className="nf-nutrition-head"><div><div className="nf-eyebrow">DIÁRIO ALIMENTAR</div><h4 id="nf-nutrition-title">Seus macronutrientes de hoje</h4></div><span>{rows.filter(r=>r.consumed_at===todayISO()).length} refeições</span></div>
  <div className="nf-macro-layout">
   <div className="nf-macro-chart" role="img" aria-label={`Distribuição de macronutrientes: ${Math.round(totals.carbs)} gramas de carboidratos, ${Math.round(totals.protein)} gramas de proteínas e ${Math.round(totals.fat)} gramas de gorduras.`}>
    <svg viewBox="0 0 112 112" aria-hidden="true"><circle cx="56" cy="56" r="48" className="nf-macro-track"/>
    {macroTotal>0&&<><circle cx="56" cy="56" r="48" className="nf-macro-segment carbs" strokeDasharray={`${segments[0]} ${circumference-segments[0]}`} strokeDashoffset="0"/><circle cx="56" cy="56" r="48" className="nf-macro-segment protein" strokeDasharray={`${segments[1]} ${circumference-segments[1]}`} strokeDashoffset={-segments[0]}/><circle cx="56" cy="56" r="48" className="nf-macro-segment fat" strokeDasharray={`${segments[2]} ${circumference-segments[2]}`} strokeDashoffset={-(segments[0]+segments[1])}/></>}
    </svg><div className="nf-macro-center"><strong>{Math.round(totals.calories).toLocaleString("pt-BR")}</strong><small>kcal hoje</small></div>
   </div>
   <div className="nf-macro-legend">
    <div><i className="carbs"/><span>Carboidratos</span><b>{totals.carbs.toLocaleString("pt-BR",{maximumFractionDigits:1})} g</b></div>
    <div><i className="protein"/><span>Proteínas</span><b>{totals.protein.toLocaleString("pt-BR",{maximumFractionDigits:1})} g</b></div>
    <div><i className="fat"/><span>Gorduras</span><b>{totals.fat.toLocaleString("pt-BR",{maximumFractionDigits:1})} g</b></div>
   </div>
  </div>
  {macroTotal===0&&<p className="nf-nutrition-empty">Seus gráficos serão preenchidos conforme você registrar as refeições.</p>}
  <form className="nf-meal-form" onSubmit={submit}>
   <div className="nf-nutrition-head"><div><div className="nf-eyebrow">NOVO REGISTRO</div><h4>Monte sua refeição</h4></div></div>
   <p className="nf-nutrition-empty">Escolha os alimentos e informe a quantidade consumida em gramas. Os nutrientes são calculados automaticamente pela referência de cada alimento.</p>
   <div className="nf-food-adder">
    <label>Buscar alimento<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ex.: frango, batata, arroz"/></label>
    <label>Alimento cadastrado<select value={selectedFood} onChange={e=>setSelectedFood(e.target.value)} required><option value="">Selecione</option>{filteredFoods.map(f=><option key={f.id} value={f.id}>{f.name} — {f.preparation}</option>)}</select></label>
    <div className="nf-meal-fields">
     <label>Quantidade (g)<input type="number" min="1" max="3000" step="1" value={grams} onChange={e=>setGrams(e.target.value)} inputMode="decimal" required/></label>
     <button className="nf-food-add" type="button" onClick={addFood}>Adicionar alimento</button>
    </div>
   </div>
   {portions.length>0&&<div className="nf-food-portions" aria-live="polite">
    <h5>Itens da refeição</h5>
    {portions.map((p,i)=>{const v=nutrition(p.food,p.grams);return <article className="nf-food-portion" key={`${p.food.id}-${i}`}><div><b>{p.food.name}</b><small>{p.grams} g · {p.food.preparation}</small><small>{v.calories} kcal · P {v.protein_g} g · C {v.carbs_g} g · G {v.fat_g} g</small></div><button type="button" onClick={()=>removeFood(i)} aria-label={`Remover ${p.food.name}`}>Remover</button></article>;})}
   </div>}
   <div className="nf-food-summary">
    <div className="nf-eyebrow">TOTAL CALCULADO DA REFEIÇÃO</div>
    <div className="nf-food-kcal">{Math.round(mealTotals.calories)} <small>kcal</small></div>
    <div className="nf-food-macros"><span>Proteína <b>{n(mealTotals.protein)} g</b></span><span>Carboidratos <b>{n(mealTotals.carbs)} g</b></span><span>Gorduras <b>{n(mealTotals.fat)} g</b></span></div>
   </div>
   <div className="nf-meal-fields">
    <label>Tipo de refeição<select value={type} onChange={e=>setType(e.target.value as MealType)}>{Object.entries(mealLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label>Data<input type="date" value={date} max={todayISO()} onChange={e=>setDate(e.target.value)} required/></label>
   </div>
   <label>Observação (opcional)<input value={notes} onChange={e=>setNotes(e.target.value)} maxLength={500} placeholder="Ex.: refeição após o treino"/></label>
   {error&&<p className="nf-meal-error" role="alert">{error}</p>}
   <button className="nf-chart-action" type="submit" disabled={saving||portions.length===0}>{saving?"Salvando…":"Salvar refeição"}</button>
   <p className="nf-nutrition-empty">Base de referência: TACO/NEPA-Unicamp. Os valores variam conforme corte, preparo e ingredientes adicionados. Alimentos não cadastrados não recebem valores estimados.</p>
  </form>
  <div className="nf-meal-history"><div className="nf-nutrition-head"><h4>Histórico de refeições</h4><button type="button" onClick={()=>void load()} aria-label="Atualizar histórico">Atualizar</button></div>
   {loading?<p className="nf-nutrition-empty">Carregando registros…</p>:rows.length===0?<p className="nf-nutrition-empty">Nenhuma refeição registrada. Monte sua primeira refeição acima.</p>:rows.map(row=><article className="nf-meal-row" key={row.id}><div><b>{row.meal_name}</b><small>{mealLabels[row.meal_type]} · {new Date(row.consumed_at+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><strong>{Math.round(Number(row.calories)).toLocaleString("pt-BR")} kcal</strong><p>P {Number(row.protein_g).toLocaleString("pt-BR")} g · C {Number(row.carbs_g).toLocaleString("pt-BR")} g · G {Number(row.fat_g).toLocaleString("pt-BR")} g</p>{row.foods?.length?<small>{row.foods.map(food=>`${food.name} ${food.grams} g`).join(" + ")}</small>:null}</article>)}
  </div>
  <style jsx>{`
   .nf-food-adder,.nf-food-portions,.nf-food-summary{border:1px solid rgba(164,198,74,.2);border-radius:16px;padding:14px;margin:12px 0;background:rgba(164,198,74,.035)}
   .nf-food-adder{display:grid;gap:12px}
   .nf-food-adder label,.nf-meal-fields label{display:flex;flex-direction:column;gap:7px;min-width:0}
   .nf-food-adder input,.nf-food-adder select{width:100%;min-width:0}
   .nf-food-add{min-height:48px;border:0;border-radius:12px;padding:0 16px;background:#a4c64a;color:#10130d;font-weight:800;align-self:end}
   .nf-food-portions h5{margin:0 0 8px;font-weight:800}
   .nf-food-portion{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}
   .nf-food-portion div{display:grid;gap:3px;min-width:0}
   .nf-food-portion small{color:#a9b09f;font-size:12px}
   .nf-food-portion button,.nf-meal-history button{color:#f4a35e;text-decoration:underline;background:none;border:0;align-self:center}
   .nf-food-kcal{font-size:30px;font-weight:900;color:#a4c64a;margin:5px 0}
   .nf-food-kcal small{font-size:14px;color:#a9b09f}
   .nf-food-macros{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:#a9b09f}
   .nf-food-macros b{display:block;color:#f4f4ef;font-size:14px}
   .nf-meal-form>label{display:flex;flex-direction:column;gap:7px}
   .nf-meal-form .nf-meal-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
   @media(max-width:420px){.nf-meal-form .nf-meal-fields{grid-template-columns:1fr}}
  `}</style>
 </section>;
}
