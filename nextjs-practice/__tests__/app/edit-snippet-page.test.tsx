import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditSnippetPage from '@/app/snippets/[id]/edit/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useSnippet', () => ({ useSnippet: vi.fn() }))
vi.mock('@/hooks/useUpdateSnippet', () => ({ useUpdateSnippet: vi.fn() }))

import { useSnippet } from '@/hooks/useSnippet'
import { useUpdateSnippet } from '@/hooks/useUpdateSnippet'

const mockUseSnippet = vi.mocked(useSnippet)
const mockUseUpdateSnippet = vi.mocked(useUpdateSnippet)
const mockUpdate = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockUpdate.mockReset()
  mockUseUpdateSnippet.mockReturnValue({ update: mockUpdate, loading: false, error: null })
})

const mockSnippet = {
  id: 1, title: 'Original', code: 'x=0', language: 'python',
  style: 'friendly', linenos: false, highlighted: '',
}

describe('EditSnippetPage', () => {
  it('ローディング中は「読み込み中...」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: true, error: null })
    render(<EditSnippetPage />)
    expect(screen.getByText('読み込み中...')).toBeDefined()
  })

  it('Not found エラー時は「スニペットが見つかりません」を表示する', () => {
    mockUseSnippet.mockReturnValue({ data: null, loading: false, error: new Error('Not found') })
    render(<EditSnippetPage />)
    expect(screen.getByText('スニペットが見つかりません')).toBeDefined()
  })

  it('既存データをフォームの初期値としてセットする', () => {
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<EditSnippetPage />)
    expect((screen.getByLabelText('コード') as HTMLTextAreaElement).value).toBe('x=0')
  })

  it('保存成功後に /snippets/1 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    mockUpdate.mockResolvedValue({ ...mockSnippet, code: 'x=1', highlighted: '' })
    render(<EditSnippetPage />)
    await user.click(screen.getByRole('button', { name: '更新' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/snippets/1'))
  })

  it('キャンセルすると /snippets/1 に遷移する', async () => {
    const user = userEvent.setup()
    mockUseSnippet.mockReturnValue({ data: mockSnippet, loading: false, error: null })
    render(<EditSnippetPage />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets/1')
  })
})
