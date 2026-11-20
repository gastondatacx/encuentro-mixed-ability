"use client"

import { useEffect, useState } from "react"
import {
  Ambulance,
  ArrowUpRight,
  Car,
  Cross,
  Droplets,
  Map as MapIcon,
  Maximize2,
  Mic,
  ShowerHead,
  Users,
  Utensils,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ZoneId =
  | "all"
  | "rugby-1"
  | "rugby-2-3"
  | "rugby-4"
  | "hockey"
  | "basquet"
  | "central"
  | "accesos"

type MapView = "official" | "schematic"

interface ZoneInfo {
  id: Exclude<ZoneId, "all">
  pillLabel: string
  title: string
  badge: string
  details: string
  services: string[]
}

const LEGEND_ITEMS = [
  { label: "Estacionamiento", icon: Car, color: "bg-brand" },
  { label: "Médico", icon: Cross, color: "bg-berry" },
  { label: "Ambulancia", icon: Ambulance, color: "bg-berry" },
  { label: "Escenario", icon: Mic, color: "bg-grape" },
  { label: "Comedor", icon: Utensils, color: "bg-tangerine" },
  { label: "Puesto hidratación", icon: Droplets, color: "bg-sky" },
  { label: "2 Ingresos", icon: ArrowUpRight, color: "bg-ink" },
  { label: "Duchas", icon: ShowerHead, color: "bg-tangerine" },
  { label: "Baños", icon: Users, color: "bg-tangerine" },
] as const

const ZONES: ZoneInfo[] = [
  {
    id: "rugby-1",
    pillLabel: "Rugby 1 + Postas",
    title: "Cancha Rugby 1 y Postas Rugby",
    badge: "Categoría A · Pre Mix · Desfile",
    details:
      "Cancha principal del predio, ubicada en el sector este sobre el acceso vehicular. Al norte limita con Postas Rugby y al oeste con la Mesa de Control, Carpa de artistas / Streaming, Escenario y Ambulancia.",
    services: ["Categoría A (Pre Mix)", "Postas Rugby", "Mesa de Control", "Carpa Streaming", "Ambulancia"],
  },
  {
    id: "rugby-2-3",
    pillLabel: "Rugby 2 y 3 (2a·2b·3a·3b)",
    title: "Canchas Rugby 2 (2a·2b) y Rugby 3 (3a·3b)",
    badge: "Categoría B · Recreativo (4 subcanchas)",
    details:
      "Sector oeste con dos canchas paralelas subdivididas en 4 subcanchas transversales de 40 m (2a, 2b, 3a y 3b) con retiros de 5 m y pasillo central. Entre ambas se ubican la Mesa de Control y un Puesto de Hidratación.",
    services: ["Canchas 2a, 2b, 3a y 3b", "Mesa de Control", "Puesto Hidratación", "Baños al noreste"],
  },
  {
    id: "rugby-4",
    pillLabel: "Rugby 4",
    title: "Cancha Rugby 4",
    badge: "Categoría A · Pre Mix · Sector Norte",
    details:
      "Cancha ubicada en el sector norte del club, con Mesa de Control y Puesto de Hidratación propios sobre su acceso sur.",
    services: ["Categoría A (Pre Mix)", "Mesa de Control", "Puesto Hidratación"],
  },
  {
    id: "hockey",
    pillLabel: "Hockey",
    title: "Cancha de Hockey",
    badge: "Sector Suroeste · Junto al ingreso",
    details:
      "Ubicada inmediatamente a la izquierda del ingreso principal por Av. Juan B. Justo 6500. Cuenta con Carpa de Autoridades al norte y Mesa de Control, Hidratación, Duchas y Baños sobre su frente sur.",
    services: ["Carpa Autoridades", "Mesa de Control", "Puesto Hidratación", "Duchas y Baños"],
  },
  {
    id: "basquet",
    pillLabel: "Básquet",
    title: "Cancha de Básquet",
    badge: "Sector Noreste · Edificio",
    details:
      "Sector de Básquet Mixed Ability ubicado en el complejo edilicio del noreste del predio, cruzando la calle interna hacia el norte de Rugby 1.",
    services: ["Básquet Mixed Ability", "Acceso por calle interna este"],
  },
  {
    id: "central",
    pillLabel: "Gazebos · Comedor · Escenario",
    title: "Corredor Central de Delegaciones y Servicios",
    badge: "Corazón del encuentro",
    details:
      "Eje central entre Rugby 2/3 y Rugby 1 donde se encuentran los Gazebos de todas las delegaciones, Baños, Médico / Kinesiología, Hidratación, Escenario principal, Comedor (retiro de viandas y ágape), Acreditaciones y Cantina.",
    services: ["Gazebos Delegaciones", "Acreditaciones", "Comedor", "Escenario", "Médico / Kinesiología", "Cantina"],
  },
  {
    id: "accesos",
    pillLabel: "Ingresos y Estacionamiento",
    title: "Av. Juan B. Justo 6500 · 2 Ingresos y Estacionamiento",
    badge: "Accesos al Club",
    details:
      "Dos ingresos señalados sobre Av. Juan B. Justo 6500 (acceso central peatonal/vehicular frente a Hockey y acceso este hacia el estacionamiento lateral). Estacionamiento interno en forma de L ($5.000).",
    services: ["Ingreso Central", "Ingreso Este", "Estacionamiento interno", "Duchas y Baños cercanos"],
  },
]

function RugbyHPost({
  x,
  y,
  orientation,
}: {
  x: number
  y: number
  orientation: "horizontal" | "vertical"
}) {
  if (orientation === "vertical") {
    return (
      <g stroke="#ffffff" strokeWidth={2} strokeLinecap="round">
        <line x1={x - 10} y1={y - 7} x2={x - 10} y2={y + 6} />
        <line x1={x + 10} y1={y - 7} x2={x + 10} y2={y + 6} />
        <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
      </g>
    )
  }
  return (
    <g stroke="#ffffff" strokeWidth={2} strokeLinecap="round">
      <line x1={x - 7} y1={y - 10} x2={x + 6} y2={y - 10} />
      <line x1={x - 7} y1={y + 10} x2={x + 6} y2={y + 10} />
      <line x1={x} y1={y - 10} x2={x} y2={y + 10} />
    </g>
  )
}

function CroquisSvg({
  selected,
  onSelect,
}: {
  selected: ZoneId
  onSelect: (id: ZoneId) => void
}) {
  const opacityFor = (id: Exclude<ZoneId, "all">) =>
    selected === "all" || selected === id ? 1 : 0.35

  const strokeFor = (id: Exclude<ZoneId, "all">) =>
    selected === id ? "#facc15" : "#ffffff"

  const toggle = (id: Exclude<ZoneId, "all">) =>
    onSelect(selected === id ? "all" : id)

  const handleKey = (e: React.KeyboardEvent, id: Exclude<ZoneId, "all">) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggle(id)
    }
  }

  return (
    <svg
      viewBox="0 0 900 940"
      role="img"
      aria-label="Croquis técnico oficial de Córdoba Rugby Club"
      className="h-auto w-full select-none"
    >
      {/* Fondo del predio */}
      <rect x={0} y={0} width={900} height={940} rx={22} fill="#edf3e7" />

      {/* Calle interna hacia Básquet y Estacionamiento Este */}
      <path d="M 555 24 L 845 770" stroke="#cbd5e1" strokeWidth={22} strokeLinecap="round" />
      <path
        d="M 555 24 L 845 770"
        stroke="#ffffff"
        strokeWidth={2}
        strokeDasharray="10 10"
        opacity={0.7}
      />

      {/* ================= RUGBY 4 (Arriba Centro) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Rugby 4"
        onClick={() => toggle("rugby-4")}
        onKeyDown={(e) => handleKey(e, "rugby-4")}
        style={{ opacity: opacityFor("rugby-4"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        <rect
          x={255}
          y={44}
          width={270}
          height={144}
          rx={10}
          fill="#247a3d"
          stroke={strokeFor("rugby-4")}
          strokeWidth={selected === "rugby-4" ? 4 : 2}
        />
        <rect x={274} y={56} width={232} height={120} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.9} />
        <line x1={390} y1={56} x2={390} y2={176} stroke="#ffffff" strokeWidth={2} opacity={0.9} />
        <RugbyHPost x={274} y={116} orientation="horizontal" />
        <RugbyHPost x={506} y={116} orientation="horizontal" />
        <text x={390} y={122} textAnchor="middle" fill="#ffffff" fontSize={20} fontWeight={900} letterSpacing={1.4}>
          RUGBY 4
        </text>
        {/* Mesa de Control + Hidratación */}
        <circle cx={380} cy={205} r={12} fill="#0ea5e9" stroke="#ffffff" strokeWidth={2} />
        <text x={380} y={209} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={800}>H</text>
        <rect x={400} y={194} width={96} height={22} rx={6} fill="#1d3fb8" />
        <text x={448} y={208} textAnchor="middle" fill="#ffffff" fontSize={9.5} fontWeight={800}>
          MESA DE CONTROL
        </text>
      </g>

      {/* ================= BÁSQUET (Arriba Derecha) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Básquet"
        onClick={() => toggle("basquet")}
        onKeyDown={(e) => handleKey(e, "basquet")}
        style={{ opacity: opacityFor("basquet"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        <rect
          x={635}
          y={42}
          width={220}
          height={146}
          rx={14}
          fill="#e2e8f0"
          stroke={selected === "basquet" ? "#facc15" : "#64748b"}
          strokeWidth={selected === "basquet" ? 4 : 2}
        />
        <rect x={655} y={76} width={180} height={78} rx={8} fill="#ea580c" stroke="#ffffff" strokeWidth={2} />
        <text x={745} y={121} textAnchor="middle" fill="#ffffff" fontSize={22} fontWeight={900} letterSpacing={1.5}>
          BÁSQUET
        </text>
        <text x={745} y={174} textAnchor="middle" fill="#334155" fontSize={10} fontWeight={700}>
          GIMNASIO / SECTOR EDILICIO
        </text>
      </g>

      {/* ================= RUGBY 3 y RUGBY 2 (Medio Izquierda: 3a, 3b, 2a, 2b) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Rugby 2 y Rugby 3"
        onClick={() => toggle("rugby-2-3")}
        onKeyDown={(e) => handleKey(e, "rugby-2-3")}
        style={{ opacity: opacityFor("rugby-2-3"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* RUGBY 3 (Superior: 3a izquierda, 3b derecha) */}
        <rect
          x={52}
          y={246}
          width={344}
          height={150}
          rx={10}
          fill="#247a3d"
          stroke={strokeFor("rugby-2-3")}
          strokeWidth={selected === "rugby-2-3" ? 4 : 2}
        />
        <rect x={68} y={258} width={312} height={126} fill="none" stroke="#ffffff" strokeWidth={2} />
        <rect x={80} y={268} width={288} height={106} fill="none" stroke="#fde047" strokeWidth={1.3} strokeDasharray="4 4" />
        <line x1={224} y1={258} x2={224} y2={384} stroke="#ffffff" strokeWidth={2} />
        <RugbyHPost x={68} y={321} orientation="horizontal" />
        <RugbyHPost x={380} y={321} orientation="horizontal" />
        <text x={224} y={288} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={900} letterSpacing={1.4}>
          RUGBY 3
        </text>
        <rect x={120} y={310} width={52} height={30} rx={6} fill="#ffffff" />
        <text x={146} y={331} textAnchor="middle" fill="#0b1640" fontSize={16} fontWeight={900}>3a</text>
        <rect x={276} y={310} width={52} height={30} rx={6} fill="#ffffff" />
        <text x={302} y={331} textAnchor="middle" fill="#0b1640" fontSize={16} fontWeight={900}>3b</text>
        <text x={74} y={376} fill="#fde047" fontSize={9.5} fontWeight={800}>5m</text>
        <text x={358} y={376} fill="#fde047" fontSize={9.5} fontWeight={800}>5m</text>

        {/* Mesa de Control + Hidratación entre Rugby 3 y Rugby 2 */}
        <rect x={122} y={406} width={118} height={24} rx={6} fill="#1d3fb8" />
        <text x={181} y={422} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight={800}>
          MESA DE CONTROL
        </text>
        <circle cx={262} cy={418} r={14} fill="#0ea5e9" stroke="#ffffff" strokeWidth={2} />
        <text x={262} y={422} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={800}>H</text>

        {/* RUGBY 2 (Inferior: 2a izquierda, 2b derecha) */}
        <rect
          x={52}
          y={440}
          width={344}
          height={150}
          rx={10}
          fill="#247a3d"
          stroke={strokeFor("rugby-2-3")}
          strokeWidth={selected === "rugby-2-3" ? 4 : 2}
        />
        <rect x={68} y={452} width={312} height={126} fill="none" stroke="#ffffff" strokeWidth={2} />
        <rect x={80} y={462} width={288} height={106} fill="none" stroke="#fde047" strokeWidth={1.3} strokeDasharray="4 4" />
        <line x1={224} y1={452} x2={224} y2={578} stroke="#ffffff" strokeWidth={2} />
        <RugbyHPost x={68} y={515} orientation="horizontal" />
        <RugbyHPost x={380} y={515} orientation="horizontal" />
        <text x={224} y={482} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={900} letterSpacing={1.4}>
          RUGBY 2
        </text>
        <rect x={120} y={504} width={52} height={30} rx={6} fill="#ffffff" />
        <text x={146} y={525} textAnchor="middle" fill="#0b1640" fontSize={16} fontWeight={900}>2a</text>
        <rect x={276} y={504} width={52} height={30} rx={6} fill="#ffffff" />
        <text x={302} y={525} textAnchor="middle" fill="#0b1640" fontSize={16} fontWeight={900}>2b</text>
      </g>

      {/* ================= EJE CENTRAL: GAZEBOS, COMEDOR, ESCENARIO, MÉDICO, ACREDITACIONES ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Gazebos, Comedor, Escenario y Servicios"
        onClick={() => toggle("central")}
        onKeyDown={(e) => handleKey(e, "central")}
        style={{ opacity: opacityFor("central"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* Baños norte del eje */}
        <circle cx={455} cy={272} r={14} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        <text x={455} y={276} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight={800}>WC</text>

        {/* Gazebos delegaciones */}
        <rect
          x={424}
          y={296}
          width={62}
          height={232}
          rx={10}
          fill="#d97706"
          stroke={strokeFor("central")}
          strokeWidth={selected === "central" ? 3.5 : 2}
        />
        <text
          x={455}
          y={412}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={12}
          fontWeight={900}
          letterSpacing={1.5}
          transform="rotate(-90 455 412)"
        >
          GAZEBOS DELEGACIONES
        </text>

        {/* Puesto Hidratación + Médico */}
        <circle cx={434} cy={556} r={14} fill="#0ea5e9" stroke="#ffffff" strokeWidth={2} />
        <text x={434} y={560} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight={800}>H</text>

        <circle cx={468} cy={556} r={14} fill="#e11d48" stroke="#ffffff" strokeWidth={2} />
        <text x={468} y={561} textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight={900}>+</text>

        {/* Escenario */}
        <circle cx={524} cy={564} r={18} fill="#7c3aed" stroke="#ffffff" strokeWidth={2} />
        <text x={524} y={568} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={800}>ESC.</text>

        {/* Comedor */}
        <circle cx={484} cy={600} r={16} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        <text x={484} y={604} textAnchor="middle" fill="#ffffff" fontSize={7.5} fontWeight={800}>COM.</text>

        {/* Acreditaciones */}
        <rect x={442} y={626} width={90} height={22} rx={6} fill="#16a34a" stroke="#ffffff" strokeWidth={1.5} />
        <text x={487} y={640} textAnchor="middle" fill="#ffffff" fontSize={9.5} fontWeight={800}>
          Acreditaciones
        </text>

        {/* Cantina */}
        <rect x={542} y={718} width={66} height={22} rx={6} fill="#0b1640" />
        <text x={575} y={732} textAnchor="middle" fill="#ffffff" fontSize={9.5} fontWeight={800}>
          Cantina
        </text>
      </g>

      {/* ================= RUGBY 1 + POSTAS RUGBY (Medio Derecha) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Rugby 1 y Postas Rugby"
        onClick={() => toggle("rugby-1")}
        onKeyDown={(e) => handleKey(e, "rugby-1")}
        style={{ opacity: opacityFor("rugby-1"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* Postas Rugby */}
        <rect
          x={504}
          y={270}
          width={142}
          height={72}
          rx={8}
          fill="#2f855a"
          stroke={strokeFor("rugby-1")}
          strokeWidth={selected === "rugby-1" ? 3.5 : 2}
        />
        <text x={575} y={303} textAnchor="middle" fill="#ffffff" fontSize={12} fontWeight={800}>
          POSTAS
        </text>
        <text x={575} y={319} textAnchor="middle" fill="#dcfce7" fontSize={12} fontWeight={800}>
          RUGBY
        </text>

        {/* Rugby 1 principal */}
        <rect
          x={518}
          y={354}
          width={182}
          height={264}
          rx={10}
          fill="#1e7037"
          stroke={strokeFor("rugby-1")}
          strokeWidth={selected === "rugby-1" ? 4 : 2}
        />
        <rect x={532} y={372} width={154} height={228} fill="none" stroke="#ffffff" strokeWidth={2} />
        <line x1={532} y1={486} x2={686} y2={486} stroke="#ffffff" strokeWidth={2} />
        <RugbyHPost x={609} y={372} orientation="vertical" />
        <RugbyHPost x={609} y={600} orientation="vertical" />
        <text x={609} y={462} textAnchor="middle" fill="#ffffff" fontSize={20} fontWeight={900} letterSpacing={1.4}>
          RUGBY 1
        </text>
        <text x={609} y={525} textAnchor="middle" fill="#dcfce7" fontSize={11} fontWeight={700}>
          CANCHA PRINCIPAL
        </text>

        {/* Mesa de Control / Carpa artistas / Streaming */}
        <rect x={496} y={432} width={66} height={54} rx={7} fill="#1d3fb8" stroke="#ffffff" strokeWidth={1.5} />
        <text x={529} y={450} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={800}>MESA CONTROL</text>
        <text x={529} y={463} textAnchor="middle" fill="#bae6fd" fontSize={7.5} fontWeight={700}>Carpa artistas</text>
        <text x={529} y={475} textAnchor="middle" fill="#bae6fd" fontSize={7.5} fontWeight={700}>Streaming</text>

        {/* Ambulancia y Duchas/Baños junto a Rugby 1 */}
        <circle cx={636} cy={636} r={14} fill="#e11d48" stroke="#ffffff" strokeWidth={2} />
        <text x={636} y={640} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={800}>AMB</text>
        <circle cx={596} cy={664} r={13} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        <text x={596} y={668} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={800}>WC</text>
        <circle cx={626} cy={664} r={13} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        <text x={626} y={668} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={800}>DUCH</text>
      </g>

      {/* ================= HOCKEY (Abajo Izquierda) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Cancha de Hockey"
        onClick={() => toggle("hockey")}
        onKeyDown={(e) => handleKey(e, "hockey")}
        style={{ opacity: opacityFor("hockey"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* Carpa autoridades */}
        <rect x={282} y={596} width={104} height={20} rx={5} fill="#0b1640" />
        <text x={334} y={610} textAnchor="middle" fill="#ffffff" fontSize={9.5} fontWeight={800}>
          Carpa autoridades
        </text>

        <rect
          x={146}
          y={624}
          width={254}
          height={118}
          rx={10}
          fill="#22c55e"
          stroke={strokeFor("hockey")}
          strokeWidth={selected === "hockey" ? 4 : 2}
        />
        <rect x={160} y={634} width={226} height={98} fill="none" stroke="#ffffff" strokeWidth={2} />
        <line x1={273} y1={634} x2={273} y2={732} stroke="#ffffff" strokeWidth={2} />
        <text x={273} y={690} textAnchor="middle" fill="#ffffff" fontSize={24} fontWeight={900} letterSpacing={1.8}>
          HOCKEY
        </text>

        {/* Baños, Duchas, Mesa de Control e Hidratación debajo de Hockey */}
        <circle cx={216} cy={762} r={12} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        <text x={216} y={766} textAnchor="middle" fill="#ffffff" fontSize={8} fontWeight={800}>WC</text>
        <circle cx={246} cy={762} r={12} fill="#f97316" stroke="#ffffff" strokeWidth={2} />
        <text x={246} y={766} textAnchor="middle" fill="#ffffff" fontSize={7.5} fontWeight={800}>DUCH</text>
        <rect x={266} y={750} width={88} height={24} rx={6} fill="#1d3fb8" />
        <text x={310} y={765} textAnchor="middle" fill="#ffffff" fontSize={8.5} fontWeight={800}>
          MESA CONTROL
        </text>
        <circle cx={370} cy={762} r={12} fill="#0ea5e9" stroke="#ffffff" strokeWidth={2} />
        <text x={370} y={766} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight={800}>H</text>
      </g>

      {/* ================= ACCESOS Y ESTACIONAMIENTO (Abajo) ================= */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Seleccionar Ingresos y Estacionamiento"
        onClick={() => toggle("accesos")}
        onKeyDown={(e) => handleKey(e, "accesos")}
        style={{ opacity: opacityFor("accesos"), cursor: "pointer", transition: "opacity 200ms" }}
      >
        {/* Estacionamiento en L */}
        <path
          d="M 424 780 L 792 780 L 724 585"
          fill="none"
          stroke={selected === "accesos" ? "#facc15" : "#312e81"}
          strokeWidth={36}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        <text x={600} y={785} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight={800} letterSpacing={2}>
          ESTACIONAMIENTO
        </text>
        <text
          x={762}
          y={685}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={11}
          fontWeight={800}
          letterSpacing={1.5}
          transform="rotate(-110 762 685)"
        >
          ESTACIONAMIENTO
        </text>

        {/* Av. Juan B. Justo 6500 */}
        <rect x={30} y={836} width={840} height={64} rx={12} fill="#334155" />
        <line x1={48} y1={868} x2={852} y2={868} stroke="#ffffff" strokeWidth={2.5} strokeDasharray="16 12" opacity={0.65} />
        <rect x={320} y={850} width={260} height={34} rx={8} fill="#1d3fb8" />
        <text x={450} y={872} textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight={800}>
          Av. Juan B. Justo 6500
        </text>

        {/* Flechas de los 2 Ingresos */}
        <g fill="#ffffff" stroke="#0b1640" strokeWidth={2.5}>
          {/* Ingreso 1 (centro-izquierda) */}
          <polygon points="390,792 372,820 383,820 383,852 397,852 397,820 408,820" />
          {/* Ingreso 2 (este) */}
          <polygon points="824,792 806,820 817,820 817,852 831,852 831,820 842,820" />
          {/* Ingreso hacia Rugby 1 */}
          <polygon points="694,552 722,538 718,548 746,560 741,572 713,560 709,570" />
        </g>
        <text x={390} y={918} textAnchor="middle" fill="#0b1640" fontSize={11} fontWeight={800}>
          INGRESO 1
        </text>
        <text x={824} y={918} textAnchor="middle" fill="#0b1640" fontSize={11} fontWeight={800}>
          INGRESO 2
        </text>
      </g>
    </svg>
  )
}

