'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ExternalLink, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ExpoActionsProps {
  snackId: string | null;
}

export function ExpoActions({ snackId }: ExpoActionsProps) {
  const [showQr, setShowQr] = useState(false);

  const qrUrl = snackId
    ? `https://qr.expo.dev/eas-update?id=${snackId}&platform=android`
    : null;

  const snackUrl = snackId ? `https://snack.expo.dev/${snackId}` : null;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {showQr && snackId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-4 bg-white rounded-xl shadow-lg border border-bone-300 p-4 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Escanea con Expo Go</span>
              <button
                onClick={() => setShowQr(false)}
                className="p-1 rounded hover:bg-bone-100"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG value={qrUrl!} size={160} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group relative">
        <button
          onClick={() => setShowQr(!showQr)}
          disabled={!snackId}
          className={`p-2.5 rounded-xl border transition-all shadow-sm ${
            snackId
              ? 'bg-white border-bone-200 hover:bg-bone-50 hover:border-water-300 hover:text-water-600 text-gray-600 hover:shadow-md'
              : 'bg-bone-100 border-bone-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <QrCode className="w-4 h-4" />
        </button>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-800 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Ver QR
        </span>
      </div>

      <div className="group relative">
        <a
          href={snackUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`block p-2.5 rounded-xl border transition-all shadow-sm ${
            snackId
              ? 'bg-white border-bone-200 hover:bg-bone-50 hover:border-water-300 hover:text-water-600 text-gray-600 hover:shadow-md'
              : 'bg-bone-100 border-bone-200 text-gray-300 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-800 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Abrir en Expo
        </span>
      </div>
    </div>
  );
}
