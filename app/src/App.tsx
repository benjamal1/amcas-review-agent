import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { GradingPage } from './pages/GradingPage'
import { GradingDocsPage } from './pages/GradingDocsPage'
import { RubricsPage } from './pages/RubricsPage'
import { EditorPage } from './pages/EditorPage'

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content"><Outlet /></main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="grading" element={<GradingPage />} />
          <Route path="grading-docs" element={<GradingDocsPage />} />
          <Route path="rubrics" element={<RubricsPage />} />
          <Route path="editor" element={<EditorPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
