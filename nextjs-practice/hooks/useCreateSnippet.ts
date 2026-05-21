import { useState } from 'react'
import { mutate } from 'swr'
import { createSnippet } from '@/lib/api'
import { SNIPPETS_KEY } from '@/hooks/useSnippets'
import type { SnippetFormInput } from '@/schemas/snippet'

export function useCreateSnippet() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create(data: SnippetFormInput): Promise<boolean> {
    setIsLoading(true)
    setError(null)
    try {
      await createSnippet(data)
      await mutate(SNIPPETS_KEY)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}
