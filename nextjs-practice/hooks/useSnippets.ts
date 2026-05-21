import useSWR from 'swr'
import { fetchSnippets, API_BASE } from '@/lib/api'

export const SNIPPETS_KEY = `${API_BASE}/snippets/`

export function useSnippets() {
  const { data, error, isLoading } = useSWR(SNIPPETS_KEY, fetchSnippets)

  return {
    snippets: data?.results ?? [],
    isLoading,
    error,
  }
}
