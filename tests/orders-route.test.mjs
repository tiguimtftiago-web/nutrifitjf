import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/orders/route.ts";

const validOrder = {
  customer_name: "Cliente de teste",
  whatsapp: "32999998888",
  items: [{ name: "Marmita Fit de teste", line: "FIT", weight: "350 g", quantity: 2, unit_price: 19.9, total: 39.8 }],
  item_count: 2,
  subtotal: 39.8,
  discount: 0,
  delivery_fee: 5,
  total: 44.8,
  cep: "36000000",
  neighborhood: "Centro",
};

test("rejects invalid JSON without contacting Supabase", async () => {
  const response = await POST(new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: "{not-json",
  }));
  assert.equal(response.status, 400);
});

test("rejects a malformed body without contacting Supabase", async () => {
  const response = await POST(new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify(null),
  }));
  assert.equal(response.status, 400);
});

test("rejects mismatched totals before database access", async () => {
  const response = await POST(new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify({ ...validOrder, total: 1 }),
  }));
  assert.equal(response.status, 400);
});

test("rejects unexpected browser origins", async () => {
  const response = await POST(new Request("https://preview.example/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://attacker.example" },
    body: JSON.stringify(validOrder),
  }));
  assert.equal(response.status, 403);
});

test("fails closed when server credential is absent and does not write to Supabase", async () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const oldOrigins = process.env.ORDER_ALLOWED_ORIGINS;
  const oldFetch = globalThis.fetch;
  let fetchCalled = false;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.ORDER_ALLOWED_ORIGINS = "http://localhost:3000";
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("Fetch should not run without server credential");
  };
  try {
    const response = await POST(new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify(validOrder),
    }));
    assert.equal(response.status, 503);
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
    if (oldOrigins === undefined) delete process.env.ORDER_ALLOWED_ORIGINS; else process.env.ORDER_ALLOWED_ORIGINS = oldOrigins;
  }
});
