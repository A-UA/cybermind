export function isRichTextEmpty(html: string) {
  const text = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\u00a0/g, ' ')
    .trim()

  return text.length === 0
}
