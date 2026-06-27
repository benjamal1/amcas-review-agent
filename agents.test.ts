import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const root = __dirname
const agentNames = readdirSync(path.join(root, '.claude', 'agents'))
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/\.md$/, ''))
const router = readFileSync(path.join(root, 'CLAUDE.md'), 'utf8')
const agentsMd = readFileSync(path.join(root, 'AGENTS.md'), 'utf8')

describe('agent wiring', () => {
  it('has the 9 expected subagents', () => {
    expect(agentNames.sort()).toEqual([
      'activities-scorer', 'competency-assessor', 'coursework-mapper', 'essay-scorer',
      'experiences-scorer', 'meeting-todo-extractor', 'metrics-advisor', 'rec-letter-reviewer',
      'secondary-regrader',
    ])
  })

  it('router dispatch table names every subagent', () => {
    for (const name of agentNames) expect(router).toContain(name)
  })

  it('AGENTS.md (Codex fallback) inlines every subagent', () => {
    for (const name of agentNames) expect(agentsMd).toContain(`## ${name}`)
  })

  it('every frontmatter name matches its filename', () => {
    for (const name of agentNames) {
      const body = readFileSync(path.join(root, '.claude', 'agents', `${name}.md`), 'utf8')
      expect(body).toMatch(new RegExp(`^name:\\s*${name}\\s*$`, 'm'))
    }
  })

  it('GradeButtons trigger phrases each route to a subagent in the router', () => {
    const gb = readFileSync(path.join(root, 'app/src/components/terminal/GradeButtons.tsx'), 'utf8')
    const phrases = [...gb.matchAll(/phrase:\s*'([^']+)'/g)].map(m => m[1])
    expect(phrases.length).toBeGreaterThan(8)
    // Each phrase's primary noun should appear in the router dispatch table.
    const nouns = ['personal statement', 'activit', 'experience', 'competency', 'metric', 'meeting', 'transcript', 'impactful']
    for (const p of phrases) {
      const hit = nouns.some(n => p.includes(n) && router.toLowerCase().includes(n))
      expect(hit, `phrase "${p}" has no routing noun in CLAUDE.md`).toBe(true)
    }
  })
})
