'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/app/types';
import { SYSTEM_PROMPT } from '@/app/lib/constants';
import { useOllamaStream } from './useOllamaStream';

function extractCodeBlock(text: string): { code: string | null; summary: string } {
  const codeMatch = text.match(/```(?:jsx|tsx)?\n([\s\S]*?)```/);
  if (codeMatch) {
    const code = codeMatch[1].trim();
    // El resumen es todo el texto antes del bloque de codigo
    const summary = text.split('```')[0].trim();
    return { code, summary };
  }

  // Durante streaming: si hay un bloque abierto pero sin cerrar, ocultar el codigo parcial
  const openMatch = text.match(/```(?:jsx|tsx)?\n/);
  if (openMatch) {
    const summary = text.substring(0, openMatch.index).trim();
    return { code: null, summary: summary || 'Generando codigo...' };
  }

  return { code: null, summary: text };
}

const CHAT_HISTORY_KEY = 'samistudio-chat-history';

function loadHistory(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveHistory(messages: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    const chatMessages = messages.filter((m) => m.role !== 'system');
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages));
  } catch {
    // ignore
  }
}

export function useChat(
  model: string,
  apiKey: string,
  onCodeGenerated?: (code: string) => void
) {
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'system', content: SYSTEM_PROMPT },
    ...loadHistory(),
  ]);
  const { send, stop, isStreaming, progressStep } = useOllamaStream();
  const assistantContentRef = useRef('');

  const clearHistory = useCallback(() => {
    setMessages([{ role: 'system', content: SYSTEM_PROMPT }]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      const isAppRequest = /crea|haz|genera|app|aplicacion|aplicación/i.test(userText);

      const newMessages: Message[] = [
        ...messages,
        { role: 'user', content: userText, timestamp: Date.now() },
      ];
      setMessages(newMessages);

      assistantContentRef.current = '';

      const confirmationIndex = newMessages.length;
      if (isAppRequest) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '¡Genial! Voy a crear tu app. Pensando...', timestamp: Date.now() },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: '', timestamp: Date.now() }]);
      }

      await send(
        { model, messages: newMessages, apiKey },
        (chunk) => {
          assistantContentRef.current += chunk;

          if (isAppRequest) {
            // Durante la escritura simulada, ir reemplazando la confirmacion
            const { summary } = extractCodeBlock(assistantContentRef.current);
            const displayContent = summary || assistantContentRef.current;

            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: 'assistant',
                content: displayContent,
              };
              return next;
            });
          } else {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: 'assistant',
                content: assistantContentRef.current,
              };
              return next;
            });
          }
        },
        () => {
          // Streaming terminado
          const { code, summary } = extractCodeBlock(assistantContentRef.current);

          if (code) {
            // Si hay codigo, mostrar resumen + mensaje de confirmacion
            const finalContent = summary
              ? `${summary}\n\n✅ Codigo generado. Previsualizando en el panel derecho...`
              : '✅ Codigo generado. Previsualizando en el panel derecho...';

            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: 'assistant',
                content: finalContent,
              };
              return next;
            });

            // Notificar al padre para que cree el Snack
            onCodeGenerated?.(code);
          } else {
            // Sin codigo, mostrar la respuesta completa
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: 'assistant',
                content: assistantContentRef.current,
              };
              return next;
            });
          }
        },
        (err) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content: `Error: ${err.message}`,
            };
            return next;
          });
        },
        (step) => {
          if (isAppRequest && step === 'thinking') {
            setMessages((prev) => {
              const next = [...prev];
              if (next[confirmationIndex]?.role === 'assistant') {
                next[confirmationIndex] = {
                  ...next[confirmationIndex],
                  content: '¡Genial! Voy a crear tu app. Pensando...',
                };
              }
              return next;
            });
          }
          if (isAppRequest && step === 'generating') {
            setMessages((prev) => {
              const next = [...prev];
              if (next[confirmationIndex]?.role === 'assistant') {
                next[confirmationIndex] = {
                  ...next[confirmationIndex],
                  content: '¡Genial! Voy a crear tu app. Generando código...',
                };
              }
              return next;
            });
          }
        }
      );
    },
    [messages, model, apiKey, send, onCodeGenerated]
  );

  const stopStreaming = useCallback(() => {
    stop();
  }, [stop]);

  const chatMessages = messages.filter((m) => m.role !== 'system');

  // Guardar historial cuando cambian los mensajes
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  return {
    messages: chatMessages,
    isStreaming,
    sendMessage,
    stopStreaming,
    progressStep,
    clearHistory,
  };
}
