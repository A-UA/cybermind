import type {
  RichEditorFeature,
  RichEditorPreset,
  RichEditorResolvedConfig,
  RichEditorToolbarGroup,
} from './types'

const basicFeatures: RichEditorFeature[] = [
  'history',
  'bold',
  'italic',
  'strike',
  'heading',
  'bulletList',
  'orderedList',
  'blockquote',
  'clearFormat',
]

const articleFeatures: RichEditorFeature[] = [
  ...basicFeatures,
  'underline',
  'link',
  'image',
  'horizontalRule',
  'code',
  'codeBlock',
]

export const richEditorPresets: Record<RichEditorPreset, RichEditorResolvedConfig> = {
  basic: {
    features: basicFeatures,
    toolbar: [
      ['undo', 'redo'],
      ['heading1', 'heading2'],
      ['bold', 'italic', 'strike'],
      ['bulletList', 'orderedList', 'blockquote'],
      ['clearFormat'],
    ],
  },
  article: {
    features: articleFeatures,
    toolbar: [
      ['undo', 'redo'],
      ['heading1', 'heading2'],
      ['bold', 'italic', 'strike', 'underline', 'code'],
      ['link', 'image', 'horizontalRule'],
      ['bulletList', 'orderedList', 'blockquote', 'codeBlock'],
      ['clearFormat'],
    ],
  },
  full: {
    features: articleFeatures,
    toolbar: [
      ['undo', 'redo'],
      ['heading1', 'heading2'],
      ['bold', 'italic', 'strike', 'underline', 'code'],
      ['link', 'image', 'horizontalRule'],
      ['bulletList', 'orderedList', 'blockquote', 'codeBlock'],
      ['clearFormat'],
    ],
  },
}

export function resolveRichEditorConfig({
  preset = 'basic',
  features,
  toolbar,
  disabledFeatures = [],
}: {
  preset?: RichEditorPreset
  features?: RichEditorFeature[]
  toolbar?: RichEditorToolbarGroup[]
  disabledFeatures?: RichEditorFeature[]
}): RichEditorResolvedConfig {
  const base = richEditorPresets[preset]
  const disabledSet = new Set(disabledFeatures)
  const resolvedFeatures = (features ?? base.features).filter((feature) => !disabledSet.has(feature))

  return {
    features: Array.from(new Set(resolvedFeatures)),
    toolbar: toolbar ?? base.toolbar,
  }
}
