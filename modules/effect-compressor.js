// Compressor effect module with multiple presets

export default {
  id: "effect-compressor",
  name: "Compressor Effect",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create compressor with input/output nodes
      const compressor = ctx.createDynamicsCompressor();
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();

      // Set initial values (Gentle preset)
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      outputGain.gain.value = 1.0;

      // Connect nodes
      inputGain.connect(compressor);
      compressor.connect(outputGain);

      return {
        input: inputGain,
        output: outputGain,
        nodes: {
          compressor: compressor,
          outputGain: outputGain
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Compressor Effect</h2>
      <div class="control-group">
        <label class="control-label">Preset</label>
        <select id="compressor-preset" style="width: 100%; padding: 8px; background: #1a1a1a; color: #00ff00; border: 1px solid #00ff00; border-radius: 4px; font-family: 'Courier New', monospace;">
          <option value="gentle">Gentle</option>
          <option value="moderate">Moderate</option>
          <option value="heavy">Heavy</option>
          <option value="limiter">Limiter</option>
          <option value="vocal">Vocal</option>
          <option value="drum">Drum Bus</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Threshold <span class="control-value" id="compressor-threshold-value">-24 dB</span>
        </label>
        <input type="range" id="compressor-threshold" min="-100" max="0" step="1" value="-24">
      </div>
      <div class="control-group">
        <label class="control-label">
          Knee <span class="control-value" id="compressor-knee-value">30 dB</span>
        </label>
        <input type="range" id="compressor-knee" min="0" max="40" step="1" value="30">
      </div>
      <div class="control-group">
        <label class="control-label">
          Ratio <span class="control-value" id="compressor-ratio-value">4:1</span>
        </label>
        <input type="range" id="compressor-ratio" min="1" max="20" step="0.5" value="4">
      </div>
      <div class="control-group">
        <label class="control-label">
          Attack <span class="control-value" id="compressor-attack-value">3 ms</span>
        </label>
        <input type="range" id="compressor-attack" min="0" max="1000" step="1" value="3">
      </div>
      <div class="control-group">
        <label class="control-label">
          Release <span class="control-value" id="compressor-release-value">250 ms</span>
        </label>
        <input type="range" id="compressor-release" min="0" max="3000" step="10" value="250">
      </div>
      <div class="control-group">
        <label class="control-label">
          Makeup Gain <span class="control-value" id="compressor-makeup-value">0 dB</span>
        </label>
        <input type="range" id="compressor-makeup" min="0" max="20" step="0.5" value="0">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { compressor, outputGain } = audioNodes.nodes;

      // Preset definitions
      const presets = {
        gentle: { threshold: -24, knee: 30, ratio: 4, attack: 0.003, release: 0.25, makeup: 1.0 },
        moderate: { threshold: -18, knee: 20, ratio: 6, attack: 0.005, release: 0.15, makeup: 1.2 },
        heavy: { threshold: -12, knee: 10, ratio: 10, attack: 0.001, release: 0.1, makeup: 1.5 },
        limiter: { threshold: -3, knee: 0, ratio: 20, attack: 0.001, release: 0.05, makeup: 1.0 },
        vocal: { threshold: -20, knee: 25, ratio: 5, attack: 0.002, release: 0.2, makeup: 1.3 },
        drum: { threshold: -10, knee: 5, ratio: 8, attack: 0.001, release: 0.05, makeup: 1.4 }
      };

      // Helper function to update UI displays
      const updateUI = () => {
        document.getElementById('compressor-threshold-value').textContent = Math.round(compressor.threshold.value) + ' dB';
        document.getElementById('compressor-knee-value').textContent = Math.round(compressor.knee.value) + ' dB';
        document.getElementById('compressor-ratio-value').textContent = compressor.ratio.value.toFixed(1) + ':1';
        document.getElementById('compressor-attack-value').textContent = Math.round(compressor.attack.value * 1000) + ' ms';
        document.getElementById('compressor-release-value').textContent = Math.round(compressor.release.value * 1000) + ' ms';
        const makeupDB = 20 * Math.log10(outputGain.gain.value);
        document.getElementById('compressor-makeup-value').textContent = makeupDB.toFixed(1) + ' dB';
      };

      // Preset selector
      const presetSelector = document.getElementById('compressor-preset');
      presetSelector.addEventListener('change', (e) => {
        const presetName = e.target.value;
        if (presetName === 'custom') return;

        const preset = presets[presetName];

        compressor.threshold.value = preset.threshold;
        compressor.knee.value = preset.knee;
        compressor.ratio.value = preset.ratio;
        compressor.attack.value = preset.attack;
        compressor.release.value = preset.release;
        outputGain.gain.value = preset.makeup;

        // Update sliders
        document.getElementById('compressor-threshold').value = preset.threshold;
        document.getElementById('compressor-knee').value = preset.knee;
        document.getElementById('compressor-ratio').value = preset.ratio;
        document.getElementById('compressor-attack').value = preset.attack * 1000;
        document.getElementById('compressor-release').value = preset.release * 1000;
        document.getElementById('compressor-makeup').value = 20 * Math.log10(preset.makeup);

        // Update params
        params.threshold = preset.threshold;
        params.knee = preset.knee;
        params.ratio = preset.ratio;
        params.attack = preset.attack;
        params.release = preset.release;
        params.makeup = preset.makeup;
        params.preset = presetName;

        updateUI();
      });

      // Threshold control
      const thresholdSlider = document.getElementById('compressor-threshold');
      thresholdSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        compressor.threshold.value = value;
        params.threshold = value;
        presetSelector.value = 'custom';
        params.preset = 'custom';
        updateUI();
      });

      // Knee control
      const kneeSlider = document.getElementById('compressor-knee');
      kneeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        compressor.knee.value = value;
        params.knee = value;
        presetSelector.value = 'custom';
        params.preset = 'custom';
        updateUI();
      });

      // Ratio control
      const ratioSlider = document.getElementById('compressor-ratio');
      ratioSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        compressor.ratio.value = value;
        params.ratio = value;
        presetSelector.value = 'custom';
        params.preset = 'custom';
        updateUI();
      });

      // Attack control
      const attackSlider = document.getElementById('compressor-attack');
      attackSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        compressor.attack.value = seconds;
        params.attack = seconds;
        presetSelector.value = 'custom';
        params.preset = 'custom';
        updateUI();
      });

      // Release control
      const releaseSlider = document.getElementById('compressor-release');
      releaseSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        compressor.release.value = seconds;
        params.release = seconds;
        presetSelector.value = 'custom';
        params.preset = 'custom';
        updateUI();
      });

      // Makeup gain control
      const makeupSlider = document.getElementById('compressor-makeup');
      makeupSlider.addEventListener('input', (e) => {
        const db = parseFloat(e.target.value);
        const gain = Math.pow(10, db / 20);
        outputGain.gain.value = gain;
        params.makeup = gain;
        presetSelector.value = 'custom';
        params.preset = 'custom';
        updateUI();
      });

      // Initialize display
      updateUI();
    }
  },

  state: {
    defaults: {
      preset: 'gentle',
      threshold: -24,
      knee: 30,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      makeup: 1.0
    },
    save: (params) => ({
      preset: params.preset,
      threshold: params.threshold,
      knee: params.knee,
      ratio: params.ratio,
      attack: params.attack,
      release: params.release,
      makeup: params.makeup
    }),
    load: (params, saved, audioNodes) => {
      const { compressor, outputGain } = audioNodes.nodes;

      if (saved.preset !== undefined) {
        params.preset = saved.preset;
        document.getElementById('compressor-preset').value = saved.preset;
      }
      if (saved.threshold !== undefined) {
        compressor.threshold.value = saved.threshold;
        params.threshold = saved.threshold;
        document.getElementById('compressor-threshold').value = saved.threshold;
      }
      if (saved.knee !== undefined) {
        compressor.knee.value = saved.knee;
        params.knee = saved.knee;
        document.getElementById('compressor-knee').value = saved.knee;
      }
      if (saved.ratio !== undefined) {
        compressor.ratio.value = saved.ratio;
        params.ratio = saved.ratio;
        document.getElementById('compressor-ratio').value = saved.ratio;
      }
      if (saved.attack !== undefined) {
        compressor.attack.value = saved.attack;
        params.attack = saved.attack;
        document.getElementById('compressor-attack').value = saved.attack * 1000;
      }
      if (saved.release !== undefined) {
        compressor.release.value = saved.release;
        params.release = saved.release;
        document.getElementById('compressor-release').value = saved.release * 1000;
      }
      if (saved.makeup !== undefined) {
        outputGain.gain.value = saved.makeup;
        params.makeup = saved.makeup;
        const makeupDB = 20 * Math.log10(saved.makeup);
        document.getElementById('compressor-makeup').value = makeupDB;
      }

      // Update all displays
      document.getElementById('compressor-threshold-value').textContent = Math.round(saved.threshold || -24) + ' dB';
      document.getElementById('compressor-knee-value').textContent = Math.round(saved.knee || 30) + ' dB';
      document.getElementById('compressor-ratio-value').textContent = (saved.ratio || 4).toFixed(1) + ':1';
      document.getElementById('compressor-attack-value').textContent = Math.round((saved.attack || 0.003) * 1000) + ' ms';
      document.getElementById('compressor-release-value').textContent = Math.round((saved.release || 0.25) * 1000) + ' ms';
      const makeupDB = 20 * Math.log10(saved.makeup || 1.0);
      document.getElementById('compressor-makeup-value').textContent = makeupDB.toFixed(1) + ' dB';
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Compressor] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Compressor] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Compressor] Module unloading');
    }
  }
};
