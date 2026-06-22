import apiClient from './api'

export async function uploadRichTextImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await apiClient.post<{ data: { url: string } }>('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.data.url
}
