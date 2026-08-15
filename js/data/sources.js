// sources.js — the source registry. Nodes and edges reference these by `id`, never by raw URL.
//
// Each entry:
//   { id, title, publisher, url, published?, updated?, accessed, kind }
//     - id:        stable kebab-case key referenced by node.sources / edge.sources
//     - published/updated: CONTENT dates (an accessed-today page may be years old) — distinct
//                  from `accessed`. Surfaced in the inspector/About, never as a visual channel.
//     - kind:      primary-live | primary-archived | secondary  (see SOURCE_KINDS in config.js)
//
// Populated during Phase B (the cited research pass). Empty until then so the toolchain runs green.

/** @type {Array<{id:string,title:string,publisher:string,url:string,published?:string,updated?:string,accessed:string,kind:string}>} */
export const SOURCES = [];
