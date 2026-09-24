"use client";

import { useState } from "react";
import { ArrowRight, Check, MessageCircle, ShoppingBag, MapPin, Truck, Building2, HelpCircle, Plus, Minus, RotateCcw, Loader2 } from "lucide-react";

const whatsapp =
  "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const whatsappOrder = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

const instagram = "https://www.instagram.com/nutrifit_jf/";

type Product = {
  name: string;
  line: string;
  weight: string;
  price: string;
  description: string;
  image: string;
};

const fit: Product[] = [
  ["Patinho com Abóbora","FIT","350 g","R$ 23,97","Patinho moído temperado e purê de abóbora cremoso."],
  ["Carne Acebolada com Legumes","FIT","350 g","R$ 23,97","Carne bovina em tiras refogada com cebola e mix de legumes."],
  ["Frango Grelhado com Legumes","FIT","350 g","R$ 23,97","Peito de frango grelhado acompanhado de legumes selecionados."],
  ["Frango ao Molho de Ervas","FIT","350 g","R$ 23,97","Peito de frango ao molho de ervas finas com legumes."],
  ["Lombo Suíno com Legumes Assados","FIT","350 g","R$ 23,97","Lombo suíno grelhado temperado com legumes assados."],
  ["Patinho com Batata-doce","FIT","350 g","R$ 23,97","Patinho moído refogado com purê de batata-doce cremoso."],
  ["Patinho com Legumes","FIT","350 g","R$ 23,97","Patinho moído refogado com temperos naturais e legumes."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[4,5,6,7,8,9,10][i]}.jpg`}));

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
  ["Executivo Saudável","TRADICIONAL","500 g","R$ 26,90","Lombo suíno grelhado, macarrão alho e óleo, molho cremoso leve e brócolis."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[28,29,30,31,32,33,34][i]}.jpg`}));

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

