export type Theme = 'Minimal' | 'Vacation' | 'Birthday' | 'Goal' | 'Project Launch' | 'Celebration'
export type EventType = 'Vacation' | 'Birthday' | 'Goal Start' | 'Goal Finish' | 'Project Launch' | 'Custom'
export type PaletteName = 'sage' | 'ocean' | 'plum' | 'sunset' | 'rose' | 'graphite' | 'custom'
export type PaletteMode = 'light' | 'dark'
export type ColorTokens = { page: string; card: string; raised: string; text: string; muted: string; border: string; accent: string; onAccent: string; accentText: string; accentSoft: string; positive: string; warning: string; danger: string; warm: string }
export type CustomPalettes = Record<PaletteMode, ColorTokens>
export const DEFAULT_CUSTOM_PALETTES: CustomPalettes = {
  light: { page:'#f5f5f3',card:'#ffffff',raised:'#f0f0ed',text:'#282923',muted:'#696b63',border:'#e3e4de',accent:'#667153',onAccent:'#ffffff',accentText:'#58634c',accentSoft:'#edf0e9',positive:'#377b58',warning:'#9a6514',danger:'#bb514c',warm:'#f1e8dc' },
  dark: { page:'#171916',card:'#20231f',raised:'#2a2d28',text:'#f0f0e9',muted:'#a8aba0',border:'#383d35',accent:'#a7b19a',onAccent:'#171916',accentText:'#d5ddcb',accentSoft:'#30382d',positive:'#85c59b',warning:'#f0c274',danger:'#ff8e84',warm:'#403528' },
}
export const COLOR_PRESETS: Record<Exclude<PaletteName, 'custom'>, CustomPalettes> = {
  sage: DEFAULT_CUSTOM_PALETTES,
  ocean: { light:{page:'#f1f7fa',card:'#ffffff',raised:'#e5f0f5',text:'#173244',muted:'#567080',border:'#d1e1e9',accent:'#167e9c',onAccent:'#ffffff',accentText:'#11647c',accentSoft:'#dceff4',positive:'#287552',warning:'#95620f',danger:'#b44750',warm:'#f6e8d8'}, dark:{page:'#101b22',card:'#182832',raised:'#223743',text:'#edf6f8',muted:'#a4bac4',border:'#304753',accent:'#66c1d6',onAccent:'#10232b',accentText:'#8bd9e8',accentSoft:'#213f49',positive:'#8bd1a7',warning:'#f0c274',danger:'#ff9294',warm:'#3d3028'} },
  plum: { light:{page:'#f7f3fa',card:'#ffffff',raised:'#eee7f4',text:'#30223d',muted:'#766780',border:'#e1d6e9',accent:'#8051a1',onAccent:'#ffffff',accentText:'#693c87',accentSoft:'#efe4f6',positive:'#397454',warning:'#986214',danger:'#b64e66',warm:'#f6e7ed'}, dark:{page:'#1c1721',card:'#28212f',raised:'#352b3e',text:'#f7effb',muted:'#c0b1c9',border:'#44384e',accent:'#c19bdd',onAccent:'#24182d',accentText:'#dfc4f2',accentSoft:'#3a2c45',positive:'#91cba5',warning:'#f1c47a',danger:'#ff9eae',warm:'#44303e'} },
  sunset: { light:{page:'#fbf4ef',card:'#ffffff',raised:'#f5e9df',text:'#3c2b25',muted:'#80685d',border:'#ead8ca',accent:'#aa4c30',onAccent:'#ffffff',accentText:'#923e28',accentSoft:'#fbe6da',positive:'#42774f',warning:'#99600f',danger:'#ad3f49',warm:'#f6dfc9'}, dark:{page:'#211916',card:'#30231e',raised:'#40302a',text:'#fff2e8',muted:'#c9aa99',border:'#513d34',accent:'#f08c62',onAccent:'#32190e',accentText:'#ffb595',accentSoft:'#4a2f25',positive:'#9acb91',warning:'#f4c16c',danger:'#ff9288',warm:'#543a2c'} },
  rose: { light:{page:'#fbf3f5',card:'#ffffff',raised:'#f4e7eb',text:'#39252c',muted:'#806a71',border:'#ead8df',accent:'#b34f72',onAccent:'#ffffff',accentText:'#943b5d',accentSoft:'#f8e3eb',positive:'#34724f',warning:'#95600f',danger:'#b43f50',warm:'#f6e5d8'}, dark:{page:'#21181c',card:'#302329',raised:'#403038',text:'#fff1f4',muted:'#c9abb5',border:'#523943',accent:'#e08bab',onAccent:'#321925',accentText:'#f2abc2',accentSoft:'#482b38',positive:'#91cba0',warning:'#f0c477',danger:'#ff9aa6',warm:'#4b302c'} },
  graphite: { light:{page:'#f2f3f4',card:'#ffffff',raised:'#e8eaec',text:'#22262b',muted:'#656d75',border:'#d9dde1',accent:'#495766',onAccent:'#ffffff',accentText:'#37434f',accentSoft:'#e2e8ed',positive:'#347653',warning:'#8d6119',danger:'#b44747',warm:'#eee7dc'}, dark:{page:'#15181b',card:'#202428',raised:'#2a3035',text:'#f1f3f4',muted:'#aab1b6',border:'#3b4349',accent:'#a7bac8',onAccent:'#1a242b',accentText:'#c7d6df',accentSoft:'#303b43',positive:'#8ac49e',warning:'#e7bf75',danger:'#f08b86',warm:'#3b342a'} },
}
export const COLOR_TOKEN_LABELS: Record<keyof ColorTokens,string> = { page:'Page background',card:'Cards',raised:'Raised cards and input fields',text:'Main text',muted:'Secondary text',border:'Borders and dividers',accent:'Primary buttons and highlights',onAccent:'Text on primary buttons',accentText:'Links and accent text',accentSoft:'Soft accent backgrounds',positive:'Success states',warning:'Warnings',danger:'Errors and delete actions',warm:'Warm highlights' }
export function contrastRatio(foreground: string, background: string) {
  const luminance = (hex:string) => { const rgb=hex.slice(1).match(/.{2}/g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4); return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2] }
  const values=[luminance(foreground),luminance(background)].sort((a,b)=>b-a)
  return (values[0]+.05)/(values[1]+.05)
}
export type Countdown = {
  id: string; title: string; subtitle: string; eventType: EventType; target: string; timezone: string; theme: Theme
  reference: string; completion: 'complete' | 'since'; celebration: 'none' | 'subtle' | 'celebrate' | 'party'; sound: boolean; image?: string
}
export type DeskData = { version: 1; events: Countdown[]; primaryId: string | null; note: string; checklist: { id: string; text: string; done: boolean }[]; appearance: 'light' | 'dark' | 'system'; sound: boolean; palette: PaletteName; customPalettes: CustomPalettes }
export const freshData = (): DeskData => ({ version: 1, events: [], primaryId: null, note: '', checklist: [], appearance: 'system', sound: false, palette: 'sage', customPalettes: structuredClone(DEFAULT_CUSTOM_PALETTES) })
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
    const paletteNames = ['sage','ocean','plum','sunset','rose','graphite','custom']
    const palette = paletteNames.includes(parsed.palette as string) ? parsed.palette as PaletteName : 'sage'
    const readTokens = (rawTokens: unknown, fallback: ColorTokens): ColorTokens => {
      const value = rawTokens && typeof rawTokens === 'object' ? rawTokens as Record<string, unknown> : {}
      return Object.fromEntries(Object.keys(fallback).map(key => [key, typeof value[key] === 'string' && /^#[\da-f]{6}$/i.test(value[key] as string) ? value[key] : fallback[key as keyof ColorTokens]])) as ColorTokens
    }
    const rawPalettes = parsed.customPalettes && typeof parsed.customPalettes === 'object' ? parsed.customPalettes as Partial<CustomPalettes> : {}
    const customPalettes: CustomPalettes = { light: readTokens(rawPalettes.light, DEFAULT_CUSTOM_PALETTES.light), dark: readTokens(rawPalettes.dark, DEFAULT_CUSTOM_PALETTES.dark) }
    return { version: 1, events, primaryId: typeof parsed.primaryId === 'string' && events.some(event => event.id === parsed.primaryId) ? parsed.primaryId : events[0]?.id ?? null, note: typeof parsed.note === 'string' ? parsed.note.slice(0,100_000) : '', checklist, appearance, sound: Boolean(parsed.sound), palette, customPalettes }
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
