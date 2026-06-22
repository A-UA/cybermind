// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import AppRichEditor from './AppRichEditor'
import { isRichTextEmpty } from '@/lib/richText'

beforeAll(() => {
  document.elementFromPoint = () => document.body
  HTMLElement.prototype.getClientRects = () => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  } as DOMRectList)
})

describe('AppRichEditor', () => {
  it('syncs external value changes while focused', async () => {
    const { container, rerender } = render(
      <AppRichEditor value="<p>旧内容</p>" onChange={() => undefined} />,
    )

    const editor = await waitFor(() => {
      const element = container.querySelector('[contenteditable="true"]')

      expect(element).toBeTruthy()
      return element as HTMLElement
    })

    editor.focus()
    rerender(<AppRichEditor value="<p>新内容</p>" onChange={() => undefined} />)

    expect(await screen.findByText('新内容')).toBeTruthy()
    expect(screen.queryByText('旧内容')).toBeNull()
  })

  it('renders toolbar from explicit groups', async () => {
    const { container } = render(
      <AppRichEditor
        value="<p>内容</p>"
        onChange={() => undefined}
        features={['bold', 'blockquote']}
        toolbar={[['bold'], ['blockquote']]}
      />,
    )

    await waitFor(() => {
      expect(container.querySelector('[contenteditable="true"]')).toBeTruthy()
    })

    expect(container.querySelector('[title="加粗"]')).toBeTruthy()
    expect(container.querySelector('[title="引用区块"]')).toBeTruthy()
    expect(container.querySelector('[title="斜体"]')).toBeNull()
  })

  it('hides toolbar items whose feature is disabled', async () => {
    const { container } = render(
      <AppRichEditor
        value="<p>内容</p>"
        onChange={() => undefined}
        features={['bold']}
        toolbar={[['bold', 'link']]}
      />,
    )

    await waitFor(() => {
      expect(container.querySelector('[contenteditable="true"]')).toBeTruthy()
    })

    expect(container.querySelector('[title="加粗"]')).toBeTruthy()
    expect(container.querySelector('[title="链接"]')).toBeNull()
  })
})

describe('isRichTextEmpty', () => {
  it.each(['', '<p></p>', '<p><br></p>', '<p>   </p>', '<p>&nbsp;</p>'])(
    'treats %s as empty rich text',
    (html) => {
      expect(isRichTextEmpty(html)).toBe(true)
    },
  )

  it('treats real text as non-empty rich text', () => {
    expect(isRichTextEmpty('<p>正文</p>')).toBe(false)
  })
})
