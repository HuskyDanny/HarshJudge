import { type FC, useMemo } from 'react';

interface MarkdownContentProps {
  /** Markdown content to render */
  content: string;
}

/**
 * Simple markdown parser that converts markdown to HTML
 * Supports: headers, lists, code blocks, bold, italic, links
 */
function parseMarkdown(markdown: string): string {
  let html = markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code (`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (lines not already tagged)
    .split('\n\n')
    .map(block => {
      if (block.match(/^<(h[1-3]|ul|ol|pre|blockquote)/)) {
        return block;
      }
      return `<p>${block}</p>`;
    })
    .join('\n');

  return html;
}

/**
 * Renders Markdown content with custom dark theme styling
 */
export const MarkdownContent: FC<MarkdownContentProps> = ({ content }) => {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className="
        text-sm text-gray-300 leading-relaxed
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-4 [&_h1]:mt-0
        [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-3 [&_h2]:mt-6
        [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-white [&_h3]:mb-2 [&_h3]:mt-4
        [&_p]:mb-3
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
        [&_li]:mb-1
        [&_code]:bg-gray-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-green-300
        [&_pre]:bg-gray-900 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300
        [&_strong]:font-semibold [&_strong]:text-white
        [&_em]:italic [&_em]:text-gray-400
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
