import { NextRequest } from 'next/server';
import { Snack } from 'snack-sdk';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, name = 'Generated App' } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Codigo requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const snack = new Snack({
      name,
      sdkVersion: '51.0.0',
      files: {
        'App.js': {
          type: 'CODE',
          contents: code,
        },
      },
      dependencies: {},
    });

    await snack.saveAsync();
    const state = snack.getState();
    const snackId = state.id;
    const url = `https://snack.expo.dev/${snackId}`;

    return Response.json({ snackId, url });
  } catch (error: any) {
    console.error('Error creando Snack:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
