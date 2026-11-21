import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set([
  "https://nutrifitjf.com.br",
  "https://www.nutrifitjf.com.br",
  "https://utrifit-site.vercel.app",
  "http://localhost:3000",
]);
const corsHeaders = (origin: string) => ({
  ...(origin && allowedOrigins.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
});

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeOrderRateLimit(
  url: string,
  headers: Record<string, string>,
  identifierHash: string,
  scope: string,
  windowSeconds: number,
  maxRequests: number,
): Promise<boolean> {
  const response = await fetch(url + "/rest/v1/rpc/consume_public_order_rate_limit", {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_identifier_hash: identifierHash,
      p_scope: scope,
      p_window_seconds: windowSeconds,
      p_max_requests: maxRequests,
    }),
  });
  if (!response.ok) throw new Error("Rate-limit service unavailable: " + await response.text());
  return await response.json() === true;
}

async function enforcePublicOrderRateLimit(
  req: Request,
  url: string,
  headers: Record<string, string>,
  route: "customer-order" | "combo-order",
  whatsapp: string,
): Promise<boolean> {
  const ip = req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const phone = whatsapp.replace(/\D/g, "");
  const checks: Array<{ hash: string; scope: string; window: number; max: number }> = [];
  if (ip) {
    const hash = await sha256Hex("ip:" + ip);
    checks.push(
      { hash, scope: route + ":ip", window: 600, max: 12 },
      { hash, scope: route + ":ip", window: 86400, max: 60 },
    );
  }
  if (phone.length >= 10) {
    const hash = await sha256Hex("phone:" + phone);
    checks.push(
      { hash, scope: route + ":phone", window: 600, max: 5 },
      { hash, scope: route + ":phone", window: 86400, max: 20 },
    );
  }
  if (!checks.length) return false;
  for (const check of checks) {
    const allowed = await consumeOrderRateLimit(url, headers, check.hash, check.scope, check.window, check.max);
    if (!allowed) return false;
  }
  return true;
}

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

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const originAllowed = !origin || allowedOrigins.has(origin);
  const respond = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
  if (req.method === "OPTIONS")
    return new Response("ok", { status: originAllowed ? 200 : 403, headers: corsHeaders(origin) });
  if (!originAllowed) return respond(403, { error: "Origem não autorizada." });
  if (req.method !== "POST") return respond(405, { error: "Método não permitido." });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return respond(500, { error: "Configuração do servidor incompleta." });
  const headers = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };

  try {
    const body = await req.json();
    const customerName = String(body.customer_name ?? "").trim().slice(0, 120);
    const whatsapp = String(body.whatsapp ?? "").replace(/\D/g, "").slice(0, 20);
    if (whatsapp.length < 10) return respond(400, { error: "Informe um WhatsApp válido." });
    let rateAllowed = false;
    try {
      rateAllowed = await enforcePublicOrderRateLimit(req, url, headers, "combo-order", whatsapp);
    } catch (rateError) {
      console.error("combo order rate-limit check failed", rateError);
      return respond(503, { error: "Não foi possível validar a proteção do pedido. Tente novamente." });
    }
    if (!rateAllowed) return respond(429, { error: "Muitas tentativas de pedido. Aguarde alguns minutos e tente novamente." });
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
      return respond(400, { error: "Dados do combo ou endereço incompletos ou inválidos." });

    const items = rawItems.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? "").trim().slice(0, 160),
      line: String(item.line ?? "").trim(),
      weight: String(item.weight ?? "").trim(),
      quantity: Number(item.quantity),
    }));
    if (items.some((item: {name:string;line:string;weight:string;quantity:number}) =>
      !item.name || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > quantity ||
      normalize(item.line) !== normalize(line) || !item.weight))
      return respond(400, { error: "Há pratos ou quantidades inválidos no combo." });
    const mealCount = items.reduce((sum: number, item: {quantity:number}) => sum + item.quantity, 0);
    if (mealCount !== quantity) return respond(400, { error: "A quantidade de marmitas não corresponde ao combo escolhido." });

    const complementInput = rawComplements.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? "").trim().slice(0, 160),
      quantity: Number(item.quantity),
    }));
    if (complementInput.some((item: {name:string;quantity:number}) =>
      !item.name || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100))
      return respond(400, { error: "Há complementos ou quantidades inválidos." });

    const catalogResponse = await fetch(
      url + "/rest/v1/catalog_products?select=name,line,size_grams,price,category,active,premium_surcharge&active=eq.true&category=in.(marmita,salada,suco,sanduiche,fruta,complemento)",
      { headers },
    );
    if (!catalogResponse.ok) return respond(502, { error: "Não foi possível conferir o catálogo." });
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
    const premiumBreakdown: Array<{name:string;quantity:number;unit_cents:number;total_cents:number}> = [];
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
      if (!match) return respond(400, { error: "Prato indisponível ou não conferido no catálogo: " + item.name });
      const surchargeCents = Math.round(Number(match.premium_surcharge ?? 0) * 100);
      if (!Number.isFinite(surchargeCents) || surchargeCents < 0)
        return respond(502, { error: "O adicional cadastrado para " + item.name + " é inválido. Entre em contato com a Nutrifit." });
      if (surchargeCents > 0) {
        const totalSurchargeCents = surchargeCents * item.quantity;
        premiumCents += totalSurchargeCents;
        premiumBreakdown.push({ name: String(match.name), quantity: item.quantity, unit_cents: surchargeCents, total_cents: totalSurchargeCents });
      }

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
      if (!match) return respond(400, { error: "Complemento indisponível ou sem preço cadastrado: " + item.name });
      const unitCents = Math.round(Number(match.price) * 100);
      if (!Number.isFinite(unitCents) || unitCents < 0) return respond(400, { error: "Preço inválido para o complemento: " + item.name });
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
    if (mode === "delivery") {
      if (cep.length !== 8) return respond(400, { error: "Informe um CEP válido para calcular a entrega." });
      let address: Record<string, unknown>;
      try {
        const response = await fetch("https://viacep.com.br/ws/" + cep + "/json/", { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return respond(502, { error: "Não foi possível validar o CEP agora." });
        address = await response.json();
      } catch {
        return respond(502, { error: "Não foi possível validar o CEP agora." });
      }
      if (address.erro || normalize(address.localidade) !== normalize("Juiz de Fora") || String(address.uf ?? "").toUpperCase() !== "MG")
        return respond(400, { error: "A entrega está disponível somente para CEPs de Juiz de Fora/MG." });
      if (normalize(city) !== normalize("Juiz de Fora") || state !== "MG")
        return respond(400, { error: "Cidade e estado não correspondem à área de entrega da Nutrifit." });
      neighborhood = String(address.bairro ?? "").trim();

      const deliveryFeeResponse = await fetch(
        url + "/rest/v1/delivery_neighborhood_fees?select=neighborhood,normalized_name,zone_number,delivery_fee&active=eq.true",
        { headers },
      );
      if (!deliveryFeeResponse.ok)
        return respond(502, { error: "Não foi possível consultar as taxas de entrega." });
      const deliveryFeeRows = await deliveryFeeResponse.json();
      const normalizedNeighborhood = normalize(neighborhood);
      const deliveryMatch = deliveryFeeRows.find((row: Record<string, unknown>) =>
        String(row.normalized_name ?? "") === normalizedNeighborhood ||
        normalize(String(row.neighborhood ?? "")) === normalizedNeighborhood
      );
      if (!deliveryMatch)
        return respond(400, { error: "Bairro não localizado na área de entrega. Confirme a taxa pelo WhatsApp." });
      const expectedFee = Number(deliveryMatch.delivery_fee);
      if (!Number.isFinite(expectedFee) || expectedFee <= 0)
        return respond(502, { error: "A taxa de entrega cadastrada é inválida. Entre em contato com a Nutrifit." });
      if (quantity < 20) deliveryCents = Math.round(expectedFee * 100);
    }

    const subtotalCents = baseCents + premiumCents + complementCents;
    const totalCents = subtotalCents + deliveryCents;
    if (subtotalCents <= 0 || totalCents > 50000000) return respond(400, { error: "Valor do pedido inválido." });
    const acquisitionSource = body.acquisition_source ? String(body.acquisition_source).slice(0, 120) : "site_combo_builder";
    const notes = [
      "Pedido iniciado pelo montador de combos.",
      "Linha: " + line + "; quantidade do combo: " + quantity + "; recebimento: " + mode + ".",
      premiumBreakdown.length ? "Adicionais por proteínas especiais: " + premiumBreakdown.map((item) => item.quantity + "x " + item.name + " (" + (item.total_cents / 100).toFixed(2) + ")").join("; ") : "",
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
    const insertResponse = await fetch(url + "/rest/v1/customer_orders", {
      method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(payload),
    });
    if (!insertResponse.ok) {
      console.error("combo order insert failed", await insertResponse.text());
      return respond(502, { error: "Não foi possível registrar o pedido no sistema." });
    }
    const saved = await insertResponse.json();
    return respond(200, {
      ok: true, order_id: saved?.[0]?.id ?? null, order_code: saved?.[0]?.order_code ?? null,
      combo_base: baseCents / 100, premium_surcharge: premiumCents / 100, complement_total: complementCents / 100,
      subtotal: payload.subtotal, delivery_fee: payload.delivery_fee, total: payload.total,
      premium_breakdown: premiumBreakdown.map((item) => ({ name: item.name, quantity: item.quantity, unit_surcharge: item.unit_cents / 100, total_surcharge: item.total_cents / 100 })),
      items: pricedItems,
    });
  } catch (error) {
    console.error("create-combo-order error", error);
    return respond(400, { error: "Não foi possível processar os dados do combo." });
  }
});
