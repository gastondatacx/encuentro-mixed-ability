import { Mail, MessageCircle } from "lucide-react"
import { CONTACT, EVENT, VENUE } from "@/data/encuentro"
import { Mosaic } from "@/components/Mosaic"

export function Contact() {
  return (
    <footer id="contacto" className="relative scroll-mt-16 overflow-hidden bg-ink pb-32 pt-20 text-white md:pb-12">
      <Mosaic
        cols={8}
        rows={6}
        seed={7}
        fade="right"
        className="pointer-events-none absolute -left-10 top-0 h-full w-[60%] opacity-20"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-sky">
              <span className="h-2.5 w-2.5 rotate-45 bg-current" aria-hidden="true" />
              Contacto oficial
            </p>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
              ¿Dudas? Escribinos
            </h2>
            <p className="mt-3 max-w-md text-white/70">
              Canales directos con la organización del Encuentro.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-6 py-4 font-bold text-ink transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp {CONTACT.whatsappLabel}
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-4 font-bold text-ink transition hover:bg-sky hover:text-white"
            >
              <Mail className="h-5 w-5" />
              {CONTACT.email}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:justify-between">
          <p>
            {EVENT.edition} {EVENT.name} · {EVENT.city} {EVENT.year}
          </p>
          <p>
            {VENUE.name} · {EVENT.sports.join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  )
}

