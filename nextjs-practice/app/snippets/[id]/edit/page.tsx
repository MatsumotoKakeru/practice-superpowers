'use client'
import { useParams, useRouter } from 'next/navigation'
import { useSnippet } from '@/hooks/useSnippet'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'
import { SnippetForm, SnippetFormData } from '@/components/snippets/SnippetForm'

export default function EditSnippetPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data: snippet, loading, error } = useSnippet(id)
  const { update } = useUpdateSnippet()

  if (loading) return <p>読み込み中...</p>
  if (error?.message === 'Not found') return <p>スニペットが見つかりません</p>
  if (error) return <p role="alert">{error.message}</p>
  if (!snippet) return null

  const initialData: SnippetFormData = {
    title: snippet.title,
    code: snippet.code,
    language: snippet.language,
    style: snippet.style,
    linenos: snippet.linenos,
  }

  const handleSubmit = async (data: SnippetFormData) => {
    await update(id, data)
    router.push(`/snippets/${id}`)
  }

  const handleCancel = () => {
    router.push(`/snippets/${id}`)
  }

  return (
    <div>
      <h1>編集</h1>
      <SnippetForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="更新"
      />
    </div>
  )
}
