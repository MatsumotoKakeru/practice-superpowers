'use client'
import { memo } from 'react'
import Link from 'next/link'

interface SnippetCardProps {
  snippet: {
    id: number
    title: string
    language: string
  }
  onDelete: (id: number) => void
}

export const SnippetCard = memo(function SnippetCard({ snippet, onDelete }: SnippetCardProps) {
  const handleDelete = () => {
    const displayName = snippet.title || 'このスニペット'
    if (window.confirm(`「${displayName}」を削除しますか？`)) {
      onDelete(snippet.id)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/snippets/${snippet.id}`}
          className="text-indigo-600 hover:underline font-medium truncate"
        >
          {snippet.title || '(タイトルなし)'}
        </Link>
        <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
          {snippet.language}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="shrink-0 ml-4 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
      >
        削除
      </button>
    </div>
  )
})
