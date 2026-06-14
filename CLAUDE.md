# FATUMSAURUS — Documento Maestro del Proyecto

> Este archivo es la memoria permanente del proyecto. Claude Code debe leerlo completo al inicio de cada sesión. Nunca modificar sin consenso con Ainhoa.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre:** Fatumsaurus  
**Concepto:** App personal y de pareja para gestionar todos los aspectos de la vida cotidiana  
**Tagline:** "Tu destino, tu orden"  
**Logo:** Dinosaurio kawaii sosteniendo un reloj dorado, estilo ilustración bold con contorno negro, círculos terracota de fondo, tipografía bold en banderola. Archivo en `/public/logo.png`.

> ⚠️ **Logo placeholder:** si `/public/logo.png` no existe todavía, usar en su lugar un `<div>` con el texto **FATUMSAURUS** en Poppins 700, color `#E9D8A6`, sobre el fondo del sidebar. No usar `<img>` con src roto.

---

## 2. STACK TÉCNICO

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + clases personalizadas |
| Componentes UI | shadcn/ui |
| Toasts / feedback UI | sonner (integración nativa con shadcn/ui) |
| Base de datos + Auth | Supabase |
| Despliegue | Vercel (auto-deploy desde GitHub) |
| Control de versiones | GitHub (repo privado: `ainhoavm/fatumsaurus`) |
| Herramienta de desarrollo | Claude Code (terminal) |

**Comandos de desarrollo:**
```bash
# Abrir proyecto
cd /Users/ainhoa/Documentos/Proyectos/fatumsaurus

# Desarrollo local — revisar SIEMPRE en local antes de subir
npm run dev
# → abre http://localhost:3000 en el navegador para revisar

# Cuando Ainhoa dé el visto bueno en local, entonces subir:
git add . && git commit -m "descripción" && git push
# → Vercel auto-despliega al recibir el push
```

**Flujo de trabajo establecido:**
1. Hacer cambios con Claude Code en local
2. `npm run dev` → revisar visualmente en http://localhost:3000
3. Cuando Ainhoa dé el visto bueno → commit + push → Vercel despliega automáticamente

**Setup inicial (solo una vez):**
1. Crear proyecto en local
2. Revisar que funciona en local con `npm run dev`
3. `git init` → primer commit
4. Crear repo privado en GitHub (`ainhoavm/fatumsaurus`)
5. `git remote add origin` + `git push`
6. Conectar Vercel al repo → auto-deploy activo desde ese momento
7. ⚠️ Añadir las variables de entorno en el panel de Vercel (Settings → Environment Variables): `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Variables de entorno (.env.local — NUNCA en git, NUNCA en GitHub):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Estas variables deben configurarse también manualmente en Vercel (Settings → Environment Variables) para que el deploy funcione en producción. El `.gitignore` debe incluir `.env.local` desde el primer commit.

---

## 3. DISEÑO Y BRANDING

### Paleta base de la app

Colores estructurales que definen fondos, superficies, textos y acentos globales. Distintos de los colores de módulo.

| Nombre | Hex | Uso |
|--------|-----|-----|
| Noche marina | `#001219` | Sidebar fondo, textos muy oscuros, modo oscuro fondo |
| Petróleo | `#005F73` | Botones primarios, links, acentos principales |
| Teal | `#0A9396` | Hover states, badges activos |
| Arena | `#E9D8A6` | Fondos de cards, bordes suaves |
| Crema | `#F2ECD8` | Fondo principal de la app (modo claro) |
| Ámbar | `#EE9B00` | Alertas, highlights, CTA secundarios |
| Rojo tierra | `#AE2012` | Errores, estados destructivos |

### Modo oscuro — paleta dark

Planificado desde el inicio con CSS variables. **Implementación diferida a fase posterior**, pero las variables se definen desde el setup para no tener que repasar todo el código después.

| Variable | Modo claro | Modo oscuro |
|----------|-----------|------------|
| `--bg-app` | `#F2ECD8` | `#001219` |
| `--bg-card` | `#FFFFFF` | `#0A1F28` |
| `--bg-sidebar` | `#001219` | `#000D13` |
| `--text-primary` | `#001219` | `#E9D8A6` |
| `--text-secondary` | `#4A6070` | `#94D2BD` |
| `--border` | `#E9D8A6` | `#0A3040` |

El usuario elige tema en Ajustes: **claro / oscuro / seguir al sistema**. Por defecto: seguir al sistema.

### Tipografía

- **Poppins** — fuente principal para toda la interfaz (headings, body, navegación)
- Pesos usados: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Importar desde Google Fonts

### Estilo visual general — Glass futurista

El estilo de la app es **glass futurista**: fondos semitransparentes con backdrop-filter, orbes de color blur en el fondo, tarjetas con efecto cristal. Es el estilo principal de toda la app, no un detalle selectivo.

- **Fondo app:** `oklch(0.975 0.008 205)` — near-white con tinte frío muy sutil. Definido como `--background` en `globals.css`.
- **Orbes de fondo:** tres círculos CSS con `filter: blur(80px)` en el layout principal (`app/(app)/layout.tsx`). Presentes en TODAS las páginas de la app, no solo el dashboard:
  - Teal grande (`oklch(0.58 0.105 192)`, opacidad 55%) — esquina top-right
  - Petróleo oscuro (`oklch(0.24 0.058 209)`, opacidad 55%) — esquina bottom-left
  - Ámbar dorado (`oklch(0.72 0.170 67)`, opacidad 40%) — centro, tirando a derecha
- **Colores en OKLCH:** todas las variables CSS y colores custom se expresan en `oklch()`. No usar hex en `globals.css` salvo para los hex de módulo en la paleta.
- **Bordes redondeados:** generosos — `border-radius` 16–20px en secciones y cards grandes, 12px en items de lista, 8–10px en inputs y badges.
- **Header de módulo:** sticky, glass-subtle, siempre visible al scrollar. Sin máx-width — ocupa el ancho completo del área de contenido.
- **Padding de página:** todas las páginas usan `px-6 pt-4 pb-8` (o `pt-5 pb-10` en dashboard). Nunca `max-w-*` en el wrapper de contenido — el ancho lo gestiona el layout del sidebar. El contenido nunca toca los bordes laterales.
- **Espacio bajo el header:** `padding-top: 16–20px` en el área de contenido tras el separador del header.

### Sistema de clases CSS glass — `globals.css`

Cuatro utilidades definidas en `@layer utilities` de `globals.css`. **Usar estas clases en lugar de duplicar los estilos como inline constants.** Son fiables en SSR/hidratación y ya incluyen `-webkit-backdrop-filter`.

| Clase | Uso | Background | Blur |
|-------|-----|-----------|------|
| `.glass` | Paneles, secciones, mini-calendario, modales | `oklch(1 0 0 / 65%)` | 18px |
| `.glass-subtle` | Topbar, barras sticky | `oklch(1 0 0 / 55%)` | 12px |
| `.glass-dark` | Sidebar | `oklch(0.10 0.030 209 / 80%)` | 22px |
| `.card-tech` | Tarjetas individuales, items de lista, cards de módulo | `oklch(1 0 0 / 50%)` | 12px |
| `.orb` | Posicionamiento absoluto de círculos blur de fondo | — | — |

`.card-tech` incluye `:hover` en CSS (border teal y glow sutil) sin necesidad de handlers JS.

**⚠️ Excepción webkit en Tailwind v4:** las utilidades de Tailwind como `backdrop-blur-xl` NO añaden automáticamente el prefijo `-webkit-backdrop-filter`. Si se necesita backdrop-filter fuera de las clases de `globals.css` (ej: un gradiente custom en inline style), hay que pasar ambas propiedades explícitamente:
```tsx
style={{
  backdropFilter: 'blur(24px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.6)',  // ← obligatorio en React
}}
```
Las clases `.glass`, `.glass-dark`, etc. ya lo incluyen correctamente en el CSS.

### Sidebar — branding y comportamiento

- **Marca:** logo (`/public/logo.png`, ratio 2:3 portrait) + texto "FATUM" / "SAURUS" en dos líneas. Usar `<Image width={30} height={45}>` (no `fill` — distorsiona imágenes portrait en contenedor cuadrado).
- **Glass dark:** inline style con `WebkitBackdropFilter` en el `<aside>` (Tailwind v4 no lo añade solo).
- **Expandido:** 240px. **Colapsado:** 64px. La transición es CSS (`transition-[width]`).
- **Navegación dinámica:** el sidebar lee de `ModuleColorsProvider` (context) para saber qué módulos están activos, en qué grupos, cuáles son favoritos, y el color de cada icono. Nunca lee de constantes hardcodeadas.

### Feedback de UI — toasts

Usar **sonner** para todos los mensajes de éxito, error y estados de carga. shadcn/ui tiene integración nativa con sonner. Toasts en esquina inferior derecha. Ejemplos:
- Guardado correcto → toast success
- Error de red o validación → toast error
- Operación en curso → toast loading que se resuelve en success/error

### Navegación — estructura del topbar

El topbar aparece en la parte superior derecha de todas las páginas:

```
[Campana 🔔 con globito]   [Inicial del usuario / avatar]
```

- **Campana 🔔** — abre el panel de notificaciones. Muestra un globito rojo con el número de notificaciones no leídas urgentes (🔴) o amarillo para pendientes (🟡). Si no hay nada pendiente, sin globito.
- **Avatar del usuario** — círculo con la inicial del nombre (o emoji/imagen si el usuario lo ha configurado). Al hacer clic abre un menú desplegable con: **Ajustes** y **Cerrar sesión**.

### Navegación — sidebar

- **Desktop:** Sidebar colapsable a la izquierda. Parte superior: logo Fatumsaurus (imagen `/public/logo.png`) que al hacer clic lleva al Dashboard. Expandido muestra icono del módulo + nombre, colapsado solo icono.
- **Móvil:** Barra de navegación inferior con los módulos favoritos del usuario (máx. 5 iconos). Resto accesible desde menú hamburguesa.

#### Estructura del sidebar

```
[LOGO FATUMSAURUS]        ← clic → Dashboard (página de inicio)

📌 FAVORITOS              ← fijados por el usuario, máx. 5, reordenables
   [los que el usuario elija]

━━━━━━━━━━━━━━━━━━━━
📅 CALENDARIO             ← item suelto, sin grupo, siempre visible
━━━━━━━━━━━━━━━━━━━━

🏠 HOGAR Y VIDA
   Hogar · Comida · Vehículos

💰 FINANZAS
   Finanzas · Gifts

🌿 PERSONAL
   Salud · Bienestar · Hábitos · Objetivos

✈️ EXPLORAR
   Viajes · Lugares · 7º Arte

💼 TRABAJO Y ESTUDIOS
   Trabajo · Estudios
```

> El logo en la parte superior del sidebar actúa como botón "inicio" — lleva al Dashboard. El Calendario es el único módulo sin grupo porque es transversal a todo. Los grupos son colapsables. Los módulos que el usuario ha desactivado no aparecen.

**Personalización del sidebar:**
- El usuario elige qué módulos fija en Favoritos (máx. 5) desde Ajustes
- Puede reordenar los favoritos arrastrando
- Los grupos son colapsables individualmente
- Un módulo desactivado desde Ajustes desaparece del sidebar y de su grupo
- Solo el Calendario no se puede desactivar — es el único módulo siempre visible además del Dashboard

---

### Sistema de colores por módulo

Cada módulo tiene un color propio e independiente. Sin agrupación por color de grupo — cada uno es distinto y semánticamente coherente con lo que representa.

**Paleta extendida para módulos — 17 tonos disponibles**

Los 10 colores originales más 7 añadidos para completar los 15 módulos y tener reserva para el futuro. Todos en la misma progresión fría→cálida, cohesionados entre sí.

| Nombre | Hex | Origen |
|--------|-----|--------|
| Noche | `#001219` | Original |
| Abismo | `#004E60` | Añadido |
| Petróleo | `#005F73` | Original |
| Teal | `#0A9396` | Original |
| Menta | `#94D2BD` | Original |
| Trigo | `#C8B882` | Añadido |
| Arena | `#E9D8A6` | Original |
| Ámbar | `#EE9B00` | Original |
| Miel | `#D97E02` | Añadido |
| Naranja | `#CA6702` | Original |
| Cobre | `#BB3E03` | Original |
| Rojo | `#AE2012` | Original |
| Rubí | `#A01B1F` | Añadido |
| Carmesí | `#9B2226` | Original |
| Caoba | `#7E3A1E` | Añadido |
| Forest | `#2D5A3D` | Añadido |
| Oliva vivo | `#7A8C2A` | Añadido |

**Los colores de módulo son configurados por cada usuario desde Ajustes.** No existe una asignación predeterminada en código — cada usuario elige qué color quiere para cada módulo. Hasta que un usuario asigne colores, todos los módulos aparecen en gris neutro ("sin color"). El color que aparece en el sidebar, en el calendario, en las cards y en cualquier elemento de UI de un módulo es siempre el que ese usuario tenga configurado en ese momento.

Los 17 tonos disponibles están en la paleta de la tabla anterior. La asignación semántica sugerida (Hogar→cobre, Salud→teal, etc.) puede usarse como referencia en la documentación de diseño, pero no se hardcodea en ningún sitio del código.

