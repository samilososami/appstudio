'use client';

import { useState, useRef, useCallback } from 'react';
import { Message } from '@/app/types';

export function useOllamaStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const progressMessages = [
    'Analizando requisitos...',
    'Diseñando estructura...',
    'Generando componentes...',
    'Aplicando estilos...',
    'Optimizando código...',
    'Verificando sintaxis...',
    'Casi listo...',
  ];

  const send = useCallback(async (
    payload: { model: string; messages: Message[]; apiKey: string },
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
    onProgress?: (step: 'thinking' | 'generating') => void
  ) => {
    setIsStreaming(true);
    abortRef.current = new AbortController();
    onProgress?.('thinking');
    setProgressStep('Analizando tu solicitud...');

    let messageIndex = 0;
    progressTimerRef.current = setInterval(() => {
      messageIndex = (messageIndex + 1) % progressMessages.length;
      setProgressStep(progressMessages[messageIndex]);
    }, 2500);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: false }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      const data = await res.json();
      const fullText = data.message?.content || data.message?.thinking || '';

      if (!fullText) {
        onDone();
        return;
      }

      // Simular efecto de escritura: chunks rapidos para mejor UX
      onProgress?.('generating');
      const chunkSize = fullText.length > 500 ? 40 : 12;
      const delay = fullText.length > 500 ? 2 : 8;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        if (abortRef.current?.signal.aborted) break;
        onChunk(fullText.slice(i, i + chunkSize));
        await new Promise((r) => setTimeout(r, delay));
      }

      if (!abortRef.current?.signal.aborted) {
        onDone();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') onError(err);
    } finally {
      setIsStreaming(false);
      setProgressStep(null);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setProgressStep(null);
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  return { send, stop, isStreaming, progressStep };
}
