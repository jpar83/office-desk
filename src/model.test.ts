import { describe, expect, it } from 'vitest'
import { addBusinessDays, agendaIndexAtElapsed, businessDaysBetween, countdownParts, decodeShare, encodeShare, freshData, marginPercent, markupPercent, percentChange, percentOf, readData, saveData, textTransform, variancePercent, type Countdown } from './model'

describe('countdown math', () => {
  it('splits time into days through seconds and marks zero as expired', () => {
    expect(countdownParts(1000 * (86400 + 3600 + 120 + 9), 0)).toMatchObject({ days: 1, hours: 1, minutes: 2, seconds: 9, expired: false })
    expect(countdownParts(1000, 1000).expired).toBe(true)
    expect(countdownParts(1000, 2000).seconds).toBe(1)
  })
})
describe('share payloads', () => {
  const event: Countdown = { id: 'a', title: 'July trip', subtitle: 'Beach', eventType: 'Vacation', target: '2027-07-04T15:00:00.000Z', timezone: 'America/Chicago', theme: 'Vacation', reference: '2026-09-24', completion: 'since', celebration: 'party', sound: true, image: 'never-share-me' }
  it('round trips only safe configuration and excludes images', () => { const restored = decodeShare(encodeShare(event)); expect(restored).toMatchObject({ title: event.title, target: event.target, theme: 'Vacation', completion: 'since' }); expect(restored).not.toHaveProperty('image') })
  it('rejects malformed and invalid payloads', () => { expect(decodeShare('@@@')).toBeNull(); expect(decodeShare(btoa(JSON.stringify({ title: 'x' })))).toBeNull() })
})
describe('date-only business day math', () => {
  it('counts weekdays across a weekend in either direction and adds weekdays only', () => { expect(businessDaysBetween('2026-09-25','2026-09-29')).toBe(2); expect(businessDaysBetween('2026-09-29','2026-09-25')).toBe(-2); expect(addBusinessDays('2026-09-25',2)).toBe('2026-09-29') })
  it('handles leap day as a calendar date', () => { expect(addBusinessDays('2024-02-28',1)).toBe('2024-02-29') })
})
describe('text transformations', () => {
  it('removes duplicate lines and normalizes whitespace', () => { expect(textTransform('b\na\nb','Remove duplicate lines')).toBe('b\na'); expect(textTransform(' a   b ','Collapse spaces')).toBe(' a b ') })
  it('formats common office text', () => { expect(textTransform('apples, pears','CSV to lines')).toBe('apples\npears'); expect(textTransform('Alpha\nBeta','Lines to CSV')).toBe('Alpha, Beta'); expect(textTransform('1. One\n2) Two','Remove line numbers')).toBe('One\nTwo') })
})
describe('local data', () => {
  it('loads and persists the versioned data shape', () => { const original=globalThis.localStorage; const store=new Map<string,string>(); Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>store.set(k,v)}}); const d={...freshData(),note:'hello'};expect(saveData(d)).toBe(true);expect(readData().note).toBe('hello');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:original}) })
  it('sanitizes malformed records rather than exposing invalid fields to the UI', () => { const original=globalThis.localStorage; const store=new Map<string,string>([['officeDesk.v1',JSON.stringify({version:1,events:[{id:'bad',title:'bad',target:'not a date'},{id:'ok',title:'Saved',target:'2027-01-01T00:00:00Z',theme:'unknown'}],note:42,checklist:'invalid',appearance:'neon'})]]);Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>store.set(k,v)}});const value=readData();expect(value.events).toHaveLength(1);expect(value.events[0].theme).toBe('Minimal');expect(value.note).toBe('');expect(value.checklist).toEqual([]);expect(value.appearance).toBe('system');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:original}) })
})
describe('business calculations and meeting agenda',()=>{
  it('handles percent formulas, negative values, and zero denominators',()=>{expect(percentOf(25,80)).toBe(20);expect(percentChange(80,100)).toBe(25);expect(variancePercent(90,100)).toBe(-10);expect(marginPercent(80,50)).toBe(37.5);expect(markupPercent(80,50)).toBe(60);expect(marginPercent(0,5)).toBeNull();expect(markupPercent(5,0)).toBeNull();expect(percentChange(0,8)).toBeNull()})
  it('advances agenda segments at their time boundaries',()=>{const segments=[{minutes:2},{minutes:3}];expect(agendaIndexAtElapsed(segments,0)).toBe(0);expect(agendaIndexAtElapsed(segments,120000)).toBe(1);expect(agendaIndexAtElapsed(segments,300000)).toBe(2)})
})