**Sistema de personalización de colores en Ajustes:**
- Panel visual con todos los 17 tonos de la paleta como opciones clicables
- **Un color solo puede pertenecer a un módulo a la vez** — si un tono ya está asignado a otro módulo, aparece bloqueado y no se puede seleccionar hasta que sea liberado
- **"Sin color" es el mecanismo de liberación:** para mover un color de un módulo a otro, primero hay que poner uno de los dos en "sin color", lo que libera ese tono y lo deja disponible para asignarlo al otro módulo. No existe swap directo entre módulos
- **Varios módulos pueden estar en "sin color" simultáneamente** — especialmente útil en la configuración inicial, cuando el usuario quiere organizar toda la paleta de cero
- **Opción "sin color"** — el módulo aparece en gris neutro en sidebar y calendario
- Solo los tonos de la paleta curada están disponibles — sin selector hex libre de momento
- Los colores de módulo se guardan por usuario en Supabase (`user_module_colors`) y se leen desde el store/context en toda la app
- **Nunca hardcodear un hex de módulo directamente en un componente** — siempre leer del store/context. El color es lo que el usuario tenga configurado en Ajustes en ese momento

**Para el futuro:** añadir selector hex libre en Ajustes para usuarios que quieran un color totalmente personalizado fuera de la paleta curada.

---

## 4. ARQUITECTURA DE USUARIOS Y PERMISOS

### Sistema de usuarios

Cada persona tiene su propia cuenta con email y contraseña (Supabase Auth). **Todos los usuarios son ciudadanos de primera clase** — no hay usuarios "limitados". Cada uno activa los módulos que quiere usar.

**Usuarios previstos (escalable a cualquier número):**
- Ainhoa
- Su pareja
- Su madre
- (futuro) Su padre, amigos, etc.

### Modelo de participantes por item ⚠️ DECISIÓN CLAVE

**NO hay grupos fijos predefinidos** ("pareja", "familia"). En su lugar, cada item creado tiene una lista de participantes libre. El creador elige quién está incluido al crear o editar.

Ejemplos reales:
- Gasto de Amazon pagado por la pareja → participantes: pareja + Ainhoa + madre
- Viaje familiar → participantes: Ainhoa + pareja + madre + padre
- Hábito de cambiar sábanas → participantes: Ainhoa + pareja
- Película vista con la madre → "visto con": madre

Esto hace la app **infinitamente extensible**: cualquier usuario puede participar en cualquier item de cualquier módulo, sin tocar la arquitectura.

### Grupos de conveniencia (atajos opcionales)

Los grupos NO son estructurales. Son atajos que el usuario puede crear para no seleccionar siempre las mismas personas:

```
"Mi pareja"   → [Ainhoa, su chico]           -- atajo para items de dos
"Familia"     → [Ainhoa, chico, madre]        -- atajo para items familiares
"Casa"        → [Ainhoa, su chico]            -- alias temático
```

El usuario crea, edita y borra sus grupos libremente desde Ajustes.

### Tablas de participación en base de datos

Para cada módulo que soporte participantes, se usa una tabla de relación:

```sql
-- Ejemplo genérico para cualquier módulo
[modulo]_participants (
  item_id   uuid references [tabla_modulo](id) ON DELETE CASCADE,
  user_id   uuid references profiles(id),
  role      text DEFAULT 'participant',  -- 'owner' | 'participant'
  PRIMARY KEY (item_id, user_id)
)
```

RLS: un usuario ve un item si aparece en su tabla de participantes O si es el creador (owner).

### Comportamiento especial: items compartidos

La regla de "uno lo marca → se marca para todos" depende del **tipo de acción**:

**Evento único en el mundo real → se marca para todos**
Si la acción representa algo que ocurre una sola vez y afecta a todos los participantes, marcarla como hecha la marca para todos. No tiene sentido que el suelo esté "fregado para unos y sin fregar para otros".

Aplica a: tareas del hogar, tareas de limpieza, tareas recurrentes generales.

**Acción individual → cada persona la registra por separado**
Si la acción representa algo que cada persona hace (o no hace) por su cuenta, el registro es individual aunque el item sea compartido.

- **Recetas:** se separan dos conceptos:
  - *¿Se cocinó la receta?* → evento compartido. Si uno la marca como cocinada, descuenta el inventario para todos.
  - *¿La comí yo?* → registro individual. Cada participante confirma si comió esa receta o si comió otra cosa. Los macros resultantes son siempre por persona.
  - Un participante puede marcar que comió algo distinto a lo planificado sin afectar al registro del otro.
- **Medicamentos y vitaminas:** siempre individuales, aunque dos personas tomen el mismo producto. Al crear un medicamento o vitamina se puede indicar "este producto también lo toma [persona]", lo que crea automáticamente una entrada independiente en el perfil de esa persona con su propio historial, su propio stock y sus propias tomas. Cada uno marca las suyas sin afectar al otro.
- **Hábitos compartidos:** si uno lo marca como hecho → se marca para todos (es el caso "evento único" — ej: cambiar las sábanas).

**Borrado:** solo el owner puede borrar definitivamente. Los demás participantes solo pueden "salirse" del item.

**Edición:** el owner puede editar todo. Los participantes pueden editar campos acordados (ej: marcar como hecho, registrar su consumo individual), no los metadatos del item.

### Módulos activables/desactivables por usuario

Tabla en Supabase: `user_module_preferences`

```sql
user_id     uuid references profiles(id),
module_slug text,        -- 'finanzas', 'estudios', etc.
enabled     boolean DEFAULT true,
sort_order  int,
PRIMARY KEY (user_id, module_slug)
```

**Regla crítica:** Desactivar un módulo NUNCA borra datos. Solo oculta el módulo del sidebar. Al reactivar, todos los datos siguen intactos.

---

## 4B. PRINCIPIOS ARQUITECTÓNICOS CLAVE

### "Datos únicos, vistas múltiples" ⚠️ PRINCIPIO FUNDAMENTAL

**Un dato se crea una sola vez y aparece en todos los módulos relevantes. No hay duplicación. Editar en un sitio edita en todos.**

Este principio aplica a toda la app sin excepción. Ejemplos concretos:

| Dato | Se crea en | También aparece en |
|------|-----------|-------------------|
| Tarea "Cambiar sábanas" | Hogar › Limpieza | Hábitos (si se marca como hábito) · Calendario |
| Ejercicio "Salir a correr" | Hábitos | Bienestar › Movimiento · Calendario |
| Gasto de bono fisio | Salud › Especialistas | Finanzas › Gastos · Tricount si es compartido |
| Gasto de gasolina | Vehículos | Finanzas › Gastos |
| Ingreso de clases | Trabajo › Alumnos | Finanzas › Ingresos |
| Macros del planificador | Comida › Planificador semanal | Bienestar › Registro de comidas |
| Fecha de examen | Estudios | Calendario |
| Vencimiento ITV | Vehículos | Calendario · Notificaciones |
| Cumpleaños / aniversario | Calendario › Fechas especiales | Gifts › aviso próximo |

**Implementación técnica:**
- Los módulos no duplican datos — muestran vistas filtradas de datos centrales
- Ej: Bienestar no tiene tabla propia de ejercicios — lee de Hábitos filtrando por categoría "Ejercicio"
- Ej: Finanzas no tiene tabla de gastos de vehículos — los gastos de Vehículos tienen categoría "Vehículo" y aparecen en Finanzas como cualquier otro gasto
- Cualquier gasto puede introducirse desde el módulo origen O desde Finanzas — el resultado es el mismo dato

### Sistema de categorías transversal

Las categorías son el mecanismo que conecta datos entre módulos:

```
Categorías de GASTOS (aparecen en Finanzas + su módulo origen):
  Hogar · Alimentación · Vehículo · Salud · Trabajo · Viaje
  Personal · Inversión · Suscripción · Otro

Categorías de TAREAS/HÁBITOS (determina dónde se muestran):
  Limpieza   → Hogar › Limpieza + Hábitos si es recurrente
  Ejercicio  → Hábitos + Bienestar › Movimiento
  Hogar      → Hogar › Tareas + Hábitos si es recurrente
  Salud      → Hábitos + Bienestar
  Personal   → solo en Hábitos
```

### Sistema de alias de productos (inventario ↔ recetas)

```
Nombre en ticket:   "TOMATE PERA"      (viene de Mercadona)
Alias guardados:    "Tomate" · "Tomate pera" · "Tomates"

Al cruzar con recetas:
  Receta pide "tomates" → busca en alias → encuentra "TOMATE PERA" → match ✓
```
- Primera vez que no hay match → se pide al usuario emparejar manualmente
- El emparejamiento se guarda para siempre
- Tabla de alias editable desde Ajustes › Productos

### Notificaciones — reglas de destinatarios

| Notificación | Destinatarios |
|-------------|--------------|
| ITV/seguro/mantenimiento vehículo | Todos los usuarios del vehículo |
| Fichaje olvidado | Solo el usuario del trabajo |
| Medicamento bajo stock | Solo el usuario del medicamento |
| Cumpleaños/fecha especial próxima | Todos con acceso al evento en el Calendario |
| Suscripción por vencer | Todos los de la cuenta conjunta (si es gasto conjunto) |
| Bono médico por agotar | Solo el usuario del bono |
| Recordatorio mensual patrimonio | Todos los usuarios activos |

### Recordatorio mensual de actualización financiera

Hábito/tarea recurrente automático creado al configurar la app:
- Aparece el día 1 de cada mes en Hábitos, Calendario y Dashboard
- Al marcarlo como hecho redirige a: saldos de cuentas, valoraciones de inversiones, patrimonio neto
- Notificación si llevan más de 35 días sin actualizarse

---

## 5. MÓDULOS DE LA APP

### Lista completa

| # | Módulo | Slug | Nombre en UI | Notas |
|---|--------|------|--------------|-------|
| 1 | Dashboard | `dashboard` | Dashboard | Siempre activo, no desactivable |
| 2 | Calendario | `calendario` | Calendario | Siempre activo, no desactivable. Agrega eventos de todos los módulos. Incluye categoría Fechas especiales |
| 3 | Finanzas | `finanzas` | Finanzas | Ver detalle abajo |
| 4 | Gifts Tracker | `gifts` | Gifts | Ideas de regalo por persona |
| 5 | Hogar | `hogar` | Hogar | Inventario, lista compra, tareas, electrodomésticos, gastos |
| 6 | Comida | `comida` | Comida | Recetas, inventario, planificador |
| 7 | Vehículos | `vehiculos` | Vehículos | Alertas ITV/seguro |
| 8 | Salud | `salud` | Salud | Médico — privado por defecto |
| 9 | Bienestar | `bienestar` | Bienestar | Ejercicio, comidas, peso, métricas — estrictamente privado |
| 10 | Hábitos | `habitos` | Hábitos | Participantes + periodicidad |
| 11 | Objetivos | `objetivos` | Objetivos | Personales o compartidos, con hitos |
| 12 | Viajes | `viajes` | Viajes | Participantes libres por viaje |
| 13 | Lugares | `lugares` | Lugares | Restaurantes, sitios, listas temáticas |
| 14 | 7º Arte | `septimo-arte` | 7º Arte | Películas, series, libros |
| 15 | Trabajo | `trabajo` | Trabajo | Privado, fechas compartibles |
| 16 | Estudios | `estudios` | Estudios | Privado, exámenes compartibles |

> ℹ️ **Fechas importantes** ya no es un módulo independiente. Los cumpleaños, aniversarios y fechas recurrentes especiales viven como una **categoría dentro del Calendario** (ver detalle en sección del módulo Calendario).

---

### Detalle módulo: FINANZAS

Sub-secciones:
- **Gastos personales** — mis gastos, categorías, historial
- **Gastos compartidos (Tricount)** — grupos de gasto ad hoc con participantes libres. Quién pagó, quién debe, liquidaciones. Participantes son únicamente usuarios de la app. Gastos con personas externas se gestionan manualmente como gasto/ingreso.
- **Cuenta conjunta** — ver lógica detallada abajo
- **Inversiones** — ver lógica detallada abajo
- **Suscripciones** — servicios recurrentes con importe y fecha de renovación

#### Lógica de Inversiones

**Productos de inversión:**
Cada producto tiene: nombre, plataforma (Indexa, Degiro, Binance...), tipo (fondo, acción, cripto, ETF...), divisa.
Un producto puede pertenecer a uno o ambos usuarios — se gestiona por separado aunque sea el mismo producto.

**Introducción de aportaciones — modo masivo:**
El usuario selecciona una fecha y ve todos sus productos en lista. Introduce el importe aportado en cada uno, pulsa Enter para pasar al siguiente. Puede dejar vacío o poner 0 si no invirtió ese día. Al guardar puede indicar si esa sesión es para: solo yo / solo mi pareja / los dos (mismo importe para cada uno).

```
Fecha: 01/03/2026  →  Aplicar a: [Los dos]

  Producto A (Indexa):     100 € [Enter]
  Producto B (Degiro):      50 € [Enter]
  Producto C (cripto):       0   [Enter]
  ─────────────────────────────────────
  Total aportado:          150 € (×2 = 300€ entre los dos)
```

