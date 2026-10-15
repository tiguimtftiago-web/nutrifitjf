import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderItem = {
  name: string;
  line?: string;
  weight?: string;
  quantity: number;
  unit_price: number;
  total?: number;
};

type OrderDraft = {
  customer_name: string;
  whatsapp: string;
  items: OrderItem[];
  item_count: number;
  subtotal: number;
  discount?: number;
  delivery_fee: number;
  total: number;
  cep?: string | null;
  neighborhood?: string | null;
  notes?: string | null;
  website?: string;
  acquisition_source?: string | null;
  acquisition_campaign?: string | null;
  acquisition_medium?: string | null;
  acquisition_content?: string | null;
};

const asMoney = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1000000;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 8;

function reject(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 32_000) return reject(413, "Pedido muito grande.");

  const origin = request.headers.get("origin");
  const configuredOrigins = (process.env.ORDER_ALLOWED_ORIGINS || "https://www.nutrifitjf.com.br,https://nutrifitjf.com.br,http://localhost:3000")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (origin && !configuredOrigins.includes(origin)) {
    return reject(403, "Origem não autorizada.");
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const bucket = rateBuckets.get(forwardedFor);
  if (bucket && bucket.resetAt > now && bucket.count >= RATE_LIMIT) {
    return reject(429, "Muitas tentativas. Aguarde um minuto e tente novamente.");
  }
  if (!bucket || bucket.resetAt <= now) rateBuckets.set(forwardedFor, { count: 1, resetAt: now + RATE_WINDOW_MS });
  else bucket.count += 1;
  if (rateBuckets.size > 5_000) {
    for (const [key, value] of rateBuckets) if (value.resetAt <= now) rateBuckets.delete(key);
  }

  let body: OrderDraft;
  try {
    body = (await request.json()) as OrderDraft;
  } catch {
    return reject(400, "JSON inválido.");
  }

  // Honeypot: real customers should never fill this hidden field.
  if (typeof body.website === "string" && body.website.trim()) {
    return reject(400, "Não foi possível validar o pedido.");
  }

  const name = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const phone = typeof body.whatsapp === "string" ? body.whatsapp.replace(/\D/g, "") : "";
  if (name.length < 2 || name.length > 120 || phone.length < 10 || phone.length > 15) {
    return reject(400, "Informe nome e WhatsApp válidos.");
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100) {
    return reject(400, "Itens do pedido inválidos.");
  }
  const validItems = body.items.every((item) =>
    item && typeof item.name === "string" && item.name.trim().length > 0 && item.name.length <= 160 &&
    Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100 &&
    asMoney(item.unit_price) &&
    (item.total === undefined || (asMoney(item.total) && Math.abs(item.total - item.unit_price * item.quantity) <= 0.02))
  );
  const count = body.items.reduce((sum, item) => sum + (Number.isInteger(item?.quantity) ? item.quantity : 0), 0);
  const calculatedSubtotal = body.items.reduce((sum, item) =>
    sum + (asMoney(item?.unit_price) && Number.isInteger(item?.quantity) ? item.unit_price * item.quantity : 0), 0);
  if (!validItems || !Number.isInteger(body.item_count) || body.item_count !== count ||
      !asMoney(body.subtotal) || !asMoney(body.discount ?? 0) ||
      !asMoney(body.delivery_fee) || !asMoney(body.total) ||
      Math.abs(body.subtotal - calculatedSubtotal) > 0.02) {
    return reject(400, "Valores ou quantidades inválidos.");
  }
  if ((body.discount ?? 0) > body.subtotal ||
      Math.abs(body.subtotal - (body.discount ?? 0) + body.delivery_fee - body.total) > 0.02) {
    return reject(400, "O total não confere com subtotal, desconto e entrega.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Server-side secret only. Never use NEXT_PUBLIC_* for a service-role key.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return reject(503, "Registro de pedidos indisponível.");
  }

  const safeText = (value: unknown, max = 200) =>
    typeof value === "string" ? value.trim().slice(0, max) || null : null;

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/customer_orders`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        customer_name: name,
        whatsapp: phone,
        items: body.items.map((item) => ({
          name: item.name.trim().slice(0, 160),
          line: safeText(item.line, 80),
          weight: safeText(item.weight, 40),
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total ?? item.unit_price * item.quantity,
        })),
        item_count: count,
        subtotal: body.subtotal,
        discount: body.discount ?? 0,
        delivery_fee: body.delivery_fee,
        total: body.total,
        cep: safeText(body.cep, 12),
        neighborhood: safeText(body.neighborhood, 120),
        notes: safeText(body.notes, 1000),
        status: "aguardando_confirmacao",
        acquisition_source: safeText(body.acquisition_source, 80) || "direct",
        acquisition_campaign: safeText(body.acquisition_campaign),
        acquisition_medium: safeText(body.acquisition_medium),
        acquisition_content: safeText(body.acquisition_content),
      }),
      cache: "no-store",
    });
  } catch {
    return reject(502, "Não foi possível conectar ao registro de pedidos.");
  }

  if (!response.ok) return reject(502, "Não foi possível registrar o pedido.");
  const rows = (await response.json().catch(() => [])) as Array<{ id: string; status: string; created_at: string }>;
  const order = rows[0];
  if (!order?.id || order.status !== "aguardando_confirmacao") {
    return reject(502, "O banco não confirmou o registro.");
  }
  return NextResponse.json({ order_id: order.id, status: order.status, created_at: order.created_at }, { status: 201 });
}
