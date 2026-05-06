'use client';

import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { Message } from '@/app/types';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useToast } from '@/app/providers/ToastProvider';

interface ChatPanelProps {
  messages: Message[];
  isStreaming: boolean;
  progressStep?: string | null;
  thinkingLabel?: string | null;
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  onClearHistory?: () => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  progressStep,
  thinkingLabel,
  onSendMessage,
  onStopStreaming,
  onClearHistory,
}: ChatPanelProps) {
  const { showToast } = useToast();

  const handleClear = () => {
    onClearHistory?.();
    showToast({ type: 'info', message: 'Historial de conversacion borrado' });
  };

  return (
    <div className="flex h-full flex-col bg-bone-50">
      <div className="border-b border-bone-200 bg-bone-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-water-500 shadow-lg shadow-water-500/25">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Chat</h2>
            <p className="truncate text-xs text-gray-500">SamiBuilder genera apps Expo con preview directa</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {messages.length > 0 && onClearHistory && (
              <button
                onClick={handleClear}
                className="rounded-xl border border-transparent p-2 text-gray-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                title="Limpiar historial"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        progressStep={progressStep}
        thinkingLabel={thinkingLabel}
        onExampleSelect={onSendMessage}
      />
      <ChatInput
        onSubmit={isStreaming ? onStopStreaming : onSendMessage}
        isStreaming={isStreaming}
        placeholder={isStreaming ? 'Generando...' : 'Pide una app Android o Wear OS...'}
      />
    </div>
  );
}
