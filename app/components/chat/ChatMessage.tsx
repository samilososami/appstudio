'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Wand2 } from 'lucide-react';
import { Message } from '@/app/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
      <div
        className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
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
      </div>
    </motion.div>
  );
});
