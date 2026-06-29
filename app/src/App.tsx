import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { TerminalDock, TerminalDockProvider } from './components/terminal/TerminalDock'
import { UserGuidePage } from './pages/UserGuidePage'
import { ClaudePage } from './pages/ClaudePage'
import { OverviewPage } from './pages/OverviewPage'
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage'
import { SecondariesPage } from './pages/SecondariesPage'
import { PrewritingPage } from './pages/PrewritingPage'
import { SecondaryWorkspacePage } from './pages/SecondaryWorkspacePage'
import { SecondariesEditorPage } from './pages/SecondariesEditorPage'
import { SchoolDetailPage, SchoolResearchTab, SchoolEditorTab, SchoolGradingTab } from './pages/SchoolDetailPage'
import { Navigate } from 'react-router-dom'
import { CourseworkPage } from './pages/CourseworkPage'
import { ApplicantImagePage } from './pages/ApplicantImagePage'
import { StoryBankPage } from './pages/StoryBankPage'
import { MeetingNotesPage } from './pages/MeetingNotesPage'
import { ScoreHistoryPage } from './pages/ScoreHistoryPage'
import { ReviewPage } from './pages/ReviewPage'
import { KnowledgePage } from './pages/KnowledgePage'
import { RubricsPage } from './pages/RubricsPage'
import { EditorPage } from './pages/EditorPage'
import { GradingPage } from './pages/GradingPage'
import { EssayPrioritizationPage } from './pages/EssayPrioritizationPage'

function Layout() {
  return (
    <TerminalDockProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="app-content">
          <div className="app-content__page"><Outlet /></div>
          <TerminalDock />
        </main>
      </div>
    </TerminalDockProvider>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="guide" element={<UserGuidePage />} />
          <Route path="claude" element={<ClaudePage />} />
          <Route path="tracker" element={<ApplicationTrackerPage />} />
          <Route path="grading" element={<GradingPage />} />
          <Route path="secondaries" element={<SecondariesPage />} />
          <Route path="secondaries/prewriting" element={<PrewritingPage />} />
          <Route path="secondaries/workspace" element={<SecondaryWorkspacePage />} />
          <Route path="secondaries/brainstorm" element={<Navigate to="/secondaries/prewriting" replace />} />
          <Route path="secondaries/bank" element={<Navigate to="/secondaries/prewriting" replace />} />
          <Route path="secondaries/prioritization" element={<EssayPrioritizationPage />} />
          <Route path="secondaries/editor" element={<SecondariesEditorPage />} />
          <Route path="secondaries/:school" element={<SchoolDetailPage />}>
            <Route index element={<Navigate to="research" replace />} />
            <Route path="research" element={<SchoolResearchTab />} />
            <Route path="editor" element={<SchoolEditorTab />} />
            <Route path="grading" element={<SchoolGradingTab />} />
          </Route>
          <Route path="coursework" element={<CourseworkPage />} />
          <Route path="applicant-image" element={<ApplicantImagePage />} />
          <Route path="story-bank" element={<StoryBankPage />} />
          <Route path="meeting-notes" element={<MeetingNotesPage />} />
          <Route path="score-history" element={<ScoreHistoryPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="rubrics" element={<RubricsPage />} />
          <Route path="editor" element={<EditorPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
