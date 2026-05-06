import { NextRequest } from 'next/server';
import { Snack } from 'snack-sdk';
import { EXPO_SDK_VERSION } from '@/app/lib/constants';

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
      sdkVersion: EXPO_SDK_VERSION,
      files: {
        'App.js': {
          type: 'CODE',
          contents: code,
        },
      },
      dependencies: {},
    });

    const saved = await snack.saveAsync({ ignoreUser: true });
    const state = snack.getState();
    const snackId = saved.snackId || state.snackId || saved.id;
    const savedId = saved.id || state.id || snackId;
    const url = `https://snack.expo.dev/${savedId}`;

    return Response.json({
      snackId,
      savedId,
      url,
      runtimeUrl: state.url || saved.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido creando Snack';
    console.error('Error creando Snack:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
