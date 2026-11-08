"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
type GoalType = "weight" | "workouts" | "custom";
type GoalStatus = "active" | "completed" | "paused";
type Goal = { id: string; title: string; goal_type: GoalType; starting_value: number | null; target_value: number | null; unit: string; target_date: string | null; status: GoalStatus; notes: string | null; created_at: string };
type WeightRow = { weight_kg: number };
type TrainingRow = { performed_at: string };
type Session = { access_token: string; user: { id: string } };
const sessionKey = "nutrifit360.session";
function localISO(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function weekStart() { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return localISO(d); }
function fmt(value: number) { return value.toLocaleString("pt-BR",{maximumFractionDigits:2}); }

export default function GoalTracker() {
  const [goals,setGoals] = useState<Goal[]>([]);
  const [latestWeight,setLatestWeight] = useState<number|null>(null);
  const [weeklySessions,setWeeklySessions] = useState(0);
  const [title,setTitle] = useState("");
  const [type,setType] = useState<GoalType>("weight");
  const [starting,setStarting] = useState("");
  const [target,setTarget] = useState("");
  const [unit,setUnit] = useState("kg");
  const [targetDate,setTargetDate] = useState("");
  const [notes,setNotes] = useState("");
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");

  function getSession(): Session|null {
    try { const raw=localStorage.getItem(sessionKey); return raw ? JSON.parse(raw) as Session : null; } catch { return null; }
  }
  async function request(path:string, init?:RequestInit) {
    const current=getSession();
    if(!current?.access_token || !supabaseUrl || !supabaseKey) throw new Error("Entre novamente para acessar suas metas.");
    const response=await fetch(`${supabaseUrl}/rest/v1/${path}`,{...init,cache:"no-store",headers:{apikey:supabaseKey,Authorization:`Bearer ${current.access_token}`,...(init?.headers||{})}});
    if(response.status===401) throw new Error("Sua sessão expirou. Entre novamente.");
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.message||"Não foi possível acessar suas metas.");}
    return response;
  }
  async function load() {
    setLoading(true); setError("");
    try {
      const [goalResponse,weightResponse,trainingResponse]=await Promise.all([
        request("nutrifit360_goals?select=*&order=created_at.desc"),
        request("nutrifit360_weight_entries?select=weight_kg&order=measured_at.desc,created_at.desc&limit=1"),
        request(`nutrifit360_training_sessions?select=performed_at&performed_at=gte.${weekStart()}&performed_at=lte.${localISO()}`)
      ]);
      const [goalRows,weightRows,trainingRows]=await Promise.all([goalResponse.json(),weightResponse.json(),trainingResponse.json()]) as [Goal[],WeightRow[],TrainingRow[]];
      setGoals(goalRows); setLatestWeight(weightRows.length?Number(weightRows[0].weight_kg):null); setWeeklySessions(trainingRows.length);
    } catch(err){setError(err instanceof Error?err.message:"Falha ao carregar metas.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);

  const activeCount=useMemo(()=>goals.filter(g=>g.status==="active").length,[goals]);
  function progress(goal:Goal):number|null {
    if(goal.goal_type==="weight" && goal.starting_value!==null && goal.target_value!==null && latestWeight!==null){
      const total=Math.abs(goal.target_value-goal.starting_value);
      if(total===0)return latestWeight===goal.target_value?100:0;
      const moved=goal.target_value<goal.starting_value ? goal.starting_value-latestWeight : latestWeight-goal.starting_value;
      return Math.max(0,Math.min(100,moved/total*100));
    }
    if(goal.goal_type==="workouts" && goal.target_value!==null) return Math.min(100,weeklySessions/goal.target_value*100);
    return null;
  }
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    const current=getSession(); if(!current){setError("Entre novamente para salvar sua meta.");return;}
    const startValue=starting.trim()?Number(starting.replace(",",".")):null;
    const targetValue=target.trim()?Number(target.replace(",",".")):null;
    if(title.trim().length<2){setError("Informe um nome de meta com pelo menos 2 caracteres.");return;}
    if(type==="weight" && (!startValue || !targetValue || !Number.isFinite(startValue) || !Number.isFinite(targetValue))){setError("Informe seu peso inicial e o peso desejado.");return;}
    if(type==="workouts" && (!targetValue || !Number.isInteger(targetValue) || targetValue<1 || targetValue>14)){setError("Defina uma frequência entre 1 e 14 treinos por semana.");return;}
    if(type==="custom" && !targetValue){setError("Informe um valor-alvo para sua meta.");return;}
    if(targetDate && targetDate<localISO()){setError("A data-alvo não pode estar no passado.");return;}
    setBusy(true);
    try{
      await request("nutrifit360_goals",{method:"POST",headers:{"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({user_id:current.user.id,title:title.trim(),goal_type:type,starting_value:type==="weight"?startValue:null,target_value:targetValue,unit:type==="weight"?"kg":type==="workouts"?"treinos/semana":unit.trim(),target_date:targetDate||null,notes:notes.trim()||null})});
      setTitle("");setStarting("");setTarget("");setTargetDate("");setNotes("");setNotice("Meta registrada.");await load();
    }catch(err){setError(err instanceof Error?err.message:"Não foi possível salvar a meta.");}
    finally{setBusy(false);}
  }
  async function updateStatus(goal:Goal,status:GoalStatus) {
    setError("");setNotice("");
    try{await request(`nutrifit360_goals?id=eq.${goal.id}`,{method:"PATCH",headers:{"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});setNotice("Status atualizado.");await load();}
    catch(err){setError(err instanceof Error?err.message:"Não foi possível atualizar a meta.");}
  }
  async function remove(goal:Goal) {
    if(!window.confirm(`Excluir a meta "${goal.title}"?`))return;
    try{await request(`nutrifit360_goals?id=eq.${goal.id}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});setNotice("Meta excluída.");await load();}
    catch(err){setError(err instanceof Error?err.message:"Não foi possível excluir a meta.");}
  }
  function changeType(value:GoalType){setType(value);setStarting("");setTarget("");setUnit(value==="weight"?"kg":value==="workouts"?"treinos/semana":"");}

  return <div className="nf-goals">
    <div className="nf-goals-overview"><div><small>METAS ATIVAS</small><strong>{loading?"…":activeCount}</strong></div><div><small>TREINOS NESTA SEMANA</small><strong>{loading?"…":weeklySessions}</strong></div><div><small>ÚLTIMO PESO</small><strong>{latestWeight===null?"—":`${fmt(latestWeight)} kg`}</strong></div></div>
    <form className="nf-goal-form" onSubmit={save}>
      <div className="nf-goal-form-title"><b>Defina seu próximo objetivo</b><small>Os indicadores usam seus registros reais quando disponíveis.</small></div>
      <label>Nome da meta<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="Ex.: alcançar minha meta de peso" required /></label>
      <div className="nf-goal-fields">
        <label>Tipo<select value={type} onChange={e=>changeType(e.target.value as GoalType)}><option value="weight">Peso corporal</option><option value="workouts">Frequência de treinos</option><option value="custom">Meta personalizada</option></select></label>
        {type==="weight"?<><label>Peso inicial (kg)<input inputMode="decimal" value={starting} onChange={e=>setStarting(e.target.value)} placeholder="Ex.: 82" required /></label><label>Peso desejado (kg)<input inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Ex.: 78" required /></label></>:<><label>{type==="workouts"?"Treinos por semana":"Valor-alvo"}<input inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} placeholder={type==="workouts"?"Ex.: 4":"Ex.: 10"} required /></label>{type==="custom"&&<label>Unidade<input value={unit} onChange={e=>setUnit(e.target.value)} maxLength={30} placeholder="Ex.: km, litros, sessões" /></label>}</>}
        <label>Prazo (opcional)<input type="date" min={localISO()} value={targetDate} onChange={e=>setTargetDate(e.target.value)} /></label>
      </div>
      <label>Observações (opcional)<textarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={500} rows={2} placeholder="Detalhes do seu objetivo" /></label>
      <button type="submit" disabled={busy}>{busy?"Salvando…":"Adicionar meta"}</button>
    </form>
    {error&&<p className="nf-goal-message error" role="alert">{error}</p>}{notice&&<p className="nf-goal-message" role="status">{notice}</p>}
    <div className="nf-goal-list-head"><b>Minhas metas</b><button type="button" onClick={()=>void load()}>Atualizar</button></div>
    {loading?<p className="nf-goal-empty">Carregando metas…</p>:goals.length===0?<p className="nf-goal-empty">Você ainda não definiu metas. Crie a primeira acima para acompanhar seu progresso.</p>:
      <div className="nf-goal-list">{goals.map(goal=>{const pct=progress(goal);return <article className="nf-goal-card" key={goal.id}>
        <div className="nf-goal-card-head"><div><span className={`nf-goal-status ${goal.status}`}>{goal.status==="active"?"EM ANDAMENTO":goal.status==="completed"?"CONCLUÍDA":"PAUSADA"}</span><h4>{goal.title}</h4><small>{goal.goal_type==="weight"?"Peso corporal":goal.goal_type==="workouts"?"Frequência semanal":"Meta personalizada"}{goal.target_date? ` · prazo ${new Date(goal.target_date+"T12:00:00").toLocaleDateString("pt-BR")}`:""}</small></div>
          <button type="button" className="nf-goal-delete" onClick={()=>void remove(goal)} aria-label={`Excluir meta ${goal.title}`}>Excluir</button></div>
        {pct!==null?<div className="nf-goal-progress"><div><span>Progresso calculado pelos registros</span><b>{Math.round(pct)}%</b></div><div className="nf-goal-track"><i style={{width:`${pct}%`}}/></div><small>{goal.goal_type==="weight"?`Atual: ${latestWeight===null?"sem pesagem":fmt(latestWeight)+" kg"} · alvo: ${fmt(Number(goal.target_value))} kg`:`${weeklySessions} de ${fmt(Number(goal.target_value))} treinos nesta semana`}</small></div>:<p className="nf-goal-custom-note">Meta personalizada: acompanhe o andamento nas suas observações. Não há indicador automático para este tipo de meta.</p>}
        {goal.notes&&<p className="nf-goal-notes">{goal.notes}</p>}
        <div className="nf-goal-actions">{goal.status!=="completed"&&<button type="button" onClick={()=>void updateStatus(goal,"completed")}>Marcar como concluída</button>}{goal.status==="active"&&<button type="button" onClick={()=>void updateStatus(goal,"paused")}>Pausar</button>}{goal.status==="paused"&&<button type="button" onClick={()=>void updateStatus(goal,"active")}>Retomar</button>}</div>
      </article>})}</div>}
  </div>;
}
