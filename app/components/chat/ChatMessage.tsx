'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Wand2, Copy, Check } from 'lucide-react';
import { Message } from '@/app/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

function formatTime(timestamp?: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const hasCode = message.content.includes('```') || message.content.includes('`');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-water-500 text-white shadow-water-500/25'
            : 'bg-bone-200 text-gray-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
      </div>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
            isUser
              ? 'bg-water-500 text-white rounded-tr-md shadow-water-500/20'
              : 'bg-bone-100 border border-bone-200 text-gray-800 rounded-tl-md'
          }`}
        >
          <MarkdownRenderer text={message.content} />
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 ml-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-current opacity-80 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}

          {/* Boton copiar */}
          {!isUser && !isStreaming && hasCode && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-white border border-bone-200 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
              title="Copiar mensaje"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          )}
        </div>
        {message.timestamp && (
          <span
            className={`text-[10px] text-gray-400 font-medium ${
              isUser ? 'text-right mr-1' : 'ml-1'
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </motion.div>
  );
});
