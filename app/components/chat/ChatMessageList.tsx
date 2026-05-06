'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MessageSquare, Sparkles, Watch, Zap } from 'lucide-react';
import type { Message } from '@/app/types';
import { ChatMessage } from './ChatMessage';

interface ChatMessageListProps {
  messages: Message[];
  isStreaming: boolean;
  progressStep?: string | null;
  thinkingLabel?: string | null;
  onExampleSelect?: (prompt: string) => void;
}

export function ChatMessageList({ messages, isStreaming, progressStep, thinkingLabel, onExampleSelect }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    const examples = [
      { text: 'Calculadora simple', prompt: 'Crea una app de calculadora simple para telefono Android', icon: MessageSquare },
      { text: 'Contador Wear OS', prompt: 'Crea una app de contador de pasos para un reloj Wear OS circular', icon: Watch },
      { text: 'Lista de tareas', prompt: 'Crea una app de lista de tareas minimalista para telefono', icon: Clock },
      { text: 'Temporizador', prompt: 'Crea una app de temporizador circular para reloj', icon: Zap },
    ];

    return (
      <div ref={containerRef} className="flex flex-1 items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm text-center"
        >
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-water-200 bg-water-50 shadow-lg shadow-water-500/10">
            <Sparkles className="h-9 w-9 text-water-500" />
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-water-500">
              <Zap className="h-3 w-3 text-white" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">SamiStudio</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Describe una app Android o Wear OS y la preview aparecera automaticamente en el dispositivo correcto.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {examples.map((example) => (
              <motion.button
                key={example.text}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onExampleSelect?.(example.prompt)}
                disabled={isStreaming}
                className="flex items-center gap-2 rounded-xl border border-bone-200 bg-bone-100 px-3.5 py-2.5 text-sm text-gray-600 shadow-sm transition-all hover:border-water-200 hover:bg-water-50 hover:text-water-700 disabled:opacity-50"
              >
                <example.icon className="h-3.5 w-3.5" />
                {example.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id || `${index}-${message.timestamp || index}`}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
          thinkingLabel={index === messages.length - 1 ? thinkingLabel || progressStep : null}
        />
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
