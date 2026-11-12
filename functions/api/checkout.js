// Създава Stripe Checkout сесия за еднократната покупка на пълния достъп.
// Маршрут: POST /api/checkout. Тайна в Cloudflare: STRIPE_SECRET_KEY.
import { sbUser, sbFull, json, bearer } from "../../lib/sb.js"

async function handle({ request: req, env }) {
  const SK = env.STRIPE_SECRET_KEY
  if (!SK) return json(500, { error: "config" })
  const tok = bearer(req)
  const user = await sbUser(env, tok)
  if (!user) return json(401, { error: "auth" })
  if (await sbFull(env, tok, user.id)) return json(409, { error: "already" })
  const body = await req.json().catch(() => ({}))
  const en = body.lang === "en"
  const site = (env.SITE_URL || new URL(req.url).origin).replace(/\/$/, "")
  const price = parseInt(env.PRICE_CENTS || "2000", 10)
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
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${SK}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: f.toString(),
  })
  const s = await r.json()
  if (!r.ok) return json(502, { error: (s && s.error && s.error.message) || "stripe" })
  return json(200, { url: s.url })
}

export async function onRequestPost(ctx) {
  try { return await handle(ctx) }
  catch (e) { console.error("fn error:", e && e.stack || e); return json(500, { error: "server", detail: String(e && e.message || e) }) }
}
