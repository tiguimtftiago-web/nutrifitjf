"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Info, ShoppingBag, X, Plus, Minus, Leaf, GlassWater, Salad, Utensils, ArrowUpRight } from "lucide-react";

type Product = {
  id: string;
  name: string;
  line: string;
  weight: string;
  price: number;
  description: string;
  image: string;
  ingredients: string[];
};

const fit: Product[] = [
  { id: "fit-patinho-abobora", name: "Patinho com Abóbora", line: "FIT", weight: "350 g", price: 23.97, description: "Patinho moído acompanhado de abóbora cremosa.", image: "/images/page-4.jpg", ingredients: ["Patinho moído", "Abóbora", "Temperos da preparação"] },
  { id: "fit-patinho-batata", name: "Patinho com Batata-doce", line: "FIT", weight: "350 g", price: 23.97, description: "Patinho moído acompanhado de batata-doce macia.", image: "/images/page-9.jpg", ingredients: ["Patinho moído", "Batata-doce", "Temperos da preparação"] },
  { id: "fit-patinho-legumes", name: "Patinho com Legumes na Manteiga", line: "FIT", weight: "350 g", price: 23.97, description: "Patinho moído acompanhado de legumes preparados na manteiga.", image: "/images/page-10.jpg", ingredients: ["Patinho moído", "Legumes", "Manteiga", "Temperos da preparação"] },
  { id: "fit-frango-legumes", name: "Frango Grelhado com Mix de Legumes", line: "FIT", weight: "350 g", price: 23.97, description: "Peito de frango grelhado acompanhado de mix de legumes.", image: "/images/page-6.jpg", ingredients: ["Peito de frango", "Mix de legumes", "Temperos da preparação"] },
  { id: "fit-carne-acebolada", name: "Carne Acebolada com Legumes", line: "FIT", weight: "350 g", price: 23.97, description: "Carne bovina acebolada acompanhada de legumes.", image: "/images/page-5.jpg", ingredients: ["Carne bovina", "Cebola", "Legumes", "Temperos da preparação"] },
  { id: "fit-frango-ervas", name: "Frango ao Molho de Ervas", line: "FIT", weight: "350 g", price: 23.97, description: "Frango ao molho de ervas acompanhado de legumes selecionados.", image: "/images/page-7.jpg", ingredients: ["Peito de frango", "Ervas", "Legumes", "Ingredientes do molho"] },
  { id: "fit-lombo", name: "Lombo Suíno com Legumes Assados", line: "FIT", weight: "350 g", price: 23.97, description: "Lombo suíno acompanhado de legumes assados.", image: "/images/page-8.jpg", ingredients: ["Lombo suíno", "Legumes assados", "Temperos da preparação"] },
  { id: "fit-tilapia", name: "Tilápia Fit com Arroz e Legumes", line: "FIT", weight: "350 g", price: 27.9, description: "Tilápia grelhada acompanhada de arroz branco, brócolis, couve-flor e cenoura.", image: "/images/tilapia-fit-350-web.jpg", ingredients: ["Tilápia", "Arroz branco", "Brócolis", "Couve-flor", "Cenoura"] },
];

