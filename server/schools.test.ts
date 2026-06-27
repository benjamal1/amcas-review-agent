import { describe, it, expect } from 'vitest'
import { lookupSchool, checkRequirements } from './schools.js'

const LOOKUP = {
  'Yale School of Medicine': { state: 'CT' },
  'Stanford University School of Medicine': { state: 'CA' },
  '| The record could not be read': { junk: true },
  'We will not consider': { junk: true },
}

describe('lookupSchool', () => {
  it('exact match (case-insensitive)', () => {
    expect(lookupSchool(LOOKUP, 'yale school of medicine')?.key).toBe('Yale School of Medicine')
  })

  it('partial match — all significant words present', () => {
    expect(lookupSchool(LOOKUP, 'Stanford')?.key).toBe('Stanford University School of Medicine')
  })

  it('skips OCR-artifact keys', () => {
    expect(lookupSchool(LOOKUP, 'record could not')).toBeNull()
    expect(lookupSchool(LOOKUP, 'we will')).toBeNull()
  })

  it('returns null on miss', () => {
    expect(lookupSchool(LOOKUP, 'Hogwarts')).toBeNull()
  })

  it('returns null on empty query', () => {
    expect(lookupSchool(LOOKUP, '  ')).toBeNull()
  })
})

describe('checkRequirements', () => {
  const coursework = [
    { name: 'Organic Chemistry I', subject: 'Chemistry' },
    { name: 'Foundation of Living Systems', subject: 'Biology' },
    { name: 'Single Variable Calculus', subject: 'Mathematics' },
    { name: 'French III', subject: 'Language' },
  ]

  it('marks covered Required courses', () => {
    const r = checkRequirements(
      [{ name: 'Biology', status: 'Required' }, { name: 'Chemistry', status: 'Required' }],
      coursework,
    )
    expect(r.missing).toHaveLength(0)
    expect(r.covered.map(c => c.name).sort()).toEqual(['Biology', 'Chemistry'])
  })

  it('flags missing Required courses', () => {
    const r = checkRequirements([{ name: 'Physics', status: 'Required' }], coursework)
    expect(r.missing).toEqual(['Physics'])
  })

  it('does not count foreign language as English', () => {
    const r = checkRequirements([{ name: 'English', status: 'Required' }], coursework)
    expect(r.missing).toEqual(['English'])
  })

  it('ignores non-Required (Recommended) courses', () => {
    const r = checkRequirements([{ name: 'Physics', status: 'Recommended' }], coursework)
    expect(r.covered).toHaveLength(0)
    expect(r.missing).toHaveLength(0)
  })
})
