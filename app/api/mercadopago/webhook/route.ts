import { NextResponse } from "next/server";

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
    const body = await request.json();
    const orderId = body?.data?.id;
    if (!orderId) return NextResponse.json({ ok: true });

    const response = await fetch("https://api.mercadopago.com/v1/orders/" + encodeURIComponent(orderId), {
      headers: { Accept: "application/json", Authorization: "Bearer " + token },
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json({ ok: false }, { status: 502 });

    const order = await response.json();
    if (order.status === "processed" && order.status_detail === "accredited") {
      await sendOwnerEmail(order);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
