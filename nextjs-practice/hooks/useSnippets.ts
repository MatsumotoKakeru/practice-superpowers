import { useState, useEffect, useCallback } from 'react'
import { getSnippets, SnippetListResponse } from '@/lib/api'

export function useSnippets(page = 1) {
  const [data, setData] = useState<SnippetListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSnippets(page)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
