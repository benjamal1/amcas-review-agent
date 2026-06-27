// Validation for data.json writes. Boundary guard for PUT /api/data.
// ponytail: validate the ranges that matter (metrics), not every field — data.json is large + agent-shaped.

type Result = { ok: true } | { ok: false; error: string }

const inRange = (v: unknown, lo: number, hi: number) =>
  v == null || v === '' || (typeof v === 'number' && v >= lo && v <= hi)

const GPA = [0, 4] as const
const MCAT = [472, 528] as const
const SECTION = [118, 132] as const

export function validateData(body: unknown): Result {
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'data must be a JSON object' }
  }
  const d = body as Record<string, unknown>
  const sc = d.scorecard as Record<string, unknown> | undefined
  const hm = sc?.hard_metrics as Record<string, unknown> | undefined
  if (hm) {
    if (!inRange(hm.gpa_cumulative, ...GPA)) return { ok: false, error: 'gpa_cumulative must be 0–4' }
    if (!inRange(hm.gpa_bcpm, ...GPA)) return { ok: false, error: 'gpa_bcpm must be 0–4' }
    if (!inRange(hm.mcat_total, ...MCAT)) return { ok: false, error: 'mcat_total must be 472–528' }
    for (const k of ['mcat_cars', 'mcat_cp', 'mcat_bb', 'mcat_ps']) {
      if (!inRange(hm[k], ...SECTION)) return { ok: false, error: `${k} must be 118–132` }
    }
  }
  return { ok: true }
}
