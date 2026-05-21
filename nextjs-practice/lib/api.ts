import type { PaginatedResponse, Snippet } from '@/types'
import type { SnippetFormInput } from '@/schemas/snippet'

export const API_BASE = 'http://localhost:8000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || 'APIエラーが発生しました')
  }
  return res.json() as Promise<T>
}

export async function fetchSnippets(): Promise<PaginatedResponse<Snippet>> {
  const res = await fetch(`${API_BASE}/snippets/`)
  return handleResponse(res)
}

export async function fetchSnippet(id: number): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}/`)
  return handleResponse(res)
}

export async function createSnippet(data: SnippetFormInput): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateSnippet(id: number, data: SnippetFormInput): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteSnippet(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/snippets/${id}/`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || '削除に失敗しました')
  }
}
