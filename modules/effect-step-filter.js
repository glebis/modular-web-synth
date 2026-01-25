// Step sequencer that controls filter cutoff synced to tempo

export default {
  id: "effect-step-filter",
  name: "Step Filter Sequencer",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create filter node
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;

      // Sequencer state
      const sequencer = {
        steps: [2000, 1500, 1000, 800, 1200, 1800, 1400, 1000], // 8 steps
        currentStep: 0,
        bpm: 120,
        stepsPerBeat: 4, // 16th notes
        intervalId: null,
        isRunning: false
      };

      return {
        input: filter,
        output: filter,
        nodes: { filter },
        sequencer
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Step Filter Sequencer</h2>
      <div class="control-group">
        <label class="control-label">
          Tempo <span class="control-value" id="step-filter-bpm-value">120 BPM</span>
        </label>
        <input type="range" id="step-filter-bpm" min="60" max="200" value="120">
      </div>
      <div class="control-group">
        <label class="control-label">
          Steps Per Beat <span class="control-value" id="step-filter-rate-value">4 (16th notes)</span>
        </label>
        <input type="range" id="step-filter-rate" min="1" max="8" value="4">
      </div>
      <div class="control-group">
        <label class="control-label">
          Resonance <span class="control-value" id="step-filter-q-value">1.0</span>
        </label>
        <input type="range" id="step-filter-q" min="0.1" max="20" step="0.1" value="1">
      </div>
      <div class="control-group">
        <button id="step-filter-toggle" style="background: #1a1a1a; color: #00ff00; border: 1px solid #00ff00; padding: 8px 16px; cursor: pointer; font-family: 'Courier New', monospace;">START</button>
      </div>
      <div class="control-group">
        <label class="control-label" style="margin-bottom: 8px; display: block;">Step Frequencies</label>
        <div id="step-filter-steps" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          ${Array.from({length: 8}, (_, i) => `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 11px; color: #00ff00;">S${i+1}: <span id="step-filter-step-${i}-value">${[2000, 1500, 1000, 800, 1200, 1800, 1400, 1000][i]}</span>Hz</label>
              <input type="range" id="step-filter-step-${i}" min="100" max="5000" step="50" value="${[2000, 1500, 1000, 800, 1200, 1800, 1400, 1000][i]}" style="width: 100%;">
            </div>
          `).join('')}
        </div>
      </div>
      <div class="control-group">
        <div id="step-filter-indicator" style="display: flex; gap: 4px; margin-top: 8px;">
          ${Array.from({length: 8}, (_, i) => `
            <div id="step-filter-led-${i}" style="width: 20px; height: 20px; background: #0a0a0a; border: 1px solid #00ff00;"></div>
          `).join('')}
        </div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { filter } = audioNodes.nodes;
      const { sequencer } = audioNodes;

      // BPM control
      const bpmSlider = document.getElementById('step-filter-bpm');
      const bpmValue = document.getElementById('step-filter-bpm-value');

      bpmSlider.addEventListener('input', (e) => {
        const bpm = parseInt(e.target.value);
        sequencer.bpm = bpm;
        params.bpm = bpm;
        bpmValue.textContent = bpm + ' BPM';

        // Restart sequencer if running to apply new tempo
        if (sequencer.isRunning) {
          stopSequencer();
          startSequencer();
        }
      });

      // Steps per beat control
      const rateSlider = document.getElementById('step-filter-rate');
      const rateValue = document.getElementById('step-filter-rate-value');

      const rateLabels = {
        1: 'quarter notes',
        2: '8th notes',
        4: '16th notes',
        8: '32nd notes'
      };

      rateSlider.addEventListener('input', (e) => {
        const rate = parseInt(e.target.value);
        sequencer.stepsPerBeat = rate;
        params.stepsPerBeat = rate;
        rateValue.textContent = rate + ' (' + (rateLabels[rate] || 'custom') + ')';

        // Restart sequencer if running to apply new rate
        if (sequencer.isRunning) {
          stopSequencer();
          startSequencer();
        }
      });

      // Resonance control
      const qSlider = document.getElementById('step-filter-q');
      const qValue = document.getElementById('step-filter-q-value');

      qSlider.addEventListener('input', (e) => {
        const q = parseFloat(e.target.value);
        filter.Q.value = q;
        params.q = q;
        qValue.textContent = q.toFixed(1);
      });

      // Step value controls
      for (let i = 0; i < 8; i++) {
        const stepSlider = document.getElementById(`step-filter-step-${i}`);
        const stepValue = document.getElementById(`step-filter-step-${i}-value`);

        stepSlider.addEventListener('input', (e) => {
          const freq = parseInt(e.target.value);
          sequencer.steps[i] = freq;
          params.steps[i] = freq;
          stepValue.textContent = freq;
        });
      }

      // Sequencer control functions
      const startSequencer = () => {
        const msPerBeat = 60000 / sequencer.bpm;
        const msPerStep = msPerBeat / sequencer.stepsPerBeat;

        sequencer.intervalId = setInterval(() => {
          // Update filter frequency
          filter.frequency.value = sequencer.steps[sequencer.currentStep];

          // Update LED indicators
          for (let i = 0; i < 8; i++) {
            const led = document.getElementById(`step-filter-led-${i}`);
            if (led) {
              led.style.background = i === sequencer.currentStep ? '#00ff00' : '#0a0a0a';
            }
          }

          // Advance to next step
          sequencer.currentStep = (sequencer.currentStep + 1) % sequencer.steps.length;
        }, msPerStep);
      };

      const stopSequencer = () => {
        if (sequencer.intervalId) {
          clearInterval(sequencer.intervalId);
          sequencer.intervalId = null;
        }
        sequencer.currentStep = 0;

        // Turn off all LEDs
        for (let i = 0; i < 8; i++) {
          const led = document.getElementById(`step-filter-led-${i}`);
          if (led) {
            led.style.background = '#0a0a0a';
          }
        }
      };

      // Toggle button
      const toggleButton = document.getElementById('step-filter-toggle');
      toggleButton.addEventListener('click', () => {
        if (sequencer.isRunning) {
          stopSequencer();
          sequencer.isRunning = false;
          toggleButton.textContent = 'START';
        } else {
          startSequencer();
          sequencer.isRunning = true;
          toggleButton.textContent = 'STOP';
        }
      });

      // Store references for cleanup
      params.startSequencer = startSequencer;
      params.stopSequencer = stopSequencer;
    }
  },

  state: {
    defaults: {
      bpm: 120,
      stepsPerBeat: 4,
      q: 1,
      steps: [2000, 1500, 1000, 800, 1200, 1800, 1400, 1000]
    },
    save: (params) => ({
      bpm: params.bpm,
      stepsPerBeat: params.stepsPerBeat,
      q: params.q,
      steps: params.steps
    }),
    load: (params, saved, audioNodes) => {
      const { filter } = audioNodes.nodes;
      const { sequencer } = audioNodes;

      if (saved.bpm !== undefined) {
        sequencer.bpm = saved.bpm;
        params.bpm = saved.bpm;
        const bpmSlider = document.getElementById('step-filter-bpm');
        const bpmValue = document.getElementById('step-filter-bpm-value');
        if (bpmSlider) bpmSlider.value = saved.bpm;
        if (bpmValue) bpmValue.textContent = saved.bpm + ' BPM';
      }

      if (saved.stepsPerBeat !== undefined) {
        sequencer.stepsPerBeat = saved.stepsPerBeat;
        params.stepsPerBeat = saved.stepsPerBeat;
        const rateSlider = document.getElementById('step-filter-rate');
        const rateValue = document.getElementById('step-filter-rate-value');
        const rateLabels = {1: 'quarter notes', 2: '8th notes', 4: '16th notes', 8: '32nd notes'};
        if (rateSlider) rateSlider.value = saved.stepsPerBeat;
        if (rateValue) rateValue.textContent = saved.stepsPerBeat + ' (' + (rateLabels[saved.stepsPerBeat] || 'custom') + ')';
      }

      if (saved.q !== undefined) {
        filter.Q.value = saved.q;
        params.q = saved.q;
        const qSlider = document.getElementById('step-filter-q');
        const qValue = document.getElementById('step-filter-q-value');
        if (qSlider) qSlider.value = saved.q;
        if (qValue) qValue.textContent = saved.q.toFixed(1);
      }

      if (saved.steps !== undefined) {
        sequencer.steps = [...saved.steps];
        params.steps = [...saved.steps];
        for (let i = 0; i < 8; i++) {
          const stepSlider = document.getElementById(`step-filter-step-${i}`);
          const stepValue = document.getElementById(`step-filter-step-${i}-value`);
          if (stepSlider) stepSlider.value = saved.steps[i];
          if (stepValue) stepValue.textContent = saved.steps[i];
        }
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Step Filter] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Step Filter] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Step Filter] Module unloading');
      // Clean up any running sequencer
      const toggleButton = document.getElementById('step-filter-toggle');
      if (toggleButton && toggleButton.textContent === 'STOP') {
        toggleButton.click(); // Stop the sequencer
      }
    }
  }
};
