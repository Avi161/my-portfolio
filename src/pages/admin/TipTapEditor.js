import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { fileToDataUrl } from './images';

// Adds a `data-align` attribute so an image can float left/right (text wraps
// into the space beside it) or sit centered. It serializes as a plain attribute,
// so it survives getHTML(), extractImages, and publish, and the same CSS styles
// it in the editor and on the live post.
const AlignableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-align'),
        renderHTML: (attrs) => (attrs.align ? { 'data-align': attrs.align } : {}),
      },
    };
  },
});

export const EDITOR_EXTENSIONS = [
  StarterKit.configure({ link: { openOnClick: false } }),
  AlignableImage.configure({
    allowBase64: true,
    // Built-in drag-to-resize: corner handles commit width/height attributes
    // on the <img>, which survive publishing as plain HTML.
    resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 80 },
  }),
];

// Text-formatting bubble menu: only for actual text selections, not images
// (images get resize handles instead). Must be a stable reference — BubbleMenu
// dispatches a transaction whenever this prop changes identity, which loops
// forever with shouldRerenderOnTransaction: true.
function bubbleMenuShouldShow({ editor, state }) {
  const { empty, from, to } = state.selection;
  return !empty && !editor.isActive('image') && state.doc.textBetween(from, to).length > 0;
}

// Image alignment bar: shown only when an image node is selected. Stable
// reference — BubbleMenu dispatches a transaction whenever shouldShow changes
// identity, which loops forever with shouldRerenderOnTransaction: true.
function imageBubbleShouldShow({ editor }) {
  return editor.isActive('image');
}

function ToolButton({ active, disabled, onClick, title, children }) {
  return (
    <button
      type="button"
      className={`admin-tool-btn${active ? ' is-active' : ''}`}
      disabled={disabled}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function TipTapEditor({ content, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [linkDraft, setLinkDraft] = useState(null); // null = closed, string = open

  const insertImageFiles = (files) => {
    files.forEach(async (file) => {
      const src = await fileToDataUrl(file);
      const editor = editorRef.current;
      if (editor) editor.chain().focus().setImage({ src }).run();
    });
  };

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      handlePaste(view, event) {
        const files = [...((event.clipboardData && event.clipboardData.files) || [])]
          .filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        insertImageFiles(files);
        return true;
      },
      handleDrop(view, event) {
        const files = [...((event.dataTransfer && event.dataTransfer.files) || [])]
          .filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        insertImageFiles(files);
        return true;
      },
    },
  });
  editorRef.current = editor;

  if (!editor) return null;

  // The resize node view only applies attributes when it's first built, so
  // updateAttributes alone won't repaint the editor (publish/reload are fine —
  // they go through renderHTML). Reflect data-align onto the live <img> too so
  // the float previews immediately while editing.
  const setImageAlign = (align) => {
    editor.chain().focus().updateAttributes('image', { align }).run();
    const dom = editor.view.nodeDOM(editor.state.selection.from);
    const img = dom && (dom.matches && dom.matches('img') ? dom : dom.querySelector && dom.querySelector('img'));
    if (img) {
      if (align) img.setAttribute('data-align', align);
      else img.removeAttribute('data-align');
    }
  };

  const applyLink = () => {
    const url = (linkDraft || '').trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkDraft(null);
  };

  const openLinkInput = () => {
    setLinkDraft(editor.getAttributes('link').href || '');
  };

  return (
    <div className="admin-tiptap">
      <div className="admin-toolbar">
        <ToolButton title="Heading 2" active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolButton>
        <ToolButton title="Heading 3" active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolButton>
        <span className="admin-toolbar-sep" />
        <ToolButton title="Bold" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolButton>
        <ToolButton title="Italic" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}><em>i</em></ToolButton>
        <ToolButton title="Link" active={editor.isActive('link')} onClick={openLinkInput}>🔗</ToolButton>
        <span className="admin-toolbar-sep" />
        <ToolButton title="Blockquote" active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolButton>
        <ToolButton title="Code block" active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</ToolButton>
        <ToolButton title="Bullet list" active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</ToolButton>
        <ToolButton title="Numbered list" active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>1≡</ToolButton>
        <span className="admin-toolbar-sep" />
        <ToolButton title="Insert image" onClick={() => fileInputRef.current.click()}>🖼</ToolButton>
        <ToolButton title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolButton>
        <span className="admin-toolbar-sep" />
        <ToolButton title="Undo" disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}>↺</ToolButton>
        <ToolButton title="Redo" disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}>↻</ToolButton>
      </div>

      {linkDraft !== null && (
        <div className="admin-link-input">
          <input
            type="url"
            autoFocus
            placeholder="https://… (empty to remove link)"
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') setLinkDraft(null);
            }}
          />
          <button type="button" onClick={applyLink}>Apply</button>
          <button type="button" onClick={() => setLinkDraft(null)}>Cancel</button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          insertImageFiles([...e.target.files]);
          e.target.value = '';
        }}
      />

      <BubbleMenu editor={editor} pluginKey="textBubble" className="admin-bubble-menu" shouldShow={bubbleMenuShouldShow}>
        <ToolButton title="Bold" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolButton>
        <ToolButton title="Italic" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}><em>i</em></ToolButton>
        <ToolButton title="Link" active={editor.isActive('link')} onClick={openLinkInput}>🔗</ToolButton>
      </BubbleMenu>

      <BubbleMenu editor={editor} pluginKey="imageBubble" className="admin-bubble-menu" shouldShow={imageBubbleShouldShow}>
        <ToolButton title="Float left — text wraps on the right"
          active={editor.getAttributes('image').align === 'left'}
          onClick={() => setImageAlign('left')}>⬗ left</ToolButton>
        <ToolButton title="Center (no wrap)"
          active={!editor.getAttributes('image').align}
          onClick={() => setImageAlign(null)}>▣ center</ToolButton>
        <ToolButton title="Float right — text wraps on the left"
          active={editor.getAttributes('image').align === 'right'}
          onClick={() => setImageAlign('right')}>right ⬖</ToolButton>
      </BubbleMenu>

      <div className="blog-post-content admin-editor-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
