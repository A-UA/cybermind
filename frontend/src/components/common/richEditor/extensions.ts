import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import type { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import type { RichEditorFeature } from './types'

type UseEditorOptions = NonNullable<Parameters<typeof useEditor>[0]>
type RichEditorExtensions = NonNullable<UseEditorOptions['extensions']>

export function createRichEditorExtensions({
  features,
  placeholder,
}: {
  features: RichEditorFeature[]
  placeholder: string
}) {
  const featureSet = new Set(features)
  const hasList = featureSet.has('bulletList') || featureSet.has('orderedList')

  const extensions: RichEditorExtensions = [
    StarterKit.configure({
      blockquote: featureSet.has('blockquote') ? {} : false,
      bold: featureSet.has('bold') ? {} : false,
      bulletList: featureSet.has('bulletList') ? {} : false,
      code: featureSet.has('code') ? {} : false,
      codeBlock: featureSet.has('codeBlock') ? {} : false,
      heading: featureSet.has('heading') ? { levels: [1, 2] } : false,
      horizontalRule: featureSet.has('horizontalRule') ? {} : false,
      italic: featureSet.has('italic') ? {} : false,
      link: featureSet.has('link')
        ? {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
          }
        : false,
      listItem: hasList ? {} : false,
      listKeymap: hasList ? {} : false,
      orderedList: featureSet.has('orderedList') ? {} : false,
      strike: featureSet.has('strike') ? {} : false,
      underline: featureSet.has('underline') ? {} : false,
      undoRedo: featureSet.has('history') ? {} : false,
    }),
    Placeholder.configure({
      placeholder,
      emptyNodeClass:
        'is-editor-empty before:content-[attr(data-placeholder)] before:float-left before:h-0 before:text-muted-foreground before:pointer-events-none',
    }),
  ]

  if (featureSet.has('image')) {
    extensions.push(
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    )
  }

  return extensions
}
