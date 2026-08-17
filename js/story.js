// story.js — guided story mode. A THIN layer over existing state: it steps through the structural
// layers, emphasising one ring at a time (via a data attribute the CSS dims around) and focusing
// NSAS at the start. No second rendering engine, no extra data — a guided reading of the same model.

import { LAYERS } from './config.js';
import { setState } from './state.js';
import { icon } from './icons.js';

const txt = (s) => document.createTextNode(s);

const STEPS = [
  {
    ring: 0,
    title: 'Start at NSAS',
    body: 'The national space agency sits at the centre — it coordinates the ecosystem and develops the industry.',
  },
  {
    ring: 1,
    title: LAYERS[1].label,
    body: 'Government agencies and national programmes: the coordination and funding infrastructure (MTI, EDB, OSTIn→NSAS, CAAS, MPA, ESG, IMDA, and the STDP).',
  },
  {
    ring: 2,
    title: LAYERS[2].label,
    body: 'Where capability comes from: universities and research institutions that design, build and de-risk space technology.',
  },
  {
    ring: 3,
    title: LAYERS[3].label,
    body: 'Where it commercialises: companies grouped by what they do — manufacturing, propulsion, communications, geospatial, quantum and launch.',
  },
  {
    ring: 4,
    title: LAYERS[4].label,
    body: 'How Singapore connects outward: international agencies, partners and memberships.',
  },
];

export function initStory({ startBtn, panel, caption, prevBtn, nextBtn, exitBtn, svg }) {
  let step = -1;

  // Static control content: the words carry the accessible name; icons are decorative.
  startBtn.replaceChildren(txt('Guided tour'), icon('play'));
  prevBtn.replaceChildren(icon('arrow-left'), txt('Back'));

  function apply() {
    const active = step >= 0;
    panel.hidden = !active;
    startBtn.hidden = active;
    if (!active) {
      svg.removeAttribute('data-story-ring');
      setState({ story: null });
      return;
    }
    const s = STEPS[step];
    svg.setAttribute('data-story-ring', String(s.ring));
    caption.replaceChildren();
    caption.append(
      Object.assign(document.createElement('h4'), {
        textContent: `${step + 1}/${STEPS.length} · ${s.title}`,
      }),
      Object.assign(document.createElement('p'), { textContent: s.body })
    );
    if (s.ring === 0) setState({ selection: 'nsas', story: step });
    else setState({ selection: null, story: step });
    prevBtn.disabled = step === 0;
    if (step === STEPS.length - 1) nextBtn.replaceChildren(txt('Finish'));
    else nextBtn.replaceChildren(txt('Next'), icon('arrow-right'));
  }

  // E1: keep keyboard focus continuous. Starting the tour hides the start button (dropping focus to
  // <body>), so move focus into the panel; ending it returns focus to the start button.
  startBtn.addEventListener('click', () => {
    step = 0;
    apply();
    nextBtn.focus();
  });
  nextBtn.addEventListener('click', () => {
    if (step >= STEPS.length - 1) {
      step = -1;
      apply();
      startBtn.focus(); // Finish → tour closed, return to the (now visible) start button
    } else {
      step += 1;
      apply();
    }
  });
  prevBtn.addEventListener('click', () => {
    if (step > 0) step -= 1;
    apply();
    if (prevBtn.disabled) nextBtn.focus(); // Back becomes disabled at step 0 → move focus off it
  });
  exitBtn.addEventListener('click', () => {
    step = -1;
    apply();
    startBtn.focus();
  });
  apply();
}
