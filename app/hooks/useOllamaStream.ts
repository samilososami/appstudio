'use client';

import { useState, useRef, useCallback } from 'react';
import type { Message, ResponseMode } from '@/app/types';

export type StreamProgressEvent =
  | { type: 'request'; label: string }
  | { type: 'thinking'; label: string }
  | { type: 'first-token'; label: string }
  | { type: 'code-start'; label: string }
  | { type: 'code-complete'; label: string }
  | { type: 'done'; label: string };

interface OllamaStreamChunk {
  message?: {
    thinking?: string;
    content?: string;
  };
  done?: boolean;
}

export function useOllamaStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (
      payload: { model: string; messages: Message[]; apiKey: string; responseMode: ResponseMode },
      onChunk: (text: string) => void,
      onDone: () => void | Promise<void>,
      onError: (err: Error) => void,
      onProgress?: (event: StreamProgressEvent) => void,
      onThinking?: (text: string) => void
    ) => {
      setIsStreaming(true);
      abortRef.current = new AbortController();

      const report = (event: StreamProgressEvent) => {
        setProgressStep(event.label);
        onProgress?.(event);
      };

      report({ type: 'request', label: 'Pensando...' });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, stream: true }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }

        if (!res.body) {
          throw new Error('La respuesta de Ollama no tiene stream.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let sawContent = false;
        let sawThinking = false;
        let codeFenceCount = 0;

        while (true) {
          const { value, done } = await reader.read();
          if (done || abortRef.current?.signal.aborted) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            let data: OllamaStreamChunk;
            try {
              data = JSON.parse(line);
            } catch {
              continue;
            }

            const thinking = data.message?.thinking || '';
            const content = data.message?.content || '';

            if (thinking) {
              if (!sawThinking) {
                sawThinking = true;
                report({ type: 'thinking', label: 'Razonando la solucion...' });
              }
              onThinking?.(thinking);
            }

            if (content) {
              if (!sawContent) {
                sawContent = true;
                report({ type: 'first-token', label: 'Dando forma a la app...' });
              }

              const previousFenceCount = codeFenceCount;
              codeFenceCount += (content.match(/```/g) || []).length;

              if (previousFenceCount === 0 && codeFenceCount > 0) {
                report({ type: 'code-start', label: 'Preparando la interfaz...' });
              } else if (previousFenceCount % 2 === 1 && codeFenceCount % 2 === 0) {
                report({ type: 'code-complete', label: 'Montando preview...' });
              }

              onChunk(content);
            }

            if (data.done) {
              report({ type: 'done', label: 'Finalizando...' });
            }
          }
        }

        if (!abortRef.current?.signal.aborted) {
          await onDone();
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        onError(err instanceof Error ? err : new Error('Error leyendo el stream de Ollama'));
      } finally {
        setIsStreaming(false);
        setProgressStep(null);
      }
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setProgressStep(null);
  }, []);

  return { send, stop, isStreaming, progressStep };
}
