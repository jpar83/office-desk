import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import QRCode from 'qrcode'
import { addBusinessDays, agendaIndexAtElapsed, businessDaysBetween, countdownParts, decodeShare, encodeShare, marginPercent, markupPercent, percentChange, percentOf, readData, saveData, STORAGE_KEY, textTransform, variancePercent, type Countdown, type DeskData, type EventType, type Theme } from './model'
import './style.css'
import './mobile.css'

const routes = [
  ['Home', '⌂', '#/'], ['Countdowns', '◷', '#/countdown'], ['Timer', '◴', '#/timer'], ['Meeting', '▤', '#/meeting'], ['Focus', '◉', '#/focus'],
  ['Quick note', '✎', '#/notes'], ['Text tools', 'Aa', '#/text'], ['Dates', '▦', '#/dates'], ['% Calculator', '%', '#/percent'], ['QR code', '▧', '#/qr'], ['Settings', '⚙', '#/settings'],
]
const themeList: Theme[] = ['Minimal', 'Vacation', 'Birthday', 'Goal', 'Project Launch', 'Celebration']
const eventTypes: EventType[] = ['Vacation', 'Birthday', 'Goal Start', 'Goal Finish', 'Project Launch', 'Custom']
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const localDateTime = (iso?: string) => { const d = iso ? new Date(iso) : new Date(Date.now() + 86400000); const pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }
const makeEvent = (sound = false): Countdown => ({ id: crypto.randomUUID(), title: '', subtitle: '', eventType: 'Vacation', target: new Date(Date.now() + 7 * 86400000).toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, theme: 'Vacation', reference: today(), completion: 'complete', celebration: 'celebrate', sound })
const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso))
const currentTimestamp = () => Date.now()

export function App() {
  const [data, setData] = useState<DeskData>(() => readData())
  const [hash, setHash] = useState(location.hash || '#/')
  const [editor, setEditor] = useState<Countdown | null>(null)
  const [toast, setToast] = useState('')
  const [full, setFull] = useState(false)
  const [shareTemporary, setShareTemporary] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)

  const flash = (message: string) => setToast(message)
  useEffect(() => { const onHash = () => { setHash(location.hash || '#/'); setShareTemporary(false) }; addEventListener('hashchange', onHash); return () => removeEventListener('hashchange', onHash) }, [])
  useEffect(() => { const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) setData(readData()) }; addEventListener('storage', onStorage); return () => removeEventListener('storage', onStorage) }, [])
  useEffect(() => {
    if (saveData(data)) return
    const timeout = window.setTimeout(() => flash('Storage is full or unavailable. Your latest changes may not persist.'), 0)
    return () => clearTimeout(timeout)
  }, [data])
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.dataset.theme = data.appearance === 'system' ? (media?.matches ? 'dark' : 'light') : data.appearance }
    apply()
    media?.addEventListener?.('change', apply)
    return () => media?.removeEventListener?.('change', apply)
  }, [data.appearance])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3000); return () => clearTimeout(id) }, [toast])
  useEffect(() => { const updateFull = () => setFull(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', updateFull); return () => document.removeEventListener('fullscreenchange', updateFull) }, [])
  const update = (patch: Partial<DeskData>) => setData(current => ({ ...current, ...patch }))
  const shareMatch = hash.match(/^#\/share=([^&]+)/)
  const sharePreview = shareMatch ? decodeShare(shareMatch[1]) : null
  const primary = data.events.find(e => e.id === data.primaryId) ?? data.events[0] ?? null
  const path = hash.replace(/^#\/?/, '').split(/[?&]/)[0] || 'home'
  const page = shareMatch ? 'share' : path
  const setRoute = (route: string) => { location.hash = route; setHash(route) }
  const saveEvent = (event: Countdown) => { update({ events: data.events.some(item => item.id === event.id) ? data.events.map(item => item.id === event.id ? event : item) : [...data.events, event], primaryId: data.primaryId || event.id }); setEditor(null); flash('Countdown saved') }
  const closeEventEditor = useCallback(() => setEditor(null), [])
  const removeEvent = (id: string) => { if (!confirm('Delete this countdown?')) return; update({ events: data.events.filter(e => e.id !== id), primaryId: data.primaryId === id ? data.events.find(e => e.id !== id)?.id ?? null : data.primaryId }); flash('Countdown deleted') }
  const share = (event: Countdown) => { const url = `${location.origin}${location.pathname}#/share=${encodeShare(event)}`; navigator.clipboard?.writeText(url).then(() => flash('Share link copied')).catch(() => { prompt('Copy this share link', url) }) }
  const saveShared = () => { if (!sharePreview) return; const event: Countdown = { ...sharePreview, id: crypto.randomUUID() }; update({ events: [...data.events, event], primaryId: data.primaryId || event.id }); setRoute('#/countdown'); flash('Countdown added to your list') }
  const toggleFull = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen() } catch { flash('Full screen is not available in this browser.') } }
  useEffect(() => { const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && full) { setFull(false) } }; addEventListener('keydown', key); return () => removeEventListener('keydown', key) }, [full])

  if (page === 'share') return <div className="share-page"><Brand/><main className="share-card"><span className="eyebrow">COUNTDOWN SHARED WITH YOU</span>{sharePreview ? <><h1>{sharePreview.title}</h1><p>{sharePreview.subtitle || 'A milestone worth counting down to.'}</p><CountdownDisplay event={sharePreview as Countdown} /><div className="button-row"><button className="primary" onClick={() => setShareTemporary(true)}>Open temporarily</button><button onClick={saveShared}>Save to My Countdowns</button></div>{shareTemporary && <p className="notice">Preview is open for this visit. It has not been saved on this device.</p>}<button className="text-button" onClick={() => setRoute('#/')}>Back to Office Desk</button></> : <><h1>This countdown link is invalid</h1><p>It may be incomplete or no longer supported.</p><button className="primary" onClick={() => setRoute('#/')}>Go to Office Desk</button></>}</main></div>

  return <div className={full ? 'app fullscreen' : 'app'}>
    <aside className="sidebar"><Brand/><div className="nav-label">WORKSPACE</div><nav aria-label="Main navigation">{routes.map(([label, icon, route]) => <a key={route} href={route} className={(page === route.slice(2) || (page === 'home' && route === '#/')) ? 'selected' : ''} aria-current={page === route.slice(2) ? 'page' : undefined}><span className="nav-icon">{icon}</span><span>{label}</span></a>)}<button className={`mobile-more ${mobileMoreOpen || routes.slice(5).some(([, ,r])=>page===r.slice(2))?'selected':''}`} aria-expanded={mobileMoreOpen} onClick={()=>setMobileMoreOpen(open=>!open)}><span className="nav-icon">•••</span><span>More</span></button></nav>{mobileMoreOpen&&<div className="mobile-more-menu" role="group" aria-label="More tools">{routes.slice(5).map(([label,icon,route])=><a key={route} href={route} onClick={()=>setMobileMoreOpen(false)}><span>{icon}</span>{label}</a>)}</div>}<div className="sidebar-bottom"><span className="status-dot"/>All data stays on this device</div></aside>
    <div className="main-column"><header className="topbar"><div className="mobile-brand"><Brand/></div><span className="topbar-date">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span><button className="icon-button" aria-label="Toggle appearance" onClick={() => update({ appearance: data.appearance === 'dark' ? 'light' : data.appearance === 'light' ? 'system' : 'dark' })}>◐</button></header>
      <main className="content" key={page}>
        {page === 'home' && <Home primary={primary} events={data.events} navigate={setRoute} openEditor={() => setEditor(makeEvent(data.sound))} share={share} full={toggleFull}/>}
        {page === 'countdown' && <CountdownPage events={data.events} primaryId={data.primaryId} setPrimary={id => update({ primaryId: id })} openEditor={event => setEditor(event ?? makeEvent(data.sound))} duplicate={event=>setEditor({...event,id:crypto.randomUUID(),title:`${event.title} copy`})} remove={removeEvent} share={share} full={toggleFull}/>}
        {page === 'timer' && <TimerPage mode="timer" defaultSound={data.sound}/>}
        {page === 'meeting' && <TimerPage mode="meeting" defaultSound={data.sound}/>}
        {page === 'focus' && <FocusPage defaultSound={data.sound}/>}
        {page === 'notes' && <NotesPage data={data} update={update} flash={flash}/>}
        {page === 'text' && <TextPage flash={flash}/>}
        {page === 'dates' && <DatesPage/>}
        {page === 'percent' && <PercentPage/>}
        {page === 'qr' && <QrPage flash={flash}/>}
        {page === 'settings' && <SettingsPage data={data} update={update}/>}
        {!['home','countdown','timer','meeting','focus','notes','text','dates','percent','qr','settings'].includes(page) && <Home primary={primary} events={data.events} navigate={setRoute} openEditor={() => setEditor(makeEvent(data.sound))} share={share} full={toggleFull}/>}
      </main>
    </div>
    {editor && <EventDialog event={editor} onChange={setEditor} onSave={saveEvent} onClose={closeEventEditor} flash={flash}/>}
    {toast && <div className="toast" role="status">{toast}</div>}
    <InstallPrompt/>
  </div>
}

