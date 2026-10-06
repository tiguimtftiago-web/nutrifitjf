import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const firstName = String(body?.firstName || "").trim();
    const whatsapp = String(body?.whatsapp || "").replace(/\D/g, "");
    const clubMember = body?.clubMember === true;
    const marketingConsent = body?.marketingConsent === true;

    if (!email || !email.includes("@") || !firstName || !clubMember || !marketingConsent) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: "Email automation is not configured." }, { status: 500 });

    const response = await fetch("https://api.resend.com/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "club.member_joined",
        email,
        payload: {
          firstName,
          whatsapp,
          marketingConsent,
        },
      }),
    });

    const data = await response.text();
    if (!response.ok) {
      console.error("Club Nutrifit event error", response.status, data);
      return NextResponse.json({ ok: false, error: "Could not trigger Club automation." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, triggered: true });
  } catch (error) {
    console.error("Club Nutrifit automation route error", error);
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
