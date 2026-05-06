'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Snack } from 'snack-sdk';
import { EXPO_SDK_VERSION } from '@/app/lib/constants';

interface SnackRuntimePreviewProps {
  code: string;
  className?: string;
  compact?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  fit?: 'contain' | 'cover';
}

export function SnackRuntimePreview({ code, className, compact, viewport, fit = 'contain' }: SnackRuntimePreviewProps) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const webPreviewRef = React.useRef<Window | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const snackRef = React.useRef<Snack | null>(null);
  const [webPreviewURL, setWebPreviewURL] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'booting' | 'loading' | 'ready' | 'error'>('booting');
  const [error, setError] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState(1);
  const logicalViewport = viewport || { width: compact ? 220 : 390, height: compact ? 220 : 844 };

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateScale = () => {
      const bounds = element.getBoundingClientRect();
      const widthScale = bounds.width / logicalViewport.width;
      const heightScale = bounds.height / logicalViewport.height;
      const nextScale = fit === 'cover' ? Math.max(widthScale, heightScale) : Math.min(widthScale, heightScale);
      setScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fit, logicalViewport.height, logicalViewport.width]);

  React.useEffect(() => {
    if (!code.trim() || !webPreviewRef.current) return;

    setStatus('booting');
    setError(null);
    setWebPreviewURL(null);

    const snack = new Snack({
      name: 'SamiStudio Preview',
      sdkVersion: EXPO_SDK_VERSION,
      files: {
        'App.js': {
          type: 'CODE',
          contents: code,
        },
      },
      dependencies: {},
      webPreviewRef,
      codeChangesDelay: 0,
    });

    snackRef.current = snack;

    const unsubscribeState = snack.addStateListener((state) => {
      if (state.webPreviewURL) {
        setWebPreviewURL(state.webPreviewURL);
        setStatus((current) => (current === 'ready' ? current : 'loading'));
      }

      const webClient = Object.values(state.connectedClients).find((client) => client.transport === 'webplayer');
      if (webClient?.status === 'ok') setStatus('ready');
      if (webClient?.error) {
        setStatus('error');
        setError(webClient.error.message || 'La preview devolvio un error.');
      }
    });

    const unsubscribeLog = snack.addLogListener((log) => {
      if (log.type === 'error') {
        setStatus('error');
        setError(log.message);
      }
    });

    const initialURL = snack.getState().webPreviewURL;
    if (initialURL) {
      setWebPreviewURL(initialURL);
      setStatus('loading');
    }

    snack.sendCodeChanges();

    return () => {
      unsubscribeState();
      unsubscribeLog();
      snack.setDisabled(true);
      snackRef.current = null;
    };
  }, [code]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden bg-white ${className || ''}`}>
      {(status === 'booting' || status === 'loading') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bone-50 text-gray-500">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-water-600`} />
          </motion.div>
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} mt-2 font-medium`}>
            {status === 'booting' ? 'Preparando runtime...' : 'Cargando app...'}
          </span>
        </div>
      )}

      {status === 'error' && error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-red-50 p-4 text-center text-red-700">
          <AlertCircle className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold`}>Error en preview</span>
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} max-w-[220px] leading-snug`}>{error}</span>
        </div>
      )}

      <iframe
        ref={(element) => {
          iframeRef.current = element;
          webPreviewRef.current = element?.contentWindow || null;
        }}
        src={webPreviewURL || 'about:blank'}
        title="SamiStudio app preview"
        className="absolute left-1/2 top-1/2 border-0 bg-white"
        style={{
          width: logicalViewport.width,
          height: logicalViewport.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
        allow="accelerometer; camera; encrypted-media; gyroscope; microphone"
        onLoad={() => {
          if (webPreviewURL) setStatus('ready');
        }}
      />
    </div>
  );
}
