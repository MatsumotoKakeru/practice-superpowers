'use client'
import { useState } from 'react'
import { LANGUAGE_CHOICES, STYLE_CHOICES } from '@/lib/constants'

export interface SnippetFormData {
  title: string
  code: string
  language: string
  style: string
  linenos: boolean
}

interface SnippetFormProps {
  initialData?: SnippetFormData
  onSubmit: (data: SnippetFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const DEFAULT_DATA: SnippetFormData = {
  title: '',
  code: '',
  language: 'python',
  style: 'friendly',
  linenos: false,
}

export function SnippetForm({ initialData, onSubmit, onCancel, submitLabel = '保存' }: SnippetFormProps) {
  const [formData, setFormData] = useState<SnippetFormData>(initialData ?? DEFAULT_DATA)
  const [errors, setErrors] = useState<{ code?: string; title?: string }>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const base = initialData ?? DEFAULT_DATA
  const isDirty = JSON.stringify(formData) !== JSON.stringify(base)

  const validate = (): boolean => {
    const newErrors: { code?: string; title?: string } = {}
    if (!formData.code.trim()) {
      newErrors.code = 'コードは必須です'
    } else if (formData.code.length > 2000) {
      newErrors.code = 'コードは2,000文字以内で入力してください'
    }
    if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError(null)
    try {
      await onSubmit(formData)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('保存していません。戻りますか？')) return
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <p role="alert">{serverError}</p>}
      <div>
        <label htmlFor="title">タイトル</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        {errors.title && <p>{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="code">コード</label>
        <textarea
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        />
        {errors.code && <p>{errors.code}</p>}
      </div>
      <div>
        <label htmlFor="language">言語</label>
        <select
          id="language"
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
        >
          {LANGUAGE_CHOICES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="style">スタイル</label>
        <select
          id="style"
          value={formData.style}
          onChange={(e) => setFormData({ ...formData, style: e.target.value })}
        >
          {STYLE_CHOICES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            aria-label="行番号表示"
            checked={formData.linenos}
            onChange={(e) => setFormData({ ...formData, linenos: e.target.checked })}
          />
          行番号表示
        </label>
      </div>
      <button type="submit" disabled={loading}>{submitLabel}</button>
      <button type="button" onClick={handleCancel}>キャンセル</button>
    </form>
  )
}
