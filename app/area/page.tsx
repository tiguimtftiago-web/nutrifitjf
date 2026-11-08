"use client";

import AreaAuthGate from "./area-auth-gate";
import WeightTracker from "./weight-tracker";
import DashboardSummary from "./dashboard-summary";
import NutritionTracker from "./nutrition-tracker";
import TrainingTracker from "./training-tracker";
import GoalTracker from "./goal-tracker";
import {
  Activity, ArrowDownRight, ArrowRight, Bell, Bike, CalendarDays,
  ChevronRight, CircleHelp, Dumbbell, Flame, Footprints, HeartPulse,
  Home, Leaf, Moon, Plus, Salad, Scale, Sparkles, Target, Utensils,
  Watch, Zap,
} from "lucide-react";

function DashboardContent() {
  return (
    <main className="nf-shell">
      <div className="nf-glow nf-glow-one" />
      <div className="nf-glow nf-glow-two" />
      <header className="nf-topbar">
        <a className="nf-brand" href="/" aria-label="Voltar para Nutrifit">
          <span className="nf-brand-mark">N<span>F</span></span>
          <span><b>NUTRIFIT</b><small>360° · ÁREA DO CLIENTE</small></span>
        </a>
        <div className="nf-top-actions">
          <span className="nf-live"><i /> PAINEL PESSOAL</span>
          <button className="nf-icon-button" aria-label="Notificações"><Bell size={18}/><em /></button>
          <a className="nf-avatar" href="#perfil" aria-label="Perfil">T</a>
        </div>
      </header>

      <div className="nf-layout">
        <aside className="nf-sidebar">
          <p className="nf-side-label">SEU ESPAÇO</p>
          <a className="nf-side-link active" href="#inicio"><Home size={17}/> Visão geral</a>
          <a className="nf-side-link" href="#treino"><Dumbbell size={17}/> Treinamento</a>
          <a className="nf-side-link" href="#alimentacao"><Salad size={17}/> Alimentação</a>
          <a className="nf-side-link" href="#evolucao"><Activity size={17}/> Evolução</a>
          <a className="nf-side-link" href="#metas"><Target size={17}/> Metas e desafios</a>
          <div className="nf-side-bottom">
            <div className="nf-side-promo"><Sparkles size={18}/><b>Sua jornada, seus dados.</b><span>Pequenos registros ajudam a enxergar o caminho.</span></div>
            <a className="nf-side-link" href="/"><CircleHelp size={17}/> Voltar à loja</a>
          </div>
        </aside>

        <section className="nf-content" id="inicio">
          <div className="nf-welcome">
            <div>
              <div className="nf-eyebrow"><span className="nf-eyebrow-line"/> CENTRAL DE COMANDO</div>
              <h1>Olá, <span>Tiago.</span></h1>
              <p>Seu espaço para acompanhar cada passo da sua evolução.</p>
            </div>
            <div className="nf-date"><CalendarDays size={15}/> DOMINGO, 08 NOV</div>
          </div>

          <section className="nf-hero-card">
            <div className="nf-hero-copy">
              <span className="nf-kicker"><Sparkles size={14}/> SUA JORNADA EM FOCO</span>
              <h2>Consistência constrói<br/><span>evolução.</span></h2>
              <p>Registre seus hábitos, acompanhe seus dados e descubra o que funciona para você.</p>
              <a href="#evolucao" className="nf-primary-button">Ver minha evolução <ArrowRight size={16}/></a>
            </div>
            <div className="nf-orbit" aria-hidden="true">
              <div className="nf-orbit-ring ring-a"/><div className="nf-orbit-ring ring-b"/>
              <div className="nf-orbit-core"><Activity size={38}/><b>360°</b><small>EVOLUÇÃO</small></div>
              <span className="nf-orbit-dot dot-a"/><span className="nf-orbit-dot dot-b"/><span className="nf-orbit-dot dot-c"/>
            </div>
            <div className="nf-hero-foot"><span><i/> PAINEL DE ACOMPANHAMENTO</span><span>SEUS DADOS • SUA JORNADA</span></div>
          </section>

          <div className="nf-section-heading">
            <div><div className="nf-eyebrow">VISÃO GERAL</div><h2>Seu panorama</h2></div>
            <span className="nf-demo-tag">REGISTROS REAIS DE PESO DISPONÍVEIS</span>
          </div>

          <DashboardSummary />

          <div className="nf-main-grid">
            <section className="nf-panel nf-chart-panel" id="evolucao">
              <div className="nf-panel-heading">
                <div><div className="nf-eyebrow">ACOMPANHAMENTO</div><h3>Minha evolução</h3></div>
                <span className="nf-chart-caption">PESAGENS REGISTRADAS</span>
              </div>
              <WeightTracker />
              <div className="nf-empty-chart" style={{display:"none"}}>
                <div className="nf-chart-placeholder"><Activity size={24}/></div>
                <b>Seu gráfico começa com o primeiro registro</b>
                <span>Registre seu peso para visualizar tendências ao longo do tempo.</span>
                <a href="#evolucao" className="nf-outline-button">Registrar primeiro peso <Plus size={15}/></a>
              </div>
              <div className="nf-chart-legend"><span><i/> PESO REGISTRADO</span><small>HISTÓRICO PESSOAL</small></div>
            </section>

            <section className="nf-panel nf-quick-panel">
              <div className="nf-panel-heading"><div><div className="nf-eyebrow">AÇÃO RÁPIDA</div><h3>Registrar agora</h3></div><Zap size={18}/></div>
              <a className="nf-action-row" href="#treino"><span className="nf-action-icon green"><Dumbbell size={18}/></span><span><b>Meu treino</b><small>Exercícios, séries e cargas</small></span><ChevronRight size={17}/></a>
              <a className="nf-action-row" href="#alimentacao"><span className="nf-action-icon orange"><Salad size={18}/></span><span><b>Minha alimentação</b><small>Refeições e macronutrientes</small></span><ChevronRight size={17}/></a>
              <a className="nf-action-row" href="#evolucao"><span className="nf-action-icon green"><Scale size={18}/></span><span><b>Peso e medidas</b><small>Atualize seu histórico</small></span><ChevronRight size={17}/></a>
              <a className="nf-action-row" href="#metas"><span className="nf-action-icon orange"><Target size={18}/></span><span><b>Definir uma meta</b><small>Escolha seu próximo objetivo</small></span><ChevronRight size={17}/></a>
            </section>
          </div>

          <div className="nf-bottom-grid">
            <section className="nf-panel" id="treino">
              <div className="nf-panel-heading"><div><div className="nf-eyebrow">DESEMPENHO</div><h3>Treinamento</h3></div><Dumbbell size={18}/></div>
              <TrainingTracker />
            </section>
            <section className="nf-panel" id="alimentacao">
              <div className="nf-panel-heading"><div><div className="nf-eyebrow">NUTRIÇÃO</div><h3>Alimentação</h3></div><Leaf size={18}/></div>
              <NutritionTracker />
            </section>
          </div>

          <section className="nf-panel nf-goals-panel" id="metas">
            <div className="nf-panel-heading"><div><div className="nf-eyebrow">OBJETIVOS PESSOAIS</div><h3>Metas e desafios</h3></div><Target size={18}/></div>
            <GoalTracker />
          </section>

          <footer className="nf-disclaimer">O acompanhamento é informativo e não substitui orientação de nutricionista ou médico. <span>© NUTRIFIT 360°</span></footer>
        </section>
      </div>

      <nav className="nf-mobile-nav" aria-label="Navegação da Área Nutrifit">
        <a className="active" href="#inicio"><Home size={19}/><span>Início</span></a>
        <a href="#treino"><Dumbbell size={19}/><span>Treino</span></a>
        <a href="#alimentacao"><Salad size={19}/><span>Nutrição</span></a>
        <a href="#evolucao"><Activity size={19}/><span>Evolução</span></a>
        <a href="#metas"><Target size={19}/><span>Metas</span></a>
      </nav>

      <style jsx>{`
        :global(*){box-sizing:border-box}
        .nf-shell{--bg:#090b09;--panel:#111511;--panel2:#151b15;--line:#252d24;--muted:#8c9689;--text:#f4f5ef;--green:#a4c64a;--orange:#f28a22;min-height:100vh;background:radial-gradient(ellipse at 76% 0%,#1b2516 0,transparent 32%),var(--bg);color:var(--text);font-family:Arial,Helvetica,sans-serif;position:relative;overflow:hidden;padding-bottom:86px}
        .nf-glow{position:absolute;pointer-events:none;filter:blur(80px);opacity:.12;border-radius:50%}.nf-glow-one{width:300px;height:300px;background:#8ebd32;top:260px;right:-170px}.nf-glow-two{width:240px;height:240px;background:#f28a22;top:850px;left:-170px}
        .nf-topbar{height:76px;border-bottom:1px solid #20271f;display:flex;align-items:center;justify-content:space-between;padding:0 max(22px,calc((100vw - 1320px)/2));position:relative;z-index:2;background:#090c09e8;backdrop-filter:blur(18px)}
        .nf-brand{display:flex;align-items:center;gap:11px;color:inherit;text-decoration:none}.nf-brand-mark{width:38px;height:38px;border:1.5px solid var(--green);border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:19px;color:var(--green);position:relative}.nf-brand-mark span{color:var(--orange);margin-left:-7px}.nf-brand b{display:block;font-size:14px;letter-spacing:2.5px}.nf-brand small{display:block;color:#8b9685;font-size:8px;letter-spacing:1.7px;margin-top:3px}
        .nf-top-actions{display:flex;align-items:center;gap:17px}.nf-live{font-size:9px;letter-spacing:1.5px;color:#9ca794}.nf-live i,.nf-hero-foot i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 9px var(--green);margin-right:7px}.nf-icon-button{border:1px solid #293027;background:#111611;color:#c9d0c3;border-radius:11px;width:38px;height:38px;display:grid;place-items:center;position:relative}.nf-icon-button em{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--orange);right:8px;top:7px}.nf-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(145deg,#a6c84b,#506b25);display:grid;place-items:center;color:#10150c;text-decoration:none;font-weight:800}
        .nf-layout{max-width:1320px;margin:auto;display:grid;grid-template-columns:210px minmax(0,1fr);gap:34px;padding:30px 24px 0;position:relative;z-index:1}.nf-sidebar{position:sticky;top:22px;height:calc(100vh - 100px);min-height:580px;padding:14px 0;display:flex;flex-direction:column}.nf-side-label{font-size:9px;letter-spacing:2px;color:#778272;margin:0 0 16px 12px}.nf-side-link{display:flex;align-items:center;gap:12px;padding:13px 12px;color:#aab2a4;text-decoration:none;font-size:13px;border-radius:10px;margin-bottom:4px;transition:.2s}.nf-side-link:hover,.nf-side-link.active{background:#1a2417;color:#c1df72}.nf-side-link.active{box-shadow:inset 2px 0 var(--green)}.nf-side-bottom{margin-top:auto}.nf-side-promo{background:linear-gradient(145deg,#192318,#111711);border:1px solid #2b3827;border-radius:14px;padding:15px;margin:0 0 15px;color:var(--green);display:flex;flex-direction:column;gap:9px}.nf-side-promo b{font-size:12px;color:#e8efdf}.nf-side-promo span{font-size:11px;line-height:1.5;color:#9aa594}
        .nf-content{min-width:0;padding-bottom:30px}.nf-welcome{display:flex;align-items:flex-end;justify-content:space-between;margin:8px 0 24px}.nf-eyebrow{font-size:9px;letter-spacing:2px;color:var(--green);font-weight:700}.nf-eyebrow-line{display:inline-block;width:19px;height:1px;background:var(--orange);vertical-align:middle;margin-right:8px}.nf-welcome h1{font-size:34px;letter-spacing:-1.2px;margin:9px 0 5px}.nf-welcome h1 span{color:var(--green)}.nf-welcome p{font-size:13px;color:#9ba596;margin:0}.nf-date{border:1px solid #2b3429;border-radius:30px;padding:9px 13px;color:#aab4a3;font-size:9px;letter-spacing:1px;display:flex;align-items:center;gap:8px}
        .nf-hero-card{min-height:255px;border:1px solid #3a492e;border-radius:19px;background:radial-gradient(circle at 78% 45%,#2c3b1c 0,transparent 35%),linear-gradient(110deg,#172016,#101610 65%,#151d12);position:relative;overflow:hidden;padding:29px 34px;display:flex;align-items:center;justify-content:space-between}.nf-hero-copy{max-width:440px;position:relative;z-index:1}.nf-kicker{color:#c4d89b;font-size:9px;letter-spacing:1.6px;display:flex;align-items:center;gap:7px}.nf-kicker :global(svg){color:var(--orange)}.nf-hero-copy h2{font-size:34px;line-height:1.08;letter-spacing:-1.1px;margin:15px 0 10px}.nf-hero-copy h2 span{color:var(--green)}.nf-hero-copy p{font-size:12px;color:#aab5a2;line-height:1.65;max-width:360px;margin:0 0 19px}.nf-primary-button{background:var(--orange);color:#1a1209;text-decoration:none;padding:11px 15px;border-radius:8px;display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:800;box-shadow:0 7px 22px #f28a2228}.nf-orbit{width:220px;height:220px;position:absolute;right:10%;top:50%;transform:translateY(-50%);display:grid;place-items:center}.nf-orbit-ring{position:absolute;border:1px solid #9bbd4c55;border-radius:50%;inset:12px;transform:rotate(-25deg)}.ring-b{inset:31px;border-style:dashed;border-color:#f28a2266;transform:rotate(32deg)}.nf-orbit-core{width:112px;height:112px;border:1px solid #9cbd4c88;border-radius:50%;background:#121b10d9;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--green);box-shadow:0 0 45px #8dbb3030}.nf-orbit-core b{font-size:20px;letter-spacing:2px;margin-top:3px}.nf-orbit-core small{font-size:7px;letter-spacing:2px;color:#a5b28f;margin-top:2px}.nf-orbit-dot{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--orange);box-shadow:0 0 14px var(--orange)}.dot-a{top:19px;left:50px}.dot-b{right:9px;top:100px;background:var(--green);box-shadow:0 0 14px var(--green)}.dot-c{bottom:21px;left:60px;width:5px;height:5px}.nf-hero-foot{position:absolute;bottom:0;left:0;right:0;border-top:1px solid #ffffff0d;padding:10px 20px;display:flex;justify-content:space-between;color:#84917c;font-size:8px;letter-spacing:1.4px}
        .nf-section-heading{display:flex;align-items:flex-end;justify-content:space-between;margin:30px 0 14px}.nf-section-heading h2{font-size:20px;margin:6px 0 0;letter-spacing:-.4px}.nf-demo-tag{font-size:8px;letter-spacing:1px;color:#b5a17b;border:1px solid #51432c;background:#211b12;padding:7px 9px;border-radius:5px}
        .nf-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.nf-metric-card{background:linear-gradient(145deg,#151b15,#101410);border:1px solid #283126;border-radius:13px;padding:15px;min-width:0}.nf-metric-top{display:flex;justify-content:space-between;align-items:center;color:#9da995;font-size:8px;letter-spacing:1.3px}.nf-metric-top :global(svg){color:var(--green)}.nf-metric-card strong{display:block;font-size:25px;letter-spacing:-1px;margin:15px 0 5px;color:#f2f4ed}.nf-metric-card strong small{font-size:11px;letter-spacing:0;color:#a0aa98;font-weight:500}.nf-metric-card p{font-size:10px;color:#879283;margin:0 0 14px;min-height:14px}.nf-metric-card a{font-size:10px;color:var(--green);text-decoration:none;display:flex;align-items:center;gap:6px}.accent-card{background:linear-gradient(145deg,#241b11,#17140f);border-color:#4c3821}.accent-card .nf-metric-top :global(svg),.accent-card a{color:var(--orange)}
        .nf-main-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:13px;margin-top:14px}.nf-panel{background:linear-gradient(145deg,#131813,#0f130f);border:1px solid #283027;border-radius:14px;padding:18px;min-width:0}.nf-panel-heading{display:flex;align-items:center;justify-content:space-between}.nf-panel-heading h3{font-size:16px;margin:5px 0 0;letter-spacing:-.3px}.nf-panel-heading> :global(svg){color:var(--green)}.nf-range{display:flex;gap:3px;background:#0a0e0a;border:1px solid #252d24;padding:3px;border-radius:7px}.nf-range button{border:0;background:transparent;color:#8e9a88;font-size:9px;padding:6px 8px;border-radius:5px}.nf-range button.selected{background:#344525;color:#d5e8a5}.nf-empty-chart{min-height:205px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;gap:8px}.nf-chart-placeholder{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#1a2517;color:var(--green);border:1px solid #384a2c}.nf-empty-chart b{font-size:12px}.nf-empty-chart>span{font-size:10px;color:#899485;max-width:270px;line-height:1.5}.nf-outline-button{border:1px solid #52653a;color:#c5df8a;background:#1b2617;text-decoration:none;border-radius:7px;padding:9px 12px;display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:700;margin-top:5px}.nf-chart-legend{border-top:1px solid #252d24;padding-top:11px;display:flex;justify-content:space-between;color:#84907f;font-size:8px;letter-spacing:1.2px}.nf-chart-legend i{display:inline-block;width:7px;height:7px;background:var(--green);border-radius:50%;margin-right:7px}
        .nf-quick-panel{padding-bottom:9px}.nf-action-row{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid #252d24;text-decoration:none;color:inherit}.nf-action-row:last-child{border:0}.nf-action-icon,.nf-feature-icon{width:36px;height:36px;flex:none;border-radius:10px;display:grid;place-items:center}.green{background:#1e2b18;color:var(--green)}.orange{background:#302014;color:var(--orange)}.nf-action-row>span:nth-child(2){display:flex;flex-direction:column;gap:4px;flex:1}.nf-action-row b{font-size:11px}.nf-action-row small{font-size:9px;color:#879283}.nf-action-row> :global(svg:last-child){color:#788474}
        .nf-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-top:13px}.nf-feature-empty{display:flex;align-items:flex-start;gap:12px;padding:22px 0 15px}.nf-feature-empty b{font-size:11px}.nf-feature-empty p{font-size:10px;color:#909b8a;line-height:1.55;margin:6px 0 0}.nf-text-link{font-size:10px;color:var(--green);text-decoration:none;display:inline-flex;align-items:center;gap:6px}.nf-recommend{margin-top:14px;border:1px solid #4b3824;border-radius:14px;background:linear-gradient(100deg,#211a11,#17160f);padding:17px 19px;display:flex;align-items:center;gap:15px}.nf-recommend-icon{width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:12px;background:#3a2816;color:var(--orange)}.nf-recommend>div:nth-child(2){flex:1}.nf-recommend h3{font-size:14px;margin:5px 0}.nf-recommend p{font-size:10px;color:#a99b84;line-height:1.5;margin:0;max-width:600px}.nf-recommend .nf-outline-button{white-space:nowrap;border-color:#72502c;background:#302114;color:#ffc17b}.nf-disclaimer{font-size:9px;color:#778173;margin-top:20px;display:flex;justify-content:space-between;gap:12px}.nf-disclaimer span{letter-spacing:1.2px}
        .nf-mobile-nav{display:none}
        @media(max-width:900px){.nf-layout{grid-template-columns:1fr;max-width:760px;padding:24px 18px 0}.nf-sidebar{display:none}.nf-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.nf-main-grid{grid-template-columns:1fr}.nf-orbit{right:3%;opacity:.65}.nf-hero-copy{max-width:390px}.nf-hero-card{padding-left:25px}.nf-date{font-size:8px}}
        @media(max-width:560px){.nf-shell{padding-bottom:85px}.nf-topbar{height:65px;padding:0 15px}.nf-live{display:none}.nf-top-actions{gap:10px}.nf-layout{padding:20px 14px 0}.nf-welcome{align-items:flex-start;gap:10px;flex-direction:column;margin-bottom:18px}.nf-welcome h1{font-size:29px}.nf-welcome p{font-size:11px}.nf-date{align-self:flex-start}.nf-hero-card{min-height:290px;padding:22px 19px;align-items:flex-start}.nf-hero-copy{max-width:100%}.nf-hero-copy h2{font-size:29px}.nf-hero-copy p{max-width:270px;font-size:11px}.nf-orbit{width:145px;height:145px;right:-27px;top:69%;opacity:.35}.nf-orbit-core{width:80px;height:80px}.nf-orbit-core :global(svg){width:24px}.nf-orbit-core b{font-size:14px}.nf-hero-foot{padding:9px 12px;font-size:6px;letter-spacing:.8px}.nf-section-heading{align-items:flex-start;flex-direction:column;gap:9px;margin-top:25px}.nf-section-heading h2{font-size:18px}.nf-metric-grid{gap:9px}.nf-metric-card{padding:12px}.nf-metric-card strong{font-size:22px;margin:12px 0 5px}.nf-metric-card p{font-size:9px;min-height:25px;line-height:1.4}.nf-main-grid{gap:10px}.nf-panel{padding:14px}.nf-empty-chart{min-height:190px}.nf-bottom-grid{grid-template-columns:1fr;gap:10px}.nf-recommend{align-items:flex-start;flex-wrap:wrap;padding:14px}.nf-recommend>div:nth-child(2){min-width:calc(100% - 60px)}.nf-recommend .nf-outline-button{margin-left:57px}.nf-disclaimer{font-size:8px;line-height:1.5;flex-direction:column}.nf-mobile-nav{position:fixed;z-index:5;left:0;right:0;bottom:0;height:70px;background:#0c100ceF;border-top:1px solid #2a3327;backdrop-filter:blur(18px);display:flex;justify-content:space-around;align-items:center;padding:5px 4px calc(5px + env(safe-area-inset-bottom))}.nf-mobile-nav a{color:#879281;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:8px;min-width:52px}.nf-mobile-nav a.active{color:var(--green)}.nf-mobile-nav a.active :global(svg){filter:drop-shadow(0 0 5px #a4c64a66)}}
        @media(min-width:901px){.nf-shell{padding-bottom:0}.nf-content{padding-bottom:35px}}
      `}</style>
    </main>
  );
}

export default function AreaNutrifitPage() {
  return <AreaAuthGate><DashboardContent /></AreaAuthGate>;
}