const comboHighlights = [
  {
    line: "FIT",
    weight: "350 g",
    title: "Patinho com Abóbora",
    image: "/images/page-4.jpg",
    price: "a partir de R$ 117,00",
    text: "Escolha seus sabores e monte seu combo com 5, 7, 10, 14 ou 20 marmitas."
  },
  {
    line: "PERFORMANCE",
    weight: "450 g",
    title: "Chicken Parmesão",
    image: "/images/page-12.jpg",
    price: "a partir de R$ 139,90",
    text: "Mais proteína e refeições maiores para sua rotina. Combine os sabores da linha."
  },
  {
    line: "TRADICIONAL",
    weight: "500 g",
    title: "Parmegiana Cremosa",
    image: "/images/page-29.jpg",
    price: "a partir de R$ 139,90",
    text: "Comida com sabor caseiro em combos de 5, 7, 10, 14 ou 20 marmitas."
  },
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



const DELIVERY_FREE_FROM = 200;

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
      "São Bernardo","Santa Terezinha","Eldorado","Jardim Bom Clima","Vale dos Bandeirantes",
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
      "Mirante","Residencial Alvim","Cidade Universitária","Tiguera","Três Moinhos",
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
    .replace(/[\\u0300-\\u036f]/g, "")
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

const comboOptions = [
  { line: "FIT", weight: "350 g", products: fit, prices: { 5: "R$ 117,00", 7: "R$ 164,00", 10: "R$ 235,00", 14: "R$ 328,00", 20: "R$ 459,00" } },
  { line: "PERFORMANCE", weight: "450 g", products: performance, prices: { 5: "R$ 139,90", 7: "R$ 194,90", 10: "R$ 274,90", 14: "R$ 384,90", 20: "R$ 539,90" } },
  { line: "TRADICIONAL", weight: "500 g", products: traditional, prices: { 5: "R$ 139,90", 7: "R$ 194,90", 10: "R$ 269,90", 14: "R$ 379,90", 20: "R$ 529,90" } },
] as const;

function ComboBuilder() {
  const [lineIndex, setLineIndex] = useState(0);
  const [quantity, setQuantity] = useState<5 | 7 | 10 | 14 | 20>(5);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [cep, setCep] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");

  const option = comboOptions[lineIndex];
  const total = Object.values(selected).reduce((sum, value) => sum + value, 0);
  const price = option.prices[quantity];
  const subtotal = Number(price.replace("R$ ", "").replace(".", "").replace(",", "."));
  const deliveryFee = subtotal >= DELIVERY_FREE_FROM ? 0 : delivery?.fee ?? 0;
  const grandTotal = subtotal + deliveryFee;

  const changeLine = (index: number) => {
    setLineIndex(index);
    setSelected({});
    setQuantity(5);
    setDelivery(null);
    setDeliveryStatus("idle");
  };

  const changeQuantity = (value: 5 | 7 | 10 | 14 | 20) => {
    setQuantity(value);
    setSelected({});
    setDelivery(null);
    setDeliveryStatus("idle");
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
    setSelected({});
    setCep("");
    setDelivery(null);
    setDeliveryStatus("idle");
  };

  const calculateDelivery = async () => {
    const cleanCep = cep.replace(/\\D/g, "");
    if (cleanCep.length !== 8) {
      setDelivery(null);
      setDeliveryStatus("error");
      return;
    }

    if (subtotal >= DELIVERY_FREE_FROM) {
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
    if (total !== quantity || !delivery) return;

    const items = option.products
      .filter((product) => selected[product.name])
      .map((product) => `${selected[product.name]}x ${product.name}`)
      .join(", ");

    const deliveryText = delivery.fee === 0 ? "Frete grátis" : money(delivery.fee);
    const neighborhoodText = delivery.neighborhood ? `Bairro: ${delivery.neighborhood}. ` : "";
    const message =
      `Olá, Nutrifit! Quero montar meu combo ${option.line} ${option.weight}: ${quantity} marmitas — ${price}. ` +
      `Sabores: ${items}. Subtotal: ${money(subtotal)}. ${deliveryText}. ${neighborhoodText}Total: ${money(grandTotal)}. CEP: ${cep}.`;

    window.open(whatsappOrder(message), "_blank", "noopener,noreferrer");
  };

  const deliveryReady = subtotal >= DELIVERY_FREE_FROM ? true : Boolean(delivery);
  const canSend = total === quantity && deliveryReady;

  return (
    <div className="mt-10 rounded-[2rem] border border-[#a7b86a]/30 bg-[#0b0e09] p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Monte seu pedido no site</div>
          <h3 className="mt-2 text-3xl font-black md:text-4xl">Escolha as marmitas do seu combo</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Escolha a linha, o tamanho do combo e os sabores. Depois informe seu CEP para calcular a entrega antes de enviar o pedido.
          </p>
        </div>
        <div className="rounded-2xl border border-[#ef7d18]/25 bg-[#17120c] px-5 py-4 text-center">
          <div className="text-xs font-black uppercase tracking-wider text-white/45">Selecionadas</div>
          <div className="mt-1 text-3xl font-black"><span className="text-[#a7b86a]">{total}</span>/{quantity}</div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {comboOptions.map((item, index) => (
          <button key={item.line} type="button" onClick={() => changeLine(index)} className={`rounded-2xl border p-4 text-left transition ${lineIndex === index ? "border-[#a7b86a] bg-[#a7b86a]/10" : "border-white/10 bg-white/[.025] hover:border-white/20"}`}>
            <div className="text-xs font-black tracking-wider text-[#a7b86a]">{item.line} • {item.weight}</div>
            <div className="mt-2 text-sm text-white/60">Monte seu combo com os sabores da linha.</div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([5, 7, 10, 14, 20] as const).map((value) => (
          <button key={value} type="button" onClick={() => changeQuantity(value)} className={`rounded-full px-5 py-2.5 text-sm font-black transition ${quantity === value ? "bg-[#a7b86a] text-black" : "border border-white/10 bg-white/5 text-white/65 hover:border-[#a7b86a]/40"}`}>
            {value} marmitas
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {option.products.map((product) => (
          <div key={product.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4">
            <div className="min-w-0">
              <div className="font-black">{product.name}</div>
              <div className="mt-1 text-xs text-white/40">{product.weight}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => removeProduct(product.name)} disabled={!selected[product.name]} aria-label={`Remover ${product.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 disabled:opacity-25"><Minus size={15} /></button>
              <span className="w-5 text-center font-black">{selected[product.name] || 0}</span>
              <button type="button" onClick={() => addProduct(product.name)} disabled={total >= quantity} aria-label={`Adicionar ${product.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#a7b86a] text-black disabled:opacity-25"><Plus size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-[#0f120d] p-5">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-[#a7b86a]" />
          <div className="font-black">Calcule sua entrega</div>
        </div>
        <p className="mt-1 text-sm text-white/45">Digite seu CEP. O site identifica o bairro e calcula a taxa da sua região.</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={cep}
            onChange={(event) => {
              const value = event.target.value.replace(/\\D/g, "").slice(0, 8);
              setCep(value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value);
              setDelivery(null);
              setDeliveryStatus("idle");
            }}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            aria-label="CEP para calcular a entrega"
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold outline-none transition focus:border-[#a7b86a]"
          />
          <button
            type="button"
            onClick={calculateDelivery}
            disabled={deliveryStatus === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3.5 text-sm font-black text-black disabled:opacity-60"
          >
            {deliveryStatus === "loading" ? <><Loader2 size={16} className="animate-spin" /> Calculando...</> : "Calcular entrega"}
          </button>
        </div>

        {subtotal >= DELIVERY_FREE_FROM ? (
          <div className="mt-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4">
            <div className="font-black text-[#cbd99a]">🚚 Frete grátis</div>
            <div className="mt-1 text-sm text-white/55">Seu combo atingiu R$ 200,00 ou mais.</div>
          </div>
        ) : delivery ? (
          <div className="mt-4 rounded-2xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 p-4">
            <div className="font-black text-[#cbd99a]">📍 {delivery.neighborhood}</div>
            <div className="mt-1 text-sm text-white/55">{delivery.zone} • Entrega <span className="font-black text-[#ef7d18]">{money(delivery.fee)}</span></div>
          </div>
        ) : deliveryStatus === "error" ? (
          <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">
            Não conseguimos identificar uma área de entrega cadastrada para esse CEP. Confira o CEP ou fale com a Nutrifit pelo WhatsApp.
          </div>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-[#a7b86a]/20 bg-[#171d10] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-black">{option.line} • {option.weight} • {quantity} marmitas</div>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-white/55">
            <span>Subtotal</span><strong className="text-white">{money(subtotal)}</strong>
            <span>Entrega</span><strong className="text-white">{deliveryReady ? (deliveryFee === 0 ? "Grátis" : money(deliveryFee)) : "Informe o CEP"}</strong>
          </div>
          <div className="mt-2 text-2xl font-black text-[#ef7d18]">Total {money(grandTotal)}</div>
          <div className="mt-1 text-xs text-white/45">
            {total !== quantity
              ? `Escolha mais ${quantity - total} marmita(s) para completar o combo.`
              : !deliveryReady
                ? "Calcule a entrega para liberar o pedido."
                : "Pedido completo. Confira o total e envie pelo WhatsApp."}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70"><RotateCcw size={15} /> Limpar</button>
          <button type="button" onClick={sendOrder} disabled={!canSend} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-30"><ShoppingBag size={17} /> Enviar pedido pelo WhatsApp</button>
        </div>
      </div>
    </div>
  );
}

