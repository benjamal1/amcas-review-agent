import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { TerminalDock, TerminalDockProvider } from './components/terminal/TerminalDock'
import { OverviewPage } from './pages/OverviewPage'
import { GradingPage } from './pages/GradingPage'
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage'
import { CourseworkPage } from './pages/CourseworkPage'
import { ApplicantImagePage } from './pages/ApplicantImagePage'
import { GradingDocsPage } from './pages/GradingDocsPage'
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
          <Route path="grading" element={<GradingPage />} />
          <Route path="tracker" element={<ApplicationTrackerPage />} />
          <Route path="coursework" element={<CourseworkPage />} />
          <Route path="applicant-image" element={<ApplicantImagePage />} />
          <Route path="grading-docs" element={<GradingDocsPage />} />
          <Route path="rubrics" element={<RubricsPage />} />
          <Route path="editor" element={<EditorPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
