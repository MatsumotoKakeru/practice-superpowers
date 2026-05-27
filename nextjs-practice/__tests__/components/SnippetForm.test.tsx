import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnippetForm } from '@/components/snippets/SnippetForm'

describe('SnippetForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    onSubmit.mockReset()
    onCancel.mockReset()
  })

  afterEach(cleanup)

  it('コード・言語・スタイル・行番号表示のフィールドを表示する', () => {
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect(screen.getByLabelText('コード')).toBeDefined()
    expect(screen.getByLabelText('言語')).toBeDefined()
    expect(screen.getByLabelText('スタイル')).toBeDefined()
    expect(screen.getByLabelText('行番号表示')).toBeDefined()
  })

  it('デフォルト言語は python', () => {
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect((screen.getByLabelText('言語') as HTMLSelectElement).value).toBe('python')
  })

  it('デフォルトスタイルは friendly', () => {
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect((screen.getByLabelText('スタイル') as HTMLSelectElement).value).toBe('friendly')
  })

  it('initialData が渡された場合はフィールドに初期値をセットする', () => {
    const initialData = { title: 'my title', code: 'x=1', language: 'javascript', style: 'monokai', linenos: true }
    render(<SnippetForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} />)
    expect((screen.getByLabelText('コード') as HTMLTextAreaElement).value).toBe('x=1')
    expect((screen.getByLabelText('言語') as HTMLSelectElement).value).toBe('javascript')
    expect((screen.getByLabelText('行番号表示') as HTMLInputElement).checked).toBe(true)
  })

  it('コードが空の場合はバリデーションエラーを表示して送信しない', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByText('コードは必須です')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('コードが2001文字の場合はバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    fireEvent.change(screen.getByLabelText('コード'), { target: { value: 'a'.repeat(2001) } })
    await user.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByText('コードは2,000文字以内で入力してください')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('バリデーション通過後に onSubmit をフォームデータで呼ぶ', async () => {
    onSubmit.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'print(1)')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'print(1)', language: 'python' })
    ))
  })

  it('onSubmit がエラーを投げた場合はサーバーエラーを表示する', async () => {
    onSubmit.mockRejectedValue(new Error('server error'))
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'x=1')
    await user.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined())
    expect(screen.getByText('server error')).toBeDefined()
  })

  it('入力なしでキャンセルすると確認なしに onCancel を呼ぶ', async () => {
    const user = userEvent.setup()
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('入力後にキャンセルすると確認ダイアログを表示し、OKで onCancel を呼ぶ', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'x')
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('入力後にキャンセルダイアログをキャンセルすると onCancel を呼ばない', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SnippetForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('コード'), 'x')
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onCancel).not.toHaveBeenCalled()
  })
})
