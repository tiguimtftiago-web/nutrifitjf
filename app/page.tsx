"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { ArrowRight, Check, MessageCircle, ShoppingBag, MapPin, Truck, Building2, HelpCircle, Plus, Minus, RotateCcw, Loader2, Search, UserRound, ShoppingCart, ChevronDown, X, Apple, Dumbbell, ClipboardCheck, ChefHat, Stethoscope, Leaf, HeartPulse, FlaskConical } from "lucide-react";

const whatsapp =
  "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const whatsappOrder = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

// Preencha com a chave Pix oficial da Nutrifit quando estiver definida.
const PIX_KEY = "64.776.469/0001-08";

const instagram = "https://www.instagram.com/nutrifit_jf/";
const SUPABASE_URL = "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

const trackClick = (event: string, source: string) => {
  track(event, { source });
};

type Product = {
  name: string;
  line: string;
  weight: string;
  price: string;
  description: string;
  image: string;
  crop?: string;
};

const FIT_SPRITE = "/images/nutrifit-fit-350-sprite.jpg";

const fit: Product[] = [
  ["Patinho com Abóbora","FIT","350 g","R$ 23,97","Patinho moído acompanhado de abóbora cremosa."],
  ["Patinho com Batata-Doce","FIT","350 g","R$ 23,97","Patinho moído acompanhado de batata-doce macia e bem preparada."],
  ["Patinho com Legumes na Manteiga","FIT","350 g","R$ 23,97","Patinho moído acompanhado de legumes preparados na manteiga."],
  ["Frango Grelhado com Mix de Legumes","FIT","350 g","R$ 23,97","Peito de frango grelhado acompanhado de mix de legumes, em uma refeição equilibrada e saborosa."],
  ["Carne Acebolada com Legumes","FIT","350 g","R$ 23,97","Carne bovina acebolada acompanhada de legumes."],
  ["Frango ao Molho de Ervas com Legumes","FIT","350 g","R$ 23,97","Frango ao molho de ervas acompanhado de legumes selecionados."],
  ["Lombo Suíno com Legumes Assados","FIT","350 g","R$ 23,97","Lombo suíno grelhado acompanhado de legumes assados."],
].map(([name,line,weight,price,description], i) => ({
  name,line,weight,price,description,
  image: ["/images/page-4.jpg","/images/page-9.jpg","/images/page-10.jpg","/images/page-6.jpg","/images/page-5.jpg","/images/page-7.jpg","/images/page-8.jpg"][i]
}));

const performance: Product[] = [
  ["Chicken Parmesão","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, molho de tomate artesanal, queijo parmesão, arroz integral e legumes."],
  ["Tilápia Power","PERFORMANCE","450 g","R$ 27,90","Tilápia grelhada, arroz integral, batata-doce assada e legumes."],
  ["Beef & Sweet Potato","PERFORMANCE","450 g","R$ 29,90","Carne bovina grelhada, batata-doce assada e arroz branco."],
  ["Chicken Sweet Potato","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, batata-doce assada e arroz branco."],
  ["Chicken Potato","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, purê de batata inglesa, brócolis, cenoura e couve-flor."],
  ["Patinho Strong","PERFORMANCE","450 g","R$ 29,90","Patinho moído temperado, purê de abóbora e arroz branco."],
  ["Chicken Rice","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, arroz branco e legumes salteados."],
  ["Beef Pasta","PERFORMANCE","450 g","R$ 29,90","Patinho em tiras grelhadas, macarrão integral ao molho de tomate artesanal e brócolis."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[12,13,14,15,16,17,18,19][i]}.jpg`}));

const salads: Product[] = [
  ["Mango Fresh","SALADAS","350 g","R$ 21,90","Mix de folhas, manga, tomate-cereja, pepino, castanhas, amêndoas, 100 g de frango e molho de maracujá."],
  ["Green Power","SALADAS","350 g","R$ 21,90","Mix de folhas, frango grelhado, abacate, brócolis, ervilha, pepino, tomate-cereja e sementes."],
  ["Tropical Chicken","SALADAS","350 g","R$ 21,90","Mix de alface, frango grelhado, abacaxi, milho, cenoura, repolho roxo, pepino e tomate-cereja."],
  ["Avocado Chicken","SALADAS","350 g","R$ 21,90","Mix de folhas, frango grelhado, abacate, tomate-cereja, pepino, cenoura, cebola roxa e molho."],
  ["Caesar Chicken","SALADAS","350 g","R$ 21,90","Mix de alface americana, frango grelhado, tomate-cereja, cenoura, croutons e queijo."],
  ["Summer Salad","SALADAS","350 g","R$ 21,90","Mix de alface, tomate-cereja, pepino, repolho roxo, cenoura, acompanhado de frango grelhado."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[21,22,23,24,25,26][i]}.jpg`}));

const traditional: Product[] = [
  ["Patinho com Abóbora","TRADICIONAL","500 g","R$ 29,90","Patinho moído refogado, purê de abóbora cremoso e arroz branco soltinho."],
  ["Parmegiana Cremosa","TRADICIONAL","500 g","R$ 26,90","Arroz branco, purê de batata, filé de frango empanado e assado, molho artesanal e queijo gratinado."],
  ["Feijoada Fit","TRADICIONAL","500 g","R$ 26,90","Feijão cremoso, calabresa, lombo suíno, arroz branco, couve e farofa crocante."],
  ["Frango Cremoso","TRADICIONAL","500 g","R$ 26,90","Frango em molho cremoso especial, arroz branco soltinho e legumes na manteiga."],
  ["Churrasco Fit Mineiro","TRADICIONAL","500 g","R$ 29,90","Contra-filé grelhado, vinagrete fresco, arroz branco soltinho e farofa caseira."],
  ["Strogonoff Leve","TRADICIONAL","500 g","R$ 26,90","Arroz branco, strogonoff leve de frango, brócolis e batata palha."],
  ["Executivo Saudável","TRADICIONAL","500 g","R$ 26,90","Lombo suíno grelhado, macarrão alho e óleo, molho cremoso leve e brócolis."],
  ["Carne de Panela com Batata e Cenoura","TRADICIONAL","500 g","R$ 29,90","Carne de panela cozida lentamente com batata e cenoura, acompanhada de arroz branco."],
  ["Cupim com Mandioca","TRADICIONAL","500 g","R$ 29,90","Cupim macio ao molho, mandioca e arroz com brócolis."],
  ["Panqueca de Frango ao Molho de Tomate","TRADICIONAL","500 g","R$ 27,00","Panquecas recheadas com frango desfiado, molho de tomate artesanal e ervas."],
  ["Sobrecoxa com Mostarda e Mel","TRADICIONAL","500 g","R$ 29,90","Sobrecoxa dourada com molho de mostarda e mel, acompanhada de arroz primavera."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:[
  "/images/page-28.jpg","/images/page-29.jpg","/images/page-30.jpg","/images/page-31.jpg","/images/page-32.jpg","/images/page-33.jpg","/images/page-34.jpg",
  "/images/WhatsApp%20Image%202026-09-24%20at%2022.03.02%20(1).jpeg?v=4",
  "/images/WhatsApp%20Image%202026-09-24%20at%2022.03.03.jpeg?v=4",
  "/images/WhatsApp%20Image%202026-09-24%20at%2022.03.02%20(2).jpeg?v=4",
  "/images/WhatsApp%20Image%202026-09-24%20at%2022.03.02.jpeg?v=4"
][i]}));

const combos = [
  ["Fit 350 g","5 marmitas","R$ 117,00","R$ 23,40/un"],
  ["Fit 350 g","7 marmitas","R$ 164,00","R$ 23,43/un"],
  ["Fit 350 g","10 marmitas","R$ 235,00","R$ 23,50/un"],
  ["Fit 350 g","14 marmitas","R$ 328,00","R$ 23,43/un"],
  ["Fit 350 g","20 marmitas","R$ 459,00","R$ 22,95/un"],
  ["Performance 450 g","5 marmitas","R$ 139,90","R$ 27,98/un"],
  ["Performance 450 g","7 marmitas","R$ 194,90","R$ 27,84/un"],
  ["Performance 450 g","10 marmitas","R$ 274,90","R$ 27,49/un"],
  ["Performance 450 g","14 marmitas","R$ 384,90","R$ 27,49/un"],
  ["Performance 450 g","20 marmitas","R$ 539,90","R$ 27,00/un"],
  ["Tradicional 500 g","5 marmitas","R$ 139,90","R$ 27,98/un"],
  ["Tradicional 500 g","7 marmitas","R$ 194,90","R$ 27,84/un"],
  ["Tradicional 500 g","10 marmitas","R$ 269,90","R$ 26,99/un"],
  ["Tradicional 500 g","14 marmitas","R$ 379,90","R$ 27,14/un"],
  ["Tradicional 500 g","20 marmitas","R$ 529,90","R$ 26,50/un"],
];


const functionalJuices = [
  ["Energy","/images/page-36.jpg"],
  ["Green","/images/page-37.jpg"],
  ["Pink","/images/page-38.jpg"],
  ["Sun","/images/page-39.jpg"],
  ["Purple","/images/page-40.jpg"],
  ["Glow","/images/page-41.jpg"],
];
const naturalJuices = [
  ["Suco de Laranja","/images/page-42.jpg"],
  ["Laranja com Acerola","/images/page-43.jpg"],
  ["Abacaxi com Hortelã","/images/page-44.jpg"],
];

const juiceProducts: Product[] = [
  ...functionalJuices.flatMap(([name, image]) => [
    { name: `${name} — 500 ml`, line: "SUCOS", weight: "500 ml", price: "R$ 12,90", description: "Suco funcional Nutrifit.", image },
    { name: `${name} — 300 ml`, line: "SUCOS", weight: "300 ml", price: "R$ 9,90", description: "Suco funcional Nutrifit.", image },
  ]),
  ...naturalJuices.flatMap(([name, image]) => [
    { name: `${name} — 500 ml`, line: "SUCOS", weight: "500 ml", price: "R$ 12,90", description: "Suco natural Nutrifit.", image },
    { name: `${name} — 300 ml`, line: "SUCOS", weight: "300 ml", price: "R$ 9,90", description: "Suco natural Nutrifit.", image },
  ]),
];

type ComplementOption = {
  name: string;
  category: "SUCOS" | "SANDUÍCHES" | "FRUTAS";
  description: string;
  price: number | null;
  image?: string;
  emoji: string;
};

const comboComplements: ComplementOption[] = [
  { name: "Suco de Laranja — 500 ml", category: "SUCOS", description: "Natural e refrescante.", price: 12.90, image: "/images/page-42.jpg", emoji: "🥤" },
  { name: "Laranja com Acerola — 500 ml", category: "SUCOS", description: "Natural e refrescante.", price: 12.90, image: "/images/page-43.jpg", emoji: "🥤" },
  { name: "Abacaxi com Hortelã — 500 ml", category: "SUCOS", description: "Natural e refrescante.", price: 12.90, image: "/images/page-44.jpg", emoji: "🥤" },
  { name: "Frango com Alface e Tomate", category: "SANDUÍCHES", description: "Pão integral, frango, alface e tomate.", price: 12.90, emoji: "🥪" },
  { name: "Pernil com Alface e Tomate", category: "SANDUÍCHES", description: "Pão integral, pernil, alface e tomate.", price: 13.90, emoji: "🥪" },
  { name: "Mamão", category: "FRUTAS", description: "Mamão fresco em pedaços.", price: 8.90, emoji: "🍊" },
  { name: "Manga", category: "FRUTAS", description: "Manga fresca em pedaços.", price: 8.90, emoji: "🥭" },
  { name: "Abacaxi", category: "FRUTAS", description: "Abacaxi fresco em pedaços.", price: 8.90, emoji: "🍍" },
  { name: "Melancia", category: "FRUTAS", description: "Melancia fresca em pedaços.", price: 7.90, emoji: "🍉" },
  { name: "Melão", category: "FRUTAS", description: "Melão fresco em pedaços.", price: 8.90, emoji: "🍈" },
  { name: "Morango", category: "FRUTAS", description: "Morangos frescos.", price: 9.90, emoji: "🍓" },
  { name: "Uva Verde", category: "FRUTAS", description: "Uva verde fresca sem sementes.", price: 9.90, emoji: "🍇" },
];


const DELIVERY_FREE_FROM = 20;

type DeliveryResult = {
  zone: string;
  fee: number;
  neighborhood: string;
};

