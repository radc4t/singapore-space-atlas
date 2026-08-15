// inspector.js — selected-node information: a mini research interface, not a tooltip. Shows
// "Why it is here", connections, a relationship-evidence table (relation · pathway · confidence ·
// why shown) and cited sources. Renders via DOM APIs only (no untrusted innerHTML). Reacts to the
// shared store; never obscures the keyboard-focused node (it sits in a side column — WCAG 2.4.11).

import { CLUSTER_LABELS, CONFIDENCE, PATHWAYS, TYPE_LABELS } from './config.js';
import { EDGES, NODES } from './data/ecosystem.js';
import { SOURCES } from './data/sources.js';
import { icon } from './icons.js';
import { setState, state, subscribe } from './state.js';

const nodeById = new Map(NODES.map((n) => [n.id, n]));
const srcById = new Map(SOURCES.map((s) => [s.id, s]));

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html')
      node.innerHTML = v; // only ever called with literal strings below
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

function sourceLink(id) {
  const s = srcById.get(id);
  if (!s) return el('span', { text: id });
  const date = s.published || s.updated || s.accessed;
  const a = el('a', {
    href: s.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    class: 'src-link',
  });
  a.textContent = `${s.publisher}${date ? ` · ${date}` : ''}`;
  return a;
}

function edgesFor(id) {
  return EDGES.filter((e) => e.source === id || e.target === id);
}

function confidenceBadge(conf) {
  return el('span', { class: `badge conf-${conf}`, text: conf });
}

export function initInspector(mount) {
  function render() {
    mount.replaceChildren();
    const id = state.selection;

    // No selection → the Readouts panel shows instead; the inspector hides entirely.
    if (!id) {
      mount.hidden = true;
      return;
    }
    mount.hidden = false;

    const n = nodeById.get(id);
    if (!n) return;

    const head = el('div', { class: 'inspector-head' }, [
      el('h3', { class: 'inspector-title', text: n.name }),
      el('p', { class: 'inspector-type' }, [
        el('span', { class: `dot type-${n.type}` }),
        el('span', {
          text:
            `${TYPE_LABELS[n.type] ?? n.type}` +
            (n.cluster ? ` · ${CLUSTER_LABELS[n.cluster] ?? n.cluster}` : '') +
            (n.scope === 'international' ? ' · international' : '') +
            (n.status && n.status !== 'active' ? ` · ${n.status}` : ''),
        }),
      ]),
    ]);

    const clear = el(
      'button',
      {
        class: 'inspector-clear',
        type: 'button',
        'aria-label': 'Clear selection',
        title: 'Clear selection',
      },
      [icon('close', { size: 14 })]
    );
    clear.addEventListener('click', () => setState({ selection: null }));
    head.append(clear);
    mount.append(head);

    if (n.roleLong || n.role) {
      mount.append(el('p', { class: 'inspector-role', text: n.roleLong || n.role }));
    }

    // Why it is here (editorial audit trail)
    if (n.featuredReason) {
      mount.append(
        el('section', { class: 'inspector-sec' }, [
          el('h4', { text: 'Why it is here' }),
          el('p', { text: n.featuredReason }),
        ])
      );
    }

    // Relationships + evidence
    const rels = edgesFor(id);
    if (rels.length) {
      const rows = rels.map((e) => {
        const otherId = e.source === id ? e.target : e.source;
        const other = nodeById.get(otherId);
        // No direction arrow: the relation verb (in .rel-meta) carries direction, and an arrow would
        // imply a source/target order that doesn't exist for symmetric relations (e.g. partners-with).
        const item = el('li', { class: `rel conf-${e.confidence}` }, [
          el('div', { class: 'rel-head' }, [
            el('button', { class: 'rel-target', type: 'button', 'data-id': otherId }, [
              document.createTextNode(other ? other.name : otherId),
            ]),
            el('span', { class: 'rel-meta', text: `${e.relation} · ${e.pathway}` }),
            confidenceBadge(e.confidence),
          ]),
        ]);
        item
          .querySelector('.rel-target')
          .addEventListener('click', () => setState({ selection: otherId }));
        if (e.evidenceNote) {
          item.append(
            el('p', { class: 'rel-why' }, [
              el('strong', { text: 'Why shown: ' }),
              document.createTextNode(e.evidenceNote),
            ])
          );
        }
        if (e.rationale) {
          item.append(
            el('p', { class: 'rel-rationale' }, [
              el('strong', { text: 'Inferred because: ' }),
              document.createTextNode(e.rationale),
            ])
          );
        }
        if (e.sources && e.sources.length) {
          const srcWrap = el('p', { class: 'rel-src' }, [
            el('span', {
              class: 'src-note',
              text: `${e.confidence} · ${e.sources.length} source${e.sources.length > 1 ? 's' : ''}: `,
            }),
          ]);
          e.sources.forEach((sid, i) => {
            if (i) srcWrap.append(document.createTextNode('; '));
            srcWrap.append(sourceLink(sid));
          });
          item.append(srcWrap);
        }
        return item;
      });
      mount.append(
        el('section', { class: 'inspector-sec' }, [
          el('h4', { text: `Relationships (${rels.length})` }),
          el('ul', { class: 'rel-list' }, rows),
        ])
      );
    } else {
      mount.append(
        el('section', { class: 'inspector-sec' }, [
          el('h4', { text: 'Relationships' }),
          el('p', {
            class: 'muted',
            text: 'No documented relationship is drawn for this node in the current snapshot. Absence of an edge is not a claim that no relationship exists.',
          }),
        ])
      );
    }

    // Node sources
    if (n.sources && n.sources.length) {
      const list = el('ul', { class: 'src-list' });
      for (const sid of n.sources) list.append(el('li', {}, [sourceLink(sid)]));
      mount.append(
        el('section', { class: 'inspector-sec' }, [el('h4', { text: 'Sources' }), list])
      );
    }
  }

  subscribe(render); // cheap enough to re-render on any state change
  render();

  // expose the vocab sets for any external validation/debug (kept minimal)
  return { PATHWAYS, CONFIDENCE };
}
