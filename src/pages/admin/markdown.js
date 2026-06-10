import { Editor } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import { EDITOR_EXTENSIONS } from './TipTapEditor';

// Headless conversions through the same schema the rich editor uses, so
// Markdown ⇄ Rich mode switches are lossless for schema-supported content.
const EXTENSIONS = [...EDITOR_EXTENSIONS, Markdown];

function withEditor(options, fn) {
  const editor = new Editor({ extensions: EXTENSIONS, ...options });
  try {
    return fn(editor);
  } finally {
    editor.destroy();
  }
}

export function htmlToMarkdown(html) {
  if (!html || !html.trim()) return '';
  return withEditor({ content: html, contentType: 'html' }, (e) => e.getMarkdown());
}

export function markdownToHtml(markdown) {
  if (!markdown || !markdown.trim()) return '';
  return withEditor({ content: markdown, contentType: 'markdown' }, (e) => e.getHTML());
}
