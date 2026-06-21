import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react'

interface AppRichEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function AppRichEditor({ value, onChange }: AppRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '在此优雅地撰写文章富文本内容...',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4 text-sm text-foreground leading-relaxed max-w-full prose dark:prose-invert',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // 当外部 value 发生改变且不同于当前 editor 的 HTML 时，进行同步回填
  // 仅在编辑器非聚焦状态下同步，避免光标跳到末尾
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  // 菜单按钮组件
  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    title, 
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    title: string; 
    children: React.ReactNode 
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-2 border-2 border-border rounded-lg transition-all pop-shadow-sm select-none cursor-pointer ${
          isActive 
            ? 'bg-primary text-primary-foreground -translate-x-[1px] -translate-y-[1px]' 
            : 'bg-background text-foreground hover:bg-accent hover:translate-x-[0.5px] hover:translate-y-[0.5px]'
        }`}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="border-2 border-border rounded-xl bg-card overflow-hidden pop-shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* 按钮控制条栏 */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-accent/30 border-b-2 border-border">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="加粗"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="斜体"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="删除线"
        >
          <Strikethrough className="h-4 w-4" />
        </MenuButton>

        <div className="w-[2px] h-6 bg-border mx-1 self-center" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="一级标题"
        >
          <Heading1 className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="二级标题"
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>

        <div className="w-[2px] h-6 bg-border mx-1 self-center" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="无序列表"
        >
          <List className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="有序列表"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="引用区块"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>

        <div className="w-[2px] h-6 bg-border mx-1 self-center ml-auto" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="撤销"
        >
          <Undo className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="重做"
        >
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>

      {/* 富文本编辑区 */}
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