const performance: Product[] = [
  { id: "perf-parmesao", name: "Chicken Parmesão", line: "PERFORMANCE", weight: "450 g", price: 27.9, description: "Frango grelhado, molho de tomate, parmesão, arroz integral e legumes.", image: "/images/page-12.jpg", ingredients: ["Frango", "Molho de tomate", "Queijo parmesão", "Arroz integral", "Legumes"] },
  { id: "perf-tilapia", name: "Tilápia Power", line: "PERFORMANCE", weight: "450 g", price: 32.9, description: "Tilápia grelhada, arroz integral, batata-doce assada e legumes.", image: "/images/page-13.jpg", ingredients: ["Tilápia", "Arroz integral", "Batata-doce", "Legumes"] },
  { id: "perf-beef", name: "Beef & Sweet Potato", line: "PERFORMANCE", weight: "450 g", price: 29.9, description: "Carne bovina grelhada, batata-doce assada e arroz branco.", image: "/images/page-14.jpg", ingredients: ["Carne bovina", "Batata-doce", "Arroz branco"] },
  { id: "perf-chicken-sweet", name: "Chicken Sweet Potato", line: "PERFORMANCE", weight: "450 g", price: 27.9, description: "Frango grelhado, batata-doce assada e arroz branco.", image: "/images/page-15.jpg", ingredients: ["Frango", "Batata-doce", "Arroz branco"] },
  { id: "perf-chicken-potato", name: "Chicken Potato", line: "PERFORMANCE", weight: "450 g", price: 27.9, description: "Frango grelhado, purê de batata, brócolis, cenoura e couve-flor.", image: "/images/page-16.jpg", ingredients: ["Frango", "Batata inglesa", "Brócolis", "Cenoura", "Couve-flor"] },
  { id: "perf-patinho", name: "Patinho Strong", line: "PERFORMANCE", weight: "450 g", price: 29.9, description: "Patinho moído, purê de abóbora e arroz branco.", image: "/images/page-17.jpg", ingredients: ["Patinho moído", "Abóbora", "Arroz branco"] },
  { id: "perf-chicken-rice", name: "Chicken Rice", line: "PERFORMANCE", weight: "450 g", price: 27.9, description: "Frango grelhado, arroz branco e legumes salteados.", image: "/images/page-18.jpg", ingredients: ["Frango", "Arroz branco", "Legumes"] },
  { id: "perf-beef-pasta", name: "Beef Pasta", line: "PERFORMANCE", weight: "450 g", price: 29.9, description: "Patinho em tiras, macarrão integral ao molho de tomate e brócolis.", image: "/images/page-19.jpg", ingredients: ["Patinho", "Macarrão integral", "Molho de tomate", "Brócolis"] },
];

const traditional: Product[] = [
  { id: "trad-patinho", name: "Patinho com Abóbora", line: "TRADITIONAL", weight: "500 g", price: 29.9, description: "Patinho moído refogado, purê de abóbora e arroz branco.", image: "/images/page-28.jpg", ingredients: ["Patinho moído", "Abóbora", "Arroz branco"] },
  { id: "trad-parmegiana", name: "Parmegiana Cremosa", line: "TRADITIONAL", weight: "500 g", price: 26.9, description: "Frango empanado e assado, molho artesanal, queijo gratinado, arroz e purê.", image: "/images/page-29.jpg", ingredients: ["Frango", "Molho de tomate", "Queijo", "Arroz", "Batata"] },
  { id: "trad-feijoada", name: "Feijoada Fit", line: "TRADITIONAL", weight: "500 g", price: 26.9, description: "Feijão, carnes suínas, arroz, couve e farofa.", image: "/images/page-30.jpg", ingredients: ["Feijão", "Calabresa", "Lombo suíno", "Arroz", "Couve", "Farofa"] },
  { id: "trad-frango", name: "Frango Cremoso", line: "TRADITIONAL", weight: "500 g", price: 26.9, description: "Frango em molho cremoso especial, arroz branco e legumes.", image: "/images/page-31.jpg", ingredients: ["Frango", "Ingredientes do molho", "Arroz", "Legumes"] },
  { id: "trad-churrasco", name: "Churrasco Fit Mineiro", line: "TRADITIONAL", weight: "500 g", price: 29.9, description: "Contra-filé grelhado, vinagrete, arroz branco e farofa.", image: "/images/page-32.jpg", ingredients: ["Contra-filé", "Tomate", "Cebola", "Arroz", "Farofa"] },
  { id: "trad-strogonoff", name: "Strogonoff Leve", line: "TRADITIONAL", weight: "500 g", price: 26.9, description: "Strogonoff leve de frango, arroz branco, brócolis e batata palha.", image: "/images/page-33.jpg", ingredients: ["Frango", "Ingredientes do molho", "Arroz", "Brócolis", "Batata palha"] },
  { id: "trad-executivo", name: "Executivo Saudável", line: "TRADITIONAL", weight: "500 g", price: 26.9, description: "Lombo suíno grelhado, macarrão alho e óleo e brócolis.", image: "/images/page-34.jpg", ingredients: ["Lombo suíno", "Macarrão", "Alho", "Óleo", "Brócolis"] },
];

