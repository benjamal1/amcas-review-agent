import { NavLink } from 'react-router-dom'
import { useTerminalDock } from '../terminal/TerminalDock'

// Route tree is intentionally flat for now; per-school sections
// (e.g. /schools/:school/secondaries) will nest under here later.
const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/grading', label: 'Grading' },
  { to: '/tracker', label: 'Application Tracker' },
  { to: '/coursework', label: 'Coursework' },
  { to: '/applicant-image', label: 'Applicant Image' },
  { to: '/grading-docs', label: 'Grading Docs' },
  { to: '/rubrics', label: 'Rubrics' },
  { to: '/editor', label: 'Editor' },
]

export function Sidebar() {
  const { open, toggle } = useTerminalDock()
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar__logo">AMCAS</div>
      <ul className="sidebar__nav">
        {NAV.map(n => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.end}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            >{n.label}</NavLink>
          </li>
        ))}
      </ul>
      <button
        className={`sidebar__term-toggle${open ? ' sidebar__term-toggle--on' : ''}`}
        onClick={toggle}
      >{open ? '▾ Terminal' : '▸ Terminal'}</button>
      <div className="sidebar__foot">Local Review Agent</div>
    </nav>
  )
}
