'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DeviceSpec, Message, ResponseMode } from '@/app/types';
import { SYSTEM_PROMPT } from '@/app/lib/constants';
import { useOllamaStream } from './useOllamaStream';
import type { StreamProgressEvent } from './useOllamaStream';

const CHAT_HISTORY_KEY = 'samistudio-chat-history';

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

function isAppRequest(text: string) {
  const normalized = normalizeText(text);
  const action =
    /\b(crea(?:me)?|crear|haz(?:me)?|hacer|genera(?:me)?|generar|construye(?:me)?|desarrolla(?:me)?|disena(?:me)?|monta(?:me)?|prepara(?:me)?|adapta(?:lo|la|me)?|convierte(?:lo|la)?|pasa(?:lo|la|me)?|pon(?:lo|la)?)\b/.test(
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
  const normalized = normalizeText(text);
  const wantsWatch = /\b(reloj|watch|wear|wear os|galaxy watch|smartwatch)\b/.test(normalized);

  return {
    deviceType: wantsWatch ? 'watch' : 'phone',
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

function getThinkingLabel(text: string, eventType: StreamProgressEvent['type'] = 'request') {
  const normalized = normalizeText(text);
  const isCalculator = /\b(calculadora|calculator|calcular|operaciones)\b/.test(normalized);
  const isTimer = /\b(timer|temporizador|cuenta atras|cuenta regresiva)\b/.test(normalized);
  const isStopwatch = /\b(cronometro|stopwatch)\b/.test(normalized);
  const isTasks = /\b(tareas|todo|lista|notas|checklist)\b/.test(normalized);
  const isWatch = /\b(reloj|watch|wear|wear os)\b/.test(normalized);

  if (isCalculator) {
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

  if (isTimer) {
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

  if (isStopwatch) {
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

  if (isTasks) {
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

function isReactNativeAppCode(code: string) {
  return /from ['"]react-native['"]/.test(code)
    && /(export\s+default|StyleSheet\.create|return\s*\()/.test(code);
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

export function useChat(
  model: string,
  apiKey: string,
  responseMode: ResponseMode,
  onCodeGenerated?: (code: string, device: DeviceSpec) => Promise<unknown> | unknown,
  onDeviceDetected?: (device: DeviceSpec) => void
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
      const guessedDevice = inferDeviceFromText(userText);
      if (appRequest) onDeviceDetected?.(guessedDevice);

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
            content: [
              `Dispositivo inicial inferido por la interfaz: ${guessedDevice.deviceType}.`,
              `Forma de reloj inicial: ${guessedDevice.watchShape}.`,
              'Si el prompt contradice esa inferencia, corrige el comentario samistudio.',
              'Genera una sola app completa y usable.',
              'La preview usa siluetas exactas: phone 390x834 con esquinas redondeadas y safe area; watch round 220x220 circular. No uses layout rectangular para watch.',
              'Evita widths fijos grandes; usa flex, aspectRatio, gap y botones que entren completos en pantalla.',
              'Si el usuario pide adaptar a telefono/reloj o cambiar de dispositivo, conserva la funcionalidad, textos, unidades, estado y comportamiento del codigo anterior salvo que pida cambios concretos.',
              'Temporizador/timer significa cuenta atras configurable. Cronometro significa conteo hacia arriba. No los intercambies.',
            ].join('\n'),
          }
        : null;

      const apiMessages: Message[] = [
        ...messages,
        ...(targetInstruction ? [targetInstruction] : []),
        userMessage,
      ];

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      assistantContentRef.current = '';
      setThinkingLabel(getThinkingLabel(userText, 'request'));

      await send(
        { model, messages: apiMessages, apiKey, responseMode },
        (chunk) => {
          assistantContentRef.current += chunk;
          const metadata = extractMetadata(assistantContentRef.current);
          const currentDevice: DeviceSpec = {
            deviceType: metadata.deviceType || guessedDevice.deviceType,
            watchShape: metadata.watchShape || guessedDevice.watchShape,
            title: metadata.title,
          };

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
          const finalDevice: DeviceSpec = {
            deviceType: metadata.deviceType || guessedDevice.deviceType,
            watchShape: metadata.watchShape || guessedDevice.watchShape,
            title: metadata.title,
          };
          const { code, summary } = extractCodeBlock(assistantContentRef.current);

          const generatedApp = Boolean(code && (appRequest || isReactNativeAppCode(code)));

          if (code && generatedApp) {
            patchAssistant(assistantId, {
              content: [makeIntro(userText, finalDevice), summary, 'Estoy montando la preview interactiva...']
                .filter(Boolean)
                .join('\n\n'),
              deviceType: finalDevice.deviceType,
              watchShape: finalDevice.watchShape,
              workflow: undefined,
            });

            onDeviceDetected?.(finalDevice);

            try {
              await onCodeGenerated?.(code, finalDevice);
              patchAssistant(assistantId, {
                content: [makeIntro(userText, finalDevice), summary, 'Listo, ya tienes la preview interactiva en el panel derecho.']
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
          setThinkingLabel(getThinkingLabel(userText, event.type));
        }
      );
    },
    [apiKey, messages, model, onCodeGenerated, onDeviceDetected, patchAssistant, responseMode, send]
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
