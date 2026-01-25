// MIDI Visualizer Module
// Displays active MIDI notes in real-time

export default {
  id: "midi-visualizer",
  name: "MIDI Visualizer",
  version: "1.0.0",

  process: (event, params) => {
    // Update visualization
    if (event.type === 'noteon' && event.velocity > 0) {
      params.activeNotes.add(event.note);
      updateVisualization(params);
    } else if (event.type === 'noteoff' || (event.type === 'noteon' && event.velocity === 0)) {
      params.activeNotes.delete(event.note);
      updateVisualization(params);
    }

    return event;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>MIDI Visualizer</h2>
      <div style="background: #0a0a0a; border: 1px solid #00ff00; border-radius: 4px; padding: 10px; min-height: 100px;">
        <canvas id="midi-viz-canvas" width="600" height="100"></canvas>
      </div>
      <div class="control-group" style="margin-top: 10px; font-size: 11px; color: #00aaff;">
        Active notes: <span id="midi-active-notes">None</span>
      </div>
    `,
    bindEvents: (instance, params) => {
      const canvas = document.getElementById('midi-viz-canvas');
      const ctx = canvas.getContext('2d');
      const activeNotesEl = document.getElementById('midi-active-notes');

      // Set canvas size to match container
      canvas.width = canvas.offsetWidth;
      canvas.height = 100;

      params.canvas = canvas;
      params.ctx = ctx;
      params.activeNotesEl = activeNotesEl;

      // Initial draw
      updateVisualization(params);
    }
  },

  state: {
    defaults: {
      activeNotes: new Set(),
      canvas: null,
      ctx: null,
      activeNotesEl: null
    }
  }
};

function updateVisualization(params) {
  if (!params.ctx) return;

  const { ctx, canvas, activeNotes, activeNotesEl } = params;

  // Clear canvas
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw piano roll (C2 to C6 = MIDI 36 to 84)
  const noteRange = 48; // 4 octaves
  const startNote = 36; // C2
  const noteWidth = canvas.width / noteRange;
  const noteHeight = canvas.height;

  // Draw keys
  for (let i = 0; i < noteRange; i++) {
    const midiNote = startNote + i;
    const x = i * noteWidth;
    const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);

    // Draw key outline
    ctx.strokeStyle = isBlackKey ? '#333' : '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 0, noteWidth, noteHeight);

    // Highlight active notes
    if (activeNotes.has(midiNote)) {
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x, 0, noteWidth, noteHeight);

      // Draw note label
      ctx.fillStyle = '#0a0a0a';
      ctx.font = '10px Monaco';
      ctx.textAlign = 'center';
      const noteName = getNoteNameFromMIDI(midiNote);
      ctx.fillText(noteName, x + noteWidth / 2, noteHeight / 2 + 3);
    }
  }

  // Update active notes text
  if (activeNotes.size === 0) {
    activeNotesEl.textContent = 'None';
  } else {
    const noteNames = Array.from(activeNotes)
      .sort((a, b) => a - b)
      .map(n => getNoteNameFromMIDI(n))
      .join(', ');
    activeNotesEl.textContent = noteNames;
  }
}

function getNoteNameFromMIDI(midi) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return `${note}${octave}`;
}
