"use client";

import { useEffect, useState } from "react";
import { Activity, Dumbbell, Scale, Utensils, Target } from "lucide-react";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sessionKey="nutrifit360.session";
type Meal={calories:number;protein_g:number;carbs_g:number;fat_g:number};
type Training={duration_minutes:number};
type Weight={weight_kg:number};
type Goal={id:string;title:string;goal_type:string;status:string;target_value:number|null;unit:string};
type Data={weight:number|null;workouts:number;meals:number;calories:number;protein:number;carbs:number;fat:number;minutes:number;activeGoals:Goal[]};
function iso(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function weekStart(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d);}
function fmt(n:number){return n.toLocaleString("pt-BR",{maximumFractionDigits:1});}
const initial:Data={weight:null,workouts:0,meals:0,calories:0,protein:0,carbs:0,fat:0,minutes:0,activeGoals:[]};
function Ring({value,max,label,color,unit}:{value:number;max:number;label:string;color:string;unit:string}) {
 const radius=42,circumference=2*Math.PI*radius,progress=max>0?Math.min(value/max,1):0;
 return <div className="nf-home-ring"><svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${fmt(value)} de ${fmt(max)} ${unit}`}><circle className="track" cx="50" cy="50" r={radius}/><circle className="value" cx="50" cy="50" r={radius} stroke={color} strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress)}/></svg><div className="nf-home-ring-copy"><strong>{fmt(value)}</strong><small>{unit}</small></div><b>{label}</b></div>;
}
export default function DashboardSummary(){
 const [data,setData]=useState<Data>(initial);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let live=true;async function load(){try{
  const raw=localStorage.getItem(sessionKey);const session=raw?JSON.parse(raw) as {access_token?:string}:null;
  if(!session?.access_token||!url||!key)throw new Error("Entre novamente para carregar seus indicadores.");
  const headers={apikey:key,Authorization:`Bearer ${session.access_token}`};const today=iso(new Date());
  const paths=["nutrifit360_weight_entries?select=weight_kg&order=measured_at.desc,created_at.desc&limit=1",`nutrifit360_training_sessions?select=duration_minutes&performed_at=gte.${weekStart()}&performed_at=lte.${today}`,`nutrifit360_meal_entries?select=calories,protein_g,carbs_g,fat_g&consumed_at=eq.${today}`,"nutrifit360_goals?select=id,title,goal_type,status,target_value,unit&status=eq.active&order=created_at.desc&limit=20"];
  const responses=await Promise.all(paths.map(path=>fetch(`${url}/rest/v1/${path}`,{cache:"no-store",headers})));
  if(responses.some(r=>!r.ok))throw new Error("Não foi possível atualizar os indicadores.");
  const [weights,trainings,meals,goals]=await Promise.all(responses.map(r=>r.json())) as [Weight[],Training[],Meal[],Goal[]];
  const next:Data={weight:weights.length?Number(weights[0].weight_kg):null,workouts:trainings.length,meals:meals.length,calories:meals.reduce((s,m)=>s+Number(m.calories||0),0),protein:meals.reduce((s,m)=>s+Number(m.protein_g||0),0),carbs:meals.reduce((s,m)=>s+Number(m.carbs_g||0),0),fat:meals.reduce((s,m)=>s+Number(m.fat_g||0),0),minutes:trainings.reduce((s,t)=>s+Number(t.duration_minutes||0),0),activeGoals:goals};
  if(live)setData(next);
 }catch(e){if(live)setError(e instanceof Error?e.message:"Falha ao carregar indicadores.");}finally{if(live)setLoading(false);}}
 void load();return()=>{live=false;};},[]);
 return <div className="nf-dashboard-summary">
  <section className="nf-home-panorama">
   <div className="nf-home-panorama-head"><div><span className="nf-eyebrow">SEUS DADOS REAIS</span><h3>Seu panorama hoje</h3></div><span className="nf-live-label">{loading?"ATUALIZANDO":"ATUALIZADO"}</span></div>
   <div className="nf-home-rings">
    <Ring value={data.calories} max={2000} label="Calorias" unit="kcal" color="#a4c64a"/>
    <Ring value={data.protein} max={100} label="Proteína" unit="g" color="#f28a22"/>
    <Ring value={data.workouts} max={5} label="Treinos" unit="sessões" color="#78afd0"/>
   </div>
   <div className="nf-home-stats">
    <article><span><Scale size={15}/> PESO ATUAL</span><strong>{loading?"…":data.weight===null?"—":fmt(data.weight)} <small>kg</small></strong><a href="#evolucao">Ver evolução</a></article>
    <article><span><Dumbbell size={15}/> TEMPO ATIVO</span><strong>{loading?"…":fmt(data.minutes)} <small>min</small></strong><a href="#treino">Ver treinos</a></article>
    <article><span><Utensils size={15}/> REFEIÇÕES HOJE</span><strong>{loading?"…":data.meals}</strong><a href="#alimentacao">Abrir nutrição</a></article>
    <article><span><Target size={15}/> METAS ATIVAS</span><strong>{loading?"…":data.activeGoals.length}</strong><a href="#metas">Acompanhar metas</a></article>
   </div>
   <div className="nf-home-macros"><div><span>Carboidratos</span><b>{loading?"…":fmt(data.carbs)} g</b></div><div><span>Proteínas</span><b>{loading?"…":fmt(data.protein)} g</b></div><div><span>Gorduras</span><b>{loading?"…":fmt(data.fat)} g</b></div></div>
   {error&&<p className="nf-dashboard-error" role="status">{error}</p>}
  </section>
  {data.activeGoals.length>0&&<section className="nf-dashboard-goals"><b>Metas em andamento</b>{data.activeGoals.slice(0,2).map(goal=><a href="#metas" key={goal.id}><span>{goal.title}</span><small>{goal.goal_type==="weight"?"Peso":goal.goal_type==="workouts"?"Treinos":"Personalizada"}</small></a>)}</section>}
 </div>;
}
