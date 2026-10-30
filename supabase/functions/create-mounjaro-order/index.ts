import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: cors });
const TEST_PHONE_SUFFIX = "32999180713";
const isTestPhone = (value: string) => value.replace(/\D/g, "").endsWith(TEST_PHONE_SUFFIX);
const normalize = (value: unknown) => String(value ?? "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]/g, "");

const catalog = [
  { name: "Frango ao molho de tomate", price: 19.90 },
  { name: "Tilápia com legumes", price: 24.90 },
  { name: "Patinho moído com mandioquinha", price: 26.90 },
  { name: "Omelete de espinafre com quinoa", price: 19.90 },
  { name: "Escondidinho leve de frango", price: 20.90 },
  { name: "Strogonoff leve de frango", price: 18.90 },
  { name: "Carne moída com chuchu e purê", price: 24.90 },
  { name: "Salmão com legumes assados", price: 38.90 },
  { name: "Feijão com frango e arroz (mini)", price: 18.90 },
  { name: "Panqueca de frango com ricota", price: 21.90 },
];

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
    const whatsapp = String(body.whatsapp ?? "").replace(/\D/g, "").slice(0, 15);
    const email = String(body.email ?? "").trim().slice(0, 254);
    const input = Array.isArray(body.items) ? body.items : [];
    if (customerName.length < 2 || whatsapp.length < 10 || whatsapp.length > 15 || !input.length || input.length > 10)
      return reply(400, { error: "Informe nome, WhatsApp válido e pelo menos uma marmita." });

    const counts = new Map<string, number>();
    for (const raw of input) {
      const name = String(raw?.name ?? "").trim();
      const quantity = Number(raw?.quantity);
      const product = catalog.find((p) => normalize(p.name) === normalize(name));
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 50)
        return reply(400, { error: "Prato ou quantidade inválidos: " + name });
      counts.set(product.name, (counts.get(product.name) || 0) + quantity);
    }
    const itemCount = [...counts.values()].reduce((sum, q) => sum + q, 0);
    if (itemCount < 1 || itemCount > 100) return reply(400, { error: "A quantidade total deve ser de 1 a 100 marmitas." });

    const pricedItems = catalog.filter((p) => counts.has(p.name)).map((p) => ({
      name: p.name, line: "MOUNJARO", weight: "250 g", price: p.price, quantity: counts.get(p.name),
    }));
    const subtotalCents = pricedItems.reduce((sum, item) => sum + Math.round(item.price * 100) * Number(item.quantity), 0);
    if (subtotalCents <= 0 || subtotalCents > 50000000) return reply(400, { error: "Valor do pedido inválido." });

    if (isTestPhone(whatsapp)) {
      return reply(200, { ok: true, test_order: true, order_id: null, item_count: itemCount,
        subtotal: subtotalCents / 100, total: subtotalCents / 100, items: pricedItems });
    }

    const payload = {
      customer_name: customerName, whatsapp, email: email && email.includes("@") ? email : null,
      items: pricedItems, item_count: itemCount, subtotal: subtotalCents / 100,
      discount: 0, delivery_fee: 0, total: subtotalCents / 100,
      acquisition_source: "site_combo_mounjaro",
      acquisition_campaign: "combo_mounjaro",
      notes: "Combo Mounjaro personalizado iniciado pelo site. Peso por unidade: até 250 g. Entrega/retirada e disponibilidade devem ser confirmadas pelo WhatsApp antes do pagamento.",
    };
    const inserted = await fetch(url + "/rest/v1/customer_orders", {
      method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(payload),
    });
    if (!inserted.ok) {
      console.error("create-mounjaro-order insert failed", await inserted.text());
      return reply(502, { error: "Não foi possível registrar a solicitação no sistema. Tente novamente ou fale com a Nutrifit." });
    }
    const saved = await inserted.json();
    return reply(200, { ok: true, order_id: saved?.[0]?.id ?? null, item_count: itemCount,
      subtotal: subtotalCents / 100, total: subtotalCents / 100, items: pricedItems });
  } catch (error) {
    console.error("create-mounjaro-order error", error);
    return reply(400, { error: "Não foi possível processar os dados do combo." });
  }
});
