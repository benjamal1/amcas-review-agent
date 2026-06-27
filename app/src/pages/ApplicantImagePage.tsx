import { MarkdownDocPage } from '../components/docs/MarkdownDocPage'

// The agent-maintained holistic profile (content/applicant-image.md).
export function ApplicantImagePage() {
  return <MarkdownDocPage path="applicant-image.md" intro="Applicant Image — the profile the review agent reads before every session." />
}
