import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

async function triggerResend(event: string, email: string, payload: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email automation is not configured.");

  const response = await fetch("https://api.resend.com/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event, email, payload }),
  });

  const data = await response.text();
  if (!response.ok) {
    console.error("Resend automation event error", response.status, data);
    throw new Error("Could not trigger automation.");
  }
}

async function isValidAdminToken(token: string) {
  if (!token) return false;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = String(body?.event || "club.member_joined");
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
    }

    if (event === "club.member_joined") {
      const firstName = String(body?.firstName || "").trim();
      const whatsapp = String(body?.whatsapp || "").replace(/\D/g, "");
      const clubMember = body?.clubMember === true;
      const marketingConsent = body?.marketingConsent === true;

      if (!firstName || !clubMember || !marketingConsent) {
        return NextResponse.json({ ok: true, skipped: true });
      }

      const profileResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/customer_profiles?select=id&email=eq.${encodeURIComponent(email)}&nutrifit_club_member=eq.true&marketing_consent=eq.true&limit=1`,
        { headers: { apikey: SUPABASE_KEY } },
      );
      const profiles = await profileResponse.json();
      if (!profileResponse.ok || !Array.isArray(profiles) || !profiles.length) {
        return NextResponse.json({ ok: true, skipped: true });
      }

      await triggerResend(event, email, { firstName, whatsapp, marketingConsent });
      return NextResponse.json({ ok: true, triggered: true });
    }

    if (event === "order.purchased") {
      const auth = request.headers.get("authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (!(await isValidAdminToken(token))) {
        return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
      }

      const firstName = String(body?.firstName || "").trim();
      await triggerResend(event, email, { firstName, orderId: body?.orderId || null });
      return NextResponse.json({ ok: true, triggered: true });
    }

    return NextResponse.json({ ok: false, error: "Unsupported event." }, { status: 400 });
  } catch (error) {
    console.error("Club Nutrifit automation route error", error);
    return NextResponse.json({ ok: false, error: "Could not process automation event." }, { status: 500 });
  }
}
