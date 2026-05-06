import { NextRequest } from 'next/server';
import type { ResponseMode } from '@/app/types';

function getModeConfig(responseMode: ResponseMode | undefined) {
  switch (responseMode) {
    case 'fast':
      return {
        think: false,
        options: { temperature: 0.15, top_p: 0.8 },
      };
    case 'deep':
      return {
        think: 'high',
        options: { temperature: 0.25, top_p: 0.9 },
      };
    case 'balanced':
    default:
      return {
        think: false,
        options: { temperature: 0.2, top_p: 0.9 },
      };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { model, messages, stream = true, apiKey, responseMode } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key requerida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const modeConfig = getModeConfig(responseMode);
    const sanitizedMessages = Array.isArray(messages)
      ? messages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      : [];

    const upstream = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: sanitizedMessages,
        stream,
        think: modeConfig.think,
        options: modeConfig.options,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/x-ndjson',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
