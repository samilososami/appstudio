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

      <button
        onClick={() => setShowQr(!showQr)}
        disabled={!snackId}
        className={`p-2 rounded-lg border transition-all ${
          snackId
            ? 'bg-white border-bone-300 hover:bg-bone-100 text-gray-700'
            : 'bg-bone-200 border-bone-300 text-gray-400 cursor-not-allowed'
        }`}
        title="Ver QR"
      >
        <QrCode className="w-4 h-4" />
      </button>

      <a
        href={snackUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-lg border transition-all ${
          snackId
            ? 'bg-white border-bone-300 hover:bg-bone-100 text-gray-700'
            : 'bg-bone-200 border-bone-300 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
        title="Abrir en nueva pestana"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
