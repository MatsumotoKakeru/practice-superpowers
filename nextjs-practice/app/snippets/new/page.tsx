'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateSnippet } from '@/hooks/useCreateSnippet'
import { SnippetForm, SnippetFormData } from '@/components/snippets/SnippetForm'

export default function NewSnippetPage() {
  const router = useRouter()
  const { create } = useCreateSnippet()

  const handleSubmit = useCallback(async (data: SnippetFormData) => {
    await create(data)
    router.push('/snippets')
  }, [create, router])

  const handleCancel = useCallback(() => {
    router.push('/snippets')
  }, [router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規作成</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SnippetForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  )
}
