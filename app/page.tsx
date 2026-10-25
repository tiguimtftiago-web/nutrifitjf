"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { ArrowRight, Check, MessageCircle, ShoppingBag, MapPin, Truck, Building2, HelpCircle, Plus, Minus, RotateCcw, Loader2, Search, UserRound, ShoppingCart, ChevronDown, ChevronUp, X, Apple, Dumbbell, ClipboardCheck, ChefHat, Stethoscope, Leaf, HeartPulse, FlaskConical } from "lucide-react";

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
  if (typeof window !== "undefined" && event !== "site_visit") {
    void fetch(SUPABASE_URL + "/rest/v1/acquisition_events", {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      keepalive: true,
      body: JSON.stringify({
        event,
        source,
        page: window.location.pathname,
        metadata: {
          campaign: window.localStorage.getItem("nutrifit_acquisition_campaign") || null,
          medium: window.localStorage.getItem("nutrifit_acquisition_medium") || null,
          content: window.localStorage.getItem("nutrifit_acquisition_content") || null,
        },
      }),
    }).catch(() => {});
  }
};

const getAcquisitionData = () => {
  if (typeof window === "undefined") return { source: "direct", campaign: "", medium: "", content: "" };
  const params = new URLSearchParams(window.location.search);
  const explicitSource = params.get("utm_source") || params.get("source") || "";
  const referrer = document.referrer.toLowerCase();
  const source = (explicitSource || (
    referrer.includes("instagram.com") ? "instagram" :
    referrer.includes("facebook.com") || referrer.includes("fb.com") ? "facebook" :
    referrer.includes("tiktok.com") ? "tiktok" :
    referrer.includes("google.") ? "google" : "direct"
  )).toLowerCase();
  return {
    source,
    campaign: (params.get("utm_campaign") || "").trim(),
    medium: (params.get("utm_medium") || "").trim(),
    content: (params.get("utm_content") || "").trim(),
  };
};
const getAcquisitionSource = () => getAcquisitionData().source;

type Product = {
  name: string;
  line: string;
  weight: string;
  price: string;
  description: string;
  image: string;
  crop?: string;
  comingSoon?: boolean;
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
  ["Tilápia Fit com Arroz Branco e Legumes","FIT","350 g","R$ 27,90","Tilápia grelhada acompanhada de arroz branco, brócolis, couve-flor e cenoura."],
].map(([name,line,weight,price,description], i) => ({
  name,line,weight,price,description,
  image: ["/images/page-4.jpg","/images/page-9.jpg","/images/page-10.jpg","/images/page-6.jpg","/images/page-5.jpg","/images/page-7.jpg","/images/page-8.jpg","/images/tilapia-fit-350-web.jpg"][i],
  crop: i === 7 ? "100% center" : undefined
}));

const fitComingSoon: Product[] = [
  { name: "Pernil Acebolado com Batata Inglesa", line: "FIT", weight: "350 g", price: "R$ 23,97", description: "Pernil suíno acebolado acompanhado de batata inglesa.", image: "/images/pernil_acebolado_batata_real.jpg", comingSoon: false },
  { name: "Frango com Purê de Batata Inglesa", line: "FIT", weight: "350 g", price: "R$ 23,97", description: "Frango grelhado acompanhado de purê cremoso de batata inglesa.", image: "/images/nutrifit-fit-350-frango-com-pure-de-batata-inglesa.png", comingSoon: false },
  { name: "Frango ao Molho de Mostarda com Batata", line: "FIT", weight: "350 g", price: "R$ 23,97", description: "Frango ao molho de mostarda acompanhado de batata inglesa.", image: "/images/frangomostarda.png", comingSoon: false },
  { name: "Escondidinho de Patinho Fit", line: "FIT", weight: "350 g", price: "R$ 23,97", description: "Patinho moído com purê de batata em uma versão fit.", image: "/images/escondidinho-fit-frango-real.jpg", comingSoon: false },
  { name: "Frango Empanado Assado com Arroz Integral", line: "FIT", weight: "350 g", price: "R$ 23,97", description: "Frango empanado e assado acompanhado de arroz integral.", image: "/images/frango-empanado-arroz-com-ervilha-e-cenoura.jpg", comingSoon: false },
  { name: "Pernil Desfiado ao Molho com Arroz Integral", line: "FIT", weight: "350 g", price: "R$ 23,97", description: "Pernil suíno desfiado ao molho acompanhado de arroz integral.", image: "/images/pernil-desfiado-molho-arroz-integral-cenoura.jpg", comingSoon: false },
];

fit.push(...fitComingSoon);

