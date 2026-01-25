// MIDI Binary Spiral Sequencer Module
// Circular sequencer with power-of-2 concentric rings creating polyrhythmic patterns

export default {
  id: "midi-binary-spiral",
  name: "Binary Spiral Sequencer",
  version: "1.0.0",

  process: (event, params) => {
    // Pass through events (this module generates its own)
    return event;
  },

  ui: {
    container: "midi-controls",
    template: `
      <h2>Binary Spiral Sequencer</h2>

      <!-- Canvas for circular visualization -->
      <canvas id="binary-spiral-canvas" width="400" height="400"
        style="border: 1px solid #00ff00; background: #0a0a0a; display: block; margin: 10px auto; cursor: crosshair;">
      </canvas>

      <div class="control-group">
        <button id="spiral-play" class="seq-transport-btn">Play</button>
        <button id="spiral-stop" class="seq-transport-btn">Stop</button>
        <button id="spiral-clear" class="seq-transport-btn">Clear Pattern</button>
        <button id="spiral-random" class="seq-transport-btn">Random</button>
      </div>

      <div class="control-group">
        <label class="control-label">
          Rings: <span class="control-value" id="spiral-rings-value">5</span>
        </label>
        <input type="range" id="spiral-rings" min="3" max="8" value="5">
      </div>

      <div class="control-group">
        <label class="control-label">
          BPM: <span class="control-value" id="spiral-bpm-value">120</span>
        </label>
        <input type="range" id="spiral-bpm" min="60" max="200" value="120">
      </div>

      <div class="control-group">
        <label class="control-label">
          Root Note: <span class="control-value" id="spiral-note-value">C4 (60)</span>
        </label>
        <input type="range" id="spiral-note" min="36" max="72" value="60">
      </div>

      <div class="control-group">
        <label class="control-label">
          Scale: <span class="control-value" id="spiral-scale-value">Chromatic</span>
        </label>
        <select id="spiral-scale">
          <option value="chromatic">Chromatic</option>
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="pentatonic">Pentatonic</option>
          <option value="wholetone">Whole Tone</option>
        </select>
      </div>
    `,
    bindEvents: (instance, params) => {
      let playing = false;
      let intervalId = null;
      let currentRing = 0;
      let currentStep = 0;

      const canvas = document.getElementById('binary-spiral-canvas');
      const ctx = canvas.getContext('2d');
      const playBtn = document.getElementById('spiral-play');
      const stopBtn = document.getElementById('spiral-stop');
      const clearBtn = document.getElementById('spiral-clear');
      const randomBtn = document.getElementById('spiral-random');
      const ringsSlider = document.getElementById('spiral-rings');
      const ringsValue = document.getElementById('spiral-rings-value');
      const bpmSlider = document.getElementById('spiral-bpm');
      const bpmValue = document.getElementById('spiral-bpm-value');
      const noteSlider = document.getElementById('spiral-note');
      const noteValue = document.getElementById('spiral-note-value');
      const scaleSelect = document.getElementById('spiral-scale');
      const scaleValue = document.getElementById('spiral-scale-value');

      // Initialize parameters
      params.rings = params.rings || 5;
      params.bpm = params.bpm || 120;
      params.rootNote = params.rootNote || 60;
      params.scale = params.scale || 'chromatic';
      params.pattern = params.pattern || new Array(8).fill(null).map(() => new Array(128).fill(false));

      // Scale definitions (intervals from root)
      const scales = {
        chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        pentatonic: [0, 2, 4, 7, 9],
        wholetone: [0, 2, 4, 6, 8, 10]
      };

      // Get note name from MIDI number
      const getNoteNameFromMIDI = (midi) => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const note = notes[midi % 12];
        return `${note}${octave}`;
      };

      // Get note for ring using scale
      const getNoteForRing = (ring) => {
        const scaleIntervals = scales[params.scale];
        const scaleIndex = ring % scaleIntervals.length;
        const octaveShift = Math.floor(ring / scaleIntervals.length) * 12;
        return params.rootNote + scaleIntervals[scaleIndex] + octaveShift;
      };

      // Initialize UI
      ringsSlider.value = params.rings;
      ringsValue.textContent = params.rings;
      bpmSlider.value = params.bpm;
      bpmValue.textContent = params.bpm;
      noteSlider.value = params.rootNote;
      noteValue.textContent = `${getNoteNameFromMIDI(params.rootNote)} (${params.rootNote})`;
      scaleSelect.value = params.scale;

      // Draw spiral visualization
      const drawSpiral = () => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw rings from outer to inner for better layering
        for (let ring = params.rings - 1; ring >= 0; ring--) {
          const innerRadius = ring * (maxRadius / params.rings);
          const outerRadius = (ring + 1) * (maxRadius / params.rings);
          const radius = (innerRadius + outerRadius) / 2;
          const steps = Math.pow(2, ring);
          const angleStep = (Math.PI * 2) / steps;

          // Draw ring circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Draw each step in ring
          for (let step = 0; step < steps; step++) {
            const angle = step * angleStep - Math.PI / 2; // Start from top
            const isActive = params.pattern[ring][step];
            const isCurrent = playing && (ring === currentRing && step === currentStep);

            // Draw step marker
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);

            // Color based on state
            if (isCurrent) {
              ctx.fillStyle = '#ffaa00'; // Orange for current
              ctx.strokeStyle = '#ffaa00';
            } else if (isActive) {
              ctx.fillStyle = '#00ff00'; // Bright green for active
              ctx.strokeStyle = '#00ff00';
            } else {
              ctx.fillStyle = '#0a0a0a'; // Dark for inactive
              ctx.strokeStyle = '#2a2a2a'; // Dim border
            }

            ctx.fill();
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw step divisions
            if (!isActive && !isCurrent) {
              ctx.beginPath();
              ctx.moveTo(
                centerX + Math.cos(angle) * innerRadius,
                centerY + Math.sin(angle) * innerRadius
              );
              ctx.lineTo(
                centerX + Math.cos(angle) * outerRadius,
                centerY + Math.sin(angle) * outerRadius
              );
              ctx.strokeStyle = '#1a1a1a';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Draw center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff00';
        ctx.fill();

        // Draw ring numbers
        ctx.fillStyle = '#00ff00';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let ring = 0; ring < params.rings; ring++) {
          const radius = (ring + 0.5) * (maxRadius / params.rings);
          const steps = Math.pow(2, ring);
          ctx.fillText(`${steps}`, centerX + radius, centerY - 5);
        }
      };

      // Convert canvas click to ring/step
      const getClickedStep = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + Math.PI / 2; // Offset to start from top
        const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;

        // Determine ring
        const ring = Math.floor(distance / (maxRadius / params.rings));
        if (ring < 0 || ring >= params.rings) return null;

        // Determine step
        const steps = Math.pow(2, ring);
        const step = Math.floor((normalizedAngle / (Math.PI * 2)) * steps);

        return { ring, step };
      };

      // Canvas click handler
      canvas.addEventListener('click', (e) => {
        const clicked = getClickedStep(e.clientX, e.clientY);
        if (clicked) {
          params.pattern[clicked.ring][clicked.step] = !params.pattern[clicked.ring][clicked.step];
          drawSpiral();
        }
      });

      // Sequencer logic
      const startSequencer = () => {
        const stepDuration = (60 / params.bpm) * 1000; // ms per beat
        currentRing = 0;
        currentStep = 0;

        intervalId = setInterval(() => {
          const stepsInRing = Math.pow(2, currentRing);

          // Trigger note if step is active
          if (params.pattern[currentRing][currentStep]) {
            const note = getNoteForRing(currentRing);
            if (window.MIDICore && window.MIDICore.instance) {
              const noteDuration = stepDuration * 0.8;
              window.MIDICore.instance.triggerNote(note, 100, noteDuration);
            }
          }

          // Advance step
          currentStep = (currentStep + 1) % stepsInRing;

          // Move to next ring when step wraps
          if (currentStep === 0) {
            currentRing = (currentRing + 1) % params.rings;
          }

          // Redraw
          drawSpiral();
        }, stepDuration);

        playing = true;
      };

      const stopSequencer = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        playing = false;
        currentRing = 0;
        currentStep = 0;
        drawSpiral();
      };

      // Event handlers
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
        params.pattern = new Array(8).fill(null).map(() => new Array(128).fill(false));
        drawSpiral();
      });

      randomBtn.addEventListener('click', () => {
        params.pattern = new Array(8).fill(null).map((_, ring) => {
          const steps = Math.pow(2, ring);
          return new Array(128).fill(false).map((_, step) => {
            return step < steps ? Math.random() > 0.7 : false;
          });
        });
        drawSpiral();
      });

      ringsSlider.addEventListener('input', (e) => {
        params.rings = parseInt(e.target.value);
        ringsValue.textContent = params.rings;
        if (playing) {
          stopSequencer();
          startSequencer();
        } else {
          drawSpiral();
        }
      });

      bpmSlider.addEventListener('input', (e) => {
        params.bpm = parseInt(e.target.value);
        bpmValue.textContent = params.bpm;
        if (playing) {
          stopSequencer();
          startSequencer();
        }
      });

      noteSlider.addEventListener('input', (e) => {
        params.rootNote = parseInt(e.target.value);
        noteValue.textContent = `${getNoteNameFromMIDI(params.rootNote)} (${params.rootNote})`;
      });

      scaleSelect.addEventListener('change', (e) => {
        params.scale = e.target.value;
        scaleValue.textContent = e.target.options[e.target.selectedIndex].text;
      });

      // Store cleanup function
      instance.cleanup = stopSequencer;

      // Initial draw
      drawSpiral();
    }
  },

  state: {
    defaults: {
      rings: 5,
      bpm: 120,
      rootNote: 60,
      scale: 'chromatic',
      pattern: (() => {
        // Create default pattern with some active steps for immediate playback
        const p = new Array(8).fill(null).map(() => new Array(128).fill(false));
        // Ring 0 (1 beat): 1 step active
        p[0][0] = true;
        // Ring 1 (2 beats): 2 steps active
        p[1][0] = true;
        p[1][1] = true;
        // Ring 2 (4 beats): 2 steps active (0, 2)
        p[2][0] = true;
        p[2][2] = true;
        // Ring 3 (8 beats): 4 steps active (0, 2, 5, 7)
        p[3][0] = true;
        p[3][2] = true;
        p[3][5] = true;
        p[3][7] = true;
        // Ring 4 (16 beats): Euclidean (5, 16)
        p[4][0] = true;
        p[4][3] = true;
        p[4][6] = true;
        p[4][10] = true;
        p[4][13] = true;
        return p;
      })()
    }
  }
};
