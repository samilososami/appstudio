'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, Code2, Cpu, Gauge, Globe, Key, Moon, Sparkles, Sun, X, Zap } from 'lucide-react';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { OLLAMA_MODELS, RESPONSE_MODES } from '@/app/lib/constants';
import type { ResponseMode } from '@/app/types';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODE_ICONS: Record<ResponseMode, typeof Gauge> = {
  balanced: Gauge,
  fast: Zap,
  deep: Brain,
};

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const isCustomModel = !OLLAMA_MODELS.some((model) => model.id === settings.model);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-3 z-[70] flex flex-col overflow-hidden rounded-3xl bg-bone-50 shadow-2xl md:inset-8 xl:inset-14"
          >
            <div className="flex items-center justify-between border-b border-bone-200 px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-500 shadow-lg shadow-water-500/25">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ajustes</h2>
                  <p className="text-sm text-gray-500">Modelo, API y comportamiento</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-xl border border-bone-200 p-2.5 transition-colors hover:bg-bone-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
              <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="space-y-4 rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-water-600" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Modelo de Ollama</h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {OLLAMA_MODELS.map((model) => {
                      const active = settings.model === model.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => updateSettings({ model: model.id })}
                          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                            active
                              ? 'border-water-400 bg-water-50 shadow-sm'
                              : 'border-bone-200 bg-bone-50 hover:border-water-300'
                          }`}
                        >
                          <span
                            className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full ${
                              active ? 'bg-water-500 text-white' : 'bg-bone-300'
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{model.name}</span>
                            <span className="block truncate font-mono text-xs text-gray-500">{model.id}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => updateSettings({ model: isCustomModel ? settings.model : 'custom-model:cloud' })}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isCustomModel ? 'border-water-400 bg-water-50 shadow-sm' : 'border-bone-200 bg-bone-50 hover:border-water-300'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${isCustomModel ? 'bg-water-500' : 'bg-bone-300'}`} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Modelo personalizado</span>
                  </button>

                  {isCustomModel && (
                    <motion.input
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      placeholder="nombre-del-modelo:cloud"
                      value={settings.model}
                      onChange={(event) => updateSettings({ model: event.target.value })}
                      className="w-full rounded-xl border-2 border-bone-200 bg-bone-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-water-500 focus:ring-4 focus:ring-water-100 dark:text-gray-100"
                    />
                  )}
                </section>

                <div className="space-y-6">
                  <section className="space-y-4 rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-water-600" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Respuesta</h3>
                    </div>
                    <div className="grid gap-2">
                      {RESPONSE_MODES.map((mode) => {
                        const Icon = MODE_ICONS[mode.id];
                        const active = settings.responseMode === mode.id;

                        return (
                          <button
                            key={mode.id}
                            onClick={() => updateSettings({ responseMode: mode.id })}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                              active
                                ? 'border-water-400 bg-water-50 shadow-sm'
                                : 'border-bone-200 bg-bone-50 hover:border-water-300'
                            }`}
                          >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-water-500 text-white' : 'bg-bone-200 text-gray-500'}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{mode.name}</span>
                              <span className="text-xs text-gray-500">{mode.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-water-600" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">API Key</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="ollama_..."
                        value={settings.apiKey}
                        onChange={(event) => updateSettings({ apiKey: event.target.value })}
                        className="w-full rounded-xl border-2 border-bone-200 bg-bone-50 px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-water-500 focus:ring-4 focus:ring-water-100 dark:text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => updateSettings({ apiKey: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        Borrar
                      </button>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${settings.apiKey ? 'text-green-600' : 'text-amber-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${settings.apiKey ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {settings.apiKey ? 'API Key configurada' : 'API Key pendiente'}
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-water-600" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Apariencia</h3>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="flex w-full items-center justify-between rounded-xl border border-bone-200 bg-bone-50 p-3 text-left transition-all hover:border-water-300"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                      </span>
                      <span className="rounded-full bg-bone-200 px-2 py-1 text-xs text-gray-500">Cambiar</span>
                    </button>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-water-600" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Proyecto</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="https://github.com/samilososami/appstudio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-bone-200 bg-bone-50 px-3 py-2 text-sm text-gray-600 transition-all hover:bg-bone-100 hover:text-gray-900"
                      >
                        <Code2 className="h-4 w-4" />
                        GitHub
                      </a>
                      <a
                        href="https://samilososami.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-bone-200 bg-bone-50 px-3 py-2 text-sm text-gray-600 transition-all hover:bg-bone-100 hover:text-gray-900"
                      >
                        <Globe className="h-4 w-4" />
                        Web
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="border-t border-bone-200 bg-bone-50 px-6 py-4 md:px-8">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full rounded-xl bg-water-500 py-3 font-semibold text-white shadow-lg shadow-water-500/25 transition-colors hover:bg-water-600"
              >
                Guardar y cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
