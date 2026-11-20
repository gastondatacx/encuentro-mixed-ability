/**
 * Fuente única de verdad del sitio: todo el contenido editable vive acá.
 * Para cambiar horarios, equipos o contactos no hace falta tocar componentes.
 */

export interface Team {
  name: string
  logo: string
  initials: string
  ficha?: string
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
  participants: "+1200",
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
  { name: "ALBATROS MIX", logo: "/logos/albatros-mix.png", initials: "AL", ficha: "/fichas/albatros-mix.jpg" },
  { name: "ARCOIRIS", logo: "/logos/arcoiris.png", initials: "AR", ficha: "/fichas/arcoiris.jpg" },
  { name: "ARDILLAS MIXED", logo: "/logos/ardillas-mixed.png", initials: "AM", ficha: "/fichas/ardillas-mixed.jpg" },
  { name: "ATLÉTICO DEL ROSARIO", logo: "/logos/atletico-del-rosario.png", initials: "ADR", ficha: "/fichas/atletico-del-rosario.jpg" },
  { name: "BARBARIANS ARGENTINA MIXED", logo: "/logos/barbarians-argentina-mixed.png", initials: "BAM", ficha: "/fichas/barbarians-argentina-mixed.jpg" },
  { name: "CABURÉ HOCKEY", logo: "/logos/cabure-hockey.png", initials: "CH", ficha: "/fichas/cabure-hockey.jpg" },
  { name: "CABURÉ RUGBY", logo: "/logos/cabure-rugby.png", initials: "CR", ficha: "/fichas/cabure-rugby.jpg" },
  { name: "CEBRAS MIX", logo: "/logos/cebras-mix.png", initials: "CM", ficha: "/fichas/cebras-mix.jpg" },
  { name: "CENTRO NAVAL", logo: "/logos/centro-naval.png", initials: "CN", ficha: "/fichas/centro-naval.jpg" },
  { name: "COIRONES XV", logo: "/logos/coirones-xv.png", initials: "CXV", ficha: "/fichas/coirones-xv.jpg" },
  { name: "CÓRDOBA ATHLETIC", logo: "/logos/cordoba-athletic.png", initials: "CA", ficha: "/fichas/cordoba-athletic.jpg" },
  { name: "CÓRDOBA MIX", logo: "/logos/cordoba-mix.png", initials: "CM" },
  { name: "CUYIS", logo: "/logos/cuyis.png", initials: "CU", ficha: "/fichas/cuyis.jpg" },
  { name: "DEL SUR RUGBY INCLUSIVO", logo: "/logos/del-sur-rugby-inclusivo.png", initials: "DSR", ficha: "/fichas/del-sur-rugby-inclusivo.jpg" },
  { name: "DEPORTIVA FRANCESA", logo: "/logos/deportiva-francesa.png", initials: "DF", ficha: "/fichas/deportiva-francesa.jpg" },
  { name: "DINOS XV", logo: "/logos/dinos-xv.png", initials: "DXV", ficha: "/fichas/dinos-xv.jpg" },
  { name: "HUALAS XV", logo: "/logos/hualas-xv.png", initials: "HXV", ficha: "/fichas/hualas-xv.jpg" },
  { name: "INKA XV", logo: "/logos/inka-xv.png", initials: "IXV", ficha: "/fichas/inka-xv.jpg" },
  { name: "LA PREMIX DEL LEÓN (BUENOS AIRES CRICKET & RUGBY CLUB)", logo: "/logos/la-premix-del-leon.png", initials: "BACRC", ficha: "/fichas/la-premix-del-leon.jpg" },
  { name: "LIONAS Y LIONES", logo: "/logos/lionas-y-liones.png", initials: "LYL", ficha: "/fichas/lionas-y-liones.jpg" },
  { name: "LOS HAKAS", logo: "/logos/monte-grande-los-hackas.png", initials: "LH", ficha: "/fichas/monte-grande-los-hackas.jpg" },
  { name: "LOS TATÚ RUGBY INCLUSIVO", logo: "/logos/los-tatu-rugby-inclusivo.png", initials: "LT", ficha: "/fichas/los-tatu-rugby-inclusivo.jpg" },
  { name: "LUCIÉRNAGAS", logo: "/logos/luciernagas.png", initials: "LU", ficha: "/fichas/luciernagas.jpg" },
  { name: "OLD RESIAN CLUB", logo: "/logos/old-resian-club.png", initials: "ORC", ficha: "/fichas/old-resian-club.jpg" },
  { name: "PUMPAS XV", logo: "/logos/pumpas-xv.png", initials: "PXV", ficha: "/fichas/pumpas-xv.jpg" },
  { name: "SAN AGUSTÍN XV", logo: "/logos/san-agustin-xv.png", initials: "SAXV", ficha: "/fichas/san-agustin-xv.jpg" },
  { name: "SAN JOSÉ XV", logo: "/logos/san-jose-xv.png", initials: "SJXV", ficha: "/fichas/san-jose-xv.jpg" },
  { name: "SANTA MÓNICA HOCKEY", logo: "/logos/santa-monica-hockey.png", initials: "SMH", ficha: "/fichas/santa-monica-hockey.jpg" },
  { name: "SOMOS ABEJAS MIX", logo: "/logos/somos-abejas-mix.png", initials: "SAM", ficha: "/fichas/somos-abejas-mix.jpg" },
  { name: "SUYAI", logo: "/logos/suyai.png", initials: "SU", ficha: "/fichas/suyai.jpg" },
  { name: "TORITOS XV", logo: "/logos/toritos-xv.png", initials: "TXV" },
  { name: "TOROS XV", logo: "/logos/toros-xv.png", initials: "TXV" },
  { name: "TÓTEM XV", logo: "/logos/totem-xv.png", initials: "TXV", ficha: "/fichas/totem-xv.jpg" },
  { name: "UBUNTU", logo: "/logos/ubuntu.png", initials: "UB", ficha: "/fichas/ubuntu.jpg" },
  { name: "UNIDOS MIX ABILITY", logo: "/logos/unidos-mix-ability.png", initials: "UMA", ficha: "/fichas/unidos-mix-ability.jpg" },
  { name: "USAPUCAS XV", logo: "/logos/usapucas-xv.png", initials: "UXV", ficha: "/fichas/usapucas-xv.jpg" },
  { name: "VOLUNTARIOS - NACIONAL", logo: "/logos/voluntarios-nacional.png", initials: "VN" },
  { name: "YUCHANES XV", logo: "/logos/yuchanes-xv.png", initials: "YXV", ficha: "/fichas/yuchanes-xv.jpg" },
]

