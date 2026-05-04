import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { model, messages, stream = true, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key requerida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const upstream = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream }),
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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
