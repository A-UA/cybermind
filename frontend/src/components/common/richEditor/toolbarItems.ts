import {
  Bold,
  Code,
  Code2,
  Eraser,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react'

import type { RichEditorToolbarItem, RichEditorToolbarItemConfig } from './types'

export const richEditorToolbarItems: Record<RichEditorToolbarItem, RichEditorToolbarItemConfig> = {
  undo: {
    feature: 'history',
    icon: Undo,
    title: '撤销',
    run: (editor) => editor.chain().focus().undo().run(),
  },
  redo: {
    feature: 'history',
    icon: Redo,
    title: '重做',
    run: (editor) => editor.chain().focus().redo().run(),
  },
  bold: {
    feature: 'bold',
    icon: Bold,
    title: '加粗',
    isActive: (editor) => editor.isActive('bold'),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  italic: {
    feature: 'italic',
    icon: Italic,
    title: '斜体',
    isActive: (editor) => editor.isActive('italic'),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  strike: {
    feature: 'strike',
    icon: Strikethrough,
    title: '删除线',
    isActive: (editor) => editor.isActive('strike'),
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  underline: {
    feature: 'underline',
    icon: Underline,
    title: '下划线',
    isActive: (editor) => editor.isActive('underline'),
    run: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  heading1: {
    feature: 'heading',
    icon: Heading1,
    title: '一级标题',
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  heading2: {
    feature: 'heading',
    icon: Heading2,
    title: '二级标题',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  bulletList: {
    feature: 'bulletList',
    icon: List,
    title: '无序列表',
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  orderedList: {
    feature: 'orderedList',
    icon: ListOrdered,
    title: '有序列表',
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  blockquote: {
    feature: 'blockquote',
    icon: Quote,
    title: '引用区块',
    isActive: (editor) => editor.isActive('blockquote'),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  link: {
    feature: 'link',
    icon: Link,
    title: '链接',
    isActive: (editor) => editor.isActive('link'),
    run: (editor) => {
      const currentHref = editor.getAttributes('link').href
      const href = window.prompt('请输入链接地址', typeof currentHref === 'string' ? currentHref : '')

      if (href === null) return
      if (!href.trim()) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
    },
  },
  image: {
    feature: 'image',
    icon: ImageIcon,
    title: '图片',
    run: (editor, context) => {
      if (context.selectImageFile) {
        context.selectImageFile()
        return
      }

      const src = window.prompt('请输入图片地址')

      if (!src?.trim()) return
      editor.chain().focus().setImage({ src: src.trim() }).run()
    },
  },
  horizontalRule: {
    feature: 'horizontalRule',
    icon: Minus,
    title: '分割线',
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  code: {
    feature: 'code',
    icon: Code,
    title: '行内代码',
    isActive: (editor) => editor.isActive('code'),
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
  codeBlock: {
    feature: 'codeBlock',
    icon: Code2,
    title: '代码块',
    isActive: (editor) => editor.isActive('codeBlock'),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  clearFormat: {
    feature: 'clearFormat',
    icon: Eraser,
    title: '清除格式',
    run: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
  },
}
