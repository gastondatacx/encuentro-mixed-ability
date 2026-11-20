export const SECTION_IDS = [
  "inicio",
  "agenda",
  "fixture",
  "equipos",
  "sede",
  "guia",
  "fotos",
  "contacto",
] as const

export type AnalyticsSectionId = (typeof SECTION_IDS)[number]

export const SECTION_LABELS: Record<AnalyticsSectionId, string> = {
  inicio: "Inicio",
  agenda: "Cronograma",
  fixture: "Fixture",
  equipos: "Equipos",
  sede: "Sede y Mapa",
  guia: "Guía Oficial",
  fotos: "Álbum y Fotos",
  contacto: "Contacto",
}

export type AnalyticsEventType =
  | "session_start"
  | "heartbeat"
  | "section_view"
  | "nav_click"
  | "schedule_day"
  | "fixture_filter"
  | "fixture_search"
  | "fixture_block_toggle"
  | "team_search"
  | "team_ficha_open"
  | "map_expand"
  | "venue_directions"
  | "venue_copy_address"
  | "faq_open"
  | "photo_drive_open"
  | "photo_upload_success"
  | "photo_upload_offline_queue"
  | "share_click"
  | "contact_click"
  | "stream_click"
  | "pwa_prompt_shown"
  | "pwa_installed"
  | "offline_usage"

export type AnalyticsDevice = "android" | "ios" | "desktop"
export type AnalyticsMode = "pwa" | "browser"

export interface AnalyticsEventItem {
  id: string
  type: AnalyticsEventType
  ts: number
  visitorId: string
  sessionId: string
  device: AnalyticsDevice
  mode: AnalyticsMode
  online: boolean
  meta?: Record<string, string | number | boolean>
}

export interface RecentAnalyticsEvent {
  id: string
  type: AnalyticsEventType
  label: string
  ts: number
  device: AnalyticsDevice
  mode: AnalyticsMode
}

export interface AnalyticsTotals {
  sessions: number
  uniqueVisitors: number
  returningSessions: number
  interactions: number
  engagedSessions: number
  totalDurationSec: number
  offlineSessions: number
  pwaSessions: number
  pwaPromptShown: number
  pwaInstalls: number
  photosUploaded: number
  photosQueuedOffline: number
  driveAlbumClicks: number
  mapExpands: number
  directionsClicks: number
  addressCopies: number
  shareClicks: number
  whatsappClicks: number
  emailClicks: number
  streamClicks: number
}

export interface AnalyticsDayBucket {
  sessions: number
  interactions: number
}

export interface AnalyticsSnapshot {
  createdAt: string
  updatedAt: string
  totals: AnalyticsTotals
  devices: Record<AnalyticsDevice, number>
  sections: Record<string, number>
  navClicks: Record<string, number>
  scheduleDays: Record<string, number>
  fixtureFilters: Record<string, number>
  teamFichas: Record<string, number>
  searchTerms: Record<string, number>
  faqsOpened: Record<string, number>
  byHour: Record<string, number>
  byDay: Record<string, AnalyticsDayBucket>
  activeVisitors: Record<string, number>
  knownVisitors: string[]
  engagedSessionIds: string[]
  recentEvents: RecentAnalyticsEvent[]
  processedEventIds?: string[]
}

const MAX_KNOWN_IDS = 2500
const MAX_RECENT_EVENTS = 40
const MAX_PROCESSED_IDS = 400
const ARGENTINA_OFFSET_MS = 3 * 60 * 60 * 1000

const INTERACTIVE_EVENT_TYPES = new Set<AnalyticsEventType>([
  "nav_click",
  "schedule_day",
  "fixture_filter",
  "fixture_search",
  "fixture_block_toggle",
  "team_search",
  "team_ficha_open",
  "map_expand",
  "venue_directions",
  "venue_copy_address",
  "faq_open",
  "photo_drive_open",
  "photo_upload_success",
  "photo_upload_offline_queue",
  "share_click",
  "contact_click",
  "stream_click",
  "pwa_installed",
])

function createInitialSectionMap(): Record<string, number> {
  return Object.fromEntries(SECTION_IDS.map((id) => [id, 0]))
}

