'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSnippets } from '@/hooks/useSnippets'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

const PAGE_SIZE = 10

export default function HomePage() {
  const [page, setPage] = useState(1)
  const { snippets, count, isLoading, error } = useSnippets(page)
  const { remove, isLoading: isDeleting } = useDeleteSnippet()

  const totalPages = useMemo(() => Math.ceil(count / PAGE_SIZE), [count])

  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm('このスニペットを削除しますか？')) {
        remove(id)
      }
    },
    [remove],
  )

  if (isLoading) return <p className="p-8 text-gray-500">読み込み中...</p>
  if (error) return <p className="p-8 text-red-500">データの取得に失敗しました</p>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">スニペット一覧</h1>
        <Link
          href="/snippets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      {snippets.length === 0 ? (
        <p className="text-gray-500">スニペットがありません</p>
      ) : (
        <>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200">タイトル</th>
                <th className="text-left p-3 border border-gray-200">言語</th>
                <th className="p-3 border border-gray-200">編集</th>
                <th className="p-3 border border-gray-200">削除</th>
              </tr>
            </thead>
            <tbody>
              {snippets.map((snippet) => (
                <tr key={snippet.id} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-200">{snippet.title}</td>
                  <td className="p-3 border border-gray-200">
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded-full">
                      {snippet.language}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200 text-center">
                    <Link
                      href={`/snippets/${snippet.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      編集
                    </Link>
                  </td>
                  <td className="p-3 border border-gray-200 text-center">
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border ${
                    p === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
