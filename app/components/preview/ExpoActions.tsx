'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ExpoActionsProps {
  snackUrl?: string | null;
  runtimeUrl?: string | null;
  fullScreenUrl?: string | null;
}

export function ExpoActions({ snackUrl, runtimeUrl, fullScreenUrl }: ExpoActionsProps) {
  const [showQr, setShowQr] = useState(false);
  const qrUrl = runtimeUrl || snackUrl || null;
  const canOpenPreview = Boolean(fullScreenUrl);

  return (
    <div className="relative flex items-center gap-2">
      <AnimatePresence>
        {showQr && qrUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 rounded-xl border border-bone-300 bg-white p-4 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-gray-700">Expo Go</span>
              <button onClick={() => setShowQr(false)} className="rounded p-1 transition-colors hover:bg-bone-100">
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
            <div className="rounded-lg bg-white p-2">
              <QRCodeSVG value={qrUrl} size={160} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowQr((current) => !current)}
        disabled={!qrUrl}
        className={`group relative rounded-xl border p-2.5 shadow-sm transition-all ${
          qrUrl
            ? 'border-bone-200 bg-white text-gray-600 hover:border-water-300 hover:bg-bone-50 hover:text-water-600'
            : 'cursor-not-allowed border-bone-200 bg-bone-100 text-gray-300'
        }`}
      >
        <QrCode className="h-4 w-4" />
        <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Ver QR
        </span>
      </button>

      <a
        href={fullScreenUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative block rounded-xl border p-2.5 shadow-sm transition-all ${
          canOpenPreview
            ? 'border-bone-200 bg-white text-gray-600 hover:border-water-300 hover:bg-bone-50 hover:text-water-600'
            : 'pointer-events-none cursor-not-allowed border-bone-200 bg-bone-100 text-gray-300'
        }`}
      >
        <ExternalLink className="h-4 w-4" />
        <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Abrir preview
        </span>
      </a>
    </div>
  );
}
