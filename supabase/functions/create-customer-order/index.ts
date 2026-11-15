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

const normalizeNeighborhood = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

async function getDeliveryZone(
  url: string,
  headers: Record<string, string>,
  neighborhood: string,
): Promise<{ zone: string; fee: number } | null> {
  const normalized = normalizeNeighborhood(neighborhood);
  if (!normalized) return null;
  const response = await fetch(
    url + "/rest/v1/delivery_zone_neighborhoods?select=zone,fee&normalized_name=eq." +
      encodeURIComponent(normalized) + "&active=eq.true&limit=1",
    { headers, signal: AbortSignal.timeout(5000) },
  );
  if (!response.ok) throw new Error("Delivery zone lookup unavailable: " + await response.text());
  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return null;
  const fee = Number(row.fee);
  if (!Number.isFinite(fee) || fee < 0) return null;
  return { zone: String(row.zone), fee };
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
      rateAllowed = await enforcePublicOrderRateLimit(req, url, headers, "customer-order", whatsapp);
    } catch (rateError) {
      console.error("customer order rate-limit check failed", rateError);
      return respond(503, { error: "Não foi possível validar a proteção do pedido. Tente novamente." });
    }
    if (!rateAllowed) return respond(429, { error: "Muitas tentativas de pedido. Aguarde alguns minutos e tente novamente." });
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
    const clubIdentityType = body.club_identity_type === "email" ? "email" : "whatsapp";
    const itemsInput = Array.isArray(body.items) ? body.items : [];
    const street = String(body.street ?? "").trim().slice(0, 180);
    const addressNumber = String(body.address_number ?? "").trim().slice(0, 30);
    const addressComplement = String(body.address_complement ?? "").trim().slice(0, 120);
    const city = String(body.city ?? "").trim().slice(0, 100);
    const state = String(body.state ?? "").trim().toUpperCase().slice(0, 2);
    const addressReference = String(body.address_reference ?? "").trim().slice(0, 250);
    if (!customerName || whatsapp.length < 10 || !itemsInput.length || itemsInput.length > 60 ||
        !street || !addressNumber || !city || state.length !== 2)
      return respond(400, { error: "Dados do pedido ou endereço incompletos." });

    const items = itemsInput.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? "").trim(), line: String(item.line ?? "").trim(),
      weight: String(item.weight ?? "").trim(), quantity: Number(item.quantity),
    }));
    if (items.some((i: {name:string;line:string;weight:string;quantity:number}) =>
      !i.name || !i.line || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 100))
      return respond(400, { error: "Itens ou quantidades inválidos." });

    const catalogResponse = await fetch(
      url + "/rest/v1/catalog_products?select=name,line,size_grams,price,category,active&active=eq.true&category=in.(marmita,salada,suco,sanduiche,fruta,complemento)",
      { headers },
    );
    if (!catalogResponse.ok) return respond(502, { error: "Não foi possível conferir o catálogo." });
    const catalog = await catalogResponse.json();
    const normalizeProduct = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]/g, "");