export function createEmptySnapshot(): AnalyticsSnapshot {
  const now = new Date().toISOString()
  return {
    createdAt: now,
    updatedAt: now,
    totals: {
      sessions: 0,
      uniqueVisitors: 0,
      returningSessions: 0,
      interactions: 0,
      engagedSessions: 0,
      totalDurationSec: 0,
      offlineSessions: 0,
      pwaSessions: 0,
      pwaPromptShown: 0,
      pwaInstalls: 0,
      photosUploaded: 0,
      photosQueuedOffline: 0,
      driveAlbumClicks: 0,
      mapExpands: 0,
      directionsClicks: 0,
      addressCopies: 0,
      shareClicks: 0,
      whatsappClicks: 0,
      emailClicks: 0,
      streamClicks: 0,
    },
    devices: {
      android: 0,
      ios: 0,
      desktop: 0,
    },
    sections: createInitialSectionMap(),
    navClicks: createInitialSectionMap(),
    scheduleDays: {
      sabado: 0,
      domingo: 0,
    },
    fixtureFilters: {},
    teamFichas: {},
    searchTerms: {},
    faqsOpened: {},
    byHour: {},
    byDay: {},
    activeVisitors: {},
    knownVisitors: [],
    engagedSessionIds: [],
    recentEvents: [],
    processedEventIds: [],
  }
}

function asNonNegInt(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0
}

function sanitizeNumberRecord(input: unknown, defaults: Record<string, number> = {}): Record<string, number> {
  const out: Record<string, number> = { ...defaults }
  if (!input || typeof input !== "object") return out
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const val = asNonNegInt(v)
    if (val > 0 || k in out) out[k] = val
  }
  return out
}

export function normalizeSnapshot(raw: unknown): AnalyticsSnapshot {
  const base = createEmptySnapshot()
  if (!raw || typeof raw !== "object") return base
  const obj = raw as Partial<AnalyticsSnapshot>

  const knownVisitors = Array.isArray(obj.knownVisitors)
    ? Array.from(new Set(obj.knownVisitors.filter((v): v is string => typeof v === "string"))).slice(
        -MAX_KNOWN_IDS
      )
    : []

  const engagedSessionIds = Array.isArray(obj.engagedSessionIds)
    ? Array.from(new Set(obj.engagedSessionIds.filter((v): v is string => typeof v === "string"))).slice(
        -MAX_KNOWN_IDS
      )
    : []

  const rawTotals = (obj.totals ?? {}) as Partial<AnalyticsTotals>
  const totals: AnalyticsTotals = {
    sessions: asNonNegInt(rawTotals.sessions),
    uniqueVisitors: Math.max(asNonNegInt(rawTotals.uniqueVisitors), knownVisitors.length),
    returningSessions: asNonNegInt(rawTotals.returningSessions),
    interactions: asNonNegInt(rawTotals.interactions),
    engagedSessions: Math.max(asNonNegInt(rawTotals.engagedSessions), engagedSessionIds.length),
    totalDurationSec: asNonNegInt(rawTotals.totalDurationSec),
    offlineSessions: asNonNegInt(rawTotals.offlineSessions),
    pwaSessions: asNonNegInt(rawTotals.pwaSessions),
    pwaPromptShown: asNonNegInt(rawTotals.pwaPromptShown),
    pwaInstalls: asNonNegInt(rawTotals.pwaInstalls),
    photosUploaded: asNonNegInt(rawTotals.photosUploaded),
    photosQueuedOffline: asNonNegInt(rawTotals.photosQueuedOffline),
    driveAlbumClicks: asNonNegInt(rawTotals.driveAlbumClicks),
    mapExpands: asNonNegInt(rawTotals.mapExpands),
    directionsClicks: asNonNegInt(rawTotals.directionsClicks),
    addressCopies: asNonNegInt(rawTotals.addressCopies),
    shareClicks: asNonNegInt(rawTotals.shareClicks),
    whatsappClicks: asNonNegInt(rawTotals.whatsappClicks),
    emailClicks: asNonNegInt(rawTotals.emailClicks),
    streamClicks: asNonNegInt(rawTotals.streamClicks),
  }

  const rawDevices = (obj.devices ?? {}) as Partial<Record<AnalyticsDevice, unknown>>
  const devices: Record<AnalyticsDevice, number> = {
    android: asNonNegInt(rawDevices.android),
    ios: asNonNegInt(rawDevices.ios),
    desktop: asNonNegInt(rawDevices.desktop),
  }

  const byDay: Record<string, AnalyticsDayBucket> = {}
  if (obj.byDay && typeof obj.byDay === "object") {
    for (const [day, bucket] of Object.entries(obj.byDay)) {
      if (bucket && typeof bucket === "object") {
        byDay[day] = {
          sessions: asNonNegInt((bucket as AnalyticsDayBucket).sessions),
          interactions: asNonNegInt((bucket as AnalyticsDayBucket).interactions),
        }
      }
    }
  }

  const activeVisitors: Record<string, number> = {}
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  if (obj.activeVisitors && typeof obj.activeVisitors === "object") {
    for (const [vid, ts] of Object.entries(obj.activeVisitors)) {
      const n = Number(ts)
      if (Number.isFinite(n) && n >= cutoff) activeVisitors[vid] = n
    }
  }

  const recentEvents = Array.isArray(obj.recentEvents)
    ? obj.recentEvents
        .filter(
          (item): item is RecentAnalyticsEvent =>
            Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.ts === "number")
        )
        .slice(0, MAX_RECENT_EVENTS)
    : []

  const processedEventIds = Array.isArray(obj.processedEventIds)
    ? Array.from(new Set(obj.processedEventIds.filter((v): v is string => typeof v === "string"))).slice(
        -MAX_PROCESSED_IDS
      )
    : []

  return {
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : base.createdAt,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : base.updatedAt,
    totals,
    devices,
    sections: sanitizeNumberRecord(obj.sections, base.sections),
    navClicks: sanitizeNumberRecord(obj.navClicks, base.navClicks),
    scheduleDays: sanitizeNumberRecord(obj.scheduleDays, base.scheduleDays),
    fixtureFilters: sanitizeNumberRecord(obj.fixtureFilters),
    teamFichas: sanitizeNumberRecord(obj.teamFichas),
    searchTerms: sanitizeNumberRecord(obj.searchTerms),
    faqsOpened: sanitizeNumberRecord(obj.faqsOpened),
    byHour: sanitizeNumberRecord(obj.byHour),
    byDay,
    activeVisitors,
    knownVisitors,
    engagedSessionIds,
    recentEvents,
    processedEventIds,
  }
}

