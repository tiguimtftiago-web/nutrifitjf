import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const TEST_PHONE_SUFFIX = "32999180713";
const isTestPhone = (value: unknown) => String(value ?? "").replace(/\D/g, "").endsWith(TEST_PHONE_SUFFIX);

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: cors });

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
    const itemsInput = Array.isArray(body.items) ? body.items : [];
    const street = String(body.street ?? "").trim().slice(0, 180);
    const addressNumber = String(body.address_number ?? "").trim().slice(0, 30);
    const addressComplement = String(body.address_complement ?? "").trim().slice(0, 120);
    const city = String(body.city ?? "").trim().slice(0, 100);
    const state = String(body.state ?? "").trim().toUpperCase().slice(0, 2);
    const addressReference = String(body.address_reference ?? "").trim().slice(0, 250);
    if (!customerName || whatsapp.length < 10 || !itemsInput.length || itemsInput.length > 60 ||
        !street || !addressNumber || !city || state.length !== 2)
      return reply(400, { error: "Dados do pedido ou endereço incompletos." });

    const items = itemsInput.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? "").trim(), line: String(item.line ?? "").trim(),
      weight: String(item.weight ?? "").trim(), quantity: Number(item.quantity),
    }));
    if (items.some((i: {name:string;line:string;weight:string;quantity:number}) =>
      !i.name || !i.line || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 100))
      return reply(400, { error: "Itens ou quantidades inválidos." });

    const catalogResponse = await fetch(
      url + "/rest/v1/catalog_products?select=name,line,size_grams,price,category,active&active=eq.true&category=in.(marmita,salada,suco,sanduiche,fruta,complemento)",
      { headers },
    );
    if (!catalogResponse.ok) return reply(502, { error: "Não foi possível conferir o catálogo." });
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
        return reply(400, { error: "A quantidade de refeições do plano mensal não corresponde ao plano selecionado." });
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
      if (!priceResponse.ok) return reply(502, { error: "Não foi possível consultar o preço do plano mensal." });
      const priceRows = await priceResponse.json();
      const planPrice = Number(priceRows?.[0]?.price);
      if (!priceRows?.length || !Number.isFinite(planPrice) || planPrice <= 0)
        return reply(400, { error: "Preço do plano mensal indisponível. Entre em contato com a Nutrifit." });
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
        if (!match) return reply(400, { error: "Prato indisponível ou não conferido no catálogo: " + meta.baseName });
        const planTotalCents = resolvedPlanPrices.get(meta.line + ":" + meta.planQuantity);
        if (planTotalCents === undefined) return reply(400, { error: "Preço do plano mensal indisponível." });
        const priceCents = Math.round(planTotalCents / meta.planQuantity);
        subtotalCents += priceCents * item.quantity;
        pricedItems.push({
          name: String(match.name) + " — Plano " + meta.planQuantity,
          line: "PLANO " + meta.line, weight: item.weight,
          price: priceCents / 100, quantity: item.quantity,
        });
        continue;
      }
      const requestedName = normalizeProduct(item.name);
      const catalogName = catalogNameAliases[requestedName] ?? requestedName;
      const match = catalog.find((p: Record<string, unknown>) =>
        normalizeProduct(p.name) === catalogName &&
        normalizeProduct(p.line) === normalizeProduct(item.line) &&
        (item.weight ? (String(p.size_grams ?? "") === item.weight.replace(/\D/g, "") || String(p.size_grams ?? "") === "") : true)
      );
      if (!match) return reply(400, { error: "Produto indisponível ou não conferido no catálogo: " + item.name });
      const priceCents = Math.round(Number(match.price) * 100);
      subtotalCents += priceCents * item.quantity;
      pricedItems.push({ name: item.name, line: String(match.line), weight: item.weight, price: priceCents / 100, quantity: item.quantity });
    }
    if (subtotalCents <= 0 || subtotalCents > 50000000) return reply(400, { error: "Valor do pedido inválido." });

    const itemCount = items.reduce((sum: number, i: {quantity:number}) => sum + i.quantity, 0);
    const cep = String(body.cep ?? "").replace(/\D/g, "").slice(0, 8);
    if (cep.length !== 8) return reply(400, { error: "Informe um CEP válido para entrega." });
    let address: Record<string, unknown>;
    try {
      const addressResponse = await fetch("https://viacep.com.br/ws/" + cep + "/json/", { signal: AbortSignal.timeout(5000) });
      if (!addressResponse.ok) return reply(400, { error: "Não foi possível validar o CEP. Tente novamente." });
      address = await addressResponse.json();
    } catch {
      return reply(502, { error: "Não foi possível validar o CEP agora." });
    }
    if (address.erro || String(address.localidade ?? "").toLocaleLowerCase("pt-BR") !== "juiz de fora" ||
        String(address.uf ?? "").toUpperCase() !== "MG")
      return reply(400, { error: "A entrega está disponível somente para CEPs de Juiz de Fora/MG." });
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const neighborhood = String(address.bairro ?? "").trim();
    const zone1 = "Monte Castelo|Carlos Chagas|Cerâmica|Francisco Bernardino|Fábrica|Esplanada|São Dimas|Centenário|Mariano Procópio|Jardim Glória|Morro da Glória|Santa Catarina|Santa Helena|Democrata|Vale do Ipê|Jardim Paineiras|Jardim Santa Helena|Poço Rico|Vitorino Braga|Nossa Senhora Aparecida";
    const zone2 = "Centro|Boa Vista|Granbery|Bom Pastor|São Mateus|Alto dos Passos|Teixeiras|Bairu|Bonfim|Botanágua|Cesário Alvim|Grajaú|Manoel Honório|Linhares|Marumbi|Progresso|Santa Rita|Santa Cândida|São Benedito|São Bernardo|Santa Terezinha|Eldorado|Jardim Bom Clima|Granjas Betânia|Jardim Emaús|Parque Independência|Grama|Jardim Natal|Nova Era|Benfica|Nova Benfica|Milho Branco|Industrial|Jóquei Clube|Barbosa Lage|Santa Cruz|Represa|Jardim dos Alfineiros|Bandeirantes|Parque Guarani|Nossa Senhora das Graças|Quintas das Avenidas|Santa Paula";
    const zone3 = "São Pedro|Aeroporto|Borboleta|Cruzeiro Santo Antônio|Martelos|Morro do Imperador|Nova Califórnia|Novo Horizonte|Serro Azul|Portal da Torre|Caiçaras|Marilândia|Santos Dumont|Alto dos Pinheiros|Adolfo Vireque|Bosque do Imperador|Granville|Viña Del Mar|Vina Del Mar|Nova Germânia|Parque das Águas|Spinaville|Via do Sol|Residencial Alvim|Dom Bosco|Cascatinha|Graminha|Ipiranga|Sagrado Coração de Jesus|Salvaterra|Santa Efigênia|Santa Luzia|Santa Cecília|Bomba de Fogo|Jardim Laranjeiras|Cruzeiro do Sul|Barão do Retiro|Floresta|Nossa Senhora de Lourdes|Santo Antônio|Vila Furtado de Menezes|Vila Ideal|Vila Olavo Costa|Costa Carvalho|Jardim Gaúcho|São Geraldo|Previdenciários|Jardim América|Bela Aurora|Estrela Sul|Jardim Casablanca|Nossa Senhora de Fátima";
    const zone4 = "Barreira do Triunfo|Filgueiras|Granjas Bethel|Vale dos Bandeirantes|Paula Lima|Remonta|Vila Esperança|Jardim Europa|Jardim Olímpia|Cidade do Sol|Cidade Jardim|Fontesville|Fontesville II|Igrejinha|Parque das Palmeiras|Parque das Torres|Parque Guadalajara|Parque Guarua|Parque Imperial|Parque Jardim da Serra|Parque Serra Verde|Jardim da Serra|Chalés do Imperador|Chalés do Algarve|Colinas do Imperador|Mandala|Portal do Aeroporto|Morada do Serro|Bosque Imperial|Conjunto Flamboyants|São Clemente|São Lucas|Santana|Neo Residencial|Spinaville II|Mirante|Cidade Universitária|Três Moinhos|Terras Altas|Retiro|Pedras Preciosas|Jardim Esperança|Jardim do Sol|Santos Anjos|Vila Alpina|São Sebastião|Aracy|Jardim das Flores|Solidariedade|Granjas Primavera|Granjas Santo Antônio|Guaruá|Granjas do Bosque|Vivendas da Serra|Vivendas das Fontes|Vale Verde|Serra D'Água|Serra Dagua|Tupã|Tiguera|Spina Ville II|Vila Ozanan";
    const n = normalize(neighborhood);
    const feeFor = (list: string) => list.split("|").some((name) => normalize(name) === n);
    let expectedFee: number | null = feeFor(zone1) ? 5 : feeFor(zone2) ? 7 : feeFor(zone3) ? 10 : feeFor(zone4) ? 13 : null;
    if (itemCount < 20 && expectedFee === null)
      return reply(400, { error: "Bairro não localizado na área de entrega. Confirme a taxa pelo WhatsApp." });
    const deliveryCents = itemCount >= 20 ? 0 : Math.round((expectedFee as number) * 100);
    const discountCode = String(body.coupon_code ?? "").trim().toUpperCase();
    let discountCents = 0;
    let redeemedCoupon: string | null = null;
    let redeemClub = false;

    if (discountCode) {
      const couponResp = await fetch(
        url + "/rest/v1/coupons?select=code,discount_type,discount_value,minimum_order_value,max_uses,uses_count,starts_at,expires_at,active&active=eq.true&code=ilike." + encodeURIComponent(discountCode) + "&limit=1",
        { headers },
      );
      if (!couponResp.ok) return reply(502, { error: "Não foi possível validar o cupom." });
      const coupons = await couponResp.json();
      const c = coupons[0];
      const now = Date.now();
      if (!c || (c.starts_at && Date.parse(c.starts_at) > now) || (c.expires_at && Date.parse(c.expires_at) < now) ||
          (c.max_uses !== null && Number(c.uses_count) >= Number(c.max_uses)) ||
          subtotalCents < Math.round(Number(c.minimum_order_value || 0) * 100))
        return reply(400, { error: "Cupom inválido, expirado ou não atende ao pedido mínimo." });
      const value = Number(c.discount_value || 0);
      discountCents = c.discount_type === "percentage" || c.discount_type === "percent"
        ? Math.round(subtotalCents * value / 100) : Math.round(value * 100);
      discountCents = Math.min(subtotalCents, Math.max(0, discountCents));
      redeemedCoupon = String(c.code);
    } else if (body.club_welcome_discount === true) {
      const profileResp = await fetch(
        url + "/rest/v1/customer_profiles?select=nutrifit_club_member,coupon_used&whatsapp=eq." + encodeURIComponent(whatsapp) + "&limit=1",
        { headers },
      );
      if (!profileResp.ok) return reply(502, { error: "Não foi possível validar o benefício do Clube Nutrifit." });
      const profiles = await profileResp.json();
      const profile = profiles[0];
      if (profile?.nutrifit_club_member === true && profile?.coupon_used === false) {
        discountCents = Math.min(500, subtotalCents);
        redeemClub = true;
      }
    }
    const totalCents = Math.max(0, subtotalCents - discountCents + deliveryCents);
    const payload = {
      customer_name: customerName, whatsapp, email: body.email ? String(body.email).slice(0, 254) : null,
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
    // Pedidos do número de teste são validados e calculados, mas não entram em customer_orders,
    // evitando registros no painel administrativo, financeiro, estoque e métricas comerciais.
    if (isTestPhone(whatsapp)) {
      return reply(200, {
        ok: true, test_order: true, order_id: null,
        subtotal: subtotalCents / 100, discount: discountCents / 100,
        delivery_fee: deliveryCents / 100, total: totalCents / 100,
        items: pricedItems,
      });
    }

    const insertResponse = await fetch(url + "/rest/v1/customer_orders", {
      method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(payload),
    });
    if (!insertResponse.ok) {
      console.error("customer order insert failed", await insertResponse.text());
      return reply(502, { error: "Não foi possível registrar o pedido. O WhatsApp continua disponível." });
    }
    const saved = await insertResponse.json();
    if (redeemedCoupon) {
      await fetch(url + "/rest/v1/rpc/redeem_nutrifit_coupon", {
        method: "POST", headers,
        body: JSON.stringify({ p_code: redeemedCoupon }),
      });
    }
    if (redeemClub) {
      await fetch(url + "/rest/v1/rpc/redeem_clube_nutrifit_welcome_coupon", {
        method: "POST", headers, body: JSON.stringify({ p_whatsapp: whatsapp }),
      });
    }
    return reply(200, {
      ok: true, order_id: saved?.[0]?.id ?? null,
      subtotal: payload.subtotal, discount: payload.discount,
      delivery_fee: payload.delivery_fee, total: payload.total,
      items: pricedItems,
    });
  } catch (error) {
    console.error("create-customer-order error", error);
    return reply(400, { error: "Não foi possível processar os dados do pedido." });
  }
});