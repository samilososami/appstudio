'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '@/app/types';
import { DEFAULT_MODEL } from '@/app/lib/constants';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    model: DEFAULT_MODEL,
  });

  useEffect(() => {
    const stored = localStorage.getItem('samistudio-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({
          apiKey: parsed.apiKey || '',
          model: parsed.model || DEFAULT_MODEL,
        });
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
