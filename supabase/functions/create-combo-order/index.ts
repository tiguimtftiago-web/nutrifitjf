import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const TEST_PHONE_SUFFIX = "32999180713";
const isTestPhone = (value: unknown) => String(value ?? "").replace(/\D/g, "").endsWith(TEST_PHONE_SUFFIX);

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: cors });

const normalize = (value: unknown) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]/g, "");

async function comboPriceCents(
  url: string,
  headers: Record<string, string>,
  line: string,
  quantity: number,
): Promise<number | null> {
  const response = await fetch(
    url + "/rest/v1/catalog_combos?select=price&active=eq.true&name=eq." +
      encodeURIComponent(line) + "&quantity=eq." + quantity + "&limit=1",
    { headers },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  const price = Number(rows?.[0]?.price);
  if (!rows?.length || !Number.isFinite(price) || price <= 0) return null;
  return Math.round(price * 100);
}

const zone1 = "Monte Castelo|Carlos Chagas|Cerâmica|Francisco Bernardino|Fábrica|Esplanada|São Dimas|Centenário|Mariano Procópio|Jardim Glória|Morro da Glória|Santa Catarina|Santa Helena|Democrata|Vale do Ipê|Jardim Paineiras|Jardim Santa Helena|Poço Rico|Vitorino Braga|Nossa Senhora Aparecida";
const zone2 = "Centro|Boa Vista|Granbery|Bom Pastor|São Mateus|Alto dos Passos|Teixeiras|Bairu|Bonfim|Botanágua|Cesário Alvim|Grajaú|Manoel Honório|Linhares|Marumbi|Progresso|Santa Rita|Santa Cândida|São Benedito|São Bernardo|Santa Terezinha|Eldorado|Jardim Bom Clima|Granjas Betânia|Jardim Emaús|Parque Independência|Grama|Jardim Natal|Nova Era|Benfica|Nova Benfica|Milho Branco|Industrial|Jóquei Clube|Barbosa Lage|Santa Cruz|Represa|Jardim dos Alfineiros|Bandeirantes|Parque Guarani|Nossa Senhora das Graças|Quintas das Avenidas|Santa Paula";
const zone3 = "São Pedro|Aeroporto|Borboleta|Cruzeiro Santo Antônio|Martelos|Morro do Imperador|Nova Califórnia|Novo Horizonte|Serro Azul|Portal da Torre|Caiçaras|Marilândia|Santos Dumont|Alto dos Pinheiros|Adolfo Vireque|Bosque do Imperador|Granville|Viña Del Mar|Vina Del Mar|Nova Germânia|Parque das Águas|Spinaville|Via do Sol|Residencial Alvim|Dom Bosco|Cascatinha|Graminha|Ipiranga|Sagrado Coração de Jesus|Salvaterra|Santa Efigênia|Santa Luzia|Santa Cecília|Bomba de Fogo|Jardim Laranjeiras|Cruzeiro do Sul|Barão do Retiro|Floresta|Nossa Senhora de Lourdes|Santo Antônio|Vila Furtado de Menezes|Vila Ideal|Vila Olavo Costa|Costa Carvalho|Jardim Gaúcho|São Geraldo|Previdenciários|Jardim América|Bela Aurora|Estrela Sul|Jardim Casablanca|Nossa Senhora de Fátima";
const zone4 = "Barreira do Triunfo|Filgueiras|Granjas Bethel|Vale dos Bandeirantes|Paula Lima|Remonta|Vila Esperança|Jardim Europa|Jardim Olímpia|Cidade do Sol|Cidade Jardim|Fontesville|Fontesville II|Igrejinha|Parque das Palmeiras|Parque das Torres|Parque Guadalajara|Parque Guarua|Parque Imperial|Parque Jardim da Serra|Parque Serra Verde|Jardim da Serra|Chalés do Imperador|Chalés do Algarve|Colinas do Imperador|Mandala|Portal do Aeroporto|Morada do Serro|Bosque Imperial|Conjunto Flamboyants|São Clemente|São Lucas|Santana|Neo Residencial|Spinaville II|Mirante|Cidade Universitária|Três Moinhos|Terras Altas|Retiro|Pedras Preciosas|Jardim Esperança|Jardim do Sol|Santos Anjos|Vila Alpina|São Sebastião|Aracy|Jardim das Flores|Solidariedade|Granjas Primavera|Granjas Santo Antônio|Guaruá|Granjas do Bosque|Vivendas da Serra|Vivendas das Fontes|Vale Verde|Serra D'Água|Serra Dagua|Tupã|Tiguera|Spina Ville II|Vila Ozanan";

function feeForNeighborhood(value: string): number | null {
  const n = normalize(value);
  const contains = (list: string) => list.split("|").some((name) => normalize(name) === n);
  if (contains(zone1)) return 5;
  if (contains(zone2)) return 7;
  if (contains(zone3)) return 10;
  if (contains(zone4)) return 13;
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Método não permitido." });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(500, { error: "Configuração do servidor incompleta." });
  const headers = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };

  try {
    const body = await req.json();
    const customerName = String(body.customer_name ?? "").trim().slice(0, 120);
    const whatsapp = String(body.whatsapp ?? "").replace(/\D/g, "").slice(0, 20);
    const line = String(body.line ?? "").trim().toUpperCase();
    const quantity = Number(body.combo_quantity);
    const mode = body.delivery_mode === "pickup" ? "pickup" : "delivery";
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const rawComplements = Array.isArray(body.complements) ? body.complements : [];
    const street = String(body.street ?? "").trim().slice(0, 180);
    const addressNumber = String(body.address_number ?? "").trim().slice(0, 30);
    const addressComplement = String(body.address_complement ?? "").trim().slice(0, 120);
    const city = String(body.city ?? "").trim().slice(0, 100);
    const state = String(body.state ?? "").trim().toUpperCase().slice(0, 2);
    const addressReference = String(body.address_reference ?? "").trim().slice(0, 250);

    const validComboLine = ["FIT", "PERFORMANCE", "TRADICIONAL"].includes(line);
    const baseCentsForCombo = Number.isInteger(quantity) && validComboLine
      ? await comboPriceCents(url, headers, line, quantity)
      : null;
    if (!customerName || whatsapp.length < 10 || !validComboLine ||
        !Number.isInteger(quantity) || quantity < 5 || quantity > 100 || baseCentsForCombo === null ||
        !rawItems.length || rawItems.length > 30 || rawComplements.length > 30 ||
        (mode === "delivery" && (!street || !addressNumber || !city || state.length !== 2)))
      return reply(400, { error: "Dados do combo ou endereço incompletos ou inválidos." });

    const items = rawItems.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? "").trim().slice(0, 160),
      line: String(item.line ?? "").trim(),
      weight: String(item.weight ?? "").trim(),
      quantity: Number(item.quantity),
    }));
    if (items.some((item: {name:string;line:string;weight:string;quantity:number}) =>
      !item.name || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > quantity ||
      normalize(item.line) !== normalize(line) || !item.weight))
      return reply(400, { error: "Há pratos ou quantidades inválidos no combo." });
    const mealCount = items.reduce((sum: number, item: {quantity:number}) => sum + item.quantity, 0);
    if (mealCount !== quantity) return reply(400, { error: "A quantidade de marmitas não corresponde ao combo escolhido." });

    const complementInput = rawComplements.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? "").trim().slice(0, 160),
      quantity: Number(item.quantity),
    }));
    if (complementInput.some((item: {name:string;quantity:number}) =>
      !item.name || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100))
      return reply(400, { error: "Há complementos ou quantidades inválidos." });

    const catalogResponse = await fetch(
      url + "/rest/v1/catalog_products?select=name,line,size_grams,price,category,active&active=eq.true&category=in.(marmita,salada,suco,sanduiche,fruta,complemento)",
      { headers },
    );
    if (!catalogResponse.ok) return reply(502, { error: "Não foi possível conferir o catálogo." });
    const catalog = await catalogResponse.json() as Array<Record<string, unknown>>;
    const lineLabel: Record<string, string> = { FIT: "Fit", PERFORMANCE: "Performance", TRADICIONAL: "Tradicional" };