**Introducción de valoraciones — modo masivo:**
Igual que aportaciones pero introduciendo el valor actual del producto en una fecha concreta.
```
Fecha: 05/03/2026

  Producto A vale hoy:     112 €
  Producto B vale hoy:      48 €
```

**Cálculo de rentabilidad por producto:**
```
Producto A:
  Total aportado:    300€  (en varias fechas)
  Valor actual:      340€
  Ganancia:         +40€
  Rentabilidad:     +13,3%

Producto A (si pierde):
  Total aportado:    300€
  Valor actual:      260€
  Pérdida:          -40€
  Rentabilidad:     -13,3%
```

**Vistas disponibles:**
- Mi cartera (solo mis productos e inversiones)
- Cartera de mi pareja (solo la suya)
- Cartera conjunta (suma de los dos, mismo producto sumado)
- Por producto: histórico de aportaciones + valoraciones + rentabilidad en el tiempo (gráfica)
- Resumen global: total invertido, valor actual, ganancia/pérdida total y porcentaje

**Todo editable:** cualquier aportación o valoración puede editarse o borrarse a posteriori.

#### Lógica cuenta conjunta

**Saldo inicial:** al configurar la cuenta conjunta el usuario elige una fecha de inicio y puede introducir el saldo que había en esa fecha. A partir de ahí se tracean todos los movimientos. Se pueden introducir movimientos anteriores a la fecha de inicio si se quiere reconstruir el histórico.

Cada miembro puede ingresar cantidades distintas. Los gastos se reparten siempre **50/50**. El sistema calcula el balance neto en tiempo real:

```
Ejemplo:
  Ainhoa ingresa:      300€
  Su chico ingresa:    700€
  Total en cuenta:    1000€
  Gastos realizados:   800€  →  400€ corresponde a cada uno

  Balance:
  · Su chico puso 700€, le corresponde 400€  →  +300€ a su favor
  · Ainhoa puso 300€, le corresponde 400€    →  debe 100€
  → Resultado: Ainhoa le debe 100€a su chico
```

El dashboard de cuenta conjunta muestra siempre:
- Total ingresado por cada miembro
- Total gastado
- Balance neto de cada miembro (quién debe cuánto a quién)
- Historial de ingresos y gastos

#### Lógica tickets

El parser de tickets permite introducir un ticket de dos formas:
- **Pegar texto** copiado del PDF/ticket digital
- **Subir PDF** directamente

El parser es propio (sin IA, sin coste). Estrategia híbrida:
- Las líneas que encajan con los patrones conocidos se parsean automáticamente
- Las líneas que no encajan se marcan como ⚠️ "revisar" — aparecen resaltadas para que el usuario las corrija manualmente
- Todo es editable después del parseo, línea a línea

Supermercados con patrón conocido desde el inicio: **Mercadona**. Se pueden añadir más patrones en el futuro (Lidl, Carrefour, etc.) a medida que se usen.

##### Datos extraídos automáticamente de la cabecera
- Tienda (nombre + dirección) — editable por el usuario
- Fecha y hora — editable
- Número de factura simplificada
- Forma de pago (tarjeta/efectivo) y últimos 4 dígitos si aplica
- Total del ticket

##### Tipos de línea que el parser reconoce

```
1. Línea simple (1 unidad):
   "1 RIGATONI 1,40"
   → cantidad: 1 | precio unitario: 1,40€ | total: 1,40€

2. Línea múltiple (varias unidades):
   "2 COCKTAIL TOST. S/SAL 2,80 5,60"
   → cantidad: 2 | precio unitario: 2,80€ | total: 5,60€

3. Línea por peso:
   "1 NARANJA / 1,618 kg 2,15 €/kg 3,48"
   → cantidad: 1,618 kg | precio/kg: 2,15€ | total: 3,48€
```

##### Estructura de datos por línea de ticket

```typescript
type TicketLine = {
  descripcion:      string         // tal como aparece en el ticket
  cantidad:         number         // unidades (por defecto 1)
  precio_unitario:  number | null  // calculado automáticamente si no viene explícito
  peso_kg:          number | null  // solo productos a granel
  precio_por_kg:    number | null  // guardado siempre para productos por peso; opcional manual para el resto
  total:            number         // importe final de la línea
  categoria:        string         // OBLIGATORIO — elegida por el usuario al revisar
  subcategoria:     string | null  // opcional
  asignaciones:     Asignacion[]
}

type Asignacion = {
  participante: 'nosotros' | string  // 'nosotros' o uuid del usuario
  cantidad:     number               // unidades asignadas
  peso_kg:      number | null        // kg asignados (productos por peso)
  importe:      number               // calculado automáticamente
}
```

##### Cálculos automáticos entre campos

Siempre que el usuario edite un campo, los demás se recalculan:

| Tengo | Me falta | Cálculo |
|-------|----------|---------|
| total + peso_kg | precio_por_kg | `total ÷ peso_kg` |
| precio_por_kg + peso_kg | total | `precio_por_kg × peso_kg` |
| total + cantidad | precio_unitario | `total ÷ cantidad` |
| precio_unitario + cantidad | total | `precio_unitario × cantidad` |

##### Categorías de productos

Categorías predefinidas de base (editables y ampliables por el usuario):
- Alimentación › Lácteos
- Alimentación › Carnes y fiambres
- Alimentación › Pasta y arroz
- Alimentación › Panadería
- Alimentación › Conservas y salsas
- Alimentación › Dulces y snacks
- Alimentación › Bebidas
- Frescos › Fruta
- Frescos › Verdura
- Frescos › Pescado
- Limpieza › Hogar
- Higiene › Personal
- Higiene › Baño
- Otro

**Memoria de categorías:** el sistema recuerda la última categoría asignada a cada producto (por nombre) y la sugiere automáticamente la próxima vez.

##### Flujo de asignación tras el parseo

Para cada línea el usuario asigna:
- **A quién pertenece:** Nosotros / participante concreto (madre, etc.)
- **Si cantidad > 1:** puede dividir unidades entre distintos destinatarios
  - Ej: `2 MORTADELA ITALIANA 1,85 3,70` → 1 ud [Nosotros] 1,85€ + 1 ud [Mi madre] 1,85€
  - Ej: `1 NARANJA 1,618kg 2,15€/kg 3,48` → si se divide por peso: 0,809kg [Nosotros] + 0,809kg [Mi madre]
- **Categoría** (obligatoria) + **subcategoría** (opcional) — sugerida automáticamente si el producto ya fue categorizado antes

##### Cálculo automático al guardar

```
Ejemplo real — ticket Mercadona 95,99€ (cuenta conjunta):

  2 MORTADELA ITALIANA  1,85  3,70
  └─ 1 ud [Nosotros]   →  1,85€
  └─ 1 ud [Mi madre]   →  1,85€

  Resultado del ticket completo (simplificado):
  → Gasto conjunto:     94,14€  (47,07€ cada uno)
  → Deuda mi madre:      1,85€  (0,93€ debe a Ainhoa + 0,92€ debe a su chico)
  → Inventario Hogar:   todos los artículos [Nosotros] con sus cantidades
  → NO al inventario:   artículos asignados a terceros
```

Los tres sistemas se actualizan en una sola acción de guardado:
1. Gasto registrado en Finanzas (cuenta conjunta o personal)
2. Deuda creada automáticamente en Tricount por cada tercero
3. Artículos [Nosotros] añadidos al inventario de Hogar con categoría

#### Patrimonio neto

Visión global de la situación financiera, individual y conjunta:

```
Ainhoa:
  Cuentas bancarias personales:   +2.500€
  Cuenta conjunta (su parte):     +1.200€
  Inversiones:                    +5.000€
  Deudas personales:                -200€
  ─────────────────────────────────────
  Patrimonio neto personal:       +8.500€

Su chico:
  Cuentas bancarias personales:   +3.000€
  Cuenta conjunta (su parte):     +3.500€
  Inversiones:                    +8.000€
  Deudas personales:                   0€
  ─────────────────────────────────────
  Patrimonio neto personal:      +14.500€

Conjunto (suma de los dos):       +23.000€
```

- Cada usuario introduce sus propias cuentas y saldos manualmente (actualización manual periódica)
- La cuenta conjunta se divide automáticamente según lo aportado por cada uno
- Gráfica de evolución del patrimonio en el tiempo (por usuario y conjunto)
- Los saldos son privados por usuario — solo el total conjunto es visible para ambos si se activa

#### Deudas personales
Dinero que debes o te deben fuera del sistema Tricount:
- Concepto, importe, persona (usuario de la app o externo), fecha, notas
- Estado: pendiente / parcialmente pagada / saldada
- Al saldar → genera movimiento en Finanzas
- Vista resumen: cuánto te deben en total, cuánto debes tú en total

---

### Detalle módulo: 7º ARTE

Sub-secciones: **Películas · Series · Libros**

#### Autocompletado con APIs gratuitas
- **Películas y series:** TMDB (The Movie Database) — gratuita, sin límite para uso personal
  - Autocompletado de: título, año, director, actores, género, carátula, sinopsis, compositor
- **Libros:** Open Library — gratuita y abierta
  - Autocompletado de: título, autor, año, género, portada, sinopsis, ISBN
- El usuario pega el título o un enlace → la app busca y pre-rellena los datos
- Todo editable manualmente después del autocompletado

#### Ficha de cada entrada
- Título, año, director/autor, género, carátula/portada (desde API)
- **Estado:** visto/leído · viendo/leyendo · pendiente · abandonado
- **Puntuación:** 1 a 10
- **"Disfrutado con":** lista de participantes (usuarios de la app) — permite filtrar "visto con mi chico"
- Fecha(s) de visionado/lectura — se pueden registrar varias (visto varias veces)
- Plataforma donde se vio (Netflix, HBO, cine, físico...) — para películas y series
- Notas personales libres
- Etiquetas personalizables

#### Series — control de progreso
- Temporadas y episodios
- Marcar episodios vistos individualmente o temporada completa de golpe
- Estado por temporada

#### Listas personalizadas
- El usuario crea listas con nombre propio (ej: "Ver con mi chico", "Recomendadas por mamá", "Clásicos pendientes")
- Cada lista tiene visibilidad: **privada** (solo yo) o **compartida** (elegir con quién)
- Los usuarios con acceso a una lista compartida pueden verla en su propia pestaña de listas
- Cualquier entrada puede pertenecer a varias listas a la vez

#### Duración y tiempo de visualización
- **Películas:** duración en minutos por película (desde TMDB o introducida manualmente)
- **Series:** duración por episodio configurable por serie (por defecto 45min drama / 25min sitcom), editable episodio a episodio si hace falta
- Cada vez que se marca como visto se suma al contador de tiempo total
- Se puede marcar como visto **más de una vez** — cada visionado/lectura tiene su fecha y cuenta por separado
- Por cada entrada: nº de veces vista/leída + tiempo total dedicado

#### Objetivos anuales (estilo Goodreads)
Por cada categoría (películas, series, libros) el usuario puede fijar un objetivo anual:
```
Objetivo 2026: leer 12 libros
  Leídos hasta ahora:   2
  Quedan:              10
  Meses restantes:      6
  Ritmo necesario:      1,67 libros/mes
  Ritmo actual:         0,33 libros/mes  ← estás por detrás
  Progreso:            16,7% ████░░░░░░
```
- Objetivo editable en cualquier momento
- Barra de progreso visual con porcentaje
- Aviso si vas por detrás del ritmo necesario
- Histórico de objetivos por año (cuántos pusiste, cuántos conseguiste)

#### Estadísticas
- Total de películas vistas, series completadas, libros leídos — histórico / anual / mensual
- Tiempo total dedicado por categoría y en global
- Géneros más vistos/leídos
- Productos más repetidos (vistos/leídos varias veces)
- Puntuación media por género
- Actividad por mes/año (gráfica de barras)
- Comparativa entre usuarios (si se comparte)

---

### Detalle módulo: TRABAJO

Cada usuario gestiona sus propios trabajos. Se pueden tener **varios trabajos activos simultáneamente** (ej: trabajo oficial + clases particulares). Cada trabajo es una entidad independiente con su propia configuración.

#### Ficha de cada trabajo
- Nombre, tipo (oficial / autónomo / clases / prácticas / otro)
- Horario: partido, intensivo, o personalizado por tramos de fechas (ej: intensivo en verano, partido el resto)
- Horas diarias esperadas y horas totales del periodo (para prácticas con mínimo de horas)
- Vinculable con módulo Estudios si es una práctica curricular
- Salario o tarifa por hora (opcional, para trabajos no oficiales como clases)
- Para trabajos tipo "clases particulares": gestión de alumnos (ver detalle abajo)

#### Fichajes
- Registro de entrada y salida con cálculo automático de horas trabajadas
- Pausas/descansos registrables — cuentan en el tiempo total, no lo reducen
- El horario configurado se pre-rellena automáticamente para facilitar el fichaje rápido
- Todo editable manualmente a posteriori
- Cada jornada puede marcarse como: trabajo normal / día libre / vacaciones / baja médica / festivo / permiso

#### Cómputo de horas
- Resumen semanal, mensual, anual e histórico desde el primer fichaje
- Horas trabajadas vs horas esperadas — diferencia positiva (extra) o negativa (deuda)
- Horas extra acumuladas — pueden marcarse como compensadas o pagadas
- Por cada trabajo por separado y total global

