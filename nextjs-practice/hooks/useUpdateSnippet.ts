import { useState } from 'react'
import { updateSnippet, SnippetInput, Snippet } from '@/lib/api'

export function useUpdateSnippet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function update(id: number, input: SnippetInput): Promise<Snippet> {
    setLoading(true)
    setError(null)
    try {
      return await updateSnippet(id, input)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}
