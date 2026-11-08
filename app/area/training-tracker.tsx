"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type TrainingType = "musculacao" | "cardio" | "funcional" | "mobilidade" | "outro";
type Exercise = { name: string; sets: string; reps: string; load: string };
type SavedExercise = { name: string; sets: number; reps: number; load_kg: number };
type Training = {
  id: string;
  session_name: string;
  training_type: TrainingType;
  performed_at: string;
  duration_minutes: number;
  exercises: SavedExercise[];
  notes: string | null;
};
type Session = { access_token?: string };
const typeLabels: Record<TrainingType, string> = {
  musculacao: "Musculação", cardio: "Cardio", funcional: "Funcional", mobilidade: "Mobilidade", outro: "Outro",
};
const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function mondayOf(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  value.setDate(value.getDate() - ((value.getDay() + 6) % 7));
  return value;
}
function blankExercise(): Exercise { return { name: "", sets: "", reps: "", load: "" }; }

export default function TrainingTracker() {
  const [rows, setRows] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<TrainingType>("musculacao");
  const [date, setDate] = useState(() => isoDate(new Date()));
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([blankExercise()]);
  const config = useMemo(() => ({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }), []);

  const headers = useCallback(() => {
    const raw = localStorage.getItem("nutrifit360.session");
    const session: Session = raw ? JSON.parse(raw) as Session : {};
    if (!config.url || !config.key || !session.access_token) {
      throw new Error("Sua sessão expirou. Entre novamente para registrar seus treinos.");
    }
    return { apikey: config.key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
  }, [config]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${config.url}/rest/v1/nutrifit360_training_sessions?select=id,session_name,training_type,performed_at,duration_minutes,exercises,notes&order=performed_at.desc,created_at.desc&limit=60`,
        { headers: headers(), cache: "no-store" },
      );
      if (!response.ok) throw new Error("Não foi possível carregar seu histórico de treinos.");
      setRows(await response.json() as Training[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar os treinos.");
    } finally {
      setLoading(false);
    }
  }, [config.url, headers]);

  useEffect(() => { void load(); }, [load]);

  const weekStart = useMemo(() => mondayOf(new Date()), []);
  const weekDays = useMemo(() => weekdays.map((label, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    const key = isoDate(day);
    const sessions = rows.filter(row => row.performed_at === key);
    return { label, key, count: sessions.length, minutes: sessions.reduce((sum, row) => sum + Number(row.duration_minutes), 0) };
  }), [rows, weekStart]);
  const weekRows = useMemo(() => rows.filter(row => row.performed_at >= isoDate(weekStart) && row.performed_at <= isoDate(new Date())), [rows, weekStart]);
  const weekMinutes = weekRows.reduce((sum, row) => sum + Number(row.duration_minutes), 0);
  const weekExercises = weekRows.reduce((sum, row) => sum + (Array.isArray(row.exercises) ? row.exercises.length : 0), 0);
  const maxSessions = Math.max(1, ...weekDays.map(day => day.count));

  function updateExercise(index: number, field: keyof Exercise, value: string) {
    setExercises(current => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) { setError("Informe o nome do treino."); return; }
    const minutes = duration.trim() === "" ? 0 : Number(duration);
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) { setError("Informe uma duração válida em minutos."); return; }
    const validExercises: SavedExercise[] = [];
    for (const item of exercises) {
      if (!item.name.trim()) continue;
      const sets = item.sets.trim() === "" ? 0 : Number(item.sets);
      const reps = item.reps.trim() === "" ? 0 : Number(item.reps);
      const load = item.load.trim() === "" ? 0 : Number(item.load);
      if (![sets, reps, load].every(Number.isFinite) || sets < 0 || reps < 0 || load < 0 || sets > 100 || reps > 1000 || load > 2000) {
        setError("Confira séries, repetições e carga dos exercícios.");
        return;
      }
      validExercises.push({ name: item.name.trim(), sets, reps, load_kg: load });
    }
    setSaving(true);
    try {
      const response = await fetch(`${config.url}/rest/v1/nutrifit360_training_sessions`, {
        method: "POST",
        headers: { ...headers(), Prefer: "return=representation" },
        body: JSON.stringify({
          session_name: name.trim(), training_type: type, performed_at: date,
          duration_minutes: minutes, exercises: validExercises, notes: notes.trim() || null,
        }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar o treino. Confira os dados e tente novamente.");
      setName(""); setDuration(""); setNotes(""); setExercises([blankExercise()]);
      setDate(isoDate(new Date()));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar o treino.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="nf-training-tracker" aria-labelledby="nf-training-title">
      <div className="nf-training-head">
        <div><div className="nf-eyebrow">DESEMPENHO SEMANAL</div><h4 id="nf-training-title">Sua rotina de treinos</h4></div>
        <span>{weekRows.length} sessões nesta semana</span>
      </div>
      <div className="nf-training-stats">
        <article><small>SESSÕES</small><strong>{weekRows.length}</strong><span>nesta semana</span></article>
        <article><small>TEMPO TOTAL</small><strong>{weekMinutes}<i> min</i></strong><span>registrados</span></article>
        <article><small>EXERCÍCIOS</small><strong>{weekExercises}</strong><span>movimentos anotados</span></article>
      </div>
      <div className="nf-training-week" aria-label="Gráfico de sessões por dia nesta semana">
        {weekDays.map(day => (
          <div className="nf-training-day" key={day.key}>
            <div className="nf-training-bar-track" title={`${day.count} sessões, ${day.minutes} minutos`}>
              <span style={{ height: `${day.count ? Math.max(10, day.count / maxSessions * 100) : 0}%` }} />
            </div>
            <b>{day.count}</b><small>{day.label}</small>
          </div>
        ))}
      </div>
      <p className="nf-training-caption">Quantidade de sessões registradas por dia. Os gráficos são preenchidos com seus próprios registros.</p>

      <form className="nf-training-form" onSubmit={submit}>
        <div className="nf-training-head"><div><div className="nf-eyebrow">NOVO REGISTRO</div><h4>Registrar treino</h4></div></div>
        <label>Nome do treino<input value={name} onChange={event => setName(event.target.value)} maxLength={120} required placeholder="Ex.: Treino A — Peito e tríceps" /></label>
        <div className="nf-training-fields">
          <label>Modalidade<select value={type} onChange={event => setType(event.target.value as TrainingType)}>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Data<input type="date" value={date} max={isoDate(new Date())} onChange={event => setDate(event.target.value)} required /></label>
          <label>Duração (min)<input type="number" min="0" max="1440" step="1" value={duration} onChange={event => setDuration(event.target.value)} placeholder="Ex.: 60" /></label>
        </div>
        <div className="nf-training-exercises-head"><b>Exercícios</b><button type="button" onClick={() => setExercises(current => current.length < 20 ? [...current, blankExercise()] : current)} disabled={exercises.length >= 20}>+ Adicionar exercício</button></div>
        {exercises.map((item, index) => (
          <div className="nf-exercise-fields" key={index}>
            <label>Exercício<input value={item.name} onChange={event => updateExercise(index, "name", event.target.value)} maxLength={120} placeholder="Ex.: Supino reto" /></label>
            <label>Séries<input type="number" min="0" max="100" step="1" value={item.sets} onChange={event => updateExercise(index, "sets", event.target.value)} placeholder="4" /></label>
            <label>Reps<input type="number" min="0" max="1000" step="1" value={item.reps} onChange={event => updateExercise(index, "reps", event.target.value)} placeholder="12" /></label>
            <label>Carga (kg)<input type="number" min="0" max="2000" step=".5" value={item.load} onChange={event => updateExercise(index, "load", event.target.value)} placeholder="20" /></label>
            {exercises.length > 1 && <button className="nf-exercise-remove" type="button" onClick={() => setExercises(current => current.filter((_, i) => i !== index))} aria-label={`Remover exercício ${index + 1}`}>Remover</button>}
          </div>
        ))}
        <label>Observações (opcional)<input value={notes} onChange={event => setNotes(event.target.value)} maxLength={500} placeholder="Como foi o treino?" /></label>
        {error && <p className="nf-meal-error" role="alert">{error}</p>}
        <button className="nf-chart-action" type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar treino"}</button>
      </form>

      <div className="nf-training-history">
        <div className="nf-training-head"><h4>Histórico de treinos</h4><button type="button" onClick={() => void load()}>Atualizar</button></div>
        {loading ? <p className="nf-nutrition-empty">Carregando registros…</p> : rows.length === 0 ? <p className="nf-nutrition-empty">Nenhum treino registrado. Use o formulário acima para começar seu histórico.</p> : rows.map(row => (
          <article className="nf-training-row" key={row.id}>
            <div className="nf-training-row-top"><div><b>{row.session_name}</b><small>{typeLabels[row.training_type]} · {new Date(row.performed_at + "T12:00:00").toLocaleDateString("pt-BR")}</small></div><strong>{Number(row.duration_minutes)} min</strong></div>
            {row.exercises?.length > 0 && <ul>{row.exercises.map((exercise, index) => <li key={`${row.id}-${index}`}>{exercise.name} <span>{exercise.sets}×{exercise.reps}{exercise.load_kg > 0 ? ` · ${exercise.load_kg} kg` : ""}</span></li>)}</ul>}
            {row.notes && <p>{row.notes}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
