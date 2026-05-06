'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Gauge, Send, Square, Zap } from 'lucide-react';
import { RESPONSE_MODES } from '@/app/lib/constants';
import { useSettings } from '@/app/providers/SettingsProvider';
import type { ResponseMode } from '@/app/types';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

const MODE_ICONS: Record<ResponseMode, typeof Gauge> = {
  balanced: Gauge,
  fast: Zap,
  deep: Brain,
};

export function ChatInput({ onSubmit, disabled, isStreaming, placeholder = 'Escribe tu prompt...' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings, updateSettings } = useSettings();

  const submitValue = () => {
    if (isStreaming) {
      onSubmit('');
      return;
    }
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = '44px';
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitValue();
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    event.target.style.height = '44px';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 132)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-bone-200 bg-bone-50 px-5 py-4">
      <div
        className={`rounded-2xl border-2 bg-white p-2 shadow-sm transition-all duration-200 ${
          isFocused ? 'border-water-400 shadow-water-500/10' : 'border-bone-200 hover:border-bone-300'
        }`}
      >
        <textarea
          id="chat-input-field"
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submitValue();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className="max-h-32 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-gray-900 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50 dark:text-gray-100"
        />

        <div className="flex items-center justify-between gap-3 border-t border-bone-200 pt-2">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {RESPONSE_MODES.map((mode) => {
              const Icon = MODE_ICONS[mode.id];
              const active = settings.responseMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  title={mode.description}
                  onClick={() => updateSettings({ responseMode: mode.id })}
                  disabled={isStreaming}
                  className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-water-500 text-white shadow-sm shadow-water-500/20'
                      : 'text-gray-500 hover:bg-bone-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mode.name}
                </button>
              );
            })}
          </div>

          <motion.button
            type="submit"
            disabled={!isStreaming && (disabled || !value.trim())}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-all ${
              !isStreaming && (disabled || !value.trim())
                ? 'cursor-not-allowed bg-bone-200 text-gray-400 shadow-none'
                : isStreaming
                  ? 'bg-red-500 text-white shadow-red-500/25 hover:bg-red-600'
                  : 'bg-water-500 text-white shadow-water-500/25 hover:bg-water-600'
            }`}
          >
            <AnimatePresence mode="wait">
              {isStreaming ? (
                <motion.div key="stop" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Square className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Send className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </form>
  );
}
