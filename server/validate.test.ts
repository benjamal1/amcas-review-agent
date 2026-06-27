import { describe, it, expect } from 'vitest'
import { validateData } from './validate.js'

describe('validateData', () => {
  it('accepts valid metrics', () => {
    const r = validateData({ scorecard: { hard_metrics: { gpa_cumulative: 3.9, mcat_total: 518, mcat_cars: 128 } } })
    expect(r.ok).toBe(true)
  })

  it('accepts blank/null metrics', () => {
    expect(validateData({ scorecard: { hard_metrics: { gpa_cumulative: null, mcat_total: '' } } }).ok).toBe(true)
  })

  it('accepts data with no hard_metrics', () => {
    expect(validateData({ competencies: [], schools: [] }).ok).toBe(true)
  })

  it('rejects GPA over 4', () => {
    const r = validateData({ scorecard: { hard_metrics: { gpa_cumulative: 4.5 } } })
    expect(r.ok).toBe(false)
  })

  it('rejects MCAT over 528', () => {
    const r = validateData({ scorecard: { hard_metrics: { mcat_total: 530 } } })
    expect(r.ok).toBe(false)
  })

  it('rejects a section score out of 118–132', () => {
    expect(validateData({ scorecard: { hard_metrics: { mcat_cars: 140 } } }).ok).toBe(false)
  })

  it('rejects non-object body', () => {
    expect(validateData([]).ok).toBe(false)
    expect(validateData(null).ok).toBe(false)
  })
})
