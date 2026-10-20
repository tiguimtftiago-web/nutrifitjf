import { redirect } from "next/navigation";

// This legacy storefront had a separate, incomplete checkout that bypassed
// the order-registration flow. Keep one authoritative catalog and checkout.
export default function NutrifitLegacyPage(): never {
  redirect("/#cardapio");
}
