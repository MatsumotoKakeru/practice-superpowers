'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { snippetSchema, type SnippetFormInput } from '@/schemas/snippet'
import { useCreateSnippet } from '@/hooks/useCreateSnippet'
import { useSnippetChoices } from '@/hooks/useSnippetChoices'

export default function NewSnippetPage() {
  const router = useRouter()
  const { create, isLoading, error: apiError } = useCreateSnippet()
  const { languages, styles, isLoading: choicesLoading } = useSnippetChoices()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SnippetFormInput>({
    resolver: zodResolver(snippetSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      code: '',
      language: 'python',
      style: 'friendly',
      linenos: false,
    },
  })

  const onSubmit = useCallback(
    async (data: SnippetFormInput) => {
      const success = await create(data)
      if (success) router.push('/')
    },
    [create, router],
  )

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          ← 一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">スニペットを新規作成</h1>
      </div>

      {apiError && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">
          {apiError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            {...register('title')}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="FizzBuzz in Python"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              言語 <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <select
                  {...field}
                  disabled={choicesLoading}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {choicesLoading ? (
                    <option value={field.value}>{field.value}</option>
                  ) : (
                    languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))
                  )}
                </select>
              )}
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-500">{errors.language.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スタイル <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="style"
              render={({ field }) => (
                <select
                  {...field}
                  disabled={choicesLoading}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {choicesLoading ? (
                    <option value={field.value}>{field.value}</option>
                  ) : (
                    styles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))
                  )}
                </select>
              )}
            />
            {errors.style && (
              <p className="mt-1 text-sm text-red-500">{errors.style.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コード <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('code')}
            rows={10}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="for i in range(1, 101):"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            {...register('linenos')}
            type="checkbox"
            id="linenos"
            className="w-4 h-4"
          />
          <label htmlFor="linenos" className="text-sm font-medium text-gray-700">
            行番号を表示する
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}