#### Vacaciones y festivos
- Días de vacaciones disponibles, usados y pendientes por año
- Festivos del calendario laboral (configurables por comunidad/país)
- Vacaciones y festivos compartibles con otros usuarios vía Calendario

#### Alumnos (para trabajos tipo clases particulares)
- Lista de alumnos con: nombre, tarifa por hora/sesión, estado (activo/inactivo)
- Registro de clases dadas: alumno, fecha, duración, importe cobrado, notas
- Resumen por alumno: clases totales, horas totales, total cobrado
- Resumen por periodo configurable (ej: curso escolar sep–jun):
  - Total horas impartidas
  - Total ingresos
  - Ingresos por mes
  - Alumnos activos
- Este ingreso puede registrarse también en Finanzas como ingreso personal

#### Nóminas
- Guardar PDFs de nóminas por mes/año
- Resumen mensual: bruto, neto, retenciones

#### Calendario
- Los días laborables aparecen en el Calendario con el horario previsto
- Aviso automático si llega la hora de entrada y no se ha fichado
- Aviso automático si llega la hora de salida y no se ha fichado la salida
- Vacaciones y festivos visibles en el Calendario (compartibles con pareja)

---

### Detalle módulo: HOGAR

Sub-secciones:
- **Inventario** — productos de despensa y hogar con stock actual, stock mínimo y categoría
- **Lista de la compra** — generada manualmente, desde recetas (módulo Comida) o automáticamente cuando un producto baja de su mínimo. **Compartida en tiempo real con la pareja** — ambos pueden tachar items mientras están en el supermercado. Los items tachados se ocultan pero no se borran hasta que el usuario limpia la lista.
- **Tareas** — tareas del hogar con periodicidad opcional, participantes, categoría y check de completado. Se sincronizan con Hábitos si se marcan como hábito recurrente
- **Electrodomésticos y objetos** — ficha por objeto con:
  - Nombre, marca, modelo
  - Fecha de compra, precio
  - Duración de garantía (años) → fecha de fin calculada automáticamente → alerta cuando queda 10% del tiempo de garantía
  - Vida útil estimada (años) → fecha estimada de fin de vida → alerta cuando queda 10% de la vida útil (ej: objeto dura 10 años → aviso al año 9)
  - Ticket/factura adjunta (PDF o imagen)
  - Notas
  - Recomendado incluso para pequeños electrodomésticos — garantía legal en España es 3 años
- **Gastos del hogar** — alquiler/hipoteca, suministros (luz, agua, gas, internet), otros gastos fijos. Conectados con Finanzas

#### Inventario y Hogar — compartido entre pareja
Todo el módulo Hogar es compartido entre los usuarios de la vivienda (tú y tu chico). Ambos pueden ver y modificar el inventario, tareas, lista de la compra y electrodomésticos. Es el único módulo totalmente compartido por defecto sin necesidad de configurarlo.

#### Limpieza — sub-sección de Hogar
Lista de tareas de limpieza con periodicidad automática:
- Nombre de la tarea (ej: "Limpiar baño", "Cambiar sábanas", "Fregar suelo")
- Periodicidad: cada N días / semanal / quincenal / mensual / trimestral
- La tarea aparece automáticamente como pendiente cuando toca según la periodicidad
- Al marcar como hecha: se registra quién la hizo (usuario) y la fecha
- Si no se hace en la fecha prevista: se puede marcar como "no hecha en esta fecha" o dejar pendiente
- **Estadísticas de limpieza:**
  - Quién ha hecho más tareas (porcentaje por usuario)
  - Cuántas veces se ha hecho cada tarea
  - Cuántas veces ha quedado sin hacer
  - Historial completo por tarea
- Se puede vincular con Hábitos para que aparezca también en el tracker de hábitos
- Las tareas de limpieza pueden aparecer en el Calendario si el usuario lo activa

#### Inventario — lógica
- Los tickets (módulo Finanzas) alimentan el inventario automáticamente al guardarse
- Solo los artículos marcados como `[Nosotros]` en el ticket se añaden al inventario
- El usuario puede modificar el stock manualmente en cualquier momento
- Al cocinar una receta (módulo Comida) y marcarla como cocinada → se descuentan los ingredientes del inventario automáticamente
- Descuento manual también disponible
- Cada producto tiene un **stock mínimo** configurable. Cuando el stock actual ≤ mínimo → el producto aparece automáticamente en la lista de la compra

#### Tareas — lógica
- Periodicidad opcional: diaria, semanal, cada N días, mensual, anual, o sin periodicidad
- Participantes: una o varias personas. Si es compartida y uno la marca como hecha → se marca para todos
- Categorías personalizables (limpieza, mantenimiento, jardín, cocina...)
- Las tareas recurrentes aparecen en el Calendario si el usuario lo activa
- Una tarea puede referenciarse como Hábito — aparece también en el módulo Hábitos con su racha

---

### Detalle módulo: COMIDA

Sub-secciones:
- **Recetas** — nombre, ingredientes con cantidades, pasos, tiempo, dificultad, etiquetas, foto opcional
- **Planificador semanal** — asignar recetas a días de la semana (desayuno/comida/cena)
- **Lista de la compra desde recetas** — al planificar la semana, los ingredientes que faltan en el inventario se añaden automáticamente a la lista de la compra de Hogar

#### Recetas — lógica con inventario y macros
- Cada ingrediente tiene: nombre, cantidad, unidad (gr, ml, unidades, kg...)
- Cada receta tiene: macros totales (calorías, proteína, carbohidratos, grasas) y macros por ración
- Los macros se introducen manualmente por receta (o por ingrediente si se quiere más precisión)
- Al marcar una receta como **cocinada** (evento compartido) → se descuentan los ingredientes del inventario de Hogar para todos los participantes
- **Registro de consumo individual:** separado del evento "cocinada". Cada participante confirma si comió esa receta o si comió otra cosa. Si uno no la comió, puede registrar lo que comió en su lugar sin afectar al registro del otro. Los macros resultantes son siempre individuales por persona.
- Si al planificar faltan ingredientes → se añaden a la lista de la compra de Hogar
- Al planificar la semana → los macros de cada receta se suman al registro de Bienestar de cada participante según sus raciones confirmadas

---

### Detalle módulo: SALUD (médico)

Sub-secciones:
- **Citas médicas** — fecha, especialidad, médico, centro, notas, resultado. Aparecen en el Calendario
- **Especialistas por sesiones** — ver lógica detallada abajo
- **Medicamentos** — ver lógica detallada abajo
- **Historial** — registro libre de episodios médicos, diagnósticos, resultados de pruebas
- **Documentos** — adjuntar PDFs/imágenes (informes, análisis, recetas)

#### Especialistas por sesiones (fisio, psicólogo, nutricionista...)

Cada especialista tiene su propia ficha con modalidad de pago elegible:

**Modalidad bono (pago por adelantado):**
```
Fisio — Bono
  Fecha de pago:            01/05/2026
  Importe pagado:           350€
  Sesiones contratadas:     10
  Duración por sesión:      60 min
  Tiempo total contratado:  600 min

  Sesiones consumidas:      3 completas + 1 de 30min
  Tiempo consumido:         210 min  (3×60 + 30)
  Tiempo restante:          390 min  (6,5 sesiones equivalentes)
  Coste real por minuto:    0,583€/min
  Coste real por sesión 60min: 35€
```

**Modalidad pago por sesión:**
```
Psicóloga — Pago por sesión
  Duración estándar:  60 min
  Precio por sesión:  60€
  Total sesiones:     8
  Total gastado:      480€
```

**Tarjeta visual por especialista (UI):**
Cada especialista/bono se muestra como una tarjeta con:
- Nombre del especialista y tipo
- Barra de progreso: tiempo consumido / tiempo total contratado
- Números: X min consumidos de Y min totales (= X,X sesiones de Y sesiones)
- Tiempo restante destacado
- Coste real por sesión calculado (actualizado cada vez que se consume)
- Botón rápido "Registrar sesión"
- Historial de sesiones expandible

**Lógica de sesiones:**
- Al crear un bono se indica: nº de sesiones, duración estándar por sesión en minutos, importe total
- Cada sesión consumida registra: fecha, duración real en minutos, usuario que la usó, notas, pagada por (si la usa un tercero)
- El sistema calcula automáticamente el tiempo consumido, restante y coste real por minuto/sesión
- Si otra persona usa una sesión (ej: madre usa sesión del bono de Ainhoa) → se registra quién la usó → si luego la paga → genera movimiento en Tricount/Finanzas
- El gasto del bono se registra en Finanzas en la fecha de pago real
- Coste compartido 50/50 con pareja → al registrar el pago se puede marcar como gasto conjunto

**Sesiones de duración variable:**
- Al registrar cada sesión se pone la duración real en minutos (ej: 30, 45, 60, 90...)
- El sistema descuenta exactamente esos minutos del bono
- No hay fracciones fijas — es tiempo real, no fracciones predefinidas

#### Medicamentos — lógica de tramos y tomas

**Privacidad y compartición:** los medicamentos y vitaminas son siempre individuales. Sin embargo, al crear un medicamento o vitamina se puede indicar "este producto también lo toma [persona]", lo que genera automáticamente una entrada independiente en el perfil de esa persona. Cada entrada tiene su propio historial, su propio stock y sus propias tomas — una persona puede haber tomado la vitamina un día y la otra no, sin que los registros se mezclen.

Cada medicamento tiene uno o varios **tramos de dosificación**:

```
Medicamento: Omeprazol 20mg

Tramo 1: 01/01/2026 → 15/01/2026  |  1 comprimido/día  |  por la mañana
Tramo 2: 16/01/2026 → 28/02/2026  |  2 comprimidos/día |  mañana y noche
Tramo 3: 01/03/2026 → indefinido  |  1 comprimido/día  |  por la mañana
```

Cada tramo genera **tomas** en el calendario según su periodicidad. Cada toma individual puede:
- ✅ Marcarse como tomada (fecha prevista)
- 📅 Moverse a otra fecha (se tomó el viernes en vez del jueves)
- ❌ Marcarse como saltada con nota opcional

**Stock de medicamentos:**
- El usuario puede indicar cuántas unidades quedan
- Al marcar una toma como tomada → descuenta unidades automáticamente
- Cuando el stock llega al mínimo configurado → alerta en el Dashboard
- Stock modificable manualmente en cualquier momento

**Calendario:** las tomas aparecen en el Calendario solo si el usuario lo activa por medicamento (desactivado por defecto para no saturar el calendario).

---

### Detalle módulo: BIENESTAR

**Privacidad:** la mayoría de datos son privados por usuario. Excepción: peso y medidas puede introducirlos cualquier miembro de la pareja para el otro (ej: Ainhoa introduce los datos de su chico). El planificador de comidas puede ser conjunto (ambos planifican la semana juntos) pero el registro real de lo que cada uno comió es siempre individual — si uno al final no comió lo planificado, puede registrar lo que comió en su lugar sin afectar al otro. Los macros diarios son siempre por persona.

Sub-secciones:
- **Perfil nutricional** — objetivos diarios personales de calorías, proteína, carbohidratos y grasas
- **Registro de comidas** — qué has comido cada día con macros. Importa desde recetas del planificador de Comida
- **Movimiento** — pasos, calorías quemadas, NEAT, ejercicio. Introducción manual (con opción de importar desde Apple Health en el futuro)
- **Peso y medidas** — registro completo compatible con báscula inteligente Feelfit:
  - Peso, IMC
  - % grasa corporal, % masa muscular, % agua corporal
  - Masa ósea, masa muscular (kg), grasa visceral
  - Metabolismo basal (kcal)
  - Edad metabólica
  - Medidas manuales: cintura, cadera, pecho, brazos, muslos
  - Objetivos por métrica con barra de progreso y tiempo estimado para alcanzarlos
  - Gráfica de evolución por métrica
  - Cualquier usuario puede introducir datos para otro usuario de la pareja
- **Métricas personales** — horas de sueño, energía, estado de ánimo, cualquier métrica custom

#### Perfil nutricional personal
Cada usuario configura sus objetivos diarios:
```
Calorías objetivo:     2000 kcal
Proteína objetivo:     150g
Carbohidratos:         200g
Grasas:                65g
```
Estos objetivos pueden cambiar con el tiempo — se guardan con fecha para ver evolución.

#### Registro de comidas y macros
- Cada entrada del día se organiza por momento: desayuno / comida / cena / snack
- **Tres orígenes posibles para cada entrada:**
  1. **Desde el planificador** — si ese día hay una receta planificada, aparece pre-cargada con sus macros. Se puede confirmar con un tap o eliminarla si no se cocinó
  2. **Añadir comida suelta** — el usuario escribe qué comió con sus macros manualmente (nombre + calorías + proteína + carbs + grasas). Para días en que se comió fuera, se improvisó, o se cambió la receta planificada
  3. **Sustituir receta planificada** — si había una receta en el plan pero se comió otra cosa, se puede eliminar la planificada y añadir una entrada libre o seleccionar otra receta
- Vista diaria: barra de progreso de cada macro (consumido vs objetivo)
- Vista semanal: cumplimiento del plan nutricional día a día
- El registro es individual — cada usuario ve y edita solo el suyo

