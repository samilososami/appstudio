'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { DeviceType, WatchShape } from '@/app/types';
import { SnackRuntimePreview } from './SnackRuntimePreview';

interface StoredPreview {
  code: string;
  deviceType: DeviceType;
  watchShape: WatchShape;
  createdAt: number;
}

export function FullScreenPreview({ previewId }: { previewId: string }) {
  const [preview, setPreview] = React.useState<StoredPreview | null>(null);
  const [missing, setMissing] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: number | null = null;
    try {
      const stored = localStorage.getItem(`samistudio-preview-${previewId}`);
      if (!stored) {
        timeoutId = window.setTimeout(() => setMissing(true), 0);
      } else {
        const parsed = JSON.parse(stored);
        timeoutId = window.setTimeout(() => setPreview(parsed), 0);
      }
    } catch {
      timeoutId = window.setTimeout(() => setMissing(true), 0);
    }

    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [previewId]);

  if (missing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-300" />
          <h1 className="text-lg font-semibold">Preview no encontrada</h1>
          <p className="text-sm text-zinc-400">Vuelve al chat y abre la preview desde el panel derecho.</p>
        </div>
      </main>
    );
  }

  if (!preview) {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  const isWatch = preview.deviceType === 'watch';

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div
        className={`overflow-hidden bg-white ${
          isWatch
            ? 'h-[min(82vw,82vh)] w-[min(82vw,82vh)] rounded-full'
            : 'h-screen w-screen'
        }`}
      >
        <SnackRuntimePreview
          code={preview.code}
          compact={preview.deviceType === 'watch'}
          viewport={
            preview.deviceType === 'watch'
              ? { width: 220, height: 220 }
              : { width: 390, height: 834 }
          }
        />
      </div>
    </main>
  );
}
