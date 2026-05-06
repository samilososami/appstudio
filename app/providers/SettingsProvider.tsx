'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '@/app/types';
import { DEFAULT_MODEL, DEFAULT_RESPONSE_MODE } from '@/app/lib/constants';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    model: DEFAULT_MODEL,
    responseMode: DEFAULT_RESPONSE_MODE,
  });

  useEffect(() => {
    const stored = localStorage.getItem('samistudio-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        window.setTimeout(() => setSettings({
          apiKey: parsed.apiKey || '',
          model: parsed.model || DEFAULT_MODEL,
          responseMode: parsed.responseMode || DEFAULT_RESPONSE_MODE,
        }), 0);
      } catch {
        // ignore
      }
    }
  }, []);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('samistudio-settings', JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
