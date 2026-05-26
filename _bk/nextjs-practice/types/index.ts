export type Snippet = {
  id: number
  url: string
  title: string
  code: string
  language: string
  style: string
  linenos: boolean
  owner: string | null
  highlight: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type SnippetChoices = {
  languages: { value: string; label: string }[]
  styles: string[]
}
