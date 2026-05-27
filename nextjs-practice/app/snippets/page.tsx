'use client'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSnippets } from '@/hooks/useSnippets'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'
import { SnippetCard } from '@/components/snippets/SnippetCard'

export default function SnippetsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Number(searchParams.get('page') ?? '1')
  const { data, loading, error, refetch } = useSnippets(page)
  const { remove, error: deleteError } = useDeleteSnippet()

  const handleDelete = async (id: number) => {
    try {
      await remove(id)
      refetch()
    } catch {
      // error は deleteError に反映済み
    }
  }

  if (loading) return <p>読み込み中...</p>
  if (error) return <p role="alert">{error.message}</p>

  return (
    <div>
      <div>
        <h1>スニペット一覧</h1>
        <Link href="/snippets/new">新規作成</Link>
      </div>
      {deleteError && <p role="alert">{deleteError.message}</p>}
      {data?.results.length === 0 && <p>スニペットがありません</p>}
      {data?.results.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} onDelete={handleDelete} />
      ))}
      <div>
        {data?.previous && (
          <button onClick={() => router.push(`/snippets?page=${page - 1}`)}>前へ</button>
        )}
        {data && <span>ページ {page}</span>}
        {data?.next && (
          <button onClick={() => router.push(`/snippets?page=${page + 1}`)}>次へ</button>
        )}
      </div>
    </div>
  )
}
