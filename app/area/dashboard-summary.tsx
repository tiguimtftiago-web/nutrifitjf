"use client";

import { useEffect, useState } from "react";
import { Activity, Dumbbell, Scale, Salad, Target, Utensils, ArrowRight } from "lucide-react";

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

export default function DashboardSummary(){
 const [data,setData]=useState<Data>(initial);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let live=true;
  async function load(){
   try{
    const raw=localStorage.getItem(sessionKey);const session=raw?JSON.parse(raw) as {access_token?:string}:null;
    if(!session?.access_token||!url||!key)throw new Error("Entre novamente para carregar seus indicadores.");
    const headers={apikey:key,Authorization:`Bearer ${session.access_token}`};
    const today=iso(new Date());
    const paths=[
     "nutrifit360_weight_entries?select=weight_kg&order=measured_at.desc,created_at.desc&limit=1",
     `nutrifit360_training_sessions?select=duration_minutes&performed_at=gte.${weekStart()}&performed_at=lte.${today}`,
     `nutrifit360_meal_entries?select=calories,protein_g,carbs_g,fat_g&consumed_at=eq.${today}`,
     "nutrifit360_goals?select=id,title,goal_type,status,target_value,unit&status=eq.active&order=created_at.desc&limit=20"
    ];
    const responses=await Promise.all(paths.map(path=>fetch(`${url}/rest/v1/${path}`,{cache:"no-store",headers})));
    if(responses.some(r=>!r.ok))throw new Error("Não foi possível atualizar todos os indicadores.");
    const [weights,trainings,meals,goals]=await Promise.all(responses.map(r=>r.json())) as [Weight[],Training[],Meal[],Goal[]];
    const next:Data={weight:weights.length?Number(weights[0].weight_kg):null,workouts:trainings.length,meals:meals.length,calories:meals.reduce((s,m)=>s+Number(m.calories||0),0),protein:meals.reduce((s,m)=>s+Number(m.protein_g||0),0),carbs:meals.reduce((s,m)=>s+Number(m.carbs_g||0),0),fat:meals.reduce((s,m)=>s+Number(m.fat_g||0),0),minutes:trainings.reduce((s,t)=>s+Number(t.duration_minutes||0),0),activeGoals:goals};
    if(live)setData(next);
   }catch(e){if(live)setError(e instanceof Error?e.message:"Falha ao carregar indicadores.");}
   finally{if(live)setLoading(false);}
  }
  void load();return()=>{live=false;};
 },[]);
 return <div className="nf-dashboard-summary">
  <div className="nf-metric-grid">
   <article className="nf-metric-card"><div className="nf-metric-top"><span>PESO ATUAL</span><Scale size={17}/></div><strong>{loading?"…":data.weight===null?"—":fmt(data.weight)} <small>kg</small></strong><p>{data.weight===null?"Adicione seu primeiro registro":"Última pesagem registrada"}</p><a href="#evolucao">Registrar peso <ArrowRight size={13}/></a></article>
   <article className="nf-metric-card"><div className="nf-metric-top"><span>TREINOS</span><Dumbbell size={17}/></div><strong>{loading?"…":data.workouts} <small>sessões</small></strong><p>{fmt(data.minutes)} min nesta semana</p><a href="#treino">Registrar treino <ArrowRight size={13}/></a></article>
   <article className="nf-metric-card"><div className="nf-metric-top"><span>ALIMENTAÇÃO</span><Utensils size={17}/></div><strong>{loading?"…":data.meals} <small>refeições</small></strong><p>{fmt(data.calories)} kcal registradas hoje</p><a href="#alimentacao">Abrir diário <ArrowRight size={13}/></a></article>
   <article className="nf-metric-card accent-card"><div className="nf-metric-top"><span>MINHAS METAS</span><Target size={17}/></div><strong>{loading?"…":data.activeGoals.length} <small>ativas</small></strong><p>{data.activeGoals[0]?.title||"Defina seu próximo objetivo"}</p><a href="#metas">Acompanhar metas <ArrowRight size={13}/></a></article>
  </div>
  <section className="nf-daily-charts" aria-labelledby="nf-daily-title">
   <div className="nf-chart-section-title"><div><div className="nf-eyebrow">SEUS INDICADORES</div><h3 id="nf-daily-title">Resumo dos registros</h3></div><span>{loading?"ATUALIZANDO":"DADOS DO DIA E DA SEMANA"}</span></div>
   <div className="nf-dashboard-data-grid">
    <article><small>CALORIAS HOJE</small><strong>{loading?"…":fmt(data.calories)} <i>kcal</i></strong><span>{data.meals} refeições registradas</span></article>
    <article><small>PROTEÍNA HOJE</small><strong>{loading?"…":fmt(data.protein)} <i>g</i></strong><span>Somatório das refeições</span></article>
    <article><small>CARBOIDRATOS HOJE</small><strong>{loading?"…":fmt(data.carbs)} <i>g</i></strong><span>Somatório das refeições</span></article>
    <article><small>GORDURAS HOJE</small><strong>{loading?"…":fmt(data.fat)} <i>g</i></strong><span>Somatório das refeições</span></article>
    <article><small>TREINOS NA SEMANA</small><strong>{loading?"…":data.workouts} <i>sessões</i></strong><span>{fmt(data.minutes)} minutos registrados</span></article>
   </div>
   {error&&<p className="nf-dashboard-error" role="status">{error} Os demais módulos continuam disponíveis.</p>}
  </section>
  {data.activeGoals.length>0&&<section className="nf-dashboard-goals"><b>Metas em andamento</b>{data.activeGoals.slice(0,3).map(goal=><a href="#metas" key={goal.id}><span>{goal.title}</span><small>{goal.goal_type==="weight"?"Peso":goal.goal_type==="workouts"?"Treinos":"Personalizada"}</small></a>)}</section>}
 </div>;
}
