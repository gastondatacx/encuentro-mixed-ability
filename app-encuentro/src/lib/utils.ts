import { EVENT, schedule, type ScheduleDay, type ScheduleItem } from "@/data/encuentro"

/** Une clases condicionales sin dependencias externas. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function toDate(date: string, time: string) {
  return new Date(`${date}T${time}:00${EVENT.timezoneOffset}`)
}

export interface TimedItem extends ScheduleItem {
  startsAt: Date
  endsAt: Date
}

/** Calcula inicio/fin real de cada actividad (si no hay fin, dura hasta la siguiente). */
export function withTimes(day: ScheduleDay): TimedItem[] {
  return day.items.map((item, i) => {
    const startsAt = toDate(day.date, item.start)
    const next = day.items[i + 1]
    const endsAt = item.end
      ? toDate(day.date, item.end)
      : next
        ? toDate(day.date, next.start)
        : toDate(day.date, "23:59")
    return { ...item, startsAt, endsAt }
  })
}

export type ItemStatus = "past" | "live" | "upcoming"

export function statusOf(item: TimedItem, now: Date): ItemStatus {
  if (now >= item.endsAt) return "past"
  if (now >= item.startsAt) return "live"
  return "upcoming"
}

/** Día que conviene mostrar primero: el de hoy si hay evento, si no el primero. */
export function defaultDayId(now: Date) {
  const today = schedule.find((d) => {
    const items = withTimes(d)
    return now < items[items.length - 1].endsAt && now >= toDate(d.date, "00:00")
  })
  return (today ?? schedule[0]).id
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Quita tildes para búsquedas tolerantes ("cordoba" encuentra "CÓRDOBA"). */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

