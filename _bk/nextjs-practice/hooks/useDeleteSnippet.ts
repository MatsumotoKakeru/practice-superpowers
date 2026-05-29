import { useState } from 'react'
import { mutate } from 'swr'
import { deleteSnippet } from '@/lib/api'
import { SNIPPETS_KEY } from '@/hooks/useSnippets'

export function useDeleteSnippet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove(id: number): Promise<boolean> {
    setIsLoading(true)
    setError(null)
    try {
      await deleteSnippet(id)
      await mutate(
        (key: unknown) => typeof key === 'string' && key.startsWith(SNIPPETS_KEY),
      )
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { remove, isLoading, error }
}
