'use client';

import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-3 mb-1">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-1">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mt-2 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 text-gray-700 dark:text-gray-300 my-1">
          <li>
            <RenderInline text={line.replace(/^[-\*]\s+/, '')} />
          </li>
        </ul>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-0.5 text-gray-700 dark:text-gray-300 my-1">
          <li>
            <RenderInline text={line.replace(/^\d+\.\s+/, '')} />
          </li>
        </ol>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="whitespace-pre-wrap">
          <RenderInline text={line} />
        </p>
      );
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

function RenderInline({ text }: { text: string }) {
  // Procesar inline: bold, italic, code
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns = [
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' as const },
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
      if (earliestMatch.type === 'link') {
        const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(earliestMatch.content) || [earliestMatch.content, earliestMatch.content, '#'];
        elements.push(
          <a
            key={key++}
            href={linkMatch[2] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-water-600 hover:text-water-700 underline underline-offset-2 font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      } else if (earliestMatch.type === 'bold') {
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