const performance: Product[] = [
  ["Chicken Parmesão","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, molho de tomate artesanal, queijo parmesão, arroz integral e legumes."],
  ["Tilápia Power","PERFORMANCE","450 g","R$ 32,90","Tilápia grelhada, arroz integral, batata-doce assada e legumes."],
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
  ["Feijoada","TRADICIONAL","500 g","R$ 26,90","Feijão cremoso, calabresa, lombo suíno, arroz branco, couve e farofa crocante."],
  ["Frango Cremoso","TRADICIONAL","500 g","R$ 26,90","Frango em molho cremoso especial, arroz branco soltinho e legumes na manteiga."],
  ["Churrasco Mineiro","TRADICIONAL","500 g","R$ 29,90","Contra-filé grelhado, vinagrete fresco, arroz branco soltinho e farofa caseira."],
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
  ["Tradicional 500 g","5 marmitas","R$ 141,90","R$ 28,38/un"],
  ["Tradicional 500 g","7 marmitas","R$ 196,90","R$ 28,13/un"],
  ["Tradicional 500 g","10 marmitas","R$ 278,00","R$ 27,80/un"],
  ["Tradicional 500 g","14 marmitas","R$ 383,90","R$ 27,42/un"],
  ["Tradicional 500 g","20 marmitas","R$ 538,00","R$ 26,90/un"],
  ["Tradicional 500 g","30 marmitas","R$ 792,00","R$ 26,40/un"],
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

const juiceFlavors: Array<{ name: string; image: string; description: string; ingredients: string[]; highlights: string[]; line: string }> = [
  { name: "Suco de Laranja", image: "/images/page-42.jpg", description: "Clássico cítrico, com sabor fresco de laranja natural.", ingredients: ["Laranja natural"], highlights: ["Sabor cítrico", "Feito com fruta", "Refrescante"], line: "SUCOS" },
  { name: "Green", image: "/images/page-37.jpg", description: "Maçã, pepino, limão, gengibre e hortelã em uma combinação cítrica e herbal.", ingredients: ["Maçã", "Pepino", "Limão", "Gengibre", "Hortelã", "Água"], highlights: ["Notas cítricas", "Toque de hortelã", "Perfil refrescante"], line: "SUCOS" },
  { name: "Abacaxi com Hortelã", image: "/images/page-44.jpg", description: "Abacaxi com um toque herbal e refrescante de hortelã.", ingredients: ["Abacaxi", "Hortelã", "Água"], highlights: ["Sabor tropical", "Toque herbal", "Refrescante"], line: "SUCOS" },
  { name: "Energy", image: "/images/page-36.jpg", description: "Beterraba, laranja, maçã e limão em um perfil frutado e cítrico.", ingredients: ["Beterraba", "Laranja", "Maçã", "Limão"], highlights: ["Frutado e cítrico", "Mistura de frutas", "Cor intensa"], line: "SUCOS" },
  { name: "Purple", image: "/images/page-40.jpg", description: "Uva, morango, maçã e limão em uma combinação frutada e vibrante.", ingredients: ["Uva", "Morango", "Maçã", "Limão"], highlights: ["Sabor marcante", "Notas frutadas", "Cor intensa"], line: "SUCOS" },
  { name: "Glow", image: "/images/page-41.jpg", description: "Laranja, limão, gengibre e cúrcuma em um perfil cítrico e aromático.", ingredients: ["Laranja", "Limão", "Gengibre", "Cúrcuma"], highlights: ["Cítrico e aromático", "Gengibre e cúrcuma", "Sabor vibrante"], line: "SUCOS" },
  { name: "Pink", image: "/images/page-38.jpg", description: "Morango, beterraba, laranja e limão em uma combinação frutada e cítrica.", ingredients: ["Morango", "Beterraba", "Laranja", "Limão"], highlights: ["Sabor frutado", "Toque cítrico", "Cor rosada intensa"], line: "SUCOS" },
  { name: "Sun", image: "/images/page-39.jpg", description: "Abacaxi, maracujá, laranja e gengibre em uma mistura tropical e aromática.", ingredients: ["Abacaxi", "Maracujá", "Laranja", "Gengibre"], highlights: ["Tropical e aromático", "Acidez agradável", "Gengibre suave"], line: "SUCOS" },
  { name: "Laranja com Acerola", image: "/images/page-43.jpg", description: "Duas frutas cítricas em uma combinação de sabor intenso e fresco.", ingredients: ["Laranja", "Acerola", "Água"], highlights: ["Sabor cítrico", "Duas frutas", "Refrescante"], line: "SUCOS" },
];

function getJuicePrice(_flavorName: string, size: "300 ml" | "500 ml"): string {
  return size === "500 ml" ? "R$ 12,90" : "R$ 9,90";
}

function getJuicePriceNumber(_flavorName: string, size: "300 ml" | "500 ml"): number {
  return size === "500 ml" ? 12.90 : 9.90;
}

const juiceProducts: Product[] = juiceFlavors.flatMap((flavor) => [
  {
    name: `${flavor.name} — 500 ml`,
    line: flavor.line,
    weight: "500 ml",
    price: getJuicePrice(flavor.name, "500 ml"),
    description: flavor.description,
    image: flavor.image,
  },
  {
    name: `${flavor.name} — 300 ml`,
    line: flavor.line,
    weight: "300 ml",
    price: getJuicePrice(flavor.name, "300 ml"),
    description: flavor.description,
    image: flavor.image,
  },
]);

const juiceIngredientNotes: Record<string, string> = {
  "Laranja": "Fornece carboidratos e pode contribuir com vitamina C; o teor depende da fruta e do preparo.",
  "Laranja natural": "Fornece carboidratos e pode contribuir com vitamina C; o teor depende da fruta e do preparo.",
  "Acerola": "Fruta conhecida pelo teor de vitamina C; a quantidade final depende da matéria-prima e da receita.",
  "Limão": "Acrescenta acidez e pode contribuir com vitamina C.",
  "Maçã": "Fornece carboidratos; parte das fibras é mantida quando a polpa não é descartada.",
  "Pepino": "Tem alto teor de água e contribui para o perfil leve e refrescante.",
  "Gengibre": "Acrescenta aroma e sabor característico; sua presença não comprova efeito terapêutico.",
  "Cúrcuma": "Acrescenta cor e compostos vegetais; não deve ser apresentada como tratamento.",
  "Hortelã": "Acrescenta aroma herbal e frescor.",
  "Água": "Ajusta a diluição e o volume final da bebida.",
  "Abacaxi": "Fornece carboidratos e pode contribuir com vitamina C.",
  "Beterraba": "Contribui com carboidratos, folato e pigmentos naturais.",
  "Uva": "Fornece carboidratos e compostos vegetais naturais.",
  "Morango": "Pode contribuir com vitamina C e outros compostos vegetais.",
  "Cenoura": "Contém carotenoides, incluindo beta-caroteno.",
  "Maracujá": "Acrescenta aroma e acidez; a contribuição de fibras depende do processamento."
};

type JuiceRecipeLine = { ingredient: string; quantity: string };
type JuiceNutritionEstimate = { kcal: number; carbs: number; protein: number; fat: number; fiber: number };
type JuiceRecipeInfo = { recipe: JuiceRecipeLine[]; waterNote: string; estimate500: JuiceNutritionEstimate; highlights: string[]; profile: string };

const juiceRecipeData: Record<string, JuiceRecipeInfo> = {
  "Suco de Laranja": {
    recipe: [{ ingredient: "Suco de laranja natural", quantity: "500 ml" }],
    waterNote: "Sem adição de açúcar na formulação-base.",
    estimate500: { kcal: 185, carbs: 42.5, protein: 3.5, fat: 0.5, fiber: 1.0 },
    highlights: ["Carboidratos naturalmente presentes", "Pode contribuir com vitamina C"],
    profile: "Bebida cítrica feita com suco de laranja natural."
  },
  "Green": {
    recipe: [{ ingredient: "Maçã com casca, sem sementes", quantity: "150 g" }, { ingredient: "Pepino com casca", quantity: "100 g" }, { ingredient: "Suco de limão Tahiti", quantity: "20 ml" }, { ingredient: "Gengibre fresco", quantity: "2 g" }, { ingredient: "Hortelã", quantity: "4 g" }, { ingredient: "Água filtrada", quantity: "aprox. 300 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 102, carbs: 27.1, protein: 1.4, fat: 0.2, fiber: 3.3 },
    highlights: ["Perfil leve e refrescante", "Carboidratos provenientes principalmente da maçã"],
    profile: "Maçã como base, com limão, pepino, hortelã e gengibre em segundo plano."
  },
  "Abacaxi com Hortelã": {
    recipe: [{ ingredient: "Abacaxi", quantity: "250 g" }, { ingredient: "Hortelã", quantity: "5 g" }, { ingredient: "Água filtrada", quantity: "aprox. 245 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 125, carbs: 29.4, protein: 1.9, fat: 0.3, fiber: 2.8 },
    highlights: ["Perfil tropical", "Carboidratos naturalmente presentes no abacaxi"],
    profile: "Abacaxi com um toque herbal de hortelã."
  },
  "Energy": {
    recipe: [{ ingredient: "Laranja descascada, sem sementes", quantity: "220 g" }, { ingredient: "Maçã com casca, sem sementes", quantity: "120 g" }, { ingredient: "Beterraba crua", quantity: "45 g" }, { ingredient: "Suco de limão Tahiti", quantity: "15 ml" }, { ingredient: "Água filtrada", quantity: "aprox. 260 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 173, carbs: 43.8, protein: 3.3, fat: 0.3, fiber: 4.9 },
    highlights: ["Combinação frutada e cítrica", "Beterraba contribui com folato"],
    profile: "Laranja e maçã dão base frutada; a beterraba fica moderada."
  },
  "Purple": {
    recipe: [{ ingredient: "Uva sem sementes", quantity: "160 g" }, { ingredient: "Morango", quantity: "90 g" }, { ingredient: "Maçã com casca, sem sementes", quantity: "120 g" }, { ingredient: "Suco de limão Tahiti", quantity: "15 ml" }, { ingredient: "Água filtrada", quantity: "aprox. 230 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 182, carbs: 47.2, protein: 2.3, fat: 0.6, fiber: 4.6 },
    highlights: ["Perfil frutado", "Carboidratos provenientes principalmente das frutas"],
    profile: "Uva e maçã dão corpo e doçura natural; o limão realça o sabor."
  },
  "Glow": {
    recipe: [{ ingredient: "Laranja descascada, sem sementes", quantity: "300 g" }, { ingredient: "Suco de limão Tahiti", quantity: "15 ml" }, { ingredient: "Gengibre fresco", quantity: "2 g" }, { ingredient: "Cúrcuma fresca", quantity: "3 g" }, { ingredient: "Água filtrada", quantity: "aprox. 230 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 118, carbs: 28.5, protein: 2.8, fat: 0.4, fiber: 2.5 },
    highlights: ["Perfil cítrico e aromático", "Gengibre e cúrcuma usados como ingredientes de sabor"],
    profile: "Laranja com limão, gengibre e cúrcuma em segundo plano."
  },
  "Pink": {
    recipe: [{ ingredient: "Morango", quantity: "120 g" }, { ingredient: "Laranja descascada, sem sementes", quantity: "220 g" }, { ingredient: "Beterraba crua", quantity: "35 g" }, { ingredient: "Suco de limão Tahiti", quantity: "15 ml" }, { ingredient: "Água filtrada", quantity: "aprox. 250 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 137, carbs: 32.7, protein: 3.8, fat: 0.6, fiber: 5.0 },
    highlights: ["Morango e laranja em destaque", "Beterraba contribui com pigmentos naturais"],
    profile: "Frutado e cítrico, com a beterraba em quantidade moderada."
  },
  "Sun": {
    recipe: [{ ingredient: "Abacaxi", quantity: "170 g" }, { ingredient: "Laranja descascada, sem sementes", quantity: "160 g" }, { ingredient: "Polpa de maracujá", quantity: "35 g" }, { ingredient: "Gengibre fresco", quantity: "2 g" }, { ingredient: "Água filtrada", quantity: "aprox. 220 ml; completar até 500 ml" }],
    waterNote: "Estimativa calculada considerando a polpa mantida, sem coar e sem açúcar adicionado.",
    estimate500: { kcal: 168, carbs: 38.6, protein: 3.3, fat: 1.1, fiber: 3.4 },
    highlights: ["Perfil tropical e aromático", "Acidez proveniente das frutas"],
    profile: "Abacaxi e laranja sustentam o sabor; maracujá e gengibre dão aroma."
  },
  "Laranja com Acerola": {
    recipe: [{ ingredient: "Suco de laranja natural", quantity: "350 ml" }, { ingredient: "Acerola", quantity: "120 g" }, { ingredient: "Água filtrada", quantity: "aprox. 50 ml; ajustar ao volume final" }],
    waterNote: "Estimativa calculada a partir da formulação-base; validar volume final e se a polpa é coada.",
    estimate500: { kcal: 169, carbs: 39.4, protein: 3.5, fat: 0.6, fiber: 2.5 },
    highlights: ["Combinação de frutas cítricas", "A acerola é conhecida pelo teor de vitamina C"],
    profile: "Laranja e acerola com sabor cítrico intenso."
  }
};

function JuiceNutritionDetails({ flavor, compact = false }: {
  flavor: { name: string; ingredients: string[]; description: string; highlights: string[] };
  compact?: boolean;
}) {
  const data = juiceRecipeData[flavor.name];
  const nutrients = [
    { label: "Energia", unit: "kcal", value: data?.estimate500.kcal ?? 0 },
    { label: "Carboidratos", unit: "g", value: data?.estimate500.carbs ?? 0 },
    { label: "Proteínas", unit: "g", value: data?.estimate500.protein ?? 0 },
    { label: "Gorduras totais", unit: "g", value: data?.estimate500.fat ?? 0 },
    { label: "Fibras alimentares", unit: "g", value: data?.estimate500.fiber ?? 0 }
  ];
  const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <details className={`group rounded-xl border border-[#a7b86a]/25 bg-black/55 ${compact ? "mt-2" : "mt-3"}`}>
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[.04] ${compact ? "text-[10px]" : "text-xs"}`}>
        <span className="min-w-0">
          <span className="block font-black text-white">Ingredientes e perfil nutricional</span>
          <span className="mt-0.5 block text-[10px] font-medium text-[#a7b86a]">Receita-base de {flavor.name}</span>
        </span>
        <span className="shrink-0 text-lg font-bold text-[#ef7d18] transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="max-h-[46vh] touch-pan-y space-y-3 overflow-y-auto overscroll-contain border-t border-white/10 px-3 py-3 [scrollbar-color:#a7b86a_#111] [scrollbar-width:thin]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#ef7d18]">Estimativa nutricional preliminar</p>
          <p className="mt-1 text-[10px] leading-4 text-white/65">Valores estimados a partir de composição média dos ingredientes da receita-base, por rendimento de 500 ml, sem açúcar adicionado e assumindo que a polpa não é coada. Não são laudo laboratorial nem tabela nutricional legal validada.</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-white/[.07] px-2.5 py-2 text-[9px] font-black uppercase text-white/75"><span>Nutriente</span><span className="text-right">300 ml</span><span className="text-right">500 ml</span></div>
            {nutrients.map((nutrient,index)=>(
              <div key={nutrient.label} className={`grid grid-cols-[1fr_auto_auto] gap-2 px-2.5 py-2 text-[10px] ${index % 2 === 0 ? "bg-white/[.04]" : "bg-transparent"}`}>
                <span className="text-white/85">{nutrient.label}</span>
                <span className="text-right font-bold text-[#a7b86a]">{fmt(nutrient.value*0.6)} {nutrient.unit}</span>
                <span className="text-right font-bold text-[#a7b86a]">{fmt(nutrient.value)} {nutrient.unit}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-4 text-white/60">{data?.waterNote || "Formulação-base a validar."} Açúcares totais, sódio, micronutrientes e valores finais devem ser confirmados com a receita efetivamente produzida antes de uso em rotulagem oficial.</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a7b86a]">Ingredientes por receita-base de 500 ml</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
            {(data?.recipe || flavor.ingredients.map(ingredient => ({ingredient,quantity:"Quantidade a confirmar"}))).map((line,index)=>(
              <div key={line.ingredient} className={`grid grid-cols-[1fr_auto] gap-3 px-2.5 py-2 text-[10px] ${index % 2 === 0 ? "bg-white/[.04]" : "bg-transparent"}`}>
                <span className="text-white/85">{line.ingredient}</span><span className="text-right font-bold text-[#a7b86a]">{line.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a7b86a]">Características dos ingredientes</p>
          <div className="mt-2 divide-y divide-white/10">
            {flavor.ingredients.map((ingredient) => (
              <div key={ingredient} className="grid grid-cols-[minmax(84px,.7fr)_1.3fr] gap-3 py-2 text-[11px] leading-4">
                <span className="font-bold text-white">{ingredient}</span>
                <span className="text-white/70">{juiceIngredientNotes[ingredient] || "Contribui para o sabor e a composição da bebida; a contribuição nutricional depende da quantidade utilizada."}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#ef7d18]">Perfil do sabor</p>
          <p className="mt-1 text-[11px] leading-4 text-white/80">{data?.profile || flavor.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{(data?.highlights || flavor.highlights).map(highlight=><span key={highlight} className="rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-2 py-1 text-[9px] font-semibold text-white/90">{highlight}</span>)}</div>
        </div>
        <p className="text-[10px] leading-4 text-white/50">Estas informações descrevem ingredientes e composição alimentar; não prometem prevenção, tratamento ou cura de doenças. Os dados variam conforme a matéria-prima e o preparo. Fonte de referência para estimativas: TBCA/USP; validar a receita e a rotulagem com profissional responsável antes de divulgar como informação oficial.</p>
      </div>
    </details>
  );
}

function JuiceFlavorCard({
  flavor,
  onAdd,
}: {
  flavor: { name: string; image: string; description: string; ingredients: string[]; highlights: string[]; line: string };
  onAdd: (product: Product) => void;
}) {
  const [size, setSize] = useState<"500 ml" | "300 ml">("500 ml");
  const price = getJuicePrice(flavor.name, size);
  const product: Product = {
    name: `${flavor.name} — ${size}`,
    line: flavor.line,
    weight: size,
    price,
    description: flavor.description,
    image: flavor.image,
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div className="aspect-[4/3] overflow-hidden bg-black">
        <img src={flavor.image} alt={`Suco Nutrifit ${flavor.name}`} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
      </div>
      <div className="p-4">
        <h3 className="font-black">{flavor.name}</h3>
        <p className="mt-1 text-xs text-white/45">{flavor.description}</p>
        <JuiceNutritionDetails flavor={flavor} />
        <div className="mt-4 grid grid-cols-2 gap-2" aria-label={`Escolha o tamanho do suco ${flavor.name}`}>
          {([
            { value: "500 ml" as const, price: getJuicePrice(flavor.name, "500 ml") },
            { value: "300 ml" as const, price: getJuicePrice(flavor.name, "300 ml") },
          ]).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={size === option.value}
              onClick={() => setSize(option.value)}
              className={`rounded-xl border px-3 py-3 text-left transition ${size === option.value ? "border-[#ef7d18] bg-[#ef7d18]/15" : "border-white/10 bg-white/[.03]"}`}
            >
              <span className="block text-sm font-black">{option.value}</span>
              <span className={`mt-1 block text-sm font-black ${size === option.value ? "text-[#ef7d18]" : "text-white/70"}`}>{option.price}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onAdd(product)} className="mt-3 w-full rounded-full bg-[#ef7d18] px-4 py-3 font-black text-black transition hover:bg-orange-400">
          Adicionar {size} ao carrinho
        </button>
      </div>
    </article>
  );
}

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
  { name: "Energy — 500 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 12.90, image: "/images/page-36.jpg", emoji: "🥤" },
  { name: "Energy — 300 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 9.90, image: "/images/page-36.jpg", emoji: "🥤" },
  { name: "Green — 500 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 12.90, image: "/images/page-37.jpg", emoji: "🥤" },
  { name: "Green — 300 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 9.90, image: "/images/page-37.jpg", emoji: "🥤" },
  { name: "Pink — 500 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 12.90, image: "/images/page-38.jpg", emoji: "🥤" },
  { name: "Pink — 300 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 9.90, image: "/images/page-38.jpg", emoji: "🥤" },
  { name: "Sun — 500 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 12.90, image: "/images/page-39.jpg", emoji: "🥤" },
  { name: "Sun — 300 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 9.90, image: "/images/page-39.jpg", emoji: "🥤" },
  { name: "Purple — 500 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 12.90, image: "/images/page-40.jpg", emoji: "🥤" },
  { name: "Purple — 300 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 9.90, image: "/images/page-40.jpg", emoji: "🥤" },
  { name: "Glow — 500 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 12.90, image: "/images/page-41.jpg", emoji: "🥤" },
  { name: "Glow — 300 ml", category: "SUCOS", description: "Suco funcional Nutrifit.", price: 9.90, image: "/images/page-41.jpg", emoji: "🥤" },
  { name: "Frango com Alface e Tomate", category: "SANDUÍCHES", description: "Pão integral, frango, alface e tomate.", price: 12.90, image: "/images/sanduiche-frango-nutrifit.jpg", emoji: "🥪" },
  { name: "Carne Desfiada com Alface e Tomate", category: "SANDUÍCHES", description: "Pão integral, carne desfiada, alface e tomate.", price: 13.90, image: "/images/sanduiche-carne-desfiada-nutrifit.jpg", emoji: "🥪" },
  { name: "Sanduíche Natural de Atum", category: "SANDUÍCHES", description: "Pão integral, atum, tomate, alface, cebola roxa e alho-poró.", price: 13.90, image: "/images/804546E5-062D-4FAA-8114-94DF7B66A18D.png", emoji: "🥪" },
  { name: "Mamão", category: "FRUTAS", description: "Mamão fresco em pedaços.", price: 8.90, image: "/images/mamao.jpg", emoji: "🍊" },
  { name: "Manga", category: "FRUTAS", description: "Manga fresca em pedaços.", price: 8.90, image: "/images/manga.jpg", emoji: "🥭" },
  { name: "Abacaxi", category: "FRUTAS", description: "Abacaxi fresco em pedaços.", price: 8.90, image: "/images/abacaxi.jpg", emoji: "🍍" },
  { name: "Melancia", category: "FRUTAS", description: "Melancia fresca em pedaços.", price: 7.90, image: "/images/melancia.jpg", emoji: "🍉" },
  { name: "Melão", category: "FRUTAS", description: "Melão fresco em pedaços.", price: 8.90, image: "/images/melao.jpg", emoji: "🍈" },
  { name: "Morango", category: "FRUTAS", description: "Morangos frescos.", price: 9.90, image: "/images/morango.jpg", emoji: "🍓" },
  { name: "Uva Verde", category: "FRUTAS", description: "Uva verde fresca sem sementes.", price: 9.90, image: "/images/uva-verde.jpg", emoji: "🍇" },
];


const traditionalComplements: Product[] = [
  { name: "Arroz Branco", line: "COMPLEMENTOS", weight: "200 g", price: "R$ 5,00", description: "Arroz branco soltinho para completar sua refeição.", image: "" },
  { name: "Feijão", line: "COMPLEMENTOS", weight: "200 g", price: "R$ 5,00", description: "Feijão caseiro, preparado para o dia a dia.", image: "" },
  { name: "Farofa", line: "COMPLEMENTOS", weight: "100 g", price: "R$ 4,00", description: "Farofa para dar aquele toque final à refeição.", image: "" },
  { name: "Purê de Batata", line: "COMPLEMENTOS", weight: "200 g", price: "R$ 5,00", description: "Purê cremoso de batata inglesa.", image: "" },
  { name: "Macarrão", line: "COMPLEMENTOS", weight: "200 g", price: "R$ 5,00", description: "Macarrão preparado como acompanhamento.", image: "" },
  { name: "Couve Refogada", line: "COMPLEMENTOS", weight: "150 g", price: "R$ 4,00", description: "Couve refogada como acompanhamento.", image: "" },
  { name: "Porção de Carne", line: "COMPLEMENTOS", weight: "100 g", price: "R$ 9,90", description: "Porção extra de carne, conforme a disponibilidade do dia.", image: "" },
];

const DELIVERY_FREE_FROM = 20;

function formatCepInput(raw:string){
  const digits=raw.replace(/\D/g,"").slice(0,8);
  return digits.length>5?digits.slice(0,5)+"-"+digits.slice(5):digits;
}

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
  { line: "TRADICIONAL", weight: "500 g", products: traditional, prices: { 5: "R$ 141,90", 7: "R$ 196,90", 10: "R$ 278,00", 14: "R$ 383,90", 20: "R$ 538,00" } },
] as const;

const monthlyPlanOptions = [
  { line: "FIT", weight: "350 g", products: fit, prices: { 30: "R$ 688,50", 60: "R$ 1.377,00" } },
  { line: "PERFORMANCE", weight: "450 g", products: performance, prices: { 30: "R$ 810,00", 60: "R$ 1.620,00" } },
  { line: "TRADICIONAL", weight: "500 g", products: traditional, prices: { 30: "R$ 792,00", 60: "R$ 1.584,00" } },
] as const;

function MonthlyPlanBuilder({ onAddPlan }: { onAddPlan: (items: OrderItem[]) => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [quantity, setQuantity] = useState<30 | 60>(30);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [planOpen, setPlanOpen] = useState(false);
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
    <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#a7b86a]/25 bg-[#0d110c]">
      <button type="button" onClick={() => setPlanOpen((open) => !open)} aria-expanded={planOpen} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[.025] sm:p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ef7d18]/12 text-lg">📦</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Plano mensal</span>
          <span className="mt-1 block text-base font-black sm:text-lg">{quantity} marmitas • {itemLineLabel(option.line)}</span>
          <span className="mt-0.5 block text-xs text-white/45">{total}/{quantity} escolhidas • toque para {planOpen ? "fechar" : "montar seu plano"}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-lg font-black text-[#ef7d18]">{money(totalPrice)}</span>
          <span className="mt-1 block text-xl leading-none text-[#a7b86a]">{planOpen ? "⌃" : "⌄"}</span>
        </span>
      </button>

      {planOpen && (
        <div className="border-t border-white/10 p-4 sm:p-6">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[.02] p-4">
            <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">Seu plano</div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div>
                <div className="text-base font-black">{quantity} marmitas • {itemLineLabel(option.line)}</div>
                <div className="mt-1 text-xs text-white/45">{money(unitPrice)} por marmita</div>
              </div>
              <div className="text-right text-lg font-black text-[#ef7d18]">{money(totalPrice)}</div>
            </div>
          </div>

          <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Quantidade</div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {[30, 60].map((value) => (
              <button key={value} type="button" onClick={() => changeQuantity(value as 30 | 60)} className={`rounded-2xl border px-4 py-3 text-left transition ${quantity === value ? "border-[#a7b86a] bg-[#a7b86a]/15" : "border-white/10 bg-white/[.025]"}`}>
                <span className={`block text-base font-black ${quantity === value ? "text-[#cbd99a]" : "text-white/75"}`}>{value} marmitas</span>
                <span className="mt-1 block text-xs text-white/45">{value === 30 ? "1 refeição/dia" : "almoço + jantar"}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Linha</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {monthlyPlanOptions.map((item, index) => (
              <button key={item.line} type="button" onClick={() => changeLine(index)} className={`min-w-0 rounded-2xl border px-2 py-3 text-center transition ${lineIndex === index ? "border-[#a7b86a] bg-[#a7b86a]/15 text-[#cbd99a]" : "border-white/10 bg-white/[.025] text-white/65"}`}>
                <span className="block whitespace-nowrap text-[10px] font-black sm:text-xs">{item.line}</span>
                <span className="mt-1 block text-[10px] text-white/40">{item.weight}</span>
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setFlavorsOpen((open) => !open)} aria-expanded={flavorsOpen} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-[#a7b86a]/35 bg-[#11160e] p-4 text-left transition hover:border-[#a7b86a]/60">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ef7d18]/15 text-lg">🍱</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-black">Escolher meus sabores</span>
              <span className="mt-1 block text-xs text-white/45">{flavorsOpen ? "Escolha quantas unidades quiser de cada sabor." : `Selecione as ${quantity} marmitas do seu plano.`}</span>
            </span>
            <span className="text-2xl text-[#ef7d18]">{flavorsOpen ? "⌃" : "›"}</span>
          </button>

          {flavorsOpen && (
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {option.products.map((product) => (
                <div key={product.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-2.5 sm:block sm:p-3">
                  <img src={product.image} alt={product.name} className={`h-16 w-16 shrink-0 rounded-xl sm:mb-2 sm:h-24 sm:w-full ${product.line === "FIT" && product.name === "Tilápia Fit com Arroz Branco e Legumes" ? "object-contain object-center" : "object-cover"}`} loading="eager" decoding="async" fetchPriority="high" />
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

          <div className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="text-lg font-black">{quantity} marmitas</div>
              <div className="mt-1 text-3xl font-black tracking-tight text-[#ef7d18]">{money(totalPrice)}</div>
              <div className="mt-1 text-xs text-white/50">{money(unitPrice)} por marmita</div>
              <div className="mt-1 text-sm font-bold text-[#a7b86a]">✓ Frete grátis</div>
            </div>
            <div className="space-y-1 text-xs text-white/60">
              <div>✓ Mais praticidade</div>
              <div>✓ Alimentação equilibrada</div>
              <div>✓ Economia no mês</div>
              <div>✓ Sabores variados</div>
            </div>
          </div>

          <div className="mt-5">
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
      )}
    </div>
  );
}

function ComboBuilder({ initialLine = 0, initialQuantity = 5, initialStep = 1, autoScroll = true }: { initialLine?: number; initialQuantity?: number; initialStep?: 1 | 2 | 3 | 4 | 5; autoScroll?: boolean }) {
  const [lineIndex, setLineIndex] = useState(initialLine);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [customQuantity, setCustomQuantity] = useState("31");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const [cep, setCep] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [deliveryComplement, setDeliveryComplement] = useState("");
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryReference, setDeliveryReference] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "error">("idle");
  const orderSubmitLock = useRef(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(initialStep);
  const [selectedComplements, setSelectedComplements] = useState<Record<string, number>>({});
  const [complementCategory, setComplementCategory] = useState<"SUCOS" | "SANDUÍCHES" | "FRUTAS" | null>(null);
  const option = comboOptions[lineIndex];
  const total = Object.values(selected).reduce((sum, value) => sum + value, 0);
  const price = option.line === "TRADICIONAL" && quantity >= 30
    ? money(792 + Math.max(0, quantity - 30) * 26.4)
    : (option.prices as Record<number, string>)[quantity];
  const subtotal = parseMoney(price);
  const tilapiaSurchargePerUnit = (productName: string) => option.line === "FIT" && productName === "Tilápia Fit com Arroz Branco e Legumes" ? 6 : 0;
  const premiumExtra = option.products.reduce((sum, product) => sum + tilapiaSurchargePerUnit(product.name) * (selected[product.name] || 0), 0);
  const comboTotal = subtotal + premiumExtra;
  const deliveryFee = quantity >= DELIVERY_FREE_FROM ? 0 : delivery?.fee ?? 0;
  const complementItems = comboComplements.filter((item) => selectedComplements[item.name]);
  const complementTotal = complementItems.reduce((sum, item) => sum + (item.price ?? 0) * (selectedComplements[item.name] || 0), 0);
  const grandTotal = comboTotal + deliveryFee + complementTotal;

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

  const changeQuantity = (value: number) => {
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
    setDeliveryStreet("");
    setDeliveryNumber("");
    setDeliveryComplement("");
    setDeliveryNeighborhood("");
    setDeliveryCity("");
    setDeliveryState("");
    setDeliveryReference("");
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

      setDeliveryStreet(data.logradouro || "");
      setDeliveryNeighborhood(data.bairro || "");
      setDeliveryCity(data.localidade || "");
      setDeliveryState(data.uf || "");
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

  const sendOrder = async () => {
    if (orderSubmitLock.current || total !== quantity || !deliveryReady || !customerReady) return;
    orderSubmitLock.current = true;
    trackClick("combo_order_click", `${option.line}-${quantity}`);

    setPaymentStatus("loading");

    const items = option.products
      .filter((product) => selected[product.name])
      .map((product, i) => {
        const qty = selected[product.name];
        const itemTotal = ((subtotal / quantity) + tilapiaSurchargePerUnit(product.name)) * qty;
        return `${i + 1}. ${qty}x ${product.name}\n   ${product.line} | ${product.weight} | ${money(itemTotal)}${tilapiaSurchargePerUnit(product.name) ? ` (adicional de ${money(tilapiaSurchargePerUnit(product.name))}/un.)` : ""}`;
      })
      .join("\n\n");

    const deliveryText =
      deliveryMode === "pickup"
        ? [
            "RETIRADA NA NUTRIFIT",
            "Rua Enéas Mascarenhas, nº 94/103",
            "Monte Castelo — Juiz de Fora/MG",
          ].join("\n")
        : [
            "ENTREGA EM DOMICÍLIO",
            `ENDEREÇO: ${deliveryStreet.trim()}, nº ${deliveryNumber.trim()}`,
            deliveryComplement.trim() ? `APTO / CASA / COMPLEMENTO: ${deliveryComplement.trim()}` : "",
            `BAIRRO: ${deliveryNeighborhood.trim()}`,
            `CIDADE/UF: ${deliveryCity.trim()}/${deliveryState.trim()}`,
            `CEP: ${cep}`,
            deliveryReference.trim() ? `REFERÊNCIA: ${deliveryReference.trim()}` : "",
          ].filter(Boolean).join("\n");

    const message = [
      "NUTRIFIT | RESUMO DO PEDIDO",
      "==============================",
      "",
      "DADOS DO CLIENTE",
      `Nome: ${customerName.trim()}`,
      `WhatsApp: ${customerPhone.trim()}`,
      "",
      "ITENS DO PEDIDO",
      items,
      ...(complementItems.length ? [
        "",
        "COMPLEMENTOS",
        ...complementItems.map((item) => {
          const qty = selectedComplements[item.name] || 0;
          const total = item.price === null ? "preço a confirmar" : money((item.price ?? 0) * qty);
          return `- ${qty}x ${item.name} | ${total}`;
        }),
      ] : []),
      "",
      "------------------------------",
      "RESUMO DOS VALORES",
      `Quantidade: ${quantity} marmitas`,
      `Valor do combo: ${money(subtotal)}`,
      ...(premiumExtra > 0 ? [`Adicional de tilápia: ${money(premiumExtra)}`] : []),
      ...(complementTotal > 0 ? [`Complementos: ${money(complementTotal)}`] : []),
      `Frete: ${money(deliveryFee)}`,
      "------------------------------",
      hasPendingComplementPrice ? "TOTAL PARCIAL (confirmar complementos)" : "TOTAL A PAGAR",
      `R$ ${grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      "",
      "------------------------------",
      "ENDEREÇO / RECEBIMENTO",
      deliveryText,
      "",
      "PAGAMENTO VIA PIX",
      `Chave Pix: ${PIX_KEY}`,
      "Após o pagamento, envie o comprovante neste WhatsApp.",
      "",
      "IMPORTANTE",
      "Confira os itens, o valor e principalmente o endereço antes de pagar.",
      "Se precisar corrigir algum dado, avise a NutriFit por aqui.",
    ].join("\n");

    // Evita a aba intermediária about:blank no Safari/iPhone.
    // A navegação para o WhatsApp ocorre na mesma aba após confirmar o registro.

    try {
      const acquisition = getAcquisitionData();
      const response = await fetch(SUPABASE_URL + "/functions/v1/create-combo-order", {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          whatsapp: normalizedPhone,
          line: option.line,
          combo_quantity: quantity,
          items: option.products
            .filter((product) => selected[product.name])
            .map((product) => ({
              name: product.name,
              line: product.line,
              weight: product.weight,
              quantity: selected[product.name],
            })),
          complements: complementItems.map((item) => ({
            name: item.name,
            quantity: selectedComplements[item.name] || 0,
          })),
          delivery_mode: deliveryMode,
          cep: cep.replace(/\D/g, ""),
          street: deliveryMode === "delivery" ? deliveryStreet.trim() : null,
          address_number: deliveryMode === "delivery" ? deliveryNumber.trim() : null,
          address_complement: deliveryMode === "delivery" ? deliveryComplement.trim() || null : null,
          neighborhood: deliveryMode === "delivery" ? deliveryNeighborhood.trim() : null,
          city: deliveryMode === "delivery" ? deliveryCity.trim() : null,
          state: deliveryMode === "delivery" ? deliveryState.trim() : null,
          address_reference: deliveryMode === "delivery" ? deliveryReference.trim() || null : null,
          acquisition_source: acquisition.source || "site_combo_builder",
          acquisition_campaign: acquisition.campaign || null,
          acquisition_medium: acquisition.medium || null,
          acquisition_content: acquisition.content || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(typeof result.error === "string" ? result.error : "Não foi possível registrar o pedido.");
      }

      const officialLines = Array.isArray(result.items) ? result.items.map((item: { name: string; line: string; weight: string; price: number; quantity: number }, index: number) =>
        `*${index + 1}. ${item.quantity}x ${item.name}*\\n   ${item.line} • ${item.weight} • ${money(Number(item.price))} cada\\n   💵 ${money(Number(item.price) * Number(item.quantity))}`
      ).join("\n\n") : "";
      const officialSummary = [
        "🛒 *ITENS DO PEDIDO*",
        "",
        officialLines,
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "💰 *VALORES CONFIRMADOS PELO SISTEMA*",
        `Subtotal: *${money(Number(result.subtotal))}*`,
        `🎁 Desconto: *-${money(Number(result.discount ?? 0))}*`,
        `🚚 Frete: *${money(Number(result.delivery_fee))}*`,
        `💵 *TOTAL OFICIAL: ${money(Number(result.total))}*`,
        "",
        "",
      ].join("\n");
      const itemsStart = message.indexOf("ITENS DO PEDIDO");
      const addressStart = message.indexOf("ENDEREÇO / RECEBIMENTO");
      if (itemsStart < 0 || addressStart < 0 || addressStart <= itemsStart) {
        throw new Error("Não foi possível montar o resumo oficial do pedido.");
      }
      const officialMessage = message.slice(0, itemsStart) + officialSummary + message.slice(addressStart);
      const reference = result.order_id ? `\n\n🧾 *Referência do pedido:* ${result.order_id}` : "";
      const finalUrl = whatsappOrder(officialMessage + reference);
      window.location.href = finalUrl;
      setPaymentStatus("idle");
    } catch (error) {
      orderSubmitLock.current = false;
      console.error("combo order capture", error);
      // Fail closed: nunca encaminhar um pedido sem registro oficial confirmado.
      // Não há aba intermediária para fechar; mantém o cliente no checkout em caso de erro.
      setPaymentStatus("error");
    }
  };

  const deliveryReady = deliveryMode === "pickup" || (Boolean(delivery) && Boolean(deliveryStreet.trim() && deliveryNumber.trim() && deliveryNeighborhood.trim() && deliveryCity.trim() && deliveryState.trim()));
  const normalizedPhone = customerPhone.replace(/\D/g, "");
  const customerReady = Boolean(customerName.trim() && normalizedPhone.length >= 10);
  const hasPendingComplementPrice = complementItems.some((item) => item.price === null);
  const canPay = total === quantity && deliveryReady && customerReady && paymentStatus !== "loading";
  const comboRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const timer = window.setTimeout(() => {
      comboRootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [step, autoScroll]);

  return (
    <div ref={comboRootRef} className="mt-4 rounded-[1.5rem] border border-[#a7b86a]/30 bg-[#0b0e09] p-3 sm:mt-8 sm:rounded-[2rem] sm:p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Montador Nutrifit</div>
          <h3 className="mt-1 text-xl font-black leading-tight sm:mt-1.5 sm:text-2xl md:text-4xl">Monte seu combo</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/50 sm:mt-1.5 sm:text-sm sm:leading-6">Você só precisa seguir os 5 passos. No celular, avance quando terminar cada etapa.</p>
        </div>
        <button type="button" onClick={reset} className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2.5 text-white/55" aria-label="Limpar combo"><RotateCcw size={16} /></button>
      </div>

      <div className="sticky top-[64px] z-30 mt-3 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-2.5 shadow-xl backdrop-blur-xl sm:static sm:mt-5 sm:bg-white/[.025] sm:p-3.5 sm:shadow-none">
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

      <div className="mt-3 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-3 sm:mt-5 sm:p-4">
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

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
            {comboOptions.map((item, index) => (
              <button key={item.line} type="button" onClick={() => changeLine(index)} className={`touch-manipulation relative z-10 rounded-2xl border px-3 py-3 text-left transition sm:p-4 ${lineIndex === index ? "border-[#a7b86a] bg-[#a7b86a]/10" : "border-white/10 bg-white/[.025]"}`}>
                <div className="text-[11px] font-black tracking-wider text-[#a7b86a]">{item.line}</div>
                <div className="mt-1 text-xs font-bold text-white/55">{item.weight}</div>
                <div className="mt-2 text-xs font-black text-[#ef7d18]">{item.prices[5]} <span className="font-normal text-white/35">• 5 un.</span></div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-sm font-black text-white/75">Quantas marmitas?</div>
            <div className="mt-2.5 grid grid-cols-5 gap-1.5 sm:gap-2">
              {([...([5, 7, 10, 14, 20] as const), ...(option.line === "TRADICIONAL" ? [30] : [])]).map((value) => (
                <button key={value} type="button" onClick={() => changeQuantity(value)} className={`touch-manipulation relative z-10 min-w-0 rounded-2xl border px-1.5 py-3.5 text-center text-sm font-black transition ${quantity === value ? "border-[#a7b86a] bg-[#a7b86a] text-black" : "border-white/10 bg-white/5 text-white/70"}`}>
                  <span className="block text-base sm:text-sm">{value}</span>
                  <span className={`mt-0.5 block truncate text-[8px] font-normal ${quantity === value ? "text-black/60" : "text-white/35"}`}>marmitas</span>
                </button>
              ))}
            </div>
            {option.line === "TRADICIONAL" && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.025] p-3">
                <label className="block text-xs font-bold text-white/55">Mais de 30 marmitas (R$ 26,40 por unidade adicional)
                  <div className="mt-2 flex gap-2">
                    <input type="number" min={31} max={300} value={customQuantity} onChange={(event) => setCustomQuantity(event.target.value)} aria-label="Quantidade personalizada de marmitas Tradicional" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    <button type="button" onClick={() => { const value = Math.floor(Number(customQuantity)); if (value >= 31 && value <= 300) changeQuantity(value); }} className="rounded-xl bg-[#a7b86a] px-4 py-2.5 text-xs font-black text-black">Confirmar quantidade</button>
                  </div>
                </label>
              </div>
            )}
          </div>

          <button type="button" onClick={() => setStep(2)} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black shadow-[0_10px_30px_rgba(167,184,106,.16)] active:scale-[.99] sm:mt-6 sm:min-h-14 sm:px-6 sm:py-4">
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

          {total !== quantity ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {option.products.map((product) => (
              <button key={product.name} type="button" onClick={() => { setDetailProduct(product); setDetailQuantity(1); }} className="nf-mobile-meal group relative min-w-0 w-full overflow-hidden rounded-[1.25rem] border border-white/15 bg-[#0d100c] text-left shadow-[0_12px_35px_rgba(0,0,0,.22)] transition hover:border-[#a7b86a]/45">
                <div className="relative aspect-[1.55/1] w-full overflow-hidden bg-black">
                  {product.crop ? (
                    <div role="img" aria-label={product.name} className="absolute inset-0 bg-cover bg-no-repeat brightness-[1.08] contrast-[1.06] saturate-[1.06]" style={{ backgroundImage: `url(${product.image})`, backgroundSize: product.name === "Tilápia Fit com Arroz Branco e Legumes" && product.line === "FIT" ? "contain" : "400% 200%", backgroundPosition: product.name === "Tilápia Fit com Arroz Branco e Legumes" && product.line === "FIT" ? "center" : product.crop, backgroundRepeat: "no-repeat" }} />
                  ) : (
                    <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover brightness-[1.08] contrast-[1.06] saturate-[1.06]" loading="lazy" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-3.5 pb-3.5 pt-16">
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[17px] font-black leading-tight text-white drop-shadow-md">{product.name}</h3>
                        <p className="mt-1 line-clamp-1 text-[12px] leading-tight text-white/80">{product.description}</p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#a7b86a] bg-black/60 px-2.5 py-1 text-[10px] font-black text-[#c8dc73]">{product.line || "FIT"} {product.weight}</span>
                          <span className="text-[19px] font-black leading-none text-[#ef7d18]">{product.price}</span>
                        </div>
                      </div>
                      <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#ef7d18] px-3.5 py-2.5 text-xs font-black text-black shadow-lg"><Plus size={18} strokeWidth={3} /> Adicionar</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          ) : (
            <div className="rounded-2xl border border-[#a7b86a]/30 bg-[#171d10] p-4">
              <div className="font-black text-[#cbd99a]">✓ {quantity} marmitas escolhidas</div>
              <div className="mt-1 text-sm text-white/55">{Object.entries(selected).filter(([, qty]) => qty > 0).map(([name, qty]) => `${qty}x ${name}`).join(" • ")}</div>
              <button type="button" onClick={() => setSelected({})} className="mt-3 text-xs font-bold text-[#ef9b55] underline underline-offset-4">Alterar seleção</button>
            </div>
          )}
          {detailProduct && total !== quantity && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label={detailProduct.name}>
              <div className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[1.6rem] border border-white/10 bg-[#080a07] sm:rounded-[1.6rem]">
                <button type="button" onClick={() => setDetailProduct(null)} aria-label="Fechar detalhes do prato" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-2xl text-white">×</button>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  {detailProduct.crop ? (
                    <div role="img" aria-label={detailProduct.name} className="absolute inset-0 bg-cover bg-no-repeat" style={{ backgroundImage: `url(${detailProduct.image})`, backgroundSize: detailProduct.name === "Tilápia Fit com Arroz Branco e Legumes" && detailProduct.line === "FIT" ? "contain" : "400% 200%", backgroundPosition: detailProduct.name === "Tilápia Fit com Arroz Branco e Legumes" && detailProduct.line === "FIT" ? "center" : detailProduct.crop, backgroundRepeat: "no-repeat" }} />
                  ) : (
                    <img src={detailProduct.image} alt={detailProduct.name} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-black leading-tight">{detailProduct.name}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3"><span className="rounded-full border border-[#a7b86a] px-3 py-1.5 text-sm font-black text-[#c8dc73]">{detailProduct.line || "FIT"} {detailProduct.weight}</span><span className="text-2xl font-black text-[#ef7d18]">{detailProduct.price}</span></div>
                  <p className="mt-3 text-sm leading-6 text-white/70">{detailProduct.description}</p>
                  {((detailProduct.line === "FIT" && fitNutrition[detailProduct.name]) || (detailProduct.line === "PERFORMANCE" && performanceNutrition[detailProduct.name]) || (detailProduct.line === "SALADAS" && saladsNutrition[detailProduct.name])) && (() => { const n = detailProduct.line === "FIT" ? fitNutrition[detailProduct.name] : detailProduct.line === "PERFORMANCE" ? performanceNutrition[detailProduct.name] : saladsNutrition[detailProduct.name]; return <section className="mt-5 rounded-2xl border border-[#a7b86a]/30 bg-[#10140d] p-4 text-white" aria-label="Ficha nutricional">
                    <div className="flex items-center justify-between gap-3"><h4 className="text-base font-black text-[#d4e6a0]">Informação nutricional</h4><span className="rounded-full bg-[#a7b86a]/15 px-2.5 py-1 text-xs font-black text-[#d4e6a0]">{n.kcal} kcal</span></div>
                    <p className="mt-1 text-xs text-white/60">Porção de {detailProduct.weight || (detailProduct.line === "SALADAS" ? "350 g" : detailProduct.line === "FIT" ? "350 g" : "450 g")}</p>
                    <div className="mt-3">{nutritionRows(n).map(([label,value]) => <p key={label} className="flex justify-between gap-4 border-b border-white/10 py-2 text-sm"><span className="text-white/75">{label}</span><b className="text-right">{value}</b></p>)}</div>
                    <div className="mt-3 rounded-xl bg-white/[.04] p-3 text-xs leading-5"><p className="font-bold">Distribuição calórica</p><p className="mt-1">Proteínas: {n.pctProtein} · Carboidratos: {n.pctCarbs} · Gorduras: {n.pctFat}</p><p className="mt-2"><b>Possíveis alérgenos:</b> {n.allergens}</p></div>
                    <p className="mt-3 text-[10px] leading-relaxed text-white/50">Valores nutricionais de referência Nutrifit por porção; podem variar conforme ingredientes e preparo.</p>
                  </section>; })()}
                  <div className="mt-5 flex items-center justify-center gap-6 rounded-full border border-white/15 bg-white/[.03] p-2">
                    <button type="button" onClick={() => setDetailQuantity(v => Math.max(1,v-1))} disabled={detailQuantity<=1} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 disabled:opacity-30" aria-label="Diminuir quantidade"><Minus size={18}/></button>
                    <span className="min-w-6 text-center text-xl font-black">{detailQuantity}</span>
                    <button type="button" onClick={() => setDetailQuantity(v => Math.min(quantity-total,v+1))} disabled={detailQuantity >= quantity-total} className="grid h-12 w-12 place-items-center rounded-full bg-[#ef7d18] text-black disabled:opacity-30" aria-label="Aumentar quantidade"><Plus size={18}/></button>
                  </div>
                  <button type="button" onClick={() => { setSelected(prev => ({...prev, [detailProduct.name]: (prev[detailProduct.name] || 0) + detailQuantity})); setDetailProduct(null); }} className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#ef7d18] px-5 py-4 text-base font-black text-black"><ShoppingBag size={19}/> Adicionar ao combo</button>
                  <p className="mt-3 text-center text-xs text-white/40">Escolha a quantidade e adicione este prato ao seu combo.</p>
                </div>
              </div>
            </div>
          )}

          <div className="sticky top-[138px] z-20 mt-4 flex gap-2 rounded-2xl border border-white/10 bg-[#0b0e09]/95 p-2 shadow-2xl backdrop-blur-xl">
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

          <div className="grid grid-cols-3 gap-2.5">
            {(["SUCOS","SANDUÍCHES","FRUTAS"] as const).map((category) => {
              const items = comboComplements.filter((item) => item.category === category);
              const labels = {
                SUCOS: { title: "Sucos", icon: "🥤", text: "Naturais e funcionais" },
                SANDUÍCHES: { title: "Sanduíches", icon: "🥪", text: "Leves e práticos" },
                FRUTAS: { title: "Frutas", icon: "🍓", text: "Frescas e picadas" },
              };
              const active = complementCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setComplementCategory((current) => current === category ? null : category)}
                  className={`touch-manipulation rounded-2xl border p-3 text-left transition ${active ? "border-[#ef7d18] bg-[#ef7d18]/10" : "border-white/10 bg-white/[.025]"}`}
                  aria-expanded={active}
                >
                  <div className="text-xl">{labels[category].icon}</div>
                  <div className="mt-1 text-sm font-black">{labels[category].title}</div>
                  <div className="mt-0.5 text-[9px] font-bold leading-4 text-white/40 sm:text-[10px]">{labels[category].text}</div>
                  <div className={`mt-2 text-[9px] font-black uppercase tracking-wider ${active ? "text-[#ef7d18]" : "text-white/30"}`}>
                    {active ? "Aberto" : "Ver opções"}
                  </div>
                </button>
              );
            })}
          </div>

          {complementCategory && (() => {
            const category = complementCategory;
            const items = comboComplements.filter((item) => item.category === category);
            const labels = { SUCOS: "🥤 Sucos naturais", SANDUÍCHES: "🥪 Sanduíches naturais", FRUTAS: "🍓 Frutas picadas" };
            return (
              <div className="mt-3 rounded-3xl border border-white/10 bg-white/[.025] p-4">
                {category === "FRUTAS" && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <img src="/images/frutas-picadas-header.jpg" alt="Frutas picadas Nutrifit" className="mx-auto block h-auto max-h-56 w-full object-contain object-center" />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black">{labels[category]}</div>
                    <div className="mt-1 text-xs text-white/40">
                      {category === "FRUTAS" ? "Frescas, práticas e ideais para o seu dia." : category === "SANDUÍCHES" ? "Leves, simples e nutritivos." : "Naturais, funcionais e refrescantes."}
                    </div>
                  </div>
                  <span className="rounded-full bg-[#a7b86a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#cbd99a]">Opcional</span>
                </div>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {items.map((item) => {
                    const qty = selectedComplements[item.name] || 0;
                    return (
                      <div key={item.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d100c] p-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
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
          })()}

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
                <input value={cep} onChange={(event) => { setCep(formatCepInput(event.target.value)); setDelivery(null); setDeliveryStatus("idle"); }} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-label="CEP para calcular a entrega" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold outline-none focus:border-[#a7b86a]" />
                <button type="button" onClick={() => void calculateDelivery()} disabled={deliveryStatus === "loading"} aria-busy={deliveryStatus === "loading"} aria-label="Calcular taxa de entrega pelo CEP" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3.5 text-sm font-black text-black disabled:opacity-60">
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
              {delivery && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.025] p-4">
                  <div className="mb-3 font-black text-[#cbd99a]">📍 Confirme o endereço de entrega</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-white/60">Rua / avenida
                      <input value={deliveryStreet} onChange={(e) => setDeliveryStreet(e.target.value)} autoComplete="street-address" placeholder="Nome da rua" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs text-white/60">Número
                      <input value={deliveryNumber} onChange={(e) => setDeliveryNumber(e.target.value)} autoComplete="address-line2" placeholder="Número" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs text-white/60">Complemento (opcional)
                      <input value={deliveryComplement} onChange={(e) => setDeliveryComplement(e.target.value)} placeholder="Apto, bloco, casa..." className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs text-white/60">Bairro
                      <input value={deliveryNeighborhood} onChange={(e) => setDeliveryNeighborhood(e.target.value)} autoComplete="address-level3" placeholder="Bairro" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs text-white/60">Cidade
                      <input value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} autoComplete="address-level2" placeholder="Cidade" className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs text-white/60">UF
                      <input value={deliveryState} onChange={(e) => setDeliveryState(e.target.value.toUpperCase().slice(0, 2))} autoComplete="address-level1" placeholder="MG" maxLength={2} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs text-white/60 sm:col-span-2">Ponto de referência (opcional)
                      <input value={deliveryReference} onChange={(e) => setDeliveryReference(e.target.value)} placeholder="Próximo a..." className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#080a07]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl sm:sticky sm:bottom-2 sm:mt-5 sm:rounded-2xl sm:border sm:bg-[#0b0e09]/95 sm:p-2">
            <div className="mx-auto flex w-full max-w-3xl gap-2">
              <button type="button" onClick={() => setStep(3)} className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-bold text-white/70">Voltar</button>
              <button type="button" onClick={() => deliveryReady && setStep(5)} disabled={!deliveryReady} className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black disabled:opacity-30">
                Continuar <ArrowRight size={17} />
              </button>
            </div>
          </div>
          <div className="h-24 sm:hidden" aria-hidden="true" />
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
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" placeholder="Seu nome completo" aria-label="Nome para o pedido" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9+()\- ]/g, ""))} inputMode="tel" autoComplete="tel" placeholder="Seu WhatsApp / telefone" aria-label="WhatsApp para o pedido" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
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
            <button type="button" onClick={() => setStep(4)} aria-label="Voltar para os dados do pedido" className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-bold text-white/70">Voltar</button>
            <button type="button" onClick={sendOrder} disabled={!canPay} aria-busy={paymentStatus === "loading"} aria-label="Finalizar pedido no WhatsApp" className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3.5 font-black text-black disabled:cursor-not-allowed disabled:opacity-30">
              {paymentStatus === "loading" ? <><Loader2 size={17} className="animate-spin" /> Enviando...</> : <><ShoppingBag size={17} /> Finalizar no WhatsApp</>}
            </button>
          </div>
          {paymentStatus === "error" && <div role="alert" className="mt-3 rounded-xl border border-[#ef7d18]/30 bg-[#ef7d18]/10 p-3 text-center text-xs leading-5 text-[#ffd2a6]">Não conseguimos confirmar o registro automático do pedido. A mensagem foi aberta no WhatsApp; confira os itens e aguarde a confirmação da Nutrifit antes de pagar.</div>}
          {!customerReady && <div className="mt-3 text-center text-xs text-[#ef9b55]">Informe seu nome e um WhatsApp válido para liberar o botão.</div>}
        </div>
      )}

      <div className="mt-5 text-center text-[11px] text-white/30">
        Pagamento antecipado via Pix. O pedido é confirmado após a confirmação do pagamento.
      </div>
    </div>
  );
}

type NutritionData = {kcal:number;protein:string;carbs:string;sugars:string;fat:string;sat:string;fiber:string;pctProtein:string;pctCarbs:string;pctFat:string;sodium:number;cholesterol:number;potassium:number;calcium:number;iron:string;magnesium:number;zinc:string;vitaminA:number;vitaminC:number;b12:string;profile:string;allergens:string};

const fitNutrition: Record<string,NutritionData> = {
  "Patinho com Abóbora": {
    "kcal": 430,
    "protein": "56,6",
    "carbs": "21,0",
    "sugars": "8,0",
    "fat": "13,3",
    "sat": "5,5",
    "fiber": "4,4",
    "pctProtein": "53%",
    "pctCarbs": "20%",
    "pctFat": "28%",
    "sodium": 460,
    "cholesterol": 132,
    "potassium": 1170,
    "calcium": 38,
    "iron": "5,8",
    "magnesium": 62,
    "zinc": "10,3",
    "vitaminA": 500,
    "vitaminC": 12,
    "b12": "3,8",
    "profile": "Equilibrada",
    "allergens": "Possível leite (creme)"
  },
  "Patinho com Batata-Doce": {
    "kcal": 470,
    "protein": "55,1",
    "carbs": "36,8",
    "sugars": "11,4",
    "fat": "11,1",
    "sat": "4,3",
    "fiber": "4,4",
    "pctProtein": "47%",
    "pctCarbs": "31%",
    "pctFat": "21%",
    "sodium": 470,
    "cholesterol": 128,
    "potassium": 1030,
    "calcium": 42,
    "iron": "5,6",
    "magnesium": 78,
    "zinc": "10,3",
    "vitaminA": 800,
    "vitaminC": 24,
    "b12": "3,8",
    "profile": "Equilibrada",
    "allergens": "-"
  },
  "Patinho com Legumes na Manteiga": {
    "kcal": 455,
    "protein": "57,2",
    "carbs": "12,4",
    "sugars": "5,4",
    "fat": "19,8",
    "sat": "9,6",
    "fiber": "5,0",
    "pctProtein": "50%",
    "pctCarbs": "11%",
    "pctFat": "39%",
    "sodium": 560,
    "cholesterol": 150,
    "potassium": 1050,
    "calcium": 68,
    "iron": "6,0",
    "magnesium": 66,
    "zinc": "10,3",
    "vitaminA": 380,
    "vitaminC": 48,
    "b12": "3,8",
    "profile": "Equilibrada",
    "allergens": "Leite (manteiga)"
  },
  "Frango Grelhado com Mix de Legumes": {
    "kcal": 300,
    "protein": "51,6",
    "carbs": "13,0",
    "sugars": "5,6",
    "fat": "4,3",
    "sat": "1,3",
    "fiber": "5,2",
    "pctProtein": "69%",
    "pctCarbs": "17%",
    "pctFat": "13%",
    "sodium": 492,
    "cholesterol": 134,
    "potassium": 995,
    "calcium": 69,
    "iron": "1,8",
    "magnesium": 75,
    "zinc": "2,0",
    "vitaminA": 309,
    "vitaminC": 50,
    "b12": "0,5",
    "profile": "Leve",
    "allergens": "-"
  },
  "Carne Acebolada com Legumes": {
    "kcal": 385,
    "protein": "51,4",
    "carbs": "13,5",
    "sugars": "6,0",
    "fat": "14,0",
    "sat": "5,2",
    "fiber": "4,9",
    "pctProtein": "53%",
    "pctCarbs": "14%",
    "pctFat": "33%",
    "sodium": 492,
    "cholesterol": 128,
    "potassium": 950,
    "calcium": 69,
    "iron": "5,6",
    "magnesium": 62,
    "zinc": "9,6",
    "vitaminA": 255,
    "vitaminC": 44,
    "b12": "3,5",
    "profile": "Leve",
    "allergens": "-"
  },
  "Frango ao Molho de Ervas com Legumes": {
    "kcal": 300,
    "protein": "51,4",
    "carbs": "12,0",
    "sugars": "5,2",
    "fat": "5,2",
    "sat": "1,5",
    "fiber": "4,5",
    "pctProtein": "69%",
    "pctCarbs": "16%",
    "pctFat": "15%",
    "sodium": 588,
    "cholesterol": 134,
    "potassium": 938,
    "calcium": 63,
    "iron": "1,7",
    "magnesium": 72,
    "zinc": "1,9",
    "vitaminA": 270,
    "vitaminC": 43,
    "b12": "0,5",
    "profile": "Leve",
    "allergens": "Confirmar molho"
  },
  "Lombo Suíno com Legumes Assados": {
    "kcal": 395,
    "protein": "50,1",
    "carbs": "13,0",
    "sugars": "5,6",
    "fat": "15,8",
    "sat": "4,9",
    "fiber": "5,2",
    "pctProtein": "51%",
    "pctCarbs": "13%",
    "pctFat": "36%",
    "sodium": 492,
    "cholesterol": 128,
    "potassium": 1100,
    "calcium": 72,
    "iron": "2,4",
    "magnesium": 72,
    "zinc": "4,3",
    "vitaminA": 303,
    "vitaminC": 40,
    "b12": "0,9",
    "profile": "Leve",
    "allergens": "-"
  },
  "Tilápia Fit com Arroz Branco e Legumes": {
    "kcal": 355,
    "protein": "43,3",
    "carbs": "34,6",
    "sugars": "2,8",
    "fat": "4,5",
    "sat": "1,5",
    "fiber": "4,2",
    "pctProtein": "49%",
    "pctCarbs": "39%",
    "pctFat": "12%",
    "sodium": 458,
    "cholesterol": 86,
    "potassium": 850,
    "calcium": 55,
    "iron": "1,7",
    "magnesium": 65,
    "zinc": "1,3",
    "vitaminA": 150,
    "vitaminC": 25,
    "b12": "2,9",
    "profile": "Leve",
    "allergens": "Peixe"
  },
  "Pernil Acebolado com Batata Inglesa": {
    "kcal": 460,
    "protein": "45,8",
    "carbs": "22,6",
    "sugars": "2,6",
    "fat": "20,4",
    "sat": "6,9",
    "fiber": "2,7",
    "pctProtein": "40%",
    "pctCarbs": "20%",
    "pctFat": "40%",
    "sodium": 458,
    "cholesterol": 142,
    "potassium": 1046,
    "calcium": 28,
    "iron": "2,1",
    "magnesium": 53,
    "zinc": "5,8",
    "vitaminA": 3,
    "vitaminC": 13,
    "b12": "1,1",
    "profile": "Equilibrada",
    "allergens": "-"
  },
  "Frango com Purê de Batata Inglesa": {
    "kcal": 395,
    "protein": "51,6",
    "carbs": "26,0",
    "sugars": "3,0",
    "fat": "9,3",
    "sat": "4,6",
    "fiber": "2,4",
    "pctProtein": "52%",
    "pctCarbs": "26%",
    "pctFat": "21%",
    "sodium": 692,
    "cholesterol": 150,
    "potassium": 995,
    "calcium": 59,
    "iron": "1,2",
    "magnesium": 69,
    "zinc": "2,0",
    "vitaminA": 59,
    "vitaminC": 10,
    "b12": "0,7",
    "profile": "Leve",
    "allergens": "Leite (purê)"
  },
  "Frango ao Molho de Mostarda com Batata": {
    "kcal": 335,
    "protein": "50,3",
    "carbs": "21,7",
    "sugars": "2,0",
    "fat": "5,1",
    "sat": "1,5",
    "fiber": "2,3",
    "pctProtein": "60%",
    "pctCarbs": "26%",
    "pctFat": "14%",
    "sodium": 561,
    "cholesterol": 134,
    "potassium": 989,
    "calcium": 22,
    "iron": "1,2",
    "magnesium": 64,
    "zinc": "1,9",
    "vitaminA": 12,
    "vitaminC": 12,
    "b12": "0,5",
    "profile": "Leve",
    "allergens": "Mostarda; confirmar molho"
  },
  "Escondidinho de Patinho Fit": {
    "kcal": 485,
    "protein": "57,5",
    "carbs": "26,0",
    "sugars": "3,0",
    "fat": "16,5",
    "sat": "7,8",
    "fiber": "2,4",
    "pctProtein": "48%",
    "pctCarbs": "22%",
    "pctFat": "31%",
    "sodium": 700,
    "cholesterol": 144,
    "potassium": 1070,
    "calcium": 58,
    "iron": "5,4",
    "magnesium": 62,
    "zinc": "10,3",
    "vitaminA": 50,
    "vitaminC": 10,
    "b12": "4,0",
    "profile": "Equilibrada",
    "allergens": "Leite (purê)"
  },
  "Frango Empanado Assado com Arroz Integral": {
    "kcal": 530,
    "protein": "45,7",
    "carbs": "62,1",
    "sugars": "1,2",
    "fat": "11,0",
    "sat": "2,9",
    "fiber": "6,0",
    "pctProtein": "34%",
    "pctCarbs": "47%",
    "pctFat": "19%",
    "sodium": 536,
    "cholesterol": 128,
    "potassium": 610,
    "calcium": 32,
    "iron": "2,0",
    "magnesium": 160,
    "zinc": "2,5",
    "vitaminA": 12,
    "vitaminC": 0,
    "b12": "0,5",
    "profile": "Mais energia",
    "allergens": "Glúten (empanado); possível ovo"
  },
  "Pernil Desfiado ao Molho com Arroz Integral": {
    "kcal": 575,
    "protein": "48,4",
    "carbs": "45,1",
    "sugars": "0,8",
    "fat": "22,1",
    "sat": "7,5",
    "fiber": "4,7",
    "pctProtein": "34%",
    "pctCarbs": "31%",
    "pctFat": "35%",
    "sodium": 558,
    "cholesterol": 144,
    "potassium": 685,
    "calcium": 26,
    "iron": "2,1",
    "magnesium": 135,
    "zinc": "6,3",
    "vitaminA": 3,
    "vitaminC": 0,
    "b12": "1,1",
    "profile": "Mais energia",
    "allergens": "Confirmar molho"
  }
};

const performanceNutrition: Record<string, NutritionData> = {
  "Chicken Parmesão": { kcal: 540, protein: "72,7", carbs: "39,0", sugars: "4,6", fat: "10,2", sat: "3,8", fiber: "5,8", pctProtein: "54%", pctCarbs: "29%", pctFat: "17%", sodium: 885, cholesterol: 187, potassium: 1090, calcium: 156, iron: "2,0", magnesium: 152, zinc: "3,1", vitaminA: 162, vitaminC: 22, b12: "0,7", profile: "Equilibrada", allergens: "Leite (parmesão)" },
  "Tilápia Power": { kcal: 475, protein: "56,1", carbs: "47,5", sugars: "7,4", fat: "6,7", sat: "2,1", fiber: "6,2", pctProtein: "47%", pctCarbs: "40%", pctFat: "13%", sodium: 583, cholesterol: 114, potassium: 1195, calcium: 65, iron: "2,2", magnesium: 146, zinc: "1,8", vitaminA: 475, vitaminC: 24, b12: "3,8", profile: "Leve", allergens: "Peixe" },
  "Beef & Sweet Potato": { kcal: 650, protein: "67,4", carbs: "55,7", sugars: "8,6", fat: "17,3", sat: "6,7", fiber: "4,9", pctProtein: "42%", pctCarbs: "34%", pctFat: "24%", sodium: 596, cholesterol: 170, potassium: 1015, calcium: 46, iron: "6,8", magnesium: 79, zinc: "12,8", vitaminA: 600, vitaminC: 18, b12: "4,6", profile: "Mais energia", allergens: "-" },
  "Chicken Sweet Potato": { kcal: 540, protein: "67,4", carbs: "55,7", sugars: "8,6", fat: "5,4", sat: "1,7", fiber: "4,9", pctProtein: "50%", pctCarbs: "41%", pctFat: "9%", sodium: 586, cholesterol: 178, potassium: 1035, calcium: 42, iron: "1,6", magnesium: 95, zinc: "2,6", vitaminA: 612, vitaminC: 18, b12: "0,6", profile: "Equilibrada", allergens: "-" },
  "Chicken Potato": { kcal: 475, protein: "68,5", carbs: "27,3", sugars: "4,8", fat: "10,0", sat: "4,5", fiber: "4,1", pctProtein: "58%", pctCarbs: "23%", pctFat: "19%", sodium: 805, cholesterol: 192, potassium: 1285, calcium: 78, iron: "1,8", magnesium: 92, zinc: "2,5", vitaminA: 174, vitaminC: 28, b12: "0,8", profile: "Leve", allergens: "Leite (purê)" },
  "Patinho Strong": { kcal: 630, protein: "76,4", carbs: "43,9", sugars: "6,0", fat: "16,6", sat: "6,8", fiber: "4,9", pctProtein: "48%", pctCarbs: "28%", pctFat: "24%", sodium: 588, cholesterol: 173, potassium: 1240, calcium: 36, iron: "7,4", magnesium: 73, zinc: "13,8", vitaminA: 375, vitaminC: 9, b12: "5,0", profile: "Mais energia", allergens: "Possível leite (purê)" },
  "Chicken Rice": { kcal: 535, protein: "69,5", carbs: "48,6", sugars: "2,8", fat: "6,8", sat: "1,9", fiber: "5,0", pctProtein: "52%", pctCarbs: "36%", pctFat: "11%", sodium: 594, cholesterol: 178, potassium: 955, calcium: 48, iron: "1,7", magnesium: 82, zinc: "2,7", vitaminA: 162, vitaminC: 20, b12: "0,6", profile: "Equilibrada", allergens: "-" },
  "Beef Pasta": { kcal: 645, protein: "80,6", carbs: "42,7", sugars: "5,8", fat: "17,0", sat: "6,2", fiber: "7,3", pctProtein: "50%", pctCarbs: "26%", pctFat: "24%", sodium: 826, cholesterol: 170, potassium: 1157, calcium: 54, iron: "8,4", magnesium: 120, zinc: "14,3", vitaminA: 92, vitaminC: 16, b12: "5,0", profile: "Mais energia", allergens: "Glúten (macarrão)" }
};

const saladsNutrition: Record<string, NutritionData> = {
  "Mango Fresh": { kcal: 330, protein: "36,0", carbs: "19,4", sugars: "13,7", fat: "11,9", sat: "2,3", fiber: "3,7", pctProtein: "44%", pctCarbs: "24%", pctFat: "33%", sodium: 381, cholesterol: 89, potassium: 846, calcium: 66, iron: "1,8", magnesium: 87, zinc: "1,7", vitaminA: 257, vitaminC: 35, b12: "0,3", profile: "Equilibrada", allergens: "Oleaginosas (castanhas e amêndoas)" },
  "Green Power": { kcal: 355, protein: "38,8", carbs: "16,6", sugars: "4,1", fat: "14,7", sat: "2,4", fiber: "9,7", pctProtein: "44%", pctCarbs: "19%", pctFat: "37%", sodium: 301, cholesterol: 89, potassium: 1103, calcium: 100, iron: "2,8", magnesium: 108, zinc: "2,4", vitaminA: 259, vitaminC: 46, b12: "0,3", profile: "Equilibrada", allergens: "Sementes (confirmar tipos usados)" },
  "Tropical Chicken": { kcal: 255, protein: "35,3", carbs: "20,6", sugars: "9,6", fat: "3,3", sat: "0,9", fiber: "4,5", pctProtein: "56%", pctCarbs: "33%", pctFat: "12%", sodium: 311, cholesterol: 89, potassium: 879, calcium: 68, iron: "1,8", magnesium: 69, zinc: "1,4", vitaminA: 474, vitaminC: 53, b12: "0,3", profile: "Leve", allergens: "-" },
  "Avocado Chicken": { kcal: 310, protein: "34,9", carbs: "12,5", sugars: "4,0", fat: "13,5", sat: "2,3", fiber: "6,0", pctProtein: "45%", pctCarbs: "16%", pctFat: "39%", sodium: 417, cholesterol: 89, potassium: 955, calcium: 58, iron: "1,7", magnesium: 66, zinc: "1,6", vitaminA: 388, vitaminC: 20, b12: "0,3", profile: "Equilibrada", allergens: "Confirmar ingredientes do molho" },
  "Caesar Chicken": { kcal: 335, protein: "41,5", carbs: "22,8", sugars: "6,2", fat: "8,4", sat: "3,6", fiber: "3,8", pctProtein: "50%", pctCarbs: "27%", pctFat: "23%", sodium: 655, cholesterol: 102, potassium: 750, calcium: 223, iron: "1,9", magnesium: 60, zinc: "1,9", vitaminA: 305, vitaminC: 10, b12: "0,5", profile: "Equilibrada", allergens: "Glúten (croutons); leite (queijo); possível ovo" },
  "Summer Salad": { kcal: 210, protein: "34,9", carbs: "11,3", sugars: "5,2", fat: "3,0", sat: "0,8", fiber: "4,1", pctProtein: "66%", pctCarbs: "21%", pctFat: "13%", sodium: 317, cholesterol: 89, potassium: 916, calcium: 79, iron: "2,0", magnesium: 62, zinc: "1,4", vitaminA: 558, vitaminC: 37, b12: "0,3", profile: "Leve", allergens: "-" }
};

const nutritionRows = (n: NutritionData) => [
  ["Proteínas",n.protein+" g"],["Carboidratos",n.carbs+" g"],["Açúcares totais",n.sugars+" g"],["Gorduras totais",n.fat+" g"],["Gorduras saturadas",n.sat+" g"],["Fibras alimentares",n.fiber+" g"],
  ["Sódio",n.sodium+" mg"],["Colesterol",n.cholesterol+" mg"],["Potássio",n.potassium+" mg"],["Cálcio",n.calcium+" mg"],["Ferro",n.iron+" mg"],["Magnésio",n.magnesium+" mg"],["Zinco",n.zinc+" mg"],["Vitamina A",n.vitaminA+" mcg RAE"],["Vitamina C",n.vitaminC+" mg"],["Vitamina B12",n.b12+" mcg"]
];

// Mobile line sections show two cards first, with a full-width view-all action below.
function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <>
    <article className="nf-mobile-meal group relative flex flex-col sm:hidden min-w-0 w-full overflow-hidden rounded-[1.25rem] border border-white/15 bg-[#0d100c] shadow-[0_12px_35px_rgba(0,0,0,.22)]">
      <div className="relative aspect-[1.55/1] w-full overflow-hidden bg-black">
        {product.comingSoon ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(167,184,106,.16),_transparent_60%),linear-gradient(145deg,#171d10,#080a07)] p-4 text-center">
            <div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">Novidade</div><div className="mt-2 text-2xl font-black text-white">EM BREVE</div></div>
          </div>
        ) : product.crop ? (
          <div aria-label={product.name} role="img" className="absolute inset-0 bg-cover bg-no-repeat brightness-[1.08] contrast-[1.06] saturate-[1.06]" style={{ backgroundImage: `url(${product.image})`, backgroundSize: product.name === "Tilápia Fit com Arroz Branco e Legumes" && product.line === "FIT" ? "contain" : "400% 200%", backgroundPosition: product.name === "Tilápia Fit com Arroz Branco e Legumes" && product.line === "FIT" ? "center" : product.crop, backgroundRepeat: "no-repeat" }} />
        ) : (
          <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover brightness-[1.08] contrast-[1.06] saturate-[1.06]" loading="lazy" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-3.5 pb-3.5 pt-16">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] font-black leading-tight text-white drop-shadow-md">{product.name}</h3>
              <p className="mt-1 line-clamp-1 text-[12px] leading-tight text-white/80">{product.description}</p>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#a7b86a] bg-black/60 px-2.5 py-1 text-[10px] font-black text-[#c8dc73]">{product.line || "NUTRIFIT"} {product.weight ? product.weight : ""}</span>
                <span className="text-[19px] font-black leading-none text-[#ef7d18]">{product.price}</span>
              </div>
            </div>
            <button type="button" onClick={() => onAdd(product)} aria-label={`Adicionar ${product.name}`} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#ef7d18] px-3.5 py-2.5 text-xs font-black text-black shadow-lg active:scale-95"><Plus size={18} strokeWidth={3} /> Adicionar</button>
          </div>
        </div>
      </div>
      {((product.line === "FIT" && fitNutrition[product.name]) || (product.line === "PERFORMANCE" && performanceNutrition[product.name]) || (product.line === "SALADAS" && saladsNutrition[product.name])) && (() => { const n = product.line === "FIT" ? fitNutrition[product.name] : product.line === "PERFORMANCE" ? performanceNutrition[product.name] : saladsNutrition[product.name]; return <div className="w-full border-t border-[#a7b86a]/25 bg-[#0d100c] p-3 text-left">
        <div className="flex flex-wrap items-center gap-1.5"><span className="rounded-full bg-[#a7b86a]/15 px-2 py-1 text-[11px] font-black text-[#d4e6a0]">{n.kcal} kcal</span><span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-bold text-white">{n.protein} g proteína</span><span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-bold text-white/75">{n.profile}</span></div>
        <div className="mt-2 text-xs text-white/85"><div className="mt-2 border-t border-white/10 pt-2"><p className="mb-1 font-bold text-white">Nutrifit · porção de {product.weight || (product.line === "SALADAS" ? "350 g" : product.line === "FIT" ? "350 g" : "450 g")}</p>{nutritionRows(n).map(([label,value])=><p key={label} className="flex justify-between gap-3 border-b border-white/5 py-1"><span>{label}</span><b className="text-right">{value}</b></p>)}<div className="mt-2 rounded-lg bg-white/[.04] p-2"><p className="font-bold text-white">{product.line === "SALADAS" ? "Distribuição calórica" : "Distribuição calórica estimada"}</p><p className="mt-1">Proteínas: {n.pctProtein} · Carboidratos: {n.pctCarbs} · Gorduras: {n.pctFat}</p></div><p className="mt-2"><b className="text-white">Possíveis alérgenos:</b> {n.allergens}</p><p className="mt-2 text-[10px] leading-relaxed text-white/55">Valores nutricionais adotados como referência Nutrifit por porção. Molhos, temperos e pesos reais podem alterar os resultados. Valores estimados, pendentes de validação por profissional responsável.</p></div></div>
      </div>; })()}
    </article>
    <article className="nf-desktop-meal hidden sm:flex group min-w-0 h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d100c] shadow-[0_12px_35px_rgba(0,0,0,.18)] transition hover:-translate-y-1 hover:border-[#a7b86a]/35">
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-black">
        {product.comingSoon ? (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(167,184,106,.16),_transparent_60%),linear-gradient(145deg,#171d10,#080a07)] p-5 text-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[.24em] text-[#a7b86a] sm:text-xs">Novidade</div>
              <div className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">EM BREVE</div>
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#ef7d18]" />
              <div className="mt-3 text-[10px] font-semibold text-white/45 sm:text-xs">Novo prato Nutrifit</div>
            </div>
          </div>
        ) : product.crop ? (
          <div
            aria-label={product.name}
            role="img"
            className="h-full w-full bg-cover bg-no-repeat brightness-[1.1] contrast-[1.08] saturate-[1.08] transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${product.image})`, backgroundSize: product.name === "Tilápia Fit com Arroz Branco e Legumes" && product.line === "FIT" ? "contain" : "400% 200%", backgroundPosition: product.name === "Tilápia Fit com Arroz Branco e Legumes" && product.line === "FIT" ? "center" : product.crop, backgroundRepeat: "no-repeat" }}
          />
        ) : (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover brightness-[1.1] contrast-[1.08] saturate-[1.08] transition duration-500 group-hover:scale-105" loading="lazy" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-[12px] font-black leading-[1.15] text-[#ef7d18] sm:text-lg">{product.name}</h3>
          <span className="shrink-0 text-[9px] font-black text-white/45">{product.weight}</span>
        </div>
        <p className="mt-1 min-h-[2.15rem] text-[10px] leading-[1.05rem] text-white/45 sm:min-h-[3rem] sm:text-xs sm:leading-5" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.description}</p>
                        {(product.line === "FIT" || product.line === "PERFORMANCE" || product.line === "SALADAS") && (() => { const n = product.line === "FIT" ? fitNutrition[product.name] : product.line === "PERFORMANCE" ? performanceNutrition[product.name] : saladsNutrition[product.name]; return n ? <div className="mt-2 rounded-xl border border-[#a7b86a]/30 bg-[#080a07]/95 p-2.5 text-left">
                          <div className="flex flex-wrap items-center gap-1.5"><span className="rounded-full bg-[#a7b86a]/15 px-2 py-1 text-[10px] font-black text-[#d4e6a0]">{n.kcal} kcal</span><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-white">{n.protein} g proteína</span><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-white/75">{n.profile}</span></div>
                          <div className="mt-2 text-[11px] text-white/80"><div className="mt-2 border-t border-white/10 pt-2"><p className="mb-1 font-bold text-white">Nutrifit · porção de {product.weight || (product.line === "SALADAS" ? "350 g" : product.line === "FIT" ? "350 g" : "450 g")}</p>{nutritionRows(n).map(([label,value])=><p key={label} className="flex justify-between gap-3 border-b border-white/5 py-1"><span>{label}</span><b className="text-right">{value}</b></p>)}<div className="mt-2 rounded-lg bg-white/[.04] p-2"><p className="font-bold text-white">{product.line === "SALADAS" ? "Distribuição calórica" : "Distribuição calórica estimada"}</p><p className="mt-1">Proteínas: {n.pctProtein} · Carboidratos: {n.pctCarbs} · Gorduras: {n.pctFat}</p></div><p className="mt-2"><b className="text-white">Possíveis alérgenos:</b> {n.allergens}</p><p className="mt-2 text-[10px] leading-relaxed text-white/55">{product.line === "SALADAS" ? "Tabela nutricional oficial Nutrifit para a porção de 350 g, conforme os valores definidos para esta linha. Mantenha os possíveis alergênicos e a composição dos molhos alinhados às fichas técnicas e aos ingredientes efetivamente utilizados." : `Valores estimados por marmita de ${product.weight || (product.line === "FIT" ? "350 g" : "450 g")}, calculados com base em composição presumida dos ingredientes. O sódio depende do tempero; vitaminas A e C variam conforme ingredientes e preparo. Confirme a composição real e os alérgenos na ficha técnica.`}</p></div></div>
                        </div> : null; })()}
        <div className="mt-auto flex items-center gap-1.5 pt-2.5">
          <div className="shrink-0 whitespace-nowrap text-[13px] font-black leading-none text-[#ef7d18] sm:text-xl">{product.price}</div>
          <button type="button" onClick={() => onAdd(product)} aria-label={`Adicionar ${product.name}`} className="ml-auto inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-[#a7b86a] px-3 py-2 text-[10px] font-black text-black sm:min-h-11 sm:px-4 sm:py-2.5 sm:text-sm">
            <Plus size={15} strokeWidth={3} /> Adicionar
          </button>
        </div>
      </div>
    </article>
    </>
  );
}
function Section({ id, eyebrow, title, subtitle, products, featuredNames, onAdd }: { id:string; eyebrow:string; title:string; subtitle:string; products:Product[]; featuredNames: string[]; onAdd: (product: Product) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<"combo" | "individual">("combo");
  const [selectedComboQuantity, setSelectedComboQuantity] = useState<number | null>(null);
  const isMealLine = id === "cardapio" || id === "performance" || id === "tradicional";
  const comboLineIndex = id === "performance" ? 1 : id === "tradicional" ? 2 : 0;
  const lineCombo = comboOptions[comboLineIndex];
  const visibleProducts = expanded ? products : products.slice(0, 3);
  const hiddenCount = Math.max(products.length - 3, 0);
  const coverProduct = products[0];

  return (
    <section id={id} className="scroll-mt-24 mx-auto max-w-7xl px-4 py-7 sm:px-5 sm:py-9 md:px-8">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">{eyebrow}</div>
          <h2 className="mt-1.5 text-3xl font-black sm:text-4xl md:text-5xl">
            {id === "cardapio" ? <><span className="text-[#a7b86a]">LINHA FIT</span> <span className="text-[#a7b86a]">• 350 G</span></> : <span className="text-[#a7b86a]">{title}</span>}
          </h2>
          <p className="mt-1.5 text-sm text-white/50 sm:text-base">{subtitle}</p>
        </div>

      </div>

      <button
        type="button"
        onClick={() => { setExpanded((current) => { const next = !current; if (next) { setPurchaseMode("combo"); setSelectedComboQuantity(null); } return next; }); }}
        aria-expanded={expanded}
        aria-controls={`nf-line-options-${id}`}
        className="nf-line-banner group relative mt-4 flex min-h-[150px] w-full items-stretch overflow-hidden rounded-[1.25rem] border border-white/15 bg-[#0d100c] text-left shadow-[0_12px_35px_rgba(0,0,0,.22)] sm:hidden"
      >
        <div className="relative z-10 flex w-[58%] flex-col justify-center p-4 pr-2">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">{id === "cardapio" ? "MARMITAS" : id === "performance" ? "MARMITAS" : id === "tradicional" ? "MARMITAS" : eyebrow}</div>
          <div className="mt-1 text-xl font-black leading-tight text-[#ef7d18]">{id === "cardapio" ? "FIT" : id === "performance" ? "PERFORMANCE" : id === "tradicional" ? "TRADICIONAL" : title.replace("Linha ", "")}</div>
          <div className="mt-0.5 text-lg font-semibold leading-tight text-[#ef7d18]">{id === "cardapio" ? "350 g" : id === "performance" ? "450 g" : id === "tradicional" ? "500 g" : ""}</div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/70">{id === "cardapio" ? "Leve, equilibrada e saborosa." : id === "performance" ? "Mais proteína para o seu resultado." : id === "tradicional" ? "O sabor de sempre, com mais equilíbrio." : subtitle}</div>
        </div>
        <div className="absolute inset-y-0 right-0 w-[53%]">
          {coverProduct && !coverProduct.comingSoon ? (
            coverProduct.crop ? (
              <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverProduct.image})`, backgroundSize: "cover", backgroundPosition: coverProduct.crop }} />
            ) : (
              <img src={coverProduct.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-active:scale-[1.02]" loading="lazy" />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(167,184,106,.18),_transparent_60%),linear-gradient(145deg,#171d10,#080a07)]"><ChefHat size={54} className="text-[#a7b86a]" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d100c] via-[#0d100c]/25 to-transparent" />
        </div>
        <div className="absolute bottom-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-[#ef7d18] text-black shadow-lg">
          {expanded ? <ChevronUp size={21} strokeWidth={2.8} /> : <ArrowRight size={21} strokeWidth={2.8} />}
        </div>
      </button>

      {expanded && isMealLine && (
        <div className="mt-4 space-y-3 sm:hidden">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#11140e] p-1.5">
            <button type="button" onClick={() => { setPurchaseMode("combo"); setSelectedComboQuantity(null); }} className={`rounded-xl px-2 py-3 text-center transition ${purchaseMode === "combo" ? "bg-[#ef7d18] text-black" : "bg-white/[.04] text-white/65"}`}>
              <span className="block text-sm font-black">Montar combo</span>
              <span className="mt-0.5 block text-[10px] font-medium">(com desconto)</span>
            </button>
            <button type="button" onClick={() => { setPurchaseMode("individual"); setSelectedComboQuantity(null); }} className={`rounded-xl px-2 py-3 text-center transition ${purchaseMode === "individual" ? "bg-[#ef7d18] text-black" : "bg-white/[.04] text-white/65"}`}>
              <span className="block text-sm font-black">Compra individual</span>
              <span className="mt-0.5 block text-[10px] font-medium">(sem desconto)</span>
            </button>
          </div>

          {purchaseMode === "combo" && selectedComboQuantity === null && (
            <div className="rounded-2xl border border-white/10 bg-[#0c0e0b] p-3">
              <h3 className="text-base font-black">Escolha a quantidade do combo</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([5, 7, 10, 20] as const).map((quantity) => {
                  const price = (lineCombo.prices as Record<number, string>)[quantity];
                  const unitPrice = parseMoney(price) / quantity;
                  return (
                    <button key={quantity} type="button" onClick={() => setSelectedComboQuantity(quantity)} className="rounded-2xl border border-white/15 bg-[#11140e] p-3 text-left transition active:scale-[.99] hover:border-[#ef7d18]">
                      <span className="block text-sm font-black">{quantity} marmitas</span>
                      <span className="mt-1 block text-xl font-black text-[#c8dc36]">{price}</span>
                      <span className="mt-0.5 block text-xs text-white/60">{money(unitPrice)} cada</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {purchaseMode === "combo" && selectedComboQuantity !== null && (
            <div className="rounded-2xl border border-[#a7b86a]/25 bg-[#0c0e0b] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-[#a7b86a]">Combo selecionado</div>
                  <div className="mt-0.5 text-sm font-black">{selectedComboQuantity} marmitas • {(lineCombo.prices as Record<number, string>)[selectedComboQuantity]}</div>
                </div>
                <button type="button" onClick={() => setSelectedComboQuantity(null)} className="text-xs font-black text-[#ef7d18] underline underline-offset-4">Alterar</button>
              </div>
              <ComboBuilder key={`${id}-${selectedComboQuantity}`} initialLine={comboLineIndex} initialQuantity={selectedComboQuantity} initialStep={2} autoScroll={false} />
            </div>
          )}
        </div>
      )}

      <div id={`nf-line-options-${id}`} className={expanded && (!isMealLine || purchaseMode === "individual") ? "block" : "hidden sm:block"}>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <div key={product.name} className={!expanded && visibleProducts.indexOf(product) === 2 ? "hidden lg:block" : ""}>
            <ProductCard product={product} onAdd={onAdd} />
          </div>
        ))}
        </div>
      </div>
      {expanded && id === "tradicional" && (
        <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-[#a7b86a]/25 bg-gradient-to-br from-[#171d10] via-[#11150d] to-[#0b0e09]">
          <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">Linha Tradicional • complementos</div>
            <h3 className="mt-1 text-2xl font-black sm:text-3xl">COMPLEMENTE <span className="text-[#ef7d18]">SUA REFEIÇÃO</span></h3>
            <p className="mt-1.5 text-sm text-white/45">Adicione um acompanhamento ou uma porção extra sem sair da Linha Tradicional.</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-2 md:grid-cols-4">
            {traditionalComplements.map((item) => (
              <article key={item.name} className="bg-[#0d100c] p-3.5 sm:p-4">
                <div className="grid min-h-[118px] content-between">
                  <div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#ef7d18]/25 bg-[#ef7d18]/10 text-xl">
                      {item.name === "Arroz Branco" ? "🍚" : item.name === "Feijão" ? "🫘" : item.name === "Farofa" ? "🥘" : item.name === "Purê de Batata" ? "🥔" : item.name === "Macarrão" ? "🍝" : item.name === "Couve Refogada" ? "🥬" : "🥩"}
                    </div>
                    <h4 className="mt-2.5 text-sm font-black leading-tight sm:text-base">{item.name}</h4>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-white/30">{item.weight}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-base font-black text-[#ef7d18]">{item.price}</span>
                    <button type="button" onClick={() => onAdd(item)} aria-label={"Adicionar " + item.name} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#a7b86a] text-black transition hover:scale-105"><Plus size={17} strokeWidth={3} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 bg-black/15 px-4 py-3 text-[11px] font-bold text-white/35 sm:px-5">
            <ChefHat size={15} className="shrink-0 text-[#ef7d18]" />
            <span>A porção de carne acompanha a opção disponível na produção do dia.</span>
          </div>
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-[1.15rem] border border-[#a7b86a]/45 bg-[#a7b86a]/[.07] px-4 py-3.5 text-xs font-black text-[#d5e19e] transition hover:border-[#a7b86a]/70 hover:bg-[#a7b86a]/[.12] active:scale-[.99] sm:flex sm:mt-4 sm:py-4 sm:text-sm"
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
  const [juiceShowcaseIndex, setJuiceShowcaseIndex] = useState(0);
  const [selectedJuiceSize, setSelectedJuiceSize] = useState<"500 ml" | "300 ml">("500 ml");
  const [comboOpen, setComboOpen] = useState(false);
  const [comboLineIndex, setComboLineIndex] = useState(0);
  const [topComboOpen, setTopComboOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  const bannerSlides = [
    { image: "/images/nutrifit-banner-1-fit.png", eyebrow: "Nutrifit • Juiz de Fora", title: "Marmitas fitness, sabor e praticidade para sua rotina.", text: "Escolha suas refeições, monte seu pedido e receba em casa.", cta: "Ver cardápio", href: "#cardapio", source: "banner_cardapio" },
    { image: "/images/nutrifit-banner-2-tradicional.png", eyebrow: "Linha FIT • 350 g", title: "Comida de verdade para quem quer comer bem.", text: "Opções equilibradas para variar sua rotina sem abrir mão do sabor.", cta: "Conhecer a FIT", href: "#cardapio", source: "banner_fit" },
    { image: "/images/nutrifit-banner-3-plano.png", eyebrow: "Plano alimentar personalizado", title: "Você traz o plano. A Nutrifit prepara as refeições.", text: "Marmitas personalizadas de acordo com suas metas e orientação nutricional.", cta: "Saiba como funciona", href: "#plano-alimentar", source: "banner_nutricionista", benefits: [
      { label: "Alimentação planejada", icon: "apple" },
      { label: "Suporte às suas metas", icon: "dumbbell" },
      { label: "Mais saúde e resultados", icon: "clipboard" },
    ] },
  ] as const;

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("nutrifit_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as OrderItem[];
        if (Array.isArray(parsed)) setOrderItems(parsed);
      }
    } catch {}
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      if (orderItems.length) window.localStorage.setItem("nutrifit_cart", JSON.stringify(orderItems));
      else window.localStorage.removeItem("nutrifit_cart");
    } catch {}
  }, [cartHydrated, orderItems]);

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
  const [orderCaptureError, setOrderCaptureError] = useState(false);
  const fullOrderSubmitLock = useRef(false);
  const [fullOrderSubmitting, setFullOrderSubmitting] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [profileMarketing, setProfileMarketing] = useState(false);
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "success" | "error" | "exists">("idle");
  const [clubDiscount, setClubDiscount] = useState(0);
  const [leadPromptOpen, setLeadPromptOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code:string;discount_type:string;discount_value:number;minimum_order_value:number}|null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderCep, setOrderCep] = useState("");
  const [orderStreet, setOrderStreet] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderComplement, setOrderComplement] = useState("");
  const [orderNeighborhood, setOrderNeighborhood] = useState("");
  const [orderCity, setOrderCity] = useState("");
  const [orderState, setOrderState] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderDelivery, setOrderDelivery] = useState<DeliveryResult | null>(null);
  const [orderDeliveryStatus, setOrderDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const orderSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const orderFreeDelivery = orderCount >= DELIVERY_FREE_FROM;
  const orderDeliveryFee = orderFreeDelivery ? 0 : (orderDelivery?.fee ?? 0);
  const couponDiscount = appliedCoupon && orderSubtotal >= Number(appliedCoupon.minimum_order_value || 0)
    ? (appliedCoupon.discount_type === "percent" || appliedCoupon.discount_type === "percentage")
      ? Math.min(orderSubtotal, orderSubtotal * Number(appliedCoupon.discount_value || 0) / 100)
      : Math.min(orderSubtotal, Number(appliedCoupon.discount_value || 0))
    : 0;
  const orderDiscount = couponDiscount > 0 ? couponDiscount : Math.min(clubDiscount, orderSubtotal);
  const discountLabel = couponDiscount > 0 ? "Cupom " + appliedCoupon!.code : "Clube Nutrifit";
  const orderGrandTotal = Math.max(0, orderSubtotal - orderDiscount + orderDeliveryFee);
  const orderPhoneDigits = customerPhone.replace(/\D/g, "");
  const orderCustomerReady = Boolean(customerName.trim() && orderPhoneDigits.length >= 10);
  const orderDeliveryReady = Boolean(orderDelivery && orderStreet.trim() && orderNumber.trim() && orderNeighborhood.trim() && orderCity.trim() && orderState.trim());
  const canFinalizeOrder = Boolean(orderItems.length && orderCustomerReady && orderDeliveryReady);

  const calculateOrderDelivery = async () => {
    const cleanCep = orderCep.replace(/\D/g, "");
    if (cleanCep.length !== 8) { setOrderDelivery(null); setOrderDeliveryStatus("error"); return; }
    setOrderDeliveryStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro || !data.bairro) throw new Error("CEP");
      setOrderStreet(data.logradouro || "");
      setOrderNeighborhood(data.bairro || "");
      setOrderCity(data.localidade || "");
      setOrderState(data.uf || "");
      const result = findDelivery(data.bairro);
      if (!result && orderCount < DELIVERY_FREE_FROM) throw new Error("bairro");
      setOrderDelivery(result || { zone: "Frete grátis", fee: 0, neighborhood: data.bairro });
      setOrderDeliveryStatus("idle");
    } catch {
      setOrderDelivery(null);
      setOrderDeliveryStatus("error");
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponMessage("Digite o código do cupom."); setCouponStatus("error"); return; }
    setCouponStatus("loading"); setCouponMessage("");
    try {
      const response = await fetch(SUPABASE_URL + "/functions/v1/validate-nutrifit-coupon", {
        method: "POST",
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ p_code: code, p_order_total: orderSubtotal }),
      });
      const data = await response.json();
      if (!response.ok || !data?.valid) throw new Error(data?.message || "Cupom inválido.");
      setAppliedCoupon({
        code: String(data.code),
        discount_type: String(data.discount_type),
        discount_value: Number(data.discount_value || 0),
        minimum_order_value: Number(data.minimum_order_value || 0),
      });
      setCouponStatus("success");
      setCouponMessage("Cupom aplicado com sucesso.");
    } catch (error) {
      setAppliedCoupon(null);
      setCouponStatus("error");
      setCouponMessage(error instanceof Error ? error.message : "Não foi possível validar o cupom.");
    }
  };
  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponStatus("idle");
    setCouponMessage("");
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
  const shareVisualOrder = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#080a08";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#a7b86a";
    ctx.fillRect(0, 0, canvas.width, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 54px Arial";
    ctx.fillText("NUTRIFIT", 64, 100);
    ctx.fillStyle = "#ef7d18";
    ctx.fillRect(64, 125, 952, 4);
    ctx.fillStyle = "#a7b86a";
    ctx.font = "bold 34px Arial";
    ctx.fillText("RESUMO DO PEDIDO", 64, 190);
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Arial";
    let y = 250;
    const maxWidth = 930;
    const drawWrapped = (text: string, font = "28px Arial") => {
      ctx!.font = font;
      const words = text.split(" ");
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx!.measureText(test).width > maxWidth && line) {
          ctx!.fillText(line, 64, y);
          y += 40;
          line = word;
        } else line = test;
      }
      if (line) { ctx!.fillText(line, 64, y); y += 48; }
    };
    drawWrapped("CLIENTE: " + (customerName.trim() || "A informar"));
    drawWrapped("WHATSAPP: " + (customerPhone.trim() || "A informar"));
    y += 10;
    ctx.fillStyle = "#ef7d18";
    drawWrapped("ITENS DO PEDIDO", "bold 32px Arial");
    ctx.fillStyle = "#ffffff";
    orderItems.forEach((item) => {
      drawWrapped(item.quantity + "x " + item.name, "bold 27px Arial");
      drawWrapped(item.line + " • " + item.weight + " • " + money(item.price * item.quantity), "24px Arial");
    });
    y += 8;
    ctx.fillStyle = "#a7b86a";
    drawWrapped("RESUMO DOS VALORES", "bold 32px Arial");
    ctx.fillStyle = "#ffffff";
    drawWrapped("Subtotal: " + money(orderSubtotal));
    drawWrapped(discountLabel + ": -" + money(orderDiscount));
    drawWrapped("Frete: " + (orderDeliveryFee === 0 ? "Grátis" : money(orderDeliveryFee)));
    ctx.fillStyle = "#173d20";
    ctx.fillRect(48, y - 4, 984, 90);
    ctx.fillStyle = "#baf58b";
    drawWrapped("TOTAL A PAGAR: " + money(orderGrandTotal), "bold 38px Arial");
    y += 26;
    ctx.fillStyle = "#ef7d18";
    drawWrapped("ENTREGA", "bold 32px Arial");
    ctx.fillStyle = "#ffffff";
    drawWrapped(orderDelivery ? (orderFreeDelivery ? "Frete grátis" : "Frete: " + money(orderDeliveryFee)) : "Taxa/endereço a confirmar");
    if (orderStreet.trim()) drawWrapped("ENDEREÇO: " + orderStreet.trim() + ", nº " + orderNumber.trim(), "bold 27px Arial");
    if (orderComplement.trim()) drawWrapped("Complemento: " + orderComplement.trim());
    if (orderNeighborhood.trim()) drawWrapped("Bairro: " + orderNeighborhood.trim());
    if (orderCity.trim() || orderState.trim()) drawWrapped("Cidade/UF: " + orderCity.trim() + "/" + orderState.trim());
    if (orderCep) drawWrapped("CEP: " + orderCep);
    if (orderReference.trim()) drawWrapped("Referência: " + orderReference.trim());
    if (orderNotes.trim()) drawWrapped("Observações: " + orderNotes.trim());
    y += 12;
    ctx.fillStyle = "#a7b86a";
    drawWrapped("PAGAMENTO VIA PIX", "bold 30px Arial");
    ctx.fillStyle = "#ffffff";
    drawWrapped("Chave Pix: " + PIX_KEY, "26px Arial");
    drawWrapped("Confira os dados antes de pagar.", "24px Arial");
    ctx.fillStyle = "#ef7d18";
    ctx.fillRect(64, 1325, 952, 3);
    ctx.fillStyle = "#bdbdbd";
    ctx.font = "22px Arial";
    ctx.fillText("@nutrifit_jf • Juiz de Fora/MG", 64, 1365);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "pedido-nutrifit.png", { type: "image/png" });
      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Resumo do pedido NutriFit", text: "Resumo visual do meu pedido NutriFit." });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "pedido-nutrifit.png";
          a.click();
          URL.revokeObjectURL(url);
          window.alert("Imagem salva. Anexe o arquivo à conversa do WhatsApp para enviar o resumo visual.");
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") console.error("share order image", error);
      }
    }, "image/png");
  };

  const sendFullOrder = async () => {
    if (fullOrderSubmitLock.current || !orderItems.length || !orderCustomerReady || !orderDeliveryReady) return;
    fullOrderSubmitLock.current = true;
    setFullOrderSubmitting(true);

    const lines = orderItems.map((item, i) => {
      const itemSubtotal = item.price * item.quantity;
      return `*${i + 1}. ${item.quantity}x ${item.name}*\n   ${item.line} • ${item.weight} • ${money(item.price)} cada\n   💵 ${money(itemSubtotal)}`;
    }).join("\n\n");

    const notesText = orderNotes.trim();
    const deliverySummary = orderFreeDelivery
      ? `🚚 *Entrega grátis* — pedido com ${orderCount} itens${orderCep ? " • CEP " + orderCep : ""}`
      : orderDelivery
        ? `🚚 *${orderDelivery.fee === 0 ? "Entrega grátis" : "Entrega " + money(orderDelivery.fee)}* — ${orderDelivery.neighborhood || "bairro identificado"}${orderCep ? " • CEP " + orderCep : ""}`
        : "🚚 Taxa de entrega a confirmar pelo WhatsApp";

    const message = [
      "🥗 *NUTRIFIT • NOVO PEDIDO*",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "👤 *CLIENTE*",
      `Nome: ${customerName.trim() || "A informar"}`,
      `WhatsApp: ${customerPhone.trim() || "A informar"}`,
      "",
      "🛒 *ITENS DO PEDIDO*",
      "",
      lines,
      "",
      "━━━━━━━━━━━━━━━━━━━━",
      "💰 *RESUMO DO PEDIDO*",
      `📦 Quantidade: *${orderCount} item(ns)*`,
      `Subtotal: *${money(orderSubtotal)}*`,
      `🎁 ${discountLabel}: *-${money(orderDiscount)}*`,
      `🚚 Frete: *${money(orderDeliveryFee)}*`,
      `💵 *TOTAL A PAGAR: ${money(orderGrandTotal)}*`,
      "",
      "📍 *ENTREGA*",
      deliverySummary,
      `📍 Endereço: ${orderStreet.trim()}, nº ${orderNumber.trim()}`,
      ...(orderComplement.trim() ? [`Complemento: ${orderComplement.trim()}`] : []),
      `Bairro: ${orderNeighborhood.trim()}`,
      `Cidade/UF: ${orderCity.trim()}/${orderState.trim()}`,
      `CEP: ${orderCep}`,
      ...(orderReference.trim() ? [`Referência: ${orderReference.trim()}`] : []),
      ...(notesText ? ["", "📝 *OBSERVAÇÕES*", notesText] : []),
      "",
      "💳 *PAGAMENTO VIA PIX*",
      `Chave Pix: ${PIX_KEY}`,
      "📲 Envie o comprovante por este WhatsApp após o pagamento.",
      "",
      "✅ *Pedido conferido pelo cliente.*",
    ].join("\n");
    const acquisitionSource = window.localStorage.getItem("nutrifit_acquisition_source") || getAcquisitionSource();
    trackClick("order_started", acquisitionSource);

    // Evita abrir about:blank no Safari/iPhone.
    // Após confirmar o registro, redireciona esta mesma aba para o WhatsApp.
    const whatsappUrl = whatsappOrder(message);
    setOrderCaptureError(false);

    try {
      const orderResponse = await fetch(SUPABASE_URL + "/functions/v1/create-customer-order", {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify({
          customer_name: customerName.trim(),
          whatsapp: orderPhoneDigits,
          items: orderItems.map(({ name, line, weight, quantity }) => ({ name, line, weight, quantity })),
          coupon_code: appliedCoupon?.code || null,
          club_welcome_discount: !appliedCoupon && clubDiscount > 0,
          delivery_fee: orderDeliveryFee,
          cep: orderCep.replace(/\\D/g, "") || null,
          street: orderStreet.trim(),
          address_number: orderNumber.trim(),
          address_complement: orderComplement.trim() || null,
          neighborhood: orderNeighborhood.trim() || orderDelivery?.neighborhood || null,
          city: orderCity.trim(),
          state: orderState.trim(),
          address_reference: orderReference.trim() || null,
          notes: notesText || null,
          acquisition_source: acquisitionSource,
          acquisition_campaign: window.localStorage.getItem("nutrifit_acquisition_campaign") || null,
          acquisition_medium: window.localStorage.getItem("nutrifit_acquisition_medium") || null,
          acquisition_content: window.localStorage.getItem("nutrifit_acquisition_content") || null,
        }),
      });
      const result = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok || result.ok !== true) {
        throw new Error(typeof result.error === "string" ? result.error : "Falha ao registrar o pedido.");
      }

      if (couponDiscount > 0 && appliedCoupon) {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponStatus("idle");
        setCouponMessage("");
      } else if (clubDiscount > 0) {
        setClubDiscount(0);
        try {
          const saved = JSON.parse(window.localStorage.getItem("nutrifit_profile") || "{}");
          window.localStorage.setItem("nutrifit_profile", JSON.stringify({ ...saved, couponUsed: true }));
        } catch {}
      }

      setOrderItems([]);
      setOrderOpen(false);
      const officialItems = Array.isArray(result.items) ? result.items.map((item: { name: string; line: string; weight: string; price: number; quantity: number }, index: number) =>
        `${index + 1}. ${item.quantity}x ${item.name} | ${money(Number(item.price))} cada | ${money(Number(item.price) * Number(item.quantity))}`
      ).join("\n") : "";
      const officialBlock = [
        "ITENS E VALORES CONFIRMADOS PELO SISTEMA",
        officialItems,
        `Subtotal oficial: ${money(Number(result.subtotal))}`,
        `Frete oficial: ${money(Number(result.delivery_fee))}`,
        `TOTAL OFICIAL: ${money(Number(result.total))}`,
      ].join("\n");
      const officialMessage = message.replace(/ITENS DO PEDIDO[\s\S]*?(?=ENDEREÇO \/ RECEBIMENTO)/, officialBlock + "\n\n");
      const reference = result.order_id ? `\n\n🧾 *Referência do pedido:* ${result.order_id}` : "";
      const finalUrl = whatsappOrder(officialMessage + reference);
      window.location.href = finalUrl;
    } catch (error) {
      fullOrderSubmitLock.current = false;
      setFullOrderSubmitting(false);
      console.error("order capture", error);
      // Fail closed: não abrir WhatsApp nem permitir pagamento com pedido não registrado.
      // Mantém o cliente no checkout em caso de erro.
      setOrderCaptureError(true);
    }
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

  const dismissLeadPrompt = () => {
    try {
      window.sessionStorage.setItem("nutrifit_lead_prompt_seen", "1");
    } catch {}
    setLeadPromptOpen(false);
  };

  useEffect(() => {
    try {
      const acquisition = getAcquisitionData();
      const previousSource = window.localStorage.getItem("nutrifit_acquisition_source");
      if (!previousSource || acquisition.source !== "direct") {
        window.localStorage.setItem("nutrifit_acquisition_source", acquisition.source);
      }
      if (acquisition.campaign) window.localStorage.setItem("nutrifit_acquisition_campaign", acquisition.campaign);
      if (acquisition.medium) window.localStorage.setItem("nutrifit_acquisition_medium", acquisition.medium);
      if (acquisition.content) window.localStorage.setItem("nutrifit_acquisition_content", acquisition.content);
      void fetch(SUPABASE_URL + "/rest/v1/acquisition_events", {
        method: "POST",
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        keepalive: true,
        body: JSON.stringify({
          event: "site_visit",
          source: acquisition.source,
          page: window.location.pathname,
          metadata: { campaign: acquisition.campaign || null, medium: acquisition.medium || null, content: acquisition.content || null },
        }),
      }).catch(() => {});
    } catch {}
    try {
      const saved = JSON.parse(window.localStorage.getItem("nutrifit_profile") || "null");
      const leadPromptSeen = window.sessionStorage.getItem("nutrifit_lead_prompt_seen") === "1";
      if (!saved?.nutrifitClub && !leadPromptSeen) setLeadPromptOpen(true);
    } catch {
      setLeadPromptOpen(true);
    }
  }, []);

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
          acquisition_source: window.localStorage.getItem("nutrifit_acquisition_source") || getAcquisitionSource(),
          acquisition_campaign: window.localStorage.getItem("nutrifit_acquisition_campaign") || null,
          acquisition_medium: window.localStorage.getItem("nutrifit_acquisition_medium") || null,
          acquisition_content: window.localStorage.getItem("nutrifit_acquisition_content") || null,
        }),
      });

      if (response.status === 409) {
        // Cliente já cadastrado: transformar o cadastro existente em Club sem duplicar o perfil.
        const existingResponse = await fetch(
          SUPABASE_URL + "/rest/v1/customer_profiles?select=id,nutrifit_club_member,nutrifit_club_joined_at,marketing_consent,email,name&whatsapp=eq." + encodeURIComponent(phone) + "&limit=1",
          { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
        );
        const existingProfiles = await existingResponse.json();
        const existing = Array.isArray(existingProfiles) ? existingProfiles[0] : null;
        if (!existingResponse.ok || !existing?.id) throw new Error("existing-profile");

        const wasClubMember = existing.nutrifit_club_member === true;
        const existingPatch = {
          name,
          email: email || existing.email || null,
          birth_date: birthDate,
          nutrifit_club_member: true,
          nutrifit_club_joined_at: existing.nutrifit_club_joined_at || new Date().toISOString(),
          marketing_consent: profileMarketing || existing.marketing_consent === true,
          marketing_consent_at: profileMarketing ? new Date().toISOString() : null,
        };

        const patchResponse = await fetch(
          SUPABASE_URL + "/rest/v1/customer_profiles?id=eq." + encodeURIComponent(existing.id),
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify(existingPatch),
          },
        );
        if (!patchResponse.ok) throw new Error("existing-profile-update");

        const effectiveEmail = String(existingPatch.email || "").trim().toLowerCase();
        const effectiveMarketing = existingPatch.marketing_consent === true;

        window.localStorage.setItem("nutrifit_profile", JSON.stringify({
          name,
          phone,
          email: effectiveEmail,
          birthDate,
          marketing: effectiveMarketing,
          nutrifitClub: true,
          couponUsed: false,
        }));
        setClubDiscount(wasClubMember ? 0 : 5);
        setCustomerName(name);
        setCustomerPhone(phone);

        // Só dispara a jornada para quem está entrando no Club agora.
        if (!wasClubMember && effectiveEmail && effectiveMarketing) {
          void fetch("/api/club-automation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              email: effectiveEmail,
              firstName: name.split(/\s+/)[0] || name,
              whatsapp: phone,
              clubMember: true,
              marketingConsent: true,
            }),
          }).catch((error) => console.error("club automation trigger", error));
        }

        setProfileStatus("success");
        const acquisitionSource = window.localStorage.getItem("nutrifit_acquisition_source") || getAcquisitionSource();
        trackClick("profile_save", acquisitionSource);
        trackClick("lead_captured", acquisitionSource);
        window.setTimeout(() => setProfileOpen(false), 700);
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

      if (email && profileMarketing) {
        void fetch("/api/club-automation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            email,
            firstName: name.split(/\s+/)[0] || name,
            whatsapp: phone,
            clubMember: true,
            marketingConsent: true,
          }),
        }).catch((error) => console.error("club automation trigger", error));
      }

      setProfileStatus("success");
      const acquisitionSource = window.localStorage.getItem("nutrifit_acquisition_source") || getAcquisitionSource();
      trackClick("profile_save", acquisitionSource);
      trackClick("lead_captured", acquisitionSource);
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

  const openTopComboBuilder = () => {
    setTopComboOpen(true);
    trackClick("combo_builder_start", "FIT-top-card");
  };

  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050605]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-1.5 px-2.5 sm:h-[80px] sm:gap-2 sm:px-4 md:h-[82px] md:gap-5 md:px-7">
          <a href="#inicio" aria-label="Nutrifit — início" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0b0d09] sm:h-10 sm:w-10">
              <img src="/images/nutrifit-logo-icon.svg" alt="Nutrifit" className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
            </span>
            <span className="leading-none">
              <span className="text-[16px] font-black tracking-[-.04em] text-white sm:text-[22px] md:text-[28px]">NUTRI<span className="text-[#ef7d18]">FIT</span></span>
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
            <a href="#entrega" className="text-sm font-black text-white/85 hover:text-white">ENTREGA</a>
            <a href="#faq" className="text-sm font-black text-white/85 hover:text-white">FAQ</a>
            <a href="#b2b" className="text-sm font-black text-white/85 hover:text-white">EMPRESAS</a>
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
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
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
          className="absolute inset-0 z-10 flex items-center bg-[linear-gradient(90deg,#000_0%,#000_38%,rgba(0,0,0,.72)_54%,rgba(0,0,0,.18)_76%,transparent_100%)]"
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

      <section aria-label="Atalhos nutricionais" className="mobile-home-only border-b border-white/10 bg-[#0b0e09] px-3 py-3 sm:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
          <a href={whatsappOrder("Olá Nutrifit! Tenho um plano alimentar e quero transformar em marmitas.")} onClick={() => trackClick("mobile_nutrition_click", "meu_plano")} className="flex min-h-[100px] flex-col justify-between rounded-2xl border border-[#a7b86a]/40 bg-[#a7b86a]/[.06] p-3">
            <ClipboardCheck size={22} className="text-[#a7b86a]" />
            <span><span className="block text-xs font-black">Tenho meu plano</span><span className="mt-1 block text-[10px] leading-4 text-white/55">Transforme suas orientações em refeições.</span></span>
            <span className="text-[10px] font-black text-[#a7b86a]">Acessar <ArrowRight size={12} className="ml-1 inline" /></span>
          </a>
          <a href="https://wa.me/553299925617?text=Ol%C3%A1%2C%20Deuslene%21%20Vim%20pelo%20site%20da%20Nutrifit%20e%20gostaria%20de%20falar%20sobre%20orienta%C3%A7%C3%A3o%20nutricional." onClick={() => trackClick("mobile_nutrition_click", "atendimento_nutricional")} className="flex min-h-[100px] flex-col justify-between rounded-2xl border border-[#ef7d18]/45 bg-[#ef7d18]/[.04] p-3">
            <Stethoscope size={22} className="text-[#ef7d18]" />
            <span><span className="block text-xs font-black">Atendimento nutricional</span><span className="mt-1 block text-[10px] leading-4 text-white/55">Fale com a nutricionista.</span></span>
            <span className="text-[10px] font-black text-[#ef7d18]">Falar agora <ArrowRight size={12} className="ml-1 inline" /></span>
          </a>
        </div>
      </section>

      <section aria-label="Benefício de cadastro" className="border-b border-[#ef7d18]/20 bg-[#15120d]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 text-center sm:flex-row sm:px-5 sm:text-left md:px-8">
          <div><div className="text-[10px] font-black uppercase tracking-[.18em] text-[#ef7d18]">Clube Nutrifit</div><div className="mt-0.5 text-sm font-black text-white">Imagine ter suas refeições da semana já resolvidas. 💚</div><div className="text-[11px] text-white/45">Gostosas. Práticas. Do seu jeito. Você escolhe. A Nutrifit prepara.</div></div>
          <button type="button" onClick={openProfile} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[#ef7d18] px-5 py-2.5 text-xs font-black text-black transition hover:scale-[1.02]">🎁 Descobrir meu benefício <ArrowRight size={15} className="ml-2" /></button>
        </div>
      </section>

      <Section id="cardapio" eyebrow="Saudável, equilibrada, leve" title="Linha Fit • 350 g" subtitle="Marmitas 350 g para o seu dia a dia. Unidade R$ 23,97." products={fit} featuredNames={["Patinho com Abóbora","Frango Grelhado com Mix de Legumes"]} onAdd={addToOrder} />

      <Section id="performance" eyebrow="Alta proteína e energia" title="Linha Performance • 450 g" subtitle="Frango R$ 27,90 • Bovina R$ 29,90." products={performance} featuredNames={[performance[0]?.name || "", performance[1]?.name || ""]} onAdd={addToOrder} />
      <Section id="tradicional" eyebrow="Sabor caseiro" title="Linha Tradicional • 500 g" subtitle="Opções de R$ 26,90 a R$ 29,90." products={traditional} featuredNames={[traditional[0]?.name || "", traditional[1]?.name || ""]} onAdd={addToOrder} />
      <Section id="saladas" eyebrow="Frescor, leveza e nutrição" title="Linha Saladas • 350 g" subtitle="Saladas vendidas por unidade • R$ 21,90." products={salads} featuredNames={[salads[0]?.name || "", salads[1]?.name || ""]} onAdd={addToOrder} />
      <section id="sucos" className="scroll-mt-[100px] overflow-hidden border-y border-white/10 bg-black">
        <div className="mx-auto max-w-[1500px] px-2 py-3 sm:px-5 sm:py-6 lg:px-7">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_24px_90px_rgba(0,0,0,.55)]">
          <div className="relative isolate min-h-[440px] overflow-hidden bg-black sm:min-h-[590px] lg:min-h-[720px]">
            <img key={juiceShowcaseIndex} src={juiceFlavors[juiceShowcaseIndex]?.image || "/images/page-42.jpg"} alt={`Suco Nutrifit ${juiceFlavors[juiceShowcaseIndex]?.name || "Laranja"}`} className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[1.12] contrast-[1.05] saturate-[1.2] transition-opacity duration-500 lg:brightness-100 lg:contrast-100 lg:saturate-100"/>
            <div className="absolute inset-0 -z-10 bg-black/15 lg:bg-black/35"/>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-black/5 lg:from-black/65 lg:via-black/15 lg:to-black/90"/>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/5 via-transparent to-black/30"/>

            <div className="absolute left-3 top-3 z-20 sm:left-5 sm:top-5">
              <span className="rounded-full border border-[#a7b86a]/60 bg-black/60 px-3 py-2 text-[10px] font-black tracking-wider text-[#d8e7a0] backdrop-blur-sm sm:text-xs">NUTRIFIT • SUCOS</span>
            </div>

            <button type="button" aria-label="Sabor anterior" onClick={() => setJuiceShowcaseIndex((current) => (current - 1 + juiceFlavors.length) % juiceFlavors.length)} className="hidden lg:grid absolute left-5 top-1/2 z-30 h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-2 border-[#ef7d18] bg-black/75 text-2xl text-[#ef7d18] transition hover:bg-black">‹</button>
            <button type="button" aria-label="Próximo sabor" onClick={() => setJuiceShowcaseIndex((current) => (current + 1) % juiceFlavors.length)} className="hidden lg:grid absolute right-5 top-1/2 z-30 h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-2 border-[#ef7d18] bg-black/75 text-2xl text-[#ef7d18] transition hover:bg-black">›</button>

            <div className="hidden lg:block">
              <div className="relative z-10 grid min-h-[720px] grid-cols-[205px_minmax(0,1fr)_355px] content-start gap-5 px-10 pb-[165px] pt-10 xl:grid-cols-[220px_minmax(0,1fr)_385px]">
                <aside className="flex flex-col justify-center gap-5">
                  {[
                    { icon: Leaf, title: "100% natural" },
                    { icon: Check, title: "Sem conservantes" },
                    { icon: ShoppingBag, title: "Sem adição de açúcar" },
                    { icon: Apple, title: "Ingredientes selecionados" },
                  ].map((feature) => {
                    const FeatureIcon = feature.icon;
                    return <div key={feature.title} className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#a7b86a] bg-black/30 text-[#a7b86a]"><FeatureIcon size={22} strokeWidth={1.5}/></span>
                      <span className="max-w-[120px] text-[11px] font-semibold uppercase leading-4 text-white drop-shadow">{feature.title}</span>
                    </div>;
                  })}
                </aside>
                <div className="hidden min-w-0 xl:block" aria-hidden="true"/>
                <div className="min-w-0 self-center rounded-xl border border-white/10 bg-black/45 p-5 backdrop-blur-[2px]">
                  <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#a7b86a]">Linha de sucos</p>
                  <h3 className="mt-1 text-3xl font-black uppercase leading-none text-[#ef7d18] drop-shadow sm:text-4xl lg:text-5xl">{juiceFlavors[juiceShowcaseIndex]?.name === "Suco de Laranja" ? "Laranja" : juiceFlavors[juiceShowcaseIndex]?.name === "Abacaxi com Hortelã" ? "Abacaxi" : juiceFlavors[juiceShowcaseIndex]?.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-white drop-shadow sm:text-sm">{juiceFlavors[juiceShowcaseIndex]?.description || "Suco natural Nutrifit."}</p>
                  <div className="mt-3 rounded-xl border border-white/15 bg-black/45 p-3 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#a7b86a] sm:text-xs">Ingredientes</p>
                    <p className="mt-1 text-[11px] leading-5 text-white sm:text-xs">{(juiceFlavors[juiceShowcaseIndex]?.ingredients || []).join(" • ")}</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[.16em] text-[#ef7d18] sm:text-xs">Destaques do sabor</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(juiceFlavors[juiceShowcaseIndex]?.highlights || []).map((highlight) => <span key={highlight} className="rounded-full border border-[#a7b86a]/40 bg-[#a7b86a]/10 px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]">{highlight}</span>)}
                    </div>
                  </div>
                  <JuiceNutritionDetails flavor={juiceFlavors[juiceShowcaseIndex] || juiceFlavors[0]} compact />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-white sm:text-xs">Escolha o tamanho</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {([{ size: "500 ml" as const, price: getJuicePrice(juiceFlavors[juiceShowcaseIndex]?.name || "", "500 ml") }, { size: "300 ml" as const, price: getJuicePrice(juiceFlavors[juiceShowcaseIndex]?.name || "", "300 ml") }]).map((option) => (
                      <button key={option.size} type="button" aria-pressed={selectedJuiceSize === option.size} onClick={() => setSelectedJuiceSize(option.size)} className={`rounded-xl border-2 px-2 py-2 text-center backdrop-blur-sm transition ${selectedJuiceSize === option.size ? "border-[#ef7d18] bg-[#251407]/90 shadow-[0_0_14px_rgba(239,125,24,.24)]" : "border-white/35 bg-black/65 hover:border-white/60"}`}>
                        <span className="block text-xs font-black text-white sm:text-sm">{option.size}</span>
                        <span className={`mt-0.5 block text-base font-black sm:text-lg ${selectedJuiceSize === option.size ? "text-[#ef7d18]" : "text-white"}`}>{option.price}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => {
                    const flavor = juiceFlavors[juiceShowcaseIndex] || juiceFlavors[0];
                    const product = juiceProducts.find((item) => item.name === `${flavor.name} — ${selectedJuiceSize}`);
                    if (product) addToOrder(product);
                  }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff650b] px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#ff7b22] active:scale-[.99] sm:text-base">
                    <ShoppingCart size={20}/> Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/15 bg-black/80 p-3 shadow-[0_12px_40px_rgba(0,0,0,.6)] backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-4 lg:hidden">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Suco natural</p>
                  <h3 className="mt-0.5 text-2xl font-black uppercase leading-none text-[#ef7d18] drop-shadow sm:text-3xl">{juiceFlavors[juiceShowcaseIndex]?.name === "Suco de Laranja" ? "Laranja" : juiceFlavors[juiceShowcaseIndex]?.name === "Abacaxi com Hortelã" ? "Abacaxi" : juiceFlavors[juiceShowcaseIndex]?.name}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" aria-label="Sabor anterior" onClick={() => setJuiceShowcaseIndex((current) => (current - 1 + juiceFlavors.length) % juiceFlavors.length)} className="grid h-8 w-8 place-items-center rounded-full border border-[#ef7d18] bg-black/80 text-xl leading-none text-[#ef7d18] active:scale-95">‹</button>
                  <button type="button" aria-label="Próximo sabor" onClick={() => setJuiceShowcaseIndex((current) => (current + 1) % juiceFlavors.length)} className="grid h-8 w-8 place-items-center rounded-full border border-[#ef7d18] bg-black/80 text-xl leading-none text-[#ef7d18] active:scale-95">›</button>
                  <span className="ml-1 rounded-full border border-[#a7b86a]/40 bg-[#a7b86a]/10 px-2 py-1 text-[9px] font-bold text-[#d8e7a0]">Natural</span>
                </div>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-white/95 sm:text-xs">{juiceFlavors[juiceShowcaseIndex]?.description || "Suco natural Nutrifit."}</p>
              <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-white/75"><span className="font-bold uppercase tracking-wider text-[#a7b86a]">Ingredientes: </span>{(juiceFlavors[juiceShowcaseIndex]?.ingredients || []).join(" • ")}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(juiceFlavors[juiceShowcaseIndex]?.highlights || []).slice(0,2).map((highlight)=><span key={highlight} className="rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-2 py-1 text-[9px] font-semibold text-white/90">{highlight}</span>)}
              </div>
              <JuiceNutritionDetails flavor={juiceFlavors[juiceShowcaseIndex] || juiceFlavors[0]} compact />
              <p className="mt-2.5 text-[10px] font-black uppercase tracking-[.16em] text-white">Escolha o tamanho</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {([{size:"500 ml" as const,price:getJuicePrice(juiceFlavors[juiceShowcaseIndex]?.name||"","500 ml")},{size:"300 ml" as const,price:getJuicePrice(juiceFlavors[juiceShowcaseIndex]?.name||"","300 ml")}]).map(option=>(
                  <button key={option.size} type="button" aria-pressed={selectedJuiceSize===option.size} onClick={()=>setSelectedJuiceSize(option.size)} className={`rounded-xl border-2 px-2 py-1.5 text-center transition ${selectedJuiceSize===option.size?"border-[#ef7d18] bg-[#251407]/90":"border-white/30 bg-black/55"}`}>
                    <span className="block text-[10px] font-black text-white sm:text-xs">{option.size}</span><span className={`mt-0.5 block text-sm font-black sm:text-base ${selectedJuiceSize===option.size?"text-[#ef7d18]":"text-white"}`}>{option.price}</span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={()=>{const flavor=juiceFlavors[juiceShowcaseIndex]||juiceFlavors[0];const product=juiceProducts.find(item=>item.name===`${flavor.name} — ${selectedJuiceSize}`);if(product)addToOrder(product);}} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff650b] px-3 py-2.5 text-xs font-black text-white shadow-lg transition hover:bg-[#ff7b22] active:scale-[.99] sm:text-sm">
                <ShoppingCart size={17}/> Adicionar ao carrinho
              </button>
            </div>
            
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-black/80 p-2.5 sm:mt-4 sm:p-3">
          <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[.18em] text-[#a7b86a]">Explore outros sabores</p>
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto sm:gap-3">
            {juiceFlavors.map((flavor,index)=><button key={flavor.name} type="button" onClick={()=>setJuiceShowcaseIndex(index)} aria-pressed={juiceShowcaseIndex===index} className={`group w-[29%] shrink-0 snap-start overflow-hidden rounded-xl border-2 text-left transition sm:w-[22%] md:w-[18%] lg:w-[13.6%] ${juiceShowcaseIndex===index?"border-[#ef7d18] shadow-[0_0_16px_rgba(239,125,24,.3)]":"border-white/20 hover:border-white/50"}`}>
              <img src={flavor.image} alt={flavor.name} loading="lazy" className="aspect-[1.45/1] w-full object-cover transition duration-300 group-hover:scale-[1.03]"/>
              <span className="block truncate bg-black/90 px-1 py-1.5 text-center text-[10px] font-black uppercase text-white sm:text-xs">{flavor.name==="Suco de Laranja"?"Laranja":flavor.name==="Abacaxi com Hortelã"?"Abacaxi":flavor.name}</span>
            </button>)}
          </div>
        </div>
      </div>
      </div>
      </section>

      <section id="extras" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 md:px-8">
        <div className="mb-4">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Para completar seu pedido</div>
          <h2 className="mt-1.5 text-2xl font-black sm:text-3xl">Complete sua rotina</h2>
          <p className="mt-1.5 text-sm text-white/50">Pequenos extras para acompanhar suas marmitas.</p>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          {([
            ["SANDUÍCHES","🥪","Sanduíches Fit","Práticos e proteicos.","#a7b86a"],
            ["FRUTAS","🍓","Frutas Picadas","Frescas e prontas.","#ef7d18"],
          ] as const).map(([category, icon, title, subtitle, accent]) => {
            const items = comboComplements.filter((item) => item.category === category);
            return (
              <details key={category} className="group overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d100c]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 touch-manipulation [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
                      style={{ backgroundColor: accent + "18", border: `1px solid ${accent}35` }}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: accent }}>
                        {category === "SANDUÍCHES" ? "Prático e proteico" : "Frescas e prontas"}
                      </div>
                      <h3 className="mt-0.5 truncate text-lg font-black">{title}</h3>
                      <p className="mt-0.5 text-[11px] text-white/40">{subtitle}</p>
                    </div>
                  </div>
                  {category === "FRUTAS" && (
                    <img
                      src="/images/frutas-picadas-header.jpg"
                      alt="Porção de frutas frescas picadas Nutrifit"
                      className="h-16 w-20 shrink-0 rounded-xl object-contain object-center bg-black/20 ring-1 ring-white/10 sm:h-20 sm:w-28"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-lg text-white/50 transition group-open:rotate-45 group-open:bg-[#ef7d18] group-open:text-black">+</span>
                </summary>

                <div className="border-t border-white/10">
                  {category === "FRUTAS" && (
                    <div className="border-b border-white/10 bg-[#12150f] px-4 py-2.5 text-[11px] font-bold text-white/45">200 g por porção</div>
                  )}
                  {items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 border-b border-white/5 p-3.5 last:border-b-0">
                      <div className="flex min-w-0 items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                        ) : (
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-2xl">{item.emoji}</div>
                        )}
                        <div className="min-w-0">
                          <div className="break-words text-sm font-black">{item.name}</div>
                          <div className="mt-0.5 truncate text-[11px] text-white/40">{item.description}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Adicionar ${item.name}`}
                        onClick={() => addToOrder({
                          name: item.name,
                          line: category,
                          weight: category === "FRUTAS" ? "200 g" : "100–120 g",
                          price: money(item.price ?? 0),
                          description: item.description,
                          image: item.image || ""
                        })}
                        className="shrink-0 rounded-full border border-[#ef7d18]/40 bg-[#ef7d18]/10 px-3 py-2 text-[10px] font-black text-[#ff9a4b] transition hover:bg-[#ef7d18] hover:text-black sm:px-3.5 sm:text-[11px]"
                      >
                        {money(item.price ?? 0)}
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
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
                  ["TRADICIONAL","500 g","R$ 141,90","Sabor caseiro"],
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


      <section id="planos-mensais" className="scroll-mt-24 mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-14 md:px-8">
        <div className="rounded-[1.5rem] border border-[#a7b86a]/25 bg-gradient-to-br from-[#171d10] to-[#0e110c] p-4 sm:rounded-[2rem] sm:p-7 md:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Plano mensal Nutrifit</div>
            <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">Organize suas refeições do mês</h2>
            <p className="mt-3 leading-6 text-white/50">Escolha 30 ou 60 marmitas e monte os sabores dentro da mesma linha. O preço por marmita é o mesmo do combo de 20 — sem desconto adicional.</p>
          </div>
          <MonthlyPlanBuilder onAddPlan={addPlanToOrder} />
        </div>
      </section>

      <section id="confianca" className="border-y border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-11 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Praticidade para sua rotina</div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl md:text-5xl">Por que pedir na Nutrifit?</h2>
            <p className="mt-2 text-xs leading-5 text-white/50 sm:text-sm sm:leading-6 md:text-base">Tudo organizado para você escolher, pedir e receber sem complicação.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {[
              ["🍱", "Porções padronizadas", "350 g • 450 g • 500 g."],
              ["🥗", "Tudo em um só lugar", "Marmitas, saladas e sucos."],
              ["🚚", "Entrega ou retirada", "Consulte pelo CEP."],
              ["💬", "Pedido direto", "Tudo segue organizado no WhatsApp."],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex min-h-[96px] min-w-0 flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-3 sm:min-h-0 sm:rounded-3xl sm:p-6">
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
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-14 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">É simples</div>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl md:text-5xl">Como pedir</h2>
            <p className="mt-2 text-xs leading-5 text-white/50 sm:text-sm sm:leading-6">Escolha, confirme e receba.</p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
            {[
              ["01","Escolha","Veja o cardápio."],
              ["02","Peça","Pelo WhatsApp."],
              ["03","Receba","Entrega ou retirada."]
            ].map(([number,title,text], index) => (
              <div key={number} className="relative flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-2.5 text-center sm:block sm:rounded-3xl sm:p-7 sm:text-left">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ef7d18]/15 text-[10px] font-black text-[#ef7d18] sm:h-10 sm:w-10 sm:text-xs">{number}</div>
                <div className="min-w-0"><h3 className="text-[11px] font-black leading-tight sm:mt-4 sm:text-2xl">{title}</h3><p className="mt-1 text-[10px] leading-4 text-white/50 sm:mt-3 sm:text-sm sm:leading-7">{text}</p></div>
                {index < 2 && <ArrowRight className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-white/15 md:block" size={18} />}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-5">
            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#a7b86a]/25 bg-gradient-to-br from-[#1c2414] to-[#11140e] p-3 transition hover:border-[#a7b86a]/50 sm:rounded-[1.75rem] sm:p-6">
              <div className="flex h-full flex-col items-start gap-2 sm:flex-row sm:items-start sm:gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#a7b86a]/25 bg-[#a7b86a]/10 sm:h-11 sm:w-11 sm:rounded-2xl"><Truck className="text-[#b7c879]" size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] font-black uppercase tracking-[.12em] text-[#b7c879] sm:text-[9px] sm:tracking-[.18em]">Receba do seu jeito</div>
                  <h2 className="mt-1 text-xs font-black leading-tight sm:text-xl">Entrega ou retirada</h2>
                  <p className="mt-1.5 text-[10px] leading-4 text-white/55 sm:text-sm sm:leading-6">Consulte a entrega ou retire diretamente na Nutrifit.</p>
                  <a href={whatsappOrder("Olá, Nutrifit! Gostaria de consultar a entrega para o meu endereço.")} className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#a7b86a] px-3 py-2 text-[9px] font-black text-black transition hover:bg-[#c2d58a] sm:min-h-10 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs">Consultar entrega <ArrowRight size={12} /></a>
                </div>
              </div>
            </div>

            <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#ef7d18]/20 bg-gradient-to-br from-[#21180f] to-[#12110d] p-3 transition hover:border-[#ef7d18]/45 sm:rounded-[1.75rem] sm:p-6">
              <div className="flex h-full flex-col items-start gap-2 sm:flex-row sm:items-start sm:gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#ef7d18]/25 bg-[#ef7d18]/10 sm:h-11 sm:w-11 sm:rounded-2xl"><MessageCircle className="text-[#ef8a2c]" size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] font-black uppercase tracking-[.12em] text-[#ef8a2c] sm:text-[9px] sm:tracking-[.18em]">Atendimento direto</div>
                  <h2 className="mt-1 text-xs font-black leading-tight sm:text-xl">Pedido pelo WhatsApp</h2>
                  <p className="mt-1.5 text-[10px] leading-4 text-white/55 sm:text-sm sm:leading-6">Escolha suas refeições e combine a entrega ou retirada.</p>
                  <a href={whatsapp} onClick={() => trackClick("whatsapp_click", "como_pedir")} className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/[.06] px-3 py-2 text-[9px] font-black transition hover:border-[#ef7d18]/50 hover:bg-white/10 sm:min-h-10 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs">Falar no WhatsApp <MessageCircle size={12} /></a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-[#a7b86a]/30 bg-[#12160e] p-4 sm:mt-6 sm:rounded-[2rem] sm:p-6 md:flex md:items-center md:justify-between md:gap-6">
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#a7b86a]/10 blur-2xl sm:h-48 sm:w-48" />
            <div className="relative min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#a7b86a]/25 bg-[#a7b86a]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.16em] text-[#d8e7a0]"><span className="h-1.5 w-1.5 rounded-full bg-[#a7b86a]" /> Sua rotina mais prática</div>
              <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">Sua próxima refeição começa aqui.</h2>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/55 sm:text-sm sm:leading-6">Escolha seus favoritos no cardápio Nutrifit e monte um pedido do seu jeito.</p>
            </div>
            <a href="#cardapio" className="relative mt-4 inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-5 py-3 text-xs font-black text-black shadow-[0_8px_24px_rgba(239,125,24,.16)] transition hover:bg-[#ff963b] sm:mt-4 sm:w-auto md:mt-0">
              Explorar cardápio <ArrowRight size={16} />
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
                <button type="button" onClick={() => setOrderOpen(false)} aria-label="Continuar comprando" className="hidden rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-black text-white/75 sm:block">
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
                    <button type="button" onClick={() => { setOrderOpen(false); document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-label="Voltar ao cardápio" className="mt-5 rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black">
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
                          <button type="button" onClick={() => removeOrderItem(item.name)} aria-label={`Remover ${item.name} do carrinho`} title="Remover do carrinho" className="shrink-0 rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => changeOrderQty(item.name, -1)} aria-label={`Diminuir ${item.name}`} title="Diminuir quantidade" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"><Minus size={15} /></button>
                            <span className="w-8 text-center font-black">{item.quantity}</span>
                            <button type="button" onClick={() => changeOrderQty(item.name, 1)} aria-label={`Aumentar ${item.name}`} title="Aumentar quantidade" className="grid h-10 w-10 place-items-center rounded-full bg-[#a7b86a] text-black"><Plus size={15} /></button>
                          </div>
                          <div className="text-lg font-black text-[#ef7d18]">{money(item.price * item.quantity)}</div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Seus dados</div>
                    <label className="text-xs font-bold text-white/55">Nome
                      <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoComplete="name" aria-label="Nome para o pedido" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
                    </label>
                    <label className="text-xs font-bold text-white/55">WhatsApp
                      <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value.replace(/[^0-9+()\- ]/g, ""))} inputMode="tel" autoComplete="tel" aria-label="WhatsApp para o pedido" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
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
                          <input value={orderCep} onChange={(event) => { setOrderCep(formatCepInput(event.target.value)); setOrderDelivery(null); setOrderDeliveryStatus("idle"); setOrderStreet(""); setOrderNumber(""); setOrderComplement(""); setOrderNeighborhood(""); setOrderCity(""); setOrderState(""); setOrderReference(""); }} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-label="CEP para calcular a entrega" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#a7b86a]" />
                          <button type="button" onClick={() => void calculateOrderDelivery()} disabled={orderDeliveryStatus === "loading"} aria-busy={orderDeliveryStatus === "loading"} className="shrink-0 rounded-full bg-[#a7b86a] px-4 py-3 text-xs font-black text-black disabled:opacity-50">
                            {orderDeliveryStatus === "loading" ? "Calculando…" : "Calcular"}
                          </button>
                        </div>
                        {orderDelivery && <div className="mt-3 text-sm text-white/60">{orderDelivery.neighborhood} • {orderDelivery.zone} • <strong className="text-[#ef7d18]">{orderDelivery.fee === 0 ? "Grátis" : money(orderDelivery.fee)}</strong></div>}
                        {orderDelivery && (
                          <div className="mt-4 grid gap-3 rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/[.04] p-3 sm:grid-cols-2">
                            <div className="sm:col-span-2 text-xs font-black uppercase tracking-[.16em] text-[#a7b86a]">Endereço completo para entrega</div>
                            <label className="text-xs font-bold text-white/60">Rua / avenida
                              <input value={orderStreet} onChange={e => setOrderStreet(e.target.value)} autoComplete="street-address" placeholder="Nome da rua" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                            <label className="text-xs font-bold text-white/60">Número
                              <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="Nº da casa/prédio" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                            <label className="text-xs font-bold text-white/60">Complemento (opcional)
                              <input value={orderComplement} onChange={e => setOrderComplement(e.target.value)} placeholder="Apto, bloco, casa..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                            <label className="text-xs font-bold text-white/60">Bairro
                              <input value={orderNeighborhood} onChange={e => setOrderNeighborhood(e.target.value)} placeholder="Bairro" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                            <label className="text-xs font-bold text-white/60">Cidade
                              <input value={orderCity} onChange={e => setOrderCity(e.target.value)} placeholder="Cidade" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                            <label className="text-xs font-bold text-white/60">UF
                              <input value={orderState} onChange={e => setOrderState(e.target.value.toUpperCase().slice(0,2))} maxLength={2} placeholder="MG" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                            <label className="text-xs font-bold text-white/60 sm:col-span-2">Ponto de referência (opcional)
                              <input value={orderReference} onChange={e => setOrderReference(e.target.value)} placeholder="Próximo a..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#a7b86a]" />
                            </label>
                          </div>
                        )}
                        {!orderDeliveryReady && orderDelivery && <div className="mt-2 text-xs text-[#ef9b55]">Preencha rua, número, bairro, cidade e UF para finalizar.</div>}
                        {orderDeliveryStatus === "error" && <div className="mt-3 text-xs text-[#ef9b55]">CEP ou bairro não encontrado na área de entrega. Confira os dados ou fale com a Nutrifit.</div>}
                      </>
                    )}
                    {orderFreeDelivery && <div className="mt-3 text-sm font-black text-[#cbd99a]">🚚 Frete grátis aplicado automaticamente.</div>}
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-4">
                    <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Cupom de desconto</div>
                    <div className="mt-1 text-xs text-white/45">Digite um cupom criado pela Nutrifit. O sistema verifica validade e pedido mínimo.</div>
                    <div className="mt-3 flex gap-2">
                      <input value={couponCode} onChange={event => { setCouponCode(event.target.value.toUpperCase()); if (couponStatus !== "idle") { setCouponStatus("idle"); setCouponMessage(""); } }} disabled={Boolean(appliedCoupon)} placeholder="Ex.: NUTRI10" aria-label="Código do cupom de desconto" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold outline-none focus:border-[#a7b86a] disabled:opacity-60" />
                      {appliedCoupon ? (
                        <button type="button" onClick={removeCoupon} className="shrink-0 rounded-full border border-white/10 px-4 py-3 text-xs font-black">Remover</button>
                      ) : (
                        <button type="button" onClick={() => void applyCoupon()} disabled={couponStatus === "loading" || !couponCode.trim()} className="shrink-0 rounded-full bg-[#a7b86a] px-4 py-3 text-xs font-black text-black disabled:opacity-50">{couponStatus === "loading" ? "Validando…" : "Aplicar"}</button>
                      )}
                    </div>
                    {couponMessage && <div className={"mt-2 text-xs font-bold " + (couponStatus === "error" ? "text-[#ef9b55]" : "text-[#cbd99a]")}>{couponMessage}</div>}
                    {appliedCoupon && couponDiscount > 0 && <div className="mt-2 text-xs font-black text-[#cbd99a]">Desconto aplicado: -{money(couponDiscount)}</div>}
                    {appliedCoupon && couponDiscount === 0 && <div className="mt-2 text-xs font-bold text-[#ef9b55]">O pedido ficou abaixo do mínimo deste cupom. Aumente o pedido ou remova o cupom.</div>}
                  </div>

                  <label className="mt-4 block text-xs font-bold text-white/55">Observações do pedido
                    <textarea value={orderNotes} onChange={(event) => setOrderNotes(event.target.value)} rows={3} placeholder="Ex.: preferência de entrega ou observação para o pedido" aria-label="Observações do pedido" className="mt-1.5 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#a7b86a]" />
                  </label>
                </>
              )}
            </div>

            {orderItems.length > 0 && (
              <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#080a07]/98 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-7">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-white/45">Subtotal</span><strong className="text-right">{money(orderSubtotal)}</strong>
                  <span className="text-white/45">{discountLabel}</span><strong className="text-right text-[#a7b86a]">-{money(orderDiscount)}</strong>
                  <span className="text-white/45">Frete</span><strong className="text-right">{orderDeliveryFee === 0 ? "Grátis" : money(orderDeliveryFee)}</strong>
                  <span className="border-t border-white/10 pt-2 font-black">Total</span><strong className="border-t border-white/10 pt-2 text-right text-xl text-[#ef7d18]">{money(orderGrandTotal)}</strong>
                </div>
                <button type="button" onClick={() => void shareVisualOrder()} disabled={!orderItems.length} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#ef7d18]/50 bg-[#ef7d18]/10 px-5 py-3 font-bold text-[#ffd0a4] transition hover:bg-[#ef7d18]/20 disabled:opacity-30"><ShoppingBag size={17} /> Compartilhar resumo visual</button>
                <button type="button" onClick={sendFullOrder} disabled={!canFinalizeOrder || fullOrderSubmitting} aria-busy={fullOrderSubmitting} aria-label="Finalizar pedido no WhatsApp" className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-30 sm:mt-4 sm:py-4">
                  {fullOrderSubmitting ? <><Loader2 size={18} className="animate-spin" /> Enviando pedido...</> : <>Finalizar no WhatsApp <ArrowRight size={18} /></>}
                </button>
                {orderCaptureError && <div role="alert" className="mt-3 rounded-xl border border-[#ef7d18]/30 bg-[#ef7d18]/10 p-3 text-center text-xs leading-5 text-[#ffd2a6]">Não conseguimos confirmar o registro automático. A mensagem foi aberta no WhatsApp; seu carrinho foi mantido. Confirme os itens e aguarde a Nutrifit antes de pagar.</div>}
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
              <input autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Busque por prato ou suco..." aria-label="Buscar produtos" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-white/30" />
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

      {leadPromptOpen && !profileOpen && (
        <div className="fixed inset-0 z-[115]">
          <button type="button" aria-label="Fechar benefício" onClick={dismissLeadPrompt} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <section role="dialog" aria-modal="true" aria-labelledby="lead-title" className="absolute left-1/2 top-1/2 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#ef7d18]/25 bg-[#0d100c] shadow-2xl">
            <div className="p-6 sm:p-7">
              <button type="button" onClick={dismissLeadPrompt} aria-label="Fechar" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60"><X size={17} /></button>
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">Clube Nutrifit</div>
              <h2 id="lead-title" className="mt-2 text-2xl font-black leading-tight">Imagine ter suas refeições da semana já resolvidas. 💚</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">Gostosas. Práticas. Do seu jeito. Você escolhe. A Nutrifit prepara.</p>
              <button type="button" onClick={() => { setLeadPromptOpen(false); openProfile(); }} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black">🎁 Descobrir meu benefício <ArrowRight size={17} /></button>
              <button type="button" onClick={dismissLeadPrompt} className="mt-2 w-full py-2 text-xs font-bold text-white/35">Agora não</button>
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
                  <input value={profileName} onChange={(event) => setProfileName(event.target.value)} autoComplete="name" aria-label="Nome do cliente" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="text-xs font-bold text-white/55">WhatsApp
                  <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} inputMode="tel" autoComplete="tel" aria-label="WhatsApp do cliente" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="text-xs font-bold text-white/55">E-mail
                  <input type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} autoComplete="email" aria-label="E-mail do cliente" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="text-xs font-bold text-white/55">Data de nascimento
                  <input type="date" value={profileBirthDate} onChange={(event) => setProfileBirthDate(event.target.value)} autoComplete="bday" aria-label="Data de nascimento" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-[#a7b86a]" />
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-xs leading-5 text-white/55">
                  <input type="checkbox" checked={profileMarketing} onChange={(event) => setProfileMarketing(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#a7b86a]" />
                  Quero receber novidades e ofertas da Nutrifit.
                </label>
              </div>

              {profileStatus === "exists" && <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">Este WhatsApp já está cadastrado no Clube Nutrifit.</div>}
              {profileStatus === "error" && <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">Não foi possível concluir o cadastro agora. Tente novamente.</div>}
              {profileStatus === "success" && <div className="mt-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4 text-sm text-[#d8e7a0]">Cadastro concluído. Seu benefício de boas-vindas foi aplicado.</div>}

              <button type="button" onClick={() => void saveProfile()} disabled={profileStatus === "saving" || !profileName.trim() || profilePhone.replace(/\D/g, "").length < 10} aria-busy={profileStatus === "saving"} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 font-black text-black disabled:opacity-40">
                {profileStatus === "saving" ? <><Loader2 size={17} className="animate-spin" /> Salvando...</> : "Salvar cadastro"}
              </button>
            </div>
          </section>
        </div>
      )}


      <section id="b2b" className="border-t border-white/10 bg-[#0d100b]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-8 md:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#ef7d18]">Nutrifit para empresas</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl md:text-5xl">Alimentação prática para sua equipe.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">Leve marmitas e opções práticas para a rotina da sua empresa. Conte para a gente o tamanho da equipe e a frequência desejada para avaliarmos uma proposta personalizada.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="/b2b" onClick={() => trackClick("b2b_proposal_click", "b2b_section")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3 text-sm font-black text-black transition hover:brightness-110">Solicitar proposta B2B <Building2 size={17} /></a>
              <a href="#como-pedir" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white/85 transition hover:border-[#a7b86a]">Como funciona o pedido</a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><ChefHat className="text-[#a7b86a]" size={23} /><h3 className="mt-3 font-black">Opções variadas</h3><p className="mt-2 text-sm leading-5 text-white/55">Consulte as linhas e os pratos disponíveis no cardápio.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><ClipboardCheck className="text-[#a7b86a]" size={23} /><h3 className="mt-3 font-black">Proposta sob consulta</h3><p className="mt-2 text-sm leading-5 text-white/55">Condições dependem de volume, frequência e logística.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5 sm:col-span-2"><MessageCircle className="text-[#ef7d18]" size={23} /><h3 className="mt-3 font-black">Atendimento comercial direto</h3><p className="mt-2 text-sm leading-5 text-white/55">Fale pelo WhatsApp e informe nome da empresa, cidade, quantidade estimada de refeições e quando pretende começar.</p></div>
          </div>
        </div>
      </section>

      <section id="entrega" className="border-t border-white/10 bg-[#080a07]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-16">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.22em] text-[#a7b86a]">Recebimento do pedido</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Entrega e retirada</h2><p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">Confira as opções disponíveis para o seu endereço antes de concluir a compra.</p></div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><MapPin className="text-[#ef7d18]" size={23} /><h3 className="mt-3 font-black">Entrega em domicílio</h3><p className="mt-2 text-sm leading-5 text-white/55">Informe o CEP e o endereço no pedido. Disponibilidade e eventual taxa devem ser confirmadas antes da finalização.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><ClipboardCheck className="text-[#ef7d18]" size={23} /><h3 className="mt-3 font-black">Confira os dados</h3><p className="mt-2 text-sm leading-5 text-white/55">Revise telefone, endereço, número, bairro e complemento para facilitar a entrega.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><MessageCircle className="text-[#ef7d18]" size={23} /><h3 className="mt-3 font-black">Precisa confirmar?</h3><p className="mt-2 text-sm leading-5 text-white/55">Converse com a equipe pelo WhatsApp para verificar a cobertura e combinar os detalhes do recebimento.</p><a className="mt-4 inline-flex text-sm font-black text-[#a7b86a] hover:text-white" href={whatsappOrder("Olá, Nutrifit! Quero confirmar a disponibilidade de entrega para meu endereço.")} onClick={() => trackClick("delivery_question_click", "delivery_section")}>Consultar entrega →</a></div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10 bg-[#0d100b]">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:px-8 md:py-16">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#ef7d18]">Dúvidas frequentes</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Antes de fazer seu pedido</h2>
          <div className="mt-7 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20 px-5 sm:px-7">
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Como faço um pedido? <ChevronDown size={18} className="shrink-0 text-[#a7b86a] transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-white/60">Escolha os pratos ou um combo no cardápio, siga as etapas de montagem e confira os dados antes de enviar o pedido.</p></details>
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Posso montar um combo com pratos diferentes? <ChevronDown size={18} className="shrink-0 text-[#a7b86a] transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-white/60">Use a opção de montagem de combo disponível no site e selecione os pratos permitidos para a linha escolhida. As opções e quantidades são apresentadas durante a montagem.</p></details>
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Como sei se entregam no meu endereço? <ChevronDown size={18} className="shrink-0 text-[#a7b86a] transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-white/60">Informe o CEP e os dados de entrega no pedido. Se a cobertura ou a taxa não ficar clara, confirme com a equipe pelo WhatsApp antes de finalizar.</p></details>
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Onde encontro as informações nutricionais? <ChevronDown size={18} className="shrink-0 text-[#a7b86a] transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-white/60">Abra o prato para consultar a ficha nutricional quando disponível. Os valores apresentados são referências da Nutrifit por porção e podem variar conforme ingredientes e preparo.</p></details>
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Quero pedir para uma empresa. Como funciona? <ChevronDown size={18} className="shrink-0 text-[#a7b86a] transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-white/60">Acesse a seção Nutrifit para empresas e solicite uma proposta pelo WhatsApp. Informe quantidade estimada, frequência e local de entrega para avaliação comercial.</p></details>
            <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Preciso de ajuda com meu pedido. Com quem falo? <ChevronDown size={18} className="shrink-0 text-[#a7b86a] transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-white/60">Use o botão de WhatsApp no site e envie os detalhes do pedido para a equipe poder orientar você.</p></details>
          </div>
        </div>
      </section>

      <a
        href="/assistente"
        onClick={() => trackClick("assistant_open", "floating_button")}
        aria-label="Abrir Assistente Nutrifit"
        className="group fixed bottom-4 right-3 z-[90] flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#a7b86a]/70 bg-black/95 p-1 text-white shadow-[0_10px_35px_rgba(0,0,0,.45)] backdrop-blur-md transition-all hover:border-[#ef7d18] hover:scale-[1.02] active:scale-[.98] sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:min-h-14 sm:gap-2.5 sm:justify-start sm:overflow-visible sm:px-3.5 sm:py-2"
      >
        <span className="relative hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ef7d18]/80 bg-black sm:grid sm:h-11 sm:w-11">
          <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-[#a7b86a]" aria-hidden="true" />
        </span>
        <span className="hidden pr-1 text-left leading-tight sm:block">
          <span className="block text-sm font-black">Assistente Nutrifit</span>
          <span className="mt-0.5 block text-[10px] font-bold text-white/55">Posso ajudar você?</span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ef7d18] text-black sm:h-9 sm:w-9">
          <MessageCircle size={17} strokeWidth={2.6} />
        </span>
      </a>


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
              <a href="#entrega" className="transition hover:text-white">Entrega</a>
              <a href="#faq" className="transition hover:text-white">Dúvidas</a>
              <a href="#b2b" className="transition hover:text-white">Para empresas</a>
              <a href="/privacidade" className="transition hover:text-white">Política de Privacidade</a>
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