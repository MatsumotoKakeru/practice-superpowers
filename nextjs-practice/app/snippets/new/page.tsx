'use client'
import { useRouter } from 'next/navigation'
import { useCreateSnippet } from '@/hooks/useCreateSnippet'
import { SnippetForm, SnippetFormData } from '@/components/snippets/SnippetForm'

export default function NewSnippetPage() {
  const router = useRouter()
  const { create } = useCreateSnippet()

  const handleSubmit = async (data: SnippetFormData) => {
    await create(data)
    router.push('/snippets')
  }

  const handleCancel = () => {
    router.push('/snippets')
  }

  return (
    <div>
      <h1>新規作成</h1>
      <SnippetForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
