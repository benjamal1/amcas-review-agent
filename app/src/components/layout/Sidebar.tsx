import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTerminalDock } from '../terminal/TerminalDock'

// claude: page whose content is authored solely by the Claude agent (not user-edited) → orange "C".
type Item = { to: string; label: string; end?: boolean; claude?: boolean }
const SECTIONS: { title: string; items: Item[] }[] = [
  { title: 'Guide', items: [
    { to: '/guide', label: 'User Guide' },
    { to: '/claude', label: 'Claude' },
  ] },
  { title: 'General', items: [
    { to: '/', label: 'Overview', end: true },
    { to: '/tracker', label: 'Application Tracker' },
    { to: '/applicant-image', label: 'Applicant Image', claude: true },
    { to: '/story-bank', label: 'Story Bank', claude: true },
    { to: '/meeting-notes', label: 'Meeting Notes' },
    { to: '/knowledge', label: 'Knowledge' },
    { to: '/log', label: 'Activity Log', claude: true },
  ] },
  { title: 'Primaries', items: [
    { to: '/grading', label: 'Grading', claude: true },
    { to: '/editor', label: 'Editor' },
    { to: '/review', label: 'Review', claude: true },
    { to: '/coursework', label: 'Coursework' },
    { to: '/rubrics', label: 'Rubrics' },
    { to: '/score-history', label: 'Score History', claude: true },
  ] },
  { title: 'Secondaries', items: [
    { to: '/secondaries/prewriting', label: 'Prewriting' },
    { to: '/secondaries', label: 'Schools', end: true },
    { to: '/secondaries/prioritization', label: 'Essay Prioritization' },
    { to: '/secondaries/workspace', label: 'General Editor' },
  ] },
]

export function Sidebar() {
  const { open, toggle } = useTerminalDock()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('sidebar-collapsed') ?? '{}') } catch { return {} }
  })
  const flip = (t: string) => setCollapsed(c => {
    const next = { ...c, [t]: !c[t] }
    localStorage.setItem('sidebar-collapsed', JSON.stringify(next))
    return next
  })
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar__logo">AMCAS</div>
      <div className="sidebar__sections">
        {SECTIONS.map(sec => {
          const isCollapsed = collapsed[sec.title]
          return (
            <div key={sec.title} className="sidebar__section">
              <button className="sidebar__section-title" onClick={() => flip(sec.title)} aria-expanded={!isCollapsed}>
                <span className="sidebar__chevron">{isCollapsed ? '▸' : '▾'}</span>{sec.title}
              </button>
              {!isCollapsed && (
                <ul className="sidebar__nav">
                  {sec.items.map(n => (
                    <li key={n.to}>
                      <NavLink to={n.to} end={n.end}
                        className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
                      >
                        <span className="sidebar__link-label">{n.label}</span>
                        {n.claude && <span className="sidebar__c" title="Claude-authored — written solely by the agent">C</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
      <button className={`sidebar__term-toggle${open ? ' sidebar__term-toggle--on' : ''}`} onClick={toggle}>
        {open ? '▾ Terminal' : '▸ Terminal'}
      </button>
      <div className="sidebar__foot">Local Review Agent</div>
    </nav>
  )
}
