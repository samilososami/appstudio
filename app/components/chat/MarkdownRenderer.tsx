'use client';

import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim().startsWith('```')) {
      const language = line.trim().replace(/^```/, '').trim() || 'text';
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;

      elements.push(
        <div key={key++} className="my-3 overflow-hidden rounded-xl border border-black/10 bg-gray-950">
          <div className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {language}
          </div>
          <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-green-300">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
      index += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
          <RenderInline text={line.slice(2)} />
        </h1>
      );
      index += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">
          <RenderInline text={line.slice(3)} />
        </h2>
      );
      index += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <RenderInline text={line.slice(4)} />
        </h3>
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ''));
        index += 1;
      }
      elements.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <RenderInline text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      elements.push(
        <ol key={key++} className="my-2 list-decimal space-y-1 pl-5 text-gray-700 dark:text-gray-300">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <RenderInline text={item} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].startsWith('> ')) {
        quoteLines.push(lines[index].slice(2));
        index += 1;
      }
      elements.push(
        <blockquote key={key++} className="my-2 border-l-2 border-water-400 pl-3 text-gray-600 dark:text-gray-300">
          {quoteLines.map((quote, quoteIndex) => (
            <p key={quoteIndex}>
              <RenderInline text={quote} />
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !lines[index].trim().startsWith('```') &&
      !/^(#{1,3}\s|[-*]\s+|\d+\.\s+|>\s)/.test(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    elements.push(
      <p key={key++} className="whitespace-pre-wrap">
        <RenderInline text={paragraphLines.join('\n')} />
      </p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

function RenderInline({ text }: { text: string }) {
  const tokens: React.ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[2] && match[3]) {
      tokens.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-water-700 underline underline-offset-2 hover:text-water-800"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      tokens.push(
        <strong key={key++} className="font-semibold">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      tokens.push(
        <code key={key++} className="rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[0.92em]">
          {match[5]}
        </code>
      );
    } else if (match[6]) {
      tokens.push(<em key={key++}>{match[6]}</em>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return <>{tokens}</>;
}
