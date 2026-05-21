import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Heading2, Italic, LinkIcon, List } from 'lucide-react';
import { Button } from './Button';

export function RichTextEditor({ value, placeholder = 'Escreva o conteudo completo do post...', onChange }: { value: string; placeholder?: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  if (!editor) return null;

  return (
    <div className="rich-editor overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-2">
        <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Button>
        <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Button>
        <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Button>
        <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-3"
          onClick={() => {
            const href = window.prompt('URL do link');
            if (href) editor.chain().focus().setLink({ href }).run();
          }}
        >
          <LinkIcon size={16} />
        </Button>
      </div>
      <EditorContent className="prose-meganet max-w-none p-4 text-sm" editor={editor} />
    </div>
  );
}
