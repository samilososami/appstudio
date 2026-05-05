'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceType } from '@/app/types';
import { PhoneMockup } from './PhoneMockup';
import { WatchMockup } from './WatchMockup';
import { DeviceToggle } from './DeviceToggle';
import { ExpoActions } from './ExpoActions';
import { Eye, Zap, Download, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/app/providers/ToastProvider';

interface PreviewPanelProps {
  deviceType: DeviceType;
  snackId: string | null;
  snackUrl: string | null;
  generatedCode?: string | null;
  onDeviceChange: (device: DeviceType) => void;
  isCreating?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PreviewPanel({
  deviceType,
  snackId,
  snackUrl,
  generatedCode,
  onDeviceChange,
  isCreating,
  error,
  onRetry,
}: PreviewPanelProps) {
  const { showToast } = useToast();
  const [iframeLoading, setIframeLoading] = React.useState(true);

  React.useEffect(() => {
    setIframeLoading(true);
  }, [snackId]);

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
    showToast({ type: 'success', message: 'Código descargado como App.js' });
  };
  return (
    <div className="flex flex-col h-full bg-bone-50">
      <div className="flex items-center justify-between px-6 py-5 border-b border-bone-200 bg-bone-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-water-500 flex items-center justify-center shadow-lg shadow-water-500/25">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Preview</h2>
            <p className="text-xs text-gray-500">Expo Snack</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {generatedCode && (
            <div className="group relative">
              <button
                onClick={handleDownload}
                className="p-2.5 rounded-xl border bg-bone-50 border-bone-200 hover:bg-bone-50 hover:border-water-300 hover:text-water-600 text-gray-600 hover:shadow-md transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
              </button>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-800 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Descargar código
              </span>
            </div>
          )}
          <ExpoActions snackId={snackId} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        <DeviceToggle value={deviceType} onChange={onDeviceChange} />

        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-water-50 border border-water-200 text-water-700 text-sm font-medium"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            Creando preview...
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium max-w-xs text-center"
          >
            <span>{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar
              </button>
            )}
          </motion.div>
        )}

        <div className="mt-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {deviceType === 'phone' ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <PhoneMockup>
                  {snackId ? (
                    <div className="relative w-full h-full">
                      {iframeLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bone-50 z-10">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-6 h-6 text-water-500" />
                          </motion.div>
                          <span className="text-xs text-gray-400 mt-2">Cargando preview...</span>
                        </div>
                      )}
                      <iframe
                        src={`https://snack.expo.dev/embedded/${snackId}?preview=true&platform=android&supportedPlatforms=android&theme=dark&deviceAppearance=dark`}
                        className="w-full h-full border-0"
                        style={{ minHeight: '100%' }}
                        allow="camera; microphone"
                        title="Phone Preview"
                        onLoad={() => setIframeLoading(false)}
                      />
                    </div>
                  ) : isCreating ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-sm text-center px-6 space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 rounded-full border-2 border-water-300 border-t-water-600"
                      />
                      <span className="font-medium text-gray-500">Generando preview...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-sm text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-bone-100 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-bone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="font-medium">Escribe un prompt</span>
                      <span>para generar una app</span>
                    </div>
                  )}
                </PhoneMockup>
              </motion.div>
            ) : (
              <motion.div
                key="watch"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <WatchMockup>
                  {snackId ? (
                    <div className="relative w-full h-full">
                      {iframeLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-5 h-5 text-water-500" />
                          </motion.div>
                          <span className="text-[10px] text-gray-500 mt-1.5">Cargando...</span>
                        </div>
                      )}
                      <iframe
                        src={`https://snack.expo.dev/embedded/${snackId}?preview=true&platform=android&supportedPlatforms=android&theme=dark&deviceAppearance=dark`}
                        className="w-full h-full border-0"
                        style={{ minHeight: '100%', clipPath: 'circle(50%)' }}
                        allow="camera; microphone"
                        title="Watch Preview"
                        onLoad={() => setIframeLoading(false)}
                      />
                    </div>
                  ) : isCreating ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-xs text-center px-4 space-y-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 rounded-full border-2 border-water-300 border-t-water-600"
                      />
                      <span className="font-medium text-gray-500">Generando...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 text-xs text-center px-4">
                      <div className="w-8 h-8 rounded-xl bg-bone-50/10 flex items-center justify-center mb-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span>Escribe un prompt</span>
                    </div>
                  )}
                </WatchMockup>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
