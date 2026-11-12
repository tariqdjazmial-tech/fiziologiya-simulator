// Създава Stripe Checkout сесия за еднократната покупка на пълния достъп (20 €).
// Сървира се на /.netlify/functions/checkout. Променливи: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY.
import { sbUser, sbFull, json } from "../lib/sb.mts"

async function handle(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "method" })
  const SK = Netlify.env.get("STRIPE_SECRET_KEY")
  if (!SK) return json(500, { error: "config" })
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
  const user = await sbUser(tok)
  if (!user) return json(401, { error: "auth" })
  if (await sbFull(tok, user.id)) return json(409, { error: "already" })
  const body = await req.json().catch(() => ({} as any))
  const en = body.lang === "en"
  const site = (Netlify.env.get("URL") || new URL(req.url).origin).replace(/\/$/, "")
  const price = parseInt(Netlify.env.get("PRICE_CENTS") || "2000", 10)
  const f = new URLSearchParams()
  f.append("mode", "payment")
  f.append("managed_payments[enabled]", "true")
  f.append("line_items[0][quantity]", "1")
  f.append("line_items[0][price_data][currency]", "eur")
  f.append("line_items[0][price_data][unit_amount]", String(price))
  f.append("line_items[0][price_data][tax_behavior]", "exclusive")
  f.append("line_items[0][price_data][product_data][name]", en ? "Physiology simulator — full access" : "Физиология — симулатор: пълен достъп")
  f.append("line_items[0][price_data][product_data][tax_code]", "txcd_10701411")
  f.append("line_items[0][price_data][product_data][description]", en ? "One-time purchase, sections II–XII" : "Еднократна покупка, раздели II–XII")
  f.append("client_reference_id", user.id)
  f.append("customer_email", user.email)
  f.append("metadata[user_id]", user.id)
  f.append("payment_intent_data[metadata][user_id]", user.id)
  f.append("success_url", `${site}/?paid=1#me`)
  f.append("cancel_url", `${site}/#me`)
  f.append("locale", en ? "en" : "bg")
  // при Managed Payments Stripe е продавач и сам показва условията и правото на отказ
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${SK}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: f.toString(),
  })
  const s = await r.json()
  if (!r.ok) return json(502, { error: s?.error?.message || "stripe" })
  return json(200, { url: s.url })
}

export default async (req: Request) => {
  try { return await handle(req) }
  catch (e: any) { console.error("fn error:", e?.stack || e); return json(500, { error: "server", detail: String(e?.message || e) }) }
}
