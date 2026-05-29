'use client'
import { memo } from 'react'
import Link from 'next/link'

interface SnippetCardProps {
  snippet: {
    id: number
    title: string
    language: string
    code: string
  }
}

export const SnippetCard = memo(function SnippetCard({ snippet }: SnippetCardProps) {
  const codePreview = snippet.code.split('\n').slice(0, 3).join('\n')

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 mb-2">
        <Link
          href={`/snippets/${snippet.id}/edit`}
          className="text-indigo-600 hover:underline font-medium truncate"
        >
          {snippet.title || '(タイトルなし)'}
        </Link>
        <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
          {snippet.language}
        </span>
      </div>
      <pre className="text-xs font-mono text-gray-500 bg-gray-50 rounded p-2 overflow-hidden">
        {codePreview}
      </pre>
    </div>
  )
})
