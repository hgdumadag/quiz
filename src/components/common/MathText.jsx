import React from 'react';
import katex from 'katex';

function findClosingParen(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    if (text[i] === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function convertSqrt(text) {
  let output = '';
  let i = 0;

  while (i < text.length) {
    if (text.slice(i, i + 5).toLowerCase() === 'sqrt(') {
      const open = i + 4;
      const close = findClosingParen(text, open);
      if (close > open) {
        const inner = text.slice(open + 1, close);
        output += `\\sqrt{${convertSqrt(inner)}}`;
        i = close + 1;
        continue;
      }
    }
    output += text[i];
    i += 1;
  }

  return output;
}

function toLatex(expr) {
  let text = String(expr ?? '').trim();
  if (!text) return '';

  text = convertSqrt(text);
  text = text.replace(/\bdiv\b/gi, '\\div');
  text = text.replace(/\s+x\s+/g, ' \\times ');
  text = text.replace(/\^\\?\(([^()]+)\)/g, '^{$1}');
  text = text.replace(/\^(-?\d+|[a-zA-Z]+)/g, '^{$1}');

  return text;
}

function renderKatex(expr) {
  const html = katex.renderToString(toLatex(expr), {
    throwOnError: false,
    displayMode: false,
    strict: 'ignore',
  });
  return html;
}

const MATH_SEGMENT_REGEX =
  /sqrt\([^()]*\)|[A-Za-z0-9()^]+(?:\s*(?:\^[-(]?[A-Za-z0-9+-]+|[+\-*/=]|x|div)\s*[A-Za-z0-9()^+-]+)+/gi;

export default function MathText({ text, className = '' }) {
  const raw = String(text ?? '');
  const segments = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = MATH_SEGMENT_REGEX.exec(raw)) !== null) {
    const [segment] = match;
    const start = match.index;
    const end = start + segment.length;

    if (start > lastIndex) {
      segments.push(
        <React.Fragment key={`txt-${key++}`}>
          {raw.slice(lastIndex, start)}
        </React.Fragment>,
      );
    }

    segments.push(
      <span
        key={`math-${key++}`}
        dangerouslySetInnerHTML={{ __html: renderKatex(segment) }}
      />,
    );

    lastIndex = end;
  }

  if (lastIndex < raw.length) {
    segments.push(
      <React.Fragment key={`txt-${key++}`}>
        {raw.slice(lastIndex)}
      </React.Fragment>,
    );
  }

  if (segments.length === 0) {
    return <span className={className}>{raw}</span>;
  }

  return <span className={className}>{segments}</span>;
}

