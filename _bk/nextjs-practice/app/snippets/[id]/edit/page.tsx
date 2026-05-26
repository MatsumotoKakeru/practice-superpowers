import { notFound } from 'next/navigation'
import EditSnippetForm from './EditSnippetForm'

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const snippetId = Number(id)
  if (isNaN(snippetId)) notFound()
  return <EditSnippetForm snippetId={snippetId} />
}
