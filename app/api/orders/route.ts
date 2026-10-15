import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderItem = {
  name: string;
  line?: string;
  weight?: string;
  quantity: number;
  unit_price?: number;
  total?: number;
};

type OrderDraft = {
  customer_name: string;
  whatsapp: string;
  items: OrderItem[];
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  cep?: string | null;
  neighborhood?: string | null;
  acquisition_source?: string | null;
  acquisition_campaign?: string | null;
  acquisition_medium?: string | null;
  acquisition_content?: string | null;
};

const asMoney = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export async function POST(request: Request) {
  let body: OrderDraft;
  try {
    body = (await request.json()) as OrderDraft;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const name = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const phone = typeof body.whatsapp === "string" ? body.whatsapp.replace(/\D/g, "") : "";
  if (name.length < 2 || name.length > 120 || phone.length < 10 || phone.length > 15) {
    return NextResponse.json({ error: "Informe nome e WhatsApp válidos." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100) {
    return NextResponse.json({ error: "Itens do pedido inválidos." }, { status: 400 });
  }
  const validItems = body.items.every((item) =>
    item && typeof item.name === "string" && item.name.trim().length > 0 &&
    Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100 &&
    (item.unit_price === undefined || asMoney(item.unit_price)) &&
    (item.total === undefined || asMoney(item.total))
  );
  if (!validItems || !Number.isInteger(body.item_count) || body.item_count < 1 ||
      !asMoney(body.subtotal) || !asMoney(body.delivery_fee) || !asMoney(body.total)) {
    return NextResponse.json({ error: "Valores ou quantidades inválidos." }, { status: 400 });
  }
  if (Math.abs(body.subtotal + body.delivery_fee - body.total) > 0.02) {
    return NextResponse.json({ error: "O total não confere com subtotal e entrega." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json({ error: "Registro de pedidos indisponível." }, { status: 503 });
  }

  const acquisition = (value: unknown) =>
    typeof value === "string" ? value.trim().slice(0, 200) || null : null;

  const response = await fetch(`${supabaseUrl}/rest/v1/customer_orders`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      customer_name: name,
      whatsapp: phone,
      items: body.items,
      item_count: body.item_count,
      subtotal: body.subtotal,
      delivery_fee: body.delivery_fee,
      total: body.total,
      cep: acquisition(body.cep),
      neighborhood: acquisition(body.neighborhood),
      status: "aguardando_confirmacao",
      acquisition_source: acquisition(body.acquisition_source) || "direct",
      acquisition_campaign: acquisition(body.acquisition_campaign),
      acquisition_medium: acquisition(body.acquisition_medium),
      acquisition_content: acquisition(body.acquisition_content),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Não foi possível registrar o pedido." }, { status: 502 });
  }
  const rows = (await response.json()) as Array<{ id: string; status: string; created_at: string }>;
  const order = rows[0];
  if (!order?.id) {
    return NextResponse.json({ error: "O banco não confirmou o registro." }, { status: 502 });
  }
  return NextResponse.json({ order_id: order.id, status: order.status, created_at: order.created_at }, { status: 201 });
}
