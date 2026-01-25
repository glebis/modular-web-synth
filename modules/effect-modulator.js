// Modulator effect module with LFO for dynamic parameter modulation

export default {
  id: "effect-modulator",
  name: "Modulator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create LFO (Low Frequency Oscillator) for modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      // Create amplitude modulation path
      const amGain = ctx.createGain();
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();

      // Set initial values
      lfo.type = 'sine';
      lfo.frequency.value = 5;      // 5 Hz modulation
      lfoGain.gain.value = 0.3;     // 30% modulation depth
      amGain.gain.value = 1.0;      // Base amplitude
      outputGain.gain.value = 1.0;

      // Connect LFO to modulation target
      lfo.connect(lfoGain);
      lfoGain.connect(amGain.gain);

      // Audio signal path
      inputGain.connect(amGain);
      amGain.connect(outputGain);

      // Start the LFO
      lfo.start();

      return {
        input: inputGain,
        output: outputGain,
        nodes: {
          lfo: lfo,
          lfoGain: lfoGain,
          amGain: amGain
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Modulator</h2>
      <div class="control-group">
        <label class="control-label">
          Rate <span class="control-value" id="modulator-rate-value">5.0 Hz</span>
        </label>
        <input type="range" id="modulator-rate" min="0.1" max="20" step="0.1" value="5">
      </div>
      <div class="control-group">
        <label class="control-label">
          Depth <span class="control-value" id="modulator-depth-value">30%</span>
        </label>
        <input type="range" id="modulator-depth" min="0" max="100" value="30">
      </div>
      <div class="control-group">
        <label class="control-label">
          Waveform <span class="control-value" id="modulator-wave-value">sine</span>
        </label>
        <select id="modulator-wave" style="background: #0a0a0a; color: #00ff00; border: 1px solid #00ff00; padding: 4px; font-family: monospace;">
          <option value="sine">Sine</option>
          <option value="triangle">Triangle</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
        </select>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { lfo, lfoGain } = audioNodes.nodes;

      // Rate control
      const rateSlider = document.getElementById('modulator-rate');
      const rateValue = document.getElementById('modulator-rate-value');

      rateSlider.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        lfo.frequency.value = rate;
        params.rate = rate;
        rateValue.textContent = rate.toFixed(1) + ' Hz';
      });

      // Depth control
      const depthSlider = document.getElementById('modulator-depth');
      const depthValue = document.getElementById('modulator-depth-value');

      depthSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const depth = percent / 100;
        lfoGain.gain.value = depth;
        params.depth = depth;
        depthValue.textContent = Math.round(percent) + '%';
      });

      // Waveform control
      const waveSelect = document.getElementById('modulator-wave');
      const waveValue = document.getElementById('modulator-wave-value');

      waveSelect.addEventListener('change', (e) => {
        const waveform = e.target.value;
        lfo.type = waveform;
        params.waveform = waveform;
        waveValue.textContent = waveform;
      });
    }
  },

  state: {
    defaults: {
      rate: 5.0,
      depth: 0.3,
      waveform: 'sine'
    },
    save: (params) => ({
      rate: params.rate,
      depth: params.depth,
      waveform: params.waveform
    }),
    load: (params, saved, audioNodes) => {
      const { lfo, lfoGain } = audioNodes.nodes;

      if (saved.rate !== undefined) {
        lfo.frequency.value = saved.rate;
        params.rate = saved.rate;
        document.getElementById('modulator-rate').value = saved.rate;
        document.getElementById('modulator-rate-value').textContent = saved.rate.toFixed(1) + ' Hz';
      }
      if (saved.depth !== undefined) {
        lfoGain.gain.value = saved.depth;
        params.depth = saved.depth;
        document.getElementById('modulator-depth').value = saved.depth * 100;
        document.getElementById('modulator-depth-value').textContent = Math.round(saved.depth * 100) + '%';
      }
      if (saved.waveform !== undefined) {
        lfo.type = saved.waveform;
        params.waveform = saved.waveform;
        document.getElementById('modulator-wave').value = saved.waveform;
        document.getElementById('modulator-wave-value').textContent = saved.waveform;
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Modulator] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Modulator] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Modulator] Module unloading');
    }
  }
};