#### Planificador semanal conjunto (en módulo Comida, conectado con Bienestar)
- El planificador de Comida puede usarse de forma conjunta: ambos planifican la semana juntos eligiendo recetas para cada día
- Cada receta tiene macros por ración y número de raciones por persona
- Al planificar la semana el sistema calcula automáticamente los macros diarios previstos para cada persona
- **Registro individual de lo comido:** cada persona confirma si comió la receta planificada o si comió otra cosa. Si uno no siguió el plan, puede registrar lo que comió en su lugar sin afectar al registro del otro
- Si algún día alguno se queda corto de proteína según el plan, el sistema puede sugerirle cómo completarlo; si alguno se pasa de calorías, lo avisa
- Las raciones pueden ser distintas para cada persona en la misma receta

#### Movimiento
- Registro diario: pasos, calorías activas, minutos de ejercicio, tipo de actividad
- Introducción manual rápida (número de pasos del día, actividades realizadas)
- Objetivos configurables: pasos diarios, calorías quemadas, minutos activos
- Conectado con Hábitos: un hábito de ejercicio puede alimentar automáticamente el registro de movimiento
- **Feature futura:** importación desde Apple Health (solo app nativa iOS, sin coste)

---

### Detalle módulo: ESTUDIOS

Sub-secciones:
- **Asignaturas** — con color personalizado, tipo (Grado Superior / Universidad / otro), estado (activa / archivada)
- **Banco de preguntas** — ver tipos abajo
- **Temario** — estructura jerárquica: sección → tema → punto → subpunto. Soporte de fórmulas con KaTeX
- **Simulacros / Exámenes** — modo examen con temporizador y resultado final
- **Estadísticas** — rendimiento por asignatura y tema, evolución en el tiempo
- **Fechas de exámenes** — aparecen en el Calendario. Compartibles con otros usuarios

#### Tipos de preguntas soportados
- **Test (opción múltiple)** — 1 respuesta correcta de N opciones. Formato habitual: 40 preguntas
- **Preguntas cortas / desarrollo** — respuesta libre con respuesta modelo para comparar
- **Casos prácticos** — enunciado largo con preguntas asociadas
- **Flashcards** — anverso/reverso, sistema de repaso por memoria
- **Ejercicios matemáticos** — enunciado con fórmulas KaTeX, solución paso a paso con fórmulas

#### Modo examen
- El usuario configura: asignatura(s), número de preguntas, tiempo límite
- Las preguntas se seleccionan aleatoriamente del banco
- Durante el examen: solo se puede avanzar, no volver (configurable)
- Al terminar: resultado, respuestas correctas/incorrectas, tiempo empleado
- Historial de todos los simulacros realizados con fecha y puntuación
- **Estadísticas:** qué preguntas/temas falla más, evolución de puntuación en el tiempo, racha de práctica

---

### Detalle módulo: VIAJES

#### Estados de un viaje
Pendiente (planeando) → Confirmado (reservas hechas) → En curso → Completado / Cancelado

#### Sub-secciones de cada viaje
- **Datos básicos** — destino(s), fechas, participantes, estado, portada/foto
- **Presupuesto y gastos** — presupuesto total estimado, gastos reales conectados con Tricount/Finanzas. Desglose por categoría (transporte, alojamiento, comida, actividades...)
- **Alojamiento** — nombre, dirección, confirmación, fechas de check-in/out, precio, enlace, PDF de reserva
- **Transporte** — vuelos, trenes, coches de alquiler. Número de reserva, horarios de salida/llegada, precio, PDF del billete
- **Plan día a día** — calendario del viaje con actividades asignadas a cada día:
  - Nombre de la actividad/visita, hora de inicio, duración estimada
  - Tiempo de desplazamiento entre actividades (a pie, transporte...)
  - Marcar como imprescindible o opcional
  - Estado: pendiente / hecho
  - El sistema calcula cuánto cabe en cada día según los tiempos
- **Qué ver** — lista general de lugares/actividades de interés para ese destino:
  - Marcar como imprescindible, quiero ver, o si da tiempo
  - Asignar a un día del plan o dejar sin asignar
- **Documentos** — PDFs adjuntos (billetes, reservas, seguro de viaje, vouchers...)
- **Lista de equipaje** — checklist con plantillas reutilizables por tipo de viaje (playa, montaña, ciudad, larga duración...)

#### Mapa de viajes visitados
- Mapa del mundo con ciudades/destinos marcados
- Colores por estado: visitado (verde) / quiero visitar (terracota)
- Estadísticas:
  - % de países visitados del mundo
  - % por continente
  - % de ciudades visitadas vs ciudades marcadas como "quiero ver" dentro de cada país
  - Lista de países visitados y pendientes

---

### Detalle módulo: OBJETIVOS

Un objetivo es una meta con seguimiento de progreso. Puede ser personal o compartido con otra persona. Se diferencia de Hábitos en que un objetivo tiene un resultado concreto a alcanzar, mientras que un hábito es algo que repites regularmente. Ambos se pueden vincular: un hábito puede contribuir al progreso de un objetivo.

#### Tipos y campos
- **Visibilidad:** personal (privado) o compartido (elegir con quién)
- **Fecha límite:** opcional — puede ser un objetivo abierto sin fecha concreta
- **Tipo de progreso:**
  - **Numérico** — ej: ahorrar 1.000€ → voy por 430€
  - **Por hitos** — pasos concretos que hay que completar (ej: "Buscar piso" → hito 1: ver 5 pisos, hito 2: hacer oferta, hito 3: firmar)
  - **Porcentaje manual** — el usuario actualiza el % a mano
- **Estados:** activo / pausado / completado / abandonado

#### Integraciones con otros módulos
- **Vinculación con Hábitos:** uno o varios hábitos pueden contribuir al progreso de un objetivo. Ej: el hábito "Salir a correr 3 veces/semana" contribuye al objetivo "Preparar una carrera de 10km"
- **Vinculación con Finanzas:** los objetivos de ahorro se calculan automáticamente a partir del patrimonio neto (saldos + inversiones - deudas). Al actualizar cualquier dato financiero, el progreso del objetivo se recalcula. Se puede ver el progreso individual, el de la pareja y el conjunto.
- **Vinculación con 7º Arte:** los objetivos de lectura o visualización se actualizan automáticamente cuando se marca una película/libro como visto/leído (conectado con los objetivos anuales de 7º Arte)

#### Vista
- Lista de objetivos activos con barra de progreso y estado
- Vista detallada de cada objetivo con historial de hitos y evolución en el tiempo
- Objetivos completados en sección de archivo

---

### Detalle módulo: LUGARES

Módulo para guardar y organizar sitios físicos que quieres visitar o que ya has visitado — especialmente restaurantes, bares, cafeterías, tiendas y cualquier lugar local o de ciudades que visitas. Complementario a Viajes (que cubre destinos y viajes planificados): Lugares es para el día a día y para guardar recomendaciones.

#### Ficha de cada lugar
- Nombre, tipo (restaurante / bar / cafetería / tienda / museo / otro)
- Dirección o ubicación (lat/lng guardada desde el inicio, preparada para mapa futuro)
- Ciudad / zona
- Estado: **quiero ir** · **he ido** · **favorito**
- Puntuación personal (1–10) — solo si ya has ido
- Fecha(s) de visita — puede haberse ido varias veces
- "Visitado con" — usuarios de la app (ej: "fui con mi chico", "fui con mi madre")
- Notas libres (ej: "pedir el menú del día los martes", "reservar con antelación")
- Etiquetas personalizables (ej: "romántico", "barato", "para llevar a mamá", "terraza")
- Enlace externo (Google Maps, web del sitio, Instagram...)

#### Listas temáticas
El usuario puede crear listas con nombre propio para organizar sus lugares:
- Ejemplos: "Restaurantes para ir con mamá", "Cenas románticas", "Sitios de Madrid que me gustan", "Cafeterías para trabajar"
- Cada lista puede ser privada o compartida (elegir con quién)
- Un lugar puede pertenecer a varias listas a la vez

#### Vista de mapa (futura)
- Los lugares tienen lat/lng guardada desde el inicio
- Cuando se implemente el mapa, se mostrarán como pins con colores según estado (quiero ir / visitado / favorito)
- No bloquea el desarrollo — los datos ya estarán listos cuando llegue la feature

#### Conexión con Viajes
- Al planificar un viaje, los lugares guardados en ese destino aparecen como sugerencias en la sección "Qué ver" del viaje
- Un lugar marcado como visitado durante un viaje puede vincularse al viaje correspondiente

---

### Detalle módulo: HÁBITOS

Inspirado en **Habitify** — interfaz limpia, check rápido, estadísticas visuales.

#### Ficha de cada hábito
- Nombre, descripción, icono, color
- Categoría personalizable (Salud, Hogar, Deporte, Pareja, Personal, Trabajo...)
- Periodicidad flexible:
  - Diaria
  - X veces por semana (ej: 3 veces/semana)
  - Días específicos (ej: lunes, miércoles y viernes)
  - Cada N días
  - Mensual
- Participantes opcionales — si hay más de uno y uno lo marca como hecho → se marca para todos
- Vinculable con una tarea de Hogar (aparece también en Hogar como tarea recurrente)
- Vinculable con un Objetivo (cumplir el hábito contribuye al progreso del objetivo)
- Activo/archivado (archivar no borra el historial)

#### Check diario
- Vista principal: lista de hábitos de hoy con check rápido
- Los hábitos compartidos muestran también el estado del otro participante
- Se puede marcar como hecho, fallado, o saltado (con nota opcional)
- Editable a posteriori si se olvidó marcar

#### Estadísticas (por hábito y global)
- Racha actual y racha máxima
- Porcentaje de cumplimiento semanal, mensual y global
- Gráfica tipo GitHub (cuadrícula de días coloreados por estado)
- Resumen semanal y mensual
- Los hábitos compartidos muestran estadísticas propias y del otro participante

---

### Detalle módulo: GIFTS TRACKER

#### Lógica de privacidad de regalos
- Los regalos **para mi pareja** son secretos por defecto — la otra persona no los ve
- Los regalos **para otras personas** (madre, amigos...) pueden verlos ambos — útil para coordinarse
- Existe una **lista de deseos conjunta de pareja** — ambos la ven y añaden cosas que quieren que les regalen mutuamente
- Cada idea individual puede marcarse como secreta o visible independientemente

#### Ficha de cada idea de regalo
- Persona destinataria (usuario de la app o externo)
- Nombre de la idea, descripción, enlace, precio estimado
- Estado: idea / reservado / comprado / entregado
- Ocasión vinculada (cumpleaños, navidad, aniversario, graduación...)
- Notas privadas

#### Ocasiones
- Fecha de la ocasión con recordatorio configurable (ej: aviso 2 semanas antes)
- Las fechas de ocasiones aparecen en el Calendario
- Personas con ocasiones próximas aparecen en el Dashboard como alerta
- Las ocasiones recurrentes (cumpleaños, aniversarios) se vinculan automáticamente con la categoría Fechas especiales del Calendario

#### Lista conjunta de pareja (dentro del módulo Gifts)
Lista especial "Para nosotros" visible para ambos miembros de la pareja:
- Cualquiera de los dos puede añadir items que quiere que le regalen o que quieren comprar juntos
- Cada item tiene: nombre, enlace, precio estimado, prioridad (imprescindible / me gustaría / algún día), quién lo añadió
- Al comprar un item se marca como comprado (visible para ambos)
- Accesible desde una pestaña fija dentro del módulo Gifts

---

### Detalle módulo: CALENDARIO

El Calendario es el módulo más transversal de la app. Funciona como un Google Calendar con capas de datos que vienen de todos los módulos activos, más calendarios propios que el usuario puede crear libremente.

#### Vistas principales
- **Mensual** — visión general del mes, eventos de todos los módulos activos sobre una cuadrícula de días
- **Semanal** — vista detallada semana a semana con bloques horarios (como Google Calendar)
- **Agenda** — listado cronológico de próximos eventos estilo lista, ordenados por fecha

#### Pestaña: Pendientes y próximos
Una sección dedicada dentro del Calendario con tres bloques:
- **Pendientes de hoy** — todo lo que toca hoy: tareas, hábitos, tomas de medicamentos, recordatorios, gastos recurrentes a pagar
- **Próximos (7 días)** — lo que viene esta semana: citas, vencimientos, eventos planificados
- **Futuro** — vista extendida de lo que hay en el horizonte: exámenes, ITV, suscripciones, viajes...

Esta sección sirve como centro de control diario sin tener que ir módulo a módulo.

#### Tipos de calendarios — sistema de capas

El Calendario tiene dos tipos de calendarios que conviven:

**1. Calendarios automáticos de módulo**
Cada módulo activo genera su propio calendario automáticamente, con el color que ese usuario tenga asignado a ese módulo en Ajustes. El usuario puede mostrar u ocultar cada uno, pero no crearlos ni borrarlos — existen mientras el módulo esté activo.

**2. Calendarios propios (creados por el usuario)**
El usuario puede crear calendarios adicionales con nombre y color libre para cualquier cosa que no encaje en los módulos automáticos, o para añadir eventos manuales de forma organizada:

