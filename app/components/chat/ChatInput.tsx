'use client';

import React, { useState } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled, isStreaming, placeholder = 'Escribe tu prompt...' }: ChatInputProps) {
  const [value, setValue] = useState('');

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
    <form onSubmit={handleSubmit} className="px-5 py-5 border-t border-bone-200 bg-white">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isStreaming}
            className="w-full px-5 py-3.5 pr-12 rounded-2xl border-2 border-bone-200 bg-bone-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-water-500 focus:ring-4 focus:ring-water-100 focus:bg-white disabled:opacity-50 transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs text-gray-400 font-medium">Enter →</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={!isStreaming && (disabled || !value.trim())}
          className={`p-3.5 rounded-2xl transition-all duration-200 shadow-lg ${
            !isStreaming && (disabled || !value.trim())
              ? 'bg-bone-200 text-gray-400 cursor-not-allowed shadow-none'
              : isStreaming
                ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30 active:scale-95 shadow-red-500/25'
                : 'bg-water-500 text-white hover:bg-water-600 hover:shadow-water-500/30 active:scale-95 shadow-water-500/25'
          }`}
        >
          {isStreaming ? (
            <Square className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}
