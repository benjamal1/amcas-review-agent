import { useState } from 'react'

// Shared view→edit→save pattern: a block renders read-only until "Edit", then edits a local draft
// and commits on "Save" (or discards on "Cancel"). Keeps editable lists clean across the app.
export function useEditSave<T>(value: T, onSave: (v: T) => void) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<T>(value)
  return {
    editing,
    draft,
    setDraft,
    start: () => { setDraft(value); setEditing(true) },
    cancel: () => setEditing(false),
    save: () => { onSave(draft); setEditing(false) },
  }
}
