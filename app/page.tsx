'use client';

import { useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Eye } from 'lucide-react';
import { AppLayout } from './components/layout/AppLayout';
import { ChatPanel } from './components/chat/ChatPanel';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { useChat } from './hooks/useChat';
import { useSettings } from './providers/SettingsProvider';
import { useSnack } from './hooks/useSnack';
import { DeviceType } from './types';

export default function Home() {
  const { settings } = useSettings();
  const { snackData, isCreating, error, createSnack } = useSnack();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const { messages, isStreaming, sendMessage, stopStreaming, progressStep, clearHistory } = useChat(
    settings.model || 'kimi-k2.6:cloud',
    settings.apiKey,
    async (code: string) => {
      setGeneratedCode(code);
      await createSnack(code);
    }
  );
  const [deviceType, setDeviceType] = useState<DeviceType>('phone');

  return (
    <AppLayout>
      {/* Desktop layout */}
      <Group orientation="horizontal" className="h-full hidden lg:flex">
        <Panel defaultSize={50} minSize={30}>
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            progressStep={progressStep}
            onSendMessage={sendMessage}
            onStopStreaming={stopStreaming}
            onClearHistory={clearHistory}
          />
        </Panel>

        <Separator className="w-1 bg-bone-300 hover:bg-water-400 transition-colors cursor-col-resize" />

        <Panel defaultSize={50} minSize={30}>
          <PreviewPanel
            deviceType={deviceType}
            snackId={snackData?.snackId || null}
            snackUrl={snackData?.url || null}
            generatedCode={generatedCode}
            onDeviceChange={setDeviceType}
            isCreating={isCreating}
            error={error}
          />
        </Panel>
      </Group>

      {/* Mobile layout: tabs */}
      <div className="flex flex-col h-full lg:hidden">
        {/* Mobile tab bar */}
        <div className="flex items-center justify-center gap-1 p-2 bg-bone-50 border-b border-bone-200">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mobileTab === 'chat'
                ? 'bg-water-500 text-white shadow-md shadow-water-500/25'
                : 'text-gray-500 hover:text-gray-700 hover:bg-bone-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mobileTab === 'preview'
                ? 'bg-water-500 text-white shadow-md shadow-water-500/25'
                : 'text-gray-500 hover:text-gray-700 hover:bg-bone-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mobileTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0"
            >
              <ChatPanel
                messages={messages}
                isStreaming={isStreaming}
                progressStep={progressStep}
                onSendMessage={sendMessage}
                onStopStreaming={stopStreaming}
                onClearHistory={clearHistory}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0"
            >
              <PreviewPanel
                deviceType={deviceType}
                snackId={snackData?.snackId || null}
                snackUrl={snackData?.url || null}
                generatedCode={generatedCode}
                onDeviceChange={setDeviceType}
                isCreating={isCreating}
                error={error}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
