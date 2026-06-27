import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { TerminalDock, TerminalDockProvider } from './components/terminal/TerminalDock'
import { UserGuidePage } from './pages/UserGuidePage'
import { OverviewPage } from './pages/OverviewPage'
import { GradingPage } from './pages/GradingPage'
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage'
import { SecondariesPage } from './pages/SecondariesPage'
import { BrainstormPage } from './pages/BrainstormPage'
import { EssayBankPage } from './pages/EssayBankPage'
import { SecondariesEditorPage } from './pages/SecondariesEditorPage'
import { SchoolDetailPage, SchoolResearchTab, SchoolEditorTab, SchoolGradingTab } from './pages/SchoolDetailPage'
import { Navigate } from 'react-router-dom'
import { CourseworkPage } from './pages/CourseworkPage'
import { ApplicantImagePage } from './pages/ApplicantImagePage'
import { ScoreHistoryPage } from './pages/ScoreHistoryPage'
import { ReviewPage } from './pages/ReviewPage'
import { KnowledgePage } from './pages/KnowledgePage'
import { RubricsPage } from './pages/RubricsPage'
import { EditorPage } from './pages/EditorPage'

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
          <Route path="grading" element={<GradingPage />} />
          <Route path="tracker" element={<ApplicationTrackerPage />} />
          <Route path="secondaries" element={<SecondariesPage />} />
          <Route path="secondaries/brainstorm" element={<BrainstormPage />} />
          <Route path="secondaries/bank" element={<EssayBankPage />} />
          <Route path="secondaries/editor" element={<SecondariesEditorPage />} />
          <Route path="secondaries/:school" element={<SchoolDetailPage />}>
            <Route index element={<Navigate to="research" replace />} />
            <Route path="research" element={<SchoolResearchTab />} />
            <Route path="editor" element={<SchoolEditorTab />} />
            <Route path="grading" element={<SchoolGradingTab />} />
          </Route>
          <Route path="coursework" element={<CourseworkPage />} />
          <Route path="applicant-image" element={<ApplicantImagePage />} />
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
