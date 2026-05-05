'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, Trash2 } from 'lucide-react';
import { Message } from '@/app/types';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useToast } from '@/app/providers/ToastProvider';

interface ChatPanelProps {
  messages: Message[];
  isStreaming: boolean;
  progressStep?: string | null;
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  onClearHistory?: () => void;
}

export function ChatPanel({ messages, isStreaming, progressStep, onSendMessage, onStopStreaming, onClearHistory }: ChatPanelProps) {
  const { showToast } = useToast();

  const handleClear = () => {
    onClearHistory?.();
    showToast({ type: 'info', message: 'Historial de conversación borrado' });
  };
  return (
    <div className="flex flex-col h-full bg-bone-50">
      <div className="px-6 py-5 border-b border-bone-200 bg-bone-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-water-500 flex items-center justify-center shadow-lg shadow-water-500/25">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Chat</h2>
            <p className="text-xs text-gray-500">
              Habla con SamiBuilder para crear tu app
            </p>
          </div>
          {messages.length > 0 && onClearHistory && (
            <button
              onClick={handleClear}
              className="ml-auto p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-200"
              title="Limpiar historial (Ctrl+K para enfocar input)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {(isStreaming || progressStep) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-water-50 border border-water-200"
            >
              <Zap className="w-3 h-3 text-water-600" />
              <span className="text-xs font-medium text-water-700">
                {progressStep === 'thinking' ? 'Pensando...' : progressStep === 'generating' ? 'Generando código...' : 'Generando...'}
              </span>
            </motion.div>
          )}
        </div>
      </div>
      <ChatMessageList messages={messages} isStreaming={isStreaming} />
      <ChatInput
        onSubmit={isStreaming ? onStopStreaming : onSendMessage}
        isStreaming={isStreaming}
        placeholder={isStreaming ? 'Generando...' : 'Escribe tu prompt...'}
      />
    </div>
  );
}
