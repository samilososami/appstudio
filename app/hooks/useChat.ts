'use client';

import { useState, useCallback, useRef } from 'react';
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

export function useChat(
  model: string,
  apiKey: string,
  onCodeGenerated?: (code: string) => void
) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT },
  ]);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const { send, stop, isStreaming } = useOllamaStream();
  const assistantContentRef = useRef('');

  const sendMessage = useCallback(
    async (userText: string) => {
      const isAppRequest = /crea|haz|genera|app|aplicacion|aplicación/i.test(userText);

      const newMessages: Message[] = [
        ...messages,
        { role: 'user', content: userText },
      ];
      setMessages(newMessages);

      assistantContentRef.current = '';

      const confirmationIndex = newMessages.length;
      if (isAppRequest) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '¡Genial! Voy a crear tu app. Pensando...' },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
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
          setProgressStep(step);
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

  return {
    messages: chatMessages,
    isStreaming,
    sendMessage,
    stopStreaming,
    progressStep,
  };
}
