// Проверява в Stripe дали влезлият потребител е платил и отключва профила му.
// Вика се от сайта след връщане от плащането. Сървира се на /.netlify/functions/confirm.
// Променливи: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, PAYMENT_SECRET.
import { sbUser, sbFull, json } from "../lib/sb.mts"

async function handle(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "method" })
  const SK = Netlify.env.get("STRIPE_SECRET_KEY"), SB = Netlify.env.get("SUPABASE_URL"), ANON = Netlify.env.get("SUPABASE_ANON_KEY"), PS = Netlify.env.get("PAYMENT_SECRET")
  if (!SK || !SB || !ANON || !PS) return json(500, { error: "config" })
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
  const user = await sbUser(tok)
  if (!user) return json(401, { error: "auth" })
  if (await sbFull(tok, user.id)) return json(200, { full: true })
  // последните сесии с имейла на потребителя; приемаме само платена сесия, създадена за същия профил
  const q = new URLSearchParams({ limit: "20", "customer_details[email]": user.email })
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions?${q}`, { headers: { Authorization: `Bearer ${SK}` } })
  const list = await r.json()
  if (!r.ok) return json(502, { error: list?.error?.message || "stripe" })
  const s = (list.data || []).find((x: any) => x.client_reference_id === user.id && x.status === "complete" && x.payment_status === "paid")
  if (!s) return json(200, { full: false })
  const rp = await fetch(`${SB}/rest/v1/rpc/record_purchase`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: PS, p_user: user.id, p_session: s.id, p_amount: s.amount_total, p_currency: s.currency, p_email: s.customer_details?.email || user.email }),
  })
  const res = await rp.json().catch(() => null)
  if (!rp.ok || res !== "ok") return json(500, { error: "db" })
  return json(200, { full: true })
}

export default async (req: Request) => {
  try { return await handle(req) }
  catch (e: any) { console.error("fn error:", e?.stack || e); return json(500, { error: "server", detail: String(e?.message || e) }) }
}
