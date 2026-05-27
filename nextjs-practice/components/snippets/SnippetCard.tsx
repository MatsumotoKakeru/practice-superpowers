'use client'
import Link from 'next/link'

interface SnippetCardProps {
  snippet: {
    id: number
    title: string
    language: string
  }
  onDelete: (id: number) => void
}

export function SnippetCard({ snippet, onDelete }: SnippetCardProps) {
  const handleDelete = () => {
    const displayName = snippet.title || 'このスニペット'
    if (window.confirm(`「${displayName}」を削除しますか？`)) {
      onDelete(snippet.id)
    }
  }

  return (
    <div>
      <Link href={`/snippets/${snippet.id}`}>
        {snippet.title || '(タイトルなし)'}
      </Link>
      <span>{snippet.language}</span>
      <button onClick={handleDelete}>削除</button>
    </div>
  )
}