Cada calendario propio tiene:
- **Nombre** libre (ej: "Personal", "Pareja", "Familia", "Trabajo externo", "Eventos sociales"...)
- **Color** elegido por el usuario — selector de color libre, no limitado a la paleta de módulos
- **Visibilidad** — privado (solo yo) o compartido (elegir con quién)
- Puede editarse y borrarse en cualquier momento. Al borrar un calendario propio, se pregunta si borrar también sus eventos o moverlos a otro calendario.

Los calendarios propios aparecen en el panel de filtros junto a los automáticos. El usuario puede activar/desactivar la visibilidad de cualquiera desde ahí.

**Gestión de calendarios**
Accesible desde un panel lateral dentro del módulo Calendario (tipo Google Calendar — lista de todos los calendarios con checkbox de visibilidad y opciones de edición):
- Sección "Mis calendarios" — los que ha creado el usuario + los automáticos de sus módulos
- Sección "Calendarios compartidos" — los que otros usuarios han compartido con él
- Botón "Nuevo calendario" siempre visible al pie de "Mis calendarios"

#### Filtros por módulo
Panel de filtros / lista de calendarios lateral o desplegable:
- Checkbox de visibilidad por cada calendario (automático y propio)
- Por persona: mis calendarios / calendarios de la pareja / de la madre / conjuntos
- Los filtros se guardan como preferencia del usuario (persisten entre sesiones)

#### Categoría: Fechas especiales ⭐
Dentro del Calendario existe una categoría especial **Fechas especiales** para cumpleaños, aniversarios y cualquier fecha recurrente importante. Sustituye al anterior módulo independiente "Fechas importantes".

Cada fecha especial tiene:
- Nombre (ej: "Cumpleaños de mamá", "Aniversario con mi chico")
- Persona vinculada (usuario de la app o contacto externo con nombre)
- Tipo: cumpleaños / aniversario / fecha de fallecimiento / evento anual / otro
- Se repite automáticamente cada año
- Aviso configurable con antelación (ej: 1 semana antes, 1 mes antes)
- Visibilidad: privada o compartida con usuarios concretos
- Vinculación automática con Gifts: cuando se acerca una fecha de cumpleaños, aparece el acceso directo a las ideas de regalo de esa persona

#### Eventos automáticos desde módulos
Todos los siguientes aparecen automáticamente en el calendario si el módulo está activo. El usuario puede desactivar cualquier tipo desde los filtros:

| Módulo | Qué aparece |
|--------|-------------|
| Estudios | Fechas de exámenes |
| Salud | Citas médicas |
| Salud | Tomas de medicamentos (solo si activado por medicamento) |
| Viajes | Inicio y fin de viaje, actividades del día a día del viaje |
| Vehículos | Vencimiento ITV, vencimiento seguro, próxima revisión |
| Gifts | Ocasiones de regalo próximas |
| Calendario › Fechas especiales | Cumpleaños y aniversarios |
| Finanzas | Vencimiento de suscripciones, gastos recurrentes |
| Hogar | Tareas recurrentes (si el usuario lo activa) |
| Hábitos | Solo los que el usuario active explícitamente |
| Trabajo | Vacaciones y festivos (si marcados como compartidos) |
| Objetivos | Fechas límite de objetivos activos |

#### Eventos manuales
El usuario puede crear eventos manuales que no vienen de ningún módulo (ej: "cena con amigos", "reunión", "dentista informal"):
- Vinculables opcionalmente a un módulo existente
- O independientes sin vinculación
- Con participantes, notas, color personalizado y check de completado

#### Checks en el calendario
Los eventos que lo permiten tienen un check para marcarlos como hechos directamente desde el calendario sin entrar al módulo:
- Tareas del hogar ✓
- Hábitos ✓
- Tomas de medicamentos ✓
- Gastos recurrentes (marcar como pagado) ✓

---

### Detalle módulo: VEHÍCULOS

Un vehículo puede ser compartido entre varios usuarios (ej: coche de los padres usado por Ainhoa y su chico). Ambos pueden ver y actualizar los datos.

#### Ficha del vehículo
- Marca, modelo, matrícula, año, color
- Propietario real (texto libre — ej: "Padres de Ainhoa")
- Usuarios que lo usan (usuarios de la app)

#### Registro de kilómetros
- El usuario registra los km actuales en una fecha concreta (ej: una vez al mes)
- El sistema guarda el historial de lecturas de km con fecha
- A partir de las lecturas estima la media de km/mes y proyecta cuándo se alcanzarán los próximos hitos de mantenimiento

#### Mantenimiento — lógica de km y tiempo
Cada tarea de mantenimiento tiene dos umbrales (se avisa cuando se cumple cualquiera de los dos):
- **Por km:** cada X km desde el último servicio (ej: cambio de aceite cada 10.000 km)
- **Por tiempo:** cada X meses desde el último servicio (ej: aunque no llegues a los km, cada 12 meses)

```
Cambio de aceite:
  Último servicio:    mes 01/2026 a 100.000 km
  Próximo por km:     110.000 km  (faltan ~8.000 km — estimado en 4 meses)
  Próximo por tiempo: 01/2027
  Barra de progreso:  [████████░░] 80% — aviso al 90%
  Coste último servicio: 85,00 €
```

- Barra de progreso por cada tarea de mantenimiento (la que llegue antes — km o tiempo)
- Aviso cuando queda un 10% para el próximo servicio
- Historial de cada tipo de mantenimiento con fecha, km y coste

#### ITV y Seguro
- ITV: fecha de la última ITV, fecha de la próxima, resultado, coste
- Seguro: compañía, vencimiento, precio anual, tipo de cobertura

#### Gastos y multas
- Gastos de combustible: fecha, litros, precio/litro, total, km en ese momento
- Multas: fecha, importe, motivo, estado (pagada/pendiente/recurrida)
- Todos los gastos conectados con Finanzas

---

### Ajustes y Perfil

**Acceso:** icono con la inicial del usuario (o avatar) en la esquina superior derecha del topbar. Al hacer clic abre un menú desplegable con dos opciones: **Ajustes** y **Cerrar sesión**. No hay enlace de ajustes en el sidebar.

#### Perfil personal
- **Nombre de display** — el nombre que aparece en la app y en el selector de participantes
- **Avatar** — tres opciones: inicial del nombre (por defecto), emoji elegido del selector, o imagen subida
- **Email** — visible pero no editable (es el login de Supabase Auth)
- **Cambiar contraseña** — flujo estándar con email de confirmación

#### Apariencia
- **Tema:** claro / oscuro / seguir al sistema (por defecto: seguir al sistema)
- El modo oscuro usa la paleta dark definida en la sección 3

#### Módulos activos
- Lista de todos los módulos con toggle on/off por usuario (excepto Calendario y Dashboard, que siempre están activos y no se pueden desactivar)
- Cada usuario puede activar solo los módulos que usa — los demás no aparecen en su sidebar
- Al desactivar: aviso de que los datos no se borran, solo se oculta el módulo
- Al reactivar: todos los datos siguen intactos
- Reordenar favoritos del sidebar (drag & drop, máx. 5)

#### Colores de módulo
- Panel visual con los 17 tonos de la paleta Fatumsaurus como opciones clicables
- Cada módulo muestra su color actual asignado (o gris neutro si está en "sin color")
- **Un color solo puede pertenecer a un módulo a la vez** — los tonos ya asignados a otro módulo aparecen bloqueados y no se pueden seleccionar
- **"Sin color" es el mecanismo de liberación:** para mover un color de un módulo a otro, hay que poner uno de los dos en "sin color" primero, liberando ese tono. No hay swap directo
- **Varios módulos pueden estar en "sin color" al mismo tiempo** — especialmente útil en la primera configuración cuando el usuario quiere reorganizar toda la paleta
- Módulo en "sin color" → aparece en gris neutro en sidebar y calendario
- Los cambios son por usuario — cada uno configura su propia combinación de colores independientemente

#### Grupos de conveniencia
- Crear, editar y borrar grupos (ej: "Mi pareja", "Familia", "Casa")
- Ver qué usuarios están en cada grupo
- Usados como atajos en el ParticipantPicker

#### Usuarios vinculados
- Ver con qué usuarios estás conectada en la app
- Lista de usuarios vinculados con nombre y avatar
- Los usuarios vinculados aparecen disponibles en el ParticipantPicker de todos los módulos
- **Nota:** los usuarios se crean manualmente por Ainhoa desde Supabase (Authentication → Invite user). No hay flujo de auto-registro público ni panel de gestión de usuarios dentro de la app — toda la gestión de cuentas se hace directamente en el panel de Supabase.

#### Notificaciones
- Toggle global de notificaciones in-app (campana)
- Toggle por módulo: activar/desactivar notificaciones de cada módulo individualmente
- Configurar antelación de avisos para eventos próximos (ej: 1 semana / 3 días / 1 día antes)
- **Notificaciones push** (futuro, sin coste): se añadirá un toggle aquí cuando se implemente. Ver detalle en sección 10 → Centro de notificaciones.

#### Moneda y formato numérico
- **Moneda base:** € (euro) — fija para toda la app
- **Formato obligatorio en TODOS los campos económicos** (sin excepción): separador de miles con punto, dos decimales siempre
  - Correcto: `1.234,56 €` / `1.000,00 €` / `999,00 €`
  - Incorrecto: `1234.56` / `1000` / `999`
  - Cualquier cantidad a partir de 1.000€ debe mostrar el punto de miles
  - Implementar con `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`
- **Excepción — módulo Viajes:** cada viaje puede tener una moneda secundaria para gastos en el extranjero. Los totales del viaje se muestran en ambas monedas. El tipo de cambio se introduce manualmente.

#### Productos (alias inventario)
- Tabla de alias de productos: emparejar nombres de ticket con nombres en recetas
- Editable para corregir emparejamientos incorrectos o añadir nuevos

#### Onboarding (primera vez)
El onboarding es igual para todos los usuarios — tanto el primero que crea la app como los que llegan por invitación:
1. Pantalla de bienvenida con logo Fatumsaurus y tagline "Tu destino, tu orden"
2. "¿Cómo te llamas?" → nombre de display
3. "¿Qué quieres usar?" → selección de módulos (todos activados por defecto, puede desmarcar)
4. "¿Qué pones en favoritos?" → selección de hasta 5 módulos para el sidebar rápido
5. Listo → entra al Dashboard

Los usuarios invitados que llegan con datos ya compartidos (ej: la pareja llega y ya hay items de Hogar compartidos) los ven directamente al terminar el onboarding sin necesidad de configuración extra.

---

## 6. ESTRUCTURA DE BASE DE DATOS (SUPABASE)

### Tablas core

```sql
-- Perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id            uuid REFERENCES auth.users PRIMARY KEY,
  display_name  text NOT NULL,
  avatar_url    text,
  created_at    timestamptz DEFAULT now()
);

-- Grupos de conveniencia (atajos opcionales, no estructurales)
CREATE TABLE groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE group_members (
  group_id  uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES profiles(id),
  PRIMARY KEY (group_id, user_id)
);

-- Preferencias de módulos por usuario
CREATE TABLE user_module_preferences (
  user_id     uuid REFERENCES profiles(id),
  module_slug text NOT NULL,
  enabled     boolean DEFAULT true,
  sort_order  int DEFAULT 0,
  PRIMARY KEY (user_id, module_slug)
);
```

### Convención de participantes

Todas las tablas que soporten participantes siguen este patrón:

```sql
-- Tabla principal del item
CREATE TABLE [modulo]_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  uuid REFERENCES profiles(id) NOT NULL,
  ...campos del módulo...,
  created_at  timestamptz DEFAULT now()
);

-- Tabla de participantes del item
CREATE TABLE [modulo]_participants (
  item_id   uuid REFERENCES [modulo]_items(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES profiles(id),
  role      text DEFAULT 'participant',  -- 'owner' | 'participant'
  PRIMARY KEY (item_id, user_id)
);
```

### Row Level Security (RLS)

Activar RLS en todas las tablas. Política base para items con participantes:

```sql
-- Ver: soy el creador O soy participante
CREATE POLICY "ver items propios o participados" ON [modulo]_items
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM [modulo]_participants
      WHERE item_id = id AND user_id = auth.uid()
    )
  );

-- Editar: solo el creador
CREATE POLICY "editar solo propios" ON [modulo]_items
  FOR UPDATE USING (created_by = auth.uid());

-- Borrar: solo el creador
CREATE POLICY "borrar solo propios" ON [modulo]_items
  FOR DELETE USING (created_by = auth.uid());
```

---

