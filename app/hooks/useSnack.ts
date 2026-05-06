'use client';

import { useState, useCallback } from 'react';
import { SnackData } from '@/app/types';

export function useSnack() {
  const [snackData, setSnackData] = useState<SnackData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSnack = useCallback(async (code: string, name?: string) => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/snack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error creando Snack');
      }

      const data: SnackData = await res.json();
      setSnackData(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creando Snack';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { snackData, isCreating, error, createSnack };
}
