---
name: Fatumsaurus
description: App personal y de pareja para gestionar todos los aspectos de la vida cotidiana. Tu destino, tu orden.
colors:
  noche-marina: "#001219"
  petroleo: "#005F73"
  teal: "#0A9396"
  arena: "#E9D8A6"
  crema: "#F2ECD8"
  header-surface: "#E8E0CC"
  ambar: "#EE9B00"
  rojo-tierra: "#AE2012"
  texto-secundario: "#4A6070"
  menta: "#94D2BD"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  page: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.petroleo}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.teal}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.petroleo}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-destructive:
    backgroundColor: "{colors.rojo-tierra}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  chip-default:
    backgroundColor: "{colors.arena}"
    textColor: "{colors.noche-marina}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  chip-warning:
    backgroundColor: "#FDF3CD"
    textColor: "#7A5000"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  chip-danger:
    backgroundColor: "#FAE4E1"
    textColor: "#7A1A10"
    rounded: "{rounded.full}"
    padding: "3px 10px"
---

# Design System: Fatumsaurus

## 1. Overview

**Creative North Star: "El Reloj del Dinosaurio"**

La interfaz es el dinosaurio sosteniendo el reloj: cada módulo es una manecilla con su propio peso, el sistema es el mecanismo que lo mueve todo sin que tengas que ver los engranajes. El dato se introduce una vez y aparece donde hace falta. El sistema coordina sin pedir coordinación. El usuario habita la app, no la gestiona.

Este sistema visual está construido para la intimidad, no para la escala. Fatumsaurus gestiona las cosas reales de una vida — finanzas, salud, comida, hogar — para un círculo pequeño de personas que se conocen bien. El lenguaje visual lo refleja: cálido sin ser dulce, preciso sin ser frío, organizado sin parecer una herramienta comprada para una oficina. La paleta ancla en el azul-petróleo oscuro de la navegación y asciende hacia el crema cálido donde ocurre la mayor parte del trabajo del día. Poppins — redondeada, directa, warm — lleva todo: etiquetas del sidebar, campos de formulario, cabeceras de módulo.

Lo que este sistema rechaza explícitamente: el aplano gris-azul corporativo de apps enterprise como Jira; la suavidad pastelosa de apps de bienestar que usan lavanda y mint para señalar "calma"; el monocromatismo blanco desnudo de apps de productividad minimalistas como Linear o Things 3 que se apoyan solo en el contraste tipográfico y resultan frías. Fatumsaurus no es ninguna de esas: tiene calor que se ve, estructura que se siente, y carácter que no hay que explicar.

