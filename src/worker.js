// Входна точка за Cloudflare Workers: /api/* са функциите за плащане, всичко друго е статичният сайт от папка site/.
import { onRequestPost as checkout } from "../functions/api/checkout.js"
import { onRequestPost as confirm } from "../functions/api/confirm.js"
import { json } from "../lib/sb.js"

const API = { "/api/checkout": checkout, "/api/confirm": confirm }

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const fn = API[url.pathname]
    if (fn) {
      if (request.method !== "POST") return json(405, { error: "method" })
      return fn({ request, env, ctx })
    }
    if (url.pathname.startsWith("/api/")) return json(404, { error: "not_found" })
    return env.ASSETS.fetch(request)
  },
}
