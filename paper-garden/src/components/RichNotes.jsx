import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Heading2, List, ListOrdered, Quote, Undo2, Redo2, Check, Cloud, Info } from 'lucide-react'
import { db, now } from '../lib/db.js'

function Tool({ title, active = false, onClick, children }) {
  return <button aria-label={title} title={title} type="button" onClick={onClick} className={`editor-tool ${active ? 'editor-tool-active' : ''}`}>{children}</button>
}

export default function RichNotes({ paperId, initialHtml = '' }) {
  const [saved, setSaved] = useState(true)
  const timer = useRef(null)
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Start anywhere. What stood out? What made sense? What would you like to explore?' })],
    content: initialHtml || '<p></p>',
    immediatelyRender: false,
    editorProps: { attributes: { class: 'prose-editor focus:outline-none' } },
    onUpdate: ({ editor: ed }) => {
      setSaved(false)
      clearTimeout(timer.current)
      const html = ed.getHTML()
      timer.current = setTimeout(async () => {
        try { await db.notes.put({ paperId, html, updatedAt: now() }); setSaved(true) }
        catch { setSaved(false) }
      }, 450)
    },
  }, [paperId])
  useEffect(() => () => {
    clearTimeout(timer.current)
    if (editor) db.notes.put({ paperId, html: editor.getHTML(), updatedAt: now() }).catch(() => {})
  }, [editor, paperId])

  return <div className="paper-surface min-h-[560px] flex flex-col overflow-hidden">
    <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
      <div><h2 className="font-display text-2xl">Your thinking space</h2><p className="text-sm muted mt-1">Messy thoughts are welcome here.</p></div>
      <span className={`saved-indicator ${!saved ? 'opacity-70' : ''}`}>{saved ? <Check size={14}/> : <Cloud size={14}/>} {saved ? 'Saved locally' : 'Saving…'}</span>
    </div>
    <div className="editor-toolbar">
      <Tool title="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={17}/></Tool>
      <Tool title="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={17}/></Tool>
      <div className="tool-divider"/>
      <Tool title="Heading" active={editor?.isActive('heading',{level:2})} onClick={() => editor?.chain().focus().toggleHeading({level:2}).run()}><Heading2 size={17}/></Tool>
      <Tool title="Bulleted list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={17}/></Tool>
      <Tool title="Numbered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={17}/></Tool>
      <Tool title="Quote" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={17}/></Tool>
      <div className="tool-divider"/>
      <Tool title="Undo" onClick={() => editor?.chain().focus().undo().run()}><Undo2 size={17}/></Tool>
      <Tool title="Redo" onClick={() => editor?.chain().focus().redo().run()}><Redo2 size={17}/></Tool>
    </div>
    <div className="flex-1 px-7 py-6"><EditorContent editor={editor}/></div>
    <div className="notes-footer"><Info size={14}/> Autosaved in your browser. Export a backup from the sidebar to keep a separate copy.</div>
  </div>
}
