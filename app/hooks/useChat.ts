'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DeviceSpec, Message, ResponseMode } from '@/app/types';
import { SYSTEM_PROMPT } from '@/app/lib/constants';
import { useOllamaStream } from './useOllamaStream';
import type { StreamProgressEvent } from './useOllamaStream';

const CHAT_HISTORY_KEY = 'samistudio-chat-history';
type AppKind = 'calculator' | 'timer' | 'stopwatch' | 'tasks' | 'generic';

interface CodeValidationResult {
  ok: boolean;
  errors: string[];
}

function createSystemMessage(): Message {
  return { id: 'system', role: 'system', content: SYSTEM_PROMPT };
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getElapsedMs(startedAt?: number) {
  return startedAt ? Math.max(0, Date.now() - startedAt) : 0;
}

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function hasExplicitWatchTarget(text: string) {
  return /\b(reloj|watch|wear|wear os|galaxy watch|smartwatch)\b/.test(normalizeText(text));
}

function hasExplicitPhoneTarget(text: string) {
  return /\b(telefono|movil|mobile|android|celular|phone)\b/.test(normalizeText(text));
}

function detectAppKind(text: string): AppKind {
  const normalized = normalizeText(text);
  if (/\b(calculadora|calculator|calcular|operaciones)\b/.test(normalized)) return 'calculator';
  if (/\b(timer|temporizador|cuenta atras|cuenta regresiva)\b/.test(normalized)) return 'timer';
  if (/\b(cronometro|stopwatch)\b/.test(normalized)) return 'stopwatch';
  if (/\b(tareas|todo|lista|notas|checklist)\b/.test(normalized)) return 'tasks';
  return 'generic';
}

function isAppRequest(text: string) {
  const normalized = normalizeText(text);
  const action =
    /\b(crea(?:me|lo|la)?|crear|haz(?:me|lo|la)?|hacer|genera(?:me|lo|la)?|generar|construye(?:me|lo|la)?|desarrolla(?:me|lo|la)?|disena(?:me|lo|la)?|monta(?:me|lo|la)?|prepara(?:me|lo|la)?|adapta(?:lo|la|me)?|convierte(?:lo|la)?|pasa(?:lo|la|me)?|pon(?:lo|la)?)\b/.test(
      normalized
    );
  const product =
    /\b(app|aplicacion|movil|mobile|android|reloj|watch|wear|wear os|calculadora|contador|lista|temporizador|cronometro|agenda|notas|juego)\b/.test(
      normalized
    );

  if (action && product) return true;
  return /\b(crea|crear|haz|hacer|genera|generar|construye|desarrolla|disena|diseña)\b/.test(normalized)
    && /\b(app|aplicacion|aplicacion|movil|android|reloj|watch|wear|calculadora|contador|lista)\b/.test(normalized);
}

function inferDeviceFromText(text: string): DeviceSpec {
  return {
    deviceType: hasExplicitWatchTarget(text) ? 'watch' : 'phone',
    watchShape: 'round',
  };
}

function shortAppDescription(text: string) {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/^(por favor\s*)?/i, '')
    .trim();

  const match = cleaned.match(/(?:crea|crear|haz|hacer|genera|generar|construye|desarrolla|dise(?:n|ñ)a)(?:me)?\s+(.*)$/i);
  const adaptMatch = cleaned.match(/(?:monta|prepara|adapta|convierte|pasa|pon)(?:me|lo|la)?\s+(.*)$/i);
  const description = (adaptMatch?.[1] || match?.[1] || cleaned).replace(/\.$/, '').trim();

  if (!description) return 'la app que has pedido';
  return description.length > 96 ? `${description.slice(0, 93).trim()}...` : description;
}

function makeIntro(text: string, spec: DeviceSpec) {
  const target = spec.deviceType === 'watch' ? 'optimizada para una pantalla circular de reloj Wear OS' : 'para telefono Android';

  return `Genial, me pongo a crear ${shortAppDescription(text)}, ${target}. Primero preparo la estructura y luego genero el App.js completo para la preview.`;
}

function stripStudioMetadata(text: string) {
  return text.replace(/<!--\s*samistudio:[\s\S]*?-->/gi, '').trim();
}