export function FieldMap() {
  const [view, setView] = useState<MapView>("official")
  const [selected, setSelected] = useState<ZoneId>("all")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [expanded])

  const activeInfo = selected === "all" ? null : ZONES.find((z) => z.id === selected) ?? null

  return (
    <div className="mt-16 rounded-3xl bg-paper p-5 ring-1 ring-ink/10 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Guía Oficial · Plano del club
          </p>
          <h3 className="mt-1 font-display text-3xl font-extrabold uppercase text-ink">
            Mapa y croquis del predio
          </h3>
          <p className="mt-1 text-sm text-ink/65">
            Ubicá las canchas de Rugby (1, 2, 3, 4), Hockey, Básquet, los 2 ingresos por Av. Juan B. Justo 6500, gazebos, comedor y puestos médicos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink/15">
            <button
              type="button"
              onClick={() => setView("official")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm",
                view === "official" ? "bg-brand text-white" : "text-ink/70 hover:text-ink"
              )}
            >
              <MapIcon className="h-4 w-4" />
              Mapa Oficial 3D
            </button>
            <button
              type="button"
              onClick={() => setView("schematic")}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm",
                view === "schematic" ? "bg-brand text-white" : "text-ink/70 hover:text-ink"
              )}
            >
              Croquis Técnico
            </button>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink ring-1 ring-ink/15 transition hover:ring-ink sm:text-sm"
          >
            <Maximize2 className="h-4 w-4 text-brand" />
            Ampliar
          </button>
        </div>
      </div>

      {/* Referencias oficiales de la Hoja 2 */}
      <ul className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {LEGEND_ITEMS.map(({ label, icon: Icon, color }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-xs font-bold text-ink ring-1 ring-ink/10"
          >
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white", color)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ul>

      {/* Selector rápido de sectores */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar sector del mapa">
        <button
          type="button"
          onClick={() => setSelected("all")}
          className={cn(
            "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm",
            selected === "all"
              ? "bg-ink text-white"
              : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
          )}
        >
          Todo el predio
        </button>
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => setSelected(selected === zone.id ? "all" : zone.id)}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:text-sm",
              selected === zone.id
                ? "bg-brand text-white"
                : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"
            )}
          >
            {zone.pillLabel}
          </button>
        ))}
      </div>

      {/* Vista principal: Mapa 3D oficial o Croquis Técnico */}
      <div className="overflow-hidden rounded-2xl bg-[#07183c] p-2 shadow-sm ring-1 ring-ink/10 sm:p-4">
        {view === "official" ? (
          <div className="mx-auto max-w-2xl overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mapa-predio.jpg"
              alt="Mapa oficial 3D de Córdoba Rugby Club con ubicación de canchas, ingresos, gazebos, comedor y servicios"
              className="block h-auto w-full cursor-zoom-in"
              onClick={() => setExpanded(true)}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <CroquisSvg selected={selected} onSelect={setSelected} />
          </div>
        )}
      </div>

      {/* Detalle del sector seleccionado */}
      <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
        {activeInfo ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-2xl font-extrabold uppercase text-ink">
                {activeInfo.title}
              </h4>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                {activeInfo.badge}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink/75">{activeInfo.details}</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {activeInfo.services.map((svc) => (
                <li
                  key={svc}
                  className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/75"
                >
                  {svc}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h4 className="font-display text-xl font-bold uppercase text-ink">
              Distribución completa de Córdoba Rugby Club
            </h4>
            <p className="mt-1 text-sm text-ink/65">
              Dos ingresos sobre Av. Juan B. Justo 6500 con estacionamiento interno. Canchas de Rugby 1, 2 (2a·2b), 3 (3a·3b), 4, Postas Rugby, Hockey y Básquet, con el corredor central de Gazebos, Comedor, Escenario, Acreditaciones, Médico y Ambulancia.
            </p>
          </div>
        )}
      </div>

      {/* Modal ampliado */}
      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mapa ampliado del predio"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-3 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-white/20 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-display text-xl font-extrabold uppercase text-ink sm:text-2xl">
                {view === "official" ? "Mapa Oficial · Córdoba Rugby Club" : "Croquis Técnico · Córdoba Rugby Club"}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Cerrar mapa ampliado"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-white transition hover:bg-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {view === "official" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/mapa-predio.jpg"
                alt="Mapa oficial 3D de Córdoba Rugby Club"
                className="block h-auto w-full rounded-xl"
              />
            ) : (
              <CroquisSvg selected={selected} onSelect={setSelected} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
