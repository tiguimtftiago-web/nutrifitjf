"use client";

import { FormEvent, useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sessionKey = "nutrifit360.session";

type Entry = { id: string; weight_kg: number; measured_at: string; notes: string | null };
type StoredSession = { access_token: string; refresh_token: string; user: { id: string } };

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function WeightTracker() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => localDateISO());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function session(): StoredSession | null {
    try {
      const raw = localStorage.getItem(sessionKey);
      return raw ? JSON.parse(raw) as StoredSession : null;
    } catch { return null; }
  }

  async function request(path: string, init?: RequestInit) {
    const current = session();
    if (!current?.access_token || !url || !key) throw new Error("Entre novamente para acessar seus registros.");
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        apikey: key,
        Authorization: `Bearer ${current.access_token}`,
        ...(init?.headers || {}),
      },
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
      const response = await request("nutrifit360_weight_entries?select=id,weight_kg,measured_at,notes&order=measured_at.desc&limit=90");
      setEntries(await response.json());
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao carregar."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    const value = Number(weight.replace(",", "."));
    if (!Number.isFinite(value) || value < 20 || value > 500) {
      setError("Informe um peso válido entre 20 e 500 kg."); return;
    }
    if (!date || date > localDateISO()) {
      setError("A data não pode estar no futuro."); return;
    }
    const current = session();
    if (!current) { setError("Entre novamente para salvar."); return; }
    setBusy(true); setError("");
    try {
      await request("nutrifit360_weight_entries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: current.user.id,
          weight_kg: value,
          measured_at: date,
          notes: notes.trim() || null,
        }),
      });
      setWeight(""); setNotes("");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Falha ao salvar."); }
    finally { setBusy(false); }
  }

  const latest = entries[0];
  const earliest = entries[entries.length - 1];
  const delta = latest && earliest && latest.id !== earliest.id ? Number(latest.weight_kg) - Number(earliest.weight_kg) : null;
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return <div className="wt-root">
    <div className="wt-summary">
      <div><small>PESO MAIS RECENTE</small><strong>{latest ? `${fmt(Number(latest.weight_kg))} kg` : "Sem registros"}</strong></div>
      <div><small>VARIAÇÃO NO HISTÓRICO</small><strong>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${fmt(delta)} kg`}</strong></div>
      <div><small>REGISTROS</small><strong>{entries.length}</strong></div>
    </div>
    <form onSubmit={save} className="wt-form">
      <label>Peso (kg)<input type="text" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex.: 82,5" required /></label>
      <label>Data<input type="date" value={date} max={localDateISO()} onChange={e => setDate(e.target.value)} required /></label>
      <label className="wt-notes">Observação (opcional)<input maxLength={200} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: medição pela manhã" /></label>
      <button disabled={busy} type="submit">{busy ? "Salvando..." : "Salvar peso"}</button>
    </form>
    {error && <p role="alert" className="wt-error">{error}</p>}
    <div className="wt-history">
      <h4>Histórico de pesagens</h4>
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
      .wt-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px;min-width:0}
      .wt-form label{display:flex;flex-direction:column;gap:7px;font-size:11px;color:#c4cebd;min-width:0}
      .wt-form input{box-sizing:border-box;min-width:0;width:100%;max-width:100%;border:1px solid #3b4b36;border-radius:8px;background:#0b100b;color:#fff;padding:11px;font-size:16px}
      .wt-notes{grid-column:1/-1}.wt-form button{grid-column:1/-1;border:0;background:#f28a22;color:#17120a;font-weight:800;padding:12px;border-radius:9px;cursor:pointer}
      .wt-form button:disabled{opacity:.6}.wt-error{color:#ffba9a;font-size:12px}.wt-history{margin-top:22px}
      .wt-history h4{font-size:13px;margin:0 0 12px}.wt-history p{font-size:12px;color:#9ca595}
      .wt-history ul{list-style:none;margin:0;padding:0;max-height:280px;overflow:auto}.wt-history li{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #2c372a;padding:11px 0;font-size:12px}
      .wt-history li small{display:block;color:#8d9987;margin-top:4px}.wt-history li b{white-space:nowrap;color:#c3df80}
      @media(max-width:520px){.wt-summary{grid-template-columns:1fr 1fr}.wt-summary>div:last-child{grid-column:1/-1}.wt-form{grid-template-columns:minmax(0,1fr)}.wt-form label,.wt-notes,.wt-form button{grid-column:1/-1}.wt-form input{font-size:16px}}
    `}</style>
  </div>;
}