## 7. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
fatumsaurus/
├── CLAUDE.md                      ← este archivo
├── .env.local                     ← variables de entorno (NUNCA en git)
├── .gitignore                     ← debe incluir .env.local desde el primer commit
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── public/
│   ├── logo.png                   ← logo oficial Fatumsaurus
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← layout raíz con providers
│   │   ├── page.tsx               ← redirect a /dashboard
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (app)/
│   │       ├── layout.tsx         ← layout con sidebar
│   │       ├── dashboard/page.tsx
│   │       ├── calendario/page.tsx
│   │       ├── finanzas/
│   │       │   ├── page.tsx
│   │       │   ├── gastos/page.tsx
│   │       │   ├── tricount/page.tsx
│   │       │   ├── conjunta/page.tsx
│   │       │   ├── inversiones/page.tsx
│   │       │   └── suscripciones/page.tsx
│   │       ├── hogar/page.tsx
│   │       ├── comida/page.tsx
│   │       ├── septimo-arte/page.tsx
│   │       ├── lugares/page.tsx
│   │       ├── salud/page.tsx
│   │       ├── bienestar/page.tsx
│   │       ├── trabajo/page.tsx
│   │       ├── estudios/page.tsx
│   │       ├── viajes/page.tsx
│   │       ├── vehiculos/page.tsx
│   │       ├── gifts/page.tsx
│   │       ├── objetivos/page.tsx
│   │       ├── habitos/page.tsx
│   │       └── ajustes/page.tsx
│   ├── components/
│   │   ├── ui/                    ← shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── TopBar.tsx
│   │   ├── shared/
│   │   │   ├── ParticipantPicker.tsx  ← selector de participantes (reutilizable)
│   │   │   └── ...
│   │   └── modules/
│   │       ├── finanzas/
│   │       ├── septimo-arte/
│   │       ├── habitos/
│   │       └── ...
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── utils.ts
│   │   └── constants.ts           ← slugs de módulos, lista de módulos, colores DEFAULT del sistema (no los del usuario — esos viven en Supabase user_module_colors)
│   ├── hooks/
│   ├── types/
│   │   ├── database.ts            ← generados con supabase gen types
│   │   └── app.ts
│   └── styles/
│       └── globals.css
├── supabase/
│   └── migrations/
│       ├── 001_profiles_and_groups.sql
│       ├── 002_module_preferences.sql
│       ├── 003_rls_policies.sql
│       └── ...
```

> ℹ️ La carpeta `fechas/` ha sido eliminada de la estructura — ya no existe como ruta propia. Los datos de fechas especiales viven en el módulo Calendario.

---

## 8. CONVENCIONES DE CÓDIGO

### TypeScript
- Siempre tipar explícitamente. No usar `any`.
- Tipos de base de datos en `src/types/database.ts` (generados con `supabase gen types`)
- Interfaces para props de componentes, types para datos y modelos

### Componentes
- Un componente por archivo, nombre PascalCase
- Props tipadas siempre
- Server Components por defecto; `'use client'` solo cuando sea necesario (interactividad, hooks)

### Componente ParticipantPicker
- Componente reutilizable para seleccionar participantes en cualquier módulo
- Muestra usuarios de la app que el usuario actual conoce (ha interactuado)
- Permite buscar por nombre
- Permite seleccionar grupos de conveniencia como atajo

### Supabase
- Cliente browser: `src/lib/supabase/client.ts`
- Cliente server: `src/lib/supabase/server.ts`
- Nunca hardcodear UUIDs en el código

### Estilos
- Tailwind para todo
- Variables CSS para la paleta en `globals.css` — en OKLCH
- No inventar colores fuera de la paleta definida
- **Glass/backdrop-filter:** usar siempre las clases CSS de `globals.css` (`.glass`, `.card-tech`, etc.) en lugar de inline style objects. Son más fiables en SSR/hidratación. Solo usar inline para gradientes personalizados que no tienen clase equivalente; en ese caso incluir siempre `WebkitBackdropFilter` junto a `backdropFilter`.
- **Wrappers de contenido de módulo:** no añadir `max-w-*` al div raíz del contenido. El ancho disponible lo gestiona el layout (sidebar + área principal). Sí usar `w-full`.
- **`new Date()` en componentes `'use client'`:** añadir `suppressHydrationWarning` en los elementos cuyo contenido o estilo dependa de la fecha/hora, para evitar errores de hidratación SSR↔cliente.

### Moneda y formato numérico
Ver detalle completo en **Ajustes → Moneda y formato numérico**. Resumen: euro (€) fijo, `Intl.NumberFormat('es-ES')`, punto de miles obligatorio desde 1.000€, dos decimales siempre, en todos los campos económicos sin excepción.

### Git
- Commits en español, descriptivos
- Una feature = un commit
- NUNCA commitear `.env.local`

---

## 9. FASES DE DESARROLLO

### Fase 0 — Setup del proyecto (sesión 1, antes de escribir código de producto)

> Objetivo: proyecto funcionando en local, desplegado en Vercel, con estructura base lista.

1. Crear proyecto Next.js 14 con TypeScript: `npx create-next-app@latest fatumsaurus --typescript --tailwind --app`
2. Instalar y configurar shadcn/ui
3. Instalar sonner: `npm install sonner`
4. Crear `globals.css` con todas las variables CSS (paleta base + dark mode desde el inicio)
5. Configurar Poppins desde Google Fonts en el layout raíz
6. Crear `.env.local` con las variables de Supabase (rellenar tras crear el proyecto en Supabase)
7. Añadir `.env.local` al `.gitignore` en el primer commit
8. `git init` → primer commit → repo privado en GitHub → conectar Vercel
9. Añadir variables de entorno en Vercel (Settings → Environment Variables)
10. Verificar que `npm run dev` y el deploy de Vercel funcionan correctamente

### Fase 1 — Estructura base (antes de cualquier módulo)

> Objetivo: la app es navegable, el login funciona, se puede ver el layout vacío.

1. Supabase: crear tablas core (profiles, groups, group_members, user_module_preferences, user_module_colors) + RLS
2. Auth: página de login, middleware de sesión, redirect a /dashboard si autenticado
3. Layout principal: Sidebar colapsable (desktop) + barra navegación inferior (móvil) + TopBar
4. Logo en sidebar: usar `/public/logo.png`; si no existe aún, placeholder de texto (ver sección 1)
5. Sistema de módulos activables/desactivables (toggle en Ajustes, reflejo en sidebar)
6. **Componente ParticipantPicker** — construir aquí, reutilizar en todos los módulos que lo necesiten
7. Página de Ajustes: perfil básico, módulos activos, colores de módulo, grupos de conveniencia
8. Sistema de colores desde Supabase: hook/context que lee `user_module_colors` y provee el color de cada módulo en toda la app
9. Onboarding básico: flujo de bienvenida para usuarios nuevos

### Fase 2 — Dashboard

> Objetivo: página de inicio útil desde el primer día.

10. Saludo personalizado con nombre del usuario y fecha
11. Vista de calendario del mes en curso (compacta, con eventos de módulos activos)
12. Lista de pendientes de hoy
13. Cards resumen por módulo (estructura vacía pero navegable — se rellenan conforme se construyen módulos)
14. Centro de notificaciones (campana) — estructura y lógica base

> ℹ️ Los orbes de fondo CSS ya están en `app/(app)/layout.tsx` desde la Fase 1 — no es necesario añadirlos en el dashboard por separado.

### Fase 3 — Finanzas (PRIORITARIO)

> El módulo más complejo y más usado. Construirlo completo antes de pasar a otros.

16. Gastos personales (CRUD, categorías, historial)
17. Tricount con participantes libres (grupos ad hoc, quién pagó, liquidaciones)
18. Cuenta conjunta (ingresos, gastos 50/50, balance neto en tiempo real)
19. Suscripciones (servicios recurrentes, fecha de renovación, alertas)
20. Inversiones (aportaciones modo masivo, valoraciones, rentabilidad, gráficas)
21. Parser de tickets Mercadona (pegar texto o subir PDF, asignación de líneas, conexión con inventario y Tricount)
22. Patrimonio neto (saldos manuales + inversiones + cuenta conjunta, gráfica de evolución)
23. Deudas personales

### Fase 4 — Resto de módulos

En el orden que decida Ainhoa según necesidades del momento. Orden sugerido por dependencias:

- **Hogar** (inventario, lista compra, tareas, limpieza, electrodomésticos) — depende de Finanzas para gastos
- **Comida** (recetas, planificador) — depende de Hogar para inventario
- **Hábitos** — independiente, buena base para Bienestar y Objetivos
- **Bienestar** — depende de Hábitos y Comida
- **Objetivos** — depende de Hábitos y Finanzas
- **Salud** (citas, medicamentos, especialistas, documentos)
- **Calendario** (completo: vistas, filtros, eventos de módulos, fechas especiales)
- **Trabajo** (fichajes, alumnos, nóminas)
- **Estudios** (banco de preguntas, simulacros)
- **Viajes** (plan día a día, presupuesto, mapa)
- **Vehículos** (mantenimiento, ITV, gastos)
- **Lugares** (listas temáticas, conexión con Viajes)
- **7º Arte** (películas, series, libros, APIs TMDB y Open Library)
- **Gifts** (privacidad de regalos, lista conjunta)

---

## 10. FUNCIONALIDADES TRANSVERSALES

### Dashboard — página de inicio

El Dashboard es la página de bienvenida. Se accede haciendo clic en el logo Fatumsaurus en la parte superior del sidebar. No aparece como item en el sidebar — el logo ES el acceso al Dashboard.

**Contenido del Dashboard:**
- Saludo personalizado con el nombre del usuario y la fecha actual
- **Vista de calendario del mes en curso** — versión compacta del Calendario con eventos de todos los módulos activos, coloreados por módulo
- **Lista de pendientes** — todo lo que hay que atender hoy y esta semana: hábitos pendientes, tareas, citas, tomas de medicamentos, vencimientos próximos
- **Cards resumen por módulo** — una card por cada módulo activo del usuario con información clave:
  - Solo se muestra la card si el módulo está activo Y tiene datos. Un módulo activo pero vacío no genera card.
  - El usuario puede elegir qué cards quiere ver desde Ajustes → Módulos (toggle por módulo en el Dashboard)
  - Cada card lleva el color del módulo y un enlace directo al módulo

**Cards resumen — ejemplos de contenido:**
- Finanzas → gastado este mes vs mes anterior
- Bienestar → pasos hoy, hábitos completados
- Salud → próxima cita, medicamentos pendientes hoy
- Estudios → próximo examen con cuenta atrás
- Hogar → tareas pendientes esta semana
- Hábitos → X de Y completados hoy
- Viajes → próximo viaje confirmado

---

### Centro de notificaciones (campana 🔔)

**Ubicación:** topbar, a la izquierda del avatar del usuario. Siempre visible.

**Globito indicador:**
- 🔴 Rojo con número → hay notificaciones urgentes sin leer
- 🟡 Amarillo con número → hay notificaciones pendientes sin leer
- Sin globito → todo al día

**Panel de notificaciones** — se abre al hacer clic en la campana. Organizado por prioridad y luego por fecha:

**Urgente 🔴** — requiere acción inmediata:
- ITV/seguro vencido (Vehículos)
- Medicamento sin stock (Salud)
- Bono médico agotado (Salud)
- Suscripción vencida sin renovar (Finanzas)

**Próximo 🟡** — hay algo que atender pronto:
- Cumpleaños/fecha especial en los próximos N días (Calendario)
- ITV/seguro próximo a vencer en 30 días (Vehículos)
- Examen en los próximos 3 días (Estudios)
- Suscripción próxima a renovarse (Finanzas)
- Ocasión de regalo próxima (Gifts)
- Fichaje olvidado — entrada o salida sin registrar (Trabajo)
- Sesiones de bono médico casi agotadas (Salud)

**Informativo 🟢** — para estar al tanto:
- Objetivo de 7º Arte: vas por detrás del ritmo
- Recordatorio mensual de actualización financiera (día 1 del mes)

**Cada notificación muestra:**
- Icono del módulo con su color
- Texto corto descriptivo
- Fecha/hora
- Enlace directo al item relacionado

**Acciones:**
- Marcar una notificación como leída (desaparece del contador)
- Marcar todas como leídas
- Las notificaciones leídas quedan en un historial accesible (no desaparecen del panel hasta que el usuario lo limpia)
- Las notificaciones también aparecen como listado de alertas en el Dashboard

**Configuración de notificaciones** — en Ajustes → Notificaciones:
- Toggle global on/off para toda la campana
- Toggle por módulo: activar/desactivar notificaciones de ese módulo
- Antelación configurable para avisos próximos (1 semana / 3 días / 1 día)

**Notificaciones push (futuro — sin coste):**
Web Push API + service worker en el navegador. Supabase Edge Functions como trigger. Coste: cero para el uso personal de esta app. Se añadirá un toggle en Ajustes → Notificaciones cuando se implemente. La arquitectura in-app actual sirve de base directa — no habrá que rehacer nada, solo añadir el canal de entrega.

---

### Gestión de usuarios — cómo dar de alta nuevos usuarios

La app es privada — no hay registro público. **Ainhoa crea todos los usuarios manualmente** desde el panel de Supabase:

1. Entrar en Supabase → Authentication → Users → "Invite user"
2. Poner el email real de la persona (pareja, madre...)
3. Supabase manda un email automático con un link de activación
4. La persona hace clic en el link, establece su propia contraseña, y pasa por el onboarding de la app
5. Una vez dentro, aparece disponible en el ParticipantPicker de Ainhoa para ser añadida a items compartidos

**Por qué emails reales y no cuentas inventadas:** cada persona gestiona sus propias credenciales sin que Ainhoa tenga que compartir contraseñas. Supabase envía el link directamente a quien corresponde. Más limpio y más seguro.

No hay panel de gestión de usuarios dentro de la app — todo se gestiona directamente desde el panel de Supabase. Suficiente para el número de usuarios previsto.

**Vinculación en la app:** una vez que el usuario existe en Supabase, Ainhoa lo vincula desde Ajustes → Usuarios vinculados. A partir de ese momento aparece disponible en el ParticipantPicker de todos los módulos.

**Eliminación de cuentas:** no implementada como flujo automático. Si un usuario deja de usar la app, Ainhoa gestiona la situación desde Supabase. Antes de desactivar o eliminar un usuario, la app debe ofrecer la opción de **reasignar sus datos compartidos a otro usuario activo** (ej: sus items en Hogar, sus participaciones en Tricount, etc.) o dejar que esos registros queden huérfanos. Los datos estrictamente privados de ese usuario (Salud, Bienestar, Trabajo...) pueden eliminarse o archivarse según se decida en ese momento. Esta lógica se implementará cuando sea necesaria — no es prioritaria en las primeras fases.

---

### Búsqueda global 🔍
- Icono de búsqueda accesible desde el sidebar (parte inferior) o shortcut Cmd+K / Ctrl+K
- Busca en tiempo real en todos los módulos activos del usuario
- Resultados agrupados por módulo con icono y color identificativos
- Ejemplos: buscar "fisio" → especialista en Salud + gasto en Finanzas + citas en Calendario

### Historial de cambios
- Cambios en datos importantes registrados con: fecha, hora, usuario, valor anterior y nuevo
- Aplica a: gastos, saldos, inversiones, aportaciones, medicamentos, fichajes, datos de salud
- No aplica a: notas, etiquetas, preferencias visuales
- Solo lectura — no se puede editar ni borrar el historial
- Accesible desde el propio item → botón "ver historial de cambios"

---

## 11. NOTAS PARA CLAUDE CODE

- **Nunca hacer cambios grandes de golpe.** Siempre en pasos pequeños y verificables.
- **Flujo obligatorio:** cambio → `npm run dev` → revisión visual de Ainhoa en local → visto bueno → `git add . && git commit && git push` → Vercel despliega automáticamente.
- **Los datos son sagrados.** Cero operaciones destructivas sin confirmación explícita.
- **Pedir confirmación** antes de cualquier migración de Supabase.
- **Variables de entorno:** `.env.local` NUNCA va a git. Las mismas variables deben configurarse manualmente en Vercel (Settings → Environment Variables) para que el deploy en producción funcione.
- **Ainhoa comunica en español casual.** Responder siempre en español.
- **Estilo iterativo:** describe en lenguaje natural → Claude implementa → Ainhoa revisa en local → ajuste → cuando todo está bien, commit y push.
- **Diseño:** consultar sección 3 antes de improvisar cualquier estilo. Consultar la tabla de colores por módulo (sección 3, Sistema de colores) para asignar el color correcto a cada elemento de UI.
- **Colores de módulo:** importar siempre desde el store/context del usuario (Supabase `user_module_colors`), nunca hardcodear hex directamente en componentes. No hay colores "por defecto" en código — el color es siempre lo que el usuario tenga configurado en Ajustes.
- **`constants.ts`** contiene: slugs de módulos, lista de módulos del sistema, y el color gris neutro para módulos en "sin color". NO contiene hex de colores de módulo — esos viven exclusivamente en `user_module_colors` de Supabase.
- **Toasts:** usar sonner para todo el feedback de UI (éxito, error, carga). No inventar otro sistema.
- **Logo:** si `/public/logo.png` no existe, usar placeholder de texto (ver sección 1). No romper la UI por un archivo que falta.
- **ParticipantPicker** debe construirse en Fase 1 y reutilizarse en todos los módulos que lo necesiten. No reinventarlo por módulo.
- Vercel auto-despliega al hacer push a `main`. No hace falta ningún comando extra de deploy.

---

## 12. HISTORIAL DE DECISIONES

| Fecha | Decisión | Razón |
|-------|----------|-------|
| Jun 2026 | Empezar desde cero | Evitar deuda técnica de proyectos anteriores |
| Jun 2026 | Next.js 14 + TypeScript | App grande y a largo plazo, TypeScript da robustez |
| Jun 2026 | Participantes por item (no grupos fijos) | Máxima flexibilidad — cualquier usuario en cualquier cosa |
| Jun 2026 | Grupos como atajos opcionales, no estructurales | Comodidad sin rigidez arquitectónica |
| Jun 2026 | Todos los usuarios son ciudadanos de primera clase | La madre, el padre, amigos — todos con cuenta completa |
| Jun 2026 | Módulos activables sin borrar datos | Ocultar ≠ eliminar |
| Jun 2026 | Suscripciones dentro de Finanzas | Es un tipo de gasto, no necesita módulo propio |
| Jun 2026 | Hábitos con participantes + periodicidad | Hábitos compartidos (ej: cambiar sábanas) con frecuencia configurable |
| Jun 2026 | Módulo renombrado a "7º Arte" | Más personalidad, engloba películas/series/libros |
| Jun 2026 | Lugares guarda lat/lng desde el inicio | Preparado para mapa futuro sin migración de datos |
| Jun 2026 | Liquid Glass selectivo | Rendimiento en móviles gama media |
| Jun 2026 | Poppins como tipografía | Redondeada, moderna, muy legible |
| Jun 2026 | Revisar en local antes de subir a GitHub | Control de calidad antes de desplegar |
| Jun 2026 | Salud dividido en dos módulos: Salud (médico) y Bienestar | Lógicas muy distintas — médico es historial/citas, bienestar es tracking diario |
| Jun 2026 | Medicamentos con tramos de dosificación | Un mismo medicamento puede cambiar de dosis en distintos periodos |
| Jun 2026 | Tomas de medicamentos: movibles a otra fecha y marcables como saltadas | La realidad no siempre coincide con el plan |
| Jun 2026 | Inventario de Hogar se alimenta de tickets, recetas lo descuentan | Un solo inventario, múltiples fuentes de entrada y salida |
| Jun 2026 | Lista de la compra se genera automáticamente desde stock mínimo y recetas | Cero trabajo manual cuando el sistema puede calcularlo solo |
| Jun 2026 | Calendario como item suelto sin grupo en el sidebar | Es transversal a todo — ponerlo dentro de un grupo lo haría parecer secundario |
| Jun 2026 | Calendarios propios con nombre y color libre + calendarios automáticos de módulo | Los automáticos cubren el 90% del uso; los propios dan libertad para el resto |
| Jun 2026 | Colores por módulo: independientes, sin agrupación por grupo | Más distinguible en calendario y dashboard; semánticamente coherente |
| Jun 2026 | Colores de módulo: sin defaults en código, 100% desde Supabase | La fuente de verdad es siempre user_module_colors. constants.ts solo tiene slugs y el gris neutro. Hasta que el usuario asigne colores, todos los módulos muestran gris neutro |
| Jun 2026 | Colores de módulo personalizables por usuario desde Ajustes | Cada uno elige su combinación; exclusividad garantizada: un color = un módulo |
| Jun 2026 | Opción "sin color" para módulos: gris neutro en sidebar y calendario | Permite resetear y reconfigurar desde cero |
| Jun 2026 | Logo Fatumsaurus en la parte superior del sidebar = acceso al Dashboard | El logo es la navegación a inicio; no hay item "Dashboard" en el sidebar |
| Jun 2026 | Dashboard: calendario mes + lista pendientes + cards resumen por módulo | Página de bienvenida con visión global de todo |
| Jun 2026 | Cards del Dashboard: solo si módulo activo Y tiene datos | Un módulo vacío no genera card |
| Jun 2026 | Ajustes accesibles desde avatar/inicial en topbar superior derecha | No en el sidebar; menú desplegable con Ajustes y Cerrar sesión |
| Jun 2026 | Avatar: inicial por defecto, o emoji, o imagen subida | Ligero y personalizable sin necesidad de subir foto obligatoriamente |
| Jun 2026 | Notificaciones organizadas por prioridad (urgente/próximo/informativo) | Lo más importante siempre visible primero |
| Jun 2026 | Notificaciones configurables por módulo desde Ajustes | Cada usuario decide qué módulos generan avisos |
| Jun 2026 | Notificaciones push diferidas a fase posterior — sin coste (Web Push API) | La arquitectura in-app actual sirve de base directa cuando se implemente. Ver sección 10 → Centro de notificaciones para el detalle completo |
| Jun 2026 | Modo oscuro planificado desde el inicio con CSS variables, implementación diferida | Variables dark definidas desde el setup; se implementa en fase posterior sin repasar todo el código |
| Jun 2026 | Usuarios creados con emails reales desde Supabase Invite | Cada uno gestiona sus propias credenciales; más limpio y seguro |
| Jun 2026 | Eliminación de cuentas no implementada — con opción de reasignación de datos | Al dar de baja un usuario, se puede elegir reasignar sus datos compartidos a otro usuario o dejarlos huérfanos |
| Jun 2026 | Registro de comidas en Bienestar: plan + sustitución + entradas libres | Flexibilidad total: seguir el plan, cambiarlo, o registrar lo que sea |
| Jun 2026 | App solo en español de momento | Multiidioma como idea futura sin prioridad |
| Jun 2026 | Fondo app ajustado a #F2ECD8 | El crema puro #FEFAE0 resultaba demasiado amarillo |
| Jun 2026 | Header de módulo con fondo #E8E0CC — más oscuro que el fondo de página | Diferencia el header fijo del contenido scrollable visualmente |
| Jun 2026 | Padding de página: 0 24px 24px en todos los módulos sin excepción | Evita que el contenido toque los bordes laterales |
| Jun 2026 | Padding-top 16px en área de contenido tras el header | Evita que el primer elemento quede pegado al separador del header |
| Jun 2026 | sonner para toasts/feedback de UI | Integración nativa con shadcn/ui, sin necesidad de sistema propio |
| Jun 2026 | Estilo glass futurista como estilo principal de toda la app | Reemplaza el estilo plano original. Backdrop-filter + orbes + card-tech en todos los módulos |
| Jun 2026 | Colores en OKLCH en globals.css | Espacio de color perceptualmente uniforme, mejor para transparencias y mezclas que hex/rgb |
| Jun 2026 | Orbes de fondo en `app/(app)/layout.tsx` — presentes en TODAS las páginas | No solo en dashboard. Tres orbes: teal top-right, petróleo bottom-left, ámbar centro |
| Jun 2026 | Clases CSS de globals.css para glass, no inline style objects | Las clases son fiables en SSR/hidratación. Los inline objects pueden variar de orden al recargar en dev |
| Jun 2026 | Tailwind v4 no añade -webkit-backdrop-filter automáticamente | Siempre usar inline `WebkitBackdropFilter` junto a `backdropFilter` cuando no se use una clase de globals.css |
| Jun 2026 | suppressHydrationWarning en elementos con new Date() | Los componentes 'use client' aún renderizan en SSR. La hora del servidor ≠ hora del cliente → mismatch de hidratación |
| Jun 2026 | Sin max-w en wrappers de contenido de módulo | Los módulos llenan el ancho disponible del área de contenido. Finanzas fue la referencia correcta |
| Jun 2026 | Dashboard: layout hero + 2 columnas (calendario 2/3, pendientes 1/3) + grid de tarjetas | En lg+: dos columnas con proporciones 2fr/1fr. En móvil/tablet: apilado. Tarjetas: 1→2→3→4 columnas |
| Jun 2026 | Sidebar: FATUM/SAURUS en dos líneas + logo 30×45px con ratio 2:3 | Logo portrait (1024×1536). `<Image width={30} height={45}>` — nunca `fill` en contenedor cuadrado |

---

## 13. IDEAS FUTURAS

Mejoras y funcionalidades que se han mencionado durante el diseño pero que no son prioritarias ahora. Se revisarán cuando la app esté funcionando. Ordenadas por prioridad aproximada.

| Prioridad | Idea | Módulo / Área | Notas |
|-----------|------|--------------|-------|
| 1 | Notificaciones push (navegador y móvil) | Transversal | Web Push API + service worker. Coste: cero. La arquitectura in-app actual sirve de base directa — solo añadir el canal de entrega. Toggle en Ajustes → Notificaciones cuando se implemente |
| 2 | Modo oscuro | Global | Variables CSS ya definidas desde el setup (sección 3). Solo hace falta implementar el `dark:` de Tailwind y conectar el toggle de Ajustes |
| 3 | Importación desde Apple Health | Bienestar | Pasos, calorías, sueño. Solo app nativa iOS, sin coste |
| 4 | Selector hex libre en colores de módulo | Ajustes | De momento solo paleta curada. Hex libre para usuarios que quieran total personalización |
| 5 | Mapa de Lugares con pins interactivos | Lugares | lat/lng ya guardada desde el inicio — sin migración de datos cuando se implemente |
| 6 | Vista de mapa en Viajes | Viajes | Misma arquitectura que Lugares |
| 7 | Parser de tickets para más supermercados | Finanzas | Mercadona ya hecho. Añadir Lidl, Carrefour, etc. a medida que se usen |
| 8 | Múltiples idiomas | Global | De momento todo en español. Sin prioridad real |

---

*Última actualización: Junio 2026 — estilo glass futurista implementado (sección 3 ampliada), clases CSS glass documentadas, convenciones de código actualizadas (OKLCH, webkit caveat, suppressHydrationWarning, sin max-w en módulos), historial de decisiones de diseño añadido*  
*Proyecto planificado y desarrollado con Claude Code (claude.ai)*
