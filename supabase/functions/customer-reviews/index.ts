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
      .order("created_at", { ascending: false });
    if (error) return reply({ error: "Não foi possível carregar as avaliações." }, 500);
    const all = data ?? [];
    const average = all.length ? all.reduce((sum, item) => sum + Number(item.overall_rating), 0) / all.length : null;
    return reply({
      count: all.length,
      average: average === null ? null : Number(average.toFixed(1)),
      reviews: all.slice(0, 8).map(item => ({
        id: item.id, customer: item.name_consent ? item.customer_name : "Cliente Nutrifit",
        rating: Number(item.overall_rating), comment: item.comment, created_at: item.created_at,
      })),
    });
  }
  if (req.method !== "POST") return reply({ error: "Método não permitido." }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
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

  const { error } = await db.from("customer_reviews").insert({
    order_id: verifiedOrder?.id ?? null, customer_name: customerName,
    purchase_verified: Boolean(verifiedOrder),
    food_quality: body.food_quality, ingredient_quality: body.ingredient_quality,
    portion_size: body.portion_size, service: body.service, delivery: body.delivery,
    recommend: body.recommend,
    comment: typeof body.comment === "string" ? body.comment.trim().slice(0, 1200) || null : null,
    publish_consent: body.publish_consent === true,
    name_consent: body.name_consent === true && body.publish_consent === true,
    status: "pending",
  });
  if (error?.code === "23505") return reply({ error: "Este pedido já possui uma avaliação registrada. Obrigado!" }, 409);
  if (error) return reply({ error: "Não foi possível registrar sua avaliação." }, 500);
  return reply({ success: true, message: "Avaliação recebida. Obrigado por ajudar a Nutrifit a melhorar!" }, 201);
});