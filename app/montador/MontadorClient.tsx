"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Minus, Plus, RotateCcw, ShoppingBag, Leaf, ChefHat, Info } from "lucide-react";
import "./montador.css";

type Group = "Proteína" | "Carboidrato" | "Legumes";
type Ingredient = {
  id: string;
  name: string;
  group: Group;
  priceIndex: number;
  kcal: number;
  protein: number;
  preparations: string[];
  image: string;
};

const ingredients: Ingredient[] = [
  { id: "chicken", name: "Peito de frango", group: "Proteína", priceIndex: 2.8, kcal: 165, protein: 31, preparations: ["Grelhado", "Desfiado", "Ao molho de ervas"], image: "/images/page-6.jpg" },
  { id: "beef", name: "Patinho moído", group: "Proteína", priceIndex: 4.0, kcal: 212, protein: 26, preparations: ["Refogado", "Acebolado"], image: "/images/page-4.jpg" },
  { id: "pork", name: "Pernil suíno", group: "Proteína", priceIndex: 3.2, kcal: 242, protein: 27, preparations: ["Assado", "Desfiado", "Acebolado"], image: "/images/page-8.jpg" },
  { id: "fish", name: "Tilápia", group: "Proteína", priceIndex: 5.2, kcal: 128, protein: 26, preparations: ["Grelhada", "Ao forno"], image: "/images/tilapia-fit-350-web.jpg" },
  { id: "rice", name: "Arroz integral", group: "Carboidrato", priceIndex: 0.7, kcal: 124, protein: 2.6, preparations: ["Tradicional", "Com cenoura"], image: "/images/page-4.jpg" },
  { id: "sweetpotato", name: "Batata-doce", group: "Carboidrato", priceIndex: 0.8, kcal: 86, protein: 1.3, preparations: ["Cozida", "Assada", "Purê"], image: "/images/page-9.jpg" },
  { id: "potato", name: "Batata inglesa", group: "Carboidrato", priceIndex: 0.75, kcal: 87, protein: 1.9, preparations: ["Cozida", "Assada", "Purê"], image: "/images/page-10.jpg" },
  { id: "pasta", name: "Macarrão integral", group: "Carboidrato", priceIndex: 0.6, kcal: 124, protein: 5, preparations: ["Ao sugo", "Alho e óleo"], image: "/images/page-19.jpg" },
  { id: "broccoli", name: "Brócolis", group: "Legumes", priceIndex: 0.9, kcal: 34, protein: 2.8, preparations: ["No vapor", "Refogado"], image: "/images/page-6.jpg" },
  { id: "carrot", name: "Cenoura", group: "Legumes", priceIndex: 0.5, kcal: 41, protein: 0.9, preparations: ["Cozida", "Refogada"], image: "/images/page-5.jpg" },
  { id: "cauliflower", name: "Couve-flor", group: "Legumes", priceIndex: 0.7, kcal: 25, protein: 1.9, preparations: ["No vapor", "Gratinada"], image: "/images/page-7.jpg" },
  { id: "zucchini", name: "Abobrinha", group: "Legumes", priceIndex: 0.55, kcal: 17, protein: 1.2, preparations: ["Grelhada", "Refogada"], image: "/images/page-10.jpg" },
  { id: "pumpkin", name: "Abóbora", group: "Legumes", priceIndex: 0.55, kcal: 28, protein: 1.1, preparations: ["Cozida", "Purê", "Assada"], image: "/images/page-4.jpg" },
];

