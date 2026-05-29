const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

export interface Snippet {
  id: number
  title: string
  code: string
  language: string
  style: string
  linenos: boolean
  highlighted: string
}

export interface SnippetListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Snippet[]
}

export type SnippetInput = Omit<Snippet, 'id' | 'highlighted'>

export async function getSnippets(page = 1): Promise<SnippetListResponse> {
  const res = await fetch(`${BASE_URL}/snippets/?page=${page}`)
  if (!res.ok) throw new Error(`Failed to fetch snippets: ${res.status}`)
  return res.json()
}

export async function getSnippet(id: number): Promise<Snippet> {
  const res = await fetch(`${BASE_URL}/snippets/${id}/`)
  if (res.status === 404) throw new Error('Not found')
  if (!res.ok) throw new Error(`Failed to fetch snippet: ${res.status}`)
  return res.json()
}

export async function createSnippet(input: SnippetInput): Promise<Snippet> {
  const res = await fetch(`${BASE_URL}/snippets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to create snippet: ${res.status}`)
  return res.json()
}

export async function updateSnippet(id: number, input: SnippetInput): Promise<Snippet> {
  const res = await fetch(`${BASE_URL}/snippets/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to update snippet: ${res.status}`)
  return res.json()
}

export async function deleteSnippet(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/snippets/${id}/`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete snippet: ${res.status}`)
}
