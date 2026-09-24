import { NextResponse } from "next/server";

const COMBO_PRICES: Record<string, Record<string, number>> = {
  FIT: { "5": 117, "7": 164, "10": 235, "14": 328, "20": 459 },
  PERFORMANCE: { "5": 139.9, "7": 194.9, "10": 274.9, "14": 384.9, "20": 539.9 },
  TRADICIONAL: { "5": 139.9, "7": 194.9, "10": 269.9, "14": 379.9, "20": 529.9 },
};

const money = (value: number) => value.toFixed(2);

export async function POST(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Pagamento ainda não configurado. Falta a credencial do Mercado Pago no servidor." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { customer, line, weight, quantity, selectedItems, deliveryFee, deliveryMode, deliveryText, neighborhood, cep, total } = body ?? {};
    const numericQuantity = Number(quantity);
    const expectedSubtotal = COMBO_PRICES[line]?.[String(numericQuantity)];

    if (!expectedSubtotal) return NextResponse.json({ error: "Combo inválido." }, { status: 400 });
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: "Informe nome, e-mail e telefone." }, { status: 400 });
    }

    const normalizedDeliveryFee = Number(deliveryFee || 0);
    const expectedDeliveryFee =
      deliveryMode === "pickup"
        ? 0
        : expectedSubtotal >= 200
          ? 0
          : [5, 7, 10, 13].includes(normalizedDeliveryFee)
            ? normalizedDeliveryFee
            : null;

    if (expectedDeliveryFee === null) return NextResponse.json({ error: "Taxa de entrega inválida." }, { status: 400 });

    const expectedTotal = Number((expectedSubtotal + expectedDeliveryFee).toFixed(2));
    if (Number(total) !== expectedTotal) {
      return NextResponse.json({ error: "O valor do pedido mudou. Atualize a página e tente novamente." }, { status: 409 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const orderRef = "NF-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();

    const description = [
      "Nutrifit",
      line + " " + weight + " — " + numericQuantity + " marmitas",
      "Sabores: " + String(selectedItems || "").slice(0, 500),
      "Cliente: " + String(customer.name).slice(0, 120),
      "WhatsApp: " + String(customer.phone).slice(0, 40),
      "Entrega: " + String(deliveryText || "").slice(0, 180),
      neighborhood ? "Bairro: " + String(neighborhood).slice(0, 80) : "",
      cep ? "CEP: " + String(cep).slice(0, 12) : "",
    ].filter(Boolean).join(" | ");

    const mpResponse = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        type: "online",
        processing_mode: "manual",
        capture_mode: "automatic_async",
        total_amount: money(expectedTotal),
        external_reference: orderRef,
        description,
        payer: {
          email: String(customer.email).trim(),
          first_name: String(customer.name).trim().split(" ")[0],
        },
        items: [{
          title: "Combo Nutrifit " + line + " " + weight,
          description: String(selectedItems || "Combo Nutrifit"),
          quantity: 1,
          unit_price: money(expectedTotal),
          unit_measure: "unit",
          total_amount: money(expectedTotal),
        }],
        config: {
          online: {
            success_url: siteUrl + "/pedido/sucesso?ref=" + encodeURIComponent(orderRef),
            failure_url: siteUrl + "/pedido/falha?ref=" + encodeURIComponent(orderRef),
            pending_url: siteUrl + "/pedido/pendente?ref=" + encodeURIComponent(orderRef),
            auto_return: "approved",
          },
        },
      }),
    });

    const data = await mpResponse.json();
    if (!mpResponse.ok || !data.checkout_url) {
      console.error("Mercado Pago create order error:", data);
      return NextResponse.json({ error: "O Mercado Pago não conseguiu criar o pagamento. Tente novamente." }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl: data.checkout_url, orderId: data.id, reference: orderRef });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Erro ao preparar o pagamento." }, { status: 500 });
  }
}