const deliveryZones: Array<{ zone: string; fee: number; neighborhoods: string[] }> = [
  {
    zone: "Zona 1",
    fee: 5,
    neighborhoods: [
      // Base Monte Castelo + eixo norte imediato
      "Monte Castelo","Carlos Chagas","Cerâmica","Francisco Bernardino","Fábrica","Esplanada",
      "São Dimas","Centenário","Mariano Procópio","Jardim Glória","Morro da Glória",
      "Santa Catarina","Santa Helena","Democrata","Vale do Ipê","Jardim Paineiras",
      "Jardim Santa Helena","Poço Rico","Vitorino Braga","Nossa Senhora Aparecida"
    ],
  },
  {
    zone: "Zona 2",
    fee: 7,
    neighborhoods: [
      // Eixos central, leste e norte ainda próximos da base
      "Centro","Boa Vista","Granbery","Bom Pastor","São Mateus","Alto dos Passos",
      "Teixeiras","Bairu","Bonfim","Botanágua","Cesário Alvim","Grajaú","Manoel Honório",
      "Linhares","Marumbi","Progresso","Santa Rita","Santa Cândida","São Benedito",
      "São Bernardo","Santa Terezinha","Eldorado","Jardim Bom Clima",
      "Granjas Betânia","Jardim Emaús","Parque Independência","Grama","Jardim Natal",
      "Nova Era","Benfica","Nova Benfica","Milho Branco","Industrial","Jóquei Clube",
      "Barbosa Lage","Santa Cruz","Represa","Jardim dos Alfineiros","Bandeirantes",
      "Parque Guarani","Nossa Senhora das Graças","Quintas das Avenidas","Santa Paula"
    ],
  },
  {
    zone: "Zona 3",
    fee: 10,
    neighborhoods: [
      // Cidade Alta/Oeste + Sul/Sudeste
      "São Pedro","Aeroporto","Borboleta","Cruzeiro Santo Antônio","Martelos",
      "Morro do Imperador","Nova Califórnia","Novo Horizonte","Serro Azul",
      "Portal da Torre","Caiçaras","Marilândia","Santos Dumont","Alto dos Pinheiros",
      "Adolfo Vireque","Bosque do Imperador","Granville","Viña Del Mar","Vina Del Mar",
      "Nova Germânia","Parque das Águas","Spinaville","Via do Sol","Residencial Alvim",
      "Dom Bosco","Cascatinha","Graminha","Ipiranga","Sagrado Coração de Jesus",
      "Salvaterra","Santa Efigênia","Santa Luzia","Santa Cecília","Bomba de Fogo",
      "Jardim Laranjeiras","Cruzeiro do Sul","Barão do Retiro","Floresta",
      "Nossa Senhora de Lourdes","Santo Antônio","Vila Furtado de Menezes","Vila Ideal",
      "Vila Olavo Costa","Costa Carvalho","Jardim Gaúcho","São Geraldo","Previdenciários",
      "Jardim América","Bela Aurora","Estrela Sul","Jardim Casablanca","Nossa Senhora de Fátima"
    ],
  },
  {
    zone: "Zona 4",
    fee: 13,
    neighborhoods: [
      // Áreas mais afastadas / periferia / localidades com maior deslocamento
      "Barreira do Triunfo","Filgueiras","Granjas Bethel","Vale dos Bandeirantes",
      "Paula Lima","Remonta","Vila Esperança","Jardim Europa","Jardim Olímpia",
      "Cidade do Sol","Cidade Jardim","Fontesville","Fontesville II","Igrejinha",
      "Parque das Palmeiras","Parque das Torres","Parque Guadalajara","Parque Guarua",
      "Parque Imperial","Parque Jardim da Serra","Parque Serra Verde","Jardim da Serra",
      "Chalés do Imperador","Chalés do Algarve","Colinas do Imperador","Mandala",
      "Portal do Aeroporto","Morada do Serro","Bosque Imperial","Conjunto Flamboyants",
      "São Clemente","São Lucas","Santana","Neo Residencial","Spinaville II",
      "Mirante","Cidade Universitária","Três Moinhos",
      "Terras Altas","Retiro","Pedras Preciosas","Jardim Esperança","Jardim do Sol",
      "Santos Anjos","Vila Alpina","São Sebastião","Aracy","Jardim das Flores",
      "Solidariedade","Granjas Primavera","Granjas Santo Antônio","Guaruá","Granjas do Bosque",
      "Vivendas da Serra","Vivendas das Fontes","Vale Verde","Serra D'Água","Serra Dagua",
      "Tupã","Tiguera","Parque Serra Verde","Spina Ville II","Vila Ozanan"
    ],
  },
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const findDelivery = (neighborhood: string): DeliveryResult | null => {
  const normalized = normalizeText(neighborhood);
  const match = deliveryZones.find((item) =>
    item.neighborhoods.some((name) => normalizeText(name) === normalized)
  );
  return match ? { zone: match.zone, fee: match.fee, neighborhood } : null;
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseMoney = (value: string) => Number(value.replace(/[^0-9,]/g, "").replace(/\./g, "").replace(",", "."));

type OrderItem = { name: string; line: string; weight: string; price: number; quantity: number };

const itemLineLabel = (line: string) => {
  const labels: Record<string, string> = { FIT: "Fit 350 g", PERFORMANCE: "Performance 450 g", TRADICIONAL: "Tradicional 500 g" };
  return labels[line] || line;
};


const comboOptions = [
  { line: "FIT", weight: "350 g", products: fit, prices: { 5: "R$ 117,00", 7: "R$ 164,00", 10: "R$ 235,00", 14: "R$ 328,00", 20: "R$ 459,00" } },
  { line: "PERFORMANCE", weight: "450 g", products: performance, prices: { 5: "R$ 139,90", 7: "R$ 194,90", 10: "R$ 274,90", 14: "R$ 384,90", 20: "R$ 539,90" } },
  { line: "TRADICIONAL", weight: "500 g", products: traditional, prices: { 5: "R$ 139,90", 7: "R$ 194,90", 10: "R$ 269,90", 14: "R$ 379,90", 20: "R$ 529,90" } },
] as const;

const monthlyPlanOptions = [
  { line: "FIT", weight: "350 g", products: fit, prices: { 30: "R$ 688,50", 60: "R$ 1.377,00" } },
  { line: "PERFORMANCE", weight: "450 g", products: performance, prices: { 30: "R$ 810,00", 60: "R$ 1.620,00" } },
  { line: "TRADICIONAL", weight: "500 g", products: traditional, prices: { 30: "R$ 795,00", 60: "R$ 1.590,00" } },
] as const;

function MonthlyPlanBuilder({ onAddPlan }: { onAddPlan: (items: OrderItem[]) => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [quantity, setQuantity] = useState<30 | 60>(30);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [flavorsOpen, setFlavorsOpen] = useState(false);
  const option = monthlyPlanOptions[lineIndex];
  const total = Object.values(selected).reduce((sum, value) => sum + value, 0);
  const totalPrice = parseMoney(option.prices[quantity]);
  const unitPrice = totalPrice / quantity;
  const remaining = quantity - total;

  const changeLine = (index: number) => {
    setLineIndex(index);
    setSelected({});
  };

  const changeQuantity = (value: 30 | 60) => {
    setQuantity(value);
    setSelected({});
  };

  const addProduct = (name: string) => {
    if (total >= quantity) return;
    setSelected((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
  };

  const removeProduct = (name: string) => {
    setSelected((current) => {
      const next = { ...current };
      if (!next[name]) return current;
      if (next[name] === 1) delete next[name];
      else next[name] -= 1;
      return next;
    });
  };

  const addToCart = () => {
    if (total !== quantity) return;
    const items: OrderItem[] = option.products
      .filter((product) => selected[product.name])
      .map((product) => ({
        name: product.name + ` — Plano ${quantity}`,
        line: `PLANO ${option.line}`,
        weight: product.weight,
        price: unitPrice,
        quantity: selected[product.name],
      }));
    onAddPlan(items);
    setSelected({});
  };

  return (
    <div className="mt-7 overflow-hidden rounded-[2rem] border border-[#a7b86a]/25 bg-[#0d110c]">
      <div className="relative overflow-hidden border-b border-white/10">
        <img src="/images/nutrifit-fit-350-sprite.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070907] via-[#080a08]/95 to-[#080a08]/55" />
        <div className="relative px-5 py-7 sm:px-7 sm:py-9 md:px-9">
          <div className="text-[10px] font-black uppercase tracking-[.24em] text-[#a7b86a]">Plano mensal</div>
          <h3 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">NUTRI<span className="text-[#ef7d18]">FIT</span></h3>
          <div className="mt-3 text-xl font-black sm:text-2xl">Seu mês de refeições pronto.</div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Escolha a quantidade, a linha e monte seus sabores.</p>
        </div>
      </div>

      <div className="p-4 sm:p-7 md:p-9">
        <div className="sticky top-[72px] z-20 -mx-1 mb-5 rounded-2xl border border-white/10 bg-[#0d110c]/95 p-3 shadow-xl backdrop-blur-xl sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">Seu plano</div><div className="mt-0.5 text-sm font-black">{quantity} marmitas • {itemLineLabel(option.line)}</div></div>
            <div className="text-right"><div className="text-lg font-black text-[#ef7d18]">{money(totalPrice)}</div><div className="text-[10px] text-white/40">{total}/{quantity} escolhidas</div></div>
          </div>
        </div>
        <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Quantidade</div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[30, 60].map((value) => (
            <button key={value} type="button" onClick={() => changeQuantity(value as 30 | 60)} className={`rounded-2xl border px-4 py-4 text-left transition ${quantity === value ? "border-[#a7b86a] bg-[#a7b86a]/15" : "border-white/10 bg-white/[.025]"}`}>
              <span className={`block text-base font-black sm:text-lg ${quantity === value ? "text-[#cbd99a]" : "text-white/75"}`}>{value} marmitas</span>
              <span className="mt-1 block text-xs text-white/45">{value === 30 ? "1 refeição/dia" : "almoço + jantar"}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Linha</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {monthlyPlanOptions.map((item, index) => (
            <button key={item.line} type="button" onClick={() => changeLine(index)} className={`min-w-0 rounded-2xl border px-2 py-3.5 text-center transition ${lineIndex === index ? "border-[#a7b86a] bg-[#a7b86a]/15 text-[#cbd99a]" : "border-white/10 bg-white/[.025] text-white/65"}`}>
              <span className="block whitespace-nowrap text-[10px] font-black sm:text-xs">{item.line}</span>
              <span className="mt-1 block text-[10px] text-white/40">{item.weight}</span>
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setFlavorsOpen((open) => !open)} aria-expanded={flavorsOpen} className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-[#a7b86a]/35 bg-[#11160e] p-4 text-left transition hover:border-[#a7b86a]/60">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ef7d18]/15 text-xl">🍱</span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-black">Escolher meus sabores</span>
            <span className="mt-1 block text-xs text-white/45">{flavorsOpen ? "Escolha quantas unidades quiser de cada sabor." : `Selecione as ${quantity} marmitas do seu plano.`}</span>
          </span>
          <span className="text-2xl text-[#ef7d18]">›</span>
        </button>

        {flavorsOpen && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {option.products.map((product) => (
              <div key={product.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-2.5 sm:block sm:p-3">
                <img src={product.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover sm:mb-2 sm:h-24 sm:w-full" loading="lazy" />
                <div className="min-w-0 flex-1 sm:min-h-[3.5rem] text-sm font-black leading-tight">{product.name}</div>
                <div className="mt-2 text-xs text-white/40">{money(unitPrice)} cada</div>
                <div className="mt-2 flex items-center justify-between gap-2 sm:mt-3">
                  <button type="button" onClick={() => removeProduct(product.name)} className="rounded-full border border-white/15 p-2 text-white/70 disabled:opacity-30" disabled={!selected[product.name]} aria-label={`Remover ${product.name}`}><Minus size={14} /></button>
                  <span className="min-w-5 text-center font-black">{selected[product.name] || 0}</span>
                  <button type="button" onClick={() => addProduct(product.name)} className="rounded-full bg-[#a7b86a] p-2 text-black disabled:opacity-30" disabled={total >= quantity} aria-label={`Adicionar ${product.name}`}><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="text-xl font-black">{quantity} marmitas</div>
            <div className="mt-1 text-4xl font-black tracking-tight text-[#ef7d18]">{money(totalPrice)}</div>
            <div className="mt-1 text-sm text-white/50">{money(unitPrice)} por marmita</div>
            <div className="mt-1 text-sm font-bold text-[#a7b86a]">✓ Frete grátis</div>
          </div>
          <div className="space-y-2 text-sm text-white/60 sm:min-w-[180px]">
            <div>✓ Mais praticidade</div>
            <div>✓ Alimentação equilibrada</div>
            <div>✓ Economia no mês</div>
            <div>✓ Sabores variados</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-white/45">
            <span>{total}/{quantity} selecionadas</span>
            {remaining > 0 && <span>Faltam {remaining}</span>}
            {remaining === 0 && <span className="text-[#a7b86a]">Plano completo ✓</span>}
          </div>
          <button type="button" onClick={addToCart} disabled={total !== quantity} className="sticky bottom-3 z-20 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#b5cf5f] px-5 py-4 text-base font-black text-black shadow-2xl transition hover:scale-[1.01] disabled:opacity-35 sm:static sm:shadow-none">
            Adicionar plano ao pedido <ShoppingBag size={18} />
          </button>
          <div className="mt-2 text-center text-[11px] text-white/35">O plano entra no mesmo carrinho das marmitas, saladas e sucos.</div>
        </div>
      </div>
    </div>
  );
}

function ComboBuilder({ initialLine = 0 }: { initialLine?: number }) {
  const [lineIndex, setLineIndex] = useState(initialLine);
  const [quantity, setQuantity] = useState<5 | 7 | 10 | 14 | 20>(5);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const [cep, setCep] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "error">("idle");
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedComplements, setSelectedComplements] = useState<Record<string, number>>({});
  const option = comboOptions[lineIndex];
  const total = Object.values(selected).reduce((sum, value) => sum + value, 0);
  const price = option.prices[quantity];
  const subtotal = Number(price.replace("R$ ", "").replace(".", "").replace(",", "."));
  const deliveryFee = quantity >= DELIVERY_FREE_FROM ? 0 : delivery?.fee ?? 0;
  const complementItems = comboComplements.filter((item) => selectedComplements[item.name]);
  const complementTotal = complementItems.reduce((sum, item) => sum + (item.price ?? 0) * (selectedComplements[item.name] || 0), 0);
  const grandTotal = subtotal + deliveryFee + complementTotal;

  const addComplement = (name: string) => {
    setSelectedComplements((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
  };

  const removeComplement = (name: string) => {
    setSelectedComplements((current) => {
      const next = { ...current };
      if (!next[name]) return current;
      if (next[name] === 1) delete next[name];
      else next[name] -= 1;
      return next;
    });
  };

  const changeLine = (index: number) => {
    setLineIndex(index);
    setSelected({});
    setQuantity(5);
    setDeliveryMode("delivery");
    setDelivery(null);
    setDeliveryStatus("idle");
    setSelectedComplements({});
  };

  const changeQuantity = (value: 5 | 7 | 10 | 14 | 20) => {
    setQuantity(value);
    setSelected({});
    setDelivery(null);
    setDeliveryStatus("idle");
    setSelectedComplements({});
  };

  const addProduct = (name: string) => {
    if (total >= quantity) return;
    setSelected((current) => ({ ...current, [name]: (current[name] || 0) + 1 }));
  };

  const removeProduct = (name: string) => {
    setSelected((current) => {
      const next = { ...current };
      if (!next[name]) return current;
      if (next[name] === 1) delete next[name];
      else next[name] -= 1;
      return next;
    });
  };

  const reset = () => {
    setStep(1);
    setSelected({});
    setCep("");
    setDeliveryMode("delivery");
    setDelivery(null);
    setDeliveryStatus("idle");
    setCustomerName("");
    setCustomerPhone("");
    setPaymentStatus("idle");
    setSelectedComplements({});
  };

  const chooseDeliveryMode = (mode: "delivery" | "pickup") => {
    setDeliveryMode(mode);
    setDeliveryStatus("idle");
    if (mode === "pickup") {
      setDelivery({ zone: "Retirada no local", fee: 0, neighborhood: "" });
    } else {
      setDelivery(null);
    }
  };

  const calculateDelivery = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setDelivery(null);
      setDeliveryStatus("error");
      return;
    }

    if (quantity >= DELIVERY_FREE_FROM) {
      setDelivery({ zone: "Frete grátis", fee: 0, neighborhood: "" });
      setDeliveryStatus("idle");
      return;
    }

    setDeliveryStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro || !data.bairro) {
        setDelivery(null);
        setDeliveryStatus("error");
        return;
      }

      const result = findDelivery(data.bairro);
      if (!result) {
        setDelivery(null);
        setDeliveryStatus("error");
        return;
      }

      setDelivery(result);
      setDeliveryStatus("idle");
    } catch {
      setDelivery(null);
      setDeliveryStatus("error");
    }
  };

  const sendOrder = () => {
    if (total !== quantity || !deliveryReady || !customerReady) return;
    trackClick("combo_order_click", `${option.line}-${quantity}`);

    setPaymentStatus("loading");

    const items = option.products
      .filter((product) => selected[product.name])
      .map((product) => `${selected[product.name]}x ${product.name} — ${money((subtotal / quantity) * selected[product.name])}`)
      .join("\n");

    const deliveryText =
      deliveryMode === "pickup"
        ? "Retirada na Nutrifit — Rua Enéas Mascarenhas, 94/103, Monte Castelo, Juiz de Fora/MG"
        : quantity >= DELIVERY_FREE_FROM
          ? "Entrega grátis — combo com 20 marmitas ou mais"
          : delivery?.fee === 0
            ? `Entrega grátis — CEP ${cep}`
            : `Entrega ${money(delivery?.fee ?? 0)} — CEP ${cep}`;

    const message = [
      "🥗 PEDIDO NUTRIFIT",
      "",
      `Cliente: ${customerName.trim()}`,
      `WhatsApp: ${customerPhone.trim()}`,
      "",
      "📦 ITENS DO PEDIDO",
      "",
      items,
      "",
      ...(complementItems.length ? ["➕ COMPLEMENTOS", ...complementItems.map((item) => `${selectedComplements[item.name]}x ${item.name}${item.price === null ? " — preço a confirmar" : ` — ${money((item.price ?? 0) * (selectedComplements[item.name] || 0))}`}`), ""] : []),
      `Quantidade: ${quantity} marmitas`,
      `Subtotal: ${money(subtotal)}`,
      `Frete: ${money(deliveryFee)}`,
      `${hasPendingComplementPrice ? "TOTAL PARCIAL DO PEDIDO" : "TOTAL A PAGAR"}: ${money(grandTotal)}`,
      "",
      "📍 RECEBIMENTO",
      deliveryText,
      "",
      "💳 PAGAMENTO VIA PIX",
      `Chave Pix: ${PIX_KEY}`,
      "Após realizar o Pix, envie o comprovante por aqui para confirmarmos o pedido.",
    ].join("\n");

    window.open(whatsappOrder(message), "_blank", "noopener,noreferrer");
    setPaymentStatus("idle");
  };
  const deliveryReady = deliveryMode === "pickup" || quantity >= DELIVERY_FREE_FROM || Boolean(delivery);
  const normalizedPhone = customerPhone.replace(/\D/g, "");
  const customerReady = Boolean(customerName.trim() && normalizedPhone.length >= 10);
  const hasPendingComplementPrice = complementItems.some((item) => item.price === null);
  const canPay = total === quantity && deliveryReady && customerReady && paymentStatus !== "loading";
  const comboRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      comboRootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [step]);

  return (
    <div ref={comboRootRef} className="mt-8 rounded-[2rem] border border-[#a7b86a]/30 bg-[#0b0e09] p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Montador Nutrifit</div>
          <h3 className="mt-1.5 text-2xl font-black md:text-4xl">Monte seu combo</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/50">Você só precisa seguir os 5 passos. No celular, avance quando terminar cada etapa.</p>
        </div>
        <button type="button" onClick={reset} className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2.5 text-white/55" aria-label="Limpar combo"><RotateCcw size={16} /></button>
      </div>

      <div className="sticky top-[72px] z-30 mt-5 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-3.5 shadow-xl backdrop-blur-xl sm:static sm:bg-white/[.025] sm:shadow-none">
        <div className="grid grid-cols-5 gap-1.5">
          {[["1","Escolha"],["2","Sabores"],["3","Complete"],["4","Entrega"],["5","Finalizar"]].map(([number,label]) => {
            const n = Number(number) as 1 | 2 | 3 | 4 | 5;
            const done = step > n;
            const active = step === n;
            return (
              <button key={number} type="button" onClick={() => n <= step && setStep(n)} className="min-w-0 text-center" disabled={n > step}>
                <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-xs font-black ${done || active ? "bg-[#a7b86a] text-black" : "bg-white/10 text-white/35"}`}>
                  {done ? <Check size={14} strokeWidth={3} /> : number}
                </div>
                <div className={`mt-1 truncate text-[9px] font-black uppercase tracking-wider sm:text-[10px] ${active ? "text-white" : done ? "text-[#cbd99a]" : "text-white/35"}`}>{label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#a7b86a]">Seu combo</div>
            <div className="mt-1 text-lg font-black">{total}/{quantity} marmitas</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/45">{total === quantity ? "Combo completo ✓" : `Faltam ${quantity - total}`}</div>
            <div className="mt-1 text-lg font-black text-[#ef7d18]">{money(grandTotal)}</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#a7b86a] transition-all" style={{ width: `${Math.min((total / quantity) * 100, 100)}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="mt-6">
          <div className="mb-4">
            <div className="text-xl font-black">1. Escolha sua linha e o tamanho</div>
            <div className="mt-1 text-sm text-white/45">Depois você escolhe os sabores sem precisar voltar.</div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {comboOptions.map((item, index) => (
              <button key={item.line} type="button" onClick={() => changeLine(index)} className={`touch-manipulation relative z-10 rounded-2xl border p-4 text-left transition ${lineIndex === index ? "border-[#a7b86a] bg-[#a7b86a]/10" : "border-white/10 bg-white/[.025]"}`}>
                <div className="text-[11px] font-black tracking-wider text-[#a7b86a]">{item.line}</div>
                <div className="mt-1 text-xs font-bold text-white/55">{item.weight}</div>
                <div className="mt-2 text-xs font-black text-[#ef7d18]">{item.prices[5]} <span className="font-normal text-white/35">• 5 un.</span></div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-sm font-black text-white/75">Quantas marmitas?</div>
            <div className="mt-2.5 grid grid-cols-5 gap-1.5 sm:gap-2">
              {([5, 7, 10, 14, 20] as const).map((value) => (
                <button key={value} type="button" onClick={() => changeQuantity(value)} className={`touch-manipulation relative z-10 min-w-0 rounded-2xl border px-1.5 py-3.5 text-center text-sm font-black transition ${quantity === value ? "border-[#a7b86a] bg-[#a7b86a] text-black" : "border-white/10 bg-white/5 text-white/70"}`}>
                  <span className="block text-base sm:text-sm">{value}</span>
                  <span className={`mt-0.5 block truncate text-[8px] font-normal ${quantity === value ? "text-black/60" : "text-white/35"}`}>marmitas</span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setStep(2)} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-4 font-black text-black shadow-[0_10px_30px_rgba(167,184,106,.16)] active:scale-[.99]">
            Escolher sabores <ArrowRight size={18} />
          </button>
          <div className="mt-2 text-center text-[10px] font-bold text-white/30">Você poderá alterar a linha e a quantidade antes de confirmar.</div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <div className="mb-4">
            <div className="text-xl font-black">2. Monte seus sabores</div>
            <div className="mt-1 text-sm text-white/45">Use + e − para escolher quantas unidades quer de cada prato.</div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {option.products.map((product) => (
              <div key={product.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-2.5 sm:p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" loading="lazy" />
                  <div className="min-w-0">
                    <div className="break-words font-black text-sm leading-tight">{product.name}</div>
                    <div className="mt-1 text-xs text-white/40">{product.weight} • {product.price}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <button type="button" onClick={() => removeProduct(product.name)} disabled={!selected[product.name]} aria-label={`Remover ${product.name}`} className="touch-manipulation grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 disabled:opacity-25"><Minus size={15} /></button>
                  <span className="w-5 text-center font-black">{selected[product.name] || 0}</span>
                  <button type="button" onClick={() => addProduct(product.name)} disabled={total >= quantity} aria-label={`Adicionar ${product.name}`} className="touch-manipulation grid h-11 w-11 place-items-center rounded-full bg-[#a7b86a] text-black disabled:opacity-25"><Plus size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-center">
            {total === quantity ? (
              <div className="font-black text-[#cbd99a]">✓ Combo completo. Agora complete seu pedido.</div>
            ) : (
              <div className="text-sm text-white/60">Faltam <strong className="text-white">{quantity - total}</strong> marmita(s) para completar seu combo.</div>
            )}
          </div>

          <div className="sticky bottom-2 z-20 mt-5 flex gap-2 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-2 shadow-2xl backdrop-blur-xl">
            <button type="button" onClick={() => setStep(1)} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-bold text-white/70">Voltar</button>
            <button type="button" onClick={() => total === quantity && setStep(3)} disabled={total !== quantity} className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black disabled:opacity-30">
              Continuar <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <div className="mb-4">
            <div className="text-xl font-black">3. Complete seu pedido</div>
            <div className="mt-1 text-sm text-white/45">Seu combo já está pronto. Se quiser, adicione suco, sanduíche natural ou frutas picadas.</div>
          </div>

          <div className="grid gap-3">
            {(["SUCOS","SANDUÍCHES","FRUTAS"] as const).map((category) => {
              const items = comboComplements.filter((item) => item.category === category);
              const labels = { SUCOS: "🥤 Sucos naturais", SANDUÍCHES: "🥪 Sanduíches naturais", FRUTAS: "🍓 Frutas picadas" };
              return (
                <div key={category} className="rounded-3xl border border-white/10 bg-white/[.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-black">{labels[category]}</div>
                      <div className="mt-1 text-xs text-white/40">{category === "FRUTAS" ? "Frescas, práticas e ideais para o seu dia." : category === "SANDUÍCHES" ? "Leves, simples e nutritivos." : "Naturais, funcionais e refrescantes."}</div>
                    </div>
                    <span className="rounded-full bg-[#a7b86a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#cbd99a]">Opcional</span>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {items.map((item) => {
                      const qty = selectedComplements[item.name] || 0;
                      return (
                        <div key={item.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d100c] p-3">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                          ) : (
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#171d10] text-2xl">{item.emoji}</div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="break-words text-sm font-black leading-tight">{item.name}</div>
                            <div className="mt-1 text-[11px] leading-4 text-white/40">{item.description}</div>
                            <div className="mt-1 text-xs font-black text-[#ef7d18]">{item.price === null ? "Preço a confirmar" : money(item.price)}</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {qty > 0 && <button type="button" onClick={() => removeComplement(item.name)} aria-label={`Remover ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5"><Minus size={14} /></button>}
                            {qty > 0 && <span className="w-4 text-center text-sm font-black">{qty}</span>}
                            <button type="button" onClick={() => addComplement(item.name)} aria-label={`Adicionar ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#a7b86a] text-black"><Plus size={15} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {complementItems.length > 0 && (
            <div className="mt-4 rounded-2xl border border-[#a7b86a]/25 bg-[#171d10] p-4">
              <div className="font-black">Seu pedido está ficando completo ✓</div>
              <div className="mt-1 text-xs leading-5 text-white/50">
                {complementItems.map((item) => `${selectedComplements[item.name]}x ${item.name}`).join(" • ")}
              </div>
            </div>
          )}

          <div className="sticky bottom-2 z-20 mt-5 flex gap-2 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-2 shadow-2xl backdrop-blur-xl">
            <button type="button" onClick={() => setStep(2)} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-bold text-white/70">Voltar</button>
            <button type="button" onClick={() => setStep(4)} className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black">
              Continuar <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6">
          <div className="mb-4">
            <div className="text-xl font-black">4. Como você quer receber?</div>
            <div className="mt-1 text-sm text-white/45">Escolha entrega ou retirada. Para 20 marmitas, a entrega é grátis.</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => chooseDeliveryMode("delivery")} className={`touch-manipulation rounded-3xl border-2 p-5 text-left transition ${deliveryMode === "delivery" ? "border-[#a7b86a] bg-[#a7b86a]/10" : "border-white/10 bg-white/[.025]"}`}>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#a7b86a]/15 text-[#cbd99a]"><Truck size={23} /></div>
              <div className="mt-3 text-lg font-black">Receber em casa</div>
              <div className="mt-1 text-sm text-white/50">Digite seu CEP para calcular a entrega.</div>
            </button>
            <button type="button" onClick={() => chooseDeliveryMode("pickup")} className={`touch-manipulation rounded-3xl border-2 p-5 text-left transition ${deliveryMode === "pickup" ? "border-[#ef7d18] bg-[#ef7d18]/10" : "border-white/10 bg-white/[.025]"}`}>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ef7d18]/15 text-[#ef9b55]"><MapPin size={23} /></div>
              <div className="mt-3 text-lg font-black">Retirar na Nutrifit</div>
              <div className="mt-1 text-sm text-white/50">Sem taxa de entrega.</div>
            </button>
          </div>

          {deliveryMode === "pickup" ? (
            <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4">
              <div className="font-black">📍 Retirada na Nutrifit</div>
              <div className="mt-1 text-sm leading-6 text-white/55">Rua Enéas Mascarenhas, 94/103 • Monte Castelo • Juiz de Fora/MG</div>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <input value={cep} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 8); setCep(value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value); setDelivery(null); setDeliveryStatus("idle"); }} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-label="CEP para calcular a entrega" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold outline-none focus:border-[#a7b86a]" />
                <button type="button" onClick={() => void calculateDelivery()} disabled={deliveryStatus === "loading"} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3.5 text-sm font-black text-black disabled:opacity-60">
                  {deliveryStatus === "loading" ? <><Loader2 size={16} className="animate-spin" /> Calculando...</> : "Calcular entrega"}
                </button>
              </div>
              {quantity >= DELIVERY_FREE_FROM ? (
                <div className="mt-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4 text-sm">
                  <div className="font-black text-[#cbd99a]">🚚 Frete grátis</div>
                  <div className="mt-1 text-white/55">Seu combo tem 20 marmitas ou mais.</div>
                </div>
              ) : delivery ? (
                <div className="mt-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4">
                  <div className="font-black text-[#cbd99a]">📍 {delivery.neighborhood}</div>
                  <div className="mt-1 text-sm text-white/55">{delivery.zone} • Entrega <span className="font-black text-[#ef7d18]">{money(delivery.fee)}</span></div>
                </div>
              ) : deliveryStatus === "error" ? (
                <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">Não conseguimos identificar a área de entrega. Confira o CEP ou fale com a Nutrifit.</div>
              ) : null}
            </>
          )}

          <div className="sticky bottom-2 z-20 mt-5 flex gap-2 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-2 shadow-2xl backdrop-blur-xl">
            <button type="button" onClick={() => setStep(3)} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-bold text-white/70">Voltar</button>
            <button type="button" onClick={() => deliveryReady && setStep(5)} disabled={!deliveryReady} className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black disabled:opacity-30">
              Continuar <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="mt-6">
          <div className="mb-4">
            <div className="text-xl font-black">5. Confira e finalize</div>
            <div className="mt-1 text-sm text-white/45">Só falta seu nome e WhatsApp. Depois o pedido abre no WhatsApp para você concluir o pagamento.</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
            <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
              <span className="text-white/45">Linha</span><strong>{option.line} • {option.weight}</strong>
              <span className="text-white/45">Marmitas</span><strong>{quantity}</strong>
              <span className="text-white/45">Subtotal</span><strong>{money(subtotal)}</strong>
              {complementItems.length > 0 && (
                <>
                  <span className="text-white/45">Complementos</span>
                  <strong className="text-right">{complementTotal > 0 ? money(complementTotal) : "Preço a confirmar"}</strong>
                </>
              )}
              <span className="text-white/45">Entrega</span><strong>{deliveryFee === 0 ? "Grátis" : money(deliveryFee)}</strong>
              <span className="border-t border-white/10 pt-2 font-black">{complementItems.some((item) => item.price === null) ? "Total parcial" : "Total"}</span><strong className="border-t border-white/10 pt-2 text-[#ef7d18]">{money(grandTotal)}</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" placeholder="Seu nome completo" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9+()\- ]/g, ""))} inputMode="tel" autoComplete="tel" placeholder="Seu WhatsApp / telefone" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
          </div>

          <div className="mt-4 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-4 text-sm text-white/55">
            <div className="font-black text-white">Pagamento pelo WhatsApp</div>
            <div className="mt-1">Ao tocar no botão, o pedido será preparado com seus sabores, valor e entrega. Você envia o comprovante do Pix pelo WhatsApp.</div>
            {hasPendingComplementPrice && (
              <div className="mt-3 rounded-xl bg-[#ef7d18]/10 px-3 py-2 text-xs font-bold text-[#efb06d]">
                Sanduíches e frutas estão selecionados para o pedido, mas o preço será confirmado pelo WhatsApp.
              </div>
            )}
          </div>

          <div className="sticky bottom-2 z-20 mt-5 flex gap-2 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-2 shadow-2xl backdrop-blur-xl">
            <button type="button" onClick={() => setStep(4)} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-bold text-white/70">Voltar</button>
            <button type="button" onClick={sendOrder} disabled={!canPay} className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3.5 font-black text-black disabled:cursor-not-allowed disabled:opacity-30">
              {paymentStatus === "loading" ? <><Loader2 size={17} className="animate-spin" /> Enviando...</> : <><ShoppingBag size={17} /> Finalizar no WhatsApp</>}
            </button>
          </div>
          {!customerReady && <div className="mt-3 text-center text-xs text-[#ef9b55]">Informe seu nome e um WhatsApp válido para liberar o botão.</div>}
        </div>
      )}

      <div className="mt-5 text-center text-[11px] text-white/30">
        Pagamento antecipado via Pix. O pedido é confirmado após a confirmação do pagamento.
      </div>
    </div>
  );
}

// Mobile line sections show two cards first, with a full-width view-all action below.
function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <article className="group flex min-w-0 h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d100c] shadow-[0_12px_35px_rgba(0,0,0,.18)] transition hover:-translate-y-1 hover:border-[#a7b86a]/35">
      <div className="aspect-square w-full shrink-0 overflow-hidden bg-black sm:aspect-[4/3]">
        {product.crop ? (
          <div
            aria-label={product.name}
            role="img"
            className="h-full w-full bg-cover bg-no-repeat transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${product.image})`, backgroundSize: "400% 200%", backgroundPosition: product.crop }}
          />
        ) : (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-[12px] font-black leading-[1.15] sm:text-lg">{product.name}</h3>
          <span className="shrink-0 text-[9px] font-black text-white/45">{product.weight}</span>
        </div>
        <p className="mt-1 min-h-[2.15rem] text-[10px] leading-[1.05rem] text-white/45 sm:min-h-[3rem] sm:text-xs sm:leading-5" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.description}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-2.5">
          <div className="shrink-0 whitespace-nowrap text-[13px] font-black leading-none text-[#ef7d18] sm:text-xl">{product.price}</div>
          <button type="button" onClick={() => onAdd(product)} aria-label={`Adicionar ${product.name}`} className="ml-auto inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-[#a7b86a] px-3 py-2 text-[10px] font-black text-black sm:min-h-11 sm:px-4 sm:py-2.5 sm:text-sm">
            <Plus size={15} strokeWidth={3} /> Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
function Section({ id, eyebrow, title, subtitle, products, featuredNames, onAdd }: { id:string; eyebrow:string; title:string; subtitle:string; products:Product[]; featuredNames: string[]; onAdd: (product: Product) => void }) {
  const [expanded, setExpanded] = useState(false);
  const visibleProducts = expanded ? products : products.slice(0, 4);
  const hiddenCount = Math.max(products.length - 2, 0);

  return (
    <section id={id} className="scroll-mt-24 mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-9 md:px-8">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">{eyebrow}</div>
          <h2 className="mt-1.5 text-3xl font-black sm:text-4xl md:text-5xl">
            {id === "cardapio" ? <><span className="text-[#a7b86a]">LINHA FIT</span> <span className="text-white">•</span> <span className="text-[#ef7d18]">350 G</span></> : title}
          </h2>
          <p className="mt-1.5 text-sm text-white/50 sm:text-base">{subtitle}</p>
        </div>

      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <div key={product.name}>
            <ProductCard product={product} onAdd={onAdd} />
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-[#a7b86a]/45 bg-[#a7b86a]/[.07] px-4 py-3.5 text-xs font-black text-[#d5e19e] transition hover:border-[#a7b86a]/70 hover:bg-[#a7b86a]/[.12] active:scale-[.99] sm:mt-4 sm:py-4 sm:text-sm"
        >
          <span>{expanded ? "Mostrar menos" : "Ver todos os pratos da linha"}</span>
          <ArrowRight size={16} className={expanded ? "rotate-[-90deg]" : ""} />
        </button>
      )}
      {expanded && hiddenCount > 0 && (
        <div className="mt-3 text-center text-[11px] font-bold text-white/30">{products.length} opções disponíveis nesta linha.</div>
      )}
    </section>
  );
}

export default function Home() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [comboOpen, setComboOpen] = useState(false);
  const [comboLineIndex, setComboLineIndex] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const bannerSlides = [
    { image: "/images/91de66d4-d4da-471c-9178-6ca8f363602c.png", eyebrow: "Nutrifit • Juiz de Fora", title: "Marmitas fitness, sabor e praticidade para sua rotina.", text: "Escolha suas refeições, monte seu pedido e receba em casa.", cta: "Ver cardápio", href: "#cardapio", source: "banner_cardapio" },
    { image: "/images/91de66d4-d4da-471c-9178-6ca8f363602c.png", eyebrow: "Linha FIT • 350 g", title: "Comida de verdade para quem quer comer bem.", text: "Opções equilibradas para variar sua rotina sem abrir mão do sabor.", cta: "Conhecer a FIT", href: "#cardapio", source: "banner_fit" },
    { image: "/images/91de66d4-d4da-471c-9178-6ca8f363602c.png", eyebrow: "Plano alimentar personalizado", title: "Você traz o plano. A Nutrifit prepara as refeições.", text: "Marmitas personalizadas de acordo com suas metas e orientação nutricional.", cta: "Saiba como funciona", href: "#plano-alimentar", source: "banner_nutricionista", benefits: [
      { label: "Alimentação planejada", icon: "apple" },
      { label: "Suporte às suas metas", icon: "dumbbell" },
      { label: "Mais saúde e resultados", icon: "clipboard" },
    ] },
  ] as const;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % bannerSlides.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [bannerSlides.length]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOrderOpen(false);
      setProfileOpen(false);
      setSearchOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const addPlanToOrder = (items: OrderItem[]) => {
    setOrderItems((current) => {
      const next = [...current];
      for (const item of items) {
        const found = next.find((existing) => existing.name === item.name);
        if (found) found.quantity += item.quantity;
        else next.push(item);
      }
      return next;
    });
    setOrderOpen(true);
  };
  const [orderOpen, setOrderOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [profileMarketing, setProfileMarketing] = useState(false);
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error" | "exists">("idle");
  const [clubDiscount, setClubDiscount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderCep, setOrderCep] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderDelivery, setOrderDelivery] = useState<DeliveryResult | null>(null);
  const [orderDeliveryStatus, setOrderDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const orderSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const orderFreeDelivery = orderCount >= DELIVERY_FREE_FROM;
  const orderDeliveryFee = orderFreeDelivery ? 0 : (orderDelivery?.fee ?? 0);
  const orderDiscount = Math.min(clubDiscount, orderSubtotal);
  const orderGrandTotal = Math.max(0, orderSubtotal - orderDiscount + orderDeliveryFee);
  const orderPhoneDigits = customerPhone.replace(/\D/g, "");
  const orderCustomerReady = Boolean(customerName.trim() && orderPhoneDigits.length >= 10);
  const orderDeliveryReady = orderFreeDelivery || Boolean(orderDelivery);
  const canFinalizeOrder = Boolean(orderItems.length && orderCustomerReady && orderDeliveryReady);

  const calculateOrderDelivery = async () => {
    const cleanCep = orderCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) { setOrderDelivery(null); setOrderDeliveryStatus("error"); return; }
    setOrderDeliveryStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro || !data.bairro) throw new Error("CEP");
      const result = findDelivery(data.bairro);
      if (!result) throw new Error("bairro");
      setOrderDelivery(result);
      setOrderDeliveryStatus("idle");
    } catch {
      setOrderDelivery(null);
      setOrderDeliveryStatus("error");
    }
  };

  const addToOrder = (product: Product) => {
    setOrderItems((current) => {
      const found = current.find((item) => item.name === product.name);
      if (found) return current.map((item) => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { name: product.name, line: product.line, weight: product.weight, price: parseMoney(product.price), quantity: 1 }];
    });
    setOrderOpen(true);
  };
  const changeOrderQty = (name: string, delta: number) => setOrderItems((items) => items.map((item) => item.name === name ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeOrderItem = (name: string) => setOrderItems((items) => items.filter((item) => item.name !== name));
  const sendFullOrder = () => {
    if (!orderItems.length || !orderCustomerReady || !orderDeliveryReady) return;

    const lines = orderItems.map((item, i) => {
      const itemSubtotal = item.price * item.quantity;
      return `${i + 1}. ${item.quantity}x ${item.name}\n   ${item.line} • ${item.weight} • ${money(item.price)} cada\n   Subtotal: ${money(itemSubtotal)}`;
    }).join("\n\n");

    const notesText = orderNotes.trim();
    const deliverySummary = orderFreeDelivery
      ? `Entrega grátis — pedido com ${orderCount} itens${orderCep ? " • CEP " + orderCep : ""}`
      : orderDelivery
        ? `${orderDelivery.fee === 0 ? "Entrega grátis" : "Entrega " + money(orderDelivery.fee)} — ${orderDelivery.neighborhood || "bairro identificado"}${orderCep ? " • CEP " + orderCep : ""}`
        : "Taxa de entrega a confirmar pelo WhatsApp";

    const message = [
      "🥗 NUTRIFIT • NOVO PEDIDO",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      `Cliente: ${customerName.trim() || "A informar"}`,
      `WhatsApp: ${customerPhone.trim() || "A informar"}`,
      "",
      "🛒 ITENS DO PEDIDO",
      "",
      lines,
      "",
      "━━━━━━━━━━━━━━━━━━━━",
      `📦 QUANTIDADE: ${orderCount} item(ns)`,
      `💰 SUBTOTAL: ${money(orderSubtotal)}`,
      `🎁 DESCONTO CLUBE NUTRIFIT: -${money(orderDiscount)}`,
      `🚚 FRETE: ${money(orderDeliveryFee)}`,
      `💵 TOTAL A PAGAR: ${money(orderGrandTotal)}`,
      "",
      "📍 ENTREGA",
      deliverySummary,
      ...(notesText ? ["", "📝 OBSERVAÇÕES", notesText] : []),
      "",
      "💳 PAGAMENTO VIA PIX",
      `Chave Pix: ${PIX_KEY}`,
      "Enviar o comprovante por este WhatsApp após o pagamento.",
      "",
      "✅ Pedido conferido pelo cliente."
    ].join("\n");

    const whatsappUrl = whatsappOrder(message);
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!whatsappWindow) window.location.href = whatsappUrl;

    void (async () => {
      try {
        await fetch(SUPABASE_URL + "/rest/v1/customer_orders", {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            customer_name: customerName.trim(),
            whatsapp: orderPhoneDigits,
            items: orderItems,
            item_count: orderCount,
            subtotal: orderSubtotal,
            discount: orderDiscount,
            delivery_fee: orderDeliveryFee,
            total: orderGrandTotal,
            cep: orderCep.replace(/\D/g, "") || null,
            neighborhood: orderDelivery?.neighborhood || null,
            notes: notesText || null,
          }),
        });

        if (clubDiscount > 0) {
          const redeemResponse = await fetch(SUPABASE_URL + "/rest/v1/rpc/redeem_clube_nutrifit_welcome_coupon", {
            method: "POST",
            headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ p_whatsapp: orderPhoneDigits }),
          });
          if (redeemResponse.ok) {
            setClubDiscount(0);
            try {
              const saved = JSON.parse(window.localStorage.getItem("nutrifit_profile") || "{}");
              window.localStorage.setItem("nutrifit_profile", JSON.stringify({ ...saved, couponUsed: true }));
            } catch {}
          }
        }
      } catch (error) {
        console.error("order capture", error);
      }
    })();

    setOrderOpen(false);
  };
  const searchableProducts = [...fit, ...performance, ...salads, ...traditional, ...juiceProducts];
  const searchResults = searchTerm.trim()
    ? searchableProducts.filter((product, index, list) =>
        list.findIndex((item) => item.name === product.name) === index &&
        product.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ).slice(0, 8)
    : [];

  const openProfile = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("nutrifit_profile") || "{}");
      setProfileName(saved.name || "");
      setProfilePhone(saved.phone || "");
      setProfileEmail(saved.email || "");
      setProfileBirthDate(saved.birthDate || "");
      setProfileMarketing(Boolean(saved.marketing));
      setClubDiscount(saved.couponUsed === false ? 5 : 0);
    } catch {}
    setProfileStatus("idle");
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    const name = profileName.trim();
    const phone = profilePhone.replace(/\D/g, "");
    const email = profileEmail.trim().toLowerCase();
    const birthDate = profileBirthDate || null;
    if (!name || phone.length < 10) return;

    setProfileStatus("saving");
    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/customer_profiles", {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name,
          whatsapp: phone,
          email: email || null,
          birth_date: birthDate,
          nutrifit_club_member: true,
          nutrifit_club_joined_at: new Date().toISOString(),
          marketing_consent: profileMarketing,
          marketing_consent_at: profileMarketing ? new Date().toISOString() : null,
        }),
      });

      if (response.status === 409) {
        setProfileStatus("exists");
        return;
      }
      if (!response.ok) throw new Error("signup");

      window.localStorage.setItem("nutrifit_profile", JSON.stringify({
        name,
        phone,
        email,
        birthDate,
        marketing: profileMarketing,
        nutrifitClub: true,
        couponUsed: false,
      }));
      setClubDiscount(5);
      setCustomerName(name);
      setCustomerPhone(phone);
      setProfileStatus("success");
      trackClick("profile_save", "header");
      window.setTimeout(() => setProfileOpen(false), 700);
    } catch {
      setProfileStatus("error");
    }
  };

  const openSearchResult = (product: Product) => {
    setSearchOpen(false);
    setSearchTerm("");
    const target = product.line === "FIT" ? "cardapio"
      : product.line === "PERFORMANCE" ? "performance"
      : product.line === "SALADAS" ? "saladas"
      : product.line === "TRADICIONAL" ? "tradicional"
      : "sucos";
    window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };

  const openComboBuilder = (line?: string) => {
    const lineIndex = line ? comboOptions.findIndex((item) => item.line === line) : 0;
    setComboLineIndex(lineIndex >= 0 ? lineIndex : 0);
    setComboOpen(true);
    if (line) trackClick("combo_builder_start", line);
    window.setTimeout(() => document.getElementById("combo-montar")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050605]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-2 px-3 sm:h-[80px] sm:px-4 md:h-[82px] md:gap-5 md:px-7">
          <a href="#inicio" aria-label="Nutrifit — início" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0b0d09] sm:h-10 sm:w-10">
              <img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
            </span>
            <span className="leading-none">
              <span className="text-[18px] font-black tracking-[-.04em] text-white sm:text-[22px] md:text-[28px]">NUTRI<span className="text-[#ef7d18]">FIT</span></span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex items-center gap-1 text-sm font-black text-white/85 hover:text-white">CARDÁPIO <ChevronDown size={15} className={menuOpen ? "rotate-180 transition" : "transition"} /></button>
              {menuOpen && <div className="absolute left-0 top-9 w-56 rounded-2xl border border-white/10 bg-[#10130d]/98 p-2 shadow-2xl backdrop-blur-xl">
                {[["Fit 350 g","#cardapio"],["Performance 450 g","#performance"],["Saladas","#saladas"],["Tradicionais 500 g","#tradicional"],["Sucos","#sucos"]].map(([label,href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-bold text-white/70 hover:bg-white/5 hover:text-white">{label}</a>)}
              </div>}
            </div>
            <a href="#combos" className="text-sm font-black text-white/85 hover:text-white">COMBOS</a>
            <a href="#planos-mensais" className="text-sm font-black text-white/85 hover:text-white">PERSONALIZE</a>
            <a href="#como-pedir" className="text-sm font-black text-white/85 hover:text-white">COMO COMPRAR</a>
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="O que você procura?" className="hidden h-12 w-[260px] items-center justify-between rounded-2xl border border-white/20 bg-white/[.08] px-5 text-left text-sm text-white/70 lg:flex xl:w-[340px]">
              <span>O que você procura?</span><Search size={24} />
            </button>

            <button type="button" onClick={openProfile} aria-label="Minha conta" title="Minha conta" className="group grid min-w-[48px] place-items-center rounded-xl px-1 py-1 text-white transition hover:bg-white/10 md:h-12 md:w-12 md:rounded-full">
              <UserRound size={24} strokeWidth={1.7} />
              <span className="mt-0.5 text-[8px] font-black leading-none text-white/70 sm:text-[9px] lg:hidden">Minha conta</span>
            </button>

            <a href="#cardapio" className="hidden xl:inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3 text-xs font-black text-black transition hover:scale-[1.02]">Fazer pedido <ArrowRight size={15} /></a>

            <button type="button" onClick={() => setOrderOpen(true)} aria-label="Carrinho" title="Carrinho" className="relative grid min-w-[48px] place-items-center rounded-xl px-1 py-1 text-white transition hover:bg-white/10 md:h-12 md:w-12 md:rounded-full">
              <ShoppingCart size={24} strokeWidth={1.7} />
              {orderCount > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#ef7d18] px-1 text-[10px] font-black text-white">{orderCount}</span>}
              <span className="mt-0.5 text-[8px] font-black leading-none text-white/70 sm:text-[9px] lg:hidden">Carrinho</span>
            </button>

            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu" aria-expanded={menuOpen} title="Menu" className="grid min-w-[48px] place-items-center rounded-xl px-1 py-1 text-white transition hover:bg-white/10 md:h-12 md:w-12 md:rounded-full lg:hidden">
              <span className="text-[25px] leading-[1]">☰</span>
              <span className="mt-0.5 text-[9px] font-black leading-none text-white/70 sm:text-[10px]">Menu</span>
            </button>
          </div>
        </div>

        {menuOpen && <div className="border-t border-white/10 bg-[#10130d] px-3 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            <a href="#cardapio" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">FIT 350 g</a>
            <a href="#performance" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">PERFORMANCE 450 g</a>
            <a href="#saladas" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">SALADAS</a>
            <a href="#tradicional" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">TRADICIONAL 500 g</a>
            <a href="#sucos" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">SUCOS</a>
            <a href="#combos" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">COMBOS</a>
            <a href="#planos-mensais" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">PERSONALIZE</a>
            <a href="#como-pedir" onClick={() => setMenuOpen(false)} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">COMO COMPRAR</a>
          </div>
          <button type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[.06] px-4 py-3 text-sm font-black text-white">
            <Search size={18} /> O QUE VOCÊ PROCURA?
          </button>
        </div>}
      </header>

      <section id="inicio" className="border-b border-white/10 bg-[#080a07]">
  <div className="relative min-h-[400px] overflow-hidden sm:min-h-[430px] md:min-h-[500px]">
    {bannerSlides.map((slide, index) => (
      <div key={slide.source} className={`absolute inset-0 transition-opacity duration-700 ${index === bannerIndex ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={index !== bannerIndex}>
        <img src={slide.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: index === 0 ? "72% center" : index === 1 ? "58% center" : "45% center" }} fetchPriority={index === 0 ? "high" : "auto"} />
        <a
          href={slide.href}
          onClick={() => trackClick("banner_cta_click", slide.source)}
          className="absolute inset-0 z-10 flex items-center bg-[linear-gradient(90deg,#000_0%,#000_52%,rgba(0,0,0,.88)_68%,rgba(0,0,0,.12)_88%,transparent_100%)]"
          aria-label={slide.title}
        >
          <div className="max-w-xl px-5 py-9 sm:px-7 sm:py-10 md:px-14">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ff5a00]">{slide.eyebrow}</div>
            <h1 className="mt-3 text-[2rem] font-black leading-[1.05] text-[#ff5a00] sm:text-4xl md:text-5xl">{slide.title}</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 md:text-base">{slide.text}</p>
            <span className="mt-6 inline-flex rounded-full bg-[#a7b86a] px-6 py-3.5 font-black text-black">{slide.cta} <ArrowRight className="ml-2" size={18} /></span>
          </div>
        </a>
      </div>
    ))}
    <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
      {bannerSlides.map((slide, index) => (
        <button key={slide.source} type="button" onClick={() => setBannerIndex(index)} aria-label={`Ir para banner ${index + 1}`} className={`h-2 rounded-full transition-all ${index === bannerIndex ? "w-8 bg-[#a7b86a]" : "w-2 bg-white/45"}`} />
      ))}
    </div>
    <button type="button" onClick={() => setBannerIndex((bannerIndex - 1 + bannerSlides.length) % bannerSlides.length)} aria-label="Banner anterior" className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white backdrop-blur sm:block">‹</button>
    <button type="button" onClick={() => setBannerIndex((bannerIndex + 1) % bannerSlides.length)} aria-label="Próximo banner" className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white backdrop-blur sm:block">›</button>
  </div>
</section>

      <section aria-label="Escolha sua refeição" className="border-b border-white/10 bg-[#0b0e09]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 md:px-8">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Escolha sua refeição</div>
            <h2 className="mt-1.5 text-2xl font-black sm:text-3xl">Como você quer se alimentar hoje?</h2>
            <p className="mt-1.5 text-sm text-white/45">Escolha uma linha e encontre sua refeição.</p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <a href="#cardapio" className="group rounded-[1.15rem] border border-[#a7b86a]/65 bg-[#a7b86a]/10 p-2.5 text-left transition hover:-translate-y-0.5 hover:bg-[#a7b86a]/15 sm:rounded-[1.4rem] sm:p-4 md:p-5">
              <div className="flex min-h-[126px] flex-col justify-between sm:min-h-[150px]">
                <div>
                  <Apple size={34} strokeWidth={1.8} className="mb-2 text-[#a7b86a] sm:h-10 sm:w-10" />
                  <div className="text-[8px] font-black uppercase tracking-[.12em] text-[#a7b86a] sm:text-[10px] sm:tracking-[.18em]">Linha Fit</div>
                  <div className="mt-1 text-[15px] font-black leading-tight sm:text-xl">FIT <span className="text-[#a7b86a]">350 g</span></div>
                  <div className="mt-2 text-[9px] leading-3 text-white/50 sm:text-sm sm:leading-5">Leve, equilibrada e saborosa.</div>
                </div>
                <span className="grid h-7 w-7 place-items-center self-end rounded-full border border-[#a7b86a]/70 text-sm text-[#a7b86a] sm:h-10 sm:w-10 sm:text-lg">→</span>
              </div>
            </a>

            <a href="#performance" className="group rounded-[1.15rem] border border-white/15 bg-white/[.03] p-2.5 text-left transition hover:-translate-y-0.5 hover:border-[#a7b86a]/40 sm:rounded-[1.4rem] sm:p-4 md:p-5">
              <div className="flex min-h-[126px] flex-col justify-between sm:min-h-[150px]">
                <div>
                  <Dumbbell size={34} strokeWidth={1.8} className="mb-2 text-[#ef7d18] sm:h-10 sm:w-10" />
                  <div className="text-[8px] font-black uppercase tracking-[.12em] text-[#ef7d18] sm:text-[10px] sm:tracking-[.18em]">Performance</div>
                  <div className="mt-1 text-[15px] font-black leading-tight sm:text-xl">PERFORMANCE <span className="text-[#ef7d18]">450 g</span></div>
                  <div className="mt-2 text-[9px] leading-3 text-white/50 sm:text-sm sm:leading-5">Mais proteína para o seu dia.</div>
                </div>
                <span className="grid h-7 w-7 place-items-center self-end rounded-full border border-[#ef7d18]/70 text-sm text-[#ef7d18] sm:h-10 sm:w-10 sm:text-lg">→</span>
              </div>
            </a>

            <a href="#tradicional" className="group rounded-[1.15rem] border border-[#ef7d18]/40 bg-[#ef7d18]/10 p-2.5 text-left transition hover:-translate-y-0.5 hover:bg-[#ef7d18]/15 sm:rounded-[1.4rem] sm:p-4 md:p-5">
              <div className="flex min-h-[126px] flex-col justify-between sm:min-h-[150px]">
                <div>
                  <ChefHat size={34} strokeWidth={1.8} className="mb-2 text-[#ef7d18] sm:h-10 sm:w-10" />
                  <div className="text-[8px] font-black uppercase tracking-[.12em] text-[#ef7d18] sm:text-[10px] sm:tracking-[.18em]">Linha Tradicional</div>
                  <div className="mt-1 text-[15px] font-black leading-tight sm:text-xl">TRADICIONAL <span className="text-[#ef7d18]">500 g</span></div>
                  <div className="mt-2 text-[9px] leading-3 text-white/50 sm:text-sm sm:leading-5">Refeições mais completas.</div>
                </div>
                <span className="grid h-7 w-7 place-items-center self-end rounded-full border border-[#ef7d18]/70 text-sm text-[#ef7d18] sm:h-10 sm:w-10 sm:text-lg">→</span>
              </div>
            </a>
          </div>


        </div>
      </section>

      <section aria-label="Monte seu combo" className="mx-auto max-w-7xl px-4 pb-4 sm:px-5 md:px-8">
        <button type="button" onClick={() => openComboBuilder("FIT")} className="group relative flex min-h-[142px] w-full items-center overflow-hidden rounded-[1.5rem] border border-[#ef7d18]/65 bg-gradient-to-r from-[#17130d] via-[#1b160d] to-[#10150d] text-left transition hover:-translate-y-0.5 hover:border-[#ef7d18] sm:min-h-[158px]">
          <div className="relative z-10 min-w-0 flex-1 p-4 pr-28 sm:p-6 sm:pr-40">
            <div className="text-[9px] font-black uppercase tracking-[.18em] text-[#a7b86a] sm:text-[10px] sm:tracking-[.2em]">Mais praticidade • mais economia</div>
            <div className="mt-1 text-[22px] font-black leading-tight sm:text-3xl">MONTE SEU COMBO</div>
            <div className="mt-1 text-[18px] font-black leading-tight text-[#ef7d18] sm:text-2xl">COMPRE MAIS • PAGUE MENOS</div>
            <p className="mt-2 max-w-md text-[11px] leading-4 text-white/50 sm:text-sm sm:leading-5">Escolha suas marmitas e monte o combo ideal para sua rotina.</p>
          </div>
          <div className="absolute right-3 top-1/2 h-[116px] w-[116px] -translate-y-1/2 overflow-hidden rounded-[1.15rem] border border-white/10 bg-black sm:right-5 sm:h-[130px] sm:w-[170px]">
            <img src="/images/page-6.jpg" alt="Marmita Nutrifit" className="h-full w-full scale-[1.45] object-cover object-[78%_center] sm:scale-[1.3]" />
          </div>
          <span className="absolute bottom-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-[#a7b86a] text-lg font-black text-black sm:bottom-4 sm:right-4 sm:h-11 sm:w-11">→</span>
        </button>
      </section>

      
      <section id="plano-alimentar" aria-label="Plano alimentar Nutrifit" className="mx-auto max-w-7xl px-4 pb-4 sm:px-5 md:px-8">
        <div className="rounded-[1.5rem] border border-[#a7b86a]/35 bg-gradient-to-br from-[#171d10] via-[#11150d] to-[#0b0e09] p-5 sm:p-6">
          <div className="text-[9px] font-black uppercase tracking-[.2em] text-[#a7b86a] sm:text-[10px]">Plano alimentar • Nutrifit</div>
          <div className="mt-1 text-2xl font-black leading-tight sm:text-3xl">Seu plano alimentar pode virar refeições prontas.</div>
          <p className="mt-2 max-w-3xl text-sm leading-5 text-white/50">Você já tem um plano feito pelo seu nutricionista? Traga as orientações para a Nutrifit e transforme seu planejamento em refeições prontas.</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <a href={whatsappOrder("Olá Nutrifit! Tenho um plano alimentar e quero transformar em marmitas.")} className="group flex min-h-24 flex-col justify-between rounded-[1.15rem] border border-[#a7b86a]/40 bg-[#a7b86a]/5 p-3.5 text-left transition hover:-translate-y-0.5 hover:bg-[#a7b86a]/10 sm:min-h-28 sm:p-4">
              <ClipboardCheck size={25} strokeWidth={2} className="text-[#a7b86a] sm:h-7 sm:w-7" />
              <span className="flex items-center justify-between gap-2 text-[11px] font-black leading-4 sm:text-sm">Tenho meu plano <ArrowRight size={15} /></span>
            </a>
            <a href={whatsappOrder("Olá Nutrifit! Quero falar com a nutricionista parceira da Nutrifit.")} className="group flex min-h-24 flex-col justify-between rounded-[1.15rem] border border-[#ef7d18]/40 bg-[#ef7d18]/5 p-3.5 text-left transition hover:-translate-y-0.5 hover:bg-[#ef7d18]/10 sm:min-h-28 sm:p-4">
              <Stethoscope size={25} strokeWidth={2} className="text-[#ef7d18] sm:h-7 sm:w-7" />
              <span className="flex items-center justify-between gap-2 text-[11px] font-black leading-4 sm:text-sm">Quero falar com a nutricionista <ArrowRight size={15} /></span>
            </a>
          </div>
        </div>
      </section>

      <Section id="cardapio" eyebrow="Saudável, equilibrada, leve" title="Linha Fit • 350 g" subtitle="Marmitas 350 g para o seu dia a dia. Unidade R$ 23,97." products={fit} featuredNames={["Patinho com Abóbora","Frango Grelhado com Mix de Legumes"]} onAdd={addToOrder} />

      <Section id="performance" eyebrow="Alta proteína e energia" title="Linha Performance • 450 g" subtitle="Frango R$ 27,90 • Bovina R$ 29,90." products={performance} featuredNames={[performance[0]?.name || "", performance[1]?.name || ""]} onAdd={addToOrder} />
      <Section id="saladas" eyebrow="Frescor, leveza e nutrição" title="Linha Saladas • 350 g" subtitle="Saladas vendidas por unidade • R$ 21,90." products={salads} featuredNames={[salads[0]?.name || "", salads[1]?.name || ""]} onAdd={addToOrder} />
      <Section id="tradicional" eyebrow="Sabor caseiro" title="Linha Tradicional • 500 g" subtitle="Opções de R$ 26,90 a R$ 29,90." products={traditional} featuredNames={[traditional[0]?.name || "", traditional[1]?.name || ""]} onAdd={addToOrder} />
      <section id="sucos" className="scroll-mt-[120px] border-y border-white/10 bg-[#080a07]">
        <div className="mx-auto max-w-7xl px-4 py-0 sm:px-5 sm:py-3 md:px-8 md:py-8">
          <div className="overflow-hidden rounded-[1.8rem] border border-white/20 bg-black shadow-[0_18px_60px_rgba(0,0,0,.3)] sm:rounded-[2rem]">
            <div className="relative min-h-[390px] overflow-hidden sm:min-h-[500px] md:min-h-[550px]">
              <img
                src="/images/page-36.jpg"
                alt="Suco Nutrifit Energy"
                className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.92)_34%,rgba(0,0,0,.55)_55%,rgba(0,0,0,.08)_82%,rgba(0,0,0,0)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.18)_0%,transparent_45%)]" />

              <div className="relative z-10 flex min-h-[390px] max-w-[620px] flex-col justify-center px-5 py-8 sm:min-h-[500px] sm:px-9 sm:py-12 md:min-h-[550px] md:px-12">
                <div className="text-[10px] font-black uppercase tracking-[.25em] text-[#a7b86a] sm:text-xs">Refresque sua rotina</div>
                <h2 className="mt-3 text-[3rem] font-black leading-[.86] tracking-[-.055em] sm:text-6xl md:text-7xl">
                  <span className="block text-white">Linha de</span>
                  <span className="block text-[#ef7d18]">Sucos</span>
                </h2>
                <p className="mt-4 max-w-[390px] text-sm leading-6 text-white/70 sm:mt-5 sm:text-lg sm:leading-8">
                  Sabor, frescor e praticidade<br className="hidden sm:block" /> para o seu dia a dia.
                </p>

                <div className="mt-5 flex max-w-[520px] flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                  <span className="inline-flex min-h-[58px] items-center gap-3 rounded-full border border-[#a7b86a]/55 bg-black/35 px-5 text-sm font-black text-[#d8e7a0] backdrop-blur-sm sm:text-base">
                    <Leaf size={25} strokeWidth={2} />
                    <span>100%<br />NATURAL</span>
                  </span>
                  <span className="inline-flex min-h-[58px] items-center gap-3 rounded-full border border-[#a7b86a]/55 bg-black/35 px-5 text-sm font-black text-[#d8e7a0] backdrop-blur-sm sm:text-base">
                    <HeartPulse size={25} strokeWidth={2} />
                    <span>FUNCIONAIS</span>
                  </span>
                  <span className="inline-flex min-h-[58px] items-center gap-3 rounded-full border border-[#a7b86a]/55 bg-black/35 px-5 text-sm font-black text-[#d8e7a0] backdrop-blur-sm sm:text-base">
                    <FlaskConical size={25} strokeWidth={2} />
                    <span>SEM CONSERVANTES</span>
                  </span>
                </div>
              </div>
            </div>

            <div id="sucos-produtos" className="scroll-mt-[170px] border-t border-white/10 p-4 sm:p-7 md:p-8">
              <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.22em] text-[#a7b86a] sm:text-xs">Funcionais</div>
                  <h3 className="mt-1 text-[2rem] font-black leading-none tracking-tight sm:text-4xl">Escolha seu sabor</h3>
                </div>
                <div className="shrink-0 text-right text-sm leading-6 text-white/55 sm:text-base">
                  300 ml • R$ 9,90<br />500 ml • R$ 12,90
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
                {[
                  ["Energy","/images/page-36.jpg","FUNCIONAL","Beterraba • Laranja • Maçã • Limão"],
                  ["Green","/images/page-37.jpg","DETOX","Maçã • Pepino • Gengibre • Hortelã • Limão"],
                  ["Pink","/images/page-38.jpg","FUNCIONAL","Morango • Beterraba • Laranja • Limão"],
                  ["Sun","/images/page-39.jpg","REFRESCANTE","Abacaxi • Maracujá • Laranja • Gengibre"],
                  ["Purple","/images/page-40.jpg","ANTIOXIDANTE","Uva • Frutas vermelhas • Limão"],
                  ["Glow","/images/page-41.jpg","FUNCIONAL","Morango • Laranja • Cenoura • Beterraba • Limão"],
                ].map(([name,image,badge,ingredients]) => (
                  <div key={name} className="group overflow-hidden rounded-[1.45rem] border border-white/15 bg-[#0b0e09] transition hover:-translate-y-0.5 hover:border-[#a7b86a]/55">
                    <div className="relative aspect-[16/8] overflow-hidden sm:aspect-[3/2]">
                      <img src={image} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                      <span className="absolute left-3 top-3 rounded-full border border-[#a7b86a]/45 bg-[#10140d]/90 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#cbd99a] backdrop-blur">{badge}</span>
                    </div>
                    <div className="p-4 sm:p-5 md:p-7">
                      <div className="text-2xl font-black sm:text-2xl md:text-3xl">{name}</div>
                      <div className="mt-1 min-h-8 text-xs leading-5 text-white/55 sm:text-xs md:text-sm">{ingredients}</div>
                      <div className="mt-4 grid min-w-0 grid-cols-2 gap-2.5">
                        {[["300 ml","R$ 9,90"],["500 ml","R$ 12,90"]].map(([size,price]) => (
                          <button key={size} type="button" onClick={() => {
                            const product = juiceProducts.find((item) => item.name === name + " — " + size);
                            if (product) addToOrder(product);
                          }} className="min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#10130d] px-2 py-2.5 text-center transition hover:border-[#a7b86a]/55 hover:bg-[#a7b86a]/10 sm:px-2 sm:py-3">
                            <span className="block whitespace-nowrap text-[10px] font-bold text-white/55 sm:text-xs">{size}</span>
                            <span className="mt-0.5 block whitespace-nowrap text-lg font-black text-[#ef7d18] sm:text-xl">{price}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-2">
                        <span className="px-2 text-[10px] font-bold leading-4 text-white/45">Escolha o tamanho e adicione ao carrinho</span>
                        <ShoppingCart size={18} className="mr-1 shrink-0 text-[#a7b86a]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-t border-white/10 pt-7">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.22em] text-[#ef7d18] sm:text-xs">Naturais</div>
                    <h3 className="mt-1 text-2xl font-black sm:text-3xl">Clássicos da Nutrifit</h3>
                  </div>
                  <div className="shrink-0 text-right text-sm leading-6 text-white/55">
                    300 ml • R$ 9,90<br />500 ml • R$ 12,90
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
                  {[
                    ["Suco de Laranja","/images/page-42.jpg"],
                    ["Laranja com Acerola","/images/page-43.jpg"],
                    ["Abacaxi com Hortelã","/images/page-44.jpg"],
                  ].map(([name,image]) => (
                    <div key={name} className="group overflow-hidden rounded-[1.45rem] border border-white/15 bg-[#0b0e09] transition hover:-translate-y-0.5 hover:border-[#ef7d18]/45">
                      <div className="relative aspect-[16/8] overflow-hidden sm:aspect-[3/2]">
                        <img src={image} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                        <span className="absolute left-3 top-3 rounded-full border border-[#ef7d18]/40 bg-[#10140d]/90 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#ef7d18] backdrop-blur">NATURAL</span>
                      </div>
                      <div className="p-4 sm:p-5 md:p-7">
                        <div className="text-2xl font-black sm:text-2xl md:text-3xl">{name}</div>
                        <div className="mt-4 grid min-w-0 grid-cols-2 gap-3">
                          {[["300 ml","R$ 9,90"],["500 ml","R$ 12,90"]].map(([size,price]) => (
                            <button key={size} type="button" onClick={() => {
                              const product = juiceProducts.find((item) => item.name === name + " — " + size);
                              if (product) addToOrder(product);
                            }} className="min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#10130d] px-2 py-3 text-center transition hover:border-[#ef7d18]/45 hover:bg-[#ef7d18]/5 sm:px-2">
                              <span className="block whitespace-nowrap text-[10px] text-white/55 sm:text-xs">{size}</span>
                              <span className="mt-0.5 block whitespace-nowrap text-lg font-black text-[#ef7d18] sm:text-xl">{price}</span>
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={() => {
                          const product = juiceProducts.find((item) => item.name === name + " — 500 ml");
                          if (product) addToOrder(product);
                        }} className="mt-3 flex min-h-[56px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#b7dc62] px-4 text-sm font-black text-black shadow-lg transition hover:scale-[1.01] md:min-h-[58px] md:text-base">
                          <ShoppingCart size={20} strokeWidth={2} /> Adicionar ao carrinho
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="combos" className="border-y border-white/10 bg-[#10130d]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-8 md:px-8">
          <div className="overflow-hidden rounded-[1.65rem] border border-[#ef7d18]/40 bg-gradient-to-br from-[#171d10] via-[#11150d] to-[#0b0e09] shadow-[0_18px_60px_rgba(0,0,0,.22)]">
            <div className="border-b border-white/10 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 max-w-3xl">
                  <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#ef7d18]">Mais praticidade • mais economia</div>
                  <h2 className="mt-1 text-2xl font-black sm:text-4xl">Monte seu combo</h2>
                  <p className="mt-1.5 max-w-2xl text-xs leading-5 text-white/50 sm:text-sm sm:leading-6">Escolha a linha e a quantidade. Depois, monte os sabores do seu jeito.</p>
                </div>
                <div className="flex w-fit shrink-0 items-center gap-1 rounded-full border border-[#a7b86a]/25 bg-[#a7b86a]/5 px-3 py-1.5 text-[10px] font-black text-[#cbd99a]">
                  <span>5</span><span className="text-white/25">•</span><span>7</span><span className="text-white/25">•</span><span>10</span><span className="text-white/25">•</span><span>14</span><span className="text-white/25">•</span><span>20</span>
                  <span className="ml-1 text-white/40">marmitas</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="mb-2.5 text-[10px] font-black uppercase tracking-[.16em] text-white/40">1. Escolha sua linha</div>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  ["FIT","350 g","R$ 117,00","Leve e equilibrada"],
                  ["PERFORMANCE","450 g","R$ 139,90","Mais proteína e energia"],
                  ["TRADICIONAL","500 g","R$ 139,90","Sabor caseiro"],
                ].map(([line,weight,price,description], index) => (
                  <button
                    key={line}
                    type="button"
                    onClick={() => openComboBuilder(line)}
                    className={`group relative flex min-h-[82px] items-center gap-2.5 rounded-[1.15rem] border p-3 text-left transition hover:-translate-y-0.5 sm:min-h-[96px] sm:p-4 md:min-h-[116px] ${
                      index === 0 ? "border-[#a7b86a]/55 bg-[#a7b86a]/10" : index === 1 ? "border-white/12 bg-white/[.03]" : "border-[#ef7d18]/35 bg-[#ef7d18]/5"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`text-[9px] font-black uppercase tracking-[.18em] ${
                        index === 2 ? "text-[#ef7d18]" : "text-[#a7b86a]"
                      }`}>{line}</div>
                      <div className="mt-1 text-[10px] font-semibold leading-3.5 text-white/65 sm:text-xs">{description}</div>
                    </div>

                    <div className="shrink-0 border-l border-white/10 pl-2.5 sm:pl-4">
                      <div className="text-lg font-black leading-none sm:text-xl">{weight}</div>
                      <div className="mt-1 whitespace-nowrap text-[9px] leading-3 text-white/40 sm:text-[10px]">A partir de <span className="font-black text-[#ef7d18]">{price}</span></div>
                    </div>

                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-black transition group-hover:translate-x-0.5 sm:h-9 sm:w-9 ${
                      index === 2 ? "border-[#ef7d18]/60 text-[#ef7d18]" : "border-[#a7b86a]/50 text-[#a7b86a]"
                    }`}>→</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-[1.15rem] border border-white/10 bg-black/20 px-3.5 py-3 sm:px-4 sm:py-3.5">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black sm:text-sm">2. Monte os sabores</div>
                    <div className="mt-0.5 text-[10px] leading-4 text-white/40 sm:text-xs">Escolha a quantidade e os sabores depois de selecionar a linha.</div>
                  </div>
                  <button type="button" onClick={() => openComboBuilder()} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#a7b86a] px-4 py-2.5 text-[10px] font-black text-black shadow-lg transition hover:scale-[1.01] sm:text-xs">
                    Montar <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {comboOpen && (
            <>
              <div id="combo-montar" className="scroll-mt-24 pt-6">
                <div className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Montador de combos</div>
                    <div className="mt-1 text-sm text-white/50">Escolha a quantidade, os sabores e a forma de recebimento.</div>
                  </div>
                  <button type="button" onClick={() => setComboOpen(false)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/70 transition hover:border-white/30 hover:text-white">Fechar montador</button>
                </div>
                <ComboBuilder initialLine={comboLineIndex} />
              </div>

              <div className="mt-8 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-5 md:p-7">
                <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Todos os tamanhos</div>
                    <h3 className="mt-1 text-2xl font-black">Combos por linha</h3>
                  </div>
                  <p className="text-sm text-white/45">Misture sabores dentro da mesma linha.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {combos.map(([line,quantity,price,average]) => (
                    <a key={line+quantity} href={whatsappOrder(`Olá, Nutrifit! Quero o combo ${line} — ${quantity} — ${price}. Quero escolher os sabores deste combo.`)} onClick={() => trackClick("combo_direct_click", `${line}-${quantity}`)} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-[#a7b86a]/40">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#a7b86a]">{line}</div>
                      <div className="mt-2 text-sm font-bold text-white/55">{quantity}</div>
                      <div className="mt-1 text-2xl font-black">{price}</div>
                      <div className="mt-1 text-xs text-[#ef7d18]">{average}</div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[[`Combos dentro da linha`,`Misture sabores sem sair da mesma linha.`],[`Praticidade`,`Organize várias refeições de uma vez.`],[`Atendimento direto`,`Faça seu pedido pelo WhatsApp.`]].map(([title,text]) => <div key={title} className="flex gap-3 rounded-2xl border border-white/10 p-5"><Check className="mt-0.5 shrink-0 text-[#a7b86a]" size={19} /><div><div className="font-black">{title}</div><div className="mt-1 text-sm text-white/45">{text}</div></div></div>)}
              </div>
            </>
          )}
        </div>
      </section>


      <section id="planos-mensais" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="rounded-[2rem] border border-[#a7b86a]/25 bg-gradient-to-br from-[#171d10] to-[#0e110c] p-7 md:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Plano mensal Nutrifit</div>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Organize suas refeições do mês</h2>
            <p className="mt-3 leading-6 text-white/50">Escolha 30 ou 60 marmitas e monte os sabores dentro da mesma linha. O preço por marmita é o mesmo do combo de 20 — sem desconto adicional.</p>
          </div>
          <MonthlyPlanBuilder onAddPlan={addPlanToOrder} />
        </div>
      </section>

      <section id="confianca" className="border-y border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-5 sm:py-11 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Praticidade para sua rotina</div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl md:text-5xl">Por que pedir na Nutrifit?</h2>
            <p className="mt-2 text-xs leading-5 text-white/50 sm:text-sm sm:leading-6 md:text-base">Tudo organizado para você escolher, pedir e receber sem complicação.</p>
          </div>
          <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[
              ["🍱", "Porções padronizadas", "350 g • 450 g • 500 g."],
              ["🥗", "Tudo em um só lugar", "Marmitas, saladas e sucos."],
              ["🚚", "Entrega ou retirada", "Consulte pelo CEP."],
              ["💬", "Pedido direto", "Tudo segue organizado no WhatsApp."],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3.5 sm:block sm:min-h-0 sm:rounded-3xl sm:p-6">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#a7b86a]/10 text-xl sm:h-auto sm:w-auto sm:place-items-start sm:bg-transparent sm:text-2xl">{icon}</div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black leading-tight sm:mt-4 sm:text-base">{title}</h3>
                  <p className="mt-1.5 text-[10px] leading-4 text-white/45 sm:mt-2 sm:text-sm sm:leading-6">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-5 sm:py-14 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">É simples</div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl md:text-5xl">Como pedir</h2>
            <p className="mt-2 text-xs leading-5 text-white/50 sm:text-sm sm:leading-6">Escolha, confirme e receba.</p>
          </div>
          <div className="mt-6 grid gap-2.5 md:grid-cols-3 sm:mt-8 sm:gap-4">
            {[
              ["01","Escolha","Veja o cardápio e escolha suas marmitas."],
              ["02","Peça","Envie o pedido pelo WhatsApp."],
              ["03","Receba","Combine entrega ou retirada após a confirmação."]
            ].map(([number,title,text], index) => (
              <div key={number} className="relative flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:block sm:rounded-3xl sm:p-7">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ef7d18]/15 text-xs font-black text-[#ef7d18] sm:h-10 sm:w-10 sm:bg-[#ef7d18]/15">{number}</div>
                <div className="min-w-0"><h3 className="text-base font-black sm:mt-4 sm:text-2xl">{title}</h3><p className="mt-1 text-xs leading-5 text-white/50 sm:mt-3 sm:text-sm sm:leading-7">{text}</p></div>
                {index < 2 && <ArrowRight className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-white/15 md:block" size={18} />}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 sm:mt-10 sm:gap-5">
            <div className="rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-5 sm:rounded-[2rem] sm:p-7 md:p-9">
              <div className="flex items-center gap-3"><Truck className="text-[#a7b86a]" size={21} /><h2 className="text-lg font-black sm:text-2xl">Entrega em Juiz de Fora</h2></div>
              <p className="mt-2.5 text-xs leading-5 text-white/55 sm:mt-3 sm:text-sm sm:leading-7">Calcule pelo CEP no montador de combos ou escolha retirar diretamente na Nutrifit.</p>
              <a href={whatsappOrder("Olá, Nutrifit! Gostaria de consultar a entrega para o meu endereço.")} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3 text-xs font-black text-black">Consultar entrega <ArrowRight size={15} /></a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:rounded-[2rem] sm:p-7 md:p-9">
              <div className="flex items-center gap-3"><MessageCircle className="text-[#ef7d18]" size={21} /><h2 className="text-lg font-black sm:text-2xl">Pedido e pagamento</h2></div>
              <p className="mt-2.5 text-xs leading-5 text-white/55 sm:mt-3 sm:text-sm sm:leading-7">Escolha seus produtos, confirme o pedido e finalize pelo WhatsApp. Receba em casa ou retire na Nutrifit.</p>
              <a href={whatsapp} onClick={() => trackClick("whatsapp_click", "como_pedir")} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black">Falar com a Nutrifit <MessageCircle size={15} /></a>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/10 p-4 sm:mt-7 sm:rounded-[2rem] sm:p-6 md:flex md:items-center md:justify-between md:gap-6">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#d8e7a0]">Pronto para começar?</div>
              <h2 className="mt-1 text-lg font-black sm:text-2xl">Monte seu pedido e fale com a Nutrifit.</h2>
              <p className="mt-1 text-xs leading-5 text-white/50 sm:text-sm">Escolha suas refeições, confira o total e finalize pelo WhatsApp.</p>
            </div>
            <a href="#cardapio" className="mt-3 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3 text-xs font-black text-black sm:mt-4 sm:w-auto md:mt-0">
              Ver cardápio <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
    
      {orderOpen && (
        <div className="fixed inset-0 z-[100]">
          <button type="button" aria-label="Fechar carrinho" onClick={() => setOrderOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#0b0e09] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b0e09]/95 px-4 py-3 backdrop-blur sm:px-7 sm:py-4">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Seu pedido</div>
                <h2 id="cart-title" className="mt-1 text-xl font-black sm:text-2xl">Carrinho <span className="text-white/40">• {orderCount}</span></h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setOrderOpen(false)} className="hidden rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-black text-white/75 sm:block">
                  Continuar comprando
                </button>
                <button type="button" onClick={() => setOrderOpen(false)} aria-label="Fechar carrinho" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-6 sm:px-7 sm:py-5">
              {!orderItems.length ? (
                <div className="grid min-h-[45vh] place-items-center text-center">
                  <div>
                    <ShoppingCart size={42} className="mx-auto text-[#a7b86a]" />
                    <h3 className="mt-4 text-xl font-black">Seu carrinho está vazio</h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/45">Escolha suas marmitas, saladas ou sucos e eles aparecerão aqui.</p>
                    <button type="button" onClick={() => { setOrderOpen(false); document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="mt-5 rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black">
                      Voltar ao cardápio
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <article key={item.name} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="break-words font-black leading-tight">{item.name}</h3>
                            <div className="mt-1 text-xs text-white/40">{item.line} • {item.weight} • {money(item.price)} cada</div>
                          </div>
                          <button type="button" onClick={() => removeOrderItem(item.name)} aria-label={`Remover ${item.name}`} className="shrink-0 rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => changeOrderQty(item.name, -1)} aria-label={`Diminuir ${item.name}`} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"><Minus size={15} /></button>
                            <span className="w-8 text-center font-black">{item.quantity}</span>
                            <button type="button" onClick={() => changeOrderQty(item.name, 1)} aria-label={`Aumentar ${item.name}`} className="grid h-10 w-10 place-items-center rounded-full bg-[#a7b86a] text-black"><Plus size={15} /></button>
                          </div>
                          <div className="text-lg font-black text-[#ef7d18]">{money(item.price * item.quantity)}</div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Seus dados</div>
                    <label className="text-xs font-bold text-white/55">Nome
                      <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs font-bold text-white/55">WhatsApp
                      <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value.replace(/[^0-9+()\- ]/g, ""))} inputMode="tel" autoComplete="tel" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
                    </label>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Entrega</div>
                        <div className="mt-1 text-sm text-white/45">{orderFreeDelivery ? "Frete grátis para 20 itens ou mais." : "Consulte a taxa pelo CEP."}</div>
                      </div>
                      <Truck size={21} className="shrink-0 text-[#a7b86a]" />
                    </div>
                    {!orderFreeDelivery && (
                      <>
                        <div className="mt-3 flex gap-2">
                          <input value={orderCep} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 8); setOrderCep(value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value); setOrderDelivery(null); setOrderDeliveryStatus("idle"); }} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-label="CEP para calcular a entrega" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#a7b86a]" />
                          <button type="button" onClick={() => void calculateOrderDelivery()} disabled={orderDeliveryStatus === "loading"} className="shrink-0 rounded-full bg-[#a7b86a] px-4 py-3 text-xs font-black text-black disabled:opacity-50">
                            {orderDeliveryStatus === "loading" ? "Calculando…" : "Calcular"}
                          </button>
                        </div>
                        {orderDelivery && <div className="mt-3 text-sm text-white/60">{orderDelivery.neighborhood} • {orderDelivery.zone} • <strong className="text-[#ef7d18]">{orderDelivery.fee === 0 ? "Grátis" : money(orderDelivery.fee)}</strong></div>}
                        {orderDeliveryStatus === "error" && <div className="mt-3 text-xs text-[#ef9b55]">CEP ou bairro não encontrado na área de entrega. Confira os dados ou fale com a Nutrifit.</div>}
                      </>
                    )}
                    {orderFreeDelivery && <div className="mt-3 text-sm font-black text-[#cbd99a]">🚚 Frete grátis aplicado automaticamente.</div>}
                  </div>

                  <label className="mt-4 block text-xs font-bold text-white/55">Observações do pedido
                    <textarea value={orderNotes} onChange={(event) => setOrderNotes(event.target.value)} rows={3} placeholder="Ex.: preferência de entrega ou observação para o pedido" className="mt-1.5 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#a7b86a]" />
                  </label>
                </>
              )}
            </div>

            {orderItems.length > 0 && (
              <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#080a07]/98 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-7">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-white/45">Subtotal</span><strong className="text-right">{money(orderSubtotal)}</strong>
                  <span className="text-white/45">Clube Nutrifit</span><strong className="text-right text-[#a7b86a]">-{money(orderDiscount)}</strong>
                  <span className="text-white/45">Frete</span><strong className="text-right">{orderDeliveryFee === 0 ? "Grátis" : money(orderDeliveryFee)}</strong>
                  <span className="border-t border-white/10 pt-2 font-black">Total</span><strong className="border-t border-white/10 pt-2 text-right text-xl text-[#ef7d18]">{money(orderGrandTotal)}</strong>
                </div>
                <button type="button" onClick={sendFullOrder} disabled={!canFinalizeOrder} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-30 sm:mt-4 sm:py-4">
                  Finalizar no WhatsApp <ArrowRight size={18} />
                </button>
                {!orderCustomerReady && <div className="mt-2 text-center text-xs text-[#ef9b55]">Informe nome e WhatsApp válido para finalizar.</div>}
                {orderCustomerReady && !orderDeliveryReady && <div className="mt-2 text-center text-xs text-[#ef9b55]">Calcule a entrega pelo CEP para continuar.</div>}
              </div>
            )}
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[110]">
          <button type="button" aria-label="Fechar busca" onClick={() => setSearchOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <section role="dialog" aria-modal="true" aria-label="Buscar produtos" className="absolute left-1/2 top-16 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0d100c] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4 sm:p-5">
              <Search size={21} className="shrink-0 text-[#a7b86a]" />
              <input autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Busque por prato ou suco..." aria-label="Buscar produtos" className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-white/30" />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fechar busca" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5"><X size={18} /></button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-3 sm:p-4">
              {searchTerm.trim() && !searchResults.length && <div className="p-6 text-center text-sm text-white/45">Nenhum produto encontrado.</div>}
              {!searchTerm.trim() && <div id="search-title" className="p-6 text-center text-sm text-white/40">Digite o nome de uma marmita, salada ou suco.</div>}
              <div className="grid gap-2">
                {searchResults.map((product) => (
                  <button key={product.name} type="button" onClick={() => openSearchResult(product)} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-left hover:border-[#a7b86a]/40">
                    <span className="min-w-0">
                      <span className="block break-words font-black">{product.name}</span>
                      <span className="mt-1 block text-xs text-white/40">{product.line} • {product.weight} • {product.price}</span>
                    </span>
                    <ArrowRight size={18} className="shrink-0 text-[#a7b86a]" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-[120]">
          <button type="button" aria-label="Fechar minha conta" onClick={() => setProfileOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <section role="dialog" aria-modal="true" aria-labelledby="profile-title" className="absolute left-1/2 top-1/2 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0d100c] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Clube Nutrifit</div>
                <h2 id="profile-title" className="mt-1 text-2xl font-black">Minha conta</h2>
              </div>
              <button type="button" onClick={() => setProfileOpen(false)} aria-label="Fechar minha conta" className="grid h-10 w-10 place-items-center rounded-full bg-white/5"><X size={18} /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
              <p className="text-sm leading-6 text-white/50">Cadastre seus dados para agilizar seus próximos pedidos e participar do Clube Nutrifit.</p>
              <div className="mt-5 grid gap-3">
                <label className="text-xs font-bold text-white/55">Nome completo
                  <input value={profileName} onChange={(event) => setProfileName(event.target.value)} autoComplete="name" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="text-xs font-bold text-white/55">WhatsApp
                  <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} inputMode="tel" autoComplete="tel" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="text-xs font-bold text-white/55">E-mail
                  <input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} autoComplete="email" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="text-xs font-bold text-white/55">Data de nascimento
                  <input type="date" value={profileBirthDate} onChange={(event) => setProfileBirthDate(event.target.value)} autoComplete="bday" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-xs leading-5 text-white/55">
                  <input type="checkbox" checked={profileMarketing} onChange={(event) => setProfileMarketing(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#a7b86a]" />
                  Quero receber novidades e ofertas da Nutrifit.
                </label>
              </div>

              {profileStatus === "exists" && <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">Este WhatsApp já está cadastrado no Clube Nutrifit.</div>}
              {profileStatus === "error" && <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">Não foi possível concluir o cadastro agora. Tente novamente.</div>}
              {profileStatus === "success" && <div className="mt-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4 text-sm text-[#d8e7a0]">Cadastro concluído. Seu benefício de boas-vindas foi aplicado.</div>}

              <button type="button" onClick={() => void saveProfile()} disabled={profileStatus === "saving" || !profileName.trim() || profilePhone.replace(/\D/g, "").length < 10} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black disabled:opacity-40">
                {profileStatus === "saving" ? <><Loader2 size={17} className="animate-spin" /> Salvando...</> : "Salvar cadastro"}
              </button>
            </div>
          </section>
        </div>
      )}


      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 md:px-8 md:py-9">
          <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-8 w-8 object-contain" />
                <div>
                  <div className="text-base font-black tracking-tight">NUTRIFIT</div>
                  <p className="mt-0.5 text-[10px] leading-4 text-white/40">Marmitas, saladas e sucos para sua rotina.</p>
                </div>
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-[11px] font-bold text-white/55 sm:flex sm:flex-wrap sm:gap-5">
              <a href="#cardapio" className="transition hover:text-white">Fit 350 g</a>
              <a href="#performance" className="transition hover:text-white">Performance</a>
              <a href="#saladas" className="transition hover:text-white">Saladas</a>
              <a href="#tradicional" className="transition hover:text-white">Tradicional</a>
              <a href="#sucos" className="transition hover:text-white">Sucos</a>
              <a href="#combos" className="transition hover:text-white">Combos</a>
              <a href="#como-pedir" className="transition hover:text-white">Como pedir</a>
            </nav>
            <a href={whatsapp} onClick={() => trackClick("whatsapp_click", "footer")} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#a7b86a] px-5 py-3 text-xs font-black text-black shadow-lg">
              Falar no WhatsApp <MessageCircle size={15} className="ml-2" />
            </a>
          </div>
          <div className="mt-7 flex flex-col gap-2 border-t border-white/5 pt-4 text-center text-[10px] text-white/25 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <span>Nutrifit • Juiz de Fora/MG</span>
            <span>Escolha sua linha • monte seu pedido • receba com praticidade.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}