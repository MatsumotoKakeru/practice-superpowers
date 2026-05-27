import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SnippetDetailPage from '@/app/snippets/[id]/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useSnippet', () => ({ useSnippet: vi.fn() }))
vi.mock('@/hooks/useDeleteSnippet', () => ({ useDeleteSnippet: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { useSnippet } from '@/hooks/useSnippet'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

const mockUseSnippet = vi.mocked(useSnippet)
const mockUseDeleteSnippet = vi.mocked(useDeleteSnippet)
const mockRemove = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockRemove.mockReset()
  mockUseDeleteSnippet.mockReturnValue({ remove: mockRemove, loading: false, error: null })
})

const mockSnippet = {
  id: 1, title: 'My Snippet', code: 'print(1)', language: 'python',
  style: 'friendly', linenos: false, highlighted: '<pre>print(1)</pre>',
}

describe('SnippetDetailPage', () => {
  it('ローディング中は「読み込み中...」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: true, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  it('Not found エラー時は「スニペットが見つかりません」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: false, error: new Error('Not found') })
    render(<SnippetDetailPage />)
    expect(screen.getByText('スニペットが見つかりません')).toBeDefined()
  })

  it('タイトル・言語・スタイルを表示する', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByText('My Snippet')).toBeDefined()
    expect(screen.getByText(/python/)).toBeDefined()
    expect(screen.getByText(/friendly/)).toBeDefined()
  })

  it('highlighted HTML をレンダリングする', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    const { container } = render(<SnippetDetailPage />)
    expect(container.querySelector('pre')).not.toBeNull()
  })

  it('編集ボタンが /snippets/1/edit にリンクしている', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByRole('link', { name: '編集' }).getAttribute('href')).toBe('/snippets/1/edit')
  })

  it('一覧に戻るリンクが /snippets にリンクしている', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    expect(screen.getByRole('link', { name: '一覧に戻る' }).getAttribute('href')).toBe('/snippets')
  })

  it('削除ボタンを押して確認後、/snippets に遷移する', async () => {
    const user = userEvent.setup()
    mockRemove.mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/snippets'))
  })

  it('削除確認をキャンセルした場合は /snippets に遷移しない', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<SnippetDetailPage />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
