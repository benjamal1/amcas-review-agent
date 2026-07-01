// Post-build step for the static export. `vite build` (with VITE_STATIC=1) has already emitted the
// SPA into dist-static/. Here we copy the data the app fetches at runtime and generate the manifests
// that replace the /api/files and /api/rubrics listing endpoints.
//
// Layout produced (served under base /amcas-review-agent/):
//   dist-static/data.json            ← content/data.json
//   dist-static/documents/…          ← content/documents, feedback, story-bank.md, etc.
//   dist-static/rubrics/*.md         ← Agent/rubrics
//   dist-static/files-manifest.json  ← [{path,name}] for every content .md (drives fetchFiles)
//   dist-static/rubrics-manifest.json← ["essay-base-rubric.md", …]
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.join(repoRoot, 'content')
const RUBRICS = path.join(repoRoot, 'Agent', 'rubrics')
const OUT = path.join(repoRoot, 'dist-static')

// Local cruft / non-shareable dirs excluded from the export.
const SKIP = new Set(['node_modules', '.git'])

async function walkMd(dir, base = dir) {
  const out = []
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...await walkMd(full, base))
    else if (e.name.endsWith('.md')) out.push(path.relative(base, full))
  }
  return out
}

async function main() {
  await fs.access(OUT).catch(() => { throw new Error(`${OUT} not found — run "vite build" (VITE_STATIC=1) first`) })

  // 1. Copy the content tree (essays, feedback, story-bank, applicant-image, data.json, …).
  await fs.cp(CONTENT, OUT, {
    recursive: true,
    filter: src => !SKIP.has(path.basename(src)),
  })

  // 2. Copy rubrics under /rubrics.
  await fs.cp(RUBRICS, path.join(OUT, 'rubrics'), { recursive: true }).catch(() => {})

  // 3. files-manifest.json — path (relative to content root) + display name from frontmatter.
  const mdPaths = (await walkMd(CONTENT)).sort()
  const manifest = await Promise.all(mdPaths.map(async rel => {
    const p = rel.split(path.sep).join('/')
    try {
      const fm = matter(await fs.readFile(path.join(CONTENT, rel), 'utf8')).data
      return { path: p, name: (fm.experience_name || fm.title || '') }
    } catch { return { path: p, name: '' } }
  }))
  await fs.writeFile(path.join(OUT, 'files-manifest.json'), JSON.stringify(manifest), 'utf8')

  // 4. rubrics-manifest.json — flat list of rubric filenames.
  const rubrics = (await fs.readdir(RUBRICS).catch(() => [])).filter(f => f.endsWith('.md')).sort()
  await fs.writeFile(path.join(OUT, 'rubrics-manifest.json'), JSON.stringify(rubrics), 'utf8')

  console.log(`static export ready: ${OUT}`)
  console.log(`  ${manifest.length} docs · ${rubrics.length} rubrics · data.json copied`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
