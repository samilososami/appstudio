'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/app/types';
import { Sparkles, MessageSquare, Zap, Clock, Trash2 } from 'lucide-react';

interface ChatMessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onClearHistory?: () => void;
}

export function ChatMessageList({ messages, isStreaming, onClearHistory }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-water-50 flex items-center justify-center border border-water-200 shadow-lg shadow-water-500/10">
              <Sparkles className="w-10 h-10 text-water-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-water-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Bienvenido a SamiStudio</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Describe la app que quieres crear y la IA generara el codigo para ti.
              <br />
              Tambien puedes preguntarme lo que sea sobre React Native o Expo.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ejemplos</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { text: 'Contador de pasos', icon: Zap },
                { text: 'Calculadora', icon: MessageSquare },
                { text: 'Lista de tareas', icon: Clock },
                { text: 'Reloj digital', icon: Sparkles },
              ].map((example) => (
                <motion.button
                  key={example.text}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input) {
                      input.value = `Crea una app de ${example.text.toLowerCase()}`;
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                      input.focus();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bone-100 border border-bone-200 text-sm text-gray-600 hover:bg-water-50 hover:border-water-200 hover:text-water-700 transition-all shadow-sm"
                >
                  <example.icon className="w-3.5 h-3.5" />
                  {example.text}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
      {messages.map((message, index) => (
        <ChatMessage
          key={`${index}-${message.timestamp || index}`}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
        />
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
