import type { useEditor } from '@tiptap/react'
import type { ComponentType } from 'react'

type RichEditorInstance = NonNullable<ReturnType<typeof useEditor>>

export type RichEditorFeature =
  | 'history'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'underline'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'image'
  | 'horizontalRule'
  | 'code'
  | 'codeBlock'
  | 'clearFormat'

export type RichEditorToolbarItem =
  | 'undo'
  | 'redo'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'underline'
  | 'heading1'
  | 'heading2'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'image'
  | 'horizontalRule'
  | 'code'
  | 'codeBlock'
  | 'clearFormat'

export type RichEditorToolbarGroup = RichEditorToolbarItem[]

export type RichEditorPreset = 'basic' | 'article' | 'full'

export interface RichEditorToolbarItemConfig {
  feature: RichEditorFeature
  icon: ComponentType<{ className?: string }>
  title: string
  isActive?: (editor: RichEditorInstance) => boolean
  run: (editor: RichEditorInstance) => void
}

export interface RichEditorResolvedConfig {
  features: RichEditorFeature[]
  toolbar: RichEditorToolbarGroup[]
}
