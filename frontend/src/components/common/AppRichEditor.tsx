import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'

import { createRichEditorExtensions } from './richEditor/extensions'
import { resolveRichEditorConfig } from './richEditor/presets'
import { richEditorToolbarItems } from './richEditor/toolbarItems'
import type {
  RichEditorFeature,
  RichEditorPreset,
  RichEditorToolbarGroup,
  RichEditorToolbarItem,
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
  uploadImage?: (file: File) => Promise<string>
  onUploadError?: (error: unknown) => void
}

function MenuButton({ onClick, isActive = false, title, children }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 border border-border rounded-lg transition-all select-none cursor-pointer flex items-center justify-center ${
        isActive
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-card text-foreground hover:bg-accent'
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
  uploadImage,
  onUploadError,
}: AppRichEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingItem, setUploadingItem] = useState<RichEditorToolbarItem | null>(null)
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
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !editor || !uploadImage) return

    try {
      setUploadingItem('image')
      const src = await uploadImage(file)
      editor.chain().focus().setImage({ src }).run()
    } catch (error) {
      onUploadError?.(error)
    } finally {
      setUploadingItem(null)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      {/* 按钮控制条栏 */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/30 border-b border-border">
        {resolvedConfig.toolbar.map((group, groupIndex) => {
          const visibleItems = group
            .map((item) => ({ key: item, config: richEditorToolbarItems[item] }))
            .filter((item) => enabledFeatures.has(item.config.feature))

          if (visibleItems.length === 0) return null

          return (
            <div key={groupIndex} className="flex items-center gap-2">
              {groupIndex > 0 && (
                <div className="w-[1px] h-5 bg-border mx-1 self-center" />
              )}
              {visibleItems.map(({ key, config }) => {
                const Icon = config.icon
                const isUploading = uploadingItem === key

                return (
                  <MenuButton
                    key={config.title}
                    onClick={() =>
                      config.run(editor, {
                        selectImageFile: uploadImage
                          ? () => imageInputRef.current?.click()
                          : undefined,
                      })
                    }
                    isActive={config.isActive?.(editor) ?? false}
                    title={isUploading ? '图片上传中' : config.title}
                  >
                    <Icon className={`h-4 w-4 ${isUploading ? 'animate-spin' : ''}`} />
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