const targetWeight = 350;
const basePrice = 23.97;
const step = 10;
const initialAmounts: Record<string, number> = { chicken: 150, rice: 100, broccoli: 100 };
const baselineIndex = ingredients.reduce((sum, item) => sum + (initialAmounts[item.id] || 0) / 100 * item.priceIndex, 0);

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MontadorClient() {
  const [amounts, setAmounts] = useState<Record<string, number>>(initialAmounts);
  const [preparations, setPreparations] = useState<Record<string, string>>({ chicken: "Grelhado", rice: "Tradicional", broccoli: "No vapor" });
  const [openPrep, setOpenPrep] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [activeGroup, setActiveGroup] = useState<Group>("Proteína");

  const totalWeight = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  const remaining = targetWeight - totalWeight;
  const selectedCount = Object.values(amounts).filter(amount => amount > 0).length;

  const totals = useMemo(() => {
    const priceIndex = ingredients.reduce((sum, item) => sum + (amounts[item.id] || 0) / 100 * item.priceIndex, 0);
    const price = totalWeight === 0 ? 0 : Math.max(0, basePrice + priceIndex - baselineIndex);
    const kcal = ingredients.reduce((sum, item) => sum + (amounts[item.id] || 0) * item.kcal / 100, 0);
    const protein = ingredients.reduce((sum, item) => sum + (amounts[item.id] || 0) * item.protein / 100, 0);
    return { price, kcal: Math.round(kcal), protein: Math.round(protein * 10) / 10 };
  }, [amounts]);

  const changeAmount = (id: string, delta: number) => {
    setAmounts(current => {
      const oldAmount = current[id] || 0;
      const nextAmount = Math.max(0, oldAmount + delta);
      const nextTotal = totalWeight + (nextAmount - oldAmount);
      if (nextTotal > targetWeight) {
        setNotice("Sua marmita chegou ao limite de 350 g. Reduza outro ingrediente para adicionar este.");
        return current;
      }
      setNotice("");
      return { ...current, [id]: nextAmount };
    });
  };

  const reset = () => {
    setAmounts({});
    setPreparations({});
    setNotice("");
  };

  const addToOrder = () => {
    const chosen = ingredients.filter(item => (amounts[item.id] || 0) > 0).map(item => `${item.name}: ${amounts[item.id]} g (${preparations[item.id] || "preparo a definir"})`);
    const message = [
      "Olá, Nutrifit! Quero montar uma marmita Fit personalizada:",
      ...chosen,
      `Peso total: ${totalWeight} g / ${targetWeight} g`,
      `Preço demonstrativo: ${money(totals.price)}`,
      "Gostaria de confirmar a disponibilidade e o valor final."
    ].join("\n");
    window.open(`https://wa.me/5532998030038?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const visibleIngredients = ingredients.filter(item => item.group === activeGroup);

  return (
    <main className="builder-page">
      <header className="builder-header">
        <a className="builder-back" href="/"><ArrowLeft size={19} /><span>Voltar ao site</span></a>
        <a className="builder-brand" href="/" aria-label="Nutrifit início"><span className="brand-mark">NF</span><span>NUTRI<span>FIT</span><small>ALIMENTAÇÃO SAUDÁVEL</small></span></a>
        <span className="builder-tag">MONTE DO SEU JEITO</span>
      </header>

      <section className="builder-intro">
        <div>
          <span className="eyebrow"><Leaf size={15}/> PERSONALIZE SUA REFEIÇÃO</span>
          <h1>Monte sua <em>marmita.</em></h1>
          <p>Escolha os ingredientes, ajuste as quantidades e acompanhe o peso e o preço enquanto monta.</p>
        </div>
        <div className="line-chip"><strong>FIT</strong><span>350 g</span></div>
      </section>

      <section className="builder-layout">
        <div className="builder-main">
          <div className="weight-card">
            <div className="weight-head"><div><span className="muted-label">PESO DA MARMITA</span><strong>{totalWeight}<small> / {targetWeight} g</small></strong></div><span className={remaining === 0 ? "weight-status complete" : "weight-status"}>{remaining === 0 ? "Completa" : `Faltam ${remaining} g`}</span></div>
            <div className="weight-track"><span style={{ width: `${Math.min(100, totalWeight / targetWeight * 100)}%` }} /></div>
            <div className="weight-foot"><span>{selectedCount} ingredientes selecionados</span><span>{Math.round(totalWeight / targetWeight * 100)}% preenchido</span></div>
          </div>

          <div className="group-tabs" role="tablist" aria-label="Categorias de ingredientes">
            {(["Proteína", "Carboidrato", "Legumes"] as Group[]).map(group => <button key={group} className={activeGroup === group ? "group-tab active" : "group-tab"} onClick={() => setActiveGroup(group)}>{group}</button>)}
          </div>

          <div className="ingredient-list">
            {visibleIngredients.map(item => {
              const amount = amounts[item.id] || 0;
              return <article className={amount > 0 ? "ingredient-card selected" : "ingredient-card"} key={item.id}>
                <div className="ingredient-photo"><img src={item.image} alt="" /></div>
                <div className="ingredient-info">
                  <div className="ingredient-title-row"><h3>{item.name}</h3>{amount > 0 && <span className="selected-check"><Check size={13}/></span>}</div>
                  <button className="prep-button" onClick={() => setOpenPrep(openPrep === item.id ? null : item.id)}><ChefHat size={14}/>{preparations[item.id] || "Escolher preparo"}<ChevronDown size={14}/></button>
                  {openPrep === item.id && <div className="prep-options">{item.preparations.map(prep => <button key={prep} onClick={() => { setPreparations(current => ({ ...current, [item.id]: prep })); setOpenPrep(null); }}>{prep}</button>)}</div>}
                  <p className="nutrition-hint">Referência por 100 g · {item.kcal} kcal · {item.protein} g proteína*</p>
                </div>
                <div className="quantity-control"><button aria-label={`Diminuir ${item.name}`} disabled={amount === 0} onClick={() => changeAmount(item.id, -step)}><Minus size={17}/></button><strong>{amount}<small>g</small></strong><button aria-label={`Adicionar ${item.name}`} disabled={remaining === 0} onClick={() => changeAmount(item.id, step)}><Plus size={18}/></button></div>
              </article>;
            })}
          </div>
          {notice && <div className="builder-notice"><Info size={17}/>{notice}</div>}
          <p className="builder-footnote">*Valores nutricionais ilustrativos para demonstrar a interface. Serão substituídos pelos dados das fichas técnicas Nutrifit.</p>
        </div>

        <aside className="order-summary">
          <div className="summary-top"><span className="muted-label">RESUMO DO PEDIDO</span><button onClick={reset}><RotateCcw size={14}/> Limpar</button></div>
          <h2>Sua combinação</h2>
          <div className="summary-items">{ingredients.filter(item => (amounts[item.id] || 0) > 0).map(item => <div className="summary-row" key={item.id}><span>{item.name}<small>{preparations[item.id] || "Preparo a definir"}</small></span><strong>{amounts[item.id]} g</strong></div>)}</div>
          <div className="summary-nutrition"><div><span>Calorias estimadas</span><strong>{totals.kcal} kcal</strong></div><div><span>Proteínas estimadas</span><strong>{totals.protein} g</strong></div></div>
          <div className="summary-price"><span>Preço estimado</span><strong>{money(totals.price)}</strong><small>Simulação de preço — não é valor comercial final.</small></div>
          <button className="order-button" disabled={totalWeight !== targetWeight} onClick={addToOrder}><ShoppingBag size={18}/> {totalWeight === targetWeight ? "Continuar pelo WhatsApp" : `Complete mais ${remaining} g`}</button>
          <p className="summary-disclaimer">A composição e o valor serão confirmados pela equipe Nutrifit antes da produção.</p>
        </aside>
      </section>
      <div className="mobile-pricebar"><div><small>Preço estimado</small><strong>{money(totals.price)}</strong><span>{totalWeight}/{targetWeight} g</span></div><button disabled={totalWeight !== targetWeight} onClick={addToOrder}>Continuar <ArrowLeft size={16}/></button></div>
    </main>
  );
}
