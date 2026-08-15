// config.js — the Atlas's controlled vocabularies, visual taxonomy, and legend definitions.
//
// This file is the single source of truth for every allowed value. It is imported by both the
// browser app AND scripts/validate-data.mjs (Node), so it must stay free of browser-only APIs.
//
// IMPORTANT: `type` is a VISUAL TAXONOMY (it drives colour), NOT an ontology. Ontology lives in
// the node's `kind` (+ `scope`). Keep the two conceptually separate — see the plan's locked
// five-channel visual grammar:
//   colour = type · shape = kind (+ scope outline variant) · stroke = pathway ·
//   opacity = confidence · position = structural layer.

// --- Ontology (what a node *is*) --------------------------------------------------------------
export const KINDS = ['organisation', 'programme', 'sector'];

// A node's geographic/institutional scope. Drives the OUTLINE variant within the shape channel.
// Required for kind:organisation; used on programmes only where meaningful; never on sectors.
export const SCOPES = ['domestic', 'international'];

// Lifecycle status. A historical/renamed/closed node must never imply current activity merely by
// remaining in the catalogue.
export const STATUSES = ['active', 'historical', 'renamed', 'merged', 'closed', 'unclear'];

// --- Visual taxonomy (what colour a node gets) ------------------------------------------------
export const TYPES = [
  'agency', // NSAS itself
  'government', // other government agencies / ministries / statutory boards
  'academia', // universities + research institutions
  'company', // commercial entities
  'international', // international agencies, multinationals, foreign research partners, memberships
  'sector', // supporting sectors (ambient context, not actors)
  'programme', // programmes / grant calls / conventions (connective nodes)
];

// Company activity clusters (companies only). Drives the angular sector grouping in the layout.
export const CLUSTERS = [
  'satellite-mfg', // satellite / spacecraft manufacturing + subsystems
  'propulsion', // propulsion / electric thrusters
  'comms-ground', // communications, ground systems, teleport, laser links
  'geospatial', // EO / geospatial analytics / downstream data
  'quantum', // quantum comms / quantum-space
  'launch', // launch + access to space
  'downstream', // applications / services built on space data
];

// --- Relationships (how nodes connect) --------------------------------------------------------
// Vocabulary is biased toward objectively evidenceable claims. The strong verbs `funds`,
// `oversees`, `partners` are permitted but reserved for edges a source EXPLICITLY establishes.
export const RELATIONS = [
  'supports',
  'coordinates',
  'research',
  'participates',
  'member',
  'supplier',
  'programme',
  'spun-from',
  // strong, evidence-gated:
  'funds',
  'oversees',
  'partners',
];

// Two independent edge dimensions — never conflate them.
export const CONFIDENCE = ['documented', 'inferred']; // HOW SURE (evidence)
export const PATHWAYS = ['direct', 'programme-mediated', 'contextual']; // HOW it works (structure)

// --- Sources ----------------------------------------------------------------------------------
export const SOURCE_KINDS = ['primary-live', 'primary-archived', 'secondary'];

// --- Structural layers (concentric rings) -----------------------------------------------------
// Canonical layer vocabulary — use these labels VERBATIM in the UI. The longer phrasings are
// interpretive subtitles only, never the labels.
export const LAYERS = [
  { id: 'core', label: 'National coordination', subtitle: 'who coordinates the ecosystem' },
  {
    id: 'institutional',
    label: 'Institutional context',
    subtitle: 'government agencies & programmes',
  },
  { id: 'capability', label: 'Capability', subtitle: 'where capability comes from' },
  { id: 'industry', label: 'Industry', subtitle: 'where it commercialises' },
  { id: 'international', label: 'International', subtitle: 'what connects it internationally' },
];

// Human-readable labels for the visual taxonomy (legend + catalogue). Colours are defined as CSS
// custom properties in css/style.css (a single source of truth for palette), keyed by `type`.
export const TYPE_LABELS = {
  agency: 'National space agency',
  government: 'Government agency',
  academia: 'University / research',
  company: 'Company',
  international: 'International partner',
  sector: 'Supporting sector',
  programme: 'Programme',
};

export const CLUSTER_LABELS = {
  'satellite-mfg': 'Satellite manufacturing',
  propulsion: 'Propulsion',
  'comms-ground': 'Communications & ground systems',
  geospatial: 'Geospatial & Earth observation',
  quantum: 'Quantum',
  launch: 'Launch & access',
  downstream: 'Downstream applications',
};
