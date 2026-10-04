import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ALLOWED_ORIGINS = new Set([
  "https://nutrifitjf.com.br",
  "https://www.nutrifitjf.com.br",
  "https://nutrifitjf.vercel.app",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://nutrifitjf.com.br";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(req ? corsHeaders(req) : {}),
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(req) });
  }

  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405, req);

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return json({ error: "Não autenticado." }, 401, req);

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Sessão inválida." }, 401, req);

  const email = (userData.user.email ?? "").trim().toLowerCase();
  const allowed = new Set(["nutrifit.cozinhajf@gmail.com", "tiguimtftiago@gmail.com"]);
  if (!allowed.has(email)) return json({ error: "Acesso restrito ao administrador." }, 403, req);

  const { data: config, error: configError } = await supabase
    .from("admin_push_config")
    .select("vapid_public_key,vapid_private_key")
    .eq("id", 1)
    .single();

  if (configError || !config?.vapid_public_key || !config?.vapid_private_key) {
    return json({ error: "Configuração de notificações indisponível." }, 500, req);
  }

  webpush.setVapidDetails(
    "mailto:nutrifit.cozinhajf@gmail.com",
    config.vapid_public_key,
    config.vapid_private_key,
  );

  const { data: subscriptions, error: subError } = await supabase
    .from("admin_push_subscriptions")
    .select("id,endpoint,p256dh,auth,active")
    .eq("active", true);

  if (subError) return json({ error: "Não foi possível consultar os dispositivos." }, 500, req);

  const payload = JSON.stringify({
    title: "NUTRIFIT • TESTE DE NOTIFICAÇÃO",
    body: "Teste enviado pelo painel administrativo. As notificações estão funcionando.",
    tag: "nutrifit-admin-test",
    url: "/admin",
  });

  let sent = 0;
  let removed = 0;

  for (const sub of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      );
      sent++;
    } catch (error: any) {
      const status = error?.statusCode;
      if (status === 401 || status === 403 || status === 404 || status === 410) {
        await supabase.from("admin_push_subscriptions").update({ active: false }).eq("id", sub.id);
        removed++;
      } else {
        console.error("admin push test failed", sub.id, error?.message ?? error);
      }
    }
  }

  return json({ ok: true, sent, removed, active_subscriptions: subscriptions?.length ?? 0 }, 200, req);
});
