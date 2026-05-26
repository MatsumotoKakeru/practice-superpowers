import { useMemo } from 'react'
import useSWR from 'swr'
import { fetchSnippets, API_BASE } from '@/lib/api'

export const SNIPPETS_KEY = `${API_BASE}/snippets/`

export function snippetsPageKey(page: number) {
  return `${SNIPPETS_KEY}?page=${page}`
}

export function useSnippets(page: number = 1) {
  const key = snippetsPageKey(page)
  const { data, error, isLoading } = useSWR(key, () => fetchSnippets(page))
  const snippets = useMemo(() => data?.results ?? [], [data])

  return {
    snippets,
    count: data?.count ?? 0,
    isLoading,
    error,
  }
}
