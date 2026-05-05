'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Key, Cpu, Globe, Heart, Code2, Moon, Sun } from 'lucide-react';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { OLLAMA_MODELS } from '@/app/lib/constants';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();

  const isCustomModel = !OLLAMA_MODELS.some((m) => m.id === settings.model);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[70] bg-bone-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-bone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-water-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ajustes</h2>
                  <p className="text-sm text-gray-500">Configura tu experiencia</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2.5 rounded-xl hover:bg-bone-100 transition-colors border border-bone-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Modelo */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-water-600" />
                    <label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Modelo de Ollama
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Selecciona el modelo de IA que generara tu codigo
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OLLAMA_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => updateSettings({ model: model.id })}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          settings.model === model.id
                            ? 'border-water-500 bg-water-50 shadow-md'
                            : 'border-bone-200 hover:border-water-300 hover:bg-bone-50'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            settings.model === model.id ? 'bg-water-500' : 'bg-bone-300'
                          }`}
                        />
                        <div>
                          <span className="block font-medium text-gray-900 dark:text-gray-100">{model.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{model.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      updateSettings({
                        model: isCustomModel ? settings.model : 'custom',
                      })
                    }
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      isCustomModel
                        ? 'border-water-500 bg-water-50 shadow-md'
                        : 'border-bone-200 hover:border-water-300 hover:bg-bone-50'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCustomModel ? 'bg-water-500' : 'bg-bone-300'
                      }`}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Otro modelo...</span>
                  </button>

                  {isCustomModel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <input
                        type="text"
                        placeholder="nombre-del-modelo:cloud"
                        value={settings.model}
                        onChange={(e) => updateSettings({ model: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-bone-200 bg-bone-50 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:border-water-500 focus:ring-4 focus:ring-water-100 transition-all"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-bone-200" />

                {/* API Key */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-water-600" />
                    <label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      API Key de Ollama Cloud
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Tu clave de acceso a Ollama Cloud. Se almacena localmente en tu navegador.
                  </p>

                  <div className="relative">
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={settings.apiKey}
                      onChange={(e) => updateSettings({ apiKey: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-bone-200 bg-bone-50 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:border-water-500 focus:ring-4 focus:ring-water-100 transition-all pr-24"
                    />
                    <button
                      onClick={() => updateSettings({ apiKey: '' })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Borrar
                    </button>
                  </div>

                  {!settings.apiKey && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Introduce tu API Key de Ollama Cloud para empezar
                    </div>
                  )}
                  {settings.apiKey && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      API Key configurada
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-bone-200" />

                {/* Apariencia */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-water-600" />
                    <label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Apariencia
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Elige entre modo claro y oscuro
                  </p>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      theme === 'dark'
                        ? 'border-water-500 bg-water-50 shadow-md'
                        : 'border-bone-200 hover:border-water-300 hover:bg-bone-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-water-500' : 'bg-bone-300'}`} />
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <>
                          <Moon className="w-4 h-4 text-gray-700" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">Modo oscuro</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 text-gray-700" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">Modo claro</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-bone-200" />

                {/* Acerca de */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-water-600" />
                    <label className="text-base font-semibold text-gray-900 dark:text-gray-100">Acerca de</label>
                  </div>
                  <p className="text-sm text-gray-500">
                    SamiStudio es un generador de apps moviles con IA.
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://github.com/samilososami/appstudio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bone-100 border border-bone-200 text-sm text-gray-600 hover:bg-bone-200 hover:text-gray-900 dark:text-gray-100 transition-all"
                    >
                      <Code2 className="w-4 h-4" />
                      GitHub
                    </a>
                    <a
                      href="https://samilososami.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bone-100 border border-bone-200 text-sm text-gray-600 hover:bg-bone-200 hover:text-gray-900 dark:text-gray-100 transition-all"
                    >
                      <Globe className="w-4 h-4" />
                      Web
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-bone-200 bg-bone-50">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full py-3 rounded-xl bg-water-500 text-white font-semibold hover:bg-water-600 transition-colors shadow-lg shadow-water-500/25"
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
