# MEMORY.md - Resumen Extendido del Proyecto SamiStudio / AppStudio

## Indice

1. [Vision General](#vision-general)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Decisiones Tecnicas Clave](#decisiones-tecnicas-clave)
5. [Problemas Encontrados y Soluciones](#problemas-encontrados-y-soluciones)
6. [Flujo de Datos Completo](#flujo-de-datos-completo)
7. [API Routes](#api-routes)
8. [Hooks](#hooks)
9. [Componentes UI](#componentes-ui)
10. [Prompt del Sistema](#prompt-del-sistema)
11. [Modelos de IA](#modelos-de-ia)
12. [Paleta de Colores](#paleta-de-colores)
13. [Integracion Expo Snack](#integracion-expo-snack)
14. [Estado Actual y Proximos Pasos](#estado-actual-y-proximos-pasos)
15. [Comandos Utiles](#comandos-utiles)

---

## Vision General

SamiStudio es una plataforma web para generar aplicaciones moviles mediante inteligencia artificial. El usuario escribe un prompt en espanol (ej: "Crea una app de contador de pasos para reloj") y la IA genera codigo React Native/Expo completo y funcional, que se previsualiza en tiempo real dentro de un mockup de dispositivo (telefono Android o Galaxy Watch circular).

El proyecto esta construido con Next.js 16.2.4 App Router, desplegado en Vercel como serverless, y utiliza Ollama Cloud API para la generacion de codigo.

**Autor:** Sami (github.com/samilososami)
**Dominio previsto:** appstudio.samilososami.com
**Repositorio GitHub:** https://github.com/samilososami/appstudio

---

## Stack Tecnologico

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Framework | Next.js | 16.2.4 | App Router, serverless, Vercel |
| Lenguaje | TypeScript | 5.x | Tipado estatico |
| UI | React | 19.2.4 | Componentes declarativos |
| Estilos | Tailwind CSS | v4 | Utility-first CSS |
| Animaciones | Framer Motion | 12.38.0 | Transiciones y microinteracciones |
| Componentes UI | shadcn/ui | 4.6.0 | Base de componentes accesibles |
| Paneles | react-resizable-panels | 4.11.0 | Layout dividido ajustable |
| Iconos | lucide-react | 1.14.0 | Iconos SVG consistentes |
| QR | qrcode.react | 4.2.0 | Generacion de codigos QR |
| Expo | snack-sdk | 6.6.2 | Creacion programatica de Snacks |
| IA | Ollama Cloud | API | Generacion de codigo via LLM |
| Fuente | Inter (Google Fonts) | - | Tipografia principal |

---

## Estructura de Archivos

```
samistudio/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Proxy a Ollama Cloud (POST)
│   │   └── snack/
│   │       └── route.ts          # Creacion de Snack via snack-sdk (POST)
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx     # Contenedor del chat + header
│   │   │   ├── ChatMessage.tsx   # Burbuja individual de mensaje
│   │   │   ├── ChatMessageList.tsx # Lista scrollable + empty state
│   │   │   ├── ChatInput.tsx     # Input + boton enviar/detener
│   │   │   └── MarkdownRenderer.tsx # Renderizador inline de Markdown
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Layout principal con sidebar
│   │   │   ├── Sidebar.tsx       # Menu lateral (Chat, Ajustes)
│   │   │   └── SettingsPanel.tsx # Modal de ajustes (modelo + API key)
│   │   └── preview/
│   │       ├── PreviewPanel.tsx  # Contenedor del preview
│   │       ├── PhoneMockup.tsx   # SVG mockup de telefono Android
│   │       ├── WatchMockup.tsx   # SVG mockup circular Galaxy Watch
│   │       ├── DeviceToggle.tsx  # Toggle Telefono/Reloj con animacion
│   │       └── ExpoActions.tsx   # Botones QR + abrir en nueva pestana
│   ├── hooks/
│   │   ├── useChat.ts            # Gestion de estado del chat + extraccion de codigo
│   │   ├── useOllamaStream.ts    # Fetch al proxy + simulacion de escritura
│   │   └── useSnack.ts           # POST a /api/snack para crear preview
│   ├── providers/
│   │   └── SettingsProvider.tsx  # Context de API key y modelo (localStorage)
│   ├── lib/
│   │   ├── constants.ts          # SYSTEM_PROMPT, OLLAMA_MODELS, DEFAULT_MODEL
│   │   └── utils.ts              # No existe (usa lib/utils.ts global)
│   ├── types/
│   │   └── index.ts              # Message, DeviceType, AppSettings, SnackData
│   ├── page.tsx                  # Pagina principal: ResizablePanels + Chat + Preview
│   ├── layout.tsx                # Root layout con Inter font + SettingsProvider
│   └── globals.css               # Tailwind v4 @theme inline + colores water/bone
├── components/
│   └── ui/                       # Componentes shadcn/ui base
├── lib/
│   └── utils.ts                  # cn() helper (clsx + tailwind-merge)
├── public/
│   └── (vacio)                   # Assets estaticos
├── next.config.ts                # transpilePackages: ['snack-sdk']
├── package.json                  # Dependencias
├── tsconfig.json                 # Configuracion TypeScript
├── postcss.config.mjs            # PostCSS con @tailwindcss/postcss
├── README.md                     # Documentacion del proyecto
└── MEMORY.md                     # Este archivo
```

---

## Decisiones Tecnicas Clave

### 1. Stream: false en lugar de stream: true

**Problema:** El modelo `kimi-k2.6:cloud` de Ollama Cloud devuelve todo el texto (incluyendo el proceso de pensamiento) en `message.thinking` durante el streaming (`stream: true`), dejando `message.content` vacio. Esto hacia que el usuario viera el thinking completo en el chat.

**Solucion:** Usar `stream: false` en el body del fetch al proxy, obtener la respuesta completa como JSON, y simular el efecto de escritura en el cliente dividiendo el texto en chunks.

```typescript
// useOllamaStream.ts
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...payload, stream: false }), // stream: false
  signal: abortRef.current.signal,
});
const data = await res.json();
const fullText = data.message?.content || data.message?.thinking || '';

// Simulacion de escritura
const chunkSize = fullText.length > 500 ? 40 : 12;
const delay = fullText.length > 500 ? 2 : 8;
for (let i = 0; i < fullText.length; i += chunkSize) {
  onChunk(fullText.slice(i, i + chunkSize));
  await new Promise((r) => setTimeout(r, delay));
}
```

**Ventaja:** La respuesta llega completa sin mostrar thinking. La simulacion de escritura mejora la UX.

### 2. Proxy API Route para evitar CORS

**Problema:** Ollama Cloud no permite peticiones directas desde el navegador debido a CORS.

**Solucion:** Crear un API Route en Next.js (`app/api/chat/route.ts`) que recibe el body del cliente, anade el header `Authorization: Bearer <apiKey>`, y hace el fetch a `https://ollama.com/api/chat` desde el servidor.

**Seguridad:** La API key nunca se expone en el frontend. Va en el body de la peticion al proxy y se anade al header en el servidor.

### 3. Confirmacion instantanea para peticiones de app

**Problema:** Cuando el usuario pedia crear una app, la IA tardaba varios segundos en responder y el chat parecia congelado.

**Solucion:** Detectar si el mensaje del usuario contiene palabras como "crea", "haz", "genera", "app", "aplicacion" mediante regex. Si es una peticion de app, mostrar inmediatamente un mensaje de confirmacion: "iGenial! Voy a crear tu app. Dame un momento..."

```typescript
const isAppRequest = /crea|haz|genera|app|aplicacion|aplicacion/i.test(userText);
if (isAppRequest) {
  setMessages((prev) => [
    ...prev,
    { role: 'assistant', content: 'iGenial! Voy a crear tu app. Pensando...' },
  ]);
}
```

**Mejora posterior:** Se anadio un callback `onProgress` que actualiza el mensaje de confirmacion segun la fase actual:
- `thinking` -> "iGenial! Voy a crear tu app. Pensando..."
- `generating` -> "iGenial! Voy a crear tu app. Generando codigo..."

### 4. Extraccion de codigo Markdown

**Problema:** La IA responde con texto explicativo + un bloque de codigo Markdown. Necesitamos extraer solo el codigo para enviarlo a Expo Snack.

**Solucion:** Funcion `extractCodeBlock()` que:
1. Busca bloques ```jsx o ```tsx con regex
2. Extrae el contenido entre los backticks
3. El texto antes del bloque de codigo se usa como "resumen" para mostrar en el chat
4. Durante el streaming (bloque abierto sin cerrar), oculta el codigo parcial mostrando solo el resumen

```typescript
function extractCodeBlock(text: string): { code: string | null; summary: string } {
  const codeMatch = text.match(/```(?:jsx|tsx)?\n([\s\S]*?)```/);
  if (codeMatch) {
    const code = codeMatch[1].trim();
    const summary = text.split('```')[0].trim();
    return { code, summary };
  }
  // Bloque abierto sin cerrar (durante streaming)
  const openMatch = text.match(/```(?:jsx|tsx)?\n/);
  if (openMatch) {
    const summary = text.substring(0, openMatch.index).trim();
    return { code: null, summary: summary || 'Generando codigo...' };
  }
  return { code: null, summary: text };
}
```

### 5. Creacion de Snack via snack-sdk

**Problema:** Necesitamos crear un Expo Snack programaticamente con el codigo generado.

**Solucion:** API Route `app/api/snack/route.ts` que usa `snack-sdk`:

```typescript
const snack = new Snack({
  name,
  sdkVersion: '51.0.0',
  files: {
    'App.js': {
      type: 'CODE',
      contents: code,
    },
  },
  dependencies: {},
});
await snack.saveAsync();
const state = snack.getState();
const snackId = state.id;
```

**Nota:** `dynamic = 'force-dynamic'` es necesario para que funcione en Vercel serverless.

### 6. Preview limpia de Expo Snack

**Problema:** La URL normal de Expo Snack muestra el editor completo. Queremos solo la preview del dispositivo.

**Solucion:** Usar la ruta `/embedded/` con parametros para minimizar la UI:
```
https://snack.expo.dev/embedded/{snackId}?preview=true&platform=android&supportedPlatforms=android&theme=dark&deviceAppearance=dark
```

**Parametros utilizados:**
- `preview=true` - Muestra el panel de preview
- `platform=android` - Plataforma por defecto
- `supportedPlatforms=android` - Solo muestra pestana Android
- `theme=dark` - Tema oscuro del embed
- `deviceAppearance=dark` - Apariencia del dispositivo oscura

### 7. Flujo de datos: page.tsx como orquestador

**Problema inicial:** `useChat` tenia su propia instancia de `useSnack`, y `page.tsx` tenia otra. La preview nunca recibia el SnackId.

**Solucion:** `page.tsx` crea una unica instancia de `useSnack`, extrae `createSnack`, y lo pasa como callback a `useChat`. Cuando la IA genera codigo, `useChat` llama a `onCodeGenerated?.(code)`, que ejecuta `createSnack(code)` desde `page.tsx`.

```typescript
// page.tsx
const { snackData, isCreating, error, createSnack } = useSnack();
const { messages, isStreaming, sendMessage, stopStreaming } = useChat(
  settings.model || 'kimi-k2.6:cloud',
  settings.apiKey,
  createSnack  // Callback que conecta chat -> snack
);
```

---

## Problemas Encontrados y Soluciones

### Problema 1: Thinking visible del modelo kimi-k2.6:cloud
**Sintoma:** Cuando se preguntaba "quien eres", la IA respondia con el thinking completo (proceso interno de razonamiento).
**Causa:** El modelo devuelve todo en `message.thinking` con `stream: true`.
**Solucion:** Cambiar a `stream: false` y usar `data.message?.content || data.message?.thinking || ''` para obtener el texto.

### Problema 2: Preview mostraba editor completo de Expo
**Sintoma:** El iframe mostraba el IDE de Expo Snack con codigo, pestanas, etc.
**Causa:** Usabamos la URL normal del Snack.
**Solucion:** Cambiar a `/embedded/{id}?preview=true` y anadir parametros para ocultar UI.

### Problema 3: Preview no se mostraba en el mockup
**Sintoma:** El iframe cargaba pero no mostraba la app.
**Causa:** El Snack no se estaba creando correctamente porque habia dos instancias de `useSnack`.
**Solucion:** Pasar `createSnack` como callback desde `page.tsx` a `useChat`.

### Problema 4: Markdown no renderizado
**Sintoma:** Los mensajes mostraban asteriscos y backticks en crudo.
**Causa:** No habia renderizador de Markdown.
**Solucion:** Crear `MarkdownRenderer.tsx` custom sin dependencias externas que renderiza **bold**, *italic* y `code` inline.

### Problema 5: Simulacion de escritura muy lenta
**Sintoma:** Para respuestas largas (codigo), la simulacion tardaba demasiado.
**Causa:** Caracter por caracter a 8ms de delay.
**Solucion:** Chunk-based: 40 caracteres cada 2ms para textos > 500 chars, 12 chars cada 8ms para textos cortos.

### Problema 6: Appetize URL directo no funciona
**Sintoma:** Intentamos obtener el URL directo de Appetize (el servicio de emulacion que usa Expo) para una preview mas limpia.
**Causa:** El parametro `snack-channel` es dinamico y se genera por JavaScript en el cliente. No esta disponible en la API ni en el HTML estatico.
**Solucion:** Usar el iframe de Expo Snack `/embedded/` como solucion oficial. Es la forma recomendada por Expo.

### Problema 7: react-resizable-panels exports
**Sintoma:** Importar `PanelGroup` y `PanelResizeHandle` daba error.
**Causa:** La libreria exporta `Group`, `Panel`, y `Separator` (no `PanelGroup`/`PanelResizeHandle`).
**Solucion:** Usar los nombres correctos de exportacion.

---

## Flujo de Datos Completo

1. **Usuario escribe prompt** -> Se anade mensaje `user` al estado
2. **useChat detecta si es peticion de app** -> Muestra confirmacion instantanea
3. **useChat llama a useOllamaStream.send()** -> POST a `/api/chat`
4. **Proxy anade Authorization header** -> Fetch a `https://ollama.com/api/chat`
5. **Ollama Cloud devuelve JSON completo** -> `message.content` con texto
6. **useOllamaStream simula escritura** -> Llama a `onChunk` por chunks
7. **useChat acumula chunks** -> Actualiza mensaje `assistant` en tiempo real
8. **useChat extrae bloque de codigo** -> Al terminar, detecta ```jsx...```
9. **useChat llama onCodeGenerated(code)** -> page.tsx recibe el codigo
10. **page.tsx llama createSnack(code)** -> POST a `/api/snack`
11. **API Snack crea Snack con snack-sdk** -> `saveAsync()` genera snackId
12. **useSnack guarda snackData** -> page.tsx pasa snackId a PreviewPanel
13. **PreviewPanel renderiza iframe** -> `https://snack.expo.dev/embedded/{id}`

---

## API Routes

### POST /api/chat

**Request Body:**
```json
{
  "model": "kimi-k2.6:cloud",
  "messages": [{ "role": "user", "content": "..." }],
  "stream": false,
  "apiKey": "sk-..."
}
```

**Logica:**
1. Recibe model, messages, stream, apiKey
2. Valida que apiKey exista
3. Hace fetch a `https://ollama.com/api/chat` con Authorization header
4. Devuelve la respuesta del upstream al cliente

**Response:** JSON con `message.content` o NDJSON si stream=true

### POST /api/snack

**Request Body:**
```json
{
  "code": "import React...",
  "name": "Generated App"
}
```

**Logica:**
1. Recibe code y name
2. Valida que code exista
3. Crea instancia de Snack con sdkVersion: '51.0.0'
4. Guarda con saveAsync()
5. Retorna { snackId, url }

**Response:**
```json
{
  "snackId": "abc123...",
  "url": "https://snack.expo.dev/abc123..."
}
```

---

## Hooks

### useOllamaStream

**Estado:** `isStreaming` (boolean)
**Metodos:** `send`, `stop`

**send(payload, onChunk, onDone, onError, onProgress?):**
1. Activa `isStreaming = true`
2. Crea `AbortController`
3. Llama `onProgress('thinking')`
4. POST a `/api/chat` con `stream: false`
5. Obtiene texto completo de `message.content || message.thinking`
6. Llama `onProgress('generating')`
7. Simula escritura chunk por chunk
8. Llama `onDone()` al terminar (o `onError()` si hay error)

**stop():**
- Aborta el `AbortController` actual

### useChat

**Estado:** `messages` (array), `isStreaming` (boolean), `progressStep` (string | null)
**Metodos:** `sendMessage`, `stopStreaming`

**sendMessage(userText):**
1. Detecta si es peticion de app con regex
2. Anade mensaje user al estado
3. Muestra confirmacion instantanea si es app request
4. Llama `useOllamaStream.send()` con callbacks
5. `onChunk`: Acumula texto y actualiza mensaje assistant
6. `onDone`: Extrae codigo Markdown, muestra mensaje final, llama `onCodeGenerated`
7. `onError`: Muestra error en el chat
8. `onProgress`: Actualiza `progressStep` y mensaje de confirmacion

### useSnack

**Estado:** `snackData` (SnackData | null), `isCreating` (boolean), `error` (string | null)
**Metodos:** `createSnack`

**createSnack(code, name?):**
1. Activa `isCreating = true`
2. POST a `/api/snack`
3. Guarda `snackData` en estado
4. Maneja errores

---

## Componentes UI

### AppLayout
- Sidebar desplegable desde la izquierda (280px)
- Overlay oscuro con backdrop-blur al abrir
- Boton de menu hamburguesa en esquina superior izquierda
- Integra SettingsPanel como modal
- Logo "SamiStudio" con icono Sparkles

### Sidebar
- Items: Chat, Ajustes
- Animaciones de entrada con Framer Motion
- Indicador activo con bg-water-50 y borde
- Iconos con fondo redondeado

### SettingsPanel
- Modal fullscreen con fondo oscuro y backdrop-blur
- Seccion Modelo: grid de tarjetas seleccionables
- Opcion "Otro modelo..." con input text expandible
- Seccion API Key: input password + boton borrar
- Boton "Guardar y cerrar"

### ChatPanel
- Header con titulo "Chat", subtitulo, e icono MessageSquare
- Badge animado de estado (Pensando... / Generando...)
- Lista de mensajes scrollable
- Input de texto con boton enviar/detener

### ChatMessage
- Burbujas diferenciadas por rol:
  - Usuario: bg-water-500, texto blanco, alineado derecha
  - IA: bg-bone-100, borde bone-200, texto gris-800, alineado izquierda
- Avatar con icono (User / Wand2)
- MarkdownRenderer para contenido
- Indicador de streaming con 3 puntos animados (bounce)

### ChatMessageList
- Auto-scroll al fondo con `useEffect` + `scrollIntoView`
- Empty state con icono, titulo, descripcion y botones de ejemplo
- Botones de ejemplo: "Contador de pasos", "Calculadora", "Lista de tareas", "Reloj digital"

### ChatInput
- Input redondeado con borde-2, focus ring water-500
- Placeholder dinamico segun estado
- Boton enviar (icono Send) / detener (icono Square, rojo)
- Label "Enter ->" en la derecha del input

### MarkdownRenderer
- Divide texto en parrafos por `\n\n+`
- Renderiza inline: **bold** -> `<strong>`, *italic* -> `<em>`, `code` -> `<code>`
- Sin dependencias externas

### PreviewPanel
- Header con titulo "Preview", subtitulo "Expo Snack"
- Botones de accion: QR (popover con QRCodeSVG), Abrir en nueva pestana
- DeviceToggle para alternar telefono/reloj
- Indicador "Creando preview..." con animacion pulse
- Indicador de error en rojo
- AnimatePresence para transicion suave entre mockups

### PhoneMockup
- SVG 300x600 con viewBox rectangular
- Marco exterior oscuro (#1a1a1a) con bordes redondeados (rx:36)
- Botones laterales simulados (volumen, power)
- Notch moderno en parte superior
- clipPath para pantalla interna
- foreignObject con iframe dentro
- Reflejo superior con gradiente
- Drop-shadow

### WatchMockup
- SVG 260x260 circular
- Correas superior e inferior
- Corona giratoria y boton lateral
- Marco exterior circular con bisel metalico
- clipPath circular para pantalla
- foreignObject con iframe + clipPath: circle(50%)
- Reflejo de cristal con gradiente diagonal

### DeviceToggle
- ToggleGroup con fondo blanco y borde
- Opciones: Telefono (icono Smartphone) / Reloj (icono Watch)
- layoutId de Framer Motion para animacion del indicador activo
- Indicador activo: bg-water-500 con shadow

### ExpoActions
- Boton QR: muestra popover con QRCodeSVG (160px)
  - URL: `https://qr.expo.dev/eas-update?id={snackId}&platform=android`
- Boton Abrir: link a `https://snack.expo.dev/{snackId}` en nueva pestana
- Deshabilitados cuando no hay snackId

---

## Prompt del Sistema

Archivo: `app/lib/constants.ts`

El prompt esta disenado para que la IA:
1. Sea conversacional por defecto (responde preguntas sin generar codigo)
2. Solo genere codigo cuando se le pida explicitamente crear una app
3. Confirme brevemente antes de generar
4. Incluya el codigo completo en un bloque ```jsx
5. Genere un unico archivo App.js autonomo
6. Use solo dependencias de Expo/React Native core
7. Para relojes: diseno circular y optimizado para pantallas pequenas
8. Use StyleSheet.create para estilos
9. Sea compatible con Expo SDK 51+

---

## Modelos de IA

Archivo: `app/lib/constants.ts`

| ID | Nombre | Contexto |
|----|--------|----------|
| kimi-k2.6:cloud | Kimi K2.6 | Modelo preferido por el usuario |
| qwen3-coder-next:cloud | Qwen3 Coder Next | Maxima capacidad, agentic coding, 256K ctx |
| qwen3-coder:30b | Qwen3 Coder 30B | Buen balance eficiencia/potencia, MoE |
| qwen2.5-coder:32b | Qwen2.5 Coder 32B | Probado y fiable, competitivo con GPT-4o |
| minimax-m2.5:cloud | MiniMax M2.5 | Full-stack mobile, SWE-Bench 80.2% |

El usuario tambien puede escribir cualquier otro modelo manualmente.

---

## Paleta de Colores

### Colores Water (azul agua)
| Token | Hex | Uso |
|-------|-----|-----|
| water-50 | #E0F7FA | Fondos de badges, estados hover |
| water-100 | #B2EBF2 | Hover states |
| water-200 | #80DEEA | Bordes de badges |
| water-300 | #4DD0E1 | - |
| water-400 | #26C6DA | Hover de toggle |
| water-500 | #00BCD4 | Color principal, botones, avatares, acentos |
| water-600 | #00ACC1 | Hover de botones |
| water-700 | #0097A7 | Texto de badges |
| water-800 | #00838F | - |
| water-900 | #006064 | Texto activo en sidebar |

### Colores Bone (gris hueso)
| Token | Hex | Uso |
|-------|-----|-----|
| bone-50 | #FFFFFF | Paneles, fondos de inputs |
| bone-100 | #F8F9FA | Fondo principal, empty state |
| bone-200 | #F1F3F5 | Bordes, divisores, fondos de mockup vacio |
| bone-300 | #E9ECEF | Separadores resizable |
| bone-400 | #DEE2E6 | - |
| bone-500 | #CED4DA | - |

### Grises
| Token | Hex | Uso |
|-------|-----|-----|
| gray-400 | #9CA3AF | Texto placeholder, iconos inactivos |
| gray-500 | #6B7280 | Subtitulos, descripciones |
| gray-600 | #4B5563 | Texto secundario |
| gray-700 | #374151 | Texto de iconos |
| gray-800 | #1F2937 | Texto principal de mensajes IA |
| gray-900 | #111827 | Titulos, texto bold |

---

## Integracion Expo Snack

### Creacion
- Backend usa `snack-sdk` con `sdkVersion: '51.0.0'`
- Archivo `App.js` con codigo generado
- `saveAsync()` retorna `id` y `url`

### Preview
- Iframe: `https://snack.expo.dev/embedded/{snackId}?preview=true&platform=android&supportedPlatforms=android&theme=dark&deviceAppearance=dark`
- Renderizado dentro de `foreignObject` del SVG mockup
- Ajuste `width: 100%, height: 100%`

### QR Code
- URL: `https://qr.expo.dev/eas-update?id={snackId}&platform=android`
- Renderizado con `qrcode.react` (QRCodeSVG)
- Popover animado con Framer Motion

### Preview Externa
- Boton "Abrir en nueva pestana"
- URL: `https://snack.expo.dev/{snackId}`

---

## Estado Actual y Proximos Pasos

### Funcionalidades Completas
- [x] Chat con IA mediante Ollama Cloud
- [x] Streaming simulado con efecto de escritura
- [x] Confirmacion instantanea para peticiones de app
- [x] Extraccion de codigo Markdown
- [x] Creacion de Expo Snack programatica
- [x] Preview en mockup de telefono Android
- [x] Preview en mockup de Galaxy Watch circular
- [x] Toggle entre dispositivos con animacion
- [x] QR Code para abrir en Expo Go
- [x] Markdown renderizado en chat
- [x] Panel de ajustes con selector de modelo y API key
- [x] Sidebar desplegable con animaciones
- [x] Paneles redimensionables (react-resizable-panels)
- [x] Indicadores de progreso (Pensando... / Generando codigo...)
- [x] Paleta de colores water + bone
- [x] Empty state con ejemplos de prompts

### Mejoras Pendientes
- [ ] Historial de conversaciones (persistencia en localStorage)
- [ ] Exportar codigo generado (boton de descarga)
- [ ] Soporte para multiples archivos (no solo App.js)
- [ ] Integracion con Appetize.io directo (si se encuentra forma)
- [ ] Mejorar la estetica del chat (mas espaciado, mejores tipografias)
- [ ] Anadir animaciones de entrada a los mensajes del usuario
- [ ] Soporte para tema oscuro global
- [ ] Validacion de codigo generado (syntax check basico)
- [ ] Rate limiting en el proxy
- [ ] Caching de snacks creados

---

## Comandos Utiles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (puerto 3000)

# Construccion
npm run build        # Build de produccion
npm start            # Inicia servidor de produccion

# Lint
npm run lint         # ESLint

# TypeScript
npx tsc --noEmit     # Verificacion de tipos
```

### Variables de entorno (opcional)
No se requieren variables de entorno en el servidor. La API key se almacena en localStorage del navegador y se envia al proxy via POST body.

---

## Notas para Futuros Desarrolladores

1. **Tailwind v4:** Usa `@theme inline` en `globals.css` en lugar de `tailwind.config.ts` para definir colores custom.
2. **shadcn/ui:** Los componentes base estan en `components/ui/` y usan `@import "shadcn/tailwind.css"`.
3. **snack-sdk:** Requiere `transpilePackages: ['snack-sdk']` en `next.config.ts` para evitar errores de build.
4. **API key:** El archivo `SettingsProvider.tsx` tiene una API key hardcodeada por defecto para facilitar el desarrollo. En produccion, el usuario debe configurar la suya propia.
5. **Stream false:** Recuerda que el proxy acepta tanto `stream: true` como `stream: false`, pero el cliente siempre envia `stream: false` para evitar mostrar thinking.
6. **AbortController:** `useOllamaStream` crea un nuevo AbortController en cada llamada a `send()`. El boton de detener (cuadrado rojo) llama a `stop()` que aborta el controller.
7. **Next.js 16:** Este proyecto usa la version 16 de Next.js con App Router. Algunas convenciones pueden diferir de versiones anteriores.
8. **Font:** Inter se carga via `next/font/google` con `display: 'swap'`.

---

## Historial de Cambios (Resumen de Sesiones)

### Sesion Inicial
- Creacion del proyecto con `create-next-app`
- Instalacion de dependencias (framer-motion, react-resizable-panels, lucide-react, snack-sdk, qrcode.react)
- Configuracion de colores water/bone en Tailwind v4
- Creacion de estructura base de carpetas

### Implementacion del Chat
- Creacion de `useOllamaStream` con NDJSON streaming reader
- Creacion de `useChat` para gestion de mensajes
- Creacion de componentes de chat (ChatPanel, ChatMessage, ChatInput, ChatMessageList)
- Integracion con `react-resizable-panels`

### Integracion Expo Snack
- Creacion de `app/api/snack/route.ts` con snack-sdk
- Creacion de `useSnack` hook
- Creacion de `PreviewPanel`, `PhoneMockup`, `WatchMockup`
- Creacion de `DeviceToggle` y `ExpoActions`

### Correccion de Bugs Criticos
- Fix: `stream: false` para evitar thinking visible
- Fix: Flujo de datos entre `page.tsx`, `useChat`, y `useSnack`
- Fix: `/embedded/` URL para preview limpia
- Fix: Exports de `react-resizable-panels` (Group/Panel/Separator)

### Mejoras de UX
- Confirmacion instantanea para peticiones de app
- Simulacion de escritura chunk-based
- MarkdownRenderer custom
- Indicadores de progreso (`thinking` / `generating`)
- Badges animados en el header del chat

### Investigacion de Competencia
- Bloom: usa Expo + Appetize, preview con device frame de iPhone
- Base44: mobile preview mode, toggle de vistas
- Rork: web simulator + Expo Go QR
- Appetize: emulador nativo en iframe

### Mejoras de Preview
- Parametros adicionales al iframe de Expo: `supportedPlatforms=android`, `theme=dark`, `deviceAppearance=dark`

---

## Contacto

- **Autor:** Sami
- **GitHub:** https://github.com/samilososami
- **Proyecto:** https://github.com/samilososami/appstudio
- **Dominio:** appstudio.samilososami.com (configurar DNS)
