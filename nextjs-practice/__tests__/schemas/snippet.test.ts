import { snippetSchema } from '@/schemas/snippet'

describe('snippetSchema', () => {
  it('有効なデータはバリデーションを通過する', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello World',
      code: 'console.log("hello")',
      language: 'javascript',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(true)
  })

  it('titleが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: '',
      code: 'console.log("hello")',
      language: 'javascript',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('タイトルを入力してください')
    }
  })

  it('codeが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello',
      code: '',
      language: 'javascript',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('コードを入力してください')
    }
  })

  it('languageが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello',
      code: 'print()',
      language: '',
      style: 'monokai',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('言語を入力してください')
    }
  })

  it('styleが空の場合はバリデーションエラーになる', () => {
    const result = snippetSchema.safeParse({
      title: 'Hello',
      code: 'print()',
      language: 'python',
      style: '',
      linenos: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('スタイルを入力してください')
    }
  })
})
