"use client"

import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Film,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react"
import { DRIVE_FOLDER_URL, GOOGLE_SCRIPT_URL } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"
import { cn, formatBytes } from "@/lib/utils"

type FileState = "pending" | "uploading" | "done" | "error"

interface QueuedFile {
  id: string
  file: File
  preview: string | null
  state: FileState
  error?: string
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
  const [name, setName] = useState("")
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<{ ok: number; failed: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef(queue)
  queueRef.current = queue

  // Libera las vistas previas al desmontar.
  useEffect(() => {
    return () => queueRef.current.forEach((q) => q.preview && URL.revokeObjectURL(q.preview))
  }, [])

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    )
    if (!valid.length) return
    setSummary(null)
    setQueue((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        state: "pending" as const,
      })),
    ])
  }, [])

  const removeFile = (id: string) => {
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const pending = queue.filter((q) => q.state === "pending" || q.state === "error")
    if (!pending.length || busy) return

    setBusy(true)
    setSummary(null)
    let ok = 0
    let failed = 0

    for (const item of pending) {
      setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, state: "uploading", error: undefined } : q)))
      try {
        await uploadToDrive(item.file, name.trim())
        ok++
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, state: "done" } : q)))
      } catch (err) {
        failed++
        const message = err instanceof Error ? err.message : "Error desconocido"
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, state: "error", error: message } : q))
        )
      }
    }

    // Quitamos de la lista los que ya subieron bien; quedan solo los fallidos para reintentar.
    setQueue((prev) => {
      prev.filter((q) => q.state === "done").forEach((q) => q.preview && URL.revokeObjectURL(q.preview))
      return prev.filter((q) => q.state !== "done")
    })
    setSummary({ ok, failed })
    setBusy(false)
  }

  const pendingCount = queue.filter((q) => q.state !== "done").length
  const doneCount = queue.filter((q) => q.state === "done").length
  const total = queue.length
  const progress = busy && total ? Math.round((doneCount / total) * 100) : 0

  return (
    <section id="fotos" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.3fr]">
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
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-ink ring-2 ring-ink/15 transition hover:ring-ink"
          >
            <ExternalLink className="h-5 w-5" />
            Ver álbum en Google Drive
          </a>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-[0_30px_70px_-30px_rgba(11,22,64,0.35)] ring-1 ring-ink/10 sm:p-7"
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
              className="h-12 rounded-xl bg-paper px-4 text-ink outline-none ring-1 ring-ink/10 transition placeholder:text-ink/40 focus:ring-2 focus:ring-brand disabled:opacity-60"
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
                ? `Subir ${pendingCount} ${pendingCount === 1 ? "archivo" : "archivos"}`
                : "Subir archivos"}
          </button>
        </form>
      </div>
    </section>
  )
}