function extractMetadata(text: string): Partial<DeviceSpec> {
  const match = text.match(/<!--\s*samistudio:([\s\S]*?)-->/i);
  if (!match) return {};

  const metadata = match[1].split(';').reduce<Record<string, string>>((acc, pair) => {
    const [key, value] = pair.split('=').map((part) => part?.trim());
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const target = metadata.target === 'watch' ? 'watch' : metadata.target === 'phone' ? 'phone' : undefined;
  const shape = metadata.shape ? 'round' : undefined;

  return {
    deviceType: target,
    watchShape: shape,
    title: metadata.title,
  };
}

function resolveDevice(metadata: Partial<DeviceSpec>, fallback: DeviceSpec, userText: string): DeviceSpec {
  const explicitWatch = hasExplicitWatchTarget(userText);
  const explicitPhone = hasExplicitPhoneTarget(userText);
  const deviceType = explicitWatch ? 'watch' : explicitPhone ? 'phone' : metadata.deviceType || fallback.deviceType;

  return {
    deviceType,
    watchShape: 'round',
    title: metadata.title,
  };
}

function buildTargetInstruction(userText: string, guessedDevice: DeviceSpec) {
  const appKind = detectAppKind(userText);
  const lines = [
    `Dispositivo inicial inferido por la interfaz: ${guessedDevice.deviceType}.`,
    'Forma de reloj inicial: round.',
    'Si el usuario menciona reloj, Wear OS o watch, target=watch es obligatorio aunque tu primera intuicion sea phone.',
    'Si el usuario menciona telefono, movil o Android, target=phone es obligatorio salvo que tambien pida reloj.',
    'Genera una sola app completa y usable.',
    'La preview usa siluetas exactas: phone 390x834 con esquinas redondeadas y safe area; watch round 220x220 recortado por un circulo real.',
    'Evita widths fijos grandes; usa flex, aspectRatio, gap y botones que entren completos en pantalla.',
    'Si el usuario pide adaptar a telefono/reloj o cambiar de dispositivo, conserva la funcionalidad, textos, unidades, estado y comportamiento del codigo anterior salvo que pida cambios concretos.',
    'Temporizador/timer significa cuenta atras configurable. Cronometro significa conteo hacia arriba. No los intercambies.',
  ];

  if (guessedDevice.deviceType === 'watch') {
    lines.push(
      'CONTRATO ESTRICTO PARA WATCH:',
      '- El App.js debe estar disenado para 220x220 circular, no para un rectangulo comprimido.',
      '- No coloques controles utiles en las esquinas. Las esquinas se recortan por el circulo.',
      '- Mantén el contenido principal dentro de un diametro seguro aproximado de 180 px.',
      '- Usa botones circulares, labels cortos y posiciones centradas/radiales. No uses tab bars, headers largos ni listas altas.',
      '- Si usas absolute positioning, calcula left/top para que cada boton completo quede dentro del circulo visible.',
      '- Antes de cerrar el codigo, revisa mentalmente: ningun boton se corta, ningun texto queda fuera, la pantalla no parece de telefono.'
    );
  }

  if (guessedDevice.deviceType === 'watch' && appKind === 'calculator') {
    lines.push(
      'CONTRATO ESTRICTO PARA CALCULADORA EN RELOJ:',
      '- Prohibido usar una cuadricula rectangular de telefono de 4 columnas x 5 filas.',
      '- Usa como maximo 3 columnas numericas en el centro y mueve operadores a una corona lateral/radial.',
      '- Botones visuales recomendados: 26-32 px con hitSlop; display maximo 140 px de ancho.',
      '- Evita width: 80, width: 170, fontSize: 64, row space-between y zeroButton ancho.',
      '- Los botones 7/8/9, 4/5/6, 1/2/3 y 0 deben quedar dentro del circulo; C, operadores y = pueden ir en anillo compacto.',
      '- La calculadora debe seguir funcionando con suma, resta, multiplicacion, division, decimal, borrar y resultado.'
    );
  }

  if (guessedDevice.deviceType === 'phone' && appKind === 'calculator') {
    lines.push(
      'CONTRATO PARA CALCULADORA EN TELEFONO:',
      '- Usa botones con flex: 1 y aspectRatio: 1.',
      '- No uses width fijo como 80 o 170; el teclado debe ajustarse al ancho disponible.'
    );
  }

  return lines.join('\n');
}

function getThinkingLabel(text: string, eventType: StreamProgressEvent['type'] = 'request') {
  const normalized = normalizeText(text);
  const appKind = detectAppKind(text);
  const isWatch = /\b(reloj|watch|wear|wear os)\b/.test(normalized);

  if (appKind === 'calculator' && isWatch) {
    const labels: Record<StreamProgressEvent['type'], string> = {
      request: 'Midiendo pantalla circular',
      thinking: 'Repartiendo botones en corona',
      'first-token': 'Dise\u00f1ando teclado circular',
      'code-start': 'Protegiendo cada boton del recorte',
      'code-complete': 'Comprobando operaciones compactas',
      done: 'Montando calculadora de reloj',
    };
    return labels[eventType];
  }

  if (appKind === 'calculator') {
    const labels: Record<StreamProgressEvent['type'], string> = {
      request: 'Analizando operaciones y pantalla',
      thinking: 'Separando display, teclado y operadores',
      'first-token': 'Dise\u00f1ando patr\u00f3n de n\u00fameros',
      'code-start': 'Encajando botones sin desbordes',
      'code-complete': 'Verificando suma, resta y borrado',
      done: 'Montando preview de calculadora',
    };
    return labels[eventType];
  }

  if (appKind === 'timer') {
    const labels: Record<StreamProgressEvent['type'], string> = {
      request: 'Definiendo cuenta atr\u00e1s',
      thinking: 'Conservando modo temporizador',
      'first-token': 'Dise\u00f1ando controles de tiempo',
      'code-start': 'Ajustando inicio, pausa y reset',
      'code-complete': 'Comprobando que no sea cron\u00f3metro',
      done: 'Montando preview del timer',
    };
    return labels[eventType];
  }

  if (appKind === 'stopwatch') {
    const labels: Record<StreamProgressEvent['type'], string> = {
      request: 'Preparando conteo ascendente',
      thinking: 'Conservando modo cron\u00f3metro',
      'first-token': 'Dise\u00f1ando lectura de tiempo',
      'code-start': 'Ajustando inicio, pausa y vuelta',
      'code-complete': 'Verificando conteo hacia arriba',
      done: 'Montando preview del cron\u00f3metro',
    };
    return labels[eventType];
  }

  if (appKind === 'tasks') {
    const labels: Record<StreamProgressEvent['type'], string> = {
      request: 'Ordenando estructura de tareas',
      thinking: 'Dise\u00f1ando estados de lista',
      'first-token': 'Preparando entradas y checks',
      'code-start': 'Encajando filas y acciones',
      'code-complete': 'Revisando alta y completado',
      done: 'Montando preview de tareas',
    };
    return labels[eventType];
  }

  if (isWatch) {
    const labels: Record<StreamProgressEvent['type'], string> = {
      request: 'Leyendo objetivo Wear OS',
      thinking: 'Adaptando a pantalla circular',
      'first-token': 'Dise\u00f1ando controles compactos',
      'code-start': 'Protegiendo el borde circular',
      'code-complete': 'Verificando legibilidad en reloj',
      done: 'Montando preview circular',
    };
    return labels[eventType];
  }

  const labels: Record<StreamProgressEvent['type'], string> = {
    request: 'Analizando la idea de app',
    thinking: 'Dise\u00f1ando flujo principal',
    'first-token': 'Preparando interfaz responsive',
    'code-start': 'Construyendo App.js',
    'code-complete': 'Verificando estructura y estilos',
    done: 'Montando preview interactiva',
  };
  return labels[eventType];
}

function extractCodeBlock(text: string): { code: string | null; summary: string; codeStarted: boolean } {
  const completeBlocks = [...text.matchAll(/```(?:jsx|tsx|js|javascript)?\s*\n([\s\S]*?)```/gi)];
  if (completeBlocks.length > 0) {
    const bestBlock =
      completeBlocks.find((block) => /from ['"]react-native['"]|StyleSheet\.create|export default/i.test(block[1])) ||
      completeBlocks[completeBlocks.length - 1];
    const summary = stripStudioMetadata(text.slice(0, bestBlock.index).trim());
    return { code: bestBlock[1].trim(), summary, codeStarted: true };
  }

  const openBlock = text.match(/```(?:jsx|tsx|js|javascript)?\s*\n/i);
  if (openBlock) {
    const summary = stripStudioMetadata(text.slice(0, openBlock.index).trim());
    return { code: null, summary, codeStarted: true };
  }

  return { code: null, summary: stripStudioMetadata(text), codeStarted: false };
}

async function validateGeneratedCode(code: string): Promise<CodeValidationResult> {
  const response = await fetch('/api/validate-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    return { ok: false, errors: ['No se pudo validar App.js antes de la preview.'] };
  }

  return {
    ok: Boolean(data.ok),
    errors: Array.isArray(data.errors) ? data.errors : [],
  };
}

function buildRepairPrompt(userText: string, device: DeviceSpec, code: string, errors: string[]) {
  const deviceRules = device.deviceType === 'watch'
    ? [
        '- Target obligatorio: watch circular 220x220.',
        '- No uses layouts de telefono ni controles en esquinas.',
        '- Mantén botones/textos dentro del circulo visible.',
      ]
    : [
        '- Target obligatorio: phone 390x834.',
        '- Mantén la UI responsive y sin width fijos grandes.',
      ];

  return [
    'Repara este App.js de React Native/Expo. Devuelve SOLO un bloque ```jsx con el archivo completo corregido.',
    'No expliques nada fuera del bloque de codigo.',
    'Mantén la funcionalidad pedida por el usuario y no cambies el tipo de app.',
    ...deviceRules,
    'Errores detectados por el validador:',
    errors.map((error, index) => `${index + 1}. ${error}`).join('\n'),
    '',
    `Prompt/contexto del usuario:\n${userText}`,
    '',
    'App.js actual con errores:',
    '```jsx',
    code,
    '```',
  ].join('\n');
}

async function repairGeneratedCode(params: {
  model: string;
  apiKey: string;
  userText: string;
  device: DeviceSpec;
  code: string;
  errors: string[];
}) {
  const messages: Message[] = [
    {
      role: 'system',
      content: [
        'Eres un reparador estricto de App.js para React Native y Expo Snack.',
        'Tu unica tarea es devolver codigo JavaScript/JSX valido.',
        'No uses TypeScript types, no uses dependencias externas y no dejes JSX dentro de StyleSheet.create.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: buildRepairPrompt(params.userText, params.device, params.code, params.errors),
    },
  ];

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: params.model,
      messages,
      stream: false,
      apiKey: params.apiKey,
      responseMode: 'fast',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'No se pudo reparar App.js.');
  }

  const data = await response.json();
  const content = data?.message?.content || data?.response || '';
  const { code } = extractCodeBlock(content);
  if (!code) throw new Error('La reparacion no devolvio un bloque App.js valido.');

  return code;
}

function isReactNativeAppCode(code: string) {
  return /from ['"]react-native['"]/.test(code)
    && /(export\s+default|StyleSheet\.create|return\s*\()/.test(code);
}

function shouldUseCircularWatchCalculatorBlueprint(userText: string, device: DeviceSpec) {
  const normalized = normalizeText(userText);
  const genericCalculator = detectAppKind(userText) === 'calculator'
    && !/\b(imc|bmi|propina|tip|hipoteca|prestamo|divisa|moneda|cientifica|scientific)\b/.test(normalized);

  return device.deviceType === 'watch' && genericCalculator;
}

function getCircularWatchCalculatorCode() {
  return `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const formatValue = (value) => {
    if (!Number.isFinite(value)) return 'Error';
    const rounded = Math.round(value * 1000000) / 1000000;
    return String(rounded).slice(0, 9);
  };

  const calculate = (first, second, op) => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case 'x':
        return first * second;
      case '/':
        return second === 0 ? NaN : first / second;
      default:
        return second;
    }
  };

  const inputDigit = (digit) => {
    if (display === 'Error') {
      setDisplay(String(digit));
      setWaiting(false);
      return;
    }
    if (waiting) {
      setDisplay(String(digit));
      setWaiting(false);
      return;
    }
    setDisplay(display === '0' ? String(digit) : (display + digit).slice(0, 9));
  };

  const inputDecimal = () => {
    if (waiting || display === 'Error') {
      setDisplay('0.');
      setWaiting(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const clear = () => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaiting(false);
  };

  const chooseOperator = (nextOperator) => {
    const current = parseFloat(display);
    if (storedValue === null || operator === null) {
      setStoredValue(current);
    } else {
      const result = calculate(storedValue, current, operator);
      setStoredValue(result);
      setDisplay(formatValue(result));
    }
    setOperator(nextOperator);
    setWaiting(true);
  };

  const equals = () => {
    if (storedValue === null || operator === null) return;
    const result = calculate(storedValue, parseFloat(display), operator);
    setDisplay(formatValue(result));
    setStoredValue(null);
    setOperator(null);
    setWaiting(true);
  };

  const keys = [
    { label: 'C', x: 34, y: 50, size: 26, tone: 'clear', onPress: clear },
    { label: '/', x: 160, y: 50, size: 26, tone: 'op', onPress: () => chooseOperator('/') },
    { label: '7', x: 60, y: 68, size: 30, tone: 'num', onPress: () => inputDigit(7) },
    { label: '8', x: 95, y: 68, size: 30, tone: 'num', onPress: () => inputDigit(8) },
    { label: '9', x: 130, y: 68, size: 30, tone: 'num', onPress: () => inputDigit(9) },
    { label: 'x', x: 24, y: 111, size: 27, tone: 'op', onPress: () => chooseOperator('x') },
    { label: '4', x: 50, y: 103, size: 31, tone: 'num', onPress: () => inputDigit(4) },
    { label: '5', x: 95, y: 103, size: 31, tone: 'num', onPress: () => inputDigit(5) },
    { label: '6', x: 140, y: 103, size: 31, tone: 'num', onPress: () => inputDigit(6) },
    { label: '-', x: 169, y: 111, size: 27, tone: 'op', onPress: () => chooseOperator('-') },
    { label: '1', x: 60, y: 138, size: 30, tone: 'num', onPress: () => inputDigit(1) },
    { label: '2', x: 95, y: 138, size: 30, tone: 'num', onPress: () => inputDigit(2) },
    { label: '3', x: 130, y: 138, size: 30, tone: 'num', onPress: () => inputDigit(3) },
    { label: '+', x: 38, y: 168, size: 25, tone: 'op', onPress: () => chooseOperator('+') },
    { label: '.', x: 70, y: 172, size: 27, tone: 'num', onPress: inputDecimal },
    { label: '0', x: 100, y: 173, size: 28, tone: 'num', onPress: () => inputDigit(0) },
    { label: '=', x: 132, y: 172, size: 29, tone: 'equal', onPress: equals },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.face}>
        <View style={styles.topGlow} />
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
        {keys.map((key) => (
          <TouchableOpacity
            key={key.label}
            onPress={key.onPress}
            activeOpacity={0.78}
            hitSlop={6}
            style={[
              styles.key,
              styles[key.tone],
              {
                left: key.x,
                top: key.y,
                width: key.size,
                height: key.size,
                borderRadius: key.size / 2,
              },
            ]}
          >
            <Text style={[styles.keyText, key.tone === 'clear' && styles.clearText]}>{key.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061017',
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    backgroundColor: '#09141d',
  },
  topGlow: {
    position: 'absolute',
    left: 35,
    top: 10,
    width: 150,
    height: 58,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 144, 255, 0.18)',
  },
  display: {
    position: 'absolute',
    left: 45,
    top: 21,
    width: 130,
    height: 33,
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  key: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  num: {
    backgroundColor: '#1f2937',
  },
  op: {
    backgroundColor: '#0ea5e9',
  },
  equal: {
    backgroundColor: '#22c55e',
  },
  clear: {
    backgroundColor: '#e5e7eb',
  },
  keyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  clearText: {
    color: '#111827',
  },
});`;
}

function loadHistory(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveHistory(messages: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    const chatMessages = messages.filter((message) => message.role !== 'system');
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages));
  } catch {
    // ignore
  }
}

function getAppContextText(userText: string, messages: Message[]) {
  if (detectAppKind(userText) !== 'generic') return userText;

  const recentContext = messages
    .filter((message) => message.role !== 'system')
    .slice(-6)
    .map((message) => message.content)
    .join('\n');

  return `${recentContext}\n${userText}`;
}

export function useChat(
  model: string,
  apiKey: string,
  responseMode: ResponseMode,
  onCodeGenerated?: (code: string, device: DeviceSpec) => Promise<unknown> | unknown,
  onDeviceDetected?: (device: DeviceSpec) => void,
  onGenerationStarted?: (device: DeviceSpec) => void
) {
  const [messages, setMessages] = useState<Message[]>(() => [createSystemMessage()]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { send, stop, isStreaming, progressStep } = useOllamaStream();
  const [thinkingLabel, setThinkingLabel] = useState<string | null>(null);
  const assistantContentRef = useRef('');

  const clearHistory = useCallback(() => {
    setMessages([createSystemMessage()]);
    setThinkingLabel(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, []);

  const patchAssistant = useCallback((assistantId: string, patch: Partial<Message> | ((message: Message) => Partial<Message>)) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== assistantId) return message;
        const nextPatch = typeof patch === 'function' ? patch(message) : patch;
        return { ...message, ...nextPatch };
      })
    );
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      const appRequest = isAppRequest(userText);
      const appContextText = getAppContextText(userText, messages);
      const guessedDevice = inferDeviceFromText(userText);
      if (appRequest) {
        onDeviceDetected?.(guessedDevice);
        onGenerationStarted?.(guessedDevice);
      }

      const userMessage: Message = {
        id: createId('user'),
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      };

      const assistantId = createId('assistant');
      const workingStartedAt = Date.now();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: appRequest ? makeIntro(userText, guessedDevice) : '',
        timestamp: workingStartedAt,
        deviceType: guessedDevice.deviceType,
        watchShape: guessedDevice.watchShape,
        workingStartedAt,
      };

      const targetInstruction = appRequest
        ? {
            role: 'system' as const,
            content: buildTargetInstruction(appContextText, guessedDevice),
          }
        : null;

      const apiMessages: Message[] = [
        ...messages,
        ...(targetInstruction ? [targetInstruction] : []),
        userMessage,
      ];

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      assistantContentRef.current = '';
      setThinkingLabel(getThinkingLabel(appContextText, 'request'));

      await send(
        { model, messages: apiMessages, apiKey, responseMode },
        (chunk) => {
          assistantContentRef.current += chunk;
          const metadata = extractMetadata(assistantContentRef.current);
          const currentDevice = resolveDevice(metadata, guessedDevice, userText);

          if (metadata.deviceType || metadata.watchShape) {
            onDeviceDetected?.(currentDevice);
          }

          const { summary, codeStarted } = extractCodeBlock(assistantContentRef.current);
          const shouldShowBuildFlow = appRequest || codeStarted;
          if (codeStarted) onDeviceDetected?.(currentDevice);

          const displayContent = shouldShowBuildFlow
            ? [makeIntro(userText, currentDevice), summary].filter(Boolean).join('\n\n')
            : summary || stripStudioMetadata(assistantContentRef.current);

          patchAssistant(assistantId, {
            content: displayContent,
            deviceType: currentDevice.deviceType,
            watchShape: currentDevice.watchShape,
            workflow: undefined,
          });
        },
        async () => {
          const metadata = extractMetadata(assistantContentRef.current);
          const finalDevice = resolveDevice(metadata, guessedDevice, userText);
          const { code, summary } = extractCodeBlock(assistantContentRef.current);

          const generatedApp = Boolean(code && (appRequest || isReactNativeAppCode(code)));

          if (code && generatedApp) {
            const usesWatchCalculatorBlueprint = shouldUseCircularWatchCalculatorBlueprint(appContextText, finalDevice);
            let previewCode = usesWatchCalculatorBlueprint ? getCircularWatchCalculatorCode() : code;
            const previewNote = usesWatchCalculatorBlueprint
              ? 'He aplicado una distribucion circular especifica para reloj: botones compactos dentro del circulo, operadores en corona y sin cuadricula rectangular.'
              : null;

            patchAssistant(assistantId, {
              content: [makeIntro(userText, finalDevice), summary, previewNote, 'Estoy montando la preview interactiva...']
                .filter(Boolean)
                .join('\n\n'),
              deviceType: finalDevice.deviceType,
              watchShape: finalDevice.watchShape,
              workflow: undefined,
            });

            onDeviceDetected?.(finalDevice);

            try {
              setThinkingLabel('Verificando App.js antes de la preview');
              let verificationNote = 'Verificado: App.js pasa el chequeo sintactico antes de la preview.';
              const initialValidation = await validateGeneratedCode(previewCode);

              if (!initialValidation.ok) {
                const validationSummary = initialValidation.errors.slice(0, 2).join(' ');
                patchAssistant(assistantId, {
                  content: [
                    makeIntro(userText, finalDevice),
                    summary,
                    previewNote,
                    `He detectado un error en App.js antes de abrir la preview: ${validationSummary}`,
                    'Estoy reparando el codigo automaticamente...',
                  ].filter(Boolean).join('\n\n'),
                  deviceType: finalDevice.deviceType,
                  watchShape: finalDevice.watchShape,
                  workflow: undefined,
                });

                setThinkingLabel('Corrigiendo App.js antes de la preview');
                const repairedCode = await repairGeneratedCode({
                  model,
                  apiKey,
                  userText: appContextText,
                  device: finalDevice,
                  code: previewCode,
                  errors: initialValidation.errors,
                });

                const repairedValidation = await validateGeneratedCode(repairedCode);
                if (!repairedValidation.ok) {
                  throw new Error(`App.js sigue teniendo errores: ${repairedValidation.errors.slice(0, 2).join(' ')}`);
                }

                previewCode = repairedCode;
                verificationNote = 'Corregido y verificado: App.js ya pasa el chequeo sintactico antes de la preview.';
              }

              await onCodeGenerated?.(previewCode, finalDevice);
              patchAssistant(assistantId, {
                content: [makeIntro(userText, finalDevice), summary, previewNote, verificationNote, 'Listo, ya tienes la preview interactiva en el panel derecho.']
                  .filter(Boolean)
                  .join('\n\n'),
                workflow: undefined,
                workingStartedAt: undefined,
                workedMs: getElapsedMs(workingStartedAt),
              });
              setThinkingLabel(null);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
              patchAssistant(assistantId, (message) => ({
                content: `${message.content}\n\nNo he podido preparar la preview: ${errorMessage}`,
                workflow: undefined,
                workingStartedAt: undefined,
                workedMs: getElapsedMs(workingStartedAt),
              }));
              setThinkingLabel(null);
            }
          } else {
            patchAssistant(assistantId, {
              content: stripStudioMetadata(assistantContentRef.current),
              workflow: undefined,
              workingStartedAt: undefined,
              workedMs: getElapsedMs(workingStartedAt),
            });
            setThinkingLabel(null);
          }
        },
        (err) => {
          patchAssistant(assistantId, {
            content: `Error: ${err.message}`,
            workflow: undefined,
            workingStartedAt: undefined,
            workedMs: getElapsedMs(workingStartedAt),
          });
          setThinkingLabel(null);
        },
        (event) => {
          setThinkingLabel(getThinkingLabel(appContextText, event.type));
        }
      );
    },
    [apiKey, messages, model, onCodeGenerated, onDeviceDetected, onGenerationStarted, patchAssistant, responseMode, send]
  );

  const stopStreaming = useCallback(() => {
    stop();
    setThinkingLabel(null);
  }, [stop]);

  const chatMessages = messages.filter((message) => message.role !== 'system');

  useEffect(() => {
    const loadedHistory = loadHistory();
    const timeoutId = window.setTimeout(() => {
      setMessages((current) => {
        const hasUserSessionMessages = current.some((message) => message.role !== 'system');
        return hasUserSessionMessages ? current : [createSystemMessage(), ...loadedHistory];
      });
      setHistoryLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    saveHistory(messages);
  }, [historyLoaded, messages]);

  return {
    messages: chatMessages,
    isStreaming,
    sendMessage,
    stopStreaming,
    progressStep,
    thinkingLabel,
    clearHistory,
  };
}
