"use client"

import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Film,
  ImagePlus,
  Loader2,
  Upload,
  WifiOff,
  X,
} from "lucide-react"
import { DRIVE_FOLDER_URL, GOOGLE_SCRIPT_URL } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { trackEvent } from "@/lib/analytics"
import { useOnline } from "@/lib/use-online"
import { cn, formatBytes } from "@/lib/utils"

type FileState = "pending" | "uploading" | "done" | "error"

interface QueuedFile {
  id: string
  file: File
  preview: string | null
  state: FileState
  uploader?: string
  autoUpload?: boolean
  error?: string
}

interface StoredQueueRecord {
  id: string
  file: File
  uploader: string
  autoUpload: boolean
  createdAt: number
}

const DB_NAME = "encuentro-uploads-db"
const STORE_NAME = "queue"

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB no disponible"))
      return
    }
    const req = window.indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function readStoredQueue(): Promise<StoredQueueRecord[]> {
  try {
    const db = await openQueueDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => {
        const records = (req.result as StoredQueueRecord[]) || []
        records.sort((a, b) => a.createdAt - b.createdAt)
        resolve(records)
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

async function saveStoredRecords(records: StoredQueueRecord[]) {
  if (!records.length) return
  try {
    const db = await openQueueDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      records.forEach((rec) => store.put(rec))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Modo privado o cuota llena: la cola en memoria sigue funcionando.
  }
}

async function deleteStoredRecord(id: string) {
  try {
    const db = await openQueueDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Ignorar si IndexedDB no está disponible.
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || "")
      resolve(result.includes(",") ? result.split(",")[1] : result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function uploadToDrive(file: File, uploader: string) {
  const base64 = await fileToBase64(file)
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    // text/plain evita el preflight CORS que Apps Script no soporta.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64,
      uploader,
    }),
  })
  const raw = await response.text()
  let result: { ok: boolean; error?: string }
  try {
    result = JSON.parse(raw)
  } catch {
    throw new Error("El servicio de subida no respondió correctamente.")
  }
  if (!result.ok) throw new Error(result.error || "No se pudo subir el archivo.")
}

export function PhotoUpload() {
  const isOnline = useOnline()
  const [name, setName] = useState("")
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [offlineQueuedNotice, setOfflineQueuedNotice] = useState<number | null>(null)
  const [summary, setSummary] = useState<{ ok: number; failed: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef(queue)
  const busyRef = useRef(false)
  queueRef.current = queue

  // Libera las vistas previas al desmontar.
  useEffect(() => {
    return () => queueRef.current.forEach((q) => q.preview && URL.revokeObjectURL(q.preview))
  }, [])

  // Restaura archivos pendientes guardados en IndexedDB al abrir la app.
  useEffect(() => {
    let active = true
    readStoredQueue().then((records) => {
      if (!active || !records.length) return
      const restored: QueuedFile[] = records.map((rec) => ({
        id: rec.id,
        file: rec.file,
        preview: rec.file.type.startsWith("image/") ? URL.createObjectURL(rec.file) : null,
        state: "pending",
        uploader: rec.uploader,
        autoUpload: rec.autoUpload,
      }))
      setQueue(restored)
      const firstUploader = records.find((r) => r.uploader)?.uploader
      if (firstUploader) setName((prev) => prev || firstUploader)
      const autoCount = records.filter((r) => r.autoUpload).length
      if (autoCount > 0 && !window.navigator.onLine) {
        setOfflineQueuedNotice(autoCount)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const valid = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      )
      if (!valid.length) return
      setSummary(null)
      setOfflineQueuedNotice(null)
      const now = Date.now()
      const nextItems: QueuedFile[] = valid.map((file, idx) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        state: "pending" as const,
        uploader: name.trim(),
        autoUpload: false,
      }))
      setQueue((prev) => [...prev, ...nextItems])
      saveStoredRecords(
        nextItems.map((item, idx) => ({
          id: item.id,
          file: item.file,
          uploader: name.trim(),
          autoUpload: false,
          createdAt: now + idx,
        }))
      )
    },
    [name]
  )

  const removeFile = (id: string) => {
    deleteStoredRecord(id)
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((q) => q.id !== id)
    })
  }

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    if (!busy) addFiles(e.dataTransfer.files)
  }

  const processUpload = useCallback(
    async (itemsToUpload: QueuedFile[]) => {
      if (!itemsToUpload.length || busyRef.current) return

      const uploader = name.trim()
      if (!window.navigator.onLine) {
        const ids = new Set(itemsToUpload.map((it) => it.id))
        setQueue((prev) =>
          prev.map((q) => (ids.has(q.id) ? { ...q, autoUpload: true, uploader: uploader || q.uploader } : q))
        )
        await saveStoredRecords(
          itemsToUpload.map((it, idx) => ({
            id: it.id,
            file: it.file,
            uploader: uploader || it.uploader || "",
            autoUpload: true,
            createdAt: Date.now() + idx,
          }))
        )
        setSummary(null)
        setOfflineQueuedNotice(itemsToUpload.length)
        trackEvent("photo_upload_offline_queue", { count: itemsToUpload.length })
        return
      }

      busyRef.current = true
      setBusy(true)
      setSummary(null)
      setOfflineQueuedNotice(null)
      let ok = 0
      let failed = 0

      for (const item of itemsToUpload) {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, state: "uploading", error: undefined } : q))
        )
        try {
          await uploadToDrive(item.file, uploader || item.uploader || "")
          ok++
          await deleteStoredRecord(item.id)
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, state: "done" } : q)))
        } catch (err) {
          if (!window.navigator.onLine) {
            await saveStoredRecords([
              {
                id: item.id,
                file: item.file,
                uploader: uploader || item.uploader || "",
                autoUpload: true,
                createdAt: Date.now(),
              },
            ])
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, state: "pending", autoUpload: true } : q))
            )
            setOfflineQueuedNotice((c) => (c ?? 0) + 1)
          } else {
            failed++
            const message = err instanceof Error ? err.message : "Error desconocido"
            setQueue((prev) =>
              prev.map((q) =>
                q.id === item.id ? { ...q, state: "error", autoUpload: false, error: message } : q
              )
            )
          }
        }
      }

      // Quitamos de la lista los que ya subieron bien; quedan solo los fallidos o pendientes offline.
      setQueue((prev) => {
        prev.filter((q) => q.state === "done").forEach((q) => q.preview && URL.revokeObjectURL(q.preview))
        return prev.filter((q) => q.state !== "done")
      })
      if (ok > 0 || failed > 0) setSummary({ ok, failed })
      if (ok > 0) trackEvent("photo_upload_success", { count: ok })
      busyRef.current = false
      setBusy(false)
    },
    [name]
  )

  // Al volver la conexión, sube automáticamente los archivos en cola marcados para envío.
  useEffect(() => {
    if (!isOnline || busyRef.current) return
    const pendingAuto = queue.filter(
      (q) => q.autoUpload && (q.state === "pending" || q.state === "error")
    )
    if (pendingAuto.length > 0) {
      processUpload(pendingAuto)
    }
  }, [isOnline, queue, processUpload])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const pending = queue.filter((q) => q.state === "pending" || q.state === "error")
    await processUpload(pending)
  }

  const pendingCount = queue.filter((q) => q.state !== "done").length
  const doneCount = queue.filter((q) => q.state === "done").length
  const total = queue.length
  const progress = busy && total ? Math.round((doneCount / total) * 100) : 0

  return (
    <section id="fotos" className="scroll-mt-16 bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <SectionHeading
            eyebrow="Álbum compartido"
            title="Fotos y videos del Encuentro"
            description="Subí tus mejores momentos directo al álbum oficial en Google Drive, sin salir de la página. Podés elegir varios archivos a la vez."
          />
          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("photo_drive_open")}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3.5 font-bold text-ink ring-1 ring-ink/15 transition hover:ring-ink"
          >
            <ExternalLink className="h-5 w-5" />
            Ver álbum en Google Drive
          </a>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-6 rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-ink/10 sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="uploader-name" className="text-sm font-bold text-ink">
              Tu nombre o equipo <span className="font-normal text-ink/50">(opcional)</span>
            </label>
            <input
              id="uploader-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Toros XV / Familia Gómez"
              disabled={busy}
              className="h-12 rounded-xl bg-white px-4 text-ink outline-none ring-1 ring-ink/10 transition placeholder:text-ink/40 focus:ring-2 focus:ring-brand disabled:opacity-60"
            />
          </div>

          <input
            ref={inputRef}
            id="file-input"
            type="file"
            multiple
            accept="image/*,video/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <label
            htmlFor="file-input"
            onDragOver={(e) => {
              e.preventDefault()
              if (!busy) setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              busy
                ? "cursor-not-allowed border-ink/15 opacity-60"
                : dragging
                  ? "cursor-copy border-brand bg-brand/5"
                  : "cursor-pointer border-ink/20 hover:border-brand hover:bg-brand/5"
            )}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
              <ImagePlus className="h-7 w-7" />
            </span>
            <span className="font-display text-xl font-bold uppercase text-ink">
              Elegí fotos o videos
            </span>
            <span className="text-sm text-ink/55">
              Tocá para abrir tu galería o arrastrá los archivos acá
            </span>
          </label>

          {queue.length > 0 && (
            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {queue.map((q) => (
                <li
                  key={q.id}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl bg-paper ring-1",
                    q.state === "error" ? "ring-2 ring-berry" : "ring-ink/10"
                  )}
                  title={q.error ? `${q.file.name}: ${q.error}` : q.file.name}
                >
                  {q.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={q.preview} alt={q.file.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-ink/60">
                      <Film className="h-7 w-7" />
                      <span className="line-clamp-2 break-all text-center text-[10px]">{q.file.name}</span>
                    </div>
                  )}

                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-1.5 pb-1 pt-4 text-[10px] font-semibold text-white">
                    {formatBytes(q.file.size)}
                  </span>

                  {q.state === "uploading" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/50">
                      <Loader2 className="h-7 w-7 animate-spin text-white" />
                    </span>
                  )}
                  {q.state === "done" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-lime/70">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </span>
                  )}
                  {q.state === "error" && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-berry p-0.5 text-white">
                      <AlertCircle className="h-4 w-4" />
                    </span>
                  )}
                  {q.state === "pending" && q.autoUpload && (
                    <span
                      title="En espera de conexión"
                      className="absolute left-1.5 top-1.5 rounded-full bg-brand p-1 text-white shadow"
                    >
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {!busy && (
                    <button
                      type="button"
                      onClick={() => removeFile(q.id)}
                      aria-label={`Quitar ${q.file.name}`}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white transition hover:bg-berry"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {busy && (
            <div className="flex flex-col gap-2" role="status">
              <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand via-sky to-lime transition-all duration-500"
                  style={{ width: `${Math.max(progress, 6)}%` }}
                />
              </div>
              <p className="text-center text-sm text-ink/65">
                Subiendo {Math.min(doneCount + 1, total)} de {total}… No cierres la página.
              </p>
            </div>
          )}

          {(!isOnline || offlineQueuedNotice) && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl bg-brand/10 p-4 text-sm text-ink"
            >
              <WifiOff className="h-5 w-5 shrink-0 text-brand" />
              <p>
                {offlineQueuedNotice
                  ? `Sin conexión: ${
                      offlineQueuedNotice === 1
                        ? "1 archivo quedó guardado"
                        : `${offlineQueuedNotice} archivos quedaron guardados`
                    } en tu teléfono y se subirán automáticamente en cuanto vuelva internet.`
                  : "Estás sin conexión: podés elegir tus fotos o videos ahora y guardarlos en cola para que se suban automáticamente cuando vuelva internet."}
              </p>
            </div>
          )}

          {summary && (
            <div
              role="status"
              className={cn(
                "flex items-start gap-3 rounded-xl p-4 text-sm",
                summary.failed ? "bg-berry/10 text-ink" : "bg-lime/15 text-ink"
              )}
            >
              {summary.failed ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-berry" />
              ) : (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-lime" />
              )}
              <p>
                {summary.ok > 0 &&
                  `¡Listo! ${summary.ok === 1 ? "Se subió 1 archivo" : `Se subieron ${summary.ok} archivos`} al álbum del Encuentro. `}
                {summary.failed > 0 &&
                  `${summary.failed === 1 ? "1 archivo no se pudo subir" : `${summary.failed} archivos no se pudieron subir`}: quedaron marcados en rojo para reintentar, o podés subirlos desde la carpeta de Drive.`}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={pendingCount === 0 || busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-ink/25"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {busy
              ? "Subiendo…"
              : pendingCount > 0
                ? isOnline
                  ? `Subir ${pendingCount} ${pendingCount === 1 ? "archivo" : "archivos"}`
                  : `Guardar ${pendingCount} ${pendingCount === 1 ? "archivo" : "archivos"} para subir con red`
                : "Subir archivos"}
          </button>
        </form>
      </div>
    </section>
  )
}

