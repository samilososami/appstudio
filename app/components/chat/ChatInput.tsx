'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled, isStreaming, placeholder = 'Escribe tu prompt...' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      onSubmit('');
      return;
    }
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 py-5 border-t border-bone-200 bg-bone-50">
      <div
        className={`flex items-center gap-3 p-1.5 rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? 'border-water-400 bg-bone-50 shadow-lg shadow-water-500/10'
            : 'border-bone-200 bg-bone-50 hover:border-bone-300'
        }`}
      >
        <div className="flex-1 relative">
          <input
            id="chat-input-field"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled || isStreaming}
            className="w-full px-4 py-2.5 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none disabled:opacity-50 transition-all"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!isStreaming && (disabled || !value.trim())}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-xl transition-all duration-200 shadow-md ${
            !isStreaming && (disabled || !value.trim())
              ? 'bg-bone-200 text-gray-400 cursor-not-allowed shadow-none'
              : isStreaming
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/25'
                : 'bg-water-500 text-white hover:bg-water-600 shadow-water-500/25'
          }`}
        >
          <AnimatePresence mode="wait">
            {isStreaming ? (
              <motion.div
                key="stop"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Square className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Send className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Hint text */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px] text-gray-400 font-medium">
          {isStreaming ? 'Generando respuesta...' : 'Shift + Enter para nueva linea'}
        </span>
        {!isStreaming && value.trim() && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-water-500 font-medium"
          >
            Enter para enviar
          </motion.span>
        )}
      </div>
    </form>
  );
}
