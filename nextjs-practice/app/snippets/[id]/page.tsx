'use client'
import DOMPurify from 'dompurify'
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

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">読み込み中...</p>
    </div>
  )
  if (error?.message === 'Not found') return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-gray-500 text-center py-12">スニペットが見つかりません</p>
    </div>
  )
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error.message}</p>
    </div>
  )
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/snippets" className="text-indigo-600 hover:underline text-sm inline-block mb-6">
        一覧に戻る
      </Link>
      {deleteError && (
        <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {deleteError.message}
        </p>
      )}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {snippet.title || '(タイトルなし)'}
        </h1>
        <dl className="grid grid-cols-3 gap-3 mb-6 text-sm">
          <div>
            <dt className="text-gray-500 mb-0.5">言語</dt>
            <dd className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded inline-block">{snippet.language}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">スタイル</dt>
            <dd className="text-gray-800">{snippet.style}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">行番号</dt>
            <dd className="text-gray-800">{snippet.linenos ? '有効' : '無効'}</dd>
          </div>
        </dl>
        <div
          className="overflow-auto rounded-lg border border-gray-200 text-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(snippet.highlighted) }}
        />
      </div>
      <div className="flex gap-3 mt-6">
        <Link
          href={`/snippets/${id}/edit`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          編集
        </Link>
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
