import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SnippetsPage from '@/app/snippets/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useSnippets', () => ({ useSnippets: vi.fn() }))
vi.mock('@/hooks/useDeleteSnippet', () => ({ useDeleteSnippet: vi.fn() }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { useSnippets } from '@/hooks/useSnippets'
import { useDeleteSnippet } from '@/hooks/useDeleteSnippet'

const mockUseSnippets = vi.mocked(useSnippets)
const mockUseDeleteSnippet = vi.mocked(useDeleteSnippet)
const mockRemove = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockRemove.mockReset()
  mockUseDeleteSnippet.mockReturnValue({ remove: mockRemove, loading: false, error: null })
})

describe('SnippetsPage', () => {
  it('ローディング中は「読み込み中...」を表示する', () => {
    mockUseSnippets.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() })
    render(<SnippetsPage />)
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  it('エラー時はエラーメッセージを表示する', () => {
    mockUseSnippets.mockReturnValue({ data: null, loading: false, error: new Error('network error'), refetch: vi.fn() })
    render(<SnippetsPage />)
    expect(screen.getByText('network error')).toBeDefined()
  })

  it('スニペットなし時は「スニペットがありません」を表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByText('スニペットがありません')).toBeDefined()
  })

  it('スニペット一覧を表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: {
        count: 2, next: null, previous: null,
        results: [
          { id: 1, title: 'first', language: 'python', code: '', style: 'friendly', linenos: false, highlighted: '' },
          { id: 2, title: 'second', language: 'javascript', code: '', style: 'monokai', linenos: false, highlighted: '' },
        ],
      },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByText('first')).toBeDefined()
    expect(screen.getByText('second')).toBeDefined()
  })

  it('新規作成リンクを /snippets/new に表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByRole('link', { name: '新規作成' }).getAttribute('href')).toBe('/snippets/new')
  })

  it('next がある場合は「次へ」ボタンを表示し、押すと ?page=2 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippets.mockReturnValue({
      data: { count: 20, next: 'http://localhost:8000/snippets/?page=2', previous: null, results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    await user.click(screen.getByRole('button', { name: '次へ' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets?page=2')
  })

  it('previous がある場合は「前へ」ボタンを表示する', () => {
    mockUseSnippets.mockReturnValue({
      data: { count: 20, next: null, previous: 'http://localhost:8000/snippets/?page=1', results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    expect(screen.getByRole('button', { name: '前へ' })).toBeDefined()
  })

  it('DRFがpageパラメータを省略したprevious URLでも「前へ」ボタンが /snippets?page=1 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippets.mockReturnValue({
      data: { count: 20, next: null, previous: 'http://localhost:8000/snippets/', results: [] },
      loading: false, error: null, refetch: vi.fn(),
    })
    render(<SnippetsPage />)
    await user.click(screen.getByRole('button', { name: '前へ' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets?page=1')
  })

  it('削除成功後に refetch を呼ぶ', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockRemove.mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockUseSnippets.mockReturnValue({
      data: {
        count: 1, next: null, previous: null,
        results: [{ id: 1, title: 'test', language: 'python', code: '', style: 'friendly', linenos: false, highlighted: '' }],
      },
      loading: false, error: null, refetch,
    })
    render(<SnippetsPage />)
    await user.click(screen.getByRole('button', { name: '削除' }))
    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })
})
