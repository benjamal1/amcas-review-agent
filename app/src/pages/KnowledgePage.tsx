import { FolderDocsPage } from '../components/docs/FolderDocsPage'

// Sources the applicant/user finds useful — the review agent reads content/knowledge/ for context.
export function KnowledgePage() {
  return <FolderDocsPage dir="knowledge" title="Knowledge" hint="Sources the agent reads for context." addPlaceholder="New source…" />
}
