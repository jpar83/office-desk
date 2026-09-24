export type Theme = 'Minimal' | 'Vacation' | 'Birthday' | 'Goal' | 'Project Launch' | 'Celebration'
export type EventType = 'Vacation' | 'Birthday' | 'Goal Start' | 'Goal Finish' | 'Project Launch' | 'Custom'
export type Countdown = {
  id: string; title: string; subtitle: string; eventType: EventType; target: string; timezone: string; theme: Theme
  reference: string; completion: 'complete' | 'since'; celebration: 'none' | 'subtle' | 'celebrate' | 'party'; sound: boolean; image?: string
}
export type DeskData = { version: 1; events: Countdown[]; primaryId: string | null; note: string; checklist: { id: string; text: string; done: boolean }[]; appearance: 'light' | 'dark' | 'system'; sound: boolean }
export const freshData = (): DeskData => ({ version: 1, events: [], primaryId: null, note: '', checklist: [], appearance: 'system', sound: false })
export const STORAGE_KEY = 'officeDesk.v1'
export function readData(): DeskData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshData()
    const parsed = JSON.parse(raw) as Partial<DeskData>
    if (parsed.version !== 1 || !Array.isArray(parsed.events)) return freshData()
    const themes: Theme[] = ['Minimal', 'Vacation', 'Birthday', 'Goal', 'Project Launch', 'Celebration']
    const events = (parsed.events as unknown[]).flatMap(rawEvent => {
      if (!rawEvent || typeof rawEvent !== 'object') return []
      const event = rawEvent as Partial<Countdown>
      if (typeof event.id !== 'string' || !event.id || typeof event.title !== 'string' || !event.title || typeof event.target !== 'string' || !Number.isFinite(Date.parse(event.target))) return []
      return [{
        id: event.id.slice(0, 80), title: event.title.slice(0, 120), subtitle: typeof event.subtitle === 'string' ? event.subtitle.slice(0, 180) : '',
        eventType: ['Vacation','Birthday','Goal Start','Goal Finish','Project Launch','Custom'].includes(event.eventType as string) ? event.eventType as EventType : 'Custom',
        target: event.target, timezone: typeof event.timezone === 'string' ? event.timezone.slice(0, 100) : 'Local time',
        theme: themes.includes(event.theme as Theme) ? event.theme as Theme : 'Minimal', reference: typeof event.reference === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.reference) ? event.reference : new Date().toISOString().slice(0, 10),
        completion: event.completion === 'since' ? 'since' as const : 'complete' as const,
        celebration: ['none','subtle','celebrate','party'].includes(event.celebration as string) ? event.celebration as Countdown['celebration'] : 'none',
        sound: Boolean(event.sound), image: typeof event.image === 'string' && event.image.startsWith('data:image/') && event.image.length <= 1_500_000 ? event.image : undefined,
      }]
    })
    const checklist = Array.isArray(parsed.checklist) ? parsed.checklist.flatMap(item => item && typeof item.id === 'string' && typeof item.text === 'string' ? [{ id: item.id.slice(0,80), text: item.text.slice(0,500), done: Boolean(item.done) }] : []) : []
    const appearance = ['light','dark','system'].includes(parsed.appearance as string) ? parsed.appearance as DeskData['appearance'] : 'system'
    return { version: 1, events, primaryId: typeof parsed.primaryId === 'string' && events.some(event => event.id === parsed.primaryId) ? parsed.primaryId : events[0]?.id ?? null, note: typeof parsed.note === 'string' ? parsed.note.slice(0,100_000) : '', checklist, appearance, sound: Boolean(parsed.sound) }
  } catch { return freshData() }
}
export const saveData = (data: DeskData) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true } catch { return false } }

