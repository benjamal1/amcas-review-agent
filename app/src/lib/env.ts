// Single source of truth for static-mode flag and base URL.
// VITE_STATIC=1 is set at build time by the build:static npm script.
export const IS_STATIC = import.meta.env.VITE_STATIC === '1'

// BASE_URL is set by Vite from the `base` config option.
// In static builds: /amcas-review-agent/   In dev/server: /
export const BASE = import.meta.env.BASE_URL
