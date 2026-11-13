import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});
const validRating = (value: unknown) => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;

async function sendWhatsAppNotification(message: string) {
  const token = Deno.env.get("META_WHATSAPP_ACCESS_TOKEN") ?? "";
  const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID") ?? "";
  const recipient = (Deno.env.get("META_ALERT_TO_PHONE") ?? "5532998030038").replace(/\\D/g, "");
  if (!token || !phoneNumberId || !recipient) return { status: "not_configured" as const, id: null };
  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: { preview_url: false, body: message },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return { status: "sent" as const, id: data?.messages?.[0]?.id ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = Deno.env.get("SUPABASE_URL");
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !secret) return reply({ error: "Serviço indisponível." }, 503);
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

  if (req.method === "GET") {
    const { data, error } = await db.from("customer_reviews")
      .select("id,customer_name,overall_rating,comment,name_consent,created_at")
      .eq("status", "approved").eq("publish_consent", true)
      .order("created_at", { ascending: false }).limit(50);
    if (error) return reply({ error: "Não foi possível carregar as avaliações." }, 500);
    const all = data ?? [];
    const average = all.length ? all.reduce((sum, item) => sum + Number(item.overall_rating), 0) / all.length : null;
    return reply({
      count: all.length,
      average: average === null ? null : Number(average.toFixed(1)),
      reviews: all.map(item => ({
        id: item.id, customer: item.name_consent ? item.customer_name : "Cliente Nutrifit",
        rating: Number(item.overall_rating), comment: item.comment, created_at: item.created_at,
      })),
    });
  }
  if (req.method !== "POST") return reply({ error: "Método não permitido." }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
  if (body.action === "resend_whatsapp") {
    const reviewId = String(body.review_id ?? "").trim();
    const bearer = req.headers.get("authorization") ?? "";
    const jwt = bearer.replace(/^Bearer\\s+/i, "");
    const publicKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    if (!reviewId || !jwt || !publicKey) return reply({ error: "Acesso administrativo necessário." }, 401);
    const authClient = createClient(url, publicKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: isAdmin, error: authError } = await authClient.rpc("is_admin_user");
    if (authError || isAdmin !== true) return reply({ error: "Acesso não autorizado." }, 403);

    const { data: review, error: reviewError } = await db.from("customer_reviews")
      .select("id,customer_name,order_id,food_quality,ingredient_quality,portion_size,service,delivery,recommend,comment,publish_consent,whatsapp_notification_status")
      .eq("id", reviewId).single();
    if (reviewError || !review) return reply({ error: "Avaliação não encontrada." }, 404);
    if (review.whatsapp_notification_status === "sent") return reply({ error: "A notificação desta avaliação já foi enviada." }, 409);

    const average = ([review.food_quality,review.ingredient_quality,review.portion_size,review.service,review.delivery]
      .reduce((sum: number, value: number) => sum + Number(value), 0) / 5).toFixed(1);
    const message = [
      "*NUTRIFIT • AVALIAÇÃO DE CLIENTE*",
      "",
      `Cliente: ${review.customer_name}`,
      `Pedido: ${review.order_id ?? "não vinculado"}`,
      `Média: ${average}/5`,
      `Sabor: ${review.food_quality}/5 | Ingredientes: ${review.ingredient_quality}/5`,
      `Porção: ${review.portion_size}/5 | Atendimento: ${review.service}/5 | Entrega: ${review.delivery}/5`,
      `Recomendaria: ${review.recommend ? "Sim" : "Não"}`,
      `Comentário: ${review.comment || "não informado"}`,
      `Publicação autorizada: ${review.publish_consent ? "Sim" : "Não"}`,
      "",
      "Acesse o painel administrativo > Avaliações para analisar e aprovar.",
    ].join("\\n");
    try {
      const sent = await sendWhatsAppNotification(message);
      const status = sent.status;
      const { error: updateError } = await db.from("customer_reviews").update({
        whatsapp_notification_status: status,
        whatsapp_message_id: sent.id,
        whatsapp_notification_error: null,
        whatsapp_sent_at: status === "sent" ? new Date().toISOString() : null,
      }).eq("id", reviewId);
      if (updateError) return reply({ error: "Mensagem enviada, mas não foi possível atualizar o registro." }, 500);
      return reply({ success: true, notification: status });
    } catch (sendError) {
      const detail = String(sendError instanceof Error ? sendError.message : sendError).slice(0, 1000);
      await db.from("customer_reviews").update({
        whatsapp_notification_status: "failed",
        whatsapp_notification_error: detail,
        whatsapp_sent_at: null,
      }).eq("id", reviewId);
      return reply({ error: "Não foi possível enviar o WhatsApp.", detail }, 502);
    }
  }

  const customerName = String(body.customer_name ?? "").trim().slice(0, 120);
  const orderCode = String(body.order_code ?? "").trim().toUpperCase();
  const keys = ["food_quality", "ingredient_quality", "portion_size", "service", "delivery"] as const;
  if (customerName.length < 2)
    return reply({ error: "Informe seu nome para identificar a avaliação." }, 400);
  if (orderCode && !/^NF-[A-F0-9]{6}$/.test(orderCode))
    return reply({ error: "Confira o código Nutrifit. Exemplo: NF-7K4P9." }, 400);
  if (!keys.every(key => validRating(body[key])))
    return reply({ error: "Marque todas as avaliações de 1 a 5 estrelas." }, 400);
  if (typeof body.recommend !== "boolean")
    return reply({ error: "Responda se recomendaria a Nutrifit." }, 400);

  let verifiedOrder: { id: string; status: string } | null = null;
  if (orderCode) {
    const { data: order, error: lookupError } = await db.from("customer_orders")
      .select("id,status").eq("order_code", orderCode).maybeSingle();
    if (lookupError || !order || order.status !== "entregue")
      return reply({ error: "Não encontramos um pedido entregue com esse código. Você também pode enviar sua avaliação sem ele." }, 403);
    verifiedOrder = order;
  }

  const reviewComment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1200) || null : null;
  const ratings = {
    food_quality: Number(body.food_quality), ingredient_quality: Number(body.ingredient_quality),
    portion_size: Number(body.portion_size), service: Number(body.service), delivery: Number(body.delivery),
  };
  const overall = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / 5;
  const { data: inserted, error } = await db.from("customer_reviews").insert({
    order_id: verifiedOrder?.id ?? null, customer_name: customerName,
    purchase_verified: Boolean(verifiedOrder),
    ...ratings,
    recommend: body.recommend,
    comment: reviewComment,
    publish_consent: body.publish_consent === true,
    name_consent: body.name_consent === true && body.publish_consent === true,
    status: "pending",
    whatsapp_notification_status: "not_sent",
  }).select("id").single();
  if (error?.code === "23505") return reply({ error: "Este pedido já possui uma avaliação registrada. Obrigado!" }, 409);
  if (error || !inserted) return reply({ error: "Não foi possível registrar sua avaliação." }, 500);

  let notificationStatus: "sent" | "failed" | "not_configured" = "not_configured";
  let messageId: string | null = null;
  let notificationError: string | null = null;
  const whatsappMessage = [
    "*NUTRIFIT • NOVA AVALIAÇÃO*",
    "",
    `Cliente: ${customerName}`,
    `Pedido: ${orderCode || "não informado"}`,
    `Média: ${overall.toFixed(1)}/5`,
    `Sabor: ${ratings.food_quality}/5 | Ingredientes: ${ratings.ingredient_quality}/5`,
    `Porção: ${ratings.portion_size}/5 | Atendimento: ${ratings.service}/5 | Entrega: ${ratings.delivery}/5`,
    `Recomendaria: ${body.recommend ? "Sim" : "Não"}`,
    `Comentário: ${reviewComment || "não informado"}`,
    `Publicação autorizada: ${body.publish_consent === true ? "Sim" : "Não"}`,
    "",
    "Acesse o painel administrativo > Avaliações para analisar e aprovar.",
  ].join("\\n");

  try {
    const sent = await sendWhatsAppNotification(whatsappMessage);
    notificationStatus = sent.status;
    messageId = sent.id;
  } catch (sendError) {
    notificationStatus = "failed";
    notificationError = String(sendError instanceof Error ? sendError.message : sendError).slice(0, 1000);
    console.error("customer review WhatsApp notification failed", inserted.id, notificationError);
  }

  const { error: trackingError } = await db.from("customer_reviews").update({
    whatsapp_notification_status: notificationStatus,
    whatsapp_message_id: messageId,
    whatsapp_notification_error: notificationError,
    whatsapp_sent_at: notificationStatus === "sent" ? new Date().toISOString() : null,
  }).eq("id", inserted.id);
  if (trackingError) console.error("customer review notification tracking failed", inserted.id, trackingError);

  return reply({
    success: true,
    notification: notificationStatus,
    message: "Avaliação recebida. Obrigado por ajudar a Nutrifit a melhorar!",
  }, 201);
});