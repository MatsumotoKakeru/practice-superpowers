import { useState } from 'react'
import { mutate } from 'swr'
import { updateSnippet } from '@/lib/api'
import { SNIPPETS_KEY } from '@/hooks/useSnippets'
import { snippetKey } from '@/hooks/useSnippet'
import type { SnippetFormInput } from '@/schemas/snippet'

export function useUpdateSnippet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function update(id: number, data: SnippetFormInput): Promise<boolean> {
    setIsLoading(true)
    setError(null)
    try {
      await updateSnippet(id, data)
      await mutate(SNIPPETS_KEY)
      await mutate(snippetKey(id))
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { update, isLoading, error }
}
