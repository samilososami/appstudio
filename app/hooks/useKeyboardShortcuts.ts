'use client';

import { useEffect } from 'react';

interface ShortcutsConfig {
  onFocusInput?: () => void;
  onCloseModals?: () => void;
}

export function useKeyboardShortcuts({ onFocusInput, onCloseModals }: ShortcutsConfig) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K para enfocar input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onFocusInput?.();
      }

      // Escape para cerrar modales/settings
      if (e.key === 'Escape') {
        onCloseModals?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFocusInput, onCloseModals]);
}
