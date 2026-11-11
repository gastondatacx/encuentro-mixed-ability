/**
 * Mosaico de triángulos inspirado en el logo oficial.
 * Se genera de forma determinística (misma semilla = mismo dibujo) para que
 * el HTML del servidor y del cliente coincidan.
 */

const PALETTE = ["#1d3fb8", "#19a7e0", "#7cc242", "#f28c1c", "#e5306f", "#8e3a96", "#a6d64a"]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface MosaicProps {
  cols?: number
  rows?: number
  seed?: number
  /** "left": se desarma hacia la izquierda, "right": hacia la derecha. */
  fade?: "left" | "right" | "none"
  className?: string
}

export function Mosaic({ cols = 10, rows = 8, seed = 9, fade = "left", className }: MosaicProps) {
  const rand = mulberry32(seed)
  const w = 100 / cols
  const h = 100 / rows

  const points: Array<Array<[number, number]>> = []
  for (let y = 0; y <= rows; y++) {
    const row: Array<[number, number]> = []
    for (let x = 0; x <= cols; x++) {
      const edge = x === 0 || y === 0 || x === cols || y === rows
      const jx = edge ? 0 : (rand() - 0.5) * w * 0.7
      const jy = edge ? 0 : (rand() - 0.5) * h * 0.7
      row.push([x * w + jx, y * h + jy])
    }
    points.push(row)
  }

  const triangles: Array<{ d: string; fill: string; opacity: number }> = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const a = points[y][x]
      const b = points[y][x + 1]
      const c = points[y + 1][x + 1]
      const d = points[y + 1][x]
      const flip = rand() > 0.5
      const tris = flip
        ? [
            [a, b, c],
            [a, c, d],
          ]
        : [
            [a, b, d],
            [b, c, d],
          ]

      const progress = fade === "left" ? x / cols : fade === "right" ? 1 - x / cols : 1
      for (const tri of tris) {
        // Cuanto más cerca del borde que "se desarma", más triángulos faltan.
        if (rand() > 0.25 + progress * 0.85) continue
        triangles.push({
          d: `M${tri.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L")}Z`,
          fill: PALETTE[Math.floor(rand() * PALETTE.length)],
          opacity: 0.55 + rand() * 0.45,
        })
      }
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {triangles.map((t, i) => (
        <path key={i} d={t.d} fill={t.fill} fillOpacity={t.opacity} stroke="#fff" strokeWidth={0.35} />
      ))}
    </svg>
  )
}
