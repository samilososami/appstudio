'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, User, Wand2 } from 'lucide-react';
import type { Message } from '@/app/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useToast } from '@/app/providers/ToastProvider';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  thinkingLabel?: string | null;
}

function formatTime(timestamp?: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms?: number) {
  if (!ms) return '0 s';
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} s`;
  return `${minutes} min ${seconds.toString().padStart(2, '0')} s`;
}

function useElapsed(startedAt?: number, active?: boolean) {
  const [elapsed, setElapsed] = React.useState(() => (startedAt ? Date.now() - startedAt : 0));

  React.useEffect(() => {
    if (!active || !startedAt) return;
    const update = () => setElapsed(Date.now() - startedAt);
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [active, startedAt]);

  return elapsed;
}

function ThinkingPulse({ label, elapsedMs }: { label?: string | null; elapsedMs?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative mt-3 overflow-hidden rounded-xl border border-bone-200 bg-white/75 px-3 py-2 shadow-sm"
    >
      <motion.div
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-water-200/70 to-transparent blur-sm"
        animate={{ x: ['0%', '320%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-water-500"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.12, 0.9] }}
            transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="truncate text-xs font-medium text-gray-600">{label || 'Pensando...'}</span>
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-water-700">
          Trabajando {formatDuration(elapsedMs)}
        </span>
      </div>
    </motion.div>
  );
}

export const ChatMessage = React.memo(function ChatMessage({ message, isStreaming, thinkingLabel }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const elapsedMs = useElapsed(message.workingStartedAt, isStreaming && !isUser);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      showToast({ type: 'success', message: 'Mensaje copiado al portapapeles' });
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
          isUser ? 'bg-water-500 text-white shadow-water-500/25' : 'bg-bone-200 text-gray-600'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
      </div>

      <div className="flex max-w-[86%] flex-col gap-1">
        <div
          className={`group relative rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-md bg-water-500 text-white shadow-water-500/20'
              : 'rounded-tl-md border border-bone-200 bg-bone-100 text-gray-800 dark:text-gray-200'
          }`}
        >
          {message.content ? <MarkdownRenderer text={message.content} /> : null}
          {!isUser && isStreaming && <ThinkingPulse label={thinkingLabel} elapsedMs={elapsedMs} />}

          {!isUser && !isStreaming && (
            <button
              onClick={handleCopy}
              className="absolute right-2 top-2 rounded-lg border border-bone-200 bg-white/85 p-1.5 opacity-0 shadow-sm transition-all hover:bg-white group-hover:opacity-100"
              title="Copiar mensaje"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-gray-500" />}
            </button>
          )}
        </div>

        {message.timestamp && (
          <span className={`text-[10px] font-medium text-gray-400 ${isUser ? 'mr-1 text-right' : 'ml-1'}`}>
            {formatTime(message.timestamp)}
            {!isUser && message.workedMs ? ` · Trabajó durante ${formatDuration(message.workedMs)}` : ''}
          </span>
        )}
      </div>
    </motion.div>
  );
});
