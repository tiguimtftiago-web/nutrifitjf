"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sessionKey = "nutrifit360.session";
type Entry = { id: string; weight_kg: number; measured_at: string; notes: string | null };
type StoredSession = { access_token: string; refresh_token: string; user: { id: string } };
type Period = "7D" | "30D" | "90D";
function localDateISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function fmt(n: number) { return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }); }

export default function WeightTracker() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => localDateISO());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("30D");

  function session(): StoredSession | null {
    try { const raw = localStorage.getItem(sessionKey); return raw ? JSON.parse(raw) as StoredSession : null; }
    catch { return null; }
  }
  async function request(path: string, init?: RequestInit) {
    const current = session();
    if (!current?.access_token || !url || !key) throw new Error("Entre novamente para acessar seus registros.");
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...init, cache: "no-store",
      headers: { apikey: key, Authorization: `Bearer ${current.access_token}`, ...(init?.headers || {}) },
    });
    if (response.status === 401) throw new Error("Sua sessão expirou. Saia e entre novamente.");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Não foi possível acessar seus registros.");
    }
    return response;
  }
  async function load() {
    setLoading(true);
    try {
      const response = await request("nutrifit360_weight_entries?select=id,weight_kg,measured_at,notes&order=measured_at.desc,created_at.desc&limit=300");
      setEntries(await response.json() as Entry[]);
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao carregar."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(weight.replace(",", "."));
    if (!Number.isFinite(value) || value < 20 || value > 500) { setError("Informe um peso válido entre 20 e 500 kg."); return; }
    if (!date || date > localDateISO()) { setError("A data não pode estar no futuro."); return; }
    const current = session();
    if (!current) { setError("Entre novamente para salvar."); return; }
    setBusy(true); setError("");
    try {
      await request("nutrifit360_weight_entries", {
        method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: current.user.id, weight_kg: value, measured_at: date, notes: notes.trim() || null }),
      });
      setWeight(""); setNotes(""); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao salvar."); }
    finally { setBusy(false); }
  }

  const filtered = useMemo(() => {
    const days = Number(period.replace("D", ""));
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
    const startKey = localDateISO(start);
    return entries.filter(item => item.measured_at >= startKey && item.measured_at <= localDateISO())
      .slice().sort((a, b) => a.measured_at.localeCompare(b.measured_at));
  }, [entries, period]);
  const points = useMemo(() => {
    if (!filtered.length) return [];
    const values = filtered.map(item => Number(item.weight_kg));
    const min = Math.min(...values), max = Math.max(...values);
    const padding = Math.max((max - min) * .25, .5);
    const low = min - padding, high = max + padding;
    return filtered.map((item, index) => ({
      ...item,
      x: filtered.length === 1 ? 160 : 18 + index * 284 / (filtered.length - 1),
      y: 132 - ((Number(item.weight_kg) - low) / (high - low)) * 104,
    }));
  }, [filtered]);
  const latest = entries[0];
  const earliest = entries[entries.length - 1];
  const delta = latest && earliest && latest.id !== earliest.id ? Number(latest.weight_kg) - Number(earliest.weight_kg) : null;
  const periodDelta = filtered.length > 1 ? Number(filtered[filtered.length - 1].weight_kg) - Number(filtered[0].weight_kg) : null;
  const line = points.map(point => `${point.x},${point.y}`).join(" ");

  return <div className="wt-root">
    <div className="wt-summary">
      <div><small>PESO MAIS RECENTE</small><strong>{latest ? `${fmt(Number(latest.weight_kg))} kg` : "Sem registros"}</strong></div>
      <div><small>VARIAÇÃO NO HISTÓRICO</small><strong>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${fmt(delta)} kg`}</strong></div>
      <div><small>REGISTROS</small><strong>{entries.length}</strong></div>
    </div>

    <div className="wt-chart-card">
      <div className="wt-chart-head"><div><b>Variação do peso</b><small>{periodDelta === null ? "Aguardando mais pesagens" : `${periodDelta > 0 ? "+" : ""}${fmt(periodDelta)} kg no período`}</small></div>
        <div className="wt-period" aria-label="Período do gráfico">{(["7D", "30D", "90D"] as Period[]).map(value => <button type="button" key={value} onClick={() => setPeriod(value)} className={period === value ? "active" : ""} aria-pressed={period === value}>{value}</button>)}</div>
      </div>
      {loading ? <p className="wt-chart-empty">Carregando seu histórico…</p> : points.length === 0 ?
        <p className="wt-chart-empty">Não há pesagens neste período. Registre seu peso para começar a visualizar sua evolução.</p> :
        <svg className="wt-chart" viewBox="0 0 320 160" role="img" aria-label={`Gráfico de peso com ${points.length} pesagens no período de ${period}.`}>
          {[32, 82, 132].map(y => <line key={y} x1="12" x2="308" y1={y} y2={y} className="wt-grid-line" />)}
          {points.length > 1 && <polyline points={line} className="wt-line" />}
          {points.map(point => <circle key={point.id} cx={point.x} cy={point.y} r="4" className="wt-point"><title>{new Date(point.measured_at + "T12:00:00").toLocaleDateString("pt-BR")}: {fmt(Number(point.weight_kg))} kg</title></circle>)}
          <text x="14" y="153" className="wt-axis-label">{new Date(points[0].measured_at + "T12:00:00").toLocaleDateString("pt-BR")}</text>
          <text x="306" y="153" textAnchor="end" className="wt-axis-label">{new Date(points[points.length - 1].measured_at + "T12:00:00").toLocaleDateString("pt-BR")}</text>
        </svg>}
      <div className="wt-chart-legend"><i /> PESAGENS REGISTRADAS</div>
    </div>

    <form onSubmit={save} className="wt-form">
      <label>Peso (kg)<input type="text" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex.: 82,5" required /></label>
      <label>Data<input type="date" value={date} max={localDateISO()} onChange={e => setDate(e.target.value)} required /></label>
      <label className="wt-notes">Observação (opcional)<input maxLength={200} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: medição pela manhã" /></label>
      <button disabled={busy} type="submit">{busy ? "Salvando..." : "Salvar peso"}</button>
    </form>
    {error && <p role="alert" className="wt-error">{error}</p>}
    <div className="wt-history">
      <div className="wt-history-head"><h4>Histórico de pesagens</h4><button type="button" onClick={() => void load()}>Atualizar</button></div>
      {loading ? <p>Carregando registros...</p> : entries.length === 0 ? <p>Você ainda não registrou nenhuma pesagem.</p> :
        <ul>{entries.slice(0, 12).map(item => <li key={item.id}>
          <span>{new Date(item.measured_at + "T12:00:00").toLocaleDateString("pt-BR")}{item.notes ? <small>{item.notes}</small> : null}</span>
          <b>{fmt(Number(item.weight_kg))} kg</b>
        </li>)}</ul>}
    </div>
    <style jsx>{`
      .wt-root{margin-top:16px;color:#f4f5ef}.wt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
      .wt-summary>div{background:#182018;border:1px solid #34422e;padding:12px;border-radius:10px;min-width:0}
      .wt-summary small{display:block;color:#a5b09f;font-size:9px;letter-spacing:.5px;margin-bottom:8px}.wt-summary strong{font-size:16px;color:#c3df80}
      .wt-chart-card{margin-top:14px;padding:13px;border:1px solid #2b3827;border-radius:12px;background:#0d120d;min-width:0}
      .wt-chart-head,.wt-history-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .wt-chart-head>div:first-child{display:grid;gap:4px}.wt-chart-head b,.wt-history h4{font-size:12px;margin:0}
      .wt-chart-head small{font-size:9px;color:#9aa594}
      .wt-period{display:flex;gap:3px;padding:3px;background:#080c08;border:1px solid #283126;border-radius:7px}
      .wt-period button{border:0;border-radius:5px;padding:6px 8px;background:transparent;color:#8c9689;font-size:9px;cursor:pointer}
      .wt-period button.active{background:#344525;color:#d5e8a5}
      .wt-chart{display:block;width:100%;height:auto;max-height:190px;margin-top:9px;overflow:visible}
      .wt-grid-line{stroke:#293329;stroke-width:1;stroke-dasharray:3 4}
      .wt-line{fill:none;stroke:#a4c64a;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
      .wt-point{fill:#f28a22;stroke:#101610;stroke-width:2}
      .wt-axis-label{fill:#83907c;font-size:8px}
      .wt-chart-legend{display:flex;align-items:center;gap:7px;font-size:8px;letter-spacing:1px;color:#8c9689}
      .wt-chart-legend i{width:7px;height:7px;border-radius:50%;background:#a4c64a}
      .wt-chart-empty{min-height:130px;display:grid;place-items:center;text-align:center;font-size:10px;line-height:1.5;color:#8c9689;padding:20px}
      .wt-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px;min-width:0}
      .wt-form label{display:flex;flex-direction:column;gap:7px;font-size:11px;color:#c4cebd;min-width:0}
      .wt-form input{box-sizing:border-box;min-width:0;width:100%;max-width:100%;border:1px solid #3b4b36;border-radius:8px;background:#0b100b;color:#fff;padding:11px;font-size:16px}
      .wt-notes{grid-column:1/-1}.wt-form button{grid-column:1/-1;border:0;background:#f28a22;color:#17120a;font-weight:800;padding:12px;border-radius:9px;cursor:pointer}
      .wt-form button:disabled{opacity:.6}.wt-error{color:#ffba9a;font-size:12px}.wt-history{margin-top:22px}
      .wt-history-head{margin-bottom:12px}.wt-history-head button{border:0;background:transparent;color:#a4c64a;text-decoration:underline;font-size:10px;cursor:pointer}
      .wt-history p{font-size:12px;color:#9ca595}
      .wt-history ul{list-style:none;margin:0;padding:0;max-height:280px;overflow:auto}.wt-history li{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #2c372a;padding:11px 0;font-size:12px}
      .wt-history li small{display:block;color:#8d9987;margin-top:4px}.wt-history li b{white-space:nowrap;color:#c3df80}
      @media(max-width:520px){.wt-summary{grid-template-columns:1fr 1fr}.wt-summary>div:last-child{grid-column:1/-1}.wt-form{grid-template-columns:minmax(0,1fr)}.wt-form label,.wt-notes,.wt-form button{grid-column:1/-1}.wt-form input{font-size:16px}.wt-chart-card{padding:10px}.wt-chart-head{align-items:flex-start;flex-direction:column}}
      @media(prefers-reduced-motion:reduce){.wt-line{transition:none}}
    `}</style>
  </div>;
}
