import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnippetCard } from '@/components/snippets/SnippetCard'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

afterEach(cleanup)

const snippet = { id: 1, title: 'My Snippet', language: 'python' }

describe('SnippetCard', () => {
  it('タイトルを表示する', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByText('My Snippet')).toBeDefined()
  })

  it('言語を表示する', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByText('python')).toBeDefined()
  })

  it('詳細ページへのリンクを持つ', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'My Snippet' }).getAttribute('href')).toBe('/snippets/1')
  })

  it('タイトルが空の場合は "(タイトルなし)" を表示する', () => {
    render(<SnippetCard snippet={{ id: 2, title: '', language: 'go' }} onDelete={vi.fn()} />)
    expect(screen.getByText('(タイトルなし)')).toBeDefined()
  })

  it('削除ボタンを表示する', () => {
    render(<SnippetCard snippet={snippet} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: '削除' })).toBeDefined()
  })

  it('削除ボタンを押すと確認ダイアログが出て、確認後に onDelete を呼ぶ', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SnippetCard snippet={snippet} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('削除ダイアログをキャンセルすると onDelete を呼ばない', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SnippetCard snippet={snippet} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(onDelete).not.toHaveBeenCalled()
  })
})