function Brand() { return <a className="brand" href="#/" aria-label="Office Desk home"><span className="brand-mark"><span/></span><span>office<span className="brand-light">desk</span></span></a> }
function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div> }
function Home({ primary, events, navigate, openEditor, share, full }: { primary: Countdown | null; events: Countdown[]; navigate: (r: string) => void; openEditor: () => void; share: (e: Countdown) => void; full: () => void }) {
  return <><PageHeading eyebrow="YOUR DAY, IN VIEW" title="A little more in focus." description="Time tools and small helpers for the workday." />
    <section className={`hero theme-${(primary?.theme ?? 'Minimal').toLowerCase().replaceAll(' ', '-')}`} aria-label="Primary countdown">
      <div className="hero-art" aria-hidden="true" style={primary?.image ? { backgroundImage: `linear-gradient(90deg,rgba(34,39,31,.82),rgba(39,44,35,.48) 58%,rgba(40,44,35,.14)),url("${primary.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}><div className="hero-orb"/><div className="hero-sun"/><div className="hero-line"/></div>
      <div className="hero-top"><span className="pill"><span className="tiny-star">✦</span> YOUR NEXT MILESTONE</span>{primary && <button className="hero-menu" aria-label="Countdown options" onClick={() => navigate('#/countdown')}>•••</button>}</div>
      {primary ? <><div className="hero-copy"><div className="hero-kicker">{primary.eventType.toUpperCase()}</div><h2>{primary.title}</h2><p>{primary.subtitle || 'One day closer to something good.'}</p></div><CountdownDisplay event={primary} variant="hero"/><div className="hero-bottom"><span>{formatDate(primary.target)} · {primary.timezone}</span><div className="hero-actions"><button onClick={full}>⛶ <span>Full screen</span></button><button onClick={() => share(primary)}>↗ <span>Share</span></button></div></div></> : <div className="hero-empty"><div className="hero-kicker">MAKE THE NEXT ONE COUNT</div><h2>Your next good thing<br/>is worth counting down to.</h2><p>Add a vacation, a birthday, or a goal you’re working toward.</p><button className="hero-cta" onClick={openEditor}>＋ Add your first countdown <span>→</span></button></div>}
    </section>
    {primary && <div className="hero-progress"><div className="progress-label"><span>Progress to {primary.title}</span><span>{progress(primary)}% there</span></div><div className="progress-track"><span style={{ width: `${progress(primary)}%` }}/></div></div>}
    <div className="section-heading"><div><span className="eyebrow">MAKE TIME FOR WHAT MATTERS</span><h2>Time</h2></div><button className="text-button" onClick={() => navigate('#/countdown')}>All countdowns <span>→</span></button></div>
    <div className="tool-grid time-grid">{[['Countdown', '◷', 'Keep a milestone in view', '#/countdown'], ['Timer', '◴', 'Count down or up', '#/timer'], ['Meeting', '▤', 'Keep the agenda moving', '#/meeting'], ['Focus', '◉', 'Make room for deep work', '#/focus']].map(item => <ToolCard key={item[0]} title={item[0]} icon={item[1]} description={item[2]} onClick={() => navigate(item[3])}/>)}</div>
    <div className="section-heading tools-heading"><div><span className="eyebrow">SMALL HELPERS, BIG DIFFERENCE</span><h2>Tools</h2></div></div>
    <div className="tool-grid">{[['Quick note','✎','Capture a thought','#/notes'],['Text tools','Aa','Clean up text','#/text'],['Dates','▦','Plan around the calendar','#/dates'],['% Calculator','%','Check the numbers','#/percent'],['QR code','▧','Make a code locally','#/qr']].map(item => <ToolCard key={item[0]} title={item[0]} icon={item[1]} description={item[2]} onClick={() => navigate(item[3])}/>)}</div>
    <footer className="home-footer"><span>Small tools. Clear head.</span><span>{events.length} saved countdown{events.length === 1 ? '' : 's'}</span></footer>
  </>
}
function progress(event: Countdown) { const start = new Date(`${event.reference}T00:00:00`).getTime(); const end = new Date(event.target).getTime(); if (end <= start) return 100; return Math.min(100, Math.max(0, Math.round((Date.now() - start) / (end - start) * 100))) }
function CountdownDisplay({ event, variant }: { event: Countdown; variant?: string }) {
  const [now,setNow] = useState(()=>Date.now())
  const [startedBeforeMount,setStartedBeforeMount] = useState(()=>Date.parse(event.target) > Date.now())
  const [celebrationOpen,setCelebrationOpen]=useState(false)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [])
  const parts = countdownParts(Date.parse(event.target),now)
  useEffect(() => { if (variant !== 'hero') return; document.title = parts.expired ? `${event.title} is here! | Office Desk` : `${event.title} · ${parts.days}d ${String(parts.hours).padStart(2,'0')}h | Office Desk`; return () => { document.title = 'Office Desk — your time, in view' } }, [event.title, parts.days, parts.hours, parts.expired, variant])
  useEffect(() => {
    if (variant !== 'hero') return
    if (!parts.expired && !startedBeforeMount) {
      const timeout=window.setTimeout(()=>setStartedBeforeMount(true),0)
      return()=>clearTimeout(timeout)
    }
    if (parts.expired && startedBeforeMount) {
      const timeout=window.setTimeout(()=>{setStartedBeforeMount(false);if(event.celebration!=='none')setCelebrationOpen(true)},0)
      if(event.sound)chime()
      return()=>clearTimeout(timeout)
    }
  }, [parts.expired, variant, event.celebration, event.sound, startedBeforeMount])
  useEffect(() => { if (!celebrationOpen) return; const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setCelebrationOpen(false)};addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey) }, [celebrationOpen])
  const values = [['DAYS', parts.days.toLocaleString()], ['HOURS', String(parts.hours).padStart(2, '0')], ['MINUTES', String(parts.minutes).padStart(2, '0')], ['SECONDS', String(parts.seconds).padStart(2, '0')]]
  const done = parts.expired && event.completion === 'complete'
  const since = parts
  const displayValues = parts.expired && event.completion === 'since' ? [['DAYS', since.days.toLocaleString()], ['HOURS', String(since.hours).padStart(2, '0')], ['MINUTES', String(since.minutes).padStart(2, '0')], ['SECONDS', String(since.seconds).padStart(2, '0')]] : values
  return <div className={`countdown-display ${variant ?? ''}`} aria-label={done ? 'Countdown complete' : `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds ${parts.expired ? 'since the target time' : 'remaining'}`}>
    {done ? <div className="complete-label">{event.celebration === 'none' ? 'It’s time.' : 'Today is the day!'} <span aria-hidden="true">✦</span></div> : <div className="countdown-units">{displayValues.map(([label, val], i) => <React.Fragment key={label}><div className={`time-unit ${i === 0 ? 'days-unit' : ''}`}><strong>{val}</strong><span>{label}</span></div>{i < 3 && <span className="time-separator">:</span>}</React.Fragment>)}</div>}
    {done && event.celebration === 'party' && <div className="confetti" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div>}
    {celebrationOpen && createPortal(<div className={`celebration-overlay celebration-${event.celebration}`} role="dialog" aria-modal={event.celebration === 'party'} aria-labelledby="celebration-title">{event.celebration === 'party' && <div className="party-confetti" aria-hidden="true"/>}<div className="celebration-card"><span aria-hidden="true">{event.celebration === 'subtle' ? '✦' : '✦  ✧  ✦'}</span><h2 id="celebration-title">{event.title} is here!</h2><p>A moment worth celebrating.</p><button className="primary" onClick={()=>setCelebrationOpen(false)}>Dismiss</button></div></div>, document.body)}
  </div>
}
function ToolCard({ title, icon, description, onClick }: { title: string; icon: string; description: string; onClick: () => void }) { return <button className="tool-card" onClick={onClick}><span className="tool-icon">{icon}</span><span className="tool-title">{title}<span>↗</span></span><span className="tool-description">{description}</span></button> }

function CountdownPage({ events, primaryId, setPrimary, openEditor, duplicate, remove, share, full }: { events: Countdown[]; primaryId: string | null; setPrimary: (id: string) => void; openEditor: (e?: Countdown) => void; duplicate:(e:Countdown)=>void; remove: (id: string) => void; share: (e: Countdown) => void; full: () => void }) {
  return <><PageHeading eyebrow="MILESTONES" title="Count it down." description="A little anticipation makes the good things feel closer." action={<button className="primary" onClick={() => openEditor()}>＋ New countdown</button>}/>
    {events.length ? <div className="event-list">{events.map(event => <article key={event.id} className={`event-card theme-${event.theme.toLowerCase().replaceAll(' ', '-')}`}><div className="event-card-main"><span className="event-type">{event.eventType} {primaryId === event.id && <span className="primary-badge">PRIMARY</span>}</span><h2>{event.title}</h2><p>{event.subtitle || formatDate(event.target)}</p><CountdownDisplay event={event}/><div className="event-date">{formatDate(event.target)} · {event.timezone}</div></div><div className="event-actions"><button onClick={() => setPrimary(event.id)}>{primaryId === event.id ? '★ Primary' : '☆ Make primary'}</button><button onClick={() => openEditor(event)}>Edit</button><button onClick={()=>duplicate(event)}>Duplicate</button><button onClick={() => share(event)}>Share</button><button onClick={full}>Full screen</button><button className="danger-link" onClick={() => remove(event.id)}>Delete</button></div></article>)}</div> : <div className="empty-card"><div className="empty-icon">◷</div><h2>No countdowns yet</h2><p>Give a future milestone a place on your home screen.</p><button className="primary" onClick={() => openEditor()}>＋ Create a countdown</button></div>}
  </>
}
function EventDialog({ event, onChange, onSave, onClose, flash }: { event: Countdown; onChange: (e: Countdown) => void; onSave: (e: Countdown) => void; onClose: () => void; flash: (s: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const modalRef=useRef<HTMLElement>(null)
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null
    const focusables=()=>Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button,input,select,textarea,[href],[tabindex]:not([tabindex="-1"])')??[]).filter(el=>el!==modalRef.current&&!el.hasAttribute('disabled'))
    const first=focusables()[0];first?.focus()
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();onClose();return}if(e.key==='Tab'){const items=focusables();if(!items.length)return;const start=items[0],end=items[items.length-1];if(e.shiftKey&&document.activeElement===start){e.preventDefault();end.focus()}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();start.focus()}}}
    document.addEventListener('keydown',key)
    return()=>{document.removeEventListener('keydown',key);previous?.focus()}
  },[onClose])
  const field = <K extends keyof Countdown>(key: K, value: Countdown[K]) => onChange({ ...event, [key]: value })
  const onFile = (file?: File) => {
    if (!file) return
    if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)) { flash('Choose a PNG, JPEG, WebP, or GIF image.'); return }
    if (file.size > 8 * 1024 * 1024) { flash('Choose an image smaller than 8 MB.'); return }
    setUploading(true)
    const failed = () => { setUploading(false); flash('That image could not be prepared. Try another file.') }
    const reader = new FileReader()
    reader.onerror = failed
    reader.onload = () => {
      const image = new Image()
      image.onerror = failed
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
          canvas.width = image.width * scale; canvas.height = image.height * scale
          const context = canvas.getContext('2d')
          if (!context || !canvas.width || !canvas.height) { failed(); return }
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
          field('image', canvas.toDataURL('image/jpeg', .78)); setUploading(false)
        } catch { failed() }
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="event-title" tabIndex={-1}><div className="modal-head"><div><span className="eyebrow">A MOMENT AHEAD</span><h2 id="event-title">{event.title ? 'Edit countdown' : 'New countdown'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
    <label>Event title<input maxLength={120} value={event.title} onChange={e => field('title', e.target.value)} placeholder="Summer in the mountains"/></label><label>Subtitle <span className="optional">OPTIONAL</span><input maxLength={180} value={event.subtitle} onChange={e => field('subtitle', e.target.value)} placeholder="A few days away from the inbox"/></label>
    <div className="form-row"><label>Event type<select value={event.eventType} onChange={e => field('eventType', e.target.value as EventType)}>{eventTypes.map(v => <option key={v}>{v}</option>)}</select></label><label>Theme<select value={event.theme} onChange={e => field('theme', e.target.value as Theme)}>{themeList.map(v => <option key={v}>{v}</option>)}</select></label></div>
    <div className="form-row"><label>Target date and time<input type="datetime-local" value={localDateTime(event.target)} onChange={e => {if(e.target.value)field('target', new Date(e.target.value).toISOString())}}/></label><label>Progress starts<input type="date" value={event.reference} onChange={e => field('reference', e.target.value)}/></label></div><p className="field-note">Stored as an exact moment in {event.timezone}.</p>
    <div className="form-row"><label>After the date<select value={event.completion} onChange={e => field('completion', e.target.value as Countdown['completion'])}><option value="complete">Show completion</option><option value="since">Count time since</option></select></label><label>Celebration<select value={event.celebration} onChange={e => field('celebration', e.target.value as Countdown['celebration'])}><option value="none">None</option><option value="subtle">Subtle</option><option value="celebrate">Celebrate</option><option value="party">Party</option></select></label></div>
    <label className="checkbox-line"><input type="checkbox" checked={event.sound} onChange={e => field('sound', e.target.checked)}/> Play a soft sound when the countdown ends</label><label>Custom background image <span className="optional">STAYS ON THIS DEVICE</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => onFile(e.target.files?.[0])}/></label>{uploading && <p className="field-note">Preparing image…</p>}{event.image && <button className="text-button" onClick={() => field('image', undefined)}>Remove background</button>}
    <div className="modal-actions"><button onClick={onClose}>Cancel</button><button className="primary" onClick={() => event.title.trim() ? onSave({ ...event, title: event.title.trim() }) : flash('Add a title for this countdown.')}>Save countdown</button></div>
  </section></div>
}

type Segment = { name: string; minutes: number }
function TimerPage({ mode, defaultSound }: { mode: 'timer' | 'meeting'; defaultSound: boolean }) {
  const [kind, setKind] = useState<'duration' | 'up' | 'clock'>('duration')
  const [duration, setDuration] = useState(mode === 'meeting' ? 30 : 25)
  const [deadline, setDeadline] = useState(() => Date.now() + duration * 60000)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [pausedRemaining, setPausedRemaining] = useState<number | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [running, setRunning] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [meetingTitle, setMeetingTitle] = useState('Team sync')
  const [segments, setSegments] = useState<Segment[]>([])
  const [segmentIndex, setSegmentIndex] = useState(0)
  const lastAgendaIndex=useRef(-1)
  const manualAgendaIndex=useRef<number|null>(null)
  const [sound, setSound] = useState(defaultSound)
  const [notify, setNotify] = useState(false)
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      const remaining = kind === 'up' ? current - startedAt : deadline - current
      if (kind !== 'up' && remaining <= 0) {
        setRunning(false)
        if (sound) chime()
        if (notify && 'Notification' in window && Notification.permission === 'granted') new Notification(mode === 'meeting' ? 'Meeting time' : 'Timer complete', { body: 'Your timer has reached zero.' })
      }
      if (mode === 'meeting' && segments.length) {
        const elapsed = Math.max(0, duration * 60000 - remaining)
        const automaticIndex = agendaIndexAtElapsed(segments,elapsed)
        if (automaticIndex !== lastAgendaIndex.current) {
          lastAgendaIndex.current = automaticIndex
          manualAgendaIndex.current = null
          setSegmentIndex(automaticIndex)
        } else if (manualAgendaIndex.current !== null && segmentIndex !== manualAgendaIndex.current) setSegmentIndex(manualAgendaIndex.current)
      }
    }, 250)
    return () => clearInterval(timer)
  }, [running, kind, startedAt, deadline, duration, mode, segments, sound, notify, segmentIndex])
  const timeRemaining = kind === 'up' ? (running ? now - (startedAt || now) : elapsedMs) : !running && pausedRemaining !== null ? pausedRemaining : kind === 'duration' && !hasStarted ? duration * 60000 : deadline - now
  const ended = timeRemaining <= 0 && kind !== 'up'
  useEffect(() => { document.title = running ? `${formatDuration(Math.abs(timeRemaining))} — ${mode === 'meeting' ? 'Meeting' : 'Timer'} | Office Desk` : 'Office Desk — your time, in view'; return () => { document.title = 'Office Desk — your time, in view' } }, [running, timeRemaining, mode])
  const setPreset = (minutes: number) => { const current=currentTimestamp();setDuration(minutes);setDeadline(current + minutes * 60000);setElapsedMs(0);setPausedRemaining(null);setHasStarted(false);setNow(current);setRunning(false) }
  const start = async () => { const current = currentTimestamp(); const updatedDeadline = kind === 'clock' && pausedRemaining === null ? (() => { const selected = new Date(); const [h,m] = localClock.split(':').map(Number); selected.setHours(h,m,0,0); if (selected.getTime() <= current) selected.setDate(selected.getDate() + 1); return selected.getTime() })() : current + (pausedRemaining ?? duration * 60000); if (kind !== 'up') setDeadline(updatedDeadline); setPausedRemaining(null);setHasStarted(true);setStartedAt(kind === 'up' ? current - elapsedMs : 0); setNow(current); setRunning(true); if (notify && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission() }
  const pause = () => { if (!running) return; const current=currentTimestamp();if (kind === 'up') setElapsedMs(Math.max(0, current - startedAt));else setPausedRemaining(Math.max(0,deadline-current));setNow(current);setRunning(false) }
  const reset = () => { const current=currentTimestamp();setRunning(false);setPausedRemaining(null);setHasStarted(false);setDeadline(current + duration * 60000);setStartedAt(0);setElapsedMs(0);setNow(current);setSegmentIndex(0);lastAgendaIndex.current=-1;manualAgendaIndex.current=null }
  const addMinutes = (n: number) => { if(pausedRemaining!==null)setPausedRemaining(Math.max(0,pausedRemaining+n*60000));else setDeadline((running ? deadline : Math.max(deadline, currentTimestamp())) + n * 60000); setDuration(d => d + n) }
  const total = Math.abs(timeRemaining); const seconds = Math.floor(total / 1000); const hh = Math.floor(seconds / 3600); const mm = Math.floor(seconds % 3600 / 60); const ss = seconds % 60
  const localClockDate = new Date(deadline)
  const localClock = `${String(localClockDate.getHours()).padStart(2,'0')}:${String(localClockDate.getMinutes()).padStart(2,'0')}`
  const activeSegment = segments[segmentIndex]
  const meetingWarning = mode === 'meeting' && timeRemaining < 0 ? 'Overtime' : mode === 'meeting' && timeRemaining <= 60000 ? 'One minute' : mode === 'meeting' && timeRemaining <= 300000 ? 'Five minutes' : ''
  const displayClock = mode === 'meeting' && timeRemaining < 0 ? `+${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}` : `${hh ? `${String(hh).padStart(2,'0')}:` : ''}${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return <><PageHeading eyebrow={mode === 'meeting' ? 'KEEP THE ROOM ON TRACK' : 'MAKE SPACE FOR A MOMENT'} title={mode === 'meeting' ? 'Meeting timer' : 'Timer'} description={mode === 'meeting' ? 'A clear clock and a calmer way to keep the agenda moving.' : 'Count down, count up, or stop at a time that works.'} action={<button className="secondary" onClick={() => document.documentElement.requestFullscreen?.()}>⛶ Full screen</button>}/>
    <section className={`timer-panel ${meetingWarning === 'Overtime' ? 'overtime' : meetingWarning ? 'warning' : ''}`}><div className="timer-toolbar">{mode === 'meeting' ? <div className="meeting-toolbar"><input aria-label="Meeting title" className="inline-title" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)}/><div className="mode-tabs"><button className={kind==='duration'?'active':''} onClick={()=>{setKind('duration');reset()}}>Duration</button><button className={kind==='clock'?'active':''} onClick={()=>{setKind('clock');reset()}}>Hard stop</button></div></div> : <div className="mode-tabs">{(['duration','up','clock'] as const).map(k => <button key={k} className={kind === k ? 'active' : ''} onClick={() => {setKind(k);reset()}}>{k === 'duration' ? 'Countdown' : k === 'up' ? 'Count up' : 'End at'}</button>)}</div>}<div className="timer-options"><label className="sound-setting"><input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)}/> Sound at end</label><label className="sound-setting"><input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)}/> Notify me</label></div></div>
      {mode === 'meeting' && <div className="timer-meta"><span className="live-dot"/>{running ? 'IN PROGRESS' : 'READY'}{meetingWarning && <span className="warning-chip">{meetingWarning}</span>}</div>}
      <div className="timer-digits" aria-live="off"><span>{displayClock}</span>{ended && <small>{mode === 'meeting' ? 'OVERTIME' : 'TIME'}</small>}</div><p className="sr-only" aria-live="polite">{ended ? mode === 'meeting' ? `Meeting overtime ${hh} hours ${mm} minutes ${ss} seconds` : 'Timer complete' : `${Math.floor(total/60000)} minutes ${Math.floor(total/1000)%60} seconds`}</p>
      {kind === 'duration' && <div className="duration-adjust"><label>Minutes<input type="number" min="1" max="999" value={duration} onChange={e => setPreset(Math.max(1, Number(e.target.value)||1))}/></label><div>{[5,10,15,25,30,45,60].map(n => <button key={n} onClick={() => setPreset(n)} className={duration === n ? 'chosen' : ''}>{n}</button>)}</div></div>}{kind === 'clock' && <label className="clock-label">Stop at <input type="time" value={localClock} onChange={e => { const d = new Date(); const [h,m] = e.target.value.split(':').map(Number); d.setHours(h,m,0,0); setDeadline(d.getTime()) }}/></label>}
        <div className="timer-controls"><button className="primary start-button" onClick={running ? pause : start}>{running ? 'Ⅱ  Pause' : '▶  Start'}</button><button onClick={reset}>↺ Reset</button>{kind !== 'up' && <><button onClick={() => addMinutes(1)}>+1 min</button><button onClick={() => addMinutes(5)}>+5 min</button><button onClick={() => addMinutes(10)}>+10 min</button></>}</div>
      {mode === 'meeting' && <div className="agenda"><div className="section-heading compact"><div><span className="eyebrow">A SIMPLE RUN OF SHOW</span><h2>Agenda <small>{segments.length}/10</small></h2></div><button className="text-button" onClick={() => setSegments(s => s.length < 10 ? [...s, { name: `Topic ${s.length + 1}`, minutes: 5 }] : s)}>＋ Add segment</button></div>{segments.length ? <><p className="agenda-total">{segments.reduce((a,s)=>a+s.minutes,0)} min total{segments.reduce((a,s)=>a+s.minutes,0) !== duration && <span> · Different from the meeting length</span>}</p><div className="segment-list">{segments.map((s,i)=><div className={`segment ${i === segmentIndex ? 'current' : ''}`} key={`${s.name}-${i}`}><span className="segment-index">{String(i+1).padStart(2,'0')}</span><input value={s.name} aria-label={`Segment ${i+1} name`} onChange={e=>setSegments(prev=>prev.map((v,j)=>j===i?{...v,name:e.target.value}:v))}/><input type="number" aria-label={`Segment ${i+1} minutes`} min="1" max="180" value={s.minutes} onChange={e=>setSegments(prev=>prev.map((v,j)=>j===i?{...v,minutes:Math.max(1,Number(e.target.value)||1)}:v))}/><span>min</span><button aria-label={`Move segment ${i+1} up`} disabled={!i} onClick={()=>setSegments(prev=>{const a=[...prev];[a[i-1],a[i]]=[a[i],a[i-1]];return a})}>↑</button><button aria-label={`Move segment ${i+1} down`} disabled={i===segments.length-1} onClick={()=>setSegments(prev=>{const a=[...prev];[a[i+1],a[i]]=[a[i],a[i+1]];return a})}>↓</button><button aria-label={`Remove segment ${i+1}`} onClick={()=>setSegments(s=>s.filter((_,j)=>j!==i))}>×</button></div>)}</div><div className="agenda-nav"><button onClick={()=>{const next=Math.max(0,segmentIndex-1);manualAgendaIndex.current=next;setSegmentIndex(next)}} disabled={!segmentIndex}>← Previous</button><span>{activeSegment ? `Now: ${activeSegment.name}${segments[segmentIndex+1] ? ` · Next: ${segments[segmentIndex+1].name}` : ' · Final segment'}` : 'All agenda items complete'}</span><button onClick={()=>{const next=Math.min(segments.length,segmentIndex+1);manualAgendaIndex.current=next;setSegmentIndex(next)}}>Next →</button></div></> : <p className="muted">Add up to ten agenda segments.</p>}</div>}
    </section></>
}
function formatDuration(ms: number) { const sec=Math.floor(ms/1000); return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}` }
function chime() { try { const context = new AudioContext(); const oscillator=context.createOscillator(); const gain=context.createGain(); oscillator.frequency.value=660; gain.gain.value=.07; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime+.35) } catch { /* Audio unavailable */ } }

function FocusPage({ defaultSound }: { defaultSound: boolean }) {
  const presets = [{name:'Pomodoro',focus:25,rest:5},{name:'Long focus',focus:50,rest:10},{name:'Deep work',focus:90,rest:15}]
  const [focusM,setFocusM]=useState(25); const [breakM,setBreakM]=useState(5); const [phase,setPhase]=useState<'focus'|'break'>('focus'); const [remaining,setRemaining]=useState(25*60000); const [deadline,setDeadline]=useState(0); const [running,setRunning]=useState(false); const [auto,setAuto]=useState(false); const [now,setNow]=useState(()=>Date.now()); const [sound,setSound]=useState(defaultSound);const [notify,setNotify]=useState(false)
  useEffect(()=>{if(!running)return;const id=setInterval(()=>{const current=Date.now();setNow(current);if(deadline-current<=0){const next=phase==='focus'?'break':'focus';const length=(next==='focus'?focusM:breakM)*60000;setPhase(next);setRemaining(length);if(auto)setDeadline(current+length);else setRunning(false);if(sound)chime();if(notify&&'Notification'in window&&Notification.permission==='granted')new Notification('Focus timer',{body:`Time for ${next==='break'?'a break':'a focus session'}.`})}},250);return()=>clearInterval(id)},[running,deadline,phase,focusM,breakM,auto,sound,notify]); const time=running?deadline-now:remaining
  const toggle=()=>{if(running){setRemaining(Math.max(0,time));setRunning(false)}else{const base=remaining||((phase==='focus'?focusM:breakM)*60000);setDeadline(Date.now()+base);setRunning(true);if(notify&&'Notification'in window&&Notification.permission==='default')void Notification.requestPermission()}};const reset=()=>{setRunning(false);setPhase('focus');setRemaining(focusM*60000)};const seconds=Math.max(0,Math.floor(time/1000))
  const choose=(f:number,b:number)=>{setFocusM(f);setBreakM(b);setPhase('focus');setRemaining(f*60000);setRunning(false)}
  return <><PageHeading eyebrow="A LITTLE TIME, WELL SPENT" title="Focus timer" description="A gentle rhythm for focus time and a real break."/><section className={`focus-panel ${phase}`}><div className="mode-tabs">{presets.map(p=><button key={p.name} className={focusM===p.focus?'active':''} onClick={()=>choose(p.focus,p.rest)}>{p.name}</button>)}<button className={presets.every(p=>focusM!==p.focus)?'active':''} onClick={()=>setRunning(false)}>Custom</button></div><div className="phase-label">{phase==='focus'?'FOCUS TIME':'TAKE A BREATH'}</div><div className="focus-digits">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</div><div className="phase-switch"><button className={phase==='focus'?'active':''} onClick={()=>{setPhase('focus');setRemaining(focusM*60000);setRunning(false)}}>Focus {focusM} min</button><button className={phase==='break'?'active':''} onClick={()=>{setPhase('break');setRemaining(breakM*60000);setRunning(false)}}>Break {breakM} min</button></div><div className="timer-controls"><button className="primary start-button" onClick={toggle}>{running?'Ⅱ Pause':'▶ Start focus'}</button><button onClick={reset}>↺ Reset</button><button onClick={()=>{const next=phase==='focus'?'break':'focus';setPhase(next);setRemaining((next==='focus'?focusM:breakM)*60000);setRunning(false)}}>Skip phase →</button></div><label className="checkbox-line centered"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Start the next phase automatically</label><div className="focus-options"><label className="checkbox-line"><input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/> Sound at phase end</label><label className="checkbox-line"><input type="checkbox" checked={notify} onChange={e=>setNotify(e.target.checked)}/> Browser notification</label></div><div className="custom-durations"><label>Focus minutes<input type="number" min="1" max="180" value={focusM} onChange={e=>{setFocusM(+e.target.value||1);if(phase==='focus'&&!running)setRemaining((+e.target.value||1)*60000)}}/></label><label>Break minutes<input type="number" min="1" max="60" value={breakM} onChange={e=>setBreakM(+e.target.value||1)}/></label></div></section></>
}
function NotesPage({ data, update, flash }: { data: DeskData; update: (v: Partial<DeskData>) => void; flash: (s: string) => void }) {
  const [tab,setTab]=useState<'note'|'checklist'>('note')
  const [draft,setDraft]=useState('')
  const addTimestamp = () => {
    const area = document.querySelector<HTMLTextAreaElement>('.note-area')
    const position = area?.selectionStart ?? data.note.length
    update({ note: `${data.note.slice(0, position)}${new Date().toLocaleString()}${data.note.slice(position)}` })
  }
  return <>
    <PageHeading eyebrow="CATCH IT BEFORE IT GOES" title="Quick note" description="A small scratchpad saved only on this device."/>
    <div className="tool-panel">
      <div className="panel-tabs">
        <button className={tab==='note'?'active':''} onClick={()=>setTab('note')}>Note</button>
        <button className={tab==='checklist'?'active':''} onClick={()=>setTab('checklist')}>Checklist <span>{data.checklist.filter(i=>!i.done).length}</span></button>
      </div>
      {tab==='note' ? <>
        <textarea className="note-area" aria-label="Quick note" placeholder="A thought, a reminder, a sentence to come back to…" value={data.note} onChange={e=>update({note:e.target.value})}/>
        <div className="note-actions">
          <span className="muted">Autosaved locally</span>
          <button onClick={addTimestamp}>＋ Timestamp</button>
          <button onClick={()=>{void navigator.clipboard?.writeText(data.note);flash('Note copied')}}>Copy all</button>
          <button className="danger-link" onClick={()=>{if(confirm('Clear this note?'))update({note:''})}}>Clear</button>
        </div>
      </> : <>
        <form className="check-add" onSubmit={e=>{e.preventDefault();if(draft.trim()){update({checklist:[...data.checklist,{id:crypto.randomUUID(),text:draft.trim(),done:false}]});setDraft('')}}}>
          <input placeholder="Add a checklist item…" value={draft} onChange={e=>setDraft(e.target.value)} aria-label="New checklist item"/><button className="primary">＋ Add</button>
        </form>
        <div className="checklist">{data.checklist.map((item,index)=><div className="check-item" key={item.id}>
          <button className={`check-box ${item.done?'checked':''}`} aria-label={item.done?'Mark incomplete':'Mark complete'} onClick={()=>update({checklist:data.checklist.map(c=>c.id===item.id?{...c,done:!c.done}:c)})}>{item.done?'✓':''}</button>
          <input aria-label={`Checklist item ${index+1}`} className={item.done?'checked-text':''} value={item.text} onChange={e=>update({checklist:data.checklist.map(c=>c.id===item.id?{...c,text:e.target.value}:c)})}/>
          <button aria-label={`Move ${item.text} up`} disabled={!index} onClick={()=>update({checklist:data.checklist.map((c,i)=>i===index?data.checklist[index-1]:i===index-1?data.checklist[index]:c)})}>↑</button>
          <button aria-label={`Move ${item.text} down`} disabled={index===data.checklist.length-1} onClick={()=>update({checklist:data.checklist.map((c,i)=>i===index?data.checklist[index+1]:i===index+1?data.checklist[index]:c)})}>↓</button>
          <button aria-label={`Delete ${item.text}`} onClick={()=>update({checklist:data.checklist.filter(c=>c.id!==item.id)})}>×</button>
        </div>)}</div>
        <div className="note-actions"><span className="muted">{data.checklist.filter(i=>i.done).length} completed</span>
          <button onClick={()=>{void navigator.clipboard?.writeText(data.checklist.map(i=>`${i.done?'[x]':'[ ]'} ${i.text}`).join('\n'));flash('Checklist copied')}}>Copy as text</button>
          <button onClick={()=>update({checklist:data.checklist.filter(i=>!i.done)})}>Clear completed</button>
        </div>
      </>}
    </div>
  </>
}

function TextPage({ flash }: { flash: (s: string) => void }) {
  const [input,setInput]=useState(''); const [output,setOutput]=useState(''); const actions=['Trim','Collapse spaces','Remove blank lines','Remove duplicate lines','Sort A–Z','Sort Z–A','UPPERCASE','lowercase','Title case','Sentence case','Add bullets','Remove bullets','Add line numbers','Remove line numbers','CSV to lines','Lines to CSV']
  const words=(input.trim().match(/\S+/g)||[]).length
  return <><PageHeading eyebrow="CLEAN TEXT, LOCALLY" title="Text tools" description="Quick transformations, all performed on your device."/><div className="text-counts"><span><b>{input.length}</b> characters</span><span><b>{input.replace(/\s/g,'').length}</b> without spaces</span><span><b>{words}</b> words</span><span><b>{input?input.split(/\r?\n/).length:0}</b> lines</span></div><div className="text-workspace"><label>Input<textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste or type your text here…"/></label><label>Output<textarea value={output} onChange={e=>setOutput(e.target.value)} placeholder="Choose a transformation to see the result…"/></label></div><div className="transform-actions">{actions.map(action=><button key={action} onClick={()=>setOutput(textTransform(input,action))}>{action}</button>)}</div><div className="note-actions"><span className="muted">Nothing is sent to a server.</span><button onClick={()=>{void navigator.clipboard?.writeText(output);flash('Output copied')}}>Copy output</button><button onClick={()=>{setInput('');setOutput('')}}>Clear</button><button onClick={()=>{setInput(output);setOutput('')}}>↔ Swap</button></div></>
}
function DatesPage() {
  const [start,setStart]=useState(today()); const [end,setEnd]=useState(today()); const [amount,setAmount]=useState(5); const [unit,setUnit]=useState<'days'|'weeks'|'business'>('business'); const [direction,setDirection]=useState(1)
  const dateValid=Boolean(start&&end); const diff=businessDaysBetween(start,end); const rawDays=(new Date(`${end}T12:00:00`).getTime()-new Date(`${start}T12:00:00`).getTime())/86400000; const calDays=Number.isFinite(rawDays)?Math.round(rawDays):0; const result=start?(unit==='business'?addBusinessDays(start,direction*amount):new Date(new Date(`${start}T12:00:00`).getTime()+direction*amount*(unit==='weeks'?7:1)*86400000).toISOString().slice(0,10)):''
  return <><PageHeading eyebrow="CALENDAR MATH, MADE SIMPLE" title="Date calculator" description="Work with dates without losing a day to timezone math."/><div className="calculator-grid"><section className="tool-panel"><span className="eyebrow">BETWEEN TWO DATES</span><h2>How much time is between these dates?</h2><div className="form-row"><label>Start date<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End date<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label></div><div className="date-results"><div><strong>{dateValid?Math.abs(calDays):'—'}</strong><span>calendar days</span></div><div><strong>{dateValid?`${Math.floor(Math.abs(calDays)/7)}w ${Math.abs(calDays)%7}d`:'—'}</strong><span>weeks and days</span></div><div><strong>{dateValid?Math.abs(diff):'—'}</strong><span>business days (Mon–Fri)</span></div></div><p className="field-note">Business days are Monday–Friday. Federal and company holidays are not excluded.</p></section><section className="tool-panel"><span className="eyebrow">DATE ADDER</span><h2>What date is a number of days away?</h2><label>Count from this date<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><div className="form-row"><label>Number of days or weeks<input type="number" value={amount} min="0" max="10000" onChange={e=>setAmount(Math.max(0,+e.target.value))}/></label><label>Count in<select value={unit} onChange={e=>setUnit(e.target.value as typeof unit)}><option value="days">Calendar days</option><option value="weeks">Weeks (7 calendar days each)</option><option value="business">Business days (Mon–Fri)</option></select></label></div><div className="direction-buttons" aria-label="Choose whether to count forward or backward"><button className={direction===1?'active':''} aria-pressed={direction===1} onClick={()=>setDirection(1)}>Count forward</button><button className={direction===-1?'active':''} aria-pressed={direction===-1} onClick={()=>setDirection(-1)}>Count backward</button></div><div className="result-date" aria-label="Calculated date">{result?new Intl.DateTimeFormat(undefined,{dateStyle:'long'}).format(new Date(`${result}T12:00:00`)):'Choose a starting date'}</div><p className="field-note">Business days skip weekends. Federal and company holidays are not excluded.</p></section></div></>
}
function PercentPage() {
  const [a,setA]=useState(''); const [b,setB]=useState(''); const [price,setPrice]=useState(''); const [cost,setCost]=useState(''); const number=(v:string)=>Number(v); const valid=(...v:string[])=>v.every(x=>x.trim()!==''&&Number.isFinite(Number(x)))
  const cards=[
    {title:'Find a percentage of a number',description:'What is this percent of that number?',firstLabel:'Percent (%)',secondLabel:'Whole number',firstPlaceholder:'e.g. 15',secondPlaceholder:'e.g. 200',result:valid(a,b)?percentOf(number(a),number(b)):null,formula:'Percent ÷ 100 × whole number'},
    {title:'Percent change',description:'How much did a value increase or decrease?',firstLabel:'Starting value',secondLabel:'Ending value',firstPlaceholder:'Value before the change',secondPlaceholder:'Value after the change',result:valid(a,b)?percentChange(number(a),number(b)):null,formula:'(Ending − starting) ÷ |starting| × 100'},
    {title:'Actual compared with plan',description:'How far is the actual amount above or below plan?',firstLabel:'Actual amount',secondLabel:'Planned amount',firstPlaceholder:'What actually happened',secondPlaceholder:'What was planned',result:valid(a,b)?variancePercent(number(a),number(b)):null,formula:'(Actual − planned) ÷ |planned| × 100'},
  ]
  return <><PageHeading eyebrow="NUMBERS, WITH CONTEXT" title="Percentage calculator" description="Choose a question, enter the two values described, and read the answer."/><div className="calculator-grid percent-grid">{cards.map(card=><section className="tool-panel" key={card.title}><span className="eyebrow">{card.title.toUpperCase()}</span><h2>{card.description}</h2><div className="form-row"><label>{card.firstLabel}<input type="number" inputMode="decimal" placeholder={card.firstPlaceholder} value={a} onChange={e=>setA(e.target.value)}/></label><label>{card.secondLabel}<input type="number" inputMode="decimal" placeholder={card.secondPlaceholder} value={b} onChange={e=>setB(e.target.value)}/></label></div><div className="calc-result" aria-live="polite">{card.result===null?'Enter both numbers':`${card.result.toLocaleString(undefined,{maximumFractionDigits:2})}%`}</div><p className="field-note">Calculation: {card.formula} <button className="text-button" onClick={()=>{setA('');setB('')}}>Clear these numbers</button></p></section>)}{(['Margin','Markup'] as const).map(kind=>{const p=number(price),c=number(cost);const answer=valid(price,cost)?(kind==='Margin'?marginPercent(p,c):markupPercent(p,c)):null;return <section className="tool-panel" key={kind}><span className="eyebrow">{kind==='Margin'?'PROFIT MARGIN':'MARKUP ON COST'}</span><h2>{kind==='Margin'?'Profit as a share of the selling price':'Profit as a percentage of your cost'}</h2><div className="form-row"><label>Selling price (amount charged)<input type="number" inputMode="decimal" placeholder="What the customer pays" value={price} onChange={e=>setPrice(e.target.value)}/></label><label>Cost (your expense)<input type="number" inputMode="decimal" placeholder="What it costs you" value={cost} onChange={e=>setCost(e.target.value)}/></label></div><div className="calc-result" aria-live="polite">{answer===null?'Enter both numbers':`${answer.toLocaleString(undefined,{maximumFractionDigits:2})}%`}</div><p className="field-note">Calculation: {kind==='Margin'?'(selling price − cost) ÷ selling price':'(selling price − cost) ÷ cost'} <button className="text-button" onClick={()=>{setPrice('');setCost('')}}>Clear these prices</button></p></section>})}</div><p className="field-note">A positive plan variance means the actual amount is above plan; a negative result means it is below plan. Zero starting or planned values cannot produce a percentage. Margin divides profit by selling price; markup divides profit by cost.</p></>
}

function QrPage({ flash }: { flash: (s:string)=>void }) {
  const [input,setInput]=useState(''); const [size,setSize]=useState(320); const [src,setSrc]=useState(''); const [error,setError]=useState('')
  const generate=async()=>{if(!input.trim()){setError('Enter text or a URL first.');setSrc('');return}try{setSrc(await QRCode.toDataURL(input,{width:size,margin:2,color:{dark:'#252623',light:'#ffffff'}}));setError('')}catch{setError('Could not make a QR code for that content.')}}
  return <><PageHeading eyebrow="LOCAL BY DESIGN" title="QR code" description="Make a shareable code without sending its contents anywhere."/><div className="qr-layout"><section className="tool-panel"><label>Text or URL<textarea className="qr-input" value={input} onChange={e=>setInput(e.target.value)} placeholder="https://example.com or any short text"/></label><label>Output size <span>{size} px</span><input type="range" min="160" max="720" step="40" value={size} onChange={e=>setSize(+e.target.value)}/></label><div className="button-row"><button className="primary" onClick={generate}>Generate code</button><button onClick={()=>{setInput('');setSrc('');setError('')}}>Clear</button></div>{error&&<p className="error-text" role="alert">{error}</p>}<p className="notice">Before sharing, verify that the QR code points to the link you intended.</p></section><section className="qr-preview">{src?<><img src={src} alt="Generated QR code"/><div className="button-row"><a className="button-link" href={src} download="office-desk-qr.png">Download PNG</a><button onClick={async()=>{try{const blob=await(await fetch(src)).blob();await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);flash('QR image copied')}catch{flash('Image copy is not supported here.')}}}>Copy image</button><button onClick={()=>window.print()}>Print</button></div></>:<div className="qr-placeholder"><span>▧</span><p>Your QR code will appear here</p></div>}</section></div></>
}
function SettingsPage({ data, update }: { data: DeskData; update:(p:Partial<DeskData>)=>void }) {
  return <><PageHeading eyebrow="MAKE IT YOURS" title="Settings" description="A few preferences for your desk."/><div className="settings-list"><section className="settings-item"><div><h2 id="appearance-heading">Appearance</h2><p>Choose a look or follow your device.</p></div><select aria-labelledby="appearance-heading" value={data.appearance} onChange={e=>update({appearance:e.target.value as DeskData['appearance']})}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></section><section className="settings-item"><div><h2 id="default-sound-heading">Default sound</h2><p>Sound is always opt-in for countdowns and timers.</p></div><label className="switch"><input aria-labelledby="default-sound-heading" type="checkbox" checked={data.sound} onChange={e=>update({sound:e.target.checked})}/><span/></label></section><section className="settings-item"><div><h2>Privacy</h2><p>Your content stays on this device except countdown details you choose to share in a link.</p></div><span className="muted">No accounts or analytics</span></section><section className="settings-item"><div><h2>Install Office Desk</h2><p>Use your browser’s install option to add the app to your device.</p></div><span className="muted">Available in supported browsers</span></section><section className="settings-item"><div><h2>Reset app data</h2><p>Remove saved countdowns, notes, checklist, and preferences from this device.</p></div><button className="danger-button" onClick={()=>{if(confirm('Permanently clear all Office Desk data from this device?')){localStorage.removeItem(STORAGE_KEY);location.reload()}}}>Reset data</button></section><div className="version-note">Office Desk · Version 1.0.0</div></div></>
}
function InstallPrompt() { const [updateReady,setUpdateReady]=useState(false); useEffect(()=>{ if(!('serviceWorker' in navigator)) return; navigator.serviceWorker.ready.then(reg=>{if(reg.waiting)setUpdateReady(true);reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)setUpdateReady(true)})}) }).catch(()=>{}); },[]); return updateReady?<div className="update-banner" role="status">A new version is ready. <button onClick={()=>navigator.serviceWorker.getRegistration().then(reg=>{reg?.waiting?.postMessage({type:'SKIP_WAITING'});location.reload()})}>Refresh</button><button aria-label="Dismiss update" onClick={()=>setUpdateReady(false)}>×</button></div>:null }

const rootElement = document.getElementById('root')
if (rootElement) createRoot(rootElement).render(<React.StrictMode><App/></React.StrictMode>)
