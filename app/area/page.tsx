"use client";
import { useEffect, useState } from "react";
import AreaAuthGate from "./area-auth-gate";
import WeightTracker from "./weight-tracker";
import DashboardSummary from "./dashboard-summary";
import NutritionTracker from "./nutrition-tracker";
import TrainingTracker from "./training-tracker";
import GoalTracker from "./goal-tracker";
import ClayIcon from "./clay-icon";

type Tab = "inicio" | "treino" | "nutricao" | "evolucao" | "metas";
const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function DashboardContent() {
 const [activeTab,setActiveTab]=useState<Tab>("inicio");
 const [displayName,setDisplayName]=useState("Elaine");
 useEffect(()=>{
  let live=true;
  async function loadName(){
   try{
    const raw=localStorage.getItem("nutrifit360.session");
    const session=raw?JSON.parse(raw) as {access_token?:string;user?:{id?:string;user_metadata?:{full_name?:string}}}:null;
    const metadataName=session?.user?.user_metadata?.full_name;
    if(metadataName&&live)setDisplayName(metadataName.trim().split(/\s+/)[0]);
    if(!session?.access_token||!session.user?.id||!SUPABASE_URL||!SUPABASE_KEY)return;
    const response=await fetch(`${SUPABASE_URL}/rest/v1/nutrifit360_profiles?select=full_name&user_id=eq.${session.user.id}&limit=1`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.access_token}`},cache:"no-store"});
    if(!response.ok)return;
    const rows=await response.json() as Array<{full_name:string}>;
    if(live&&rows[0]?.full_name)setDisplayName(rows[0].full_name.trim().split(/\s+/)[0]);
   }catch{/* Mantém o primeiro nome padrão enquanto o perfil não responde. */}
  }
  void loadName();return()=>{live=false;};
 },[]);
 const tabs: {id:Tab;label:string;icon:"home"|"dumbbell"|"apple"|"chart"|"target"}[]=[
  {id:"inicio",label:"Início",icon:"home"},{id:"treino",label:"Treino",icon:"dumbbell"},{id:"nutricao",label:"Nutrição",icon:"apple"},{id:"evolucao",label:"Evolução",icon:"chart"},{id:"metas",label:"Metas",icon:"target"}
 ];
 return (
  <main className="nf-shell nf-reference-shell">
   <header className="nf-reference-header">
    <a className="nf-reference-brand" href="/" aria-label="Voltar à Nutrifit">
     <img src="/nutrifit-logo-oficial.webp" alt="Logo oficial Nutrifit" width="100" height="100"/>
    </a>
    <div className="nf-reference-greeting">
     <div className="nf-reference-brandline">NutriFit <span>360</span></div>
     <h1>Olá, {displayName}! <span>💪</span></h1>
    </div>
    <div className="nf-reference-actions">
     <button className="nf-reference-bell" type="button" aria-label="Notificações"><ClayIcon name="bell" tone="orange" size={17}/><i/></button>
     <div className="nf-reference-avatar" aria-label="Perfil de {displayName}">👩🏾‍🦱<i/></div>
    </div>
   </header>

   <div className="nf-reference-main" aria-live="polite">
    {activeTab==="inicio" ? <>
     <DashboardSummary onNavigate={setActiveTab}>
      <section className="nf-3d-scene" aria-label="Academia isométrica NutriFit 360">
       <div className="nf-scene-caption"><b>Movimento também é cuidado.</b><span>Pequenos passos constroem grandes mudanças.</span></div>
       <aside className="nf-reference-side-pill" aria-label="Atalhos rápidos">
        <button className="active" type="button" onClick={()=>setActiveTab("inicio")} aria-label="Início"><ClayIcon name="home" tone="green" size={17}/></button>
        <button type="button" onClick={()=>setActiveTab("treino")} aria-label="Treino"><ClayIcon name="dumbbell" tone="neutral" size={17}/></button>
        <button type="button" onClick={()=>setActiveTab("evolucao")} aria-label="Evolução"><ClayIcon name="chart" tone="neutral" size={17}/></button>
        <button type="button" onClick={()=>setActiveTab("metas")} aria-label="Configurações e metas"><ClayIcon name="settings" tone="neutral" size={17}/></button>
       </aside>
       <svg className="nf-gym-svg" viewBox="0 0 760 390" role="img" aria-label="Mini academia isométrica com pesos, banco, bicicleta ergométrica e pessoa treinando">
                <defs>
                  <linearGradient id="nfPlatformSide" x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#b8ce62"/><stop offset="1" stopColor="#718b36"/></linearGradient>
                  <linearGradient id="nfPlatformTop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffdf7"/><stop offset="1" stopColor="#e8ddcc"/></linearGradient>
                  <linearGradient id="nfMetal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5f2ed"/><stop offset=".5" stopColor="#77746f"/><stop offset="1" stopColor="#d8d3cb"/></linearGradient>
                  <linearGradient id="nfOrange" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffb15f"/><stop offset="1" stopColor="#d76b2d"/></linearGradient>
                  <filter id="nfShadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="8"/></filter>
                </defs>
                <ellipse cx="385" cy="324" rx="300" ry="34" fill="#8b795f" opacity=".18" filter="url(#nfShadow)"/>
                <path d="M80 210 382 95 682 210 380 345Z" fill="url(#nfPlatformSide)"/>
                <path d="M80 210 380 323 682 210 682 233 380 367 80 234Z" fill="#829d3f"/>
                <path d="M100 198 382 91 662 198 380 310Z" fill="url(#nfPlatformTop)" stroke="#fff" strokeWidth="5"/>
                <path d="M118 198 382 104 643 198 380 297Z" fill="none" stroke="#e5dac9" strokeWidth="2"/>
                <g opacity=".95">
                  <path d="M150 196v-46l30-12v45M180 138l33 12v45M150 150l30 12 33-12" fill="none" stroke="#8a8881" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M146 145h70" stroke="#5d5b57" strokeWidth="8" strokeLinecap="round"/>
                  <rect x="136" y="132" width="12" height="30" rx="4" fill="#5f5c58"/><rect x="218" y="132" width="12" height="30" rx="4" fill="#5f5c58"/>
                  <path d="M156 143v-15M210 143v-15" stroke="#4f4d49" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M150 206 174 191 197 202 174 218Z" fill="#c9c3b8"/>
                  <path d="M166 202 188 189M183 214 205 201" stroke="#68645e" strokeWidth="6" strokeLinecap="round"/>
                  <path d="M163 187 172 183M194 181 203 177" stroke="#44413d" strokeWidth="7" strokeLinecap="round"/>
                </g>
                <g>
                  <path d="M478 213 522 196 548 206 504 225Z" fill="#aaa49a"/>
                  <path d="M504 225v35M537 211v39" stroke="#77736c" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M482 210 520 195 547 205 509 221Z" fill="#55534f"/>
                  <path d="M478 214 502 225" stroke="#e9e3d9" strokeWidth="3"/>
                </g>
                <g>
                  <path d="M560 146v67M582 138v75M560 146l22-8" stroke="#aaa59e" strokeWidth="9" strokeLinecap="round"/>
                  <rect x="550" y="161" width="33" height="66" rx="10" fill="url(#nfOrange)"/>
                  <rect x="558" y="153" width="17" height="10" rx="3" fill="#6e655a"/>
                  <text x="566" y="198" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">NF</text>
                </g>
                <g>
                  <path d="M390 219 420 207 449 218 419 231Z" fill="#d9d2c7"/>
                  <path d="M408 226v38M438 220v37" stroke="#817d76" strokeWidth="7" strokeLinecap="round"/>
                  <path d="M389 217 420 205 450 217" stroke="#625f5a" strokeWidth="8" strokeLinecap="round"/>
                </g>
                <g>
                  <path d="M308 222 329 199 351 210 330 235Z" fill="#d0c9bd"/>
                  <path d="M329 235 349 224 370 236 350 248Z" fill="#a7b95d"/>
                  <path d="M318 219 335 208 350 215" stroke="#69655e" strokeWidth="5" strokeLinecap="round"/>
                </g>
                <g>
                  <ellipse cx="395" cy="165" rx="28" ry="13" fill="#d5cbb8"/>
                  <path d="M378 164v-39M412 164v-39M378 125h34" stroke="#8b8983" strokeWidth="6" strokeLinecap="round"/>
                  <circle cx="378" cy="121" r="7" fill="#595753"/><circle cx="412" cy="121" r="7" fill="#595753"/>
                </g>
                <g>
                  <path d="M274 167 292 153 310 159 292 174Z" fill="#e4daca"/>
                  <path d="M292 174v40M310 160v49" stroke="#8d8981" strokeWidth="6" strokeLinecap="round"/>
                  <path d="M282 159 300 151" stroke="#5b5853" strokeWidth="7" strokeLinecap="round"/>
                </g>
                <g>
                  <path d="M349 147 356 115 374 98 391 103 401 126 393 155 377 166 357 161Z" fill="#e7a47d"/>
                  <circle cx="376" cy="91" r="18" fill="#d99a75"/>
                  <path d="M359 91q-3-24 19-23 19 2 18 22l-12-8-14 4Z" fill="#6b4938"/>
                  <path d="M358 118 339 99 329 81M391 117 409 95 419 76" fill="none" stroke="#d99a75" strokeWidth="13" strokeLinecap="round"/>
                  <path d="M327 81 315 55M420 76 431 52" stroke="#d99a75" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M312 54 434 51" stroke="#77736d" strokeWidth="7" strokeLinecap="round"/>
                  <rect x="303" y="43" width="12" height="24" rx="4" fill="#45433f"/><rect x="430" y="39" width="12" height="24" rx="4" fill="#45433f"/>
                  <path d="M357 159 350 207 367 220 380 172M388 158 399 199 386 218 375 170" fill="#30445c"/>
                  <path d="M351 207 344 238M399 199 411 229" stroke="#d99a75" strokeWidth="11" strokeLinecap="round"/>
                  <path d="M337 240h17M404 232h18" stroke="#f1eee8" strokeWidth="8" strokeLinecap="round"/>
                </g>
                <g>
                  <path d="M102 202q-7-29 9-47 13 18 8 36 8-36 29-44 3 26-13 44 22-24 39-20-9 25-35 36Z" fill="#7e9e48"/>
                  <path d="M115 204q-4-25-20-29 0 22 15 34M138 195q7-28 29-31-2 23-25 40" fill="#9eb95d"/>
                  <path d="M106 203h48l-7 26h-34Z" fill="#d9824b"/><path d="M106 203h48" stroke="#f1b17e" strokeWidth="4"/>
                </g>
                <g>
                  <path d="M618 201q-2-29 13-43 11 17 4 34 11-27 30-29 1 23-19 37 20-17 33-10-11 22-34 26Z" fill="#769447"/>
                  <path d="M632 202q-1-22-15-29 0 20 13 33M651 195q9-25 28-25-4 21-24 34" fill="#a5bd64"/>
                  <path d="M622 205h48l-7 24h-34Z" fill="#d9824b"/><path d="M622 205h48" stroke="#f1b17e" strokeWidth="4"/>
                </g>
                <g>
                  <circle cx="485" cy="87" r="23" fill="#fffaf2" stroke="#ed8738" strokeWidth="6"/>
                  <path d="M485 70v18l12 7" fill="none" stroke="#786e62" strokeWidth="4" strokeLinecap="round"/>
                </g>
                <path d="M226 93l8-14 8 14 14 8-14 8-8 14-8-14-14-8Z" fill="#ed8738" opacity=".9"/>
                <circle cx="576" cy="65" r="7" fill="#a7b66a"/><circle cx="260" cy="56" r="5" fill="#ed8738"/>
              </svg>
       <span className="nf-scene-spark spark-one" aria-hidden="true">✦</span>
       <span className="nf-scene-spark spark-two" aria-hidden="true">●</span>
      </section>
     </DashboardSummary>
     <section className="nf-reference-tip">
      <div className="nf-reference-tip-icon"><ClayIcon name="lightbulb" tone="orange" size={22}/></div>
      <div><h2>Dica do Dia</h2><p>Beba água e mantenha sua alimentação equilibrada!</p></div>
     </section>
     <footer className="nf-reference-footer">O acompanhamento é informativo e não substitui orientação de nutricionista ou médico.<span>© NUTRIFIT 360°</span></footer>
    </> : <section className="nf-reference-panel">
      {activeTab==="treino"&&<><div className="nf-panel-heading"><div><div className="nf-eyebrow">DESEMPENHO</div><h3>Treino</h3></div><ClayIcon name="dumbbell" tone="green" size={22}/></div><TrainingTracker/></>}
      {activeTab==="nutricao"&&<><div className="nf-panel-heading"><div><div className="nf-eyebrow">ALIMENTAÇÃO</div><h3>Nutrição</h3></div><ClayIcon name="apple" tone="orange" size={22}/></div><NutritionTracker/></>}
      {activeTab==="evolucao"&&<><div className="nf-panel-heading"><div><div className="nf-eyebrow">ACOMPANHAMENTO</div><h3>Evolução</h3></div><ClayIcon name="chart" tone="green" size={22}/></div><WeightTracker/></>}
      {activeTab==="metas"&&<><div className="nf-panel-heading"><div><div className="nf-eyebrow">OBJETIVOS PESSOAIS</div><h3>Metas</h3></div><ClayIcon name="target" tone="orange" size={22}/></div><GoalTracker/></>}
    </section>}
   </div>

   <nav className="nf-reference-nav" aria-label="Navegação principal">
    {tabs.map(({id,label,icon})=><button type="button" key={id} className={activeTab===id?"active":""} aria-current={activeTab===id?"page":undefined} onClick={()=>setActiveTab(id)}><ClayIcon name={icon} tone={activeTab===id?"green":"neutral"} size={19}/><span>{label}</span></button>)}
   </nav>
   <style jsx>{`
        :global(*){box-sizing:border-box}
        .nf-shell{--bg:#090b09;--panel:#111511;--panel2:#151b15;--line:#252d24;--muted:#8c9689;--text:#f4f5ef;--green:#a4c64a;--orange:#f28a22;min-height:100vh;background:radial-gradient(ellipse at 76% 0%,#1b2516 0,transparent 32%),var(--bg);color:var(--text);font-family:Arial,Helvetica,sans-serif;position:relative;overflow:hidden;padding-bottom:calc(100px + env(safe-area-inset-bottom))}
        .nf-glow{position:absolute;pointer-events:none;filter:blur(80px);opacity:.12;border-radius:50%}.nf-glow-one{width:300px;height:300px;background:#8ebd32;top:260px;right:-170px}.nf-glow-two{width:240px;height:240px;background:#f28a22;top:850px;left:-170px}
        .nf-topbar{height:126px;border-bottom:1px solid #20271f;display:flex;align-items:center;justify-content:space-between;padding:0 max(22px,calc((100vw - 1320px)/2));position:relative;z-index:2;background:#090c09e8;backdrop-filter:blur(18px)}
        .nf-brand{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;min-width:0}.nf-brand-logo{display:block;width:148px;height:auto;max-height:114px;object-fit:contain;flex:none}.nf-brand-mark{width:38px;height:38px;display:grid;place-items:center;position:relative;flex:none}.nf-brand-mark-360{width:57px;height:57px}.nf-brand-mark-360 svg{display:block;width:100%;height:100%;filter:drop-shadow(0 0 7px #8dbb3030)}.nf-brand-copy{display:flex;flex-direction:column;align-items:flex-start;line-height:1}.nf-brand-copy b{display:block;font-size:22px;letter-spacing:2px;font-weight:900;background:linear-gradient(90deg,#9dbd2d 0%,#9dbd2d 54%,#ff6814 54%,#ff6814 100%);color:transparent;background-clip:text;-webkit-background-clip:text}.nf-brand-copy b strong{font-weight:900}.nf-brand-copy small{display:block;color:#f1f1eb;font-size:7px;letter-spacing:2px;margin-top:4px}.nf-brand-copy em{display:block;color:#a4c64a;font-family:Georgia,serif;font-style:italic;font-size:9px;margin-top:4px;white-space:nowrap}.nf-brand-copy i{display:block;color:#899483;font-style:normal;font-size:7px;letter-spacing:1.7px;margin-top:4px}
        .nf-top-actions{display:flex;align-items:center;gap:17px}.nf-live{font-size:9px;letter-spacing:1.5px;color:#9ca794}.nf-live i,.nf-hero-foot i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 9px var(--green);margin-right:7px}.nf-icon-button{border:1px solid #293027;background:#111611;color:#c9d0c3;border-radius:11px;width:44px;height:44px;display:grid;place-items:center;position:relative}.nf-icon-button em{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--orange);right:8px;top:7px}.nf-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(145deg,#a6c84b,#506b25);display:grid;place-items:center;color:#10150c;text-decoration:none;font-weight:800}
        .nf-layout{max-width:900px;margin:auto;display:grid;grid-template-columns:minmax(0,1fr);gap:0;padding:24px 18px 0;position:relative;z-index:1}.nf-sidebar{display:none;position:sticky;top:22px;height:calc(100vh - 100px);min-height:580px;padding:14px 0;display:flex;flex-direction:column}.nf-side-label{font-size:9px;letter-spacing:2px;color:#778272;margin:0 0 16px 12px}.nf-side-link{display:flex;align-items:center;gap:12px;padding:13px 12px;color:#aab2a4;text-decoration:none;font-size:13px;border-radius:10px;margin-bottom:4px;transition:.2s}.nf-side-link:hover,.nf-side-link.active{background:#1a2417;color:#c1df72}.nf-side-link.active{box-shadow:inset 2px 0 var(--green)}.nf-side-bottom{margin-top:auto}.nf-side-promo{background:linear-gradient(145deg,#192318,#111711);border:1px solid #2b3827;border-radius:14px;padding:15px;margin:0 0 15px;color:var(--green);display:flex;flex-direction:column;gap:9px}.nf-side-promo b{font-size:12px;color:#e8efdf}.nf-side-promo span{font-size:11px;line-height:1.5;color:#9aa594}
        .nf-content{min-width:0;padding-bottom:30px}.nf-welcome{display:flex;align-items:flex-end;justify-content:space-between;margin:8px 0 16px}.nf-eyebrow{font-size:9px;letter-spacing:2px;color:var(--green);font-weight:700}.nf-eyebrow-line{display:inline-block;width:19px;height:1px;background:var(--orange);vertical-align:middle;margin-right:8px}.nf-welcome h1{font-size:34px;letter-spacing:-1.2px;margin:9px 0 5px}.nf-welcome h1 span{color:var(--green)}.nf-welcome p{font-size:13px;color:#9ba596;margin:0}.nf-date{border:1px solid #2b3429;border-radius:30px;padding:9px 13px;color:#aab4a3;font-size:9px;letter-spacing:1px;display:flex;align-items:center;gap:8px}
        .nf-hero-card{min-height:255px;border:1px solid #3a492e;border-radius:19px;background:radial-gradient(circle at 78% 45%,#2c3b1c 0,transparent 35%),linear-gradient(110deg,#172016,#101610 65%,#151d12);position:relative;overflow:hidden;padding:29px 34px;display:flex;align-items:center;justify-content:space-between}.nf-hero-copy{max-width:440px;position:relative;z-index:1}.nf-kicker{color:#c4d89b;font-size:9px;letter-spacing:1.6px;display:flex;align-items:center;gap:7px}.nf-kicker :global(svg){color:var(--orange)}.nf-hero-copy h2{font-size:34px;line-height:1.08;letter-spacing:-1.1px;margin:15px 0 10px}.nf-hero-copy h2 span{color:var(--green)}.nf-hero-copy p{font-size:12px;color:#aab5a2;line-height:1.65;max-width:360px;margin:0 0 19px}.nf-primary-button{background:var(--orange);color:#1a1209;text-decoration:none;padding:11px 15px;border-radius:8px;display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:800;box-shadow:0 7px 22px #f28a2228}.nf-orbit{width:220px;height:220px;position:absolute;right:10%;top:50%;transform:translateY(-50%);display:grid;place-items:center}.nf-orbit-ring{position:absolute;border:1px solid #9bbd4c55;border-radius:50%;inset:12px;transform:rotate(-25deg)}.ring-b{inset:31px;border-style:dashed;border-color:#f28a2266;transform:rotate(32deg)}.nf-orbit-core{width:112px;height:112px;border:1px solid #9cbd4c88;border-radius:50%;background:#121b10d9;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--green);box-shadow:0 0 45px #8dbb3030}.nf-orbit-core b{font-size:20px;letter-spacing:2px;margin-top:3px}.nf-orbit-core small{font-size:7px;letter-spacing:2px;color:#a5b28f;margin-top:2px}.nf-orbit-dot{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--orange);box-shadow:0 0 14px var(--orange)}.dot-a{top:19px;left:50px}.dot-b{right:9px;top:100px;background:var(--green);box-shadow:0 0 14px var(--green)}.dot-c{bottom:21px;left:60px;width:5px;height:5px}.nf-hero-foot{position:absolute;bottom:0;left:0;right:0;border-top:1px solid #ffffff0d;padding:10px 20px;display:flex;justify-content:space-between;color:#84917c;font-size:8px;letter-spacing:1.4px}
        .nf-section-heading{display:flex;align-items:flex-end;justify-content:space-between;margin:30px 0 14px}.nf-section-heading h2{font-size:20px;margin:6px 0 0;letter-spacing:-.4px}.nf-demo-tag{font-size:8px;letter-spacing:1px;color:#b5a17b;border:1px solid #51432c;background:#211b12;padding:7px 9px;border-radius:5px}
        .nf-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.nf-metric-card{background:linear-gradient(145deg,#151b15,#101410);border:1px solid #283126;border-radius:13px;padding:15px;min-width:0}.nf-metric-top{display:flex;justify-content:space-between;align-items:center;color:#9da995;font-size:8px;letter-spacing:1.3px}.nf-metric-top :global(svg){color:var(--green)}.nf-metric-card strong{display:block;font-size:25px;letter-spacing:-1px;margin:15px 0 5px;color:#f2f4ed}.nf-metric-card strong small{font-size:11px;letter-spacing:0;color:#a0aa98;font-weight:500}.nf-metric-card p{font-size:10px;color:#879283;margin:0 0 14px;min-height:14px}.nf-metric-card a{font-size:10px;color:var(--green);text-decoration:none;display:flex;align-items:center;gap:6px}.accent-card{background:linear-gradient(145deg,#241b11,#17140f);border-color:#4c3821}.accent-card .nf-metric-top :global(svg),.accent-card a{color:var(--orange)}
        .nf-main-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:13px;margin-top:14px}.nf-panel{background:linear-gradient(145deg,#131813,#0f130f);border:1px solid #283027;border-radius:14px;padding:18px;min-width:0}.nf-panel-heading{display:flex;align-items:center;justify-content:space-between}.nf-panel-heading h3{font-size:16px;margin:5px 0 0;letter-spacing:-.3px}.nf-panel-heading> :global(svg){color:var(--green)}.nf-range{display:flex;gap:3px;background:#0a0e0a;border:1px solid #252d24;padding:3px;border-radius:7px}.nf-range button{border:0;background:transparent;color:#8e9a88;font-size:9px;padding:6px 8px;border-radius:5px}.nf-range button.selected{background:#344525;color:#d5e8a5}.nf-empty-chart{min-height:205px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;gap:8px}.nf-chart-placeholder{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#1a2517;color:var(--green);border:1px solid #384a2c}.nf-empty-chart b{font-size:12px}.nf-empty-chart>span{font-size:10px;color:#899485;max-width:270px;line-height:1.5}.nf-outline-button{border:1px solid #52653a;color:#c5df8a;background:#1b2617;text-decoration:none;border-radius:7px;padding:9px 12px;display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:700;margin-top:5px}.nf-chart-legend{border-top:1px solid #252d24;padding-top:11px;display:flex;justify-content:space-between;color:#84907f;font-size:8px;letter-spacing:1.2px}.nf-chart-legend i{display:inline-block;width:7px;height:7px;background:var(--green);border-radius:50%;margin-right:7px}
        .nf-quick-panel{padding-bottom:9px}.nf-action-row{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid #252d24;text-decoration:none;color:inherit}.nf-action-row:last-child{border:0}.nf-action-icon,.nf-feature-icon{width:36px;height:36px;flex:none;border-radius:10px;display:grid;place-items:center}.green{background:#1e2b18;color:var(--green)}.orange{background:#302014;color:var(--orange)}.nf-action-row>span:nth-child(2){display:flex;flex-direction:column;gap:4px;flex:1}.nf-action-row b{font-size:11px}.nf-action-row small{font-size:9px;color:#879283}.nf-action-row> :global(svg:last-child){color:#788474}
        .nf-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-top:13px}.nf-feature-empty{display:flex;align-items:flex-start;gap:12px;padding:22px 0 15px}.nf-feature-empty b{font-size:11px}.nf-feature-empty p{font-size:10px;color:#909b8a;line-height:1.55;margin:6px 0 0}.nf-text-link{font-size:10px;color:var(--green);text-decoration:none;display:inline-flex;align-items:center;gap:6px}.nf-recommend{margin-top:14px;border:1px solid #4b3824;border-radius:14px;background:linear-gradient(100deg,#211a11,#17160f);padding:17px 19px;display:flex;align-items:center;gap:15px}.nf-recommend-icon{width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:12px;background:#3a2816;color:var(--orange)}.nf-recommend>div:nth-child(2){flex:1}.nf-recommend h3{font-size:14px;margin:5px 0}.nf-recommend p{font-size:10px;color:#a99b84;line-height:1.5;margin:0;max-width:600px}.nf-recommend .nf-outline-button{white-space:nowrap;border-color:#72502c;background:#302114;color:#ffc17b}.nf-disclaimer{font-size:9px;color:#778173;margin-top:20px;display:flex;justify-content:space-between;gap:12px}.nf-disclaimer span{letter-spacing:1.2px}
        .nf-mobile-nav{position:fixed;z-index:20;left:0;right:0;bottom:0;min-height:76px;padding:8px 6px calc(8px + env(safe-area-inset-bottom));background:#0c100cf2;border-top:1px solid #2a3327;backdrop-filter:blur(18px);display:flex;justify-content:space-around;align-items:center;gap:2px}.nf-mobile-nav button{appearance:none;border:0;background:transparent;color:#aeb8a5;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:5px;font:inherit;font-size:10px;min-width:0;min-height:52px;cursor:pointer}.nf-mobile-nav button.active{color:#c4df78}.nf-mobile-nav button:focus-visible{outline:3px solid #f28a22;outline-offset:3px;border-radius:9px}.nf-tab-panel{margin:0 auto;width:100%;max-width:820px;padding:22px}.nf-tab-description{color:#9ba596;font-size:14px;line-height:1.5;margin:10px 0 18px}.nf-home-actions{margin-top:16px}.nf-home-actions .nf-action-row{width:100%;text-align:left;background:transparent;cursor:pointer;font:inherit}
        @media(max-width:900px){.nf-layout{grid-template-columns:1fr;max-width:760px;padding:24px 18px 0}.nf-sidebar{display:none}.nf-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.nf-main-grid{grid-template-columns:1fr}.nf-orbit{right:3%;opacity:.65}.nf-hero-copy{max-width:390px}.nf-hero-card{padding-left:25px}.nf-date{font-size:8px}}
        @media(max-width:560px){.nf-shell{padding-bottom:85px}.nf-topbar{height:116px;padding:0 10px}.nf-brand{gap:5px}.nf-brand-logo{width:137px;max-height:106px}.nf-live{display:none}.nf-top-actions{gap:10px}.nf-layout{padding:20px 14px 0}.nf-welcome{align-items:flex-start;gap:10px;flex-direction:column;margin-bottom:18px}.nf-welcome h1{font-size:29px}.nf-welcome p{font-size:11px}.nf-date{align-self:flex-start}.nf-hero-card{min-height:290px;padding:22px 19px;align-items:flex-start}.nf-hero-copy{max-width:100%}.nf-hero-copy h2{font-size:29px}.nf-hero-copy p{max-width:270px;font-size:11px}.nf-orbit{width:145px;height:145px;right:-27px;top:69%;opacity:.35}.nf-orbit-core{width:80px;height:80px}.nf-orbit-core :global(svg){width:24px}.nf-orbit-core b{font-size:14px}.nf-hero-foot{padding:9px 12px;font-size:6px;letter-spacing:.8px}.nf-section-heading{align-items:flex-start;flex-direction:column;gap:9px;margin-top:25px}.nf-section-heading h2{font-size:18px}.nf-metric-grid{gap:9px}.nf-metric-card{padding:12px}.nf-metric-card strong{font-size:22px;margin:12px 0 5px}.nf-metric-card p{font-size:9px;min-height:25px;line-height:1.4}.nf-main-grid{gap:10px}.nf-panel{padding:14px}.nf-empty-chart{min-height:190px}.nf-bottom-grid{grid-template-columns:1fr;gap:10px}.nf-recommend{align-items:flex-start;flex-wrap:wrap;padding:14px}.nf-recommend>div:nth-child(2){min-width:calc(100% - 60px)}.nf-recommend .nf-outline-button{margin-left:57px}.nf-disclaimer{font-size:8px;line-height:1.5;flex-direction:column}.nf-mobile-nav{min-height:70px}.nf-tab-panel{padding:14px}}
        @media(min-width:901px){.nf-shell{padding-bottom:calc(100px + env(safe-area-inset-bottom))}.nf-content{padding-bottom:35px}}
        .nf-sidebar{display:none!important}.nf-action-row{border:0;color:inherit}.nf-mobile-nav button svg{flex:none}.nf-shell{padding-bottom:calc(100px + env(safe-area-inset-bottom))}

        /* NutriFit 360 — visual 3D inspirado na referência */
        .nf-shell{--bg:#f4eee5;--panel:#fffaf4;--panel2:#f8f1e8;--line:#e8ded1;--muted:#847b70;--text:#292923;--green:#7e9148;--orange:#ed8738;background:radial-gradient(ellipse at 50% 20%,#fffdf9 0%,#f4eee5 62%,#eee5da 100%);color:var(--text);font-family:Inter,Arial,Helvetica,sans-serif}
        .nf-glow{opacity:.14;filter:blur(65px)}.nf-glow-one{background:#a7b66a}.nf-glow-two{background:#f28c28}
        .nf-topbar{height:88px;background:#fffaf4eF;border-bottom:1px solid #e8ded1;box-shadow:0 8px 24px #65513a12}
        .nf-brand-logo{width:130px;max-height:76px;object-fit:contain}
        .nf-live{color:#777064}.nf-icon-button{background:#fffaf4;border:1px solid #eee4d8;color:#625b51;box-shadow:5px 6px 14px #78634b18,-4px -4px 12px #fff}
        .nf-avatar{background:linear-gradient(145deg,#e7d8c7,#fffaf4);color:#6f7e42;box-shadow:5px 6px 14px #78634b20,-4px -4px 12px #fff;border:1px solid #eee5dc}
        .nf-layout{max-width:980px;padding-top:24px}
        .nf-welcome h1{color:#292923}.nf-welcome h1 span{color:#7e9148}.nf-welcome p{color:#82796d}
        .nf-eyebrow{color:#7e9148}.nf-eyebrow-line{background:#ed8738}
        .nf-date,.nf-demo-tag{background:#fffaf4;border:1px solid #e9dfd3;color:#766d61;box-shadow:4px 5px 12px #76634c12,-3px -3px 10px #fff}
        .nf-section-heading h2{color:#292923}
        .nf-panel,.nf-home-panorama,.nf-dashboard-goals,.nf-metric-card{background:linear-gradient(145deg,#fffdf9,#f5eee5);border:1px solid #fff;border-radius:22px;box-shadow:9px 12px 24px #77634c20,-6px -6px 16px #fff}
        .nf-home-panorama{padding:20px;border-color:#fff}
        .nf-home-panorama-head h3,.nf-panel-heading h3{color:#292923}
        .nf-live-label{color:#7e9148}
        .nf-home-ring-copy strong,.nf-home-stats strong{color:#292923}
        .nf-home-ring b,.nf-home-stats article>span{color:#71685d}
        .nf-home-ring-target,.nf-home-stats button,.nf-home-macros span{color:#8b8175}
        .nf-home-stats article{background:#f7f0e8;border:1px solid #eee4d8;border-radius:16px;box-shadow:inset 2px 2px 5px #8c77501a,inset -2px -2px 5px #fff}
        .nf-home-stats button{color:#748543}
        .nf-home-macros{border-top:1px solid #e8ded1}
        .nf-dashboard-goals{padding:16px;color:#292923}
        .nf-dashboard-goals button{background:#f7f0e8;color:#292923;border:1px solid #eee4d8}
        .nf-panel{color:#292923}
        .nf-panel-heading> :global(svg){color:#7e9148}
        .nf-tab-description,.nf-disclaimer{color:#847b70}
        .nf-mobile-nav{background:#fffaf4ed;border-top:1px solid #e7ddd1;box-shadow:0 -8px 24px #65513a16;backdrop-filter:blur(18px)}
        .nf-mobile-nav button{color:#81776b}.nf-mobile-nav button.active{color:#71843e}
        .nf-mobile-nav button.active svg{filter:drop-shadow(0 2px 2px #7e914833)}
        .nf-sidebar{color:#292923}.nf-side-link{color:#70685d}.nf-side-link.active{background:#eaf0dc;color:#687b38;box-shadow:inset 2px 0 #7e9148}
        .nf-side-promo{background:#fffaf4;border:1px solid #eee4d8;color:#7e9148;box-shadow:8px 10px 20px #78634b18}
        .nf-side-promo b{color:#292923}.nf-side-promo span{color:#81776b}
        .nf-3d-scene{height:290px;position:relative;margin:18px 0 24px;overflow:hidden;border-radius:26px;background:linear-gradient(145deg,#fffdf9,#f3eadf);border:1px solid #fff;box-shadow:12px 16px 28px #76634c20,-7px -7px 18px #fff}
        .nf-scene-platform{position:absolute;left:13%;right:13%;bottom:32px;height:112px;border-radius:28px;background:linear-gradient(145deg,#b5c86a,#7e9148);transform:skewY(-8deg) rotate(-2deg);box-shadow:0 18px 20px #61743835}
        .nf-scene-platform-top{position:absolute;inset:0 0 17px;border-radius:26px;background:linear-gradient(145deg,#fffaf2,#e8dcca);border:2px solid #fff;box-shadow:inset 0 3px 8px #fff}
        .nf-scene-person{position:absolute;left:46%;bottom:105px;font-size:86px;transform:translateX(-50%);filter:drop-shadow(7px 10px 5px #66513b35);z-index:3}
        .nf-scene-rack{position:absolute;left:22%;bottom:104px;width:120px;height:65px;border:7px solid #a9a39b;border-bottom-width:5px;border-radius:10px 10px 4px 4px;display:flex;align-items:flex-start;justify-content:space-around;padding:7px 5px;transform:perspective(200px) rotateY(-17deg);z-index:2;color:#56514c}
        .nf-scene-rack span{font-size:19px;text-shadow:2px 3px 2px #0004}.nf-scene-rack small{position:absolute;bottom:-14px;left:4px;color:#777}
        .nf-scene-bench{position:absolute;right:24%;bottom:97px;font-size:65px;color:#817b73;transform:rotate(-12deg);text-shadow:3px 5px 4px #0003;z-index:2}
        .nf-scene-bottle{position:absolute;right:17%;bottom:115px;width:29px;height:67px;border-radius:9px 9px 6px 6px;background:linear-gradient(90deg,#d9782e,#f3a24d,#c96726);border-top:9px solid #7d6b58;display:grid;place-items:center;color:#fff;font-size:8px;font-weight:900;box-shadow:4px 6px 8px #0002;z-index:3}
        .nf-scene-mat{position:absolute;right:31%;bottom:56px;width:90px;height:19px;border-radius:20px;background:linear-gradient(90deg,#a7b66a,#71883c);transform:rotate(-15deg);box-shadow:3px 5px 6px #0002;z-index:3}
        .nf-scene-plant{position:absolute;z-index:4;font-size:32px;filter:drop-shadow(3px 5px 3px #0002)}.plant-one{left:13%;bottom:100px}.plant-two{right:12%;bottom:105px}
        .nf-scene-clock{position:absolute;right:28%;top:24px;width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#fffaf4;border:5px solid #ed8738;color:#6c6257;font-size:32px;box-shadow:4px 6px 10px #0002}
        .nf-scene-spark{position:absolute;color:#ed8738;font-size:24px}.spark-one{right:12%;top:44px}.spark-two{left:17%;top:70px;color:#a7b66a}
        .nf-scene-caption{position:absolute;left:22px;top:22px;display:flex;flex-direction:column;gap:5px;z-index:5}.nf-scene-caption b{font-size:14px;color:#4d5933}.nf-scene-caption span{font-size:10px;color:#8b8175}
        .nf-3d-scene:after{content:"";position:absolute;width:130px;height:130px;right:8%;bottom:-70px;border-radius:50%;background:#a7b66a;filter:blur(45px);opacity:.35}
        @media(max-width:560px){.nf-topbar{height:84px;padding:0 10px}.nf-brand-logo{width:112px;max-height:70px}.nf-layout{padding:16px 12px 0}.nf-3d-scene{height:255px;margin:14px 0 20px}.nf-scene-platform{left:7%;right:7%;bottom:24px;height:94px}.nf-scene-person{font-size:72px;bottom:89px;left:48%}.nf-scene-rack{left:13%;bottom:89px;transform:scale(.82) perspective(200px) rotateY(-17deg);transform-origin:left bottom}.nf-scene-bench{right:19%;bottom:83px;font-size:54px}.nf-scene-bottle{right:10%;bottom:96px;transform:scale(.85)}.nf-scene-mat{right:26%;bottom:45px;width:70px}.plant-one{left:7%;bottom:85px}.plant-two{right:5%;bottom:91px}.nf-scene-clock{right:20%;top:24px;width:37px;height:37px;font-size:26px}.nf-scene-caption{left:14px;top:15px}.nf-scene-caption b{font-size:12px}.nf-scene-caption span{font-size:9px;max-width:190px}.nf-home-panorama{padding:14px}.nf-home-rings{gap:8px}.nf-home-stats{gap:8px}}
        @media(prefers-reduced-motion:reduce){.nf-3d-scene *{animation:none!important;transition:none!important}}

      
        /* Componentes internos: acabamento claro e tátil em todos os módulos */
        :global(.nf-home-panorama),:global(.nf-dashboard-goals){background:linear-gradient(145deg,#fffdf9,#f5eee5)!important;border:1px solid #fff!important;border-radius:22px!important;box-shadow:9px 12px 24px #77634c20,-6px -6px 16px #fff!important;color:#292923!important}
        :global(.nf-home-panorama-head h3),:global(.nf-home-stats strong),:global(.nf-home-ring-copy strong),:global(.nf-dashboard-goals b){color:#292923!important}
        :global(.nf-home-ring b),:global(.nf-home-ring-target),:global(.nf-home-stats article>span),:global(.nf-home-macros span){color:#766d61!important}
        :global(.nf-home-stats article){background:#f7f0e8!important;border:1px solid #eee4d8!important;border-radius:16px!important;box-shadow:inset 2px 2px 5px #8c77501a,inset -2px -2px 5px #fff!important}
        :global(.nf-home-stats button),:global(.nf-dashboard-goals button){color:#71843f!important}
        :global(.nf-home-macros){border-top-color:#e8ded1!important}
        :global(.nf-live-label){color:#71843f!important}
        :global(.nf-training-tracker),:global(.nf-nutrition-tracker),:global(.nf-goals),:global(.wt-root){color:#292923!important}
        :global(.nf-training-stats>div),:global(.nf-training-week),:global(.nf-training-form),:global(.nf-training-history),:global(.nf-macro-layout),:global(.nf-food-adder),:global(.nf-food-portions),:global(.nf-food-summary),:global(.nf-meal-history),:global(.nf-goals-overview),:global(.nf-goal-form),:global(.nf-goal-card),:global(.wt-summary>div),:global(.wt-chart-card),:global(.wt-history){background:linear-gradient(145deg,#fffdf9,#f5eee5)!important;border:1px solid #e9dfd3!important;border-radius:18px!important;box-shadow:5px 7px 16px #76634c12,-4px -4px 10px #fff!important;color:#292923!important}
        :global(.nf-training-tracker h4),:global(.nf-nutrition-tracker h4),:global(.nf-goals h4),:global(.nf-goal-card b),:global(.wt-history h4),:global(.wt-chart-head b){color:#292923!important}
        :global(.nf-training-tracker small),:global(.nf-nutrition-tracker small),:global(.nf-goals small),:global(.wt-root small),:global(.wt-history p){color:#81776b}
        :global(.nf-training-day),:global(.nf-training-row),:global(.nf-meal-row),:global(.nf-goal-list),:global(.wt-history li){border-color:#e8ded1!important;color:#292923!important}
        :global(.nf-training-bar-track),:global(.nf-goal-track){background:#e9e1d6!important}
        :global(.nf-training-bar-track span),:global(.nf-goal-progress span){background:linear-gradient(90deg,#a7b66a,#71843f)!important}
        :global(.nf-food-adder input),:global(.nf-food-adder select),:global(.nf-meal-form input),:global(.nf-meal-form select),:global(.wt-form input),:global(.nf-goal-form input),:global(.nf-goal-form select),:global(.nf-goal-form textarea){background:#fffdf9!important;border:1px solid #e3d8ca!important;color:#292923!important;border-radius:12px!important;box-shadow:inset 2px 2px 5px #8c77501a,inset -2px -2px 5px #fff!important}
        :global(.nf-food-add),:global(.nf-chart-action),:global(.wt-form button),:global(.nf-goal-form button){background:linear-gradient(145deg,#a7b66a,#7e9148)!important;color:#fff!important;border:0!important;border-radius:13px!important;box-shadow:0 6px 14px #71843f30!important}
        :global(.nf-food-portion button),:global(.nf-meal-history button),:global(.wt-history-head button),:global(.nf-goal-delete){color:#d87932!important}
        :global(.wt-line){stroke:#7e9148!important}:global(.wt-point){fill:#ed8738!important}:global(.wt-grid-line){stroke:#e7ded2!important}:global(.wt-axis-label){fill:#847b70!important}
        :global(.wt-period){background:#f2eadf!important;border-color:#e5dacd!important}:global(.wt-period button){color:#81776b!important}:global(.wt-period button.active){background:#e5edcf!important;color:#617536!important}
        :global(.nf-goal-message),:global(.nf-meal-error),:global(.wt-error){color:#b85c30!important}
        :global(.nf-nutrition-empty),:global(.nf-goal-empty),:global(.wt-chart-empty){color:#82796d!important}
        :global(.nf-macro-center strong),:global(.nf-food-kcal){color:#71843f!important}
        :global(.nf-macro-center small),:global(.nf-macro-legend span){color:#766d61!important}
        :global(.nf-macro-legend>div){border-color:#e8ded1!important}
        :global(.nf-tab-panel){background:transparent!important;border:0!important;box-shadow:none!important}

      
        /* Refinamento fiel à referência: cena vetorial isométrica e cartões 3D */
        .nf-3d-scene{height:390px;margin:20px 0 26px;border-radius:30px;background:linear-gradient(145deg,#fffdf8 0%,#f4ecdf 100%);box-shadow:14px 18px 32px #76634c20,-7px -7px 18px #fff;border:1px solid #fff;overflow:hidden}
        .nf-gym-svg{position:absolute;width:min(100%,760px);height:auto;left:50%;bottom:-2px;transform:translateX(-50%);z-index:1;overflow:visible}
        .nf-scene-caption{left:26px;top:24px;z-index:4}
        .nf-scene-caption b{font-size:16px;color:#4d5933;letter-spacing:-.2px}
        .nf-scene-caption span{font-size:11px;color:#8b8175}
        .nf-scene-float{position:absolute;z-index:4;display:flex;align-items:center;gap:9px;padding:10px 13px;border-radius:15px;background:linear-gradient(145deg,#fffefa,#f4eee5);border:1px solid #fff;box-shadow:7px 9px 18px #76634c20,-4px -4px 10px #fff;color:#7e9148}
        .nf-scene-float span{display:flex;flex-direction:column;gap:2px}.nf-scene-float b{font-size:10px;color:#403d35}.nf-scene-float small{font-size:8px;color:#8b8175}
        .nf-scene-heart{right:22px;top:22px}.nf-scene-time{right:24px;top:88px}
        .nf-home-macros>div{background:linear-gradient(145deg,#fffdf9,#f3ebdf)!important;border:1px solid #e9dfd3!important;border-radius:16px!important;padding:13px!important;box-shadow:inset 2px 2px 5px #8c77501a,inset -2px -2px 5px #fff!important}
        .nf-home-macros>div b{color:#292923!important}.nf-home-macros>div span{color:#81776b!important}
        .nf-home-panorama{border-radius:26px!important;padding:22px!important}
        .nf-home-ring svg .track{stroke:#e9e1d6!important}.nf-home-ring-copy strong{color:#292923!important}
        .nf-home-stats article{min-height:132px;padding:16px!important}
        .nf-home-stats article strong{color:#292923!important}
        @media(max-width:560px){.nf-3d-scene{height:365px;margin:16px 0 22px;border-radius:26px}.nf-gym-svg{width:125%;max-width:none;left:50%;bottom:0}.nf-scene-caption{left:17px;top:18px}.nf-scene-caption b{font-size:13px}.nf-scene-caption span{font-size:9px;max-width:210px}.nf-scene-float{padding:8px 10px;border-radius:12px;gap:6px}.nf-scene-float b{font-size:9px}.nf-scene-float small{font-size:7px}.nf-scene-heart{right:12px;top:18px}.nf-scene-time{right:12px;top:74px}.nf-home-panorama{padding:15px!important}.nf-home-stats article{min-height:116px;padding:12px!important}.nf-home-macros>div{padding:10px!important}}

            

        .nf-reference-shell{min-height:100svh;padding:14px 12px calc(86px + env(safe-area-inset-bottom));background:radial-gradient(ellipse at 50% 12%,#fff 0%,#eef0f3 48%,#e7e9ed 100%);color:#20211f;font-family:Inter,Arial,sans-serif;overflow-x:hidden}
        .nf-reference-header{width:100%;max-width:430px;min-height:82px;margin:0 auto 12px;padding:10px 12px;display:flex;align-items:center;gap:10px;border:1px solid #fff;border-radius:22px;background:linear-gradient(145deg,#fffefa,#f7f1e8);box-shadow:9px 12px 22px #77634c20,-6px -6px 15px #fff;position:relative}
        .nf-reference-brand{width:62px;height:62px;flex:0 0 62px;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .nf-reference-brand img{width:100%;height:100%;object-fit:contain}
        .nf-reference-greeting{min-width:0;flex:1}
        .nf-reference-brandline{font-size:12px;font-weight:900;letter-spacing:.2px;color:#71843f;line-height:1.2}
        .nf-reference-brandline span{color:#ed8738}
        .nf-reference-greeting h1{margin:4px 0 0;font-size:18px;line-height:1.2;letter-spacing:-.35px;color:#20211f;font-weight:800;white-space:nowrap}
        .nf-reference-greeting h1 span{font-size:16px}
        .nf-reference-actions{display:flex;align-items:center;gap:7px}
        .nf-reference-bell{width:32px;height:32px;position:relative;border:0;border-radius:11px;background:transparent;color:#8d877e;display:grid;place-items:center}
        .nf-reference-bell i{position:absolute;right:4px;top:3px;width:8px;height:8px;border-radius:50%;background:#e83e3b;border:1px solid #fff}
        .nf-reference-avatar{width:43px;height:43px;flex:0 0 43px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#f2d7c2,#b87955);border:3px solid #fff;box-shadow:4px 5px 10px #76634c25;font-size:23px;position:relative}
        .nf-reference-avatar i{position:absolute;right:-2px;bottom:0;width:11px;height:11px;border-radius:50%;background:#a6d900;border:2px solid #fff}
        .nf-reference-main{max-width:430px;margin:0 auto}
        .nf-dashboard-summary{display:flex;flex-direction:column;gap:10px}
        .nf-reference-toprow{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(112px,.85fr);gap:9px;align-items:stretch}
        .nf-reference-metrics{display:grid;grid-template-columns:1fr 1fr;min-width:0;overflow:hidden;border-radius:19px;border:1px solid #fff;background:linear-gradient(145deg,#fffefa,#f7f1e8);box-shadow:8px 10px 18px #77634c1c,-5px -5px 12px #fff}
        .nf-reference-metric{min-width:0;padding:10px 9px;display:flex;flex-direction:column;gap:4px;justify-content:center}
        .nf-reference-metric+ .nf-reference-metric{border-left:1px solid #e4dcd1}
        .nf-reference-metric-label{display:flex;align-items:center;gap:5px;font-size:8px;letter-spacing:.45px;color:#81796f;white-space:nowrap}
        .nf-reference-metric-label svg{color:#91ad42;flex:none}
        .nf-reference-metric:nth-child(2) .nf-reference-metric-label svg{color:#4aa8d7}
        .nf-reference-metric strong{font-size:22px;line-height:1.05;font-weight:850;color:#20211f}
        .nf-reference-metric small{font-size:8px;line-height:1.2;color:#948a7e}
        .nf-weekly-ticket{min-width:0;border:0;border-radius:13px;padding:9px 9px;background:linear-gradient(145deg,#d5f326,#bde400);box-shadow:5px 7px 14px #91b90c44,inset 1px 1px 2px #fff9;color:#22251a;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:3px;text-align:left}
        .nf-weekly-ticket>span{font-size:8px;font-weight:800;letter-spacing:.35px;display:flex;align-items:center;gap:4px;white-space:nowrap}
        .nf-weekly-ticket>strong{font-size:22px;line-height:1.05;font-weight:900}
        .nf-weekly-ticket>small{font-size:7px;line-height:1.2;opacity:.78}
        .nf-3d-scene{height:275px;position:relative;margin:0;border-radius:25px;background:linear-gradient(145deg,#fffdf8 0%,#f4ecdf 100%);box-shadow:12px 15px 25px #76634c20,-7px -7px 17px #fff;border:1px solid #fff;overflow:hidden}
        .nf-gym-svg{position:absolute;width:116%;max-width:none;height:auto;left:50%;bottom:-4px;transform:translateX(-50%);z-index:1;overflow:visible}
        .nf-scene-caption{position:absolute;left:16px;top:15px;z-index:4;display:flex;flex-direction:column;gap:3px;max-width:210px}
        .nf-scene-caption b{font-size:12px;color:#4d5933;letter-spacing:-.15px}
        .nf-scene-caption span{font-size:8px;color:#8b8175}
        .nf-scene-heart,.nf-scene-time{display:none}
        .nf-reference-side-pill{position:absolute;z-index:5;left:9px;top:50px;width:42px;height:164px;border-radius:22px;background:linear-gradient(145deg,#fffefa,#f5eee5);box-shadow:6px 8px 16px #76634c24,-4px -4px 11px #fff;border:1px solid #fff;display:flex;flex-direction:column;align-items:center;justify-content:space-around;padding:7px 0}
        .nf-reference-side-pill button{width:29px;height:29px;border:0;border-radius:10px;background:transparent;color:#9a948b;display:grid;place-items:center;padding:0}
        .nf-reference-side-pill button.active{background:linear-gradient(145deg,#d7f52a,#b8df00);color:#586e26;box-shadow:inset 2px 2px 4px #8eaf1e55,2px 3px 6px #6d832c22}
        .nf-reference-lower{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.92fr);gap:9px}
        .nf-reference-card{min-width:0;border:1px solid #fff;border-radius:19px;background:linear-gradient(145deg,#fffefa,#f6efe6);box-shadow:8px 10px 18px #77634c1c,-5px -5px 12px #fff;padding:10px}
        .nf-reference-card-heading{display:flex;align-items:center;justify-content:space-between;gap:4px}
        .nf-reference-card h2{margin:0 0 6px;font-size:11px;line-height:1.2;font-weight:850;color:#20211f;white-space:nowrap}
        .nf-reference-card-heading h2{margin:0}
        .nf-reference-card-heading>span{font-size:7px;color:#92897e}
        .nf-reference-bars{height:62px;display:flex;align-items:flex-end;justify-content:space-around;gap:5px;padding:3px 0 0}
        .nf-reference-bar-column{height:100%;display:flex;flex:1;min-width:0;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px}
        .nf-reference-bar-column>span{display:block;width:min(17px,72%);min-height:5px;border-radius:8px 8px 6px 6px;background:linear-gradient(145deg,#d7d5d3,#b8b5b4);box-shadow:3px 4px 7px #8884,-2px -2px 4px #fff}
        .nf-reference-bar-column>span.has-value{background:linear-gradient(145deg,#d9f42c,#b7dc00);box-shadow:3px 4px 7px #91b41f55,-2px -2px 4px #fff}
        .nf-reference-bar-column small{font-size:6px;color:#968d82}
        .nf-weekly-progress p{font-size:7px;line-height:1.3;color:#91877b;margin:4px 0 0}
        .nf-achievements{display:flex;flex-direction:column;gap:5px}
        .nf-achievements h2{margin:0 0 1px}
        .nf-achievement-pill{height:20px;border-radius:11px;background:linear-gradient(145deg,#fffefa,#f3ece2);box-shadow:3px 4px 7px #76634c1c,-2px -2px 5px #fff;display:flex;align-items:center;justify-content:space-between;padding:0 6px;gap:4px;font-size:10px;color:#ed8738}
        .nf-achievement-pill b{font-size:8px;font-weight:600;color:#37342f;flex:1}
        .nf-reference-tip{max-width:430px;min-height:61px;margin:0 auto 8px;padding:9px 12px;display:flex;align-items:center;gap:10px;border:1px solid #fff;border-radius:18px;background:linear-gradient(145deg,#fffefa,#f6efe6);box-shadow:8px 10px 18px #77634c1c,-5px -5px 12px #fff}
        .nf-reference-tip-icon{width:39px;height:39px;flex:0 0 39px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#fff3cc,#f4d68c);box-shadow:inset 2px 2px 5px #e5c88c55;font-size:22px}
        .nf-reference-tip h2{margin:0 0 3px;font-size:11px;color:#292923}
        .nf-reference-tip p{margin:0;font-size:9px;line-height:1.25;color:#7f766b}
        .nf-reference-footer{max-width:430px;margin:0 auto;color:#958b80;font-size:7px;line-height:1.4;padding:0 4px}
        .nf-reference-footer span{display:block;margin-top:5px;letter-spacing:1.1px}
        .nf-reference-nav{position:fixed;z-index:30;left:0;right:0;bottom:0;min-height:72px;padding:6px 8px calc(6px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:space-around;gap:2px;background:rgba(255,252,246,.96);border-top:1px solid #e8ded1;box-shadow:0 -8px 20px #76634c16;backdrop-filter:blur(18px)}
        .nf-reference-nav button{flex:1;min-width:0;height:58px;border:0;border-radius:14px;background:transparent;color:#8b8379;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:inherit;cursor:pointer}
        .nf-reference-nav button.active{color:#6e843b}
        .nf-reference-nav button.active svg{background:linear-gradient(145deg,#d8f52a,#b7df00);box-shadow:inset 2px 2px 4px #8eaf1e55,2px 3px 6px #6d832c22;border-radius:10px;padding:4px;width:30px;height:30px}
        .nf-reference-nav button svg{width:23px;height:23px}
        .nf-reference-nav button span{font-size:9px;line-height:1.1}
        .nf-reference-panel{max-width:430px;margin:0 auto;padding:14px;border:1px solid #fff;border-radius:22px;background:linear-gradient(145deg,#fffefa,#f6efe6);box-shadow:9px 12px 24px #77634c20,-6px -6px 16px #fff;color:#292923}
        .nf-reference-panel h2{color:#292923}
        .nf-reference-panel .nf-eyebrow{color:#71843f}
        .nf-reference-panel :global(.nf-training-stats>article),.nf-reference-panel :global(.nf-training-stats>div){background:#f7f0e8!important;border:1px solid #eee4d8!important;color:#292923!important}
        .nf-dashboard-error{font-size:9px;color:#b85c30;margin:0}
        @media(min-width:561px){.nf-reference-shell{padding-top:24px}.nf-reference-header{margin-bottom:16px}.nf-reference-main{padding:0 14px}.nf-3d-scene{height:320px}.nf-gym-svg{width:min(100%,760px)}}
        @media(max-width:370px){.nf-reference-header{gap:6px;padding:8px}.nf-reference-brand{width:52px;height:52px;flex-basis:52px}.nf-reference-greeting h1{font-size:16px}.nf-reference-metric{padding:8px 6px}.nf-reference-metric-label{font-size:7px}.nf-weekly-ticket{padding:7px}.nf-weekly-ticket>strong{font-size:20px}.nf-3d-scene{height:252px}}
        @media(prefers-reduced-motion:reduce){.nf-reference-shell *{scroll-behavior:auto!important;transition:none!important}}

        /* Fidelity pass: composition and clay-like depth inspired by the supplied 3D reference */
        .nf-reference-shell{background:radial-gradient(ellipse at 50% 24%,#f5f6f8 0%,#eceef1 58%,#e5e7eb 100%);padding:12px 12px calc(82px + env(safe-area-inset-bottom))}
        .nf-reference-header{min-height:78px;margin-bottom:11px;padding:9px 12px;border-radius:22px;background:linear-gradient(145deg,#fff 0%,#f6f4f1 100%);box-shadow:10px 12px 22px #5b606b22,-7px -7px 16px #fff}
        .nf-reference-brand{width:58px;height:58px;flex-basis:58px;border-radius:50%;background:radial-gradient(circle at 32% 25%,#343434,#050505 72%);box-shadow:inset 2px 2px 5px #ffffff20,4px 6px 12px #34343425}
        .nf-reference-brand img{width:94%;height:94%;object-fit:contain}
        .nf-reference-greeting h1{font-size:19px;letter-spacing:-.45px}
        .nf-reference-toprow{grid-template-columns:minmax(0,1.5fr) minmax(112px,.88fr);gap:10px}
        .nf-reference-metrics{min-height:102px;border-radius:20px;background:linear-gradient(145deg,#fff 0%,#f4f1ed 100%);box-shadow:8px 10px 18px #555b681c,-6px -6px 14px #fff}
        .nf-reference-metric{padding:10px 9px;gap:6px}
        .nf-reference-metric-label{font-size:8px;letter-spacing:.55px}
        .nf-reference-metric strong{font-size:24px;letter-spacing:-.7px}
        .nf-weekly-ticket{min-height:102px;border-radius:14px;background:linear-gradient(145deg,#d9fa18 0%,#bde600 60%,#a9d500 100%);box-shadow:7px 9px 15px #789c173d,inset 2px 2px 3px #f7ffb7,inset -2px -3px 5px #88aa00}
        .nf-weekly-ticket>span{font-size:8px;letter-spacing:.2px}
        .nf-weekly-ticket>strong{font-size:26px;text-shadow:0 1px 0 #f5ff9c}
        .nf-dashboard-summary{gap:12px}
        .nf-3d-scene{height:335px;margin:0 -1px 0;border:0;border-radius:0;background:radial-gradient(ellipse at 51% 58%,#fffdf8 0%,#f0f0ee 58%,transparent 78%);box-shadow:none;overflow:visible}
        .nf-3d-scene:before{content:"";position:absolute;left:13%;right:4%;bottom:10px;height:35px;border-radius:50%;background:#77705f20;filter:blur(18px);z-index:0}
        .nf-gym-svg{width:132%;height:auto;max-width:none;left:55%;bottom:-1px;transform:translateX(-50%);z-index:1;filter:drop-shadow(0 13px 10px #554a3938)}
        .nf-gym-svg g{filter:drop-shadow(1px 3px 2px #5a514333)}
        .nf-scene-caption{display:none}
        .nf-reference-side-pill{left:0;top:48%;transform:translateY(-50%);width:43px;height:174px;border-radius:23px;background:linear-gradient(145deg,#fff 0%,#f0eeeb 100%);box-shadow:7px 9px 17px #555b6828,-5px -5px 12px #fff;border:1px solid #fff}
        .nf-reference-side-pill button{width:31px;height:31px;border-radius:11px}
        .nf-reference-side-pill button.active{background:linear-gradient(145deg,#dfff20,#b5df00);box-shadow:inset 2px 2px 4px #809d1f66,3px 4px 7px #6d832c35}
        .nf-reference-lower{gap:10px}
        .nf-reference-card{min-height:145px;border-radius:22px;padding:13px 12px;background:linear-gradient(145deg,#fff 0%,#f2efeb 100%);box-shadow:9px 11px 19px #555b681d,-6px -6px 14px #fff}
        .nf-reference-card h2{font-size:12px;margin-bottom:8px}
        .nf-reference-bars{height:76px;gap:7px}
        .nf-reference-bar-column>span{width:min(19px,76%);border-radius:9px;background:linear-gradient(145deg,#e1dfdd,#b9b7b8);box-shadow:3px 5px 7px #7774,-2px -2px 4px #fff}
        .nf-reference-bar-column>span.has-value{background:linear-gradient(145deg,#e0fb2d,#b6df00);box-shadow:3px 5px 8px #8aa92766,-2px -2px 4px #fff}
        .nf-achievement-pill{height:24px;border-radius:13px;background:linear-gradient(145deg,#fff,#eeeae5);box-shadow:3px 4px 8px #71685d20,-2px -2px 5px #fff;font-size:11px}
        .nf-achievement-pill b{font-size:9px}
        .nf-reference-tip{min-height:68px;margin:0 auto 9px;border-radius:21px;padding:10px 14px;background:linear-gradient(145deg,#fff 0%,#f1eee9 100%);box-shadow:9px 11px 18px #555b681c,-6px -6px 14px #fff}
        .nf-reference-tip-icon{width:43px;height:43px;flex-basis:43px;font-size:24px;box-shadow:inset 2px 2px 5px #e5c88c66,3px 4px 8px #9e825233}
        .nf-reference-tip h2{font-size:12px}
        .nf-reference-tip p{font-size:10px}
        .nf-reference-nav{min-height:76px;background:rgba(255,253,249,.97);border-top:1px solid #fff;box-shadow:0 -8px 20px #565b6817}
        .nf-reference-nav button{height:62px}
        .nf-reference-nav button span{font-size:10px}
        @media(max-width:560px){
          .nf-reference-shell{padding-left:11px;padding-right:11px}
          .nf-3d-scene{height:335px;margin-top:-1px}
          .nf-gym-svg{width:137%;left:56%;bottom:0}
          .nf-reference-side-pill{left:-2px;top:51%;height:164px}
          .nf-reference-lower{grid-template-columns:minmax(0,1.12fr) minmax(0,.92fr)}
          .nf-reference-card{min-height:140px;padding:11px 9px}
          .nf-reference-bars{height:70px}
        }
        @media(max-width:370px){
          .nf-3d-scene{height:300px}
          .nf-gym-svg{width:139%;left:57%}
          .nf-reference-side-pill{width:38px;height:150px}
          .nf-reference-metric-label{font-size:7px}
          .nf-reference-card h2{font-size:10px}
        }


   `}</style>
  </main>
 );
}

export default function AreaNutrifitPage() {
 return <AreaAuthGate><DashboardContent/></AreaAuthGate>;
}