export function getArgentinaTimeKeys(ts: number): { dayKey: string; hourKey: string } {
  const shifted = new Date(ts - ARGENTINA_OFFSET_MS)
  const year = shifted.getUTCFullYear()
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0")
  const day = String(shifted.getUTCDate()).padStart(2, "0")
  const hour = String(shifted.getUTCHours()).padStart(2, "0")
  const dayKey = `${year}-${month}-${day}`
  return {
    dayKey,
    hourKey: `${dayKey} ${hour}:00`,
  }
}

export function formatEventLabel(event: AnalyticsEventItem): string {
  const meta = event.meta ?? {}
  switch (event.type) {
    case "session_start":
      return meta.isReturning ? "Visita recurrente a la app" : "Nueva visita a la app"
    case "heartbeat":
      return "Sesión activa"
    case "section_view": {
      const sec = String(meta.section ?? "") as AnalyticsSectionId
      return `Exploró sección: ${SECTION_LABELS[sec] ?? sec}`
    }
    case "nav_click": {
      const sec = String(meta.section ?? "") as AnalyticsSectionId
      return `Tocó menú: ${SECTION_LABELS[sec] ?? sec}`
    }
    case "schedule_day":
      return `Consultó cronograma: ${meta.day === "domingo" ? "Domingo 22" : "Sábado 21"}`
    case "fixture_filter":
      return `Filtró fixture (${String(meta.filter ?? "general")})`
    case "fixture_search":
      return `Buscó en fixture: “${String(meta.query ?? "")}”`
    case "fixture_block_toggle":
      return `Desplegó bloque del fixture (${String(meta.blockId ?? "")})`
    case "team_search":
      return `Buscó equipo: “${String(meta.query ?? "")}”`
    case "team_ficha_open":
      return `Abrió ficha de ${String(meta.team ?? "equipo")}`
    case "map_expand":
      return "Amplió mapa oficial del predio"
    case "venue_directions":
      return "Abrió GPS / Cómo llegar al club"
    case "venue_copy_address":
      return "Copió dirección de la sede"
    case "faq_open":
      return `Abrió FAQ: ${String(meta.question ?? "Pregunta")}`
    case "photo_drive_open":
      return "Abrió el álbum en Google Drive"
    case "photo_upload_success": {
      const count = asNonNegInt(meta.count) || 1
      return `Subió ${count} ${count === 1 ? "archivo" : "archivos"} al álbum`
    }
    case "photo_upload_offline_queue": {
      const count = asNonNegInt(meta.count) || 1
      return `Guardó ${count} ${count === 1 ? "archivo" : "archivos"} en cola sin conexión`
    }
    case "share_click":
      return `Compartió la app (${meta.method === "native" ? "menú nativo" : "link copiado"})`
    case "contact_click":
      return meta.channel === "whatsapp" ? "Tocó contacto por WhatsApp" : "Tocó contacto por Email"
    case "stream_click":
      return `Abrió stream en vivo (${meta.day === "domingo" ? "Domingo 22" : "Sábado 21"})`
    case "pwa_prompt_shown":
      return `Se mostró aviso de instalar app (${String(meta.platform ?? "web")})`
    case "pwa_installed":
      return "Instaló la app (PWA)"
    case "offline_usage":
      return "Usó la app sin conexión en el predio"
    default:
      return event.type
  }
}

