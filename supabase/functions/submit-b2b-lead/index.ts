import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://nutrifitjf.com.br",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json",
};
const clean = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = new Set(["https://nutrifitjf.com.br", "https://www.nutrifitjf.com.br"]);
  const headers = { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://nutrifitjf.com.br" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Método não permitido." }), { status: 405, headers });
  if (origin && !allowedOrigins.has(origin)) return new Response(JSON.stringify({ error: "Origem não autorizada." }), { status: 403, headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Serviço indisponível." }), { status: 500, headers });

  let payload: Record<string, unknown>;
  try { payload = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Solicitação inválida." }), { status: 400, headers }); }

  if (clean(payload.website, 200)) return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  const company = clean(payload.company, 180);
  const contactName = clean(payload.contact_name, 160);
  const whatsapp = clean(payload.whatsapp, 40);
  const email = clean(payload.email, 254).toLowerCase();
  const segment = clean(payload.segment, 80);
  const estimatedMeals = clean(payload.estimated_meals, 80);
  const deliveryDays = clean(payload.delivery_days, 100);
  const neighborhood = clean(payload.neighborhood, 120);
  const notes = clean(payload.notes, 2000);
  const submissionId = clean(payload.submission_id, 80);

  if (!company || !contactName || !whatsapp || !email || !segment || !estimatedMeals || !deliveryDays || !neighborhood || payload.data_consent !== true)
    return new Response(JSON.stringify({ error: "Confira os campos obrigatórios e o consentimento." }), { status: 400, headers });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return new Response(JSON.stringify({ error: "Informe um e-mail válido." }), { status: 400, headers });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId))
    return new Response(JSON.stringify({ error: "Identificador de envio inválido." }), { status: 400, headers });

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = req.headers.get("cf-connecting-ip")?.trim() || forwarded || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + ":" + serviceKey));
  const ipHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const rpc = await fetch(supabaseUrl + "/rest/v1/rpc/consume_b2b_form_rate_limit", {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json" },
    body: JSON.stringify({ p_ip_hash: ipHash }),
  });
  if (!rpc.ok) return new Response(JSON.stringify({ error: "Não foi possível validar o envio. Tente novamente." }), { status: 503, headers });
  if (await rpc.json() !== true)
    return new Response(JSON.stringify({ error: "Muitas solicitações em pouco tempo. Aguarde 15 minutos e tente novamente." }), { status: 429, headers });

  const record = { submission_id: submissionId, company, trade_name: company, contact_name: contactName, whatsapp, email, segment, estimated_meals: estimatedMeals, delivery_days: deliveryDays, neighborhood, notes, data_consent: true };
  const insert = await fetch(supabaseUrl + "/rest/v1/b2b_leads", {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(record),
  });
  if (insert.status === 409) {
    const existing = await fetch(supabaseUrl + "/rest/v1/b2b_leads?submission_id=eq." + encodeURIComponent(submissionId) + "&select=id", {
      headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey },
    });
    if (existing.ok && (await existing.json()).length > 0) return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }
  if (!insert.ok) {
    const details = await insert.text();
    console.error("B2B lead insert failed:", insert.status, details.slice(0, 500));
    return new Response(JSON.stringify({ error: "Não foi possível registrar a solicitação." }), { status: 500, headers });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});