const catalogNameAliases: Record<string, string> = {
  [normalize("Feijoada")]: normalize("Feijoada Fit"),
  [normalize("Churrasco Mineiro")]: normalize("Churrasco Fit Mineiro"),
};
    const weightGrams: Record<string, number> = { FIT: 350, PERFORMANCE: 450, TRADICIONAL: 500 };
    const baseCents = baseCentsForCombo as number;
    const perMealBaseCents = Math.floor(baseCents / quantity);
    let baseRemainderCents = baseCents % quantity;
    let premiumCents = 0;
    const pricedItems: Array<Record<string, unknown>> = [];

    for (const item of items) {
      const requestedName = normalize(item.name);
      const catalogName = catalogNameAliases[requestedName] ?? requestedName;
      const match = catalog.find((product) =>
        normalize(product.name) === catalogName &&
        normalize(product.line) === normalize(lineLabel[line]) &&
        Number(product.size_grams) === weightGrams[line] &&
        normalize(product.category) === "marmita"
      );
      if (!match) return reply(400, { error: "Prato indisponível ou não conferido no catálogo: " + item.name });
      const isTilapiaPremium = line === "FIT" && normalize(item.name) === normalize("Tilápia Fit com Arroz Branco e Legumes");
      const surchargeCents = isTilapiaPremium ? 600 : 0;
      if (isTilapiaPremium) premiumCents += surchargeCents * item.quantity;

      // Distribute any leftover cents across individual meals so line items sum exactly to the combo price.
      const extraBaseUnits = Math.min(item.quantity, baseRemainderCents);
      baseRemainderCents -= extraBaseUnits;
      if (extraBaseUnits > 0) {
        pricedItems.push({
          name: item.name, line: String(match.line), weight: item.weight,
          price: (perMealBaseCents + 1 + surchargeCents) / 100, quantity: extraBaseUnits,
        });
      }
      const standardUnits = item.quantity - extraBaseUnits;
      if (standardUnits > 0) {
        pricedItems.push({
          name: String(match.name), line: String(match.line), weight: item.weight,
          price: (perMealBaseCents + surchargeCents) / 100, quantity: standardUnits,
        });
      }
    }

    let complementCents = 0;
    for (const item of complementInput) {
      const match = catalog.find((product) =>
        normalize(product.name) === normalize(item.name) &&
        ["suco", "sanduiche", "fruta", "complemento"].includes(normalize(product.category))
      );
      if (!match) return reply(400, { error: "Complemento indisponível ou sem preço cadastrado: " + item.name });
      const unitCents = Math.round(Number(match.price) * 100);
      if (!Number.isFinite(unitCents) || unitCents < 0) return reply(400, { error: "Preço inválido para o complemento: " + item.name });
      complementCents += unitCents * item.quantity;
      pricedItems.push({
        name: String(match.name), line: String(match.line ?? "Complementos"),
        weight: match.size_grams ? String(match.size_grams) + " g" : "",
        price: unitCents / 100, quantity: item.quantity,
      });
    }

    const cep = String(body.cep ?? "").replace(/\D/g, "").slice(0, 8);
    let neighborhood = "";
    let deliveryCents = 0;
    if (mode === "delivery" && quantity < 20) {
      if (cep.length !== 8) return reply(400, { error: "Informe um CEP válido para calcular a entrega." });
      let address: Record<string, unknown>;
      try {
        const response = await fetch("https://viacep.com.br/ws/" + cep + "/json/", { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return reply(502, { error: "Não foi possível validar o CEP agora." });
        address = await response.json();
      } catch {
        return reply(502, { error: "Não foi possível validar o CEP agora." });
      }
      if (address.erro || normalize(address.localidade) !== normalize("Juiz de Fora") || String(address.uf ?? "").toUpperCase() !== "MG")
        return reply(400, { error: "A entrega está disponível somente para CEPs de Juiz de Fora/MG." });
      neighborhood = String(address.bairro ?? "").trim();
      const fee = feeForNeighborhood(neighborhood);
      if (fee === null) return reply(400, { error: "Bairro não localizado na área de entrega. Confirme a taxa pelo WhatsApp." });
      deliveryCents = fee * 100;
    } else if (mode === "delivery" && cep.length === 8) {
      let address: Record<string, unknown>;
      try {
        const response = await fetch("https://viacep.com.br/ws/" + cep + "/json/", { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return reply(502, { error: "Não foi possível validar o CEP agora." });
        address = await response.json();
      } catch {
        return reply(502, { error: "Não foi possível validar o CEP agora." });
      }
      if (address.erro || normalize(address.localidade) !== normalize("Juiz de Fora") || String(address.uf ?? "").toUpperCase() !== "MG")
        return reply(400, { error: "A entrega está disponível somente para CEPs de Juiz de Fora/MG." });
      neighborhood = String(address.bairro ?? "").trim();
    }

    const subtotalCents = baseCents + premiumCents + complementCents;
    const totalCents = subtotalCents + deliveryCents;
    if (subtotalCents <= 0 || totalCents > 50000000) return reply(400, { error: "Valor do pedido inválido." });
    const acquisitionSource = body.acquisition_source ? String(body.acquisition_source).slice(0, 120) : "site_combo_builder";
    const notes = [
      "Pedido iniciado pelo montador de combos.",
      "Linha: " + line + "; quantidade do combo: " + quantity + "; recebimento: " + mode + ".",
      body.notes ? String(body.notes).slice(0, 1200) : "",
    ].filter(Boolean).join("\n");

    const payload = {
      customer_name: customerName, whatsapp, email: body.email ? String(body.email).slice(0, 254) : null,
      items: pricedItems, item_count: quantity + complementInput.reduce((sum: number, item: {quantity:number}) => sum + item.quantity, 0),
      subtotal: subtotalCents / 100, discount: 0, delivery_fee: deliveryCents / 100, total: totalCents / 100,
      cep: cep || null, neighborhood: mode === "pickup" ? "Retirada na Nutrifit" : (neighborhood || String(body.neighborhood ?? "").trim().slice(0, 120) || null),
      street: mode === "delivery" ? street : null,
      address_number: mode === "delivery" ? addressNumber : null,
      address_complement: mode === "delivery" ? (addressComplement || null) : null,
      city: mode === "delivery" ? city : null,
      state: mode === "delivery" ? state : null,
      address_reference: mode === "delivery" ? (addressReference || null) : null,
      notes,
      acquisition_source: acquisitionSource,
      acquisition_campaign: body.acquisition_campaign ? String(body.acquisition_campaign).slice(0, 200) : null,
      acquisition_medium: body.acquisition_medium ? String(body.acquisition_medium).slice(0, 120) : null,
      acquisition_content: body.acquisition_content ? String(body.acquisition_content).slice(0, 200) : null,
    };
    // Pedidos do número de teste são validados e calculados, mas não entram em customer_orders,
    // evitando registros no painel administrativo, financeiro, estoque e métricas comerciais.
    if (isTestPhone(whatsapp)) {
      return reply(200, {
        ok: true, test_order: true, order_id: null, subtotal: payload.subtotal,
        delivery_fee: payload.delivery_fee, total: payload.total, items: pricedItems,
      });
    }

    const insertResponse = await fetch(url + "/rest/v1/customer_orders", {
      method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(payload),
    });
    if (!insertResponse.ok) {
      console.error("combo order insert failed", await insertResponse.text());
      return reply(502, { error: "Não foi possível registrar o pedido no sistema." });
    }
    const saved = await insertResponse.json();
    return reply(200, {
      ok: true, order_id: saved?.[0]?.id ?? null, subtotal: payload.subtotal,
      delivery_fee: payload.delivery_fee, total: payload.total, items: pricedItems,
    });
  } catch (error) {
    console.error("create-combo-order error", error);
    return reply(400, { error: "Não foi possível processar os dados do combo." });
  }
});
