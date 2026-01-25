// Probabilistic Non-Linear MIDI Arpeggiator
// Generates evolving arpeggio patterns with probability-based note selection and non-linear timing

export default {
  id: "midi-arpeggiator",
  name: "Probabilistic Arpeggiator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Pass-through nodes (arpeggiator triggers notes, doesn't process audio)
      const input = ctx.createGain();
      const output = ctx.createGain();

      input.connect(output);

      // Arpeggiator state
      const state = {
        isRunning: false,
        intervalId: null,
        currentStep: 0,
        heldNotes: new Set(),
        octavePattern: [0, 12, 24, 12], // octave shifts
        patternIndex: 0,
        lastTriggerTime: 0,
        currentOscillator: null,
        envelope: null
      };

      return {
        input: input,
        output: output,
        nodes: {
          passthrough: input
        },
        arpState: state
      };
    },
    insertionPoint: "pre-gain",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Probabilistic Arpeggiator</h2>

      <div class="control-group">
        <label class="control-label">
          Rate <span class="control-value" id="arp-rate-value">120 BPM</span>
        </label>
        <input type="range" id="arp-rate" min="40" max="300" value="120">
      </div>

      <div class="control-group">
        <label class="control-label">
          Probability <span class="control-value" id="arp-probability-value">80%</span>
        </label>
        <input type="range" id="arp-probability" min="0" max="100" value="80">
      </div>

      <div class="control-group">
        <label class="control-label">
          Chaos <span class="control-value" id="arp-chaos-value">30%</span>
        </label>
        <input type="range" id="arp-chaos" min="0" max="100" value="30">
      </div>

      <div class="control-group">
        <label class="control-label">
          Octave Range <span class="control-value" id="arp-octaves-value">2</span>
        </label>
        <input type="range" id="arp-octaves" min="1" max="4" value="2">
      </div>

      <div class="control-group">
        <label class="control-label">
          Gate Length <span class="control-value" id="arp-gate-value">50%</span>
        </label>
        <input type="range" id="arp-gate" min="5" max="95" value="50">
      </div>

      <div class="control-group">
        <label class="control-label">
          Pattern Mode
        </label>
        <select id="arp-pattern" style="width: 100%; padding: 8px; background: #1a1a1a; color: #00ff00; border: 1px solid #00ff00; font-family: 'Courier New', monospace;">
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="updown">Up-Down</option>
          <option value="random" selected>Random</option>
          <option value="drunk">Drunk Walk</option>
        </select>
      </div>

      <div class="control-group">
        <button id="arp-toggle" style="width: 100%; padding: 12px; background: #1a1a1a; color: #00ff00; border: 2px solid #00ff00; font-family: 'Courier New', monospace; font-size: 16px; cursor: pointer; font-weight: bold;">
          START ARPEGGIATOR
        </button>
      </div>

      <div style="margin-top: 10px; padding: 10px; background: #1a1a1a; border: 1px solid #00ff00; font-family: 'Courier New', monospace; font-size: 11px; color: #00ff00;">
        <div>Status: <span id="arp-status">STOPPED</span></div>
        <div>Notes Held: <span id="arp-notes-count">0</span></div>
        <div>Current Step: <span id="arp-step">0</span></div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const state = audioNodes.arpState;
      let bpm = 120;
      let probability = 0.8;
      let chaos = 0.3;
      let gateLength = 0.5;
      let patternMode = 'random';
      let octaveRange = 2;
      let drunkWalkPosition = 0;

      // Get audio context from the nodes
      const ctx = audioNodes.input.context;

      // Note frequency helper
      const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

      // Trigger a note
      const triggerNote = (frequency, duration) => {
        const now = ctx.currentTime;

        // Create oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = frequency;

        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.005); // Fast attack
        gain.gain.linearRampToValueAtTime(0.1, now + duration * 0.3); // Decay
        gain.gain.linearRampToValueAtTime(0.05, now + duration); // Sustain
        gain.gain.linearRampToValueAtTime(0, now + duration + 0.01); // Release

        osc.connect(gain);
        gain.connect(audioNodes.output);

        osc.start(now);
        osc.stop(now + duration + 0.02);

        // Cleanup
        setTimeout(() => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        }, (duration + 0.1) * 1000);
      };

      // Arpeggiator step function
      const arpStep = () => {
        if (!state.isRunning || state.heldNotes.size === 0) return;

        const notesArray = Array.from(state.heldNotes);

        // Apply probability - skip this step randomly
        if (Math.random() > probability) {
          state.currentStep = (state.currentStep + 1) % notesArray.length;
          document.getElementById('arp-step').textContent = state.currentStep;
          return;
        }

        let noteIndex;

        // Select note based on pattern mode
        switch (patternMode) {
          case 'up':
            noteIndex = state.currentStep % notesArray.length;
            state.currentStep++;
            break;

          case 'down':
            noteIndex = (notesArray.length - 1 - (state.currentStep % notesArray.length));
            state.currentStep++;
            break;

          case 'updown':
            const updownLength = notesArray.length * 2 - 2;
            const step = state.currentStep % updownLength;
            noteIndex = step < notesArray.length ? step : (updownLength - step);
            state.currentStep++;
            break;

          case 'drunk':
            // Drunk walk - random walk through the note array
            const drunkStep = Math.random() < 0.5 ? -1 : 1;
            drunkWalkPosition = Math.max(0, Math.min(notesArray.length - 1, drunkWalkPosition + drunkStep));
            noteIndex = drunkWalkPosition;
            state.currentStep++;
            break;

          case 'random':
          default:
            noteIndex = Math.floor(Math.random() * notesArray.length);
            state.currentStep++;
            break;
        }

        // Get base MIDI note
        let midiNote = notesArray[noteIndex];

        // Apply octave shift based on pattern
        const octaveStep = state.patternIndex % (octaveRange * 2);
        const octaveShift = octaveStep < octaveRange ? octaveStep * 12 : (octaveRange * 2 - octaveStep - 1) * 12;
        midiNote += octaveShift;

        state.patternIndex++;

        // Apply chaos - random pitch deviation
        const chaosAmount = Math.random() < chaos ? (Math.random() - 0.5) * chaos * 12 : 0;
        midiNote += chaosAmount;

        // Convert to frequency
        const frequency = midiToFreq(midiNote);

        // Calculate note duration with non-linear timing variation
        const baseInterval = 60 / bpm; // seconds per beat
        const timingVariation = chaos * (Math.random() - 0.5) * 0.5;
        const noteDuration = baseInterval * gateLength * (1 + timingVariation);

        // Trigger the note
        triggerNote(frequency, noteDuration);

        // Update UI
        document.getElementById('arp-step').textContent = state.currentStep;
      };

      // Start/Stop arpeggiator
      const toggleArp = () => {
        state.isRunning = !state.isRunning;

        const button = document.getElementById('arp-toggle');
        const status = document.getElementById('arp-status');

        if (state.isRunning) {
          button.textContent = 'STOP ARPEGGIATOR';
          button.style.background = '#003300';
          status.textContent = 'RUNNING';

          // Start the clock
          const interval = (60 / bpm) * 1000; // milliseconds
          state.intervalId = setInterval(() => {
            // Non-linear timing - add micro-variations
            const jitter = chaos * (Math.random() - 0.5) * 20;
            setTimeout(() => arpStep(), jitter);
          }, interval);

          // Immediate first step
          arpStep();
        } else {
          button.textContent = 'START ARPEGGIATOR';
          button.style.background = '#1a1a1a';
          status.textContent = 'STOPPED';

          if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
          }
          state.currentStep = 0;
          state.patternIndex = 0;
        }
      };

      // Simulate MIDI input (for demo - in real implementation would come from MIDI controller)
      const simulateNoteOn = (midiNote) => {
        state.heldNotes.add(midiNote);
        document.getElementById('arp-notes-count').textContent = state.heldNotes.size;
      };

      const simulateNoteOff = (midiNote) => {
        state.heldNotes.delete(midiNote);
        document.getElementById('arp-notes-count').textContent = state.heldNotes.size;
      };

      // Initialize with a C major chord (for demo purposes)
      simulateNoteOn(60); // C4
      simulateNoteOn(64); // E4
      simulateNoteOn(67); // G4

      // Rate control
      document.getElementById('arp-rate').addEventListener('input', (e) => {
        bpm = parseFloat(e.target.value);
        params.rate = bpm;
        document.getElementById('arp-rate-value').textContent = Math.round(bpm) + ' BPM';

        // Restart clock if running
        if (state.isRunning && state.intervalId) {
          clearInterval(state.intervalId);
          const interval = (60 / bpm) * 1000;
          state.intervalId = setInterval(() => {
            const jitter = chaos * (Math.random() - 0.5) * 20;
            setTimeout(() => arpStep(), jitter);
          }, interval);
        }
      });

      // Probability control
      document.getElementById('arp-probability').addEventListener('input', (e) => {
        probability = parseFloat(e.target.value) / 100;
        params.probability = probability;
        document.getElementById('arp-probability-value').textContent = e.target.value + '%';
      });

      // Chaos control
      document.getElementById('arp-chaos').addEventListener('input', (e) => {
        chaos = parseFloat(e.target.value) / 100;
        params.chaos = chaos;
        document.getElementById('arp-chaos-value').textContent = e.target.value + '%';
      });

      // Octave range control
      document.getElementById('arp-octaves').addEventListener('input', (e) => {
        octaveRange = parseInt(e.target.value);
        params.octaves = octaveRange;
        document.getElementById('arp-octaves-value').textContent = octaveRange;
      });

      // Gate length control
      document.getElementById('arp-gate').addEventListener('input', (e) => {
        gateLength = parseFloat(e.target.value) / 100;
        params.gate = gateLength;
        document.getElementById('arp-gate-value').textContent = e.target.value + '%';
      });

      // Pattern mode control
      document.getElementById('arp-pattern').addEventListener('change', (e) => {
        patternMode = e.target.value;
        params.pattern = patternMode;
        state.currentStep = 0;
        state.patternIndex = 0;
        drunkWalkPosition = 0;
      });

      // Toggle button
      document.getElementById('arp-toggle').addEventListener('click', toggleArp);
    }
  },

  state: {
    defaults: {
      rate: 120,
      probability: 0.8,
      chaos: 0.3,
      octaves: 2,
      gate: 0.5,
      pattern: 'random'
    },
    save: (params) => ({
      rate: params.rate,
      probability: params.probability,
      chaos: params.chaos,
      octaves: params.octaves,
      gate: params.gate,
      pattern: params.pattern
    }),
    load: (params, saved, audioNodes) => {
      if (saved.rate !== undefined) {
        params.rate = saved.rate;
        document.getElementById('arp-rate').value = saved.rate;
        document.getElementById('arp-rate-value').textContent = Math.round(saved.rate) + ' BPM';
      }
      if (saved.probability !== undefined) {
        params.probability = saved.probability;
        document.getElementById('arp-probability').value = saved.probability * 100;
        document.getElementById('arp-probability-value').textContent = Math.round(saved.probability * 100) + '%';
      }
      if (saved.chaos !== undefined) {
        params.chaos = saved.chaos;
        document.getElementById('arp-chaos').value = saved.chaos * 100;
        document.getElementById('arp-chaos-value').textContent = Math.round(saved.chaos * 100) + '%';
      }
      if (saved.octaves !== undefined) {
        params.octaves = saved.octaves;
        document.getElementById('arp-octaves').value = saved.octaves;
        document.getElementById('arp-octaves-value').textContent = saved.octaves;
      }
      if (saved.gate !== undefined) {
        params.gate = saved.gate;
        document.getElementById('arp-gate').value = saved.gate * 100;
        document.getElementById('arp-gate-value').textContent = Math.round(saved.gate * 100) + '%';
      }
      if (saved.pattern !== undefined) {
        params.pattern = saved.pattern;
        document.getElementById('arp-pattern').value = saved.pattern;
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Arpeggiator] Probabilistic non-linear MIDI arpeggiator loaded');
    },
    onConnect: (ctx) => {
      console.log('[Arpeggiator] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Arpeggiator] Module unloading');
    }
  }
};
