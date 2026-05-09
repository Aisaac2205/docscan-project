import React from 'react';

function parseMarkdownToElements(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length === 0) return;
    elements.push(
      <ul key={`list-${key++}`} className="list-disc list-inside space-y-1 my-2 text-stone-700">
        {currentList.map((item, i) => (
          <li key={i} className="leading-relaxed">
            <InlineMarkdown text={item} />
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect bullet: * item or - item
    if (/^[*\-]\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[*\-]\s+/, ''));
      continue;
    }

    // Not a bullet — flush any pending list
    flushList();

    if (trimmed === '') {
      elements.push(<div key={`br-${key++}`} className="h-2" />);
      continue;
    }

    elements.push(
      <p key={`p-${key++}`} className="leading-relaxed my-1">
        <InlineMarkdown text={trimmed} />
      </p>
    );
  }

  flushList();
  return elements;
}

function InlineMarkdown({ text }: { text: string }) {
  // Parse **bold** inline
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-stone-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export function MarkdownRenderer({ text, className = '' }: MarkdownRendererProps) {
  const elements = parseMarkdownToElements(text);
  return <div className={className}>{elements}</div>;
}
