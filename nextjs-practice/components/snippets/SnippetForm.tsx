'use client'
import { memo, useState } from 'react'
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

export const SnippetForm = memo(function SnippetForm({ initialData, onSubmit, onCancel, submitLabel = '保存' }: SnippetFormProps) {
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

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const inputClass = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const errorClass = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {serverError}
        </p>
      )}
      <div>
        <label htmlFor="title" className={labelClass}>タイトル</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClass}
          placeholder="例: Python ソート関数"
        />
        {errors.title && <p className={errorClass}>{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="code" className={labelClass}>コード</label>
        <textarea
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className={`${inputClass} font-mono min-h-40 resize-y`}
          placeholder="コードを入力..."
        />
        {errors.code && <p className={errorClass}>{errors.code}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="language" className={labelClass}>言語</label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className={inputClass}
          >
            {LANGUAGE_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="style" className={labelClass}>スタイル</label>
          <select
            id="style"
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            className={inputClass}
          >
            {STYLE_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            aria-label="行番号表示"
            checked={formData.linenos}
            onChange={(e) => setFormData({ ...formData, linenos: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">行番号表示</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
})
