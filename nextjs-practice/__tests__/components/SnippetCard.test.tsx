import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SnippetCard } from '@/components/snippets/SnippetCard'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

afterEach(cleanup)

const snippet = { id: 1, title: 'My Snippet', language: 'python', code: 'print("hello")\nprint("world")\nprint("foo")' }

describe('SnippetCard', () => {
  it('タイトルを表示する', () => {
    render(<SnippetCard snippet={snippet} />)
    expect(screen.getByText('My Snippet')).toBeDefined()
  })

  it('言語を表示する', () => {
    render(<SnippetCard snippet={snippet} />)
    expect(screen.getByText('python')).toBeDefined()
  })

  it('編集ページへのリンクを持つ', () => {
    render(<SnippetCard snippet={snippet} />)
    expect(screen.getByRole('link', { name: 'My Snippet' }).getAttribute('href')).toBe('/snippets/1/edit')
  })

  it('タイトルが空の場合は "(タイトルなし)" を表示する', () => {
    render(<SnippetCard snippet={{ id: 2, title: '', language: 'go', code: 'package main' }} />)
    expect(screen.getByText('(タイトルなし)')).toBeDefined()
  })

  it('コードの先頭3行をプレビュー表示する', () => {
    render(<SnippetCard snippet={snippet} />)
    expect(document.querySelector('pre')?.textContent?.trim()).toBe('print("hello")\nprint("world")\nprint("foo")')
  })

  it('コードが4行以上ある場合は先頭3行のみ表示する', () => {
    const longCode = 'line1\nline2\nline3\nline4\nline5'
    render(<SnippetCard snippet={{ ...snippet, code: longCode }} />)
    expect(document.querySelector('pre')?.textContent).toBe('line1\nline2\nline3')
  })
})
