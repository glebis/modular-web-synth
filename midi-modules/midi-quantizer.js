// MIDI Note Quantizer Module
// Snaps notes to specified scale/key

export default {
  id: "midi-quantizer",
  name: "Note Quantizer",
  version: "1.0.0",

  process: (event, params) => {
    if (!params || !params.enabled) return event;
    if (event.type !== 'noteon' && event.type !== 'noteoff') return event;

    const scale = (params.scales && params.scales[params.scaleType]) || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const noteInOctave = event.note % 12;
    const octave = Math.floor(event.note / 12);
    const rootOffset = params.rootNote || 0;

    // Find closest note in scale
    let closestNote = scale[0];
    let minDistance = Math.abs(noteInOctave - ((scale[0] + rootOffset) % 12));

    for (const scaleNote of scale) {
      const targetNote = (scaleNote + rootOffset) % 12;
      const distance = Math.abs(noteInOctave - targetNote);
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = scaleNote;
      }
    }

    const quantizedNote = octave * 12 + ((closestNote + rootOffset) % 12);

    return {
      ...event,
      note: quantizedNote
    };
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Note Quantizer</h2>
      <div class="control-group">
        <label class="control-label">
          <input type="checkbox" id="quant-enabled"> Enabled
        </label>
      </div>
      <div class="control-group">
        <label class="control-label">
          Root Note
        </label>
        <select id="quant-root">
          <option value="0">C</option>
          <option value="1">C#/Db</option>
          <option value="2">D</option>
          <option value="3">D#/Eb</option>
          <option value="4">E</option>
          <option value="5">F</option>
          <option value="6">F#/Gb</option>
          <option value="7">G</option>
          <option value="8">G#/Ab</option>
          <option value="9">A</option>
          <option value="10">A#/Bb</option>
          <option value="11">B</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Scale
        </label>
        <select id="quant-scale">
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="harmonic">Harmonic Minor</option>
          <option value="melodic">Melodic Minor</option>
          <option value="dorian">Dorian</option>
          <option value="phrygian">Phrygian</option>
          <option value="lydian">Lydian</option>
          <option value="mixolydian">Mixolydian</option>
          <option value="pentatonic">Pentatonic Major</option>
          <option value="pentatonic-minor">Pentatonic Minor</option>
          <option value="blues">Blues</option>
          <option value="chromatic">Chromatic (all notes)</option>
        </select>
      </div>
    `,
    bindEvents: (instance, params) => {
      const enabledCheckbox = document.getElementById('quant-enabled');
      enabledCheckbox.addEventListener('change', (e) => {
        params.enabled = e.target.checked;
      });

      const rootSelect = document.getElementById('quant-root');
      rootSelect.addEventListener('change', (e) => {
        params.rootNote = parseInt(e.target.value);
      });

      const scaleSelect = document.getElementById('quant-scale');
      scaleSelect.addEventListener('change', (e) => {
        params.scaleType = e.target.value;
      });
    }
  },

  state: {
    defaults: {
      enabled: false,
      rootNote: 0, // C
      scaleType: 'major',
      scales: {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'harmonic': [0, 2, 3, 5, 7, 8, 11],
        'melodic': [0, 2, 3, 5, 7, 9, 11],
        'dorian': [0, 2, 3, 5, 7, 9, 10],
        'phrygian': [0, 1, 3, 5, 7, 8, 10],
        'lydian': [0, 2, 4, 6, 7, 9, 11],
        'mixolydian': [0, 2, 4, 5, 7, 9, 10],
        'pentatonic': [0, 2, 4, 7, 9],
        'pentatonic-minor': [0, 3, 5, 7, 10],
        'blues': [0, 3, 5, 6, 7, 10],
        'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      }
    }
  }
};
