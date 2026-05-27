import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewSnippetPage from '@/app/snippets/new/page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/useCreateSnippet', () => ({ useCreateSnippet: vi.fn() }))

import { useCreateSnippet } from '@/hooks/useCreateSnippet'

const mockUseCreateSnippet = vi.mocked(useCreateSnippet)
const mockCreate = vi.fn()

beforeEach(() => {
  mockPush.mockReset()
  mockCreate.mockReset()
  mockUseCreateSnippet.mockReturnValue({ create: mockCreate, loading: false, error: null })
})

describe('NewSnippetPage', () => {
  it('フォームを表示する', () => {
    render(<NewSnippetPage />)
    expect(screen.getByLabelText('コード')).toBeDefined()
    expect(screen.getByRole('button', { name: '保存' })).toBeDefined()
  })

  it('保存成功後に /snippets に遷移する', async () => {
    const user = userEvent.setup()
    const created = { id: 1, title: '', code: 'x=1', language: 'python', style: 'friendly', linenos: false, highlighted: '' }
    mockCreate.mockResolvedValue(created)
    render(<NewSnippetPage />)
    await user.type(screen.getByLabelText('コード'), 'x=1')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/snippets'))
  })

  it('キャンセルすると /snippets に遷移する', async () => {
    const user = userEvent.setup()
    render(<NewSnippetPage />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockPush).toHaveBeenCalledWith('/snippets')
  })
})
