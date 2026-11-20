import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { ANALYTICS_PIN, GOOGLE_SCRIPT_URL } from "@/data/encuentro"
import {
  applyEventsToSnapshot,
  createEmptySnapshot,
  mergeSnapshots,
  normalizeSnapshot,
  type AnalyticsEventItem,
  type AnalyticsSnapshot,
} from "@/lib/analytics-schema"

export const dynamic = "force-dynamic"

const SERVER_CACHE_FILE = path.join(os.tmpdir(), "encuentro-analytics-2026.json")
const DRIVE_TIMEOUT_MS = 6000

const globalForAnalytics = globalThis as typeof globalThis & {
  __encuentroAnalyticsSnapshot?: AnalyticsSnapshot
}

async function readServerSnapshot(): Promise<AnalyticsSnapshot> {
  if (globalForAnalytics.__encuentroAnalyticsSnapshot) {
    return globalForAnalytics.__encuentroAnalyticsSnapshot
  }
  try {
    const raw = await fs.readFile(SERVER_CACHE_FILE, "utf8")
    const parsed = normalizeSnapshot(JSON.parse(raw))
    globalForAnalytics.__encuentroAnalyticsSnapshot = parsed
    return parsed
  } catch {
    const empty = createEmptySnapshot()
    globalForAnalytics.__encuentroAnalyticsSnapshot = empty
    return empty
  }
}

async function writeServerSnapshot(snapshot: AnalyticsSnapshot): Promise<void> {
  const normalized = normalizeSnapshot(snapshot)
  globalForAnalytics.__encuentroAnalyticsSnapshot = normalized
  try {
    await fs.writeFile(SERVER_CACHE_FILE, JSON.stringify(normalized), "utf8")
  } catch {
    // En entornos de solo lectura la caché en memoria sigue activa.
  }
}

interface DriveResponse {
  ok?: boolean
  analyticsReady?: boolean
  analytics?: unknown
}

async function fetchDriveAnalytics(): Promise<{ connected: boolean; snapshot: AnalyticsSnapshot | null }> {
  if (!GOOGLE_SCRIPT_URL) return { connected: false, snapshot: null }
  try {
    const separator = GOOGLE_SCRIPT_URL.includes("?") ? "&" : "?"
    const res = await fetch(`${GOOGLE_SCRIPT_URL}${separator}action=analytics`, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
    })
    if (!res.ok) return { connected: false, snapshot: null }
    const data = (await res.json()) as DriveResponse
    if (data?.ok && data.analyticsReady && data.analytics) {
      return { connected: true, snapshot: normalizeSnapshot(data.analytics) }
    }
    return { connected: false, snapshot: null }
  } catch {
    return { connected: false, snapshot: null }
  }
}

async function postDriveAnalytics(
  payload: Record<string, unknown>
): Promise<{ connected: boolean; snapshot: AnalyticsSnapshot | null }> {
  if (!GOOGLE_SCRIPT_URL) return { connected: false, snapshot: null }
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS),
    })
    if (!res.ok) return { connected: false, snapshot: null }
    const data = (await res.json()) as DriveResponse
    if (data?.ok && data.analyticsReady && data.analytics) {
      return { connected: true, snapshot: normalizeSnapshot(data.analytics) }
    }
    return { connected: false, snapshot: null }
  } catch {
    return { connected: false, snapshot: null }
  }
}

async function readAppsScriptSource(): Promise<string | null> {
  try {
    return await fs.readFile(
      path.join(process.cwd(), "scripts", "google-apps-script-drive.js"),
      "utf8"
    )
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const includeScript = request.nextUrl.searchParams.get("includeScript") === "1"
  const [serverSnap, driveResult, scriptSource] = await Promise.all([
    readServerSnapshot(),
    fetchDriveAnalytics(),
    includeScript ? readAppsScriptSource() : Promise.resolve(null),
  ])

  let finalSnapshot = serverSnap
  if (driveResult.connected && driveResult.snapshot) {
    finalSnapshot = mergeSnapshots(serverSnap, driveResult.snapshot)
    await writeServerSnapshot(finalSnapshot)
  }

  return NextResponse.json(
    {
      ok: true,
      driveConnected: driveResult.connected,
      snapshot: finalSnapshot,
      ...(includeScript && scriptSource ? { scriptSource } : {}),
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function POST(request: NextRequest) {
  let body: {
    action?: string
    pin?: string
    events?: AnalyticsEventItem[]
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 })
  }

  if (body.action === "auth") {
    const valid = typeof body.pin === "string" && body.pin.trim() === ANALYTICS_PIN
    return NextResponse.json({ ok: valid }, { status: valid ? 200 : 401 })
  }

  if (body.action === "track") {
    const events = Array.isArray(body.events) ? body.events.slice(0, 100) : []
    if (!events.length) {
      const current = await readServerSnapshot()
      return NextResponse.json({ ok: true, driveConnected: false, snapshot: current })
    }

    const current = await readServerSnapshot()
    const updatedLocal = applyEventsToSnapshot(current, events)
    await writeServerSnapshot(updatedLocal)

    const driveTrack = await postDriveAnalytics({
      action: "analytics_track",
      events,
      snapshot: updatedLocal,
    })

    let finalSnapshot = updatedLocal
    if (driveTrack.connected && driveTrack.snapshot) {
      finalSnapshot = mergeSnapshots(updatedLocal, driveTrack.snapshot)
      await writeServerSnapshot(finalSnapshot)
    }

    return NextResponse.json({
      ok: true,
      driveConnected: driveTrack.connected,
      snapshot: finalSnapshot,
    })
  }

  return NextResponse.json({ ok: false, error: "Acción no soportada" }, { status: 400 })
}
