'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/app/types';

interface ChatMessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatMessageList({ messages, isStreaming }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div ref={containerRef} className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-water-50 flex items-center justify-center border border-water-200">
            <svg className="w-8 h-8 text-water-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Bienvenido a SamiStudio</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Describe la app que quieres crear y la IA generara el codigo para ti.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              'Contador de pasos',
              'Calculadora',
              'Lista de tareas',
              'Reloj digital',
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) {
                    input.value = `Crea una app de ${example.toLowerCase()}`;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-bone-100 border border-bone-200 text-xs text-gray-600 hover:bg-water-50 hover:border-water-200 hover:text-water-700 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
        />
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
