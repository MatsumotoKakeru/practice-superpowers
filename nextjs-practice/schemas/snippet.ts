import { z } from 'zod'

export const snippetSchema = z.object({
  title: z.string().max(100),
  code: z.string().min(1, 'コードを入力してください'),
  language: z.string().min(1, '言語を入力してください'),
  style: z.string().min(1, 'スタイルを入力してください'),
  linenos: z.boolean(),
})

export type SnippetFormInput = z.infer<typeof snippetSchema>
