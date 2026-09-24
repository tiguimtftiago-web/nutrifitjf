"use client";

import { useState } from "react";
import { ArrowRight, Check, MessageCircle, ShoppingBag, MapPin, Truck, Building2, HelpCircle, Plus, Minus, RotateCcw, Loader2 } from "lucide-react";

const whatsapp =
  "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const whatsappOrder = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

// Preencha com a chave Pix oficial da Nutrifit quando estiver definida.
const PIX_KEY = "COLOQUE_SUA_CHAVE_PIX_AQUI";

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
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const [cep, setCep] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "loading" | "error">("idle");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "error">("idle");

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
    setDeliveryMode("delivery");
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
    setDeliveryMode("delivery");
    setDelivery(null);
    setDeliveryStatus("idle");
    setCustomerName("");
    setCustomerPhone("");
    setPaymentStatus("idle");
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
    if (total !== quantity || !delivery || !customerName.trim() || !customerPhone.trim()) return;

    setPaymentStatus("loading");

    const items = option.products
      .filter((product) => selected[product.name])
      .map((product) => `${selected[product.name]}x ${product.name} — ${money((subtotal / quantity) * selected[product.name])}`)
      .join("\n");

    const deliveryText =
      deliveryMode === "pickup"
        ? "Retirada na Nutrifit — Rua Enéas Mascarenhas, 94/103, Monte Castelo, Juiz de Fora/MG"
        : delivery.fee === 0
          ? `Entrega grátis — CEP ${cep}`
          : `Entrega ${money(delivery.fee)} — CEP ${cep}`;

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
      `Quantidade: ${quantity} marmitas`,
      `Subtotal: ${money(subtotal)}`,
      `Frete: ${money(deliveryFee)}`,
      `TOTAL A PAGAR: ${money(grandTotal)}`,
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
  const deliveryReady = deliveryMode === "pickup" || subtotal >= DELIVERY_FREE_FROM || Boolean(delivery);
  const customerReady = Boolean(customerName.trim() && customerPhone.trim());
  const canPay = total === quantity && deliveryReady && customerReady && paymentStatus !== "loading";

  return (
    <div className="mt-10 rounded-[2rem] border border-[#a7b86a]/30 bg-[#0b0e09] p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Monte e pague seu pedido no site</div>
          <h3 className="mt-2 text-3xl font-black md:text-4xl">Escolha as marmitas do seu combo</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Escolha a linha, o tamanho e os sabores. Depois informe seus dados, confirme a entrega e envie o pedido pelo WhatsApp para combinar o pagamento.
          </p>
        </div>
        <div className="rounded-2xl border border-[#ef7d18]/25 bg-[#17120c] px-5 py-4 text-center">
          <div className="text-xs font-black uppercase tracking-wider text-white/45">Selecionadas</div>
          <div className="mt-1 text-3xl font-black"><span className="text-[#a7b86a]">{total}</span>/{quantity}</div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {comboOptions.map((item, index) => (
          <button key={item.line} type="button" onClick={() => changeLine(index)} className={`touch-manipulation relative z-10 rounded-2xl border p-4 text-left transition ${lineIndex === index ? "border-[#a7b86a] bg-[#a7b86a]/10" : "border-white/10 bg-white/[.025] hover:border-white/20"}`}>
            <div className="text-xs font-black tracking-wider text-[#a7b86a]">{item.line} • {item.weight}</div>
            <div className="mt-2 text-sm text-white/60">Monte seu combo com os sabores da linha.</div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([5, 7, 10, 14, 20] as const).map((value) => (
          <button key={value} type="button" onClick={() => changeQuantity(value)} className={`touch-manipulation relative z-10 rounded-full px-5 py-2.5 text-sm font-black transition ${quantity === value ? "bg-[#a7b86a] text-black" : "border border-white/10 bg-white/5 text-white/65 hover:border-[#a7b86a]/40"}`}>
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
              <button type="button" onClick={() => removeProduct(product.name)} disabled={!selected[product.name]} aria-label={`Remover ${product.name}`} className="touch-manipulation relative z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 disabled:opacity-25"><Minus size={15} /></button>
              <span className="w-5 text-center font-black">{selected[product.name] || 0}</span>
              <button type="button" onClick={() => addProduct(product.name)} disabled={total >= quantity} aria-label={`Adicionar ${product.name}`} className="touch-manipulation relative z-10 grid h-9 w-9 place-items-center rounded-full bg-[#a7b86a] text-black disabled:opacity-25"><Plus size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-[#0f120d] p-5">
        <div className="flex items-center gap-2">
          <Truck size={20} className="text-[#a7b86a]" />
          <div>
            <div className="font-black text-lg">Como você quer receber?</div>
            <div className="text-sm text-white/45">Escolha uma das opções para continuar.</div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => chooseDeliveryMode("delivery")} className={`touch-manipulation group relative overflow-hidden rounded-3xl border-2 p-5 text-left transition-all ${deliveryMode === "delivery" ? "border-[#a7b86a] bg-[#a7b86a]/10 shadow-[0_0_0_3px_rgba(167,184,106,.08)]" : "border-white/10 bg-white/[.025] hover:border-[#a7b86a]/50 hover:bg-white/[.04]"}`}>
            {deliveryMode === "delivery" && <div className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-[#a7b86a] text-black"><Check size={16} strokeWidth={3} /></div>}
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#a7b86a]/15 text-[#cbd99a]"><Truck size={24} /></div>
            <div className="mt-4 text-xl font-black">🚚 Receber em casa</div>
            <div className="mt-1 text-sm text-white/55">Digite seu CEP e veja a taxa de entrega da sua região.</div>
            <div className="mt-4 inline-flex rounded-full bg-[#a7b86a]/15 px-3 py-1 text-xs font-black text-[#cbd99a]">CALCULAR PELO CEP</div>
          </button>

          <button type="button" onClick={() => chooseDeliveryMode("pickup")} className={`touch-manipulation group relative overflow-hidden rounded-3xl border-2 p-5 text-left transition-all ${deliveryMode === "pickup" ? "border-[#ef7d18] bg-[#ef7d18]/10 shadow-[0_0_0_3px_rgba(239,125,24,.08)]" : "border-white/10 bg-white/[.025] hover:border-[#ef7d18]/50 hover:bg-white/[.04]"}`}>
            {deliveryMode === "pickup" && <div className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-[#ef7d18] text-black"><Check size={16} strokeWidth={3} /></div>}
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ef7d18]/15 text-[#ef9b55]"><MapPin size={24} /></div>
            <div className="mt-4 text-xl font-black">📍 Retirar na Nutrifit</div>
            <div className="mt-1 text-sm text-white/55">Retire seu pedido no endereço da Nutrifit, sem taxa de entrega.</div>
            <div className="mt-4 inline-flex rounded-full bg-[#ef7d18]/15 px-3 py-1 text-xs font-black text-[#ef9b55]">SEM TAXA</div>
          </button>
        </div>

        {deliveryMode === "pickup" ? (
          <div className="mt-5 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-5">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-[#ef7d18]" />
              <div>
                <div className="font-black text-white">Retirada na Nutrifit</div>
                <div className="mt-1 text-sm leading-6 text-white/55">Rua Enéas Mascarenhas, 94/103 • Monte Castelo • Juiz de Fora/MG</div>
                <div className="mt-2 text-sm font-black text-[#ef7d18]">Taxa de entrega: R$ 0,00</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input value={cep} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 8); setCep(value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value); setDelivery(null); setDeliveryStatus("idle"); }} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-label="CEP para calcular a entrega" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold outline-none transition focus:border-[#a7b86a]" />
              <button type="button" onClick={calculateDelivery} disabled={deliveryStatus === "loading"} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-6 py-3.5 text-sm font-black text-black disabled:opacity-60">
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
              <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm text-white/65">Não conseguimos identificar uma área de entrega cadastrada para esse CEP. Confira o CEP ou fale com a Nutrifit pelo WhatsApp.</div>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-[#ef7d18]" />
          <div>
            <div className="font-black text-lg">Seus dados para o pedido</div>
            <div className="text-sm text-white/45">Esses dados serão usados para identificar você e confirmar o pedido pelo WhatsApp.</div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" placeholder="Seu nome completo" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="WhatsApp / telefone" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#a7b86a]" />
        </div>
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
                ? "Escolha como receber o pedido para liberar o pagamento."
                : !customerReady
                  ? "Preencha nome e WhatsApp para continuar."
                  : "Pedido completo. Clique para enviar os detalhes pelo WhatsApp e combinar o pagamento."}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/70"><RotateCcw size={15} /> Limpar</button>
          <button type="button" onClick={sendOrder} disabled={!canPay} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-30">
            {paymentStatus === "loading" ? <><Loader2 size={17} className="animate-spin" /> Enviando pedido...</> : <><ShoppingBag size={17} /> Enviar pedido pelo WhatsApp</>}
          </button>
        </div>
      </div>

      {paymentStatus === "error" && (
        <div className="mt-4 rounded-2xl border border-[#ef7d18]/30 bg-[#17120c] p-4 text-sm leading-6 text-white/70">
          Não foi possível iniciar o pagamento agora. Confira seus dados e tente novamente. Se o problema continuar, fale com a Nutrifit pelo WhatsApp.
        </div>
      )}

      <div className="mt-4 text-center text-xs text-white/35">
        O pagamento fica combinado diretamente pelo WhatsApp. O pedido é confirmado após a confirmação do pagamento.
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-[#a7b86a]/35">
      <div className="aspect-[4/3] overflow-hidden bg-black">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#a7b86a] px-3 py-1 text-[10px] font-black tracking-wider text-black">{product.line} • {product.weight}</span>
          <span className="font-black text-[#ef7d18]">{product.price}</span>
        </div>
        <h3 className="mt-4 text-xl font-black">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/50">{product.description}</p>
        <a href={whatsappOrder(`Olá, Nutrifit! Quero pedir: ${product.name} (${product.line}, ${product.weight}) — ${product.price}.`)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#a7b86a] px-4 py-2.5 text-sm font-black text-black transition hover:scale-[1.01]">Pedir esta opção <ArrowRight size={15} /></a>
      </div>
    </article>
  );
}

function Section({ id, eyebrow, title, subtitle, products }: { id:string; eyebrow:string; title:string; subtitle:string; products:Product[] }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <div className="max-w-3xl">
        <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">{eyebrow}</div>
        <h2 className="mt-2 text-4xl font-black md:text-5xl">{title}</h2>
        <p className="mt-3 text-white/50">{subtitle}</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.name} product={product} />)}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a07]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#inicio" aria-label="Nutrifit — início" className="block h-11 w-28 overflow-hidden rounded-lg bg-black">
              <img src="/images/91de66d4-d4da-471c-9178-6ca8f363602c.png" alt="Nutrifit" className="h-full w-full object-cover object-[50%_40%]" />
            </a>
          <nav aria-label="Navegação principal" className="hidden gap-6 text-sm font-semibold text-white/65 lg:flex">
            <a href="#cardapio" className="hover:text-white">Cardápio</a>
            <a href="#combos" className="hover:text-white">Combos</a>
            <a href="#sucos" className="hover:text-white">Sucos</a>
            <a href="#como-pedir" className="hover:text-white">Como pedir</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#cardapio" className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/75 lg:hidden">Cardápio</a>
            <a href="#combos" className="inline-flex rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-4 py-2 text-xs font-black text-[#cbd99a] lg:hidden">Combos</a>
            <a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-4 py-2.5 text-sm font-black text-black"><MessageCircle size={17} /> <span className="hidden sm:inline">Pedir agora</span><span className="sm:hidden">Pedir</span></a>
          </div>
        </div>
      </header>

      <section id="inicio" className="border-b border-white/10 bg-[#080a07]">
        <div className="w-full overflow-hidden">
          <img
            src="/images/91de66d4-d4da-471c-9178-6ca8f363602c.png"
            alt="Nutrifit — comida de verdade para todos os estilos de vida"
            className="block h-auto w-full"
            fetchPriority="high"
          />
        </div>
      </section>
      <Section id="cardapio" eyebrow="Saudável, equilibrada, leve" title="Linha Fit • 350 g" subtitle="Marmitas 350 g para o seu dia a dia. Unidade R$ 23,97." products={fit} />
      <Section id="performance" eyebrow="Alta proteína e energia" title="Linha Performance • 450 g" subtitle="Frango R$ 27,90 • Bovina R$ 29,90." products={performance} />
      <Section id="saladas" eyebrow="Frescor, leveza e nutrição" title="Linha Saladas • 350 g" subtitle="Saladas vendidas por unidade • R$ 21,90." products={salads} />
      <Section id="tradicional" eyebrow="Sabor caseiro" title="Linha Tradicional • 500 g" subtitle="Bovina R$ 29,90 • Demais R$ 26,90." products={traditional} />

      <section id="combos" className="border-y border-white/10 bg-[#10130d]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Mais praticidade, mais economia</div>
            <h2 className="mt-2 text-4xl font-black md:text-6xl">Escolha seu combo</h2>
            <p className="mt-4 text-white/50">Comida de verdade, porções prontas para sua rotina. Escolha a linha e misture os sabores dentro dela.</p>
          </div>

          <ComboBuilder />\n\n          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {comboHighlights.map((item) => (
              <article key={item.line} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0e09] shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute left-4 top-4 rounded-full bg-[#a7b86a] px-3 py-1.5 text-[10px] font-black tracking-[.15em] text-black">{item.line} • {item.weight}</div>
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p>
                  <div className="mt-5 text-lg font-black text-[#ef7d18]">{item.price}</div>
                  <a href={whatsappOrder(`Olá, Nutrifit! Quero o combo ${item.line} ${item.weight} — ${item.price}. Quero escolher os sabores deste combo.`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 text-sm font-black text-black transition hover:scale-[1.01]">Escolher este combo <ArrowRight size={16} /></a>
                </div>
              </article>
            ))}
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
                <a key={line+quantity} href={whatsappOrder(`Olá, Nutrifit! Quero o combo ${line} — ${quantity} — ${price}. Quero escolher os sabores deste combo.`)} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-[#a7b86a]/40">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#a7b86a]">{line}</div>
                  <div className="mt-2 text-sm font-bold text-white/55">{quantity}</div>
                  <div className="mt-1 text-2xl font-black">{price}</div>
                  <div className="mt-1 text-xs text-[#ef7d18]">{average}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[["Combos dentro da linha","Misture sabores sem sair da mesma linha."],["Praticidade","Organize várias refeições de uma vez."],["Atendimento direto","Faça seu pedido pelo WhatsApp."]].map(([title,text]) => <div key={title} className="flex gap-3 rounded-2xl border border-white/10 p-5"><Check className="mt-0.5 shrink-0 text-[#a7b86a]" size={19} /><div><div className="font-black">{title}</div><div className="mt-1 text-sm text-white/45">{text}</div></div></div>)}
          </div>
        </div>
      </section>

      <section id="sucos" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#171d10] to-[#0e110c] p-8 md:p-12">
          <div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Funcionais e 100% naturais</div><h2 className="mt-2 text-4xl font-black">Linha de Sucos</h2><p className="mt-3 text-white/50">Sucos funcionais • 500 ml R$ 12,90 • 300 ml R$ 9,90</p></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{functionalJuices.map(([name,image]) => <div key={name} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:border-[#a7b86a]/40"><div className="aspect-[4/3] overflow-hidden"><img src={image} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div><div className="p-4"><div className="font-black">{name}</div><div className="mt-3 grid grid-cols-2 gap-2"><a href={whatsappOrder(`Olá, Nutrifit! Quero o suco ${name}, 500 ml — R$ 12,90.`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 px-3 py-2 text-left text-xs text-white/65 transition hover:border-[#a7b86a]/40 hover:bg-[#a7b86a]/10">500 ml <b className="mt-0.5 block text-sm text-[#ef7d18]">R$ 12,90</b></a><a href={whatsappOrder(`Olá, Nutrifit! Quero o suco ${name}, 300 ml — R$ 9,90.`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 px-3 py-2 text-left text-xs text-white/65 transition hover:border-[#a7b86a]/40 hover:bg-[#a7b86a]/10">300 ml <b className="mt-0.5 block text-sm text-[#ef7d18]">R$ 9,90</b></a></div></div></div>)}</div>
          <div className="mt-10 border-t border-white/10 pt-8"><div className="text-sm font-black uppercase tracking-wider text-[#ef7d18]">Sucos Nutrifit • 500 ml R$ 12,00 • 300 ml R$ 9,90</div><div className="mt-4 grid gap-4 sm:grid-cols-3">{naturalJuices.map(([name,image]) => <div key={name} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:border-[#a7b86a]/40"><div className="aspect-[4/3] overflow-hidden"><img src={image} alt={name} className="h-full w-full object-cover transition duration-500" loading="lazy" /></div><div className="p-4"><div className="font-black">{name}</div><div className="mt-3 grid grid-cols-2 gap-2"><a href={whatsappOrder(`Olá, Nutrifit! Quero o ${name}, 500 ml — R$ 12,00.`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 px-3 py-2 text-left text-xs text-white/65 transition hover:bg-[#a7b86a]/10">500 ml <b className="mt-0.5 block text-sm text-[#ef7d18]">R$ 12,00</b></a><a href={whatsappOrder(`Olá, Nutrifit! Quero o ${name}, 300 ml — R$ 9,90.`)} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 px-3 py-2 text-left text-xs text-white/65 transition hover:bg-[#a7b86a]/10">300 ml <b className="mt-0.5 block text-sm text-[#ef7d18]">R$ 9,90</b></a></div></div></div>)}</div></div>
        </div>
      </section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01","Escolha","Veja o cardápio e escolha suas marmitas."],
              ["02","Peça","Clique no WhatsApp e envie seu pedido já com a opção escolhida."],
              ["03","Receba","Após a confirmação do pagamento, combinamos a entrega do seu pedido."]
            ].map(([number,title,text]) => (
              <div key={number} className="rounded-3xl border border-white/10 bg-white/[.03] p-7">
                <div className="text-sm font-black text-[#ef7d18]">{number}</div>
                <h3 className="mt-3 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/50">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <Truck className="text-[#a7b86a]" size={22} />
                <h2 className="text-2xl font-black">Entrega em Juiz de Fora</h2>
              </div>
              <p className="mt-3 leading-7 text-white/55">
                Calcule a entrega pelo CEP no montador de combos ou escolha retirar seu pedido diretamente na Nutrifit.
              </p>
              <a href={whatsappOrder("Olá, Nutrifit! Gostaria de consultar a entrega para o meu endereço.")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black">
                Consultar entrega <ArrowRight size={16} />
              </a>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.03] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-[#ef7d18]" size={22} />
                <h2 className="text-2xl font-black">Pedido e pagamento</h2>
              </div>
              <p className="mt-3 leading-7 text-white/55">
                Escolha seus produtos, confirme o pedido e realize o pagamento. Você pode receber em casa ou retirar seu pedido na Nutrifit, em Monte Castelo.
              </p>
              <a href={whatsapp} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-bold">
                Falar com a Nutrifit <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-[#ef7d18]/20 bg-[#17120c] p-7 md:p-9">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="text-[#ef7d18]" size={22} />
                  <h2 className="text-2xl font-black">Nutrifit para empresas</h2>
                </div>
                <p className="mt-3 max-w-2xl leading-7 text-white/55">
                  Atendimento B2B para empresas e pedidos corporativos. Fale com a equipe para conhecer as possibilidades.
                </p>
              </div>
              <a href={whatsappOrder("Olá, Nutrifit! Tenho interesse em atendimento B2B para minha empresa.")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3.5 font-black text-black">
                Atendimento B2B <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="mt-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-[#a7b86a]" size={22} />
                <h2 className="text-3xl font-black">Perguntas frequentes</h2>
              </div>
              <p className="mt-2 text-white/45">As informações abaixo seguem o catálogo Nutrifit.</p>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                ["Posso misturar sabores no combo?","Sim. Os combos podem misturar sabores dentro da mesma linha."],
                ["Quais são os tamanhos das marmitas?","Fit e Saladas: 350 g. Performance: 450 g. Tradicional: 500 g."],
                ["Saladas entram nos combos?","O catálogo informa as saladas como vendidas por unidade."],
                ["Os sucos entram nos combos?","Os sucos são vendidos por unidade; consulte disponibilidade pelo WhatsApp."],
                ["Como faço meu pedido?","Escolha suas opções no cardápio e clique em qualquer botão de pedido para falar com a Nutrifit."],
                ["Como funciona a entrega?","A disponibilidade e a taxa de entrega devem ser confirmadas pelo WhatsApp."],
                ["Quando faço o pagamento?","O pagamento é realizado antecipadamente. Após a confirmação do pagamento, a Nutrifit prepara e realiza a entrega do pedido."]
              ].map(([question,answer]) => (
                <details key={question} className="group rounded-2xl border border-white/10 bg-white/[.025] p-5">
                  <summary className="cursor-pointer list-none font-black marker:hidden">{question}</summary>
                  <p className="mt-3 leading-6 text-white/50">{answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-8 md:p-10">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black">Peça já a sua marmita</h2>
                <p className="mt-2 text-white/50">Praticidade, sabor e qualidade — todos os dias em Juiz de Fora.</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/60">
                  <span className="inline-flex items-center gap-2"><MessageCircle size={16} className="text-[#a7b86a]" />(32) 99803-0038</span>
                  <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[#a7b86a]" />Juiz de Fora / MG</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={instagram} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-bold">
                  @nutrifit_jf
                </a>
                <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-7 py-4 font-black text-black">
                  <ShoppingBag size={18} /> Fazer pedido
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 Nutrifit • Juiz de Fora - MG</span>
          <div className="flex flex-wrap gap-4">
            <a href={instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram @nutrifit_jf</a>
            <a href={whatsapp} className="hover:text-white">WhatsApp (32) 99803-0038</a>
          </div>
        </div>
      </footer>

      <a href={whatsapp} aria-label="Falar com a Nutrifit pelo WhatsApp" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 font-black text-black shadow-2xl transition hover:scale-105">
        <MessageCircle size={19} /> <span className="hidden sm:inline">WhatsApp</span>
      </a>

    </main>
  );
}
