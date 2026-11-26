"use client";

import { ReactNode, useEffect, useState } from "react";
import { Droplet, Target, Utensils } from "lucide-react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sessionKey = "nutrifit360.session";
type Meal = { calories:number; protein_g:number; carbs_g:number; fat_g:number };
type Training = { duration_minutes:number; performed_at:string };
type Goal = { id:string; title:string; goal_type:string; status:string; target_value:number|null; unit:string };
type Data = { meals:number; workouts:number; activeGoals:Goal[]; dailyWorkouts:number[] };
type Props = { onNavigate:(tab:"treino"|"nutricao"|"evolucao"|"metas")=>void; children?:ReactNode };
const weekdays = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
function iso(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function monday(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
const initial:Data={meals:0,workouts:0,activeGoals:[],dailyWorkouts:[0,0,0,0,0,0,0]};

export default function DashboardSummary({onNavigate,children}:Props){
 const [data,setData]=useState<Data>(initial);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let live=true;
  async function load(){
   try{
    const raw=localStorage.getItem(sessionKey);
    const session=raw?JSON.parse(raw) as {access_token?:string}:null;
    if(!session?.access_token||!url||!key)throw new Error("Entre novamente para carregar seus indicadores.");
    const headers={apikey:key,Authorization:`Bearer ${session.access_token}`};
    const start=monday(),today=iso(new Date());
    const paths=[
      `nutrifit360_meal_entries?select=id&consumed_at=eq.${today}`,
      `nutrifit360_training_sessions?select=duration_minutes,performed_at&performed_at=gte.${iso(start)}&performed_at=lte.${today}`,
      "nutrifit360_goals?select=id,title,goal_type,status,target_value,unit&status=eq.active&order=created_at.desc&limit=20"
    ];
    const responses=await Promise.all(paths.map(path=>fetch(`${url}/rest/v1/${path}`,{cache:"no-store",headers})));
    if(responses.some(r=>!r.ok))throw new Error("Não foi possível atualizar os indicadores.");
    const [meals,trainings,goals]=await Promise.all(responses.map(r=>r.json())) as [Array<{id:string}>,Training[],Goal[]];
    const dailyWorkouts=weekdays.map((_,index)=>{
      const d=new Date(start);d.setDate(start.getDate()+index);const day=iso(d);
      return trainings.filter(t=>t.performed_at===day).length;
    });
    if(live)setData({meals:meals.length,workouts:trainings.length,activeGoals:goals,dailyWorkouts});
   }catch(e){if(live)setError(e instanceof Error?e.message:"Falha ao carregar indicadores.");}
   finally{if(live)setLoading(false);}
  }
  void load();return()=>{live=false;};
 },[]);
 const workoutGoal=data.activeGoals.find(g=>g.goal_type==="workouts"&&Number(g.target_value)>0);
 const progress=workoutGoal?Math.min(100,Math.round(data.workouts/(workoutGoal.target_value as number)*100)):null;
 const max=Math.max(1,...data.dailyWorkouts);
 return <div className="nf-dashboard-summary">
  <section className="nf-reference-toprow" aria-label="Resumo diário e meta semanal">
   <div className="nf-reference-metrics">
    <article className="nf-reference-metric">
     <div className="nf-reference-metric-label"><Utensils size={17}/> <span>REFEIÇÕES DO DIA</span></div>
     <strong>{loading?"…":String(data.meals).padStart(2,"0")}</strong>
     <small>Registros de hoje</small>
    </article>
    <article className="nf-reference-metric">
     <div className="nf-reference-metric-label"><Droplet size={18}/> <span>ÁGUA</span></div>
     <strong>1,5 L</strong>
     <small>Referência visual de meta diária</small>
    </article>
   </div>
   <button type="button" className="nf-weekly-ticket" onClick={()=>onNavigate("metas")} aria-label="Abrir metas semanais">
    <span><Target size={18}/> META DA SEMANA</span>
    <strong>{progress===null?"—":`${progress}%`}</strong>
    <small>{progress===null?"Defina uma meta de treinos":`${data.workouts} de ${workoutGoal?.target_value} treinos`}</small>
   </button>
  </section>
  {children}
  <section className="nf-reference-lower">
   <article className="nf-reference-card nf-weekly-progress">
    <div className="nf-reference-card-heading"><h2>Evolução Semanal</h2><span>7 dias</span></div>
    <div className="nf-reference-bars" role="img" aria-label={`Treinos registrados por dia: ${data.dailyWorkouts.join(", ")}`}>
     {data.dailyWorkouts.map((count,index)=><div className="nf-reference-bar-column" key={weekdays[index]}>
       <span className={count>0?"has-value":""} style={{height:`${count?Math.max(18,count/max*64):8}px`}} title={`${count} treinos`}/>
       <small>{weekdays[index]}</small>
      </div>)}
    </div>
    <p>{loading?"Atualizando seus registros…":data.workouts===0?"Registre seus treinos para acompanhar sua evolução.":`${data.workouts} treino(s) registrado(s) nesta semana.`}</p>
   </article>
   <article className="nf-reference-card nf-achievements">
    <h2>Top Conquistas</h2>
    <div className="nf-achievement-pill"><span>💪</span><b>Força</b><span>🏆</span></div>
    <div className="nf-achievement-pill"><span>❤️</span><b>Disciplina</b><span>🏅</span></div>
    <div className="nf-achievement-pill"><span>🥗</span><b>Nutrição</b><span>🔥</span></div>
   </article>
  </section>
  {error&&<p className="nf-dashboard-error" role="status">{error}</p>}
 </div>;
}
