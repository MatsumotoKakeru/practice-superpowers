import useSWR from 'swr'
import { fetchSnippet, API_BASE } from '@/lib/api'

export function snippetKey(id: number) {
  return `${API_BASE}/snippets/${id}/`
}

export function useSnippet(id: number) {
  const { data, error, isLoading } = useSWR(snippetKey(id), () => fetchSnippet(id))

  return {
    snippet: data,
    isLoading,
    error,
  }
}
