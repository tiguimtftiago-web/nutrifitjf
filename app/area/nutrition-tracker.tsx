"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type MealType = "cafe_da_manha" | "almoco" | "jantar" | "lanche" | "outro";
type Meal = { id:string; meal_name:string; meal_type:MealType; consumed_at:string; calories:number; protein_g:number; carbs_g:number; fat_g:number; notes:string|null };
type Session = { access_token?:string };
const mealLabels:Record<MealType,string>={cafe_da_manha:"Café da manhã",almoco:"Almoço",jantar:"Jantar",lanche:"Lanche",outro:"Outro"};
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}

export default function NutritionTracker(){
 const [rows,setRows]=useState<Meal[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [name,setName]=useState("");
 const [type,setType]=useState<MealType>("almoco");
 const [date,setDate]=useState(todayISO);
 const [calories,setCalories]=useState("");
 const [protein,setProtein]=useState("");
 const [carbs,setCarbs]=useState("");
 const [fat,setFat]=useState("");
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
   const response=await fetch(`${config.url}/rest/v1/nutrifit360_meal_entries?select=id,meal_name,meal_type,consumed_at,calories,protein_g,carbs_g,fat_g,notes&order=consumed_at.desc,created_at.desc&limit=30`,{headers,cache:"no-store"});
   if(!response.ok) throw new Error("Não foi possível carregar suas refeições.");
   setRows(await response.json() as Meal[]);
  }catch(e){setError(e instanceof Error?e.message:"Falha ao carregar o diário.");}
  finally{setLoading(false);}
 },[config,requestHeaders]);
 useEffect(()=>{void load();},[load]);
 const totals=useMemo(()=>rows.filter(r=>r.consumed_at===todayISO()).reduce((a,r)=>({calories:a.calories+Number(r.calories),protein:a.protein+Number(r.protein_g),carbs:a.carbs+Number(r.carbs_g),fat:a.fat+Number(r.fat_g)}),{calories:0,protein:0,carbs:0,fat:0}),[rows]);
 const macroKcal=[totals.carbs*4,totals.protein*4,totals.fat*9];
 const macroTotal=macroKcal.reduce((a,b)=>a+b,0);
 const circumference=2*Math.PI*48;
 const segments=macroKcal.map(v=>macroTotal>0?v/macroTotal*circumference:0);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");
  if(name.trim().length<2){setError("Informe o nome da refeição.");return;}
  const numeric=[calories,protein,carbs,fat].map(v=>v.trim()===""?0:Number(v));
  if(numeric.some(v=>!Number.isFinite(v)||v<0)){setError("Confira os valores nutricionais informados.");return;}
  setSaving(true);
  try{
   const headers=requestHeaders();
   const response=await fetch(`${config.url}/rest/v1/nutrifit360_meal_entries`,{method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({meal_name:name.trim(),meal_type:type,consumed_at:date,calories:numeric[0],protein_g:numeric[1],carbs_g:numeric[2],fat_g:numeric[3],notes:notes.trim()||null})});
   if(!response.ok) throw new Error("Não foi possível salvar. Verifique os valores e tente novamente.");
   setName("");setCalories("");setProtein("");setCarbs("");setFat("");setNotes("");
   await load();
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
   <div className="nf-nutrition-head"><div><div className="nf-eyebrow">NOVO REGISTRO</div><h4>Registrar refeição</h4></div></div>
   <label>Nome da refeição<input value={name} onChange={e=>setName(e.target.value)} maxLength={120} required placeholder="Ex.: Frango, arroz e legumes"/></label>
   <div className="nf-meal-fields">
    <label>Tipo<select value={type} onChange={e=>setType(e.target.value as MealType)}>{Object.entries(mealLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label>Data<input type="date" value={date} max={todayISO()} onChange={e=>setDate(e.target.value)} required/></label>
   </div>
   <div className="nf-meal-fields nf-meal-macros">
    <label>Calorias (kcal)<input type="number" min="0" max="10000" step="1" value={calories} onChange={e=>setCalories(e.target.value)} placeholder="0"/></label>
    <label>Proteína (g)<input type="number" min="0" max="1000" step=".1" value={protein} onChange={e=>setProtein(e.target.value)} placeholder="0"/></label>
    <label>Carboidratos (g)<input type="number" min="0" max="1000" step=".1" value={carbs} onChange={e=>setCarbs(e.target.value)} placeholder="0"/></label>
    <label>Gorduras (g)<input type="number" min="0" max="1000" step=".1" value={fat} onChange={e=>setFat(e.target.value)} placeholder="0"/></label>
   </div>
   <label>Observação (opcional)<input value={notes} onChange={e=>setNotes(e.target.value)} maxLength={500} placeholder="Detalhes da refeição"/></label>
   {error&&<p className="nf-meal-error" role="alert">{error}</p>}
   <button className="nf-chart-action" type="submit" disabled={saving}>{saving?"Salvando…":"Salvar refeição"}</button>
  </form>
  <div className="nf-meal-history"><div className="nf-nutrition-head"><h4>Histórico de refeições</h4><button type="button" onClick={()=>void load()} aria-label="Atualizar histórico">Atualizar</button></div>
   {loading?<p className="nf-nutrition-empty">Carregando registros…</p>:rows.length===0?<p className="nf-nutrition-empty">Nenhuma refeição registrada. Use o formulário acima para começar seu diário.</p>:rows.map(row=><article className="nf-meal-row" key={row.id}><div><b>{row.meal_name}</b><small>{mealLabels[row.meal_type]} · {new Date(row.consumed_at+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><strong>{Number(row.calories).toLocaleString("pt-BR")} kcal</strong><p>P {Number(row.protein_g)} g · C {Number(row.carbs_g)} g · G {Number(row.fat_g)} g</p></article>)}
  </div>
 </section>;
}
