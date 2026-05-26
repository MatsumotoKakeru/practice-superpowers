import { useMemo } from 'react'
import useSWR from 'swr'
import { fetchChoices, API_BASE } from '@/lib/api'

export const CHOICES_KEY = `${API_BASE}/choices/`

export function useSnippetChoices() {
  const { data, error, isLoading } = useSWR(CHOICES_KEY, fetchChoices)
  const languages = useMemo(() => data?.languages ?? [], [data])
  const styles = useMemo(() => data?.styles ?? [], [data])

  return { languages, styles, isLoading, error }
}
