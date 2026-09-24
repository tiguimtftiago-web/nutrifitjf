import { NextResponse } from "next/server";
import crypto from "node:crypto";

function validateSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = request.headers.get("x-signature") || "";
  const xRequestId = request.headers.get("x-request-id") || "";
  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";

  for (const part of parts) {
    const pair = part.split("=", 2);
    if (pair.length !== 2) continue;
    const key = pair[0].trim();
    const value = pair[1].trim();
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }

  if (!ts || !hash || !xRequestId || !dataId) return false;

  const manifest = "id:" + dataId.toLowerCase() + ";request-id:" + xRequestId + ";ts:" + ts + ";";
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  if (expected.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
}

async function sendOwnerEmail(order: any) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const amount = order?.total_paid_amount || order?.total_amount || "0.00";
  const description = order?.description || "Pedido Nutrifit";
  const reference = order?.external_reference || order?.id || "";
  const html = "<div style=\"font-family:Arial,sans-serif;line-height:1.6\">" +
    "<h2>🟢 Novo pedido pago — Nutrifit</h2>" +
    "<p><strong>Valor:</strong> R$ " + amount + "</p>" +
    "<p><strong>Referência:</strong> " + reference + "</p>" +
    "<p><strong>Detalhes:</strong><br/>" + description.replace(/\|/g, "<br/>") + "</p>" +
    "<p><strong>Status Mercado Pago:</strong> " + order?.status + " / " + order?.status_detail + "</p>" +
    "<p>O pagamento foi confirmado pelo Mercado Pago. Verifique o pedido antes de preparar e entregar.</p>" +
    "</div>";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_NOTIFICATION_FROM || "Nutrifit <onboarding@resend.dev>",
      to: [to],
      subject: "🟢 Pedido Nutrifit pago — R$ " + amount,
      html,
    }),
  });
}

export async function POST(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ ok: false }, { status: 503 });

  try {
    const url = new URL(request.url);
    const dataId = url.searchParams.get("data.id") || "";
    const body = await request.json();
    const orderId = dataId || body?.data?.id;

    if (!orderId) return NextResponse.json({ ok: true });

    if (!validateSignature(request, orderId)) {
      return NextResponse.json({ ok: false, error: "Assinatura inválida." }, { status: 401 });
    }

    const response = await fetch("https://api.mercadopago.com/v1/orders/" + encodeURIComponent(orderId), {
      headers: { Accept: "application/json", Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json({ ok: false }, { status: 502 });

    const order = await response.json();

    // Só tratamos como pedido pago quando o Mercado Pago informa processed/accredited.
    if (order.status === "processed" && order.status_detail === "accredited") {
      await sendOwnerEmail(order);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
