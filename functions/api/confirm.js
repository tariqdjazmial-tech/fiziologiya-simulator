// Проверява в Stripe дали влезлият потребител е платил и отключва профила му.
// Маршрут: POST /api/confirm. Тайни в Cloudflare: STRIPE_SECRET_KEY, PAYMENT_SECRET.
import { sbUser, sbFull, json, bearer, sbu, sba } from "../../lib/sb.js"

async function handle({ request: req, env }) {
  const SK = env.STRIPE_SECRET_KEY, PS = env.PAYMENT_SECRET
  if (!SK || !PS) return json(500, { error: "config" })
  const tok = bearer(req)
  const user = await sbUser(env, tok)
  if (!user) return json(401, { error: "auth" })
  if (await sbFull(env, tok, user.id)) return json(200, { full: true })
  // последните сесии с имейла на потребителя; приемаме само платена сесия, създадена за същия профил
  const q = new URLSearchParams({ limit: "20", "customer_details[email]": user.email })
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions?${q}`, { headers: { Authorization: `Bearer ${SK}` } })
  const list = await r.json()
  if (!r.ok) return json(502, { error: (list && list.error && list.error.message) || "stripe" })
  const s = (list.data || []).find(x => x.client_reference_id === user.id && x.status === "complete" && x.payment_status === "paid")
  if (!s) return json(200, { full: false })
  const rp = await fetch(`${sbu(env)}/rest/v1/rpc/record_purchase`, {
    method: "POST",
    headers: { apikey: sba(env), "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: PS, p_user: user.id, p_session: s.id, p_amount: s.amount_total, p_currency: s.currency, p_email: (s.customer_details && s.customer_details.email) || user.email }),
  })
  const res = await rp.json().catch(() => null)
  if (!rp.ok || res !== "ok") return json(500, { error: "db" })
  return json(200, { full: true })
}

export async function onRequestPost(ctx) {
  try { return await handle(ctx) }
  catch (e) { console.error("fn error:", e && e.stack || e); return json(500, { error: "server", detail: String(e && e.message || e) }) }
}