export interface FixtureSlotA {
  time: string
  cancha1: string
  cancha4: string
}

export interface FixtureBlockA {
  id: string
  title: string
  hours: string
  slots: FixtureSlotA[]
}

export interface FixtureSlotB {
  time: string
  cancha2a: string
  cancha2b: string
  cancha3a: string
  cancha3b: string
}

export interface FixtureRoundB {
  id: string
  title: string
  hours: string
  zones: {
    cancha2a: string
    cancha2b: string
    cancha3a: string
    cancha3b: string
  }
  slots: FixtureSlotB[]
}

export interface FaqItem {
  question: string
  answer: string
}

export const schedule: ScheduleDay[] = [
  {
    id: "sabado",
    date: "2026-11-21",
    weekday: "Sábado",
    dayLabel: "Día 1",
    tag: "La bienvenida",
    title: "Apertura y recepción de delegaciones",
    subtitle: "Acreditaciones, desfile inaugural, espectáculo y ágape de bienvenida",
    items: [
      {
        start: "17:30",
        title: "Apertura del club y acreditaciones",
        description:
          "En Córdoba Rugby Club (Av. Juan B. Justo 6500), con dos ingresos señalados en el mapa. Al ingresar, el PADRINO/MADRINA junto con el COORDINADOR/A acreditan a cada inscripto y entregan las pulseras, el kit de bienvenida, los vouchers y las meriendas.",
      },
      {
        start: "18:00",
        title: "Merienda",
        description: "Comemos la merienda que fue entregada en el kit de bienvenida.",
      },
      {
        start: "18:30",
        title: "Desfile y presentación de delegaciones",
        description:
          "Desfila cada delegación en la cancha principal (Rugby 1), a medida que los anuncia la presentadora.",
      },
      {
        start: "19:30",
        title: "Espectáculo y música (Fiesta de bienvenida)",
        description: "Espectáculo de apertura con murga, baile y música en el escenario principal.",
      },
      {
        start: "20:00",
        end: "22:00",
        title: "Ágape de bienvenida",
        description:
          "En el comedor principal. Retira cada equipo con el voucher entregado durante la acreditación (cena informal estilo tapeo con opciones TACC/vegetarianas).",
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
    subtitle: "Dos bloques de partidos, ceremonia de cierre y Gran Fiesta Mixed Ability",
    items: [
      {
        start: "09:00",
        title: "Llegada al club y calentamiento",
        description:
          "Cada equipo busca su gazebo asignado en el sector de delegaciones para dejar sus pertenencias y comenzar el calentamiento.",
      },
      {
        start: "10:00",
        end: "12:55",
        title: "1ra ronda de partidos (Bloque Mañana)",
        description:
          "Partidos dinámicos y cortos con turnos cada 20 min en 2 canchas Pre Mix (Canchas 1 y 4) y 4 canchas Recreativo (Canchas 2a, 2b, 3a y 3b).",
      },
      {
        start: "12:30",
        end: "14:00",
        title: "Pausa Activa / Almuerzo",
        description:
          "Apenas terminan se dirigen al comedor para almorzar. Una sola persona por delegación retira todas las viandas juntas con el voucher entregado en la acreditación del sábado.",
      },
      {
        start: "14:00",
        end: "16:15",
        title: "2da ronda de partidos · Definiciones y últimos partidos",
        description:
          "Bloque tarde en Categoría A Pre Mix (14:00 a 16:15 hs) y Categoría B Recreativo Fechas 4 y 5 (14:00 a 16:00 hs).",
      },
      {
        start: "16:30",
        end: "19:30",
        title: "Descanso / Duchas / Vuelta al hotel",
        description:
          "Los equipos quedan liberados para regresar al hotel, ducharse y prepararse para la noche. También pueden ducharse en el Club por orden de llegada.",
      },
      {
        start: "19:30",
        title: "Ceremonia de cierre",
        description:
          "Entrega de medallas, diplomas e intercambio de presentes en el escenario principal. Subirá un representante por equipo para agilizar la ceremonia (sin discurso).",
      },
      {
        start: "20:30",
        title: "¡La Gran Fiesta Mixed Ability!",
        description: "Cena formal de cierre, banda en vivo, DJ y baile.",
        highlight: true,
      },
    ],
  },
]

export const fixtureMeta = {
  start: "10:00 hs",
  slotDuration: "Turnos cada 20 min",
  lunchBreak: "Pausa Almuerzo: 12:30 a 14:00 hs",
  distribution: "2 Canchas Pre Mix y 4 Canchas Recreativo",
} as const

export const fixtureCategoryA: FixtureBlockA[] = [
  {
    id: "cat-a-manana",
    title: "Bloque Mañana",
    hours: "10:00 a 12:55 hs",
    slots: [
      { time: "10:00", cancha1: "TOROS XV A vs PUMPAS XV A", cancha4: "Atl. del Rosario A vs Centro Naval A" },
      { time: "10:20", cancha1: "Los Tatú A vs Dinos A", cancha4: "Tótem A vs Yuchanes A" },
      { time: "10:40", cancha1: "TOROS XV A vs Centro Naval A", cancha4: "Atl. del Rosario A vs PUMPAS XV A" },
      { time: "11:00", cancha1: "Barbarians vs Barbarians XV", cancha4: "Inka A vs Centro Naval A" },
      { time: "11:20", cancha1: "San Agustín A vs Cuyis A", cancha4: "Del Sur A vs San José A" },
      { time: "11:40", cancha1: "Los Tatú A vs Yuchanes A", cancha4: "Hualas A vs Dinos A" },
      { time: "12:00", cancha1: "Barbarians vs Barbarians XV", cancha4: "San Agustín A vs San José A" },
      { time: "12:20", cancha1: "TOROS XV A vs Inka A", cancha4: "Albatros A vs Cuyis A" },
      { time: "12:40", cancha1: "Los Tatú A vs Hualas A", cancha4: "Tótem A vs Dinos A" },
    ],
  },
  {
    id: "cat-a-tarde",
    title: "Bloque Tarde",
    hours: "14:00 a 16:15 hs",
    slots: [
      { time: "14:00", cancha1: "San Agustín A vs Albatros A", cancha4: "Del Sur A vs Cuyis A" },
      { time: "14:20", cancha1: "PUMPAS XV A vs Inka A", cancha4: "TOROS XV A vs Atl. del Rosario A" },
      { time: "14:40", cancha1: "Yuchanes A vs Hualas A", cancha4: "Los Tatú A vs Tótem A" },
      { time: "15:00", cancha1: "San José A vs Albatros A", cancha4: "San Agustín A vs Del Sur A" },
      { time: "15:20", cancha1: "PUMPAS XV A vs Centro Naval A", cancha4: "Atl. del Rosario A vs Inka A" },
      { time: "15:40", cancha1: "Yuchanes XV A vs Dinos A", cancha4: "Tótem A vs Hualas A" },
      { time: "16:00", cancha1: "San José A vs Cuyis A", cancha4: "Del Sur A vs Albatros A" },
    ],
  },
]

export const fixtureCategoryB: FixtureRoundB[] = [
  {
    id: "fecha-1",
    title: "Fecha 1 — Bloque Mañana",
    hours: "10:00 a 10:55 hs",
    zones: {
      cancha2a: "Rec. Z1",
      cancha2b: "Rec. Z2",
      cancha3a: "Rec. Z3",
      cancha3b: "Rec. Z4",
    },
    slots: [
      {
        time: "10:00",
        cancha2a: "La Premix León B vs Hualas XV B",
        cancha2b: "Los Hakas (Monte Grande) B vs Toros XV B",
        cancha3a: "Unidos vs Depo Francesa",
        cancha3b: "PUMPAS XV B vs San Agustín B",
      },
      {
        time: "10:20",
        cancha2a: "Caburé B vs CÓRDOBA MIX B",
        cancha2b: "Ardillas Mixed B vs Usapucas XV B",
        cancha3a: "CEBRAS/Tucumán vs INKA XV B",
        cancha3b: "Yuchanes XV B vs San José XV B",
      },
      {
        time: "10:40",
        cancha2a: "Cuyis B vs Old Resian Club B",
        cancha2b: "UBUNTU B vs Somos Abejas B",
        cancha3a: "Toritos XV B vs Tótem XV B",
        cancha3b: "COIRONES XV B vs Albatros B",
      },
    ],
  },
  {
    id: "fecha-2",
    title: "Fecha 2 — Bloque Mañana",
    hours: "11:00 a 11:55 hs",
    zones: {
      cancha2a: "Rec. Z2",
      cancha2b: "Rec. Z3",
      cancha3a: "Rec. Z4",
      cancha3b: "Rec. Z1",
    },
    slots: [
      {
        time: "11:00",
        cancha2a: "Ardillas Mixed vs Toros XV B",
        cancha2b: "Unidos vs INKA XV B",
        cancha3a: "PUMPAS XV B vs San José XV B",
        cancha3b: "Caburé vs Hualas XV B",
      },
      {
        time: "11:20",
        cancha2a: "Usapucas XV B vs Somos Abejas B",
        cancha2b: "Depo Francesa vs Tótem XV B",
        cancha3a: "San Agustín B vs Albatros B",
        cancha3b: "CÓRDOBA MIX vs Old Resian Club B",
      },
      {
        time: "11:40",
        cancha2a: "Los Hakas (Monte Grande) B vs UBUNTU B",
        cancha2b: "CEBRAS/Tucumán vs Toritos XV B",
        cancha3a: "Yuchanes XV B vs COIRONES XV B",
        cancha3b: "La Premix León vs Cuyis B",
      },
    ],
  },
  {
    id: "fecha-3",
    title: "Fecha 3 — Bloque Mañana",
    hours: "12:00 a 12:55 hs",
    zones: {
      cancha2a: "Rec. Z3",
      cancha2b: "Rec. Z4",
      cancha3a: "Rec. Z1",
      cancha3b: "Rec. Z2",
    },
    slots: [
      {
        time: "12:00",
        cancha2a: "Unidos B vs Tótem XV B",
        cancha2b: "PUMPAS XV B vs Albatros B",
        cancha3a: "Caburé B vs Old Resian Club B",
        cancha3b: "Ardillas Mixed vs Somos Abejas B",
      },
      {
        time: "12:20",
        cancha2a: "INKA XV B vs Toritos XV B",
        cancha2b: "San José XV B vs COIRONES XV B",
        cancha3a: "Hualas XV B vs Cuyis B",
        cancha3b: "Toros XV B vs UBUNTU B",
      },
      {
        time: "12:40",
        cancha2a: "Depo Francesa B vs CEBRAS/Tucumán B",
        cancha2b: "San Agustín B vs Yuchanes XV B",
        cancha3a: "CÓRDOBA MIX B vs La Premix León B",
        cancha3b: "Usapucas XV B vs Los Hakas (Monte Grande) B",
      },
    ],
  },
  {
    id: "fecha-4",
    title: "Fecha 4 — Bloque Tarde",
    hours: "14:00 a 14:55 hs",
    zones: {
      cancha2a: "Rec. Z4",
      cancha2b: "Rec. Z1",
      cancha3a: "Rec. Z2",
      cancha3b: "Rec. Z3",
    },
    slots: [
      {
        time: "14:00",
        cancha2a: "PUMPAS XV B vs COIRONES XV B",
        cancha2b: "Hualas XV B vs CÓRDOBA MIX B",
        cancha3a: "Ardillas Mixed B vs UBUNTU B",
        cancha3b: "Unidos B vs Toritos XV B",
      },
      {
        time: "14:20",
        cancha2a: "Albatros B vs Yuchanes XV B",
        cancha2b: "Old Resian Club B vs La Premix León B",
        cancha3a: "Somos Abejas B vs Los Hakas (Monte Grande) B",
        cancha3b: "Tótem XV B vs CEBRAS/Tucumán B",
      },
      {
        time: "14:40",
        cancha2a: "San José XV B vs San Agustín B",
        cancha2b: "Caburé B vs Cuyis B",
        cancha3a: "Toros XV B vs Usapucas XV B",
        cancha3b: "INKA XV B vs Depo Francesa B",
      },
    ],
  },
  {
    id: "fecha-5",
    title: "Fecha 5 — Bloque Tarde",
    hours: "15:00 a 16:00 hs",
    zones: {
      cancha2a: "Rec. Z1",
      cancha2b: "Rec. Z2",
      cancha3a: "Rec. Z3",
      cancha3b: "Rec. Z4",
    },
    slots: [
      {
        time: "15:00",
        cancha2a: "Caburé B vs La Premix León B",
        cancha2b: "Ardillas Mixed B vs Los Hakas (Monte Grande) B",
        cancha3a: "Unidos B vs CEBRAS/Tucumán B",
        cancha3b: "PUMPAS XV B vs Yuchanes XV B",
      },
      {
        time: "15:20",
        cancha2a: "Cuyis B vs CÓRDOBA MIX B",
        cancha2b: "UBUNTU B vs Usapucas XV B",
        cancha3a: "Toritos XV B vs Depo Francesa B",
        cancha3b: "COIRONES XV B vs San Agustín B",
      },
      {
        time: "15:40",
        cancha2a: "Old Resian Club B vs Hualas XV B",
        cancha2b: "Somos Abejas B vs Toros XV B",
        cancha3a: "Tótem XV B vs INKA XV B",
        cancha3b: "San José XV B vs Albatros B",
      },
      {
        time: "16:00",
        cancha2a: "Libre (Fin Recreativo)",
        cancha2b: "Libre (Fin Recreativo)",
        cancha3a: "Libre (Fin Recreativo)",
        cancha3b: "Libre (Fin Recreativo)",
      },
    ],
  },
]

export const faqs: FaqItem[] = [
  {
    question: "¿Dónde dejo mis cosas?",
    answer:
      "En el gazebo asignado a tu equipo. Cada delegación contará con su propio espacio identificado en el sector de gazebos.",
  },
  {
    question: "¿Cómo retiro la vianda?",
    answer:
      "Una sola persona por delegación debe acercarse al comedor con el voucher del equipo para retirar todas las viandas juntas. ¡Importante: cuidalo y no lo pierdas!",
  },
  {
    question: "¿Qué hago si pierdo algo?",
    answer:
      "Acercate a pedir asistencia a la presentadora para que lo anuncie por micrófono. Además, enviale una foto o descripción detallada del objeto a tu madrina o padrino para ayudar en la búsqueda.",
  },
  {
    question: "¿Qué hago ante una emergencia médica?",
    answer:
      "El predio contará con ambulancias y personal médico disponibles en todo momento. Además, habrá una carpa de kinesiología para atender lesiones o molestias físicas que requieran asistencia.",
  },
  {
    question: "¿Qué comidas incluye la inscripción?",
    answer:
      "Incluye una merienda ligera al inicio del evento (sábado) y 3 comidas durante el encuentro. Los acompañantes no acreditados podrán comprar comida en los foodtrucks y en la cantina del club, o bien ingresar con su propia comida.",
  },
]

export const packingLists = {
  recommended: [
    "Protector solar",
    "Gorra (CON NOMBRE)",
    "Botella de agua (CON NOMBRE)",
    "Repelente de insectos",
    "Medicamentos personales en bolsa impermeable (CON NOMBRE)",
    "Mochila (CON NOMBRE)",
  ],
  allowed: [
    "Reposeras",
    "Mesas",
    "Equipo de mate",
    "Comida para los acompañantes (habrá foodtrucks y cantina del club)",
  ],
  prohibited: [
    "Mascotas",
    "Pirotecnia",
    "Bebidas alcohólicas",
    "Fumar cigarrillos",
  ],
} as const

export const weatherAlert = {
  title: "Precauciones por lluvias",
  intro: "En Córdoba hay alertas constantes por lluvias y es posible que llueva durante el Nacional.",
  tips: ["Lleven ropa adecuada", "Conduzcan con cuidado"],
  cancellationNote:
    "En caso de lluvias intensas el evento SE CANCELA debido a que las canchas no se podrían usar.",
  noticeChannel: "Si hay algún cambio o cancelación del evento se avisará por medio de la web y app oficiales.",
  offlineNote:
    "Es importante que instales la app ANTES de estar en el Club porque es posible que no haya señal debido a la gran cantidad de personas que asistirán.",
} as const

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
    description: "Sistema centralizado de sonido y parlantes regulador de decibeles con locutores mix.",
  },
] as const
