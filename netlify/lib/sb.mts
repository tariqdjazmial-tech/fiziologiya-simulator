// Общи помощни функции за сървърните функции (не е самостоятелна функция).
export const json = (status: number, obj: unknown) => Response.json(obj, { status })
const SB = () => Netlify.env.get("SUPABASE_URL") || ""
const ANON = () => Netlify.env.get("SUPABASE_ANON_KEY") || ""
// потребителят по неговия токен от Supabase (null, ако токенът е невалиден)
export async function sbUser(tok: string): Promise<{ id: string; email: string } | null> {
  if (!tok) return null
  const r = await fetch(`${SB()}/auth/v1/user`, { headers: { apikey: ANON(), Authorization: `Bearer ${tok}` } })
  if (!r.ok) return null
  const u = await r.json()
  return u && u.id ? { id: u.id, email: u.email } : null
}
// дали профилът вече има пълен достъп (чете се със самия потребителски токен през RLS)
export async function sbFull(tok: string, id: string): Promise<boolean> {
  const r = await fetch(`${SB()}/rest/v1/profiles?id=eq.${id}&select=full_access`, { headers: { apikey: ANON(), Authorization: `Bearer ${tok}` } })
  if (!r.ok) return false
  const p = await r.json()
  return !!(p[0] && p[0].full_access)
}