const salads: Product[] = [
  { id: "salad-mango", name: "Mango Fresh", line: "SALADAS", weight: "350 g", price: 21.9, description: "Mix de folhas, manga, tomate-cereja, pepino, castanhas, frango e molho de maracujá.", image: "/images/page-21.jpg", ingredients: ["Folhas", "Manga", "Tomate-cereja", "Pepino", "Castanhas", "Frango", "Molho de maracujá"] },
  { id: "salad-green", name: "Green Power", line: "SALADAS", weight: "350 g", price: 21.9, description: "Mix de folhas, frango grelhado, abacate, brócolis, ervilha, pepino e sementes.", image: "/images/page-22.jpg", ingredients: ["Folhas", "Frango", "Abacate", "Brócolis", "Ervilha", "Pepino", "Sementes"] },
  { id: "salad-tropical", name: "Tropical Chicken", line: "SALADAS", weight: "350 g", price: 21.9, description: "Mix de folhas, frango, abacaxi, milho, cenoura, repolho roxo, pepino e tomate-cereja.", image: "/images/page-23.jpg", ingredients: ["Folhas", "Frango", "Abacaxi", "Milho", "Cenoura", "Repolho roxo", "Pepino", "Tomate-cereja"] },
  { id: "salad-avocado", name: "Avocado Chicken", line: "SALADAS", weight: "350 g", price: 21.9, description: "Mix de folhas, frango, abacate, tomate-cereja, pepino, cenoura e cebola roxa.", image: "/images/page-24.jpg", ingredients: ["Folhas", "Frango", "Abacate", "Tomate-cereja", "Pepino", "Cenoura", "Cebola roxa"] },
  { id: "salad-caesar", name: "Caesar Chicken", line: "SALADAS", weight: "350 g", price: 21.9, description: "Alface americana, frango, tomate-cereja, cenoura, croutons e queijo.", image: "/images/page-25.jpg", ingredients: ["Alface americana", "Frango", "Tomate-cereja", "Cenoura", "Croutons", "Queijo"] },
  { id: "salad-summer", name: "Summer Salad", line: "SALADAS", weight: "350 g", price: 21.9, description: "Mix de alface, tomate-cereja, pepino, repolho roxo, cenoura e frango grelhado.", image: "/images/page-26.jpg", ingredients: ["Alface", "Tomate-cereja", "Pepino", "Repolho roxo", "Cenoura", "Frango"] },
];

const juices: Product[] = [
  { id: "juice-pineapple", name: "Suco de Abacaxi", line: "SUCOS", weight: "500 ml", price: 12.9, description: "Suco de abacaxi da linha tradicional.", image: "/images/abacaxi.jpg", ingredients: ["Abacaxi", "Demais ingredientes conforme receita cadastrada"] },
  { id: "juice-grape", name: "Suco de Uva Verde", line: "SUCOS", weight: "500 ml", price: 12.9, description: "Suco de uva verde da linha tradicional.", image: "/images/uva-verde.jpg", ingredients: ["Uva verde", "Demais ingredientes conforme receita cadastrada"] },
];

const categories = [
  { id: "fit", title: "FIT", subtitle: "350 g", eyebrow: "SUA ROTINA, MAIS PRÁTICA", icon: Leaf, products: fit },
  { id: "performance", title: "PERFORMANCE", subtitle: "450 g", eyebrow: "MAIS OPÇÕES PARA SUA ROTINA", icon: Utensils, products: performance },
  { id: "traditional", title: "TRADITIONAL", subtitle: "500 g", eyebrow: "SABOR DE COMIDA DE VERDADE", icon: Utensils, products: traditional },
  { id: "salads", title: "SALADAS", subtitle: "Frescas e completas", eyebrow: "LEVEZA E SABOR", icon: Salad, products: salads },
  { id: "juices", title: "SUCOS", subtitle: "500 ml", eyebrow: "PARA ACOMPANHAR SUA REFEIÇÃO", icon: GlassWater, products: juices },
];

