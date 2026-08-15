# Singapore Space Atlas — Design

> **Precision over spectacle. Hierarchy over density. Evidence over completeness.**
> Every visual decision should make the ecosystem easier to understand, not merely more impressive
> to look at.

## What it is

An interactive large-format **editorial graphic** wrapped in a quiet research interface — _a digital
atlas whose central map happens to be interactive_, not a dashboard. The aesthetic is **editorial
cartography × aerospace systems diagram × premium institutional report**: calm, precise, slightly
futuristic, distinctly Singaporean. The space feeling comes from **geometry and precision, not space
imagery** (no starfields, glow, planets, or orbit decoration).

## Product model (five layers)

- **Hero map** — the circle diagram; the product. Dominates the page, breaks slightly out of the
  header grid.
- **Catalogue** — the evidence surface: an editorial card-index (not a spreadsheet) that is also the
  accessible representation of the corpus.
- **Inspector** — the annotation layer: a docked field-note that never overlays the focused node.
- **Methodology** — the trust layer: framed as method, not disclaimer.
- **Deep links / print** — the sharing layer.

Nav: `Explore · Catalogue · Methodology`. The name is _Singapore Space Atlas_; only _Atlas snapshot_
/ _Atlas methodology_ recur — no over-branding.

## The locked visual grammar

Six independent encoding channels, each with one job — so meaning never rests on colour alone:

| channel  | encodes                     | notes                                                                                    |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| colour   | stakeholder **type**        | on **nodes only**; edges are neutral                                                     |
| shape    | ontology (**kind** + scope) | circle organisation · pill/plaque programme · outline international · arc/ambient sector |
| stroke   | **pathway**                 | solid direct · dashed programme-mediated · dotted contextual                             |
| opacity  | **confidence**              | documented crisp · inferred muted (hidden by default)                                    |
| position | structural **layer**        | concentric ring, inner → outer                                                           |
| size     | **editorial prominence**    | declared, _very_ close tiers; never degree/count/quantitative                            |

## The map

- Rings are **construction lines** (hairline + fine ticks + faint 45° radials, ring 4 dashed),
  governed by a single `--construction-contrast` dial so the whole cartographic layer dims from one
  place. The network is the **figure**; construction is the **ground**.
- **NSAS** is a concentric **anchor** (target + dot + `ORIGIN`) with generous whitespace — an origin
  point, not a bubble.
- **Programmes** are instrument **plaques** (fine-bordered, mono label), distinct from organisations.
- **International** nodes carry faint **outward continuation lines** (Singapore → wider ecosystem).
- **Layers** are named in a dedicated key (never on the rings). **Supporting sectors** sit as faint
  labels in the clear corners. Corner **registration marks** + a closed metadata vocabulary
  (`ATLAS / 2026`, `SG / 01`, `PLATE / ECOSYSTEM`).
- **Capability clusters** are conveyed by contiguous same-activity placement + the Catalogue's
  per-company cluster. On-map cluster labels were **dropped**: with this corpus one cluster spans
  half the ring, so a centroid label misleads — the corpus vetoed a decorative element (a success,
  not a deviation).
- **Deterministic labels** with breathing room: shortest alias per node; companies are tertiary
  (muted). At rest only documented edges show (progressive disclosure).

## Palette & type

Warm-paper light (archival editorial plate) and a blue-green charcoal dark (**late-night systems
room**, not a 1:1 inversion, with lower construction contrast). Stakeholder palette: agency coral ·
government ochre · academia deep blue · company green/teal · international violet · sector muted ·
programme neutral (plaque). Type: editorial serif (Fraunces / Source Serif 4 stack) for the masthead
and inspector titles; sans (Inter stack) for UI; mono (IBM Plex Mono stack) for captions, metadata
and badges. Serif = publication, sans = interface. Spacing follows one rhythm scale
(`4·8·12·16·24·32·48·64`).

## Selection & coherence

Selection is an **annotation lock**: the node gets a fine ring, its edges sharpen, everything else
recedes, the inspector docks, and its Catalogue card marks active. The whole page behaves as **one
instrument** — a selection propagates to map + inspector + catalogue + URL at once, and reopening
that URL restores the exact state. Motion is drafting, not gaming (quiet, reduced-motion aware).

## The Singaporean signature

Restraint itself — distilling to fundamentals, designs that don't need much explanation (well-suited
to a national project with many stakeholders and an international audience). One restrained red for
the agency; precise institutional language; no flag, no Merlion.

## Guardrails held during implementation

Every element must have a job; the sixth channel (size) stays subordinate; the legend is artwork,
not chrome; be ruthless with construction detail; **the corpus vetoes the decorative layer** — the
best result may be simpler than the spec. The publication test: it should read _"Oh, this is an
atlas,"_ then _"— it happens to be interactive."_
