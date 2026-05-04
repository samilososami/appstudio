'use client';

import { useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
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
  const { messages, isStreaming, sendMessage, stopStreaming, progressStep, clearHistory } = useChat(
    settings.model || 'kimi-k2.6:cloud',
    settings.apiKey,
    createSnack
  );
  const [deviceType, setDeviceType] = useState<DeviceType>('phone');

  return (
    <AppLayout>
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
            onDeviceChange={setDeviceType}
            isCreating={isCreating}
            error={error}
          />
        </Panel>
      </Group>

      {/* Mobile layout: stacked vertically */}
      <div className="flex flex-col h-full lg:hidden">
        <div className="flex-1 min-h-0">
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            progressStep={progressStep}
            onSendMessage={sendMessage}
            onStopStreaming={stopStreaming}
            onClearHistory={clearHistory}
          />
        </div>
        <div className="h-[300px] border-t border-bone-200">
          <PreviewPanel
            deviceType={deviceType}
            snackId={snackData?.snackId || null}
            snackUrl={snackData?.url || null}
            onDeviceChange={setDeviceType}
            isCreating={isCreating}
            error={error}
          />
        </div>
      </div>
    </AppLayout>
  );
}
