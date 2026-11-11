# 9º Encuentro Nacional Mixed Ability: Córdoba 2026 (v2)

> Versión rediseñada **en una copia aparte** del proyecto original (`~/Desktop/rugby`).
> Esta carpeta no está vinculada a Vercel ni al repositorio de GitHub del original.

Sitio de una sola página, *mobile first*, con **Next.js (App Router)**, **TypeScript** y **Tailwind CSS v4**.
La estética parte del logo oficial: azul institucional y un mosaico de triángulos de colores.

## Qué cambió respecto del original

| Original | v2 |
| --- | --- |
| 3 pestañas (Inicio / Cronograma / Equipos) | Una sola página con scroll y navegación por anclas (barra superior en desktop, barra inferior en móvil) con resaltado de sección activa |
| Tema negro | Tema claro con la paleta del logo y secciones oscuras para contraste |
| Horarios como texto (`"17:30 hs - Título"`) | Datos estructurados (`start`, `end`, `title`) → indicadores **Ahora** / **Próximo** en vivo durante el evento |
| Sin cuenta regresiva | Cuenta regresiva hasta la apertura (21/11, 17:30 hs) |
| Búsqueda de equipos sensible a tildes | Búsqueda que ignora tildes ("cordoba" encuentra "CÓRDOBA") |
| Lista de archivos a subir por nombre | Arrastrar y soltar, miniaturas, estado por archivo y reintento solo de los que fallaron |
| Banner de instalación dentro del contenido | Aviso flotante y descartable |
| shadcn/ui + Radix (8 dependencias) | Componentes propios: solo `next`, `react`, `lucide-react` y `tailwindcss` |

## Estructura

```text
app-encuentro/
├── public/                    # logo, escudos (logos/) y piezas QR (qr/), sin cambios
├── scripts/google-apps-script-drive.js
└── src/
    ├── app/                   # layout (fuentes y SEO), page, manifest (PWA), globals.css (tema)
    ├── components/
    │   ├── SiteNav.tsx        # Navegación superior e inferior con scroll-spy
    │   ├── Hero.tsx           # Portada, deportes, CTA y números clave
    │   ├── Countdown.tsx      # Cuenta regresiva / "en marcha" / "gracias"
    │   ├── Schedule.tsx       # Cronograma por día con estado en vivo
    │   ├── Teams.tsx          # Grilla de equipos + buscador
    │   ├── Venue.tsx          # Sede, mapa, cómo llegar y logística
    │   ├── PhotoUpload.tsx    # Subida directa a Google Drive
    │   ├── Contact.tsx        # Contacto y pie de página
    │   ├── InstallPrompt.tsx  # Aviso para instalar la PWA
    │   ├── Mosaic.tsx         # Mosaico decorativo en SVG (determinístico)
    │   └── SectionHeading.tsx
    ├── data/encuentro.ts      # TODO el contenido editable (evento, sede, contacto, equipos, cronograma)
    └── lib/                   # utilidades (horarios, búsqueda) y hook useNow
```

## Comandos

Dentro de `app-encuentro`:

```bash
npm install
npm run dev        # http://localhost:3000 (usá `-- -p 3100` para otro puerto)
npm run build
npm run start
npm run typecheck
```

> [!NOTE]
> La subida de fotos usa el **mismo** Google Apps Script y la misma carpeta de Drive que el original.
> Cualquier prueba de subida desde esta copia termina en el álbum real.
