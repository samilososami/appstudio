'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceType } from '@/app/types';
import { PhoneMockup } from './PhoneMockup';
import { WatchMockup } from './WatchMockup';
import { DeviceToggle } from './DeviceToggle';
import { ExpoActions } from './ExpoActions';
import { Eye, Zap, Loader2 } from 'lucide-react';

interface PreviewPanelProps {
  deviceType: DeviceType;
  snackId: string | null;
  snackUrl: string | null;
  onDeviceChange: (device: DeviceType) => void;
  isCreating?: boolean;
  error?: string | null;
}

export function PreviewPanel({
  deviceType,
  snackId,
  snackUrl,
  onDeviceChange,
  isCreating,
  error,
}: PreviewPanelProps) {
  return (
    <div className="flex flex-col h-full bg-bone-50">
      <div className="flex items-center justify-between px-6 py-5 border-b border-bone-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-water-500 flex items-center justify-center shadow-lg shadow-water-500/25">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Preview</h2>
            <p className="text-xs text-gray-500">Expo Snack</p>
          </div>
        </div>
        <ExpoActions snackId={snackId} />
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
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium max-w-xs text-center"
          >
            {error}
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
                    <iframe
                      src={`https://snack.expo.dev/embedded/${snackId}?preview=true&platform=android&supportedPlatforms=android&theme=dark&deviceAppearance=dark`}
                      className="w-full h-full border-0"
                      style={{ minHeight: '100%' }}
                      allow="camera; microphone"
                      title="Phone Preview"
                    />
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
                    <iframe
                      src={`https://snack.expo.dev/embedded/${snackId}?preview=true&platform=android&supportedPlatforms=android&theme=dark&deviceAppearance=dark`}
                      className="w-full h-full border-0"
                      style={{ minHeight: '100%', clipPath: 'circle(50%)' }}
                      allow="camera; microphone"
                      title="Watch Preview"
                    />
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
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">
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
