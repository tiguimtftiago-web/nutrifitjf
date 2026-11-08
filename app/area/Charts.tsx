"use client";

import { ReactNode } from "react";

type RingProps = { label: string; value: number; unit: string; color: "green" | "orange" | "blue"; description: string };
export function ProgressRing({label,value,unit,color,description}:RingProps) {
  const safe = Math.max(0,Math.min(100,Number.isFinite(value)?value:0));
  const radius=25, circumference=2*Math.PI*radius;
  return <article className="nf-chart-ring" aria-label={`${label}: ${safe}%`}>
    <svg viewBox="0 0 64 64" role="img" aria-label={`${safe}% de ${label.toLowerCase()}`}>
      <circle className="nf-ring-track" cx="32" cy="32" r={radius}/>
      <circle className={`nf-ring-value ${color}`} cx="32" cy="32" r={radius}
        strokeDasharray={circumference} strokeDashoffset={circumference*(1-safe/100)}/>
    </svg>
    <div className="nf-ring-copy"><strong>{safe}%</strong><span>{label}</span><small>{unit}</small></div>
    <p>{description}</p>
  </article>;
}

type BarProps = {label:string; value:number; target:number; unit:string; color?:"green"|"orange"; action?:ReactNode};
export function ProgressBar({label,value,target,unit,color="green",action}:BarProps) {
  const safeValue=Math.max(0,Number.isFinite(value)?value:0);
  const safeTarget=Math.max(0,target);
  const percent=safeTarget>0?Math.min(100,safeValue/safeTarget*100):0;
  return <div className="nf-progress-item">
    <div className="nf-progress-head"><span>{label}</span><b>{safeValue.toLocaleString("pt-BR")} / {safeTarget.toLocaleString("pt-BR")} {unit}</b></div>
    <div className="nf-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
      <span className={color} style={{width:`${percent}%`}}/>
    </div>
    <div className="nf-progress-foot"><small>{safeTarget===0?"Defina uma meta para acompanhar":safeValue===0?"Nenhum registro hoje":`${Math.round(percent)}% da meta`}</small>{action}</div>
  </div>;
}

export function DailyProgress({onMeal}:{onMeal:()=>void}) {
  return <section className="nf-daily-charts" aria-labelledby="nf-daily-title">
    <div className="nf-chart-section-title"><div><div className="nf-eyebrow">SEUS INDICADORES</div><h3 id="nf-daily-title">Progresso do dia</h3></div><span>SEM DADOS REGISTRADOS</span></div>
    <div className="nf-ring-grid">
      <ProgressRing label="Calorias" value={0} unit="kcal" color="green" description="Registre refeições"/>
      <ProgressRing label="Proteína" value={0} unit="g" color="orange" description="Aguardando dados"/>
      <ProgressRing label="Treinos" value={0} unit="sessões" color="blue" description="Registre seu treino"/>
    </div>
    <div className="nf-daily-goals">
      <div className="nf-chart-section-title"><div><div className="nf-eyebrow">ROTINA</div><h3>Metas diárias</h3></div></div>
      <ProgressBar label="Água" value={0} target={0} unit="ml" />
      <ProgressBar label="Atividade física" value={0} target={0} unit="min" color="orange"/>
      <button type="button" className="nf-chart-action" onClick={onMeal}>Registrar refeição</button>
    </div>
  </section>;
}
