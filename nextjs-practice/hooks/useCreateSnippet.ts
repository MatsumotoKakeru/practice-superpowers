import { useState } from 'react'
import { createSnippet, SnippetInput, Snippet } from '@/lib/api'

export function useCreateSnippet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function create(input: SnippetInput): Promise<Snippet> {
    setLoading(true)
    setError(null)
    try {
      return await createSnippet(input)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}
