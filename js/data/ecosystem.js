// ecosystem.js — the CLEAN PUBLICATION dataset (NODES + EDGES). The messy reasoning lives in the
// research/ evidence ledger, not here.
//
// Cardinal rule: an edge exists ONLY when its relation, pathway, and confidence can be justified
// independently from a source that substantiates that SPECIFIC relationship. A node's sources
// never substantiate an edge. When the evidence and the desired picture disagree, change the
// picture.
//
// Populated during Phase B. Empty arrays until then so the toolchain runs green from record zero.

export const SCHEMA_VERSION = '1.0'; // bump on data-model changes
export const DATA_SNAPSHOT = '2026-08-15'; // research snapshot id — powers "Atlas snapshot · <date>"

// The denominator for coverage statements ("N of ~M identified in public materials"). This is a
// CITED editorial estimate — every other count in the UI is derived from the data at runtime.
export const CATALOGUE_UNIVERSE_ESTIMATE = {
  companies: 70,
  sourceId: null, // set in Phase B to the source id substantiating "~70 companies"
};

/**
 * NODES — see the schema in the plan. Required per node: id, name, kind, type, coverage, role,
 * sources[]. Conditionals enforced by the validator: kind:organisation ⇒ scope; type:company ⇒
 * cluster; coverage:featured ⇒ featuredReason; kind:programme ⇒ type:programme; kind:sector ⇒
 * no scope and no edges.
 * @type {Array<object>}
 */
export const NODES = [];

/**
 * EDGES — { source, target, relation, sources[], confidence, pathway, rationale?, evidenceNote? }.
 * confidence:inferred ⇒ rationale AND evidenceNote required.
 * @type {Array<object>}
 */
export const EDGES = [];
