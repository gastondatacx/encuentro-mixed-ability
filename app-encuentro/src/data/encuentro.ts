/**
 * Fuente única de verdad del sitio: todo el contenido editable vive acá.
 * Para cambiar horarios, equipos o contactos no hace falta tocar componentes.
 */

export interface Team {
  name: string
  logo: string
  initials: string
}

export interface ScheduleItem {
  /** Hora de inicio en formato 24 h "HH:MM" (hora de Argentina). */
  start: string
  /** Hora de fin opcional "HH:MM". Si falta, dura hasta el próximo ítem. */
  end?: string
  title: string
  description: string
  highlight?: boolean
}

export interface ScheduleDay {
  id: string
  /** Fecha ISO "YYYY-MM-DD". */
  date: string
  weekday: string
  dayLabel: string
  tag: string
  title: string
  subtitle: string
  items: ScheduleItem[]
}

export const EVENT = {
  edition: "9º",
  name: "Encuentro Nacional Mixed Ability",
  shortName: "9º Encuentro 2026",
  city: "Córdoba",
  year: 2026,
  sports: ["Rugby", "Hockey", "Básquet"],
  datesLabel: "21 y 22 de noviembre",
  /** Comienzo y fin del evento con zona horaria de Argentina (UTC-3). */
  startsAt: "2026-11-21T17:30:00-03:00",
  endsAt: "2026-11-22T23:59:00-03:00",
  participants: "+650",
  timezoneOffset: "-03:00",
} as const

export const VENUE = {
  name: "Córdoba Rugby Club",
  address: "Av. Juan B. Justo 6500",
  neighborhood: "Barrio Liceo General Paz, Córdoba Capital",
  entry: "Entrada libre y gratuita para espectadores",
  parking: "Estacionamiento interno: $5.000",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=C%C3%B3rdoba%20Rugby%20Club,%20Avenida%20Juan%20B.%20Justo%206500,%20C%C3%B3rdoba&t=&z=15&ie=UTF8&iwloc=&output=embed",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=C%C3%B3rdoba%20Rugby%20Club%2C%20Avenida%20Juan%20B.%20Justo%206500%2C%20C%C3%B3rdoba",
} as const

export const CONTACT = {
  whatsappUrl: "https://wa.me/5493517684282",
  whatsappLabel: "351 768-4282",
  email: "infotorosxv@gmail.com",
} as const

export const GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxtPDT5xC5oZzhOQ8hHnj9TWeWJNFBNi8LjtmkRrrb9sryCykMpPSyyncIq_nArS2a-/exec"

export const DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1OjAiwQ9BVsGZWaRmrKlUh_log31TkHKS"

export const teams: Team[] = [
  { name: "ALBATROS MIX", logo: "/logos/albatros-mix.png", initials: "AL" },
  { name: "ARCOIRIS", logo: "/logos/arcoiris.png", initials: "AR" },
  { name: "ARDILLAS MIXED", logo: "/logos/ardillas-mixed.png", initials: "AM" },
  { name: "ATLÉTICO DEL ROSARIO", logo: "/logos/atletico-del-rosario.png", initials: "ADR" },
  { name: "BARBARIANS ARGENTINA MIXED", logo: "/logos/barbarians-argentina-mixed.png", initials: "BAM" },
  { name: "CABURÉ HOCKEY", logo: "/logos/cabure-hockey.png", initials: "CH" },
  { name: "CABURÉ RUGBY", logo: "/logos/cabure-rugby.png", initials: "CR" },
  { name: "CEBRAS MIX", logo: "/logos/cebras-mix.png", initials: "CM" },
  { name: "CENTRO NAVAL", logo: "/logos/centro-naval.png", initials: "CN" },
  { name: "COIRONES XV", logo: "/logos/coirones-xv.png", initials: "CXV" },
  { name: "CÓRDOBA ATHLETIC", logo: "/logos/cordoba-athletic.png", initials: "CA" },
  { name: "CÓRDOBA MIX", logo: "/logos/cordoba-mix.png", initials: "CM" },
  { name: "CUYIS", logo: "/logos/cuyis.png", initials: "CU" },
  { name: "DEL SUR RUGBY INCLUSIVO", logo: "/logos/del-sur-rugby-inclusivo.png", initials: "DSR" },
  { name: "DEPORTIVA FRANCESA", logo: "/logos/deportiva-francesa.png", initials: "DF" },
  { name: "DINOS XV", logo: "/logos/dinos-xv.png", initials: "DXV" },
  { name: "HUALAS XV", logo: "/logos/hualas-xv.png", initials: "HXV" },
  { name: "INKA XV", logo: "/logos/inka-xv.png", initials: "IXV" },
  { name: "LA PREMIX DEL LEÓN (BUENOS AIRES CRICKET & RUGBY CLUB)", logo: "/logos/la-premix-del-leon.png", initials: "BACRC" },
  { name: "LIONAS Y LIONES", logo: "/logos/lionas-y-liones.png", initials: "LYL" },
  { name: "LOS TATÚ RUGBY INCLUSIVO", logo: "/logos/los-tatu-rugby-inclusivo.png", initials: "LT" },
  { name: "LUCIÉRNAGAS", logo: "/logos/luciernagas.png", initials: "LU" },
  { name: "MONTE GRANDE RUGBY CLUB - LOS HACKAS", logo: "/logos/monte-grande-los-hackas.png", initials: "MGRC" },
  { name: "OLD RESIAN CLUB", logo: "/logos/old-resian-club.png", initials: "ORC" },
  { name: "PUMPAS XV", logo: "/logos/pumpas-xv.png", initials: "PXV" },
  { name: "SAN AGUSTÍN XV", logo: "/logos/san-agustin-xv.png", initials: "SAXV" },
  { name: "SAN JOSÉ XV", logo: "/logos/san-jose-xv.png", initials: "SJXV" },
  { name: "SANTA MÓNICA HOCKEY", logo: "/logos/santa-monica-hockey.png", initials: "SMH" },
  { name: "SOMOS ABEJAS MIX", logo: "/logos/somos-abejas-mix.png", initials: "SAM" },
  { name: "SUYAI", logo: "/logos/suyai.png", initials: "SU" },
  { name: "TOROS XS", logo: "/logos/toros-xs.png", initials: "TXS" },
  { name: "TOROS XV", logo: "/logos/toros-xv.png", initials: "TXV" },
  { name: "TÓTEM XV", logo: "/logos/totem-xv.png", initials: "TXV" },
  { name: "UBUNTU", logo: "/logos/ubuntu.png", initials: "UB" },
  { name: "UNIDOS MIX ABILITY", logo: "/logos/unidos-mix-ability.png", initials: "UMA" },
  { name: "USAPUCAS XV", logo: "/logos/usapucas-xv.png", initials: "UXV" },
  { name: "VOLUNTARIOS - NACIONAL", logo: "/logos/voluntarios-nacional.png", initials: "VN" },
  { name: "YUCHANES XV", logo: "/logos/yuchanes-xv.png", initials: "YXV" },
]