function incrementMap(map: Record<string, number>, key: string, delta = 1) {
  if (!key) return
  map[key] = (map[key] ?? 0) + delta
}

function ensureDayBucket(byDay: Record<string, AnalyticsDayBucket>, dayKey: string) {
  if (!byDay[dayKey]) {
    byDay[dayKey] = { sessions: 0, interactions: 0 }
  }
  return byDay[dayKey]
}

export function applyEventsToSnapshot(
  current: AnalyticsSnapshot,
  events: AnalyticsEventItem[]
): AnalyticsSnapshot {
  const next = normalizeSnapshot(current)
  if (!events.length) return next

  const knownSet = new Set(next.knownVisitors)
  const engagedSet = new Set(next.engagedSessionIds)
  const processedSet = new Set(next.processedEventIds ?? [])
  const newRecent: RecentAnalyticsEvent[] = []

  const sorted = [...events].sort((a, b) => a.ts - b.ts)

  for (const ev of sorted) {
    if (!ev || typeof ev.id !== "string" || typeof ev.type !== "string") continue
    if (processedSet.has(ev.id)) continue
    processedSet.add(ev.id)

    const ts = Number.isFinite(ev.ts) && ev.ts > 0 ? ev.ts : Date.now()
    const { dayKey, hourKey } = getArgentinaTimeKeys(ts)
    const dayBucket = ensureDayBucket(next.byDay, dayKey)
    const meta = ev.meta ?? {}

    if (ev.visitorId) {
      const prevTs = next.activeVisitors[ev.visitorId] ?? 0
      if (ts > prevTs) next.activeVisitors[ev.visitorId] = ts
      if (!knownSet.has(ev.visitorId)) {
        knownSet.add(ev.visitorId)
        next.knownVisitors.push(ev.visitorId)
      }
    }

    const markEngaged = () => {
      if (ev.sessionId && !engagedSet.has(ev.sessionId)) {
        engagedSet.add(ev.sessionId)
        next.engagedSessionIds.push(ev.sessionId)
      }
    }

    if (ev.type === "session_start") {
      next.totals.sessions += 1
      dayBucket.sessions += 1
      incrementMap(next.byHour, hourKey, 1)
      if (meta.isReturning) next.totals.returningSessions += 1
      if (ev.mode === "pwa") next.totals.pwaSessions += 1
      if (!ev.online) next.totals.offlineSessions += 1
      next.devices[ev.device] = (next.devices[ev.device] ?? 0) + 1
    } else if (ev.type === "heartbeat") {
      const sec = Math.min(Math.max(asNonNegInt(meta.durationSec) || 30, 1), 120)
      next.totals.totalDurationSec += sec
    } else if (ev.type === "section_view") {
      const sec = String(meta.section ?? "")
      if (sec) {
        incrementMap(next.sections, sec, 1)
        if (sec !== "inicio") markEngaged()
      }
    } else if (ev.type === "offline_usage") {
      next.totals.offlineSessions += 1
    } else if (ev.type === "pwa_prompt_shown") {
      next.totals.pwaPromptShown += 1
    }

    if (INTERACTIVE_EVENT_TYPES.has(ev.type)) {
      next.totals.interactions += 1
      dayBucket.interactions += 1
      markEngaged()

      switch (ev.type) {
        case "nav_click": {
          const sec = String(meta.section ?? "")
          if (sec) incrementMap(next.navClicks, sec, 1)
          break
        }
        case "schedule_day": {
          const day = String(meta.day ?? "")
          if (day) incrementMap(next.scheduleDays, day, 1)
          break
        }
        case "fixture_filter": {
          const filter = String(meta.filter ?? "")
          if (filter) incrementMap(next.fixtureFilters, filter, 1)
          break
        }
        case "fixture_search":
        case "team_search": {
          const q = String(meta.query ?? "").trim().toLowerCase()
          if (q.length >= 2) incrementMap(next.searchTerms, q, 1)
          break
        }
        case "team_ficha_open": {
          const team = String(meta.team ?? "").trim()
          if (team) incrementMap(next.teamFichas, team, 1)
          break
        }
        case "map_expand":
          next.totals.mapExpands += 1
          break
        case "venue_directions":
          next.totals.directionsClicks += 1
          break
        case "venue_copy_address":
          next.totals.addressCopies += 1
          break
        case "faq_open": {
          const question = String(meta.question ?? "").trim()
          if (question) incrementMap(next.faqsOpened, question, 1)
          break
        }
        case "photo_drive_open":
          next.totals.driveAlbumClicks += 1
          break
        case "photo_upload_success":
          next.totals.photosUploaded += asNonNegInt(meta.count) || 1
          break
        case "photo_upload_offline_queue":
          next.totals.photosQueuedOffline += asNonNegInt(meta.count) || 1
          break
        case "share_click":
          next.totals.shareClicks += 1
          break
        case "contact_click":
          if (meta.channel === "whatsapp") next.totals.whatsappClicks += 1
          else if (meta.channel === "email") next.totals.emailClicks += 1
          break
        case "stream_click":
          next.totals.streamClicks += 1
          break
        case "pwa_installed":
          next.totals.pwaInstalls += 1
          break
      }
    }

    if (ev.type !== "heartbeat") {
      newRecent.push({
        id: ev.id,
        type: ev.type,
        label: formatEventLabel(ev),
        ts,
        device: ev.device,
        mode: ev.mode,
      })
    }
  }

  if (next.knownVisitors.length > MAX_KNOWN_IDS) {
    next.knownVisitors = next.knownVisitors.slice(-MAX_KNOWN_IDS)
  }
  if (next.engagedSessionIds.length > MAX_KNOWN_IDS) {
    next.engagedSessionIds = next.engagedSessionIds.slice(-MAX_KNOWN_IDS)
  }

  next.totals.uniqueVisitors = Math.max(next.totals.uniqueVisitors, next.knownVisitors.length)
  next.totals.engagedSessions = Math.max(next.totals.engagedSessions, next.engagedSessionIds.length)
  next.processedEventIds = Array.from(processedSet).slice(-MAX_PROCESSED_IDS)

  if (newRecent.length > 0) {
    const mergedRecent = [...newRecent.reverse(), ...next.recentEvents]
    const seen = new Set<string>()
    next.recentEvents = mergedRecent
      .filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
      .sort((a, b) => b.ts - a.ts)
      .slice(0, MAX_RECENT_EVENTS)
  }

  // Prune activeVisitors older than 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  for (const [vid, lastTs] of Object.entries(next.activeVisitors)) {
    if (lastTs < cutoff) delete next.activeVisitors[vid]
  }

  next.updatedAt = new Date().toISOString()
  return next
}

