import { FolderDocsPage } from '../components/docs/FolderDocsPage'

// Advising/meeting notes (content/meeting-notes/). New notes are date-prefixed.
// Say "update meeting to-dos" in the terminal to extract action items into data.json.
export function MeetingNotesPage() {
  return <FolderDocsPage dir="meeting-notes" title="Meeting Notes" hint="Advising & meeting notes. Say “update meeting to-dos” to extract action items." addPlaceholder="New meeting…" datePrefix />
}
