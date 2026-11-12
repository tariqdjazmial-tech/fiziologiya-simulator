// Общи помощни функции за сървърните функции в Cloudflare Pages (не е самостоятелен маршрут).
// Адресът и публичният ключ на Supabase са публични (същите са и в js/config.js).
export const SB_URL = "https://rcpszdbayyjthrgineon.supabase.co"
export const SB_ANON = "sb_publishable_m0UNcJ07T_CiclmfEJ8Epg_E1LGHJV8"
export const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } })
const sbu = env => (env.SUPABASE_URL || SB_URL), sba = env => (env.SUPABASE_ANON_KEY || SB_ANON)
// потребителят по неговия токен от Supabase (null, ако токенът е невалиден)
export async function sbUser(env, tok) {
  if (!tok) return null
  const r = await fetch(`${sbu(env)}/auth/v1/user`, { headers: { apikey: sba(env), Authorization: `Bearer ${tok}` } })
  if (!r.ok) return null
  const u = await r.json()
  return u && u.id ? { id: u.id, email: u.email } : null
}
// дали профилът вече има пълен достъп (чете се със самия потребителски токен през RLS)
export async function sbFull(env, tok, id) {
  const r = await fetch(`${sbu(env)}/rest/v1/profiles?id=eq.${id}&select=full_access`, { headers: { apikey: sba(env), Authorization: `Bearer ${tok}` } })
  if (!r.ok) return false
  const p = await r.json()
  return !!(p[0] && p[0].full_access)
}
export const bearer = req => (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
export { sbu, sba }
