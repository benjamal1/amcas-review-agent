import { useEffect, useState } from 'react'
import { IS_STATIC } from '../lib/env'

type Config = { contentDir: string; envOverride: boolean }

function StaticNotice() {
  return (
    <div className="page page--single">
      <div className="placeholder">
        <h2 className="placeholder__title">Not available in the shared export</h2>
        <p className="placeholder__body">Settings only apply to the full local app.</p>
      </div>
    </div>
  )
}

export function SettingsPage() {
  if (IS_STATIC) return <StaticNotice />
  return <SettingsInner />
}

function SettingsInner() {
  const [config, setConfig] = useState<Config | null>(null)
  const [draft, setDraft] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then((c: Config) => { setConfig(c); setDraft(c.contentDir) }).catch(() => {})
  }, [])

  async function saveContentDir() {
    setSaveMsg('')
    const r = await fetch('/api/config', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contentDir: draft }),
    })
    const body = await r.json()
    if (!r.ok) { setSaveMsg(body.error ?? 'Save failed.'); return }
    setSaveMsg('Saved — restart the dev server (Ctrl+C, npm run dev) to apply.')
  }

  async function clearAllData() {
    if (!confirm('Delete everything in the content directory and reset to a blank starting point? This cannot be undone.')) return
    setResetting(true)
    setResetMsg('')
    const r = await fetch('/api/reset', { method: 'POST' }).catch(() => null)
    setResetting(false)
    setResetMsg(r?.ok ? 'Cleared. Reload the app to see the blank state.' : 'Reset failed.')
  }

  if (!config) return <div className="dashboard__loading">Loading…</div>

  return (
    <div className="page page--single guide">
      <h1 className="guide__title">Settings</h1>

      <section className="guide__section">
        <h2>Content Directory</h2>
        <p>Where your application data lives — <code>data.json</code>, essays, feedback. Ships pointed
        at the repo's own <code>content/</code> folder, which is tracked in git and prefilled with demo
        data. Point this somewhere outside the repo before entering your real application.</p>
        {config.envOverride ? (
          <p><b>Set via the <code>CONTENT_DIR</code> environment variable</b> ({config.contentDir}) —
          edit that instead of using this form; it always takes priority.</p>
        ) : (
          <>
            <div className="activity-form__row activity-form__row--wide" style={{ marginTop: '0.75rem' }}>
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="/path/to/your/content" style={{ flex: 1 }} />
              <button onClick={saveContentDir}>Save</button>
            </div>
            {saveMsg && <p>{saveMsg}</p>}
          </>
        )}
      </section>

      <section className="guide__section">
        <h2>Clear All Data</h2>
        <p>Wipes the current content directory (<code>{config.contentDir}</code>) back to a blank
        starting point — no demo applicant, no scores, blank essay templates. Use this once, right
        after cloning, before you start entering your own data (or after changing the Content
        Directory above, to start that new folder clean).</p>
        <button onClick={clearAllData} disabled={resetting} style={{ background: '#7a2020' }}>
          {resetting ? 'Clearing…' : 'Clear All Data'}
        </button>
        {resetMsg && <p>{resetMsg}</p>}
      </section>
    </div>
  )
}