type CartItem = { product: Product; quantity: number };

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function VitrinePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [detail, setDetail] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { product, quantity: 1 }];
    });
  };
  const changeQuantity = (id: string, amount: number) => setCart((current) => current.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const checkout = () => {
    const message = ["Olá, Nutrifit! Quero fazer este pedido:", ...cart.map((item) => `• ${item.quantity}x ${item.product.name} (${item.product.weight}) — ${money(item.product.price * item.quantity)}`), `Total: ${money(total)}`].join("\n");
    window.open(`https://wa.me/5532998030038?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="showcase">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Nutrifit início"><img src="/images/nutrifit-logo-icon.svg" alt="" /><span>NUTRIFIT</span></a>
        <nav aria-label="Navegação do cardápio"><a href="#fit">Fit</a><a href="#performance">Performance</a><a href="#traditional">Traditional</a><a href="#salads">Saladas</a><a href="#juices">Sucos</a></nav>
        <button className="cart-pill" onClick={() => setCartOpen(true)} aria-label={`Abrir carrinho, ${totalItems} itens`}><ShoppingBag size={18}/><span>Pedido</span><b>{totalItems}</b></button>
      </header>

      <section className="intro" id="inicio">
        <div className="intro-mark">NUTRIFIT <span>•</span> JUIZ DE FORA</div>
        <h1>Uma marmita<br/><em>de cada vez.</em></h1>
        <p>Deslize. Descubra. Escolha suas favoritas.</p>
        <a href="#fit" className="start-link">EXPLORAR CARDÁPIO <ArrowRight size={16}/></a>
      </section>

      {categories.map((category) => <CategoryRail key={category.id} category={category} onDetails={setDetail} onAdd={addToCart} />)}

      <footer className="footer">
        <img src="/images/nutrifit-logo-icon.svg" alt="" />
        <div><strong>NUTRIFIT</strong><p>Comida de verdade para sua rotina.</p><a href="https://www.instagram.com/nutrifit_jf/" target="_blank" rel="noreferrer">@nutrifit_jf</a></div>
        <a className="footer-top" href="#inicio">Voltar ao início ↑</a>
      </footer>

      {detail && <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
        <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <button className="close-button" onClick={() => setDetail(null)} aria-label="Fechar detalhes"><X/></button>
          <img className="detail-image" src={detail.image} alt={detail.name}/>
          <div className="detail-content">
            <div className="product-meta"><span>{detail.line}</span><span>{detail.weight}</span></div>
            <h2 id="detail-title">{detail.name}</h2>
            <p>{detail.description}</p>
            <h3>Composição do prato</h3>
            <ul>{detail.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
            <p className="disclaimer">Ingredientes resumidos para apresentação. A ficha nutricional e a declaração de alergênicos serão exibidas quando validadas para a receita específica.</p>
            <div className="detail-buy"><strong>{money(detail.price)}</strong><button onClick={() => { addToCart(detail); setDetail(null); }}>Adicionar ao pedido <Plus size={16}/></button></div>
          </div>
        </section>
      </div>}

      {cartOpen && <div className="overlay cart-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <section className="cart-sheet" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="cart-heading"><div><span>SEU PEDIDO</span><h2 id="cart-title">Sua seleção</h2></div><button className="close-button inline-close" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho"><X/></button></div>
          {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={34}/><p>Seu pedido ainda está vazio.</p><button onClick={() => setCartOpen(false)}>Continuar explorando</button></div> : <>
            <div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.product.id}><img src={item.product.image} alt=""/><div className="cart-item-copy"><strong>{item.product.name}</strong><span>{item.product.weight} · {money(item.product.price)}</span><div className="qty"><button onClick={() => changeQuantity(item.product.id, -1)} aria-label="Diminuir quantidade"><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.product.id, 1)} aria-label="Aumentar quantidade"><Plus size={14}/></button></div></div><b>{money(item.product.price * item.quantity)}</b></article>)}</div>
            <div className="cart-total"><span>Total parcial</span><strong>{money(total)}</strong></div><p className="cart-note">Entrega e eventuais descontos serão confirmados no atendimento.</p><button className="checkout" onClick={checkout}>Continuar pelo WhatsApp <ArrowUpRight size={17}/></button>
          </>}
        </section>
      </div>}

      <style jsx global>{`
        :root{color-scheme:dark;--nf-bg:#080908;--nf-panel:#111310;--nf-line:rgba(255,255,255,.1);--nf-text:#f7f7f2;--nf-muted:#a7aaa1;--nf-green:#8c9b53;--nf-orange:#f47b20}
        html{scroll-behavior:smooth;background:var(--nf-bg)}
        body{margin:0;background:var(--nf-bg);color:var(--nf-text);font-family:Arial,Helvetica,sans-serif}
        .showcase{min-height:100vh;background:radial-gradient(ellipse at 50% 0%,#191b16 0%,#080908 42%);overflow:hidden}
        .topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px clamp(16px,4vw,56px);background:rgba(8,9,8,.88);backdrop-filter:blur(18px);border-bottom:1px solid var(--nf-line)}
        .brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--nf-text);font-size:14px;font-weight:800;letter-spacing:.18em}.brand img{width:30px;height:30px;object-fit:contain}
        .topbar nav{display:flex;align-items:center;gap:clamp(12px,2.4vw,30px);overflow:auto;scrollbar-width:none}.topbar nav a{color:#d5d6d0;text-decoration:none;font-size:12px;white-space:nowrap}.topbar nav a:hover{color:var(--nf-orange)}
        .cart-pill{display:flex;align-items:center;gap:8px;padding:10px 13px;border:1px solid var(--nf-line);border-radius:999px;background:#191b17;color:white;white-space:nowrap;cursor:pointer}.cart-pill b{display:grid;place-items:center;min-width:21px;height:21px;border-radius:50%;background:var(--nf-orange);color:#17130f;font-size:11px}
        .intro{text-align:center;padding:68px 18px 42px}.intro-mark{font-size:10px;letter-spacing:.3em;color:#b9bf9b}.intro-mark span{color:var(--nf-orange)}.intro h1{font-size:clamp(44px,8vw,92px);line-height:.96;letter-spacing:-.065em;margin:23px 0 15px;font-weight:800}.intro h1 em{font-style:normal;color:var(--nf-green)}.intro p{color:var(--nf-muted);font-size:15px}.start-link{display:inline-flex;align-items:center;gap:10px;margin-top:20px;padding:13px 18px;border:1px solid #59613b;border-radius:999px;color:#e5e8d9;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em}
        .rail{padding:30px 0 58px;border-top:1px solid rgba(255,255,255,.055);scroll-margin-top:74px}.rail-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;padding:0 clamp(18px,5vw,76px);margin-bottom:23px}.rail-kicker{display:flex;align-items:center;gap:8px;color:var(--nf-green);font-size:10px;font-weight:800;letter-spacing:.2em}.rail-heading h2{font-size:clamp(27px,4vw,42px);letter-spacing:-.045em;margin:8px 0 0}.rail-heading p{color:var(--nf-muted);font-size:12px;margin:0 0 4px;white-space:nowrap}
        .rail-track-wrap{position:relative}.rail-track{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;padding:12px max(9vw,calc((100vw - 620px)/2)) 24px;touch-action:pan-x pan-y}.rail-track::-webkit-scrollbar{display:none}.meal-slide{flex:0 0 min(82vw,620px);scroll-snap-align:center;min-width:0}.meal-photo-wrap{position:relative;aspect-ratio:1.13/1;overflow:hidden;border-radius:22px;background:#151712;border:1px solid rgba(255,255,255,.09);box-shadow:0 24px 65px rgba(0,0,0,.36)}.meal-photo{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1);}.meal-slide:hover .meal-photo{transform:scale(1.025)}.photo-vignette{position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.24));pointer-events:none}.slide-controls{position:absolute;top:50%;left:12px;right:12px;display:flex;justify-content:space-between;transform:translateY(-50%);pointer-events:none}.slide-controls button{pointer-events:auto;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(8,9,8,.7);color:white;backdrop-filter:blur(10px);cursor:pointer}.slide-controls button:disabled{opacity:.35}.meal-info{padding:18px 3px 0}.product-meta{display:flex;align-items:center;gap:10px;font-size:10px;font-weight:800;letter-spacing:.15em;color:#c7cbb6}.product-meta span:first-child{color:var(--nf-green)}.product-meta span+span{border-left:1px solid #444;padding-left:10px;color:#c1c2bc;letter-spacing:.05em}.meal-info h3{font-size:clamp(20px,3vw,29px);margin:9px 0 6px;letter-spacing:-.035em}.meal-info>p{color:var(--nf-muted);font-size:13px;line-height:1.5;margin:0;min-height:39px}.meal-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px}.meal-price{font-size:23px;font-weight:800;letter-spacing:-.04em}.meal-buttons{display:flex;gap:8px}.details-button,.add-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:999px;padding:11px 13px;font-size:11px;font-weight:800;cursor:pointer}.details-button{border:1px solid #44483b;background:transparent;color:#e8eadf}.add-button{border:0;background:var(--nf-orange);color:#1a130d}.rail-pagination{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:6px}.rail-pagination button{width:6px;height:6px;border:0;border-radius:20px;padding:0;background:#4a4c46;cursor:pointer}.rail-pagination button.active{width:21px;background:var(--nf-orange)}
        .footer{display:flex;align-items:center;gap:14px;padding:30px clamp(18px,5vw,76px);border-top:1px solid var(--nf-line);background:#0b0c0a}.footer img{width:38px;height:38px;object-fit:contain}.footer strong{letter-spacing:.15em;font-size:12px}.footer p{color:var(--nf-muted);font-size:12px;margin:5px 0}.footer a{color:#c5ce9a;font-size:12px;text-decoration:none}.footer-top{margin-left:auto}
        .overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(9px)}.detail-sheet,.cart-sheet{position:relative;width:min(100%,620px);max-height:min(90dvh,900px);overflow:auto;border:1px solid #30332b;border-radius:24px;background:#11130f;box-shadow:0 30px 100px #000}.close-button{position:absolute;right:14px;top:14px;z-index:2;display:grid;place-items:center;width:40px;height:40px;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:rgba(8,9,8,.76);color:white;cursor:pointer}.detail-image{display:block;width:100%;max-height:300px;aspect-ratio:16/9;object-fit:cover}.detail-content{padding:23px}.detail-content h2{font-size:29px;letter-spacing:-.04em;margin:12px 0 8px}.detail-content>p{color:#b4b7ac;font-size:14px;line-height:1.6}.detail-content h3{margin:24px 0 10px;font-size:14px}.detail-content ul{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}.detail-content li{border:1px solid #373a31;border-radius:999px;padding:8px 11px;color:#e0e2d8;font-size:12px}.detail-content .disclaimer{font-size:11px;color:#898d80}.detail-buy{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--nf-line);padding-top:18px;margin-top:20px}.detail-buy strong{font-size:24px}.detail-buy button,.checkout{display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:999px;padding:14px 18px;background:var(--nf-orange);color:#1b140e;font-weight:800;cursor:pointer}
        .cart-overlay{justify-content:flex-end;align-items:stretch;padding:0}.cart-sheet{width:min(100%,470px);max-height:100dvh;border-radius:24px 0 0 24px;padding:25px 20px;display:flex;flex-direction:column}.cart-heading{display:flex;justify-content:space-between;align-items:center}.cart-heading span{color:var(--nf-green);font-size:10px;font-weight:800;letter-spacing:.2em}.cart-heading h2{margin:7px 0 20px;font-size:28px}.inline-close{position:static;flex-shrink:0}.empty-cart{display:grid;justify-items:center;gap:12px;margin:auto;color:var(--nf-muted)}.empty-cart button{border:1px solid #45483b;border-radius:999px;background:transparent;color:white;padding:12px 15px}.cart-items{overflow:auto;flex:1}.cart-item{display:grid;grid-template-columns:68px 1fr auto;align-items:start;gap:12px;padding:15px 0;border-bottom:1px solid var(--nf-line)}.cart-item>img{width:68px;height:68px;object-fit:cover;border-radius:12px}.cart-item-copy{display:flex;flex-direction:column;gap:5px}.cart-item-copy strong{font-size:13px}.cart-item-copy>span{font-size:11px;color:var(--nf-muted)}.cart-item>b{font-size:12px}.qty{display:flex;align-items:center;gap:12px;margin-top:4px}.qty button{display:grid;place-items:center;width:26px;height:26px;border:1px solid #42463a;border-radius:50%;background:#1b1e17;color:white}.qty span{font-size:12px}.cart-total{display:flex;align-items:center;justify-content:space-between;padding-top:18px}.cart-total span,.cart-note{color:var(--nf-muted);font-size:12px}.cart-total strong{font-size:23px}.cart-note{line-height:1.5}.checkout{width:100%;margin-top:10px}
        @media(min-width:900px){.intro{padding:80px 20px 65px}.rail{padding-bottom:76px}.rail-track{padding-left:max(9vw,calc((100vw - 760px)/2));padding-right:max(9vw,calc((100vw - 760px)/2))}.meal-slide{flex-basis:min(68vw,760px)}.meal-photo-wrap{aspect-ratio:1.55/1}.meal-info{padding-left:12px;padding-right:12px}.detail-sheet{align-self:center;display:grid;grid-template-columns:1fr 1fr;width:min(100%,900px);max-height:84dvh}.detail-image{height:100%;max-height:none;aspect-ratio:auto}.detail-content{overflow:auto}.overlay{align-items:center}}
        @media(max-width:600px){.topbar{gap:10px;padding:12px 13px}.brand{font-size:11px;letter-spacing:.12em;gap:7px}.brand img{width:26px;height:26px}.topbar nav{gap:13px;flex:1;margin-left:5px}.topbar nav a{font-size:10px}.cart-pill{padding:9px 10px;gap:5px}.cart-pill span{display:none}.intro{padding:53px 16px 35px}.intro h1{font-size:53px}.rail{padding:26px 0 42px}.rail-heading{padding:0 19px;margin-bottom:12px}.rail-heading h2{font-size:26px}.rail-heading p{font-size:10px}.rail-track{gap:12px;padding:10px 9vw 19px}.meal-slide{flex-basis:82vw}.meal-photo-wrap{aspect-ratio:.96/1;border-radius:18px}.meal-info{padding:15px 3px 0}.meal-info h3{font-size:21px}.meal-info>p{font-size:12px;min-height:35px}.meal-price{font-size:21px}.details-button,.add-button{padding:10px 11px;font-size:10px}.slide-controls{left:8px;right:8px}.slide-controls button{width:34px;height:34px}.footer{flex-wrap:wrap}.footer-top{width:100%;margin-left:52px}.detail-content{padding:20px}.detail-content h2{font-size:25px}.cart-sheet{border-radius:24px 24px 0 0;align-self:flex-end;max-height:88dvh}.cart-overlay{align-items:flex-end;padding:0}.overlay{padding:12px}.cart-overlay{padding:0}}
        @media(prefers-reduced-motion:reduce){.meal-photo{transition:none}}
      `}</style>
    </main>
  );
}

function CategoryRail({ category, onDetails, onAdd }: { category: (typeof categories)[number]; onDetails: (product: Product) => void; onAdd: (product: Product) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const scrollTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(category.products.length - 1, index));
    const slide = track.children[next] as HTMLElement | undefined;
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.clientWidth) / 2, behavior: "smooth" });
      setActive(next);
    }
  };
  const updateActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const childCenter = element.offsetLeft + element.offsetWidth / 2;
      const nextDistance = Math.abs(center - childCenter);
      if (nextDistance < distance) { nearest = index; distance = nextDistance; }
    });
    setActive(nearest);
  };
  return <section className="rail" id={category.id}>
    <div className="rail-heading">
      <div><div className="rail-kicker"><category.icon size={14}/>{category.eyebrow}</div><h2>{category.title}</h2></div>
      <p>{category.subtitle} <span>·</span> {category.products.length} opções</p>
    </div>
    <div className="rail-track-wrap">
      <div className="rail-track" ref={trackRef} onScroll={updateActive} aria-label={`Carrossel de ${category.title}`}>
        {category.products.map((product, index) => <article className="meal-slide" key={product.id} aria-label={`${product.name}, opção ${index + 1} de ${category.products.length}`}>
          <div className="meal-photo-wrap"><img className="meal-photo" src={product.image} alt={product.name} loading={index < 2 ? "eager" : "lazy"}/><div className="photo-vignette"/><div className="slide-controls"><button onClick={() => scrollTo(index - 1)} disabled={index === 0} aria-label="Marmita anterior"><ChevronLeft size={22}/></button><button onClick={() => scrollTo(index + 1)} disabled={index === category.products.length - 1} aria-label="Próxima marmita"><ChevronRight size={22}/></button></div></div>
          <div className="meal-info"><div className="product-meta"><span>{product.line}</span><span>{product.weight}</span></div><h3>{product.name}</h3><p>{product.description}</p><div className="meal-actions"><strong className="meal-price">{money(product.price)}</strong><div className="meal-buttons"><button className="details-button" onClick={() => onDetails(product)}><Info size={14}/> Detalhes</button><button className="add-button" onClick={() => onAdd(product)}><Plus size={15}/> Adicionar</button></div></div></div>
        </article>)}
      </div>
    </div>
    <div className="rail-pagination" aria-label={`Posição no carrossel ${category.title}`}>{category.products.map((product, index) => <button key={product.id} className={active === index ? "active" : ""} onClick={() => scrollTo(index)} aria-label={`Ir para ${product.name}`}/>)}</div>
  </section>;
}
