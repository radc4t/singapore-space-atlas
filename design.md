# Singapore Space Atlas — Design

> **Precision over spectacle. Hierarchy over density. Evidence over completeness.**
> Every visual decision should make the ecosystem easier to understand, not merely more impressive
> to look at. Aesthetic hierarchy: **map → evidence → instrument chrome.**

> **The instrument metaphor is expressive, not literal.** It supplies hierarchy, typography, line
> discipline and state language — it must never introduce fictional telemetry, spatial claims,
> measurement scales, mission status, or technical meaning unsupported by the Atlas data.

## What it is

An interactive large-format **instrument** — _a digital atlas whose central map IS the instrument_,
not a dashboard. The map is a full-bleed **centred hero** that holds the vertical field; controls,
readouts and the inspector flank it as slim instrument rails (the map dominates as the figure — a
dominance of hierarchy and vertical scale, not a literal area percentage). One identity in **two
temperatures**: a
light **"archival / scientific instrument"** (paper + ink, red reads printed) and a dark **"night
operations room"** (blue-green charcoal, nodes lit by the room). The space feeling comes from
**geometry and precision, not space imagery** — no starfields, glow, planets, or orbit decoration
(one optional, very soft blue-green bloom behind NSAS in dark only).

## Product & views

Desktop-first flagship with a mobile companion (intentional simplification, not parity). Nav =
real view switches: **Explore** (the instrument) · **Directory** (the card index / accessible
representation) · **Methodology** (the intellectual contract). The **Directory** label sits on the
internal `catalogue` view id — terminology changed, routing identity did not (`?view=catalogue` is
kept for deep-link compatibility). `view` is orthogonal to `selection` in the store; canonical `/` =
Explore resting plate. The right panel is one module in two modes: **Readouts** (sparse derived
counts) by default, **Inspector** (field-note + evidence) on selection. Operating-state label derives
purely from state (`EXPLORE` · `INSPECT · <ENTITY>` · `DIRECTORY` · `METHODOLOGY`).

**Discovery is deliberately editorial, not exploratory tooling.** The atlas favours overview (the
resting plate) → details-on-demand (the inspector) → search + the Directory index, and intentionally
omits in-map zoom/pan and faceted filtering — the plate is a published instrument to be _read_, not a
canvas to fly around. Legend type-toggles are the one on-plate filter (they teach the colour = type
channel); known-item lookup is served by search and the Directory. (Rationale: `research/decisions.md`.)

## Product model (five layers)

- **Hero map** — the circle diagram; the product. Dominates the page, breaks slightly out of the
  header grid.
- **Directory** — the evidence surface: an editorial card-index (not a spreadsheet) that is also the
  accessible representation of the corpus. Grouped by stakeholder type; each entity name links to its
  official website (new tab) where the corpus provides one, and is inert text otherwise. It is
  _referential_ (index into external entities), not a second way into Explore — map selection remains
  the reverse-highlight mechanism (a selected node marks its Directory card).
- **Inspector** — the annotation layer: a docked field-note that never overlays the focused node.
- **Methodology** — the trust layer: framed as method, not disclaimer.
- **Deep links / print** — the sharing layer.

Nav: `Explore · Directory · Methodology`. The name is _Singapore Space Atlas_; only _Atlas snapshot_
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
programme neutral (plaque). Type carries three semantic roles: **serif = publication** (editorial
serif — Fraunces / Source Serif 4 stack — for the masthead and inspector titles); **mono = the
instrument voice** (IBM Plex Mono stack for nav, controls/buttons, captions, metadata, badges and
plate marks — the uppercase labelling that makes the chrome read as instrument, not web UI);
**sans = the reading/input surface** (system-sans / Inter stack for the search field and body prose).
Spacing follows one rhythm scale (`4·8·12·16·24·32·48·64`).

## Selection & coherence

Selection is an **annotation lock**: the node gets a fine ring, its edges sharpen, everything else
recedes, the inspector docks, and its Directory card marks active. The whole page behaves as **one
instrument** — a selection propagates from the map to inspector + Directory highlight + URL at once,
and reopening that URL restores the exact state. (The propagation is one-way from Explore: the
Directory is referential, so its entity names link out to official sites rather than driving
selection.) Motion is drafting, not gaming (quiet, reduced-motion aware).

## The Singaporean signature

Restraint itself — distilling to fundamentals, designs that don't need much explanation (well-suited
to a national project with many stakeholders and an international audience). One restrained red for
the agency; precise institutional language; no flag, no Merlion.

## Guardrails held during implementation

Every element must have a job; the sixth channel (size) stays subordinate; the legend is artwork,
not chrome; be ruthless with construction detail; **the corpus vetoes the decorative layer** — the
best result may be simpler than the spec. The publication test: it should read _"Oh, this is an
atlas,"_ then _"— it happens to be interactive."_
