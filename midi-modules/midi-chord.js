// MIDI Chord Generator Module
// Generates chords from single note inputs

export default {
  id: "midi-chord",
  name: "Chord Generator",
  version: "1.0.0",

  process: (event, params) => {
    if (!params || !params.enabled) return event;
    if (event.type !== 'noteon' && event.type !== 'noteoff') return event;

    const intervals = (params.chordIntervals && params.chordIntervals[params.chordType]) || [0];
    const events = [];

    for (const interval of intervals) {
      events.push({
        ...event,
        note: event.note + interval
      });
    }

    return events;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Chord Generator</h2>
      <div class="control-group">
        <label class="control-label">
          <input type="checkbox" id="chord-enabled"> Enabled
        </label>
      </div>
      <div class="control-group">
        <label class="control-label">
          Chord Type
        </label>
        <select id="chord-type">
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="maj7">Major 7th</option>
          <option value="min7">Minor 7th</option>
          <option value="dom7">Dominant 7th</option>
          <option value="maj9">Major 9th</option>
          <option value="min9">Minor 9th</option>
          <option value="sus2">Sus2</option>
          <option value="sus4">Sus4</option>
          <option value="dim">Diminished</option>
          <option value="aug">Augmented</option>
          <option value="power">Power Chord</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Inversion <span class="control-value" id="chord-inversion-value">0</span>
        </label>
        <input type="range" id="chord-inversion" min="0" max="3" value="0">
      </div>
    `,
    bindEvents: (instance, params) => {
      const enabledCheckbox = document.getElementById('chord-enabled');
      enabledCheckbox.addEventListener('change', (e) => {
        params.enabled = e.target.checked;
      });

      const typeSelect = document.getElementById('chord-type');
      typeSelect.addEventListener('change', (e) => {
        params.chordType = e.target.value;
      });

      const inversionSlider = document.getElementById('chord-inversion');
      const inversionValue = document.getElementById('chord-inversion-value');
      inversionSlider.addEventListener('input', (e) => {
        params.inversion = parseInt(e.target.value);
        inversionValue.textContent = e.target.value;
        // Apply inversion to current chord intervals
        // (implementation would rotate the intervals)
      });
    }
  },

  state: {
    defaults: {
      enabled: false,
      chordType: 'major',
      inversion: 0,
      chordIntervals: {
        'major': [0, 4, 7],
        'minor': [0, 3, 7],
        'maj7': [0, 4, 7, 11],
        'min7': [0, 3, 7, 10],
        'dom7': [0, 4, 7, 10],
        'maj9': [0, 4, 7, 11, 14],
        'min9': [0, 3, 7, 10, 14],
        'sus2': [0, 2, 7],
        'sus4': [0, 5, 7],
        'dim': [0, 3, 6],
        'aug': [0, 4, 8],
        'power': [0, 7]
      }
    }
  }
};
