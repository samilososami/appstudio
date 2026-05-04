'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MessageSquare, Settings, X, Sparkles, AlertCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SettingsPanel } from './SettingsPanel';
import { useSettings } from '@/app/providers/SettingsProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<'chat' | 'settings'>('chat');
  const { settings } = useSettings();

  const handleNavigate = (item: 'chat' | 'settings') => {
    setActiveItem(item);
    if (item === 'settings') {
      setSettingsOpen(true);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-bone-100 overflow-hidden">
      {!settings.apiKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-[55] bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            Configura tu API Key de Ollama Cloud en Ajustes para empezar a crear apps
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-sm font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
          >
            Abrir Ajustes
          </button>
        </motion.div>
      )}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-5 left-5 z-50 p-3 rounded-2xl bg-white shadow-lg shadow-black/5 border border-bone-200 hover:shadow-xl hover:border-water-200 transition-all duration-300 group"
        aria-label="Abrir menu"
      >
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-gray-700" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-gray-700 group-hover:text-water-600 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl z-40 flex flex-col"
            >
              <div className="px-6 pt-20 pb-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-water-500 flex items-center justify-center shadow-lg shadow-water-500/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">SamiStudio</h1>
                    <p className="text-xs text-gray-500">Generador de Apps</p>
                  </div>
                </div>
                <Sidebar activeItem={activeItem} onNavigate={handleNavigate} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full">
        {children}
      </div>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
