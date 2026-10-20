"use client";

import { ArrowRight, CheckCircle2, Clock3, Leaf, MessageCircle, UtensilsCrossed } from "lucide-react";

const whatsapp = "https://wa.me/5532998030038?text=" + encodeURIComponent("Olá, Nutrifit! Vim pelo site e quero conhecer o cardápio.");

const lines = [
  { title: "Linha Fit", subtitle: "Praticidade para o dia a dia.", image: "/images/page-4.jpg", tone: "green" },
  { title: "Linha Performance", subtitle: "Opções para uma rotina ativa.", image: "/images/page-12.jpg", tone: "orange" },
  { title: "Linha Traditional", subtitle: "Sabor e praticidade em cada refeição.", image: "/images/page-28.jpg", tone: "brown" },
];

export default function CampanhaNutrifitPage() {
  return (
    <main className="campaign-page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        .campaign-page { background: #0b0c09; color: #fff; min-height: 100vh; font-family: Arial, Helvetica, sans-serif; }
        .campaign-wrap { width: min(1180px, calc(100% - 36px)); margin: 0 auto; }
        .campaign-nav { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:18px 0; border-bottom:1px solid #292b25; }
        .campaign-brand { font-weight:900; font-size:clamp(23px,3vw,34px); letter-spacing:-1.4px; color:#a7cc32; }
        .campaign-brand span { color:#ff6715; }
        .campaign-tag { font-size:10px; letter-spacing:3px; color:#ddd; display:block; margin-top:2px; }
        .campaign-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:15px 20px; border-radius:999px; font-weight:800; text-decoration:none; transition:transform .15s ease, filter .15s ease; }
        .campaign-btn:hover { transform:translateY(-2px); filter:brightness(1.08); }
        .campaign-btn-green { background:#168d28; color:#fff; border:1px solid #5cce35; }
        .campaign-btn-orange { background:#ff6715; color:#fff; border:1px solid #ff9b37; }
        .campaign-hero { display:grid; grid-template-columns:.9fr 1.1fr; gap:28px; align-items:center; padding:54px 0 46px; }
        .campaign-eyebrow { color:#a7cc32; font-weight:800; letter-spacing:2px; text-transform:uppercase; font-size:12px; }
        .campaign-title { font-size:clamp(42px,6vw,76px); line-height:.97; letter-spacing:-3px; margin:15px 0 18px; font-weight:950; text-transform:uppercase; }
        .campaign-title .green { color:#a7cc32; } .campaign-title .orange { color:#ff6715; }
        .campaign-lead { color:#e3e4dd; font-size:clamp(16px,2vw,19px); line-height:1.65; max-width:500px; }
        .campaign-benefits { display:flex; flex-wrap:wrap; gap:15px; margin:25px 0 28px; color:#e5e6e0; font-size:13px; }
        .campaign-benefits span { display:flex; align-items:center; gap:7px; }
        .campaign-hero-image { position:relative; min-height:390px; border-radius:26px; overflow:hidden; background:#171912; border:1px solid #34382a; }
        .campaign-hero-image img { width:100%; height:100%; min-height:390px; position:absolute; inset:0; object-fit:cover; }
        .campaign-image-overlay { position:absolute; inset:35% 0 0; background:linear-gradient(transparent,rgba(0,0,0,.78)); }
        .campaign-image-caption { position:absolute; bottom:22px; left:24px; right:24px; font-size:clamp(20px,2.7vw,31px); font-weight:800; line-height:1.15; }
        .campaign-lines { background:#f6f4ec; color:#191b15; padding:30px 0 34px; }
        .campaign-section-title { font-size:clamp(27px,4vw,42px); line-height:1.05; font-weight:900; margin:0 0 8px; letter-spacing:-1px; }
        .campaign-section-copy { color:#62665a; line-height:1.6; margin:0 0 22px; }
        .campaign-line-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
        .campaign-line-card { background:#fff; border-radius:18px; overflow:hidden; border:1px solid #e8e5d9; }
        .campaign-line-card img { width:100%; height:190px; display:block; object-fit:cover; }
        .campaign-line-body { padding:18px; }
        .campaign-line-body h3 { font-size:23px; margin:0 0 7px; font-weight:900; }
        .campaign-line-body p { margin:0 0 17px; line-height:1.5; color:#5d6056; }
        .campaign-line-body a { display:inline-flex; gap:8px; align-items:center; color:#176f24; font-weight:800; text-decoration:none; }
        .campaign-reasons { padding:42px 0; }
        .campaign-reasons-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px; margin-top:25px; }
        .campaign-reason { border:1px solid #2d3027; background:#11130f; border-radius:16px; padding:20px; }
        .campaign-reason svg { color:#a7cc32; }
        .campaign-reason h3 { margin:13px 0 7px; font-size:17px; }
        .campaign-reason p { color:#bfc2b6; font-size:14px; line-height:1.55; margin:0; }
        .campaign-cta { background:linear-gradient(115deg,#202714,#11130f 60%,#27170e); border:1px solid #3a4228; border-radius:24px; padding:clamp(24px,5vw,48px); margin:0 auto 45px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
        .campaign-cta h2 { font-size:clamp(27px,4vw,43px); line-height:1.08; margin:0 0 12px; letter-spacing:-1px; }
        .campaign-cta p { color:#d0d2c8; line-height:1.6; margin:0; max-width:620px; }
        .campaign-footer { border-top:1px solid #292b25; padding:24px 0; color:#bfc2b6; font-size:13px; }
        @media(max-width:800px) { .campaign-hero { grid-template-columns:1fr; padding:35px 0; } .campaign-hero-image,.campaign-hero-image img { min-height:300px; } .campaign-line-grid { grid-template-columns:1fr; } .campaign-line-card { display:grid; grid-template-columns:125px 1fr; } .campaign-line-card img { height:100%; min-height:180px; } .campaign-line-body { padding:14px; } .campaign-line-body h3 { font-size:19px; } .campaign-reasons-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .campaign-cta { align-items:flex-start; flex-direction:column; } .campaign-nav { padding:15px 0; } }
        @media(max-width:440px) { .campaign-wrap { width:calc(100% - 26px); } .campaign-title { letter-spacing:-1.7px; } .campaign-benefits { flex-direction:column; } .campaign-reasons-grid { grid-template-columns:1fr; } .campaign-nav .campaign-btn { padding:11px 13px; font-size:12px; } }
      `}</style>

      <header className="campaign-wrap campaign-nav">
        <a href="/" aria-label="Nutrifit - página inicial" style={{ textDecoration: "none" }}>
          <div className="campaign-brand">NUTRI<span>FIT</span></div>
          <span className="campaign-tag">COMIDA DE VERDADE</span>
        </a>
        <a className="campaign-btn campaign-btn-green" href={whatsapp} target="_blank" rel="noreferrer">
          <MessageCircle size={20} /> Fazer pedido
        </a>
      </header>

      <section className="campaign-wrap campaign-hero">
        <div>
          <div className="campaign-eyebrow">Nutrifit · Juiz de Fora</div>
          <h1 className="campaign-title">Sua rotina <span className="green">mais prática</span> <span className="orange">e saborosa.</span></h1>
          <p className="campaign-lead">Refeições variadas e práticas para ajudar você a organizar sua alimentação mesmo nos dias mais corridos.</p>
          <div className="campaign-benefits">
            <span><Leaf size={18} /> Opções variadas</span>
            <span><Clock3 size={18} /> Mais praticidade</span>
            <span><CheckCircle2 size={18} /> Escolha do seu jeito</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a className="campaign-btn campaign-btn-orange" href="#linhas"><UtensilsCrossed size={19} /> Conhecer as linhas <ArrowRight size={18} /></a>
            <a className="campaign-btn campaign-btn-green" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={20} /> Pedir pelo WhatsApp</a>
          </div>
        </div>
        <div className="campaign-hero-image">
          <img src="/images/page-4.jpg" alt="Refeição Nutrifit preparada com proteína e acompanhamentos" />
          <div className="campaign-image-overlay" />
          <div className="campaign-image-caption">Comida de verdade para estilos de vida reais.</div>
        </div>
      </section>

      <section className="campaign-lines" id="linhas">
        <div className="campaign-wrap">
          <h2 className="campaign-section-title">Encontre sua Nutrifit</h2>
          <p className="campaign-section-copy">Conheça nossas linhas e escolha as refeições que combinam com a sua rotina.</p>
          <div className="campaign-line-grid">
            {lines.map((line) => (
              <article className="campaign-line-card" key={line.title}>
                <img src={line.image} alt={line.title + " Nutrifit"} loading="lazy" />
                <div className="campaign-line-body">
                  <h3>{line.title}</h3>
                  <p>{line.subtitle}</p>
                  <a href={whatsapp} target="_blank" rel="noreferrer">Consultar opções <ArrowRight size={17} /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="campaign-wrap campaign-reasons">
        <h2 className="campaign-section-title">Por que escolher a Nutrifit?</h2>
        <p className="campaign-section-copy" style={{ color: "#bfc2b6" }}>Uma forma mais simples de planejar suas refeições e aproveitar melhor o seu tempo.</p>
        <div className="campaign-reasons-grid">
          <div className="campaign-reason"><Leaf size={28} /><h3>Variedade</h3><p>Opções para diferentes preferências e momentos do dia.</p></div>
          <div className="campaign-reason"><UtensilsCrossed size={28} /><h3>Praticidade</h3><p>Facilite a organização das refeições da sua semana.</p></div>
          <div className="campaign-reason"><Clock3 size={28} /><h3>Mais tempo</h3><p>Reduza o trabalho de planejar e preparar cada refeição.</p></div>
          <div className="campaign-reason"><CheckCircle2 size={28} /><h3>Escolha consciente</h3><p>Confira o cardápio, os ingredientes e os preços antes de pedir.</p></div>
        </div>
      </section>

      <section className="campaign-wrap">
        <div className="campaign-cta">
          <div><h2>Vamos facilitar sua próxima refeição?</h2><p>Conheça as opções da Nutrifit e fale com nossa equipe para escolher o que faz sentido para sua rotina.</p></div>
          <a className="campaign-btn campaign-btn-green" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={20} /> Falar com a Nutrifit <ArrowRight size={18} /></a>
        </div>
      </section>

      <footer className="campaign-footer">
        <div className="campaign-wrap" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <span><strong style={{ color: "#a7cc32" }}>NUTRI<span style={{ color: "#ff6715" }}>FIT</span></strong> · Comida de verdade</span>
          <span>Juiz de Fora – MG · <a href="/" style={{ color: "#a7cc32" }}>Visitar a loja</a></span>
        </div>
      </footer>
    </main>
  );
}
