'use client'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSnippets } from '@/hooks/useSnippets'
import { SnippetCard } from '@/components/snippets/SnippetCard'

export default function SnippetsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Number(searchParams.get('page') ?? '1')
  const { data, loading, error } = useSnippets(page)

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">読み込み中...</p>
    </div>
  )
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error.message}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">スニペット一覧</h1>
        <Link
          href="/snippets/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      {data?.results.length === 0 && (
        <p className="text-gray-500 text-center py-12">スニペットがありません</p>
      )}
      <div className="space-y-2">
        {data?.results.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div>
          {data?.previous && (
            <button
              onClick={() => router.push(`/snippets?page=${new URL(data.previous!).searchParams.get('page') ?? '1'}`)}
              className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              前へ
            </button>
          )}
        </div>
        {data && <span className="text-sm text-gray-500">ページ {page}</span>}
        <div>
          {data?.next && (
            <button
              onClick={() => router.push(`/snippets?page=${new URL(data.next!).searchParams.get('page')}`)}
              className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
