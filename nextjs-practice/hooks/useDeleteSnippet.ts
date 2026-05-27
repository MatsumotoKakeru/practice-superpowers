import { useState } from 'react'
import { deleteSnippet } from '@/lib/api'

export function useDeleteSnippet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function remove(id: number): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      await deleteSnippet(id)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { remove, loading, error }
}
