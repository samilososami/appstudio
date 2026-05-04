'use client';

import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  // Dividir en parrafos por doble salto de linea
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="whitespace-pre-wrap">
          <RenderInline text={paragraph} />
        </p>
      ))}
    </div>
  );
}

function RenderInline({ text }: { text: string }) {
  // Procesar inline: bold, italic, code
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, type: 'bold' as const },
    { regex: /`(.+?)`/g, type: 'code' as const },
    { regex: /\*(.+?)\*/g, type: 'italic' as const },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; type: string; content: string } | null = null;

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(remaining);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = {
          index: match.index,
          length: match[0].length,
          type: pattern.type,
          content: match[1],
        };
      }
    }

    if (earliestMatch) {
      // Texto antes del match
      if (earliestMatch.index > 0) {
        elements.push(<span key={key++}>{remaining.slice(0, earliestMatch.index)}</span>);
      }

      // El match
      if (earliestMatch.type === 'bold') {
        elements.push(<strong key={key++} className="font-semibold">{earliestMatch.content}</strong>);
      } else if (earliestMatch.type === 'italic') {
        elements.push(<em key={key++}>{earliestMatch.content}</em>);
      } else if (earliestMatch.type === 'code') {
        elements.push(
          <code key={key++} className="px-1.5 py-0.5 rounded-md bg-black/10 text-sm font-mono">
            {earliestMatch.content}
          </code>
        );
      }

      remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
    } else {
      // No hay mas matches
      elements.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return <>{elements}</>;
}
