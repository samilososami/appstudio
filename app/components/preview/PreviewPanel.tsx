'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Copy, Download, Eye, Loader2, RefreshCw, Smartphone, Watch, Zap } from 'lucide-react';
import type { DeviceType, WatchShape } from '@/app/types';
import { useToast } from '@/app/providers/ToastProvider';
import { PhoneMockup } from './PhoneMockup';
import { WatchMockup } from './WatchMockup';
import { ExpoActions } from './ExpoActions';
import { SnackRuntimePreview } from './SnackRuntimePreview';

interface PreviewPanelProps {
  deviceType: DeviceType;
  watchShape: WatchShape;
  snackId: string | null;
  snackUrl: string | null;
  runtimeUrl?: string | null;
  generatedCode?: string | null;
  isGenerating?: boolean;
  isCreating?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function PreviewPanel({
  deviceType,
  watchShape,
  snackId,
  snackUrl,
  runtimeUrl,
  generatedCode,
  isGenerating,
  isCreating,
  error,
  onRetry,
}: PreviewPanelProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = React.useState<'preview' | 'code'>('preview');
  const previewId = React.useMemo(() => {
    if (!generatedCode) return null;
    return `${deviceType}-${watchShape}-${hashString(generatedCode)}`;
  }, [deviceType, generatedCode, watchShape]);

  React.useEffect(() => {
    if (!previewId || !generatedCode || typeof window === 'undefined') return;
    localStorage.setItem(
      `samistudio-preview-${previewId}`,
      JSON.stringify({
        code: generatedCode,
        deviceType,
        watchShape,
        snackId,
        snackUrl,
        runtimeUrl,
        createdAt: Date.now(),
      })
    );
  }, [deviceType, generatedCode, previewId, runtimeUrl, snackId, snackUrl, watchShape]);

  const fullScreenUrl = previewId ? `/preview/${previewId}` : null;
  const targetLabel =
    deviceType === 'watch'
      ? watchShape === 'square'
        ? 'Reloj cuadrado'
        : 'Reloj circular'
      : 'Telefono';
  const TargetIcon = deviceType === 'watch' ? Watch : Smartphone;
  const magicActive = Boolean(isGenerating || isCreating);

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'App.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: 'Codigo descargado como App.js' });
  };

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    showToast({ type: 'success', message: 'Codigo copiado al portapapeles' });
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center px-6 text-center text-sm text-gray-400">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-bone-100">
        <Zap className="h-5 w-5 text-bone-400" />
      </div>
      <span className="font-medium text-gray-500">Escribe un prompt</span>
      <span>para generar una preview interactiva</span>
    </div>
  );

  const loadingState = (
    <div className="flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-gray-500">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        className="rounded-full"
      >
        <Loader2 className="h-7 w-7 text-water-600" />
      </motion.div>
      <span className="font-medium">Preparando preview...</span>
    </div>
  );

  const screenContent = (children: React.ReactNode) => (
    <div className="relative h-full w-full overflow-hidden">
      <div className={`h-full w-full transition-all duration-300 ${magicActive ? 'scale-[1.015] blur-sm brightness-90' : ''}`}>
        {children}
      </div>
      <AnimatePresence>
        {magicActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[2px]"
          >
            <motion.div
              animate={{ scale: [0.92, 1.04, 0.92], opacity: [0.55, 0.95, 0.55] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full border border-water-200/70 bg-white/60 shadow-xl shadow-water-500/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-dashed border-water-400/70"
              />
              <Zap className="h-7 w-7 text-water-600" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-bone-50">
      <div className="flex items-center justify-between gap-4 border-b border-bone-200 bg-bone-50 px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-water-500 shadow-lg shadow-water-500/25">
            <Eye className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Preview</h2>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
              <TargetIcon className="h-3.5 w-3.5" />
              <span className="truncate">Auto por IA: {targetLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {generatedCode && (
            <div className="flex items-center rounded-xl border border-bone-200 bg-bone-100 p-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                  activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                  activeTab === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Codigo
              </button>
            </div>
          )}

          {generatedCode && (
            <>
              <button
                onClick={handleCopy}
                className="group relative rounded-xl border border-bone-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all hover:border-water-300 hover:bg-bone-50 hover:text-water-600"
              >
                <Copy className="h-4 w-4" />
                <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Copiar codigo
                </span>
              </button>
              <button
                onClick={handleDownload}
                className="group relative rounded-xl border border-bone-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all hover:border-water-300 hover:bg-bone-50 hover:text-water-600"
              >
                <Download className="h-4 w-4" />
                <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Descargar App.js
                </span>
              </button>
            </>
          )}

          <ExpoActions
            snackUrl={snackUrl}
            runtimeUrl={runtimeUrl}
            fullScreenUrl={fullScreenUrl}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-6">
        {activeTab === 'code' && generatedCode ? (
          <div className="flex h-full w-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">App.js</span>
              <button onClick={handleCopy} className="text-xs font-medium text-water-600 transition-colors hover:text-water-700">
                Copiar todo
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-700 bg-gray-950">
              <pre className="h-full w-full overflow-auto p-4 font-mono text-xs leading-relaxed text-green-300">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-center gap-2 rounded-xl border border-water-200 bg-water-50 px-4 py-2 text-sm font-medium text-water-700"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <Zap className="h-4 w-4" />
                  </motion.div>
                  Guardando Snack para QR...
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex max-w-sm flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
              >
                <span>{error}</span>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-200"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reintentar
                  </button>
                )}
              </motion.div>
            )}

            <div className="flex min-h-0 flex-1 items-center justify-center">
              <AnimatePresence mode="wait">
                {deviceType === 'phone' ? (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, scale: 0.94, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -18 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PhoneMockup>
                      {screenContent(
                        generatedCode ? (
                          <SnackRuntimePreview code={generatedCode} viewport={{ width: 390, height: 834 }} fit="cover" />
                        ) : isCreating || isGenerating ? (
                          loadingState
                        ) : (
                          emptyState
                        )
                      )}
                    </PhoneMockup>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`watch-${watchShape}`}
                    initial={{ opacity: 0, scale: 0.94, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -18 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <WatchMockup shape={watchShape}>
                      {screenContent(
                        generatedCode ? (
                          <SnackRuntimePreview
                            code={generatedCode}
                            compact
                            fit="cover"
                            viewport={{ width: watchShape === 'round' ? 220 : 240, height: watchShape === 'round' ? 220 : 240 }}
                            className={watchShape === 'round' ? 'rounded-full' : 'rounded-[38px]'}
                          />
                        ) : isCreating || isGenerating ? (
                          loadingState
                        ) : (
                          emptyState
                        )
                      )}
                    </WatchMockup>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
