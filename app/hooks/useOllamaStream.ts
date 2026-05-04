'use client';

import { useState, useRef, useCallback } from 'react';
import { Message } from '@/app/types';

export function useOllamaStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { send, stop, isStreaming };
}
