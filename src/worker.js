// Входна точка за Cloudflare Workers: /api/* са функциите за плащане, всичко друго е статичният сайт от папка site/.
import { onRequestPost as checkout } from "../functions/api/checkout.js"
import { onRequestPost as confirm } from "../functions/api/confirm.js"
import { json } from "../lib/sb.js"

const API = { "/api/checkout": checkout, "/api/confirm": confirm }

// мобилното приложение (Capacitor) вика /api/* от собствен адрес, затова му разрешаваме CORS
const APP_ORIGINS = ["https://localhost", "capacitor://localhost"]
function cors(request, res) {
  const o = request.headers.get("Origin")
  if (!APP_ORIGINS.includes(o)) return res
  const r = new Response(res.body, res)
  r.headers.set("Access-Control-Allow-Origin", o)
  r.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type")
  r.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  r.headers.set("Access-Control-Max-Age", "86400")
  r.headers.append("Vary", "Origin")
  return r
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const fn = API[url.pathname]
    if (fn) {
      if (request.method === "OPTIONS") return cors(request, new Response(null, { status: 204 }))
      if (request.method !== "POST") return json(405, { error: "method" })
      return cors(request, await fn({ request, env, ctx }))
    }
    // проверка на настройките: показва само дали ключовете ги има, никога самите стойности
    if (url.pathname === "/api/health") {
      const sk = env.STRIPE_SECRET_KEY || ""
      return json(200, {
        STRIPE_SECRET_KEY: sk ? (sk.startsWith("sk_live_") ? "ok (live)" : sk.startsWith("sk_test_") ? "ok (test)" : "wrong type: " + sk.slice(0, 3) + "…") : "missing",
        PAYMENT_SECRET: env.PAYMENT_SECRET ? "ok" : "missing",
      })
    }
    if (url.pathname.startsWith("/api/")) return json(404, { error: "not_found" })
    return env.ASSETS.fetch(request)
  },
}