**Key Characteristics:**
- Sidebar en Noche Marina (#001219) que ancla cada pantalla visualmente
- Superficie en Crema (#F2ECD8) cálida y habitable, no estéril
- Ámbar y teal como puntuación del UI — usados con parquedad, sentidos de inmediato
- Colores de módulo siempre desde las preferencias del usuario en Supabase — nunca hardcodeados
- Poppins como única voz tipográfica: redondeada, directa, sin monsergas
- Liquid glass selectivo: solo en sidebar, modales y cards destacadas — nunca decorativo


## 2. Colors

La paleta forma una progresión de profundidad: desde Noche Marina (casi negro) hasta Crema (casi blanco), con teal y ámbar como acentos activos y arena como superficie de descanso.

### Primary
- **Petróleo** (#005F73 / oklch(0.37 0.08 209)): Botones primarios, links, acentos principales. El color de la acción en la app. Oscuro lo suficiente para leer sobre crema; saturado lo suficiente para leer como color, no como gris.

### Secondary
- **Ámbar** (#EE9B00 / oklch(0.72 0.17 67)): Alertas, highlights, CTAs secundarios. Calor concentrado. Aparece cuando hay algo que el usuario necesita ver — una fecha próxima, un stock bajo, un pendiente. Su rareza es parte del mensaje.

### Tertiary
- **Teal** (#0A9396 / oklch(0.58 0.105 192)): Hover states, badges activos, estado seleccionado. La versión más clara del Petróleo. Indica interactividad y estado sin competir con el acento primario.
- **Menta** (#94D2BD / oklch(0.81 0.066 182)): Textos secundarios en modo oscuro, elementos de éxito leves, elementos de estado positivo. Más suave que el Teal — para estados informativos, no para acciones.

### Neutral
- **Noche Marina** (#001219 / oklch(0.10 0.03 209)): Fondo del sidebar, texto muy oscuro, fondo en modo oscuro. La única superficie oscura en el tema claro — el ancla visual de toda la app.
- **Arena** (#E9D8A6 / oklch(0.87 0.05 76)): Fondo de cards, bordes suaves, separadores. El descansillo entre el crema y el blanco. Warm sin ser pastel.
- **Crema** (#F2ECD8 / oklch(0.93 0.03 76)): Fondo principal de la app. Habitable, cálido. Nunca usado en el sidebar.
- **Header Surface** (#E8E0CC / oklch(0.895 0.025 76)): Fondo fijo de los headers de módulo. Visualmente diferenciado del fondo de página para que el header sticky sea perceptible sin borde llamativo.
- **Texto Secundario** (#4A6070 / oklch(0.40 0.038 215)): Metadatos, etiquetas de formulario, descripciones subordinadas. Contraste ≥4.5:1 sobre Crema verificado.

### Destructive
- **Rojo Tierra** (#AE2012 / oklch(0.44 0.185 27)): Errores, estados destructivos, acciones de borrado. No se usa para decoración ni para alertas informativas — solo cuando algo puede perderse.

### Paleta de módulos
Los 17 colores disponibles para los módulos (Noche, Abismo, Petróleo, Teal, Menta, Trigo, Arena, Ámbar, Miel, Naranja, Cobre, Rojo, Rubí, Carmesí, Caoba, Forest, Oliva vivo) son configurados por el usuario en Ajustes y almacenados en Supabase (`user_module_colors`). Ningún componente los hardcodea — siempre se leen del contexto/store en tiempo de render. Un módulo sin color asignado muestra gris neutro.

### Named Rules
**The Sidebar Anchor Rule.** El sidebar es siempre Noche Marina (#001219). No cambia por tema, por módulo ni por temporada. Es la única superficie oscura fija en un sistema warm-light — el contrapeso visual que evita que la app se lea como una hoja de papel.

**The Module Color Rule.** Nunca hardcodear un hex de módulo en un componente. Los colores de módulo viven en `user_module_colors` de Supabase, se leen desde el store, y pueden ser distintos para cada usuario. Si no hay color asignado: gris neutro (`oklch(0.65 0 0)`). Sin excepciones.

**The Amber Rarity Rule.** El Ámbar aparece en ≤15% de cualquier pantalla. Su función es la urgencia y el highlight. Cuando aparece en demasiados sitios a la vez, deja de señalar nada.


## 3. Typography

**Body/UI Font:** Poppins (400, 500, 600, 700 — importada de Google Fonts)
**Fallback:** system-ui, -apple-system, sans-serif

**Character:** Una sola familia en múltiples pesos. Poppins es geométrica pero redondeada — más cálida que Inter, más directa que Nunito. Funciona igual de bien en el sidebar colapsado (14px, weight 500) que en los headings de módulo (28px, weight 700). Sin font pairing: la personalidad viene del color y los pesos, no de mezclar familias.

### Hierarchy
- **Display** (700, 1.75rem/28px, lh 1.15, ls -0.01em): Títulos principales de módulo en el header. Aparece una vez por pantalla, nunca en el sidebar.
- **Headline** (600, 1.25rem/20px, lh 1.3): Encabezados de sección, títulos de cards importantes, nombres de items en vistas de lista.
- **Title** (600, 1rem/16px, lh 1.4): Items de navegación en el sidebar, etiquetas de tabs, nombres de campo en formularios complejos.
- **Body** (400, 0.875rem/14px, lh 1.6): Contenido general, descripciones, notas, valores en listas. Máximo 65–75ch por línea en bloques de prosa.
- **Label** (500, 0.75rem/12px, lh 1.2, ls 0.01em): Metadatos, timestamps, badges, etiquetas de formulario. Nunca en mayúsculas tracked — el tracking se aplica solo si el diseño lo requiere, no por defecto.

### Named Rules
**The Single Voice Rule.** Poppins en todos los contextos. No hay display face, no hay mono para código, no hay serif para citas. La variedad viene del peso y el color, no de la familia. Mezclar Poppins con otra sans geométrica produce incoherencia sin propósito.

**The Label Ceiling Rule.** Las etiquetas (Label tier) son 12px, weight 500. Por debajo de 12px cualquier texto pierde legibilidad en móviles gama media. No existe texto en la app por debajo de 12px.


## 4. Elevation

El sistema usa tonal layering como profundidad principal y shadow suave como affordance de hover — no como decoración estructural. La regla: las superficies son planas en reposo; las sombras responden al estado.

Tres capas de superficie en tema claro:
1. **Fondo de app** (Crema #F2ECD8) — el suelo, nunca elevado
2. **Cards y paneles** (blanco #FFFFFF o Arena #E9D8A6) — primera capa
3. **Sidebar y header de módulo** (Noche Marina / Header Surface) — superficies ancladas, no elevadas

El sidebar usa `backdrop-filter: blur(12px)` con un fallback sólido en Noche Marina para dispositivos lentos. Los modales y cards destacadas del dashboard pueden usar el mismo tratamiento glass de forma selectiva. En ningún otro contexto.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 2px 12px rgba(0, 18, 25, 0.08)`): sombra difusa, casi imperceptible. Las cards en estado neutro.
- **Card hover** (`box-shadow: 0 4px 20px rgba(0, 18, 25, 0.12)`): ligeramente más grande, acompaña a `transform: translateY(-1px)`. Indica interactividad.
- **Focus ring** (`box-shadow: 0 0 0 3px rgba(0, 95, 115, 0.12)`): solo en inputs y elementos focusables. Color Petróleo con opacidad. Accesible y discreto.
- **Modal overlay** (`backdrop-filter: blur(8px)` sobre fondo `rgba(0, 18, 25, 0.4)`): Para modales y drawers. Difumina el contenido de fondo sin ocultarlo.

### Named Rules
**The Flat-By-Default Rule.** Las superficies son planas en reposo. La sombra aparece como respuesta al estado (hover, elevación, focus), nunca como adorno estático. Un card con sombra permanente compite con todos los demás — pierde el significado.

**The Selective Glass Rule.** `backdrop-filter: blur()` se usa solo en sidebar (si se aplica el efecto glass) y en modales. No en cards del dashboard, no en tooltips, no en headers de tabla. Cada instancia de glass debe justificarse por el contexto — nunca por estética por defecto.


## 5. Components

### Buttons
Forma redondeada con personalidad contenida (12px radius). Tres variantes: primario, ghost, destructivo.

- **Shape:** Gently curved (12px radius). No pill, no square.
- **Primary:** Fondo Petróleo (#005F73), texto blanco, padding 10px 20px. Hover: Teal (#0A9396) con `translateY(-1px)`. Focus: ring Petróleo con opacidad 12%.
- **Ghost:** Fondo transparente, texto Petróleo, borde 1.5px Petróleo. Hover: fondo Petróleo, texto blanco — el botón se rellena. Para acciones secundarias en el mismo contexto visual que un primario.
- **Destructive:** Fondo Rojo Tierra (#AE2012), texto blanco. Sin hover llamativo — la acción ya es suficientemente prominente por color.
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`. Sin cambio de color.
- **Transitions:** `150ms ease-out` en todas las propiedades animadas. Sin bounce, sin spring.

### Chips / Badges
Pills pequeñas para estado, categoría y conteo. Tres variantes de semántica.

- **Default:** Arena (#E9D8A6) bg, Noche Marina texto, padding 3px 10px, `border-radius: 9999px`.
- **Warning/Pending:** Fondo ámbar muy diluido (#FDF3CD), texto ámbar oscuro (#7A5000).
- **Danger/Urgent:** Fondo rojo tierra muy diluido (#FAE4E1), texto rojo tierra oscuro (#7A1A10).
- **Module badge:** Color de módulo del usuario (desde store) en la versión `--module-color-15` (15% opacidad) como bg, `--module-color` como texto.

### Cards / Containers
Surface blanca sobre fondo Crema, con radio generoso y sombra suave.

- **Corner Style:** Generously curved (16px radius en cards principales, 12px en cards compactas)
- **Background:** Blanco (#FFFFFF) sobre Crema. En alternativas de surface: Arena (#E9D8A6).
- **Shadow Strategy:** Card rest en estado neutro (`0 2px 12px rgba(0,18,25,0.08)`). Card hover en estado interactivo (`0 4px 20px rgba(0,18,25,0.12)`).
- **Border:** `1px solid #E9D8A6` (Arena) para delimitar sin peso visual extra. Cuando hay sombra de hover, el borde desaparece.
- **Internal Padding:** 16px estándar, 12px en cards compactas de dashboard.

### Inputs / Fields
Stroke sobre fondo blanco, radius 8px, focus en Petróleo.

- **Style:** Fondo blanco, borde 1.5px Arena (#E9D8A6), radius 8px, padding 10px 14px.
- **Hover (sin focus):** Borde Teal (#0A9396) — indica que el campo es interactivo.
- **Focus:** Borde Petróleo (#005F73) + focus ring `0 0 0 3px rgba(0,95,115,0.12)`.
- **Error:** Borde Rojo Tierra (#AE2012) + focus ring rojo `0 0 0 3px rgba(174,32,18,0.12)` + mensaje de error debajo en Rojo Tierra, 12px, weight 500.
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, fondo Arena.
- **Placeholder:** Color Texto Secundario (#4A6070) — contraste ≥4.5:1 verificado sobre fondo blanco.

### Navigation (Sidebar)
Superficie oscura, items redondeados, sin iconos fantasma.

- **Container:** Fondo Noche Marina (#001219), padding 12px 8px, anchura 240px expandido / 64px colapsado.
- **Nav item default:** Texto Arena con 70% opacidad (`rgba(233,216,166,0.7)`), padding 10px 14px, radius 10px, gap 12px entre icono y label.
- **Nav item hover:** Fondo `rgba(10,147,150,0.15)` (Teal 15%), texto Arena 100%.
- **Nav item active:** Fondo `rgba(0,95,115,0.4)` (Petróleo 40%), texto Arena, weight 600.
- **Group headers:** Texto Arena 50%, 11px, weight 600, uppercase tracking 0.06em. Solo para las secciones del sidebar (HOGAR Y VIDA, FINANZAS...), no como patrón global.
- **Logo/brand:** FATUMSAURUS en Poppins 700, color Arena (#E9D8A6). Si `/public/logo.png` existe, usar imagen. Si no, el texto es el placeholder.
- **Mobile:** Bottom nav con ≤5 módulos favoritos del usuario. Resto desde hamburger menu.

### Module Header (Signature Component)
Header sticky por módulo: fondo diferenciado, título + icono de módulo + acción primaria.

- **Background:** Header Surface (#E8E0CC) — un tono más oscuro que Crema para que la posición sticky sea perceptible sin borde llamativo.
- **Border bottom:** `1px solid #D4CAB0` — separador suave.
- **Padding:** `16px 24px` — consistente con el page padding lateral.
- **Icono de módulo:** Container 36px × 36px, radius 10px, color desde `user_module_colors`. Emoji o SVG del módulo dentro.
- **Título:** Display tier, Noche Marina, weight 700.
- **Acción primaria:** Button primario en el lado derecho. Una sola acción por header.


## 6. Do's and Don'ts

### Do:
- **Do** usar Petróleo (#005F73) como color de acción primaria en botones, links y estados seleccionados.
- **Do** leer el color de cada módulo desde `user_module_colors` en Supabase a través del store/context. Nunca hardcodear un hex de módulo directamente.
- **Do** mantener el sidebar en Noche Marina (#001219) en todos los estados y temas. Es el ancla visual fija.
- **Do** usar `padding: 0 24px 24px` en todas las páginas de módulo sin excepción. El contenido nunca toca los bordes laterales.
- **Do** usar sonner para todos los mensajes de feedback (éxito, error, carga). No inventar otro sistema de toasts.
- **Do** aplicar `backdrop-filter: blur()` de forma selectiva: sidebar, modales, cards destacadas del dashboard. No en cualquier superficie.
- **Do** incluir `@media (prefers-reduced-motion: reduce)` para cada animación: crossfade o transición instantánea como alternativa.
- **Do** verificar contraste en texto secundario: #4A6070 sobre #F2ECD8 debe ser ≥4.5:1.
- **Do** usar la sombra card (`0 2px 12px rgba(0,18,25,0.08)`) como respuesta de estado, no como decoración estática.
- **Do** diferenciarse del header de módulo (#E8E0CC) del fondo de página (#F2ECD8) — nunca usar el mismo color en ambos.

### Don't:
- **Don't** hardcodear colores de módulo en componentes. La fuente de verdad es `user_module_colors` en Supabase.
- **Don't** usar `border-left` o `border-right` mayor de 1px como stripe de color en cards, alertas o list items. Reescribir con fondo tintado o borde completo.
- **Don't** usar `background-clip: text` con gradiente. El texto en Fatumsaurus es siempre un color sólido.
- **Don't** usar glassmorphism por defecto como estética decorativa. Solo donde aporte contexto real (sidebar, modales).
- **Don't** construir grids de cards idénticas con el mismo icono + heading + texto repetido. Cada card en el dashboard debe tener su propia jerarquía de información.
- **Don't** poner eyebrows en mayúsculas tracked encima de cada sección como scaffolding por defecto.
- **Don't** usar azul-gris corporativo, gris neutro sin chroma ni paletas monocromas — el sistema rechaza explícitamente el look de apps enterprise como Jira o dashboards corporativos.
- **Don't** usar colores pastelosos (lavanda, mint, rosa bebé) ni el lenguaje visual de apps de bienestar genéricas como Headspace.
- **Don't** construir una interfaz en blanco puro monocroma al estilo Linear o Things 3. La app tiene color, tiene calor, tiene carácter.
- **Don't** usar la fuente por debajo de 12px (Label tier) en ningún contexto.
- **Don't** aplicar el mismo estado de shadow estático a todas las cards. Las cards en reposo tienen sombra `08%`; solo en hover suben a `12%`.
- **Don't** mezclar Poppins con otra sans geométrica. Una sola familia tipográfica — la variedad viene del peso y el color.
