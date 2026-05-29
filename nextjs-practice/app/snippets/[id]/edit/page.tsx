'use client'
import { useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSnippet } from '@/hooks/useSnippet'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'
import { SnippetForm, SnippetFormData } from '@/components/snippets/SnippetForm'

export default function EditSnippetPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data: snippet, loading, error } = useSnippet(id)
  const { update } = useUpdateSnippet()
  const { remove, error: deleteError } = useDeleteSnippet()

  const initialData = useMemo<SnippetFormData | undefined>(() => {
    if (!snippet) return undefined
    return {
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      style: snippet.style,
      linenos: snippet.linenos,
    }
  }, [snippet])

  const handleSubmit = useCallback(async (data: SnippetFormData) => {
    await update(id, data)
    router.push('/snippets')
  }, [update, id, router])

  const handleCancel = useCallback(() => {
    router.push('/snippets')
  }, [router])

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`「${snippet?.title || 'このスニペット'}」を削除しますか？`)) return
    try {
      await remove(id)
      router.push('/snippets')
    } catch {
      // deleteError に反映済み
    }
  }, [remove, id, router, snippet?.title])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">読み込み中...</p>
    </div>
  )
  if (error?.message === 'Not found') return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">スニペットが見つかりません</p>
    </div>
  )
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error.message}</p>
    </div>
  )
  if (!snippet) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">編集</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SnippetForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="更新"
        />
      </div>
      {deleteError && (
        <p role="alert" className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {deleteError.message}
        </p>
      )}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleDelete}
          className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 border border-red-200 rounded-lg transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  )
}