function mergeMaxRecord(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    out[k] = Math.max(out[k] ?? 0, v)
  }
  return out
}

export function mergeSnapshots(baseRaw: AnalyticsSnapshot, incomingRaw: AnalyticsSnapshot): AnalyticsSnapshot {
  const a = normalizeSnapshot(baseRaw)
  const b = normalizeSnapshot(incomingRaw)

  const knownVisitors = Array.from(new Set([...a.knownVisitors, ...b.knownVisitors])).slice(-MAX_KNOWN_IDS)
  const engagedSessionIds = Array.from(
    new Set([...a.engagedSessionIds, ...b.engagedSessionIds])
  ).slice(-MAX_KNOWN_IDS)

  const totals: AnalyticsTotals = {
    sessions: Math.max(a.totals.sessions, b.totals.sessions),
    uniqueVisitors: Math.max(a.totals.uniqueVisitors, b.totals.uniqueVisitors, knownVisitors.length),
    returningSessions: Math.max(a.totals.returningSessions, b.totals.returningSessions),
    interactions: Math.max(a.totals.interactions, b.totals.interactions),
    engagedSessions: Math.max(a.totals.engagedSessions, b.totals.engagedSessions, engagedSessionIds.length),
    totalDurationSec: Math.max(a.totals.totalDurationSec, b.totals.totalDurationSec),
    offlineSessions: Math.max(a.totals.offlineSessions, b.totals.offlineSessions),
    pwaSessions: Math.max(a.totals.pwaSessions, b.totals.pwaSessions),
    pwaPromptShown: Math.max(a.totals.pwaPromptShown, b.totals.pwaPromptShown),
    pwaInstalls: Math.max(a.totals.pwaInstalls, b.totals.pwaInstalls),
    photosUploaded: Math.max(a.totals.photosUploaded, b.totals.photosUploaded),
    photosQueuedOffline: Math.max(a.totals.photosQueuedOffline, b.totals.photosQueuedOffline),
    driveAlbumClicks: Math.max(a.totals.driveAlbumClicks, b.totals.driveAlbumClicks),
    mapExpands: Math.max(a.totals.mapExpands, b.totals.mapExpands),
    directionsClicks: Math.max(a.totals.directionsClicks, b.totals.directionsClicks),
    addressCopies: Math.max(a.totals.addressCopies, b.totals.addressCopies),
    shareClicks: Math.max(a.totals.shareClicks, b.totals.shareClicks),
    whatsappClicks: Math.max(a.totals.whatsappClicks, b.totals.whatsappClicks),
    emailClicks: Math.max(a.totals.emailClicks, b.totals.emailClicks),
    streamClicks: Math.max(a.totals.streamClicks, b.totals.streamClicks),
  }

  const byDay: Record<string, AnalyticsDayBucket> = { ...a.byDay }
  for (const [day, bucket] of Object.entries(b.byDay)) {
    const existing = byDay[day]
    byDay[day] = existing
      ? {
          sessions: Math.max(existing.sessions, bucket.sessions),
          interactions: Math.max(existing.interactions, bucket.interactions),
        }
      : { ...bucket }
  }

  const activeVisitors: Record<string, number> = { ...a.activeVisitors }
  for (const [vid, ts] of Object.entries(b.activeVisitors)) {
    activeVisitors[vid] = Math.max(activeVisitors[vid] ?? 0, ts)
  }

  const recentSeen = new Set<string>()
  const recentEvents = [...a.recentEvents, ...b.recentEvents]
    .filter((ev) => {
      if (recentSeen.has(ev.id)) return false
      recentSeen.add(ev.id)
      return true
    })
    .sort((x, y) => y.ts - x.ts)
    .slice(0, MAX_RECENT_EVENTS)

  const processedEventIds = Array.from(
    new Set([...(a.processedEventIds ?? []), ...(b.processedEventIds ?? [])])
  ).slice(-MAX_PROCESSED_IDS)

  return {
    createdAt: a.createdAt < b.createdAt ? a.createdAt : b.createdAt,
    updatedAt: a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt,
    totals,
    devices: {
      android: Math.max(a.devices.android, b.devices.android),
      ios: Math.max(a.devices.ios, b.devices.ios),
      desktop: Math.max(a.devices.desktop, b.devices.desktop),
    },
    sections: mergeMaxRecord(a.sections, b.sections),
    navClicks: mergeMaxRecord(a.navClicks, b.navClicks),
    scheduleDays: mergeMaxRecord(a.scheduleDays, b.scheduleDays),
    fixtureFilters: mergeMaxRecord(a.fixtureFilters, b.fixtureFilters),
    teamFichas: mergeMaxRecord(a.teamFichas, b.teamFichas),
    searchTerms: mergeMaxRecord(a.searchTerms, b.searchTerms),
    faqsOpened: mergeMaxRecord(a.faqsOpened, b.faqsOpened),
    byHour: mergeMaxRecord(a.byHour, b.byHour),
    byDay,
    activeVisitors,
    knownVisitors,
    engagedSessionIds,
    recentEvents,
    processedEventIds,
  }
}
