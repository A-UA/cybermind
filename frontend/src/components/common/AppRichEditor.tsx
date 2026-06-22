import { useEffect, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react'

interface MenuButtonProps {
  onClick: () => void
  isActive?: boolean
  title: string
  children: ReactNode
}

interface AppRichEditorProps {
  value: string
  onChange: (value: string, meta: { isEmpty: boolean }) => void
  placeholder?: string
}

function MenuButton({ onClick, isActive = false, title, children }: MenuButtonProps) {
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

export default function AppRichEditor({
  value,
  onChange,
  placeholder = '在此输入富文本内容...',
}: AppRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyNodeClass:
          'is-editor-empty before:content-[attr(data-placeholder)] before:float-left before:h-0 before:text-muted-foreground before:pointer-events-none',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 text-foreground leading-relaxed break-words dark:prose-invert prose-headings:font-heading prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-blockquote:border-border prose-blockquote:text-muted-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), { isEmpty: editor.isEmpty })
    },
  })

  // 当外部 value 发生改变且不同于当前 editor 的 HTML 时，进行同步回填
  // 父级切换编辑对象或重置表单时，聚焦状态下也必须更新，避免旧内容写回新表单。
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return null
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
