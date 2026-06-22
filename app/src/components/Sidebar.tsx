
import { useFiles } from '../hooks/useFiles'

interface Props {
  selected: string | null
  onSelect: (path: string) => void
}

export function Sidebar({ selected, onSelect }: Props) {
  const { files, loading, error } = useFiles()

  return (
    <aside className="sidebar">
      <div className="sidebar__label">FILES</div>
      {loading && <div className="sidebar__status">loading…</div>}
      {error && <div className="sidebar__status sidebar__status--error">{error}</div>}
      <ul className="file-list" role="listbox" aria-label="Markdown files">
        {files.map(f => (
          <li
            key={f}
            className={`file-list__item${selected === f ? ' file-list__item--active' : ''}`}
            role="option"
            aria-selected={selected === f}
            onClick={() => onSelect(f)}
          >
            {f}
          </li>
        ))}
      </ul>
    </aside>
  )
}
