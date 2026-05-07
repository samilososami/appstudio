import { NextRequest } from 'next/server';
import ts from 'typescript';

function formatDiagnostic(code: string, diagnostic: ts.Diagnostic) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (!diagnostic.file || diagnostic.start === undefined) return message;

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const line = position.line + 1;
  const column = position.character + 1;
  const sourceLine = code.split(/\r?\n/)[position.line]?.trim();

  return sourceLine ? `Line ${line}, column ${column}: ${message}. Source: ${sourceLine}` : `Line ${line}, column ${column}: ${message}`;
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (typeof code !== 'string' || !code.trim()) {
      return Response.json({ ok: false, errors: ['App.js vacio.'] }, { status: 400 });
    }

    const result = ts.transpileModule(code, {
      fileName: 'App.tsx',
      compilerOptions: {
        allowJs: true,
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
      },
      reportDiagnostics: true,
    });

    const diagnostics = (result.diagnostics || [])
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map((diagnostic) => formatDiagnostic(code, diagnostic));

    return Response.json({
      ok: diagnostics.length === 0,
      errors: diagnostics,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido validando App.js.';
    return Response.json({ ok: false, errors: [message] }, { status: 500 });
  }
}