const catalogNameAliases: Record<string, string> = {
  [normalizeProduct("Feijoada")]: normalizeProduct("Feijoada Fit"),
  [normalizeProduct("Churrasco Mineiro")]: normalizeProduct("Churrasco Fit Mineiro"),
};
    const planLineLabels: Record<string, string> = { FIT: "Fit", PERFORMANCE: "Performance", TRADICIONAL: "Tradicional" };
    const planWeights: Record<string, number> = { FIT: 350, PERFORMANCE: 450, TRADICIONAL: 500 };
    const planMeta: Array<{ line: string; planQuantity: number; baseName: string } | null> = items.map((item) => {
      const lineMatch = item.line.match(/^PLANO\s+(FIT|PERFORMANCE|TRADICIONAL)$/i);
      if (!lineMatch) {
        if (/^PLANO\b/i.test(item.line)) throw new Error("Linha de plano mensal inválida.");
        return null;
      }
      const suffix = item.name.match(/\s+[—-]\s+Plano\s+(30|60)$/i);
      if (!suffix) throw new Error("O item do plano mensal não contém a quantidade do plano.");
      return {
        line: lineMatch[1].toUpperCase(),
        planQuantity: Number(suffix[1]),
        baseName: item.name.replace(/\s+[—-]\s+Plano\s+(30|60)$/i, "").trim(),
      };
    });
    const planGroupCounts = new Map<string, number>();
    planMeta.forEach((meta, index) => {
      if (!meta) return;
      const key = meta.line + ":" + meta.planQuantity;
      planGroupCounts.set(key, (planGroupCounts.get(key) || 0) + items[index].quantity);
    });
    for (const [key, count] of planGroupCounts) {
      const [line, qtyText] = key.split(":");
      const planQuantity = Number(qtyText);
      if (![30, 60].includes(planQuantity) || count !== planQuantity)
        return respond(400, { error: "A quantidade de refeições do plano mensal não corresponde ao plano selecionado." });
    }

    const resolvedPlanPrices = new Map<string, number>();
    for (const key of planGroupCounts.keys()) {
      const [line, qtyText] = key.split(":");
      const planQuantity = Number(qtyText);
      const priceResponse = await fetch(
        url + "/rest/v1/catalog_combos?select=price&active=eq.true&name=eq." +
          encodeURIComponent("PLANO " + line) + "&quantity=eq." + planQuantity + "&limit=1",
        { headers },
      );
      if (!priceResponse.ok) return respond(502, { error: "Não foi possível consultar o preço do plano mensal." });
      const priceRows = await priceResponse.json();
      const planPrice = Number(priceRows?.[0]?.price);
      if (!priceRows?.length || !Number.isFinite(planPrice) || planPrice <= 0)
        return respond(400, { error: "Preço do plano mensal indisponível. Entre em contato com a Nutrifit." });
      resolvedPlanPrices.set(key, Math.round(planPrice * 100));
    }

    let subtotalCents = 0;
    const pricedItems = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const meta = planMeta[index];
      if (meta) {
        const match = catalog.find((p: Record<string, unknown>) =>
          normalizeProduct(p.name) === normalizeProduct(meta.baseName) &&
          normalizeProduct(p.line) === normalizeProduct(planLineLabels[meta.line]) &&
          Number(p.size_grams) === planWeights[meta.line] &&
          normalizeProduct(p.category) === "marmita"
        );
        if (!match) return respond(400, { error: "Prato indisponível ou não conferido no catálogo: " + meta.baseName });
        const planTotalCents = resolvedPlanPrices.get(meta.line + ":" + meta.planQuantity);
        if (planTotalCents === undefined) return respond(400, { error: "Preço do plano mensal indisponível." });
        const priceCents = Math.round(planTotalCents / meta.planQuantity);
        subtotalCents += priceCents * item.quantity;
        pricedItems.push({
          name: String(match.name) + " — Plano " + meta.planQuantity,
          line: "PLANO " + meta.line, weight: item.weight,
          price: priceCents / 100, quantity: item.quantity,
        });
        continue;
      }
      const isSnackBox = normalizeProduct(item.line) === normalizeProduct("Snack Box");
      const baseItemName = isSnackBox ? item.name.split(" — ")[0] : item.name;
      const requestedName = normalizeProduct(baseItemName);
      const catalogName = catalogNameAliases[requestedName] ?? requestedName;
      const match = catalog.find((p: Record<string, unknown>) =>
        normalizeProduct(p.name) === catalogName &&
        normalizeProduct(p.line) === normalizeProduct(item.line) &&
        (item.weight ? (String(p.size_grams ?? "") === item.weight.replace(/\D/g, "") || String(p.size_grams ?? "") === "") : true)
      );
      if (!match) return respond(400, { error: "Produto indisponível ou não conferido no catálogo: " + item.name });
      const priceCents = Math.round(Number(match.price) * 100);
      subtotalCents += priceCents * item.quantity;
      pricedItems.push({ name: item.name, line: String(match.line), weight: item.weight, price: priceCents / 100, quantity: item.quantity });
    }
    if (subtotalCents < 5000) return respond(400, { error: "O pedido mínimo é de R$ 50,00 em produtos. O frete é calculado à parte." });
    if (subtotalCents > 50000000) return respond(400, { error: "Valor do pedido inválido." });

    const itemCount = items.reduce((sum: number, i: {quantity:number}) => sum + i.quantity, 0);
    const cep = String(body.cep ?? "").replace(/\D/g, "").slice(0, 8);
    if (cep.length !== 8) return respond(400, { error: "Informe um CEP válido para entrega." });
    let address: Record<string, unknown>;
    try {
      const addressResponse = await fetch("https://viacep.com.br/ws/" + cep + "/json/", { signal: AbortSignal.timeout(5000) });
      if (!addressResponse.ok) return respond(400, { error: "Não foi possível validar o CEP. Tente novamente." });
      address = await addressResponse.json();
    } catch {
      return respond(502, { error: "Não foi possível validar o CEP agora." });
    }
    if (address.erro || String(address.localidade ?? "").toLocaleLowerCase("pt-BR") !== "juiz de fora" ||
        String(address.uf ?? "").toUpperCase() !== "MG")
      return respond(400, { error: "A entrega está disponível somente para CEPs de Juiz de Fora/MG." });
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    if (normalize(city) !== normalize(String(address.localidade ?? "")) || state !== String(address.uf ?? "").toUpperCase())
      return respond(400, { error: "Cidade e estado não correspondem ao CEP informado. Confira o endereço." });
    const neighborhood = String(address.bairro ?? "").trim();
    let deliveryZone: { zone: string; fee: number } | null;
    try {
      deliveryZone = await getDeliveryZone(url, headers, neighborhood);
    } catch (deliveryError) {
      console.error("customer order delivery-zone lookup failed", deliveryError);
      return respond(503, { error: "Não foi possível consultar a taxa de entrega agora. Tente novamente." });
    }
    if (!deliveryZone)
      return respond(400, { error: "Bairro não localizado na área de entrega. Confirme a taxa pelo WhatsApp." });
    const deliveryCents = itemCount >= 20 ? 0 : Math.round(deliveryZone.fee * 100);
    const discountCode = String(body.coupon_code ?? "").trim().toUpperCase();
    let discountCents = 0;
    let redeemedCoupon: string | null = null;
    let redeemClub = false;
    let clubProfileId: string | null = null;

    if (discountCode) {
      const couponResp = await fetch(
        url + "/rest/v1/coupons?select=code,discount_type,discount_value,minimum_order_value,max_uses,uses_count,starts_at,expires_at,active&active=eq.true&code=ilike." + encodeURIComponent(discountCode) + "&limit=1",
        { headers },
      );
      if (!couponResp.ok) return respond(502, { error: "Não foi possível validar o cupom." });
      const coupons = await couponResp.json();
      const c = coupons[0];
      const now = Date.now();
      if (!c || (c.starts_at && Date.parse(c.starts_at) > now) || (c.expires_at && Date.parse(c.expires_at) < now) ||
          (c.max_uses !== null && Number(c.uses_count) >= Number(c.max_uses)) ||
          subtotalCents < Math.round(Number(c.minimum_order_value || 0) * 100))
        return respond(400, { error: "Cupom inválido, expirado ou não atende ao pedido mínimo." });
      const value = Number(c.discount_value || 0);
      discountCents = c.discount_type === "percentage" || c.discount_type === "percent"
        ? Math.round(subtotalCents * value / 100) : Math.round(value * 100);
      discountCents = Math.min(subtotalCents, Math.max(0, discountCents));
      redeemedCoupon = String(c.code);
    } else if (body.club_welcome_discount === true) {
      if (clubIdentityType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return respond(400, { error: "Informe o mesmo e-mail usado no cadastro do Clube Nutrifit." });
      const identityFilter = clubIdentityType === "email"
        ? "email=eq." + encodeURIComponent(email)
        : "whatsapp=eq." + encodeURIComponent(whatsapp);
      const profileResp = await fetch(
        url + "/rest/v1/customer_profiles?select=id,nutrifit_club_member,coupon_used&" + identityFilter + "&limit=1",
        { headers },
      );
      if (!profileResp.ok) return respond(502, { error: "Não foi possível validar o benefício do Clube Nutrifit." });
      const profiles = await profileResp.json();
      const profile = profiles[0];
      if (profile?.nutrifit_club_member !== true || profile?.coupon_used !== false || !profile?.id) {
        return respond(409, { error: "O benefício de boas-vindas não está disponível para este cadastro ou já foi utilizado." });
      }
      discountCents = Math.min(1000, subtotalCents);
      redeemClub = true;
      clubProfileId = String(profile.id);
    }
    const totalCents = Math.max(0, subtotalCents - discountCents + deliveryCents);
    const payload = {
      customer_name: customerName, whatsapp, email: email || null, customer_profile_id: clubProfileId,
      items: pricedItems, item_count: itemCount, subtotal: subtotalCents / 100,
      discount: discountCents / 100, delivery_fee: deliveryCents / 100, total: totalCents / 100,
      cep: String(body.cep ?? "").replace(/\D/g, "").slice(0, 8) || null,
      street, address_number: addressNumber, address_complement: addressComplement || null,
      city, state, address_reference: addressReference || null,
      neighborhood: neighborhood || null,
      notes: body.notes ? String(body.notes).slice(0, 2000) : null,
      acquisition_source: body.acquisition_source ? String(body.acquisition_source).slice(0, 120) : null,
      acquisition_campaign: body.acquisition_campaign ? String(body.acquisition_campaign).slice(0, 200) : null,
      acquisition_medium: body.acquisition_medium ? String(body.acquisition_medium).slice(0, 120) : null,
      acquisition_content: body.acquisition_content ? String(body.acquisition_content).slice(0, 200) : null,
    };
    let savedOrderId: string | null = null;
    if (redeemClub) {
      const atomicResponse = await fetch(url + "/rest/v1/rpc/create_customer_order_with_clube_welcome_coupon", {
        method: "POST", headers,
        body: JSON.stringify({
          p_order: payload,
          p_profile_id: clubProfileId,
          p_whatsapp: clubIdentityType === "whatsapp" ? whatsapp : null,
          p_email: clubIdentityType === "email" ? email : null,
        }),
      });
      if (!atomicResponse.ok) {
        const errorText = await atomicResponse.text();
        console.error("atomic Clube order failed", errorText);
        return respond(409, { error: "O benefício do Clube não pôde ser confirmado. Nenhum pedido com desconto foi registrado. Atualize os dados e tente novamente." });
      }
      const atomicResult = await atomicResponse.json();
      savedOrderId = atomicResult?.id ?? null;
      if (!savedOrderId) return respond(502, { error: "O pedido não retornou uma confirmação válida. Entre em contato com a Nutrifit antes de tentar novamente." });
    } else {
      const insertResponse = await fetch(url + "/rest/v1/customer_orders", {
        method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(payload),
      });
      if (!insertResponse.ok) {
        console.error("customer order insert failed", await insertResponse.text());
        return respond(502, { error: "Não foi possível registrar o pedido. O WhatsApp continua disponível." });
      }
      const saved = await insertResponse.json();
      savedOrderId = saved?.[0]?.id ?? null;
    }
    if (redeemedCoupon) {
      await fetch(url + "/rest/v1/rpc/redeem_nutrifit_coupon", {
        method: "POST", headers,
        body: JSON.stringify({ p_code: redeemedCoupon }),
      });
    }
    const codeResponse = savedOrderId
      ? await fetch(url + "/rest/v1/customer_orders?select=order_code&id=eq." + encodeURIComponent(savedOrderId) + "&limit=1", { headers })
      : null;
    const codeRows = codeResponse?.ok ? await codeResponse.json() : [];
    return respond(200, {
      ok: true, order_id: savedOrderId, order_code: codeRows?.[0]?.order_code ?? null,
      subtotal: payload.subtotal, discount: payload.discount,
      delivery_fee: payload.delivery_fee, total: payload.total,
      items: pricedItems,
    });
  } catch (error) {
    console.error("create-customer-order error", error);
    return respond(400, { error: "Não foi possível processar os dados do pedido." });
  }
});