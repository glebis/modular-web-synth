// MIDI Step Sequencer Module
// Generates rhythmic note patterns

export default {
  id: "midi-sequencer",
  name: "Step Sequencer",
  version: "1.0.0",

  process: (event, params) => {
    // Sequencer generates its own events on clock tick
    // Pass through incoming events
    return event;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Step Sequencer</h2>
      <div class="control-group">
        <button id="seq-play" class="seq-transport-btn">Play</button>
        <button id="seq-stop" class="seq-transport-btn">Stop</button>
        <button id="seq-clear" class="seq-transport-btn">Clear</button>
      </div>
      <div class="control-group">
        <label class="control-label">
          Steps: <span class="control-value" id="seq-steps-value">16</span>
        </label>
        <select id="seq-steps">
          <option value="8">8</option>
          <option value="16" selected>16</option>
          <option value="32">32</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          BPM <span class="control-value" id="seq-bpm-value">120</span>
        </label>
        <input type="range" id="seq-bpm" min="60" max="200" value="120">
      </div>
      <div class="control-group">
        <label class="control-label">
          Note <span class="control-value" id="seq-note-value">C4 (60)</span>
        </label>
        <input type="range" id="seq-note" min="36" max="84" value="60">
      </div>
      <div id="seq-grid" style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; margin-top: 10px;">
        <!-- Step buttons will be inserted here -->
      </div>
    `,
    bindEvents: (instance, params) => {
      let playing = false;
      let currentStep = 0;
      let intervalId = null;

      // Ensure params are initialized with defaults
      params.bpm = typeof params.bpm === 'number' && !isNaN(params.bpm) ? params.bpm : 120;
      params.note = typeof params.note === 'number' && !isNaN(params.note) ? params.note : 60;
      params.steps = Array.isArray(params.steps) ? params.steps : new Array(16).fill(false);

      const playBtn = document.getElementById('seq-play');
      const stopBtn = document.getElementById('seq-stop');
      const clearBtn = document.getElementById('seq-clear');
      const bpmSlider = document.getElementById('seq-bpm');
      const bpmValue = document.getElementById('seq-bpm-value');
      const noteSlider = document.getElementById('seq-note');
      const noteValue = document.getElementById('seq-note-value');
      const stepsSelect = document.getElementById('seq-steps');
      const grid = document.getElementById('seq-grid');

      // Set initial note display
      const getNoteNameFromMIDI = (midi) => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const note = notes[midi % 12];
        return `${note}${octave}`;
      };

      // Initialize UI with current values
      bpmSlider.value = params.bpm;
      bpmValue.textContent = params.bpm;
      noteSlider.value = params.note;
      noteValue.textContent = `${getNoteNameFromMIDI(params.note)} (${params.note})`;

      // Initialize step grid
      const initGrid = (numSteps) => {
        grid.innerHTML = '';
        params.steps = new Array(numSteps).fill(false);

        for (let i = 0; i < numSteps; i++) {
          const btn = document.createElement('button');
          btn.className = 'seq-step-btn';
          btn.textContent = (i + 1).toString();
          btn.dataset.step = i;
          btn.style.width = '100%';
          btn.style.padding = '10px 5px';

          btn.addEventListener('click', () => {
            params.steps[i] = !params.steps[i];
            btn.style.background = params.steps[i] ? '#00ff00' : '#0a0a0a';
            btn.style.color = params.steps[i] ? '#0a0a0a' : '#00ff00';
          });

          grid.appendChild(btn);
        }
      };

      initGrid(16);

      // BPM control
      bpmSlider.addEventListener('input', (e) => {
        params.bpm = parseInt(e.target.value);
        bpmValue.textContent = e.target.value;

        // Restart if playing
        if (playing) {
          stopSequencer();
          startSequencer();
        }
      });

      // Note control
      noteSlider.addEventListener('input', (e) => {
        params.note = parseInt(e.target.value);
        const noteName = getNoteNameFromMIDI(params.note);
        noteValue.textContent = `${noteName} (${params.note})`;
      });

      // Steps control
      stepsSelect.addEventListener('change', (e) => {
        const numSteps = parseInt(e.target.value);
        initGrid(numSteps);
        document.getElementById('seq-steps-value').textContent = numSteps;
      });

      const startSequencer = () => {
        const stepDuration = (60 / params.bpm) * 1000 / 4; // 16th notes

        intervalId = setInterval(() => {
          // Highlight current step
          const buttons = grid.querySelectorAll('button');
          buttons.forEach((btn, i) => {
            if (i === currentStep) {
              btn.style.borderColor = '#ffaa00';
              btn.style.borderWidth = '2px';
            } else {
              btn.style.borderColor = '#00ff00';
              btn.style.borderWidth = '1px';
            }
          });

          // Trigger note if step is active
          if (params.steps[currentStep]) {
            if (window.MIDICore && window.MIDICore.instance) {
              // Ensure note is a valid number
              let note = params.note;
              if (typeof note !== 'number' || isNaN(note)) {
                console.warn('[Sequencer] Invalid note value:', note, 'using default 60');
                note = 60;
                params.note = 60; // Fix the param
              }

              // Trigger note with duration to auto-release
              const noteDuration = stepDuration * 0.8; // 80% of step duration
              window.MIDICore.instance.triggerNote(note, 100, noteDuration);
            }
          }

          currentStep = (currentStep + 1) % params.steps.length;
        }, stepDuration);

        playing = true;
      };

      const stopSequencer = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        playing = false;
        currentStep = 0;

        // Reset button borders
        const buttons = grid.querySelectorAll('button');
        buttons.forEach(btn => {
          btn.style.borderColor = '#00ff00';
          btn.style.borderWidth = '1px';
        });
      };

      playBtn.addEventListener('click', () => {
        if (!playing) {
          startSequencer();
          playBtn.style.background = '#ffaa00';
          playBtn.style.color = '#0a0a0a';
        }
      });

      stopBtn.addEventListener('click', () => {
        stopSequencer();
        playBtn.style.background = '#0a0a0a';
        playBtn.style.color = '#00ff00';
      });

      clearBtn.addEventListener('click', () => {
        params.steps.fill(false);
        const buttons = grid.querySelectorAll('button');
        buttons.forEach(btn => {
          btn.style.background = '#0a0a0a';
          btn.style.color = '#00ff00';
        });
      });

      // Store cleanup function
      instance.cleanup = stopSequencer;
    }
  },

  state: {
    defaults: {
      bpm: 120,
      note: 60,
      steps: new Array(16).fill(false)
    }
  }
};