export function countdownParts(targetMs: number, nowMs = Date.now()) {
  const delta = targetMs - nowMs
  const total = Math.floor(Math.abs(delta) / 1000)
  return { expired: delta <= 0, days: Math.floor(total / 86400), hours: Math.floor(total % 86400 / 3600), minutes: Math.floor(total % 3600 / 60), seconds: total % 60 }
}
export function encodeShare(event: Countdown) {
  const safe = { title: event.title, subtitle: event.subtitle, target: event.target, timezone: event.timezone, eventType: event.eventType, theme: event.theme, reference: event.reference, completion: event.completion, celebration: event.celebration, sound: event.sound }
  return btoa(unescape(encodeURIComponent(JSON.stringify(safe)))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
export function decodeShare(input: string): Omit<Countdown, 'id'> | null {
  try {
    if (input.length > 24_000) return null
    const normalized = input.replaceAll('-', '+').replaceAll('_', '/')
    const parsed = JSON.parse(decodeURIComponent(escape(atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))))) as Partial<Countdown>
    if (typeof parsed.title !== 'string' || parsed.title.length > 120 || !parsed.target || !Number.isFinite(Date.parse(parsed.target)) || typeof parsed.timezone !== 'string') return null
    const themes: Theme[] = ['Minimal', 'Vacation', 'Birthday', 'Goal', 'Project Launch', 'Celebration']
    const types: EventType[] = ['Vacation', 'Birthday', 'Goal Start', 'Goal Finish', 'Project Launch', 'Custom']
    const celebrations: Countdown['celebration'][] = ['none', 'subtle', 'celebrate', 'party']
    return { title: parsed.title, subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle.slice(0, 180) : '', target: parsed.target, timezone: parsed.timezone, eventType: types.includes(parsed.eventType as EventType) ? parsed.eventType as EventType : 'Custom', theme: themes.includes(parsed.theme as Theme) ? parsed.theme as Theme : 'Minimal', reference: typeof parsed.reference === 'string' ? parsed.reference : new Date().toISOString().slice(0, 10), completion: parsed.completion === 'since' ? 'since' : 'complete', celebration: celebrations.includes(parsed.celebration as Countdown['celebration']) ? parsed.celebration as Countdown['celebration'] : 'none', sound: Boolean(parsed.sound) }
  } catch { return null }
}
export function businessDaysBetween(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`); const b = new Date(`${end}T12:00:00`)
  if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime())) return 0
  const dir = a <= b ? 1 : -1; let count = 0
  for (const date = new Date(a); date.getTime() !== b.getTime();) { date.setDate(date.getDate() + dir); if (date.getDay() !== 0 && date.getDay() !== 6) count += dir }
  return count
}
export function addBusinessDays(start: string, amount: number) {
  const date = new Date(`${start}T12:00:00`); const dir = Math.sign(amount); let left = Math.abs(Math.trunc(amount))
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(amount)) return start
  while (left) { date.setDate(date.getDate() + dir); if (date.getDay() !== 0 && date.getDay() !== 6) left-- }
  return date.toISOString().slice(0, 10)
}
export function agendaIndexAtElapsed(segments: { minutes: number }[], elapsedMs: number) {
  if (elapsedMs <= 0) return 0
  const index = segments.findIndex((_, i) => elapsedMs < segments.slice(0, i + 1).reduce((sum, segment) => sum + segment.minutes * 60000, 0))
  return index < 0 && segments.length ? segments.length : Math.max(0, index)
}
const finite = (...values: number[]) => values.every(Number.isFinite)
export function percentOf(percent: number, total: number) { return finite(percent,total) ? percent * total / 100 : null }
export function percentChange(start: number, end: number) { return finite(start,end) && start !== 0 ? (end-start)/Math.abs(start)*100 : null }
export function variancePercent(actual: number, plan: number) { return finite(actual,plan) && plan !== 0 ? (actual-plan)/Math.abs(plan)*100 : null }
export function marginPercent(price: number, cost: number) { return finite(price,cost) && price !== 0 ? (price-cost)/price*100 : null }
export function markupPercent(price: number, cost: number) { return finite(price,cost) && cost !== 0 ? (price-cost)/cost*100 : null }
export function textTransform(value: string, action: string): string {
  const lines = value.split(/\r?\n/)
  switch (action) {
    case 'Trim': return value.trim()
    case 'Collapse spaces': return value.replace(/[ \t]{2,}/g, ' ')
    case 'Remove blank lines': return lines.filter(line => line.trim()).join('\n')
    case 'Remove duplicate lines': return [...new Set(lines)].join('\n')
    case 'Sort A–Z': return [...lines].sort((a, b) => a.localeCompare(b)).join('\n')
    case 'Sort Z–A': return [...lines].sort((a, b) => b.localeCompare(a)).join('\n')
    case 'UPPERCASE': return value.toUpperCase()
    case 'lowercase': return value.toLowerCase()
    case 'Title case': return value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    case 'Sentence case': return value.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, gap: string, c: string) => gap + c.toUpperCase())
    case 'Add bullets': return lines.map(line => line ? `• ${line}` : line).join('\n')
    case 'Remove bullets': return lines.map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '')).join('\n')
    case 'Add line numbers': return lines.map((line, i) => `${i + 1}. ${line}`).join('\n')
    case 'Remove line numbers': return lines.map(line => line.replace(/^\s*\d+[.)]\s*/, '')).join('\n')
    case 'CSV to lines': return value.split(',').map(v => v.trim()).join('\n')
    case 'Lines to CSV': return lines.map(v => v.trim()).filter(Boolean).join(', ')
    default: return value
  }
}
