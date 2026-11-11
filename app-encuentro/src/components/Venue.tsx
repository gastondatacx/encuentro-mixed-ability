import { Ambulance, Car, Clock, Droplets, MapPin, Mic, Navigation, Ticket } from "lucide-react"
import { VENUE, logistics } from "@/data/encuentro"
import { SectionHeading } from "@/components/SectionHeading"

const LOGISTICS_ICONS = {
  hidratacion: { icon: Droplets, color: "bg-sky" },
  reloj: { icon: Clock, color: "bg-tangerine" },
  medica: { icon: Ambulance, color: "bg-berry" },
  audio: { icon: Mic, color: "bg-grape" },
} as const

export function Venue() {
  return (
    <section id="sede" className="scroll-mt-16 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Sede oficial"
          title={VENUE.name}
          description={`${VENUE.address} · ${VENUE.neighborhood}`}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 rounded-2xl bg-paper p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold uppercase text-ink">Dirección</p>
                <p className="text-ink/70">
                  {VENUE.address}, {VENUE.neighborhood}.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-paper p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime text-white">
                <Ticket className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold uppercase text-ink">Entrada libre</p>
                <p className="text-ink/70">{VENUE.entry}.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-paper p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tangerine text-white">
                <Car className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold uppercase text-ink">Estacionamiento</p>
                <p className="text-ink/70">{VENUE.parking}.</p>
              </div>
            </div>

            <a
              href={VENUE.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
            >
              <Navigation className="h-5 w-5" />
              Cómo llegar
            </a>
          </div>

          <div className="min-h-[340px] overflow-hidden rounded-3xl ring-1 ring-ink/10">
            <iframe
              title={`Mapa de ${VENUE.name}`}
              src={VENUE.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full min-h-[340px] w-full border-0"
            />
          </div>
        </div>

        {/* Logística */}
        <div className="mt-16">
          <h3 className="mb-6 font-display text-3xl font-extrabold uppercase text-ink">
            Logística y seguridad
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {logistics.map((item) => {
              const { icon: Icon, color } = LOGISTICS_ICONS[item.id]
              return (
                <li key={item.id} className="rounded-2xl p-5 ring-1 ring-ink/10">
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white ${color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-xl font-bold uppercase text-ink">{item.title}</p>
                  <p className="mt-1 text-[15px] text-ink/65">{item.description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
