import { NavLink } from 'react-router-dom'
import { useTerminalDock } from '../terminal/TerminalDock'

type Item = { to: string; label: string; end?: boolean }
// General items have no section header; primary/secondary-specific items are grouped.
const SECTIONS: { title?: string; items: Item[] }[] = [
  { items: [
    { to: '/', label: 'Overview', end: true },
    { to: '/grading', label: 'Grading' },
    { to: '/applicant-image', label: 'Applicant Image' },
    { to: '/grading-docs', label: 'Grading Docs' },
    { to: '/rubrics', label: 'Rubrics' },
    { to: '/editor', label: 'Editor' },
  ] },
  { title: 'Primaries', items: [
    { to: '/tracker', label: 'Application Tracker' },
    { to: '/coursework', label: 'Coursework' },
  ] },
  { title: 'Secondaries', items: [
    { to: '/secondaries', label: 'Secondary Tracker' },
  ] },
]

export function Sidebar() {
  const { open, toggle } = useTerminalDock()
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar__logo">AMCAS</div>
      <div className="sidebar__sections">
        {SECTIONS.map((sec, i) => (
          <div key={sec.title ?? `g${i}`} className="sidebar__section">
            {sec.title && <div className="sidebar__section-title">{sec.title}</div>}
            <ul className="sidebar__nav">
              {sec.items.map(n => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
                  >{n.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        className={`sidebar__term-toggle${open ? ' sidebar__term-toggle--on' : ''}`}
        onClick={toggle}
      >{open ? '▾ Terminal' : '▸ Terminal'}</button>
      <div className="sidebar__foot">Local Review Agent</div>
    </nav>
  )
}
