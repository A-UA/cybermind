import { useEffect, useMemo, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'

import { createRichEditorExtensions } from './richEditor/extensions'
import { resolveRichEditorConfig } from './richEditor/presets'
import { richEditorToolbarItems } from './richEditor/toolbarItems'
import type {
  RichEditorFeature,
  RichEditorPreset,
  RichEditorToolbarGroup,
} from './richEditor/types'

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
  preset?: RichEditorPreset
  features?: RichEditorFeature[]
  disabledFeatures?: RichEditorFeature[]
  toolbar?: RichEditorToolbarGroup[]
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
  preset,
  features,
  disabledFeatures,
  toolbar,
}: AppRichEditorProps) {
  const resolvedConfig = useMemo(
    () => resolveRichEditorConfig({ preset, features, disabledFeatures, toolbar }),
    [disabledFeatures, features, preset, toolbar],
  )
  const enabledFeatures = useMemo(() => new Set(resolvedConfig.features), [resolvedConfig.features])
  const extensions = useMemo(
    () => createRichEditorExtensions({ features: resolvedConfig.features, placeholder }),
    [placeholder, resolvedConfig.features],
  )
  const editorConfigKey = useMemo(
    () => JSON.stringify({ features: resolvedConfig.features, placeholder }),
    [placeholder, resolvedConfig.features],
  )

  const editor = useEditor({
    extensions,
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
  }, [editorConfigKey])

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
        {resolvedConfig.toolbar.map((group, groupIndex) => {
          const visibleItems = group
            .map((item) => richEditorToolbarItems[item])
            .filter((item) => enabledFeatures.has(item.feature))

          if (visibleItems.length === 0) return null

          return (
            <div key={groupIndex} className="flex items-center gap-2">
              {groupIndex > 0 && (
                <div className="w-[2px] h-6 bg-border mx-1 self-center" />
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon

                return (
                  <MenuButton
                    key={item.title}
                    onClick={() => item.run(editor)}
                    isActive={item.isActive?.(editor) ?? false}
                    title={item.title}
                  >
                    <Icon className="h-4 w-4" />
                  </MenuButton>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* 富文本编辑区 */}
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
