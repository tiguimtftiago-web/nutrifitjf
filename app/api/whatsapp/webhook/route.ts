import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhatsAppTextMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
};

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppTextMessage[];
        metadata?: { phone_number_id?: string };
      };
    }>;
  }>;
};

function verifySignature(rawBody: string, signature: string | null, appSecret: string) {
  if (!signature?.startsWith("sha256=")) return false;

  const receivedHex = signature.slice("sha256=".length);
  const expectedHex = createHmac("sha256", appSecret).update(rawBody).digest("hex");

  if (!/^[a-f0-9]{64}$/i.test(receivedHex)) return false;
  const received = Buffer.from(receivedHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
}

function buildReply(message: string) {
  const normalized = message.trim().toLocaleLowerCase("pt-BR");

  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|menu|início|inicio|começar|comecar)\b/.test(normalized)) {
    return [
      "Olá! 👋 Você está falando com a Nutrifit, marmitas fitness em Juiz de Fora.",
      "",
      "Como posso ajudar?",
      "1️⃣ Ver linhas e preços",
      "2️⃣ Montar um combo",
      "3️⃣ Falar com uma pessoa da equipe",
      "4️⃣ Tirar dúvida sobre entrega",
      "",
      "Digite o número da opção ou escreva o que você procura.",
    ].join("\n");
  }

  if (/^(1|preço|preco|preços|precos|valor|valores|cardápio|cardapio|marmitas)\b/.test(normalized)) {
    return [
      "🍱 *Linhas Nutrifit*",
      "",
      "• Fit — 350 g: R$ 23,97 a unidade",
      "• Combo Fit com 5 marmitas de 350 g: R$ 117,00",
      "• Performance — 450 g: frango R$ 27,90 | bovina R$ 29,90",
      "",
      "Os valores e a disponibilidade podem mudar. Confirme o cardápio atualizado antes de finalizar.",
      "Quer montar um combo ou falar com a equipe?",
      "Digite *2* para combos ou *3* para atendimento humano.",
    ].join("\n");
  }

  if (/^(2|combo|combos|montar|quero comprar|pedido|pedir)\b/.test(normalized)) {
    return [
      "Vamos montar seu pedido! 🍽️",
      "",
      "Qual linha você procura?",
      "• Fit — 350 g",
      "• Performance — 450 g",
      "• Traditional — 500 g",
      "",
      "Responda com o nome da linha e a quantidade de marmitas. A equipe confirma sabores, disponibilidade, preço final e entrega antes de fechar o pedido.",
    ].join("\n");
  }

  if (/^(3|atendente|humano|pessoa|equipe|falar com alguém|falar com alguem)\b/.test(normalized)) {
    return "Claro. Vou encaminhar sua solicitação para a equipe da Nutrifit. Informe, por favor, seu nome e o assunto do atendimento. Não envie dados de pagamento ou senhas por aqui.";
  }

  if (/^(4|entrega|entregas|frete|endereço|endereco|retirada)\b/.test(normalized)) {
    return "A equipe confirma a disponibilidade de entrega, o valor e o prazo de acordo com seu endereço. Para agilizar, informe apenas seu bairro ou CEP; enviaremos os detalhes antes de confirmar o pedido.";
  }

  return [
    "Posso ajudar com o cardápio, combos, entrega ou atendimento.",
    "",
    "Digite *menu* para ver as opções ou *3* para pedir atendimento da equipe Nutrifit.",
  ].join("\n");
}

async function sendWhatsAppText(to: string, body: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp Cloud API credentials are not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    // Do not log the access token, recipient, or message contents.
    throw new Error(`WhatsApp Cloud API returned HTTP ${response.status}`);
  }
}

export async function GET(request: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  // Acknowledge valid webhooks without sending anything until the bot is explicitly enabled.
  if (process.env.WHATSAPP_BOT_ENABLED !== "true") {
    return NextResponse.json({ received: true, botEnabled: false });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const messages = (payload.entry ?? [])
    .flatMap((entry) => entry.changes ?? [])
    .flatMap((change) => change.value?.messages ?? []);

  try {
    for (const message of messages) {
      if (message.type !== "text" || !message.from || !message.text?.body) continue;
      await sendWhatsAppText(message.from, buildReply(message.text.body));
    }
  } catch {
    // Keep webhook responses free of provider details and customer data.
    return NextResponse.json({ error: "Could not process message" }, { status: 502 });
  }

  return NextResponse.json({ received: true });
}
