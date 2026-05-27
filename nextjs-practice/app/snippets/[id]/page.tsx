'use client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSnippet } from '@/hooks/useSnippet'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

export default function SnippetDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data: snippet, loading, error } = useSnippet(id)
  const { remove, error: deleteError } = useDeleteSnippet()

  if (loading) return <p>読み込み中...</p>
  if (error?.message === 'Not found') return <p>スニペットが見つかりません</p>
  if (error) return <p role="alert">{error.message}</p>
  if (!snippet) return null

  const handleDelete = async () => {
    if (!window.confirm(`「${snippet.title || 'このスニペット'}」を削除しますか？`)) return
    try {
      await remove(id)
      router.push('/snippets')
    } catch {
      // deleteError に反映済み
    }
  }

  return (
    <div>
      <Link href="/snippets">一覧に戻る</Link>
      {deleteError && <p role="alert">{deleteError.message}</p>}
      <h1>{snippet.title || '(タイトルなし)'}</h1>
      <p>言語: {snippet.language}</p>
      <p>スタイル: {snippet.style}</p>
      <p>行番号: {snippet.linenos ? '有効' : '無効'}</p>
      <div dangerouslySetInnerHTML={{ __html: snippet.highlighted }} />
      <Link href={`/snippets/${id}/edit`}>編集</Link>
      <button onClick={handleDelete}>削除</button>
    </div>
  )
}
