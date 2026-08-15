// validate-data.mjs — enforces the Atlas data contract described in the plan.
//
// Encodes referential integrity, the controlled vocabularies, the ontology rules (so data edits
// can't silently violate the visual model), and evidence discipline. Exported as `validateData()`
// for the test suite; run directly (`node scripts/validate-data.mjs` / `npm run validate`) for a
// CLI report that exits non-zero on any error.

import { pathToFileURL } from 'node:url';
import {
  CLUSTERS,
  CONFIDENCE,
  KINDS,
  PATHWAYS,
  RELATIONS,
  SCOPES,
  SOURCE_KINDS,
  STATUSES,
  TYPES,
} from '../js/config.js';
import { CATALOGUE_UNIVERSE_ESTIMATE, EDGES, NODES, SCHEMA_VERSION } from '../js/data/ecosystem.js';
import { SOURCES } from '../js/data/sources.js';

const COVERAGES = ['featured', 'catalogued'];

/**
 * Validate the dataset. Returns { errors, warnings, stats } with no side effects.
 * @param {object} [data] optional overrides (used by tests to feed synthetic datasets)
 */
export function validateData(data = {}) {
  const nodes = data.nodes ?? NODES;
  const edges = data.edges ?? EDGES;
  const sources = data.sources ?? SOURCES;
  const universe = data.universe ?? CATALOGUE_UNIVERSE_ESTIMATE;

  const errors = [];
  const warnings = [];
  const E = (msg) => errors.push(msg);
  const W = (msg) => warnings.push(msg);

  const inSet = (set, v) => set.includes(v);

  // ---- SOURCES registry --------------------------------------------------------------------
  const sourceIds = new Set();
  for (const [i, s] of sources.entries()) {
    const at = `SOURCES[${i}]${s?.id ? ` (${s.id})` : ''}`;
    if (!s || typeof s !== 'object') {
      E(`${at}: not an object`);
      continue;
    }
    for (const f of ['id', 'title', 'publisher', 'url', 'accessed', 'kind']) {
      if (!s[f]) E(`${at}: missing required field "${f}"`);
    }
    if (s.id) {
      if (sourceIds.has(s.id)) E(`${at}: duplicate source id "${s.id}"`);
      sourceIds.add(s.id);
    }
    if (s.kind && !inSet(SOURCE_KINDS, s.kind)) E(`${at}: invalid kind "${s.kind}"`);
    if (s.url) {
      try {
        new URL(s.url);
      } catch {
        E(`${at}: syntactically invalid url "${s.url}"`);
      }
    }
  }

  const resolveSources = (ids, at) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      E(`${at}: must reference ≥1 source id`);
      return;
    }
    for (const id of ids) {
      if (!sourceIds.has(id)) E(`${at}: unresolved source id "${id}"`);
    }
  };

  // ---- NODES -------------------------------------------------------------------------------
  const nodeIds = new Set();
  const nodeById = new Map();
  for (const [i, n] of nodes.entries()) {
    const at = `NODES[${i}]${n?.id ? ` (${n.id})` : ''}`;
    if (!n || typeof n !== 'object') {
      E(`${at}: not an object`);
      continue;
    }
    for (const f of ['id', 'name', 'kind', 'type', 'coverage', 'role']) {
      if (!n[f]) E(`${at}: missing required field "${f}"`);
    }
    if (n.id) {
      if (nodeIds.has(n.id)) E(`${at}: duplicate node id "${n.id}"`);
      nodeIds.add(n.id);
      nodeById.set(n.id, n);
    }
    if (n.kind && !inSet(KINDS, n.kind)) E(`${at}: invalid kind "${n.kind}"`);
    if (n.type && !inSet(TYPES, n.type)) E(`${at}: invalid type "${n.type}"`);
    if (n.coverage && !inSet(COVERAGES, n.coverage)) E(`${at}: invalid coverage "${n.coverage}"`);
    if (n.status !== undefined && !inSet(STATUSES, n.status))
      E(`${at}: invalid status "${n.status}"`);
    if (n.scope !== undefined && !inSet(SCOPES, n.scope)) E(`${at}: invalid scope "${n.scope}"`);
    if (n.cluster !== undefined && !inSet(CLUSTERS, n.cluster))
      E(`${at}: invalid cluster "${n.cluster}"`);
    if (n.aliases !== undefined && !Array.isArray(n.aliases)) E(`${at}: aliases must be an array`);

    resolveSources(n.sources, `${at}.sources`);

    // Ontology rules ------------------------------------------------------------------------
    if (n.kind === 'programme' && n.type !== 'programme')
      E(`${at}: kind:programme requires type:programme (got "${n.type}")`);
    if (n.kind === 'organisation' && n.scope === undefined)
      E(`${at}: kind:organisation requires a scope`);
    if (n.kind === 'sector' && n.scope !== undefined) E(`${at}: kind:sector must not have a scope`);
    if (n.type === 'company' && !n.cluster) E(`${at}: type:company requires a valid cluster`);
    if (n.coverage === 'featured' && !n.featuredReason)
      E(`${at}: coverage:featured requires a featuredReason`);
  }

  // ---- EDGES -------------------------------------------------------------------------------
  const edgeKeys = new Set();
  for (const [i, e] of edges.entries()) {
    const at = `EDGES[${i}]${e?.source && e?.target ? ` (${e.source}→${e.target})` : ''}`;
    if (!e || typeof e !== 'object') {
      E(`${at}: not an object`);
      continue;
    }
    for (const f of ['source', 'target', 'relation', 'confidence', 'pathway']) {
      if (!e[f]) E(`${at}: missing required field "${f}"`);
    }
    if (e.source && !nodeIds.has(e.source)) E(`${at}: unknown source node "${e.source}"`);
    if (e.target && !nodeIds.has(e.target)) E(`${at}: unknown target node "${e.target}"`);
    if (e.source && e.target && e.source === e.target) E(`${at}: self-edge not allowed`);
    if (e.relation && !inSet(RELATIONS, e.relation)) E(`${at}: invalid relation "${e.relation}"`);
    if (e.confidence && !inSet(CONFIDENCE, e.confidence))
      E(`${at}: invalid confidence "${e.confidence}"`);
    if (e.pathway && !inSet(PATHWAYS, e.pathway)) E(`${at}: invalid pathway "${e.pathway}"`);

    resolveSources(e.sources, `${at}.sources`);

    // No duplicate edges (same source+target+relation).
    const key = `${e.source}|${e.target}|${e.relation}`;
    if (edgeKeys.has(key)) E(`${at}: duplicate edge (${key})`);
    edgeKeys.add(key);

    // Sectors are context, not actors — they must never appear in an edge.
    for (const end of ['source', 'target']) {
      const node = nodeById.get(e[end]);
      if (node && node.kind === 'sector')
        E(`${at}: sector node "${e[end]}" must not appear in EDGES (context, not an actor)`);
    }

    // Inferred edges require BOTH an interpretation rationale AND an evidence note.
    if (e.confidence === 'inferred') {
      if (!e.rationale) E(`${at}: confidence:inferred requires a rationale`);
      if (!e.evidenceNote) E(`${at}: confidence:inferred requires an evidenceNote`);
    }
  }

  // ---- Coverage estimate -------------------------------------------------------------------
  if (universe?.sourceId == null) {
    W('CATALOGUE_UNIVERSE_ESTIMATE.sourceId is null — set it in Phase B to cite the "~70" figure');
  } else if (!sourceIds.has(universe.sourceId)) {
    E(`CATALOGUE_UNIVERSE_ESTIMATE.sourceId "${universe.sourceId}" does not resolve`);
  }

  const stats = {
    schema: SCHEMA_VERSION,
    sources: sources.length,
    nodes: nodes.length,
    edges: edges.length,
    featured: nodes.filter((n) => n?.coverage === 'featured').length,
    catalogued: nodes.filter((n) => n?.coverage === 'catalogued').length,
    documentedEdges: edges.filter((e) => e?.confidence === 'documented').length,
    inferredEdges: edges.filter((e) => e?.confidence === 'inferred').length,
  };

  return { errors, warnings, stats };
}

// ---- CLI -----------------------------------------------------------------------------------
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { errors, warnings, stats } = validateData();
  console.log('Singapore Space Atlas — data validation');
  console.log(
    `  schema ${stats.schema} · ${stats.sources} sources · ${stats.nodes} nodes ` +
      `(${stats.featured} featured, ${stats.catalogued} catalogued) · ` +
      `${stats.edges} edges (${stats.documentedEdges} documented, ${stats.inferredEdges} inferred)`
  );
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
  if (errors.length) {
    console.error(`\n✗ ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('\n✓ data contract valid');
}
