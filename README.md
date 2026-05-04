# AppStudio

Generador de aplicaciones moviles con inteligencia artificial. Crea apps para Android y Galaxy Watch mediante prompts en lenguaje natural.

![Preview](preview3.png)

## Descripcion

AppStudio es una plataforma web que permite generar aplicaciones moviles funcionales a partir de descripciones en espanol. Utiliza modelos de lenguaje de Ollama Cloud para producir codigo React Native/Expo, y lo previsualiza en tiempo real dentro de un mockup de dispositivo.

## Caracteristicas

- **Chat con IA**: Interfaz conversacional con streaming simulado para mejor UX
- **Generacion de codigo**: Extrae bloques Markdown y los envia directamente a Expo Snack
- **Preview en tiempo real**: Visualiza la app generada dentro de un mockup de telefono Android o Galaxy Watch
- **Soporte multi-dispositivo**: Alterna entre telefono y reloj con un toggle
- **QR Code**: Genera codigo QR para abrir la app en Expo Go
- **Markdown renderizado**: El chat muestra negritas, cursivas y codigo inline
- **Proxy CORS**: Backend serverless que comunica con Ollama Cloud de forma segura
- **Diseño minimalista**: Paleta de colores water + bone con animaciones suaves

## Tecnologias

- [Next.js](https://nextjs.org) 16.2.4 con App Router
- [React](https://react.dev) 19.2.4
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) v4 con colores personalizados
- [Framer Motion](https://www.framer.com/motion/) para animaciones
- [shadcn/ui](https://ui.shadcn.com) componentes base
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
- [Ollama Cloud](https://ollama.com) API de generacion de codigo
- [Expo Snack](https://snack.expo.dev) para preview y emulacion
- [snack-sdk](https://www.npmjs.com/package/snack-sdk) creacion programatica de Snacks

## Estructura del proyecto

```
samistudio/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Proxy a Ollama Cloud
│   │   └── snack/route.ts         # Creacion de Snack via snack-sdk
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatMessageList.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── MarkdownRenderer.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── preview/
│   │       ├── PreviewPanel.tsx
│   │       ├── PhoneMockup.tsx
│   │       ├── WatchMockup.tsx
│   │       ├── DeviceToggle.tsx
│   │       └── ExpoActions.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useOllamaStream.ts
│   │   └── useSnack.ts
│   ├── providers/
│   │   └── SettingsProvider.tsx
│   ├── lib/
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── public/
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Variables de entorno

No se requieren variables de entorno en el servidor. La API key de Ollama se almacena en el navegador (localStorage) y se envia al proxy `/api/chat` en el body de la peticion.

## Despliegue en Vercel

Haz clic en el boton para desplegar directamente:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

O utiliza la CLI:

```bash
npm i -g vercel
vercel
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. Abre el panel de Ajustes (icono de engranaje) e introduce tu API key de Ollama Cloud
2. Selecciona el modelo de IA (por defecto: `kimi-k2.6:cloud`)
3. Escribe un prompt en el chat, por ejemplo: "Crea una app de contador de pasos para reloj"
4. La IA generara el codigo y lo previsualizara automaticamente en el panel derecho

## Topics

`nextjs` `react` `typescript` `tailwindcss` `artificial-intelligence` `ollama` `expo` `react-native` `mobile-apps` `code-generation` `no-code` `low-code` `galaxy-watch` `android` `framer-motion`

## Autor

- GitHub: [@samilososami](https://github.com/samilososami)

## Licencia

MIT