export const schedule: ScheduleDay[] = [
  {
    id: "sabado",
    date: "2026-11-21",
    weekday: "Sábado",
    dayLabel: "Día 1",
    tag: "La bienvenida",
    title: "Apertura y recepción de delegaciones",
    subtitle: "Acreditaciones, desfile inaugural y tercer tiempo",
    items: [
      {
        start: "17:30",
        title: "Apertura del club y acreditaciones",
        description: "Recepción de delegaciones en Córdoba Rugby Club. Entrega de kits.",
      },
      {
        start: "18:00",
        title: "Merienda",
        description: "Espacio de encuentro y merienda para las delegaciones.",
      },
      {
        start: "18:30",
        title: "Desfile y presentación de delegaciones",
        description: "Ingreso de equipos, banderas y palabras de bienvenida.",
      },
      {
        start: "19:00",
        title: "Charlas informativas y actividades recreativas",
        description: "Charlas informativas (profes) y actividades recreativas (jugadores/as).",
      },
      {
        start: "20:00",
        end: "22:00",
        title: "“Brunch” / Ágape de bienvenida",
        description: "Cena temprana informal estilo tapeo/pizzas (con opciones TACC/vegetarianas).",
      },
    ],
  },
  {
    id: "domingo",
    date: "2026-11-22",
    weekday: "Domingo",
    dayLabel: "Día 2",
    tag: "Acción y fiesta",
    title: "Jornada central de partidos y cierre",
    subtitle: "Competencia simultánea, ceremonia de premiación y Gran Fiesta Mixed Ability",
    items: [
      {
        start: "09:00",
        title: "Llegada al club y calentamiento",
        description: "Recepción en el club, ubicación en gazebos y entrada en calor.",
      },
      {
        start: "10:00",
        title: "Partidos",
        description: "Inicio de competencia simultánea. Partidos de 15 a 20 min.",
      },
      {
        start: "12:30",
        end: "13:30",
        title: "Pausa activa / Almuerzo",
        description: "Reparto de viandas nutritivas gestionado por logística.",
      },
      {
        start: "13:30",
        end: "16:00",
        title: "Definiciones y últimos partidos",
        description: "Cruces de integración, definiciones y últimos encuentros.",
      },
      {
        start: "16:00",
        end: "19:00",
        title: "Descanso / Vuelta al hotel",
        description: "Tiempo libre y regreso al hotel antes del gran cierre.",
      },
      {
        start: "19:00",
        title: "Ceremonia de cierre",
        description: "Entrega de medallas y reconocimientos especiales.",
      },
      {
        start: "20:30",
        title: "¡La Gran Fiesta Mixed Ability!",
        description:
          "Cena formal de cierre (sándwich de carne y verduras desmenuzado), banda en vivo, DJ y baile.",
        highlight: true,
      },
    ],
  },
]

export const logistics = [
  {
    id: "hidratacion",
    title: "Hidratación",
    description: "Postas fijas en cada sector con agua, hielo y sombra.",
  },
  {
    id: "reloj",
    title: "Voluntarios “Reloj”",
    description: "Coordinadores con cronómetro y señal sonora exclusiva.",
  },
  {
    id: "medica",
    title: "Seguridad médica",
    description:
      "Médicos, fisioterapeutas, paramédicos, ambulancia permanente y protocolo eléctrico.",
  },
  {
    id: "audio",
    title: "Audio oficial",
    description: "Sistema centralizado de sonido y parlantes con locutor oficial.",
  },
] as const
