import React from 'react';

// Format inline text: **bold**, *italic*, `code/math`, $math$
function renderInline(text) {
  if (!text) return null;

  const parts = [];
  let key = 0;

  // Regex matches `code`, $math$, **bold**, *italic*
  const inlineRegex = /(`[^`]+`|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const tokens = String(text).split(inlineRegex);

  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={key++} className="tutor-code-pill">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('$') && token.endsWith('$')) {
      const mathStr = token.slice(1, -1)
        .replace(/\\times/g, '×')
        .replace(/\\cdot/g, '·')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\le/g, '≤')
        .replace(/\\ge/g, '≥')
        .replace(/\\neq/g, '≠')
        .replace(/\*\*/g, '');
      parts.push(<span key={key++} className="tutor-math-pill">{mathStr}</span>);
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={key++} className="tutor-bold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={key++} className="tutor-italic">{token.slice(1, -1)}</em>);
    } else {
      parts.push(token);
    }
  }

  return parts;
}

export default function TutorMarkdown({ content }) {
  if (!content) return null;

  const lines = String(content).split('\n');
  const elements = [];
  let currentList = null;
  let key = 0;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ol') {
        elements.push(
          <ol key={key++} className="tutor-ordered-list">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="tutor-list-item">
                <span className="step-num">{idx + 1}</span>
                <div className="step-content">{renderInline(item)}</div>
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key++} className="tutor-unordered-list">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="tutor-list-item">
                <span className="bullet-dot" />
                <div className="bullet-content">{renderInline(item)}</div>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Check for headings: ### or ## or #
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const HeadingTag = level <= 2 ? 'h4' : 'h5';
      elements.push(
        <HeadingTag key={key++} className={`tutor-heading tutor-h${level}`}>
          {renderInline(headingText)}
        </HeadingTag>
      );
      continue;
    }

    // Check for "Real-Life Example" or "Village Context"
    const isVillageCallout =
      trimmed.toLowerCase().includes('real-life example') ||
      trimmed.toLowerCase().includes('real life example') ||
      trimmed.toLowerCase().includes('village example') ||
      trimmed.includes('गाँव का उदाहरण') ||
      trimmed.includes('गाँव के हाट') ||
      trimmed.includes('ग्रामीण उदाहरण');

    if (isVillageCallout) {
      flushList();
      const cleanBody = trimmed.replace(
        /^(\*\*|#)*\s*(real-life example|real life example|village example|गाँव का उदाहरण)[:\s\*\-]*/i,
        ''
      );
      elements.push(
        <div key={key++} className="tutor-village-callout">
          <div className="village-callout-header">
            <span className="callout-icon">🌾</span>
            <strong>Village Context · ग्रामीण संदर्भ</strong>
          </div>
          <div className="village-callout-body">
            {renderInline(cleanBody || trimmed)}
          </div>
        </div>
      );
      continue;
    }

    // Check for ordered list items: "1. " or "2. "
    const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (olMatch) {
      if (currentList && currentList.type !== 'ol') flushList();
      if (!currentList) currentList = { type: 'ol', items: [] };
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Check for unordered list items: "* " or "- " or "• "
    const ulMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
    if (ulMatch) {
      if (currentList && currentList.type !== 'ul') flushList();
      if (!currentList) currentList = { type: 'ul', items: [] };
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="tutor-paragraph">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="tutor-formatted-content">{elements}</div>;
}
