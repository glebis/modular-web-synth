// Second oscillator with detune and mix control

export default {
  id: "oscillator-dual",
  name: "Dual Oscillator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create second oscillator with dedicated gain control
      const oscillator2 = ctx.createOscillator();
      const osc2Gain = ctx.createGain();
      const mixer = ctx.createGain();
      const osc1Gain = ctx.createGain();

      // Set initial values
      oscillator2.type = 'sawtooth';
      oscillator2.frequency.value = 440; // Will sync with main oscillator
      oscillator2.detune.value = 7;      // 7 cents detune for chorus effect
      osc2Gain.gain.value = 0.5;         // 50% mix for oscillator 2
      osc1Gain.gain.value = 0.5;         // 50% mix for oscillator 1

      // Start the second oscillator
      oscillator2.start();

      // Route oscillator 2 through its gain to mixer
      oscillator2.connect(osc2Gain);
      osc2Gain.connect(mixer);

      // Oscillator 1 (from main chain) goes through gain to mixer
      osc1Gain.connect(mixer);

      return {
        input: osc1Gain,     // Main oscillator connects here
        output: mixer,       // Mixed output
        nodes: {
          oscillator2: oscillator2,
          osc1Gain: osc1Gain,
          osc2Gain: osc2Gain
        }
      };
    },
    insertionPoint: "post-oscillator",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Dual Oscillator</h2>
      <div class="control-group">
        <label class="control-label">
          Waveform <span class="control-value" id="osc2-wave-value">sawtooth</span>
        </label>
        <select id="osc2-waveform" style="width: 100%; padding: 5px; background: #0a0a0a; color: #00ff00; border: 1px solid #00ff00; font-family: 'Courier New', monospace;">
          <option value="sine">sine</option>
          <option value="square">square</option>
          <option value="sawtooth" selected>sawtooth</option>
          <option value="triangle">triangle</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Detune <span class="control-value" id="osc2-detune-value">+7 cents</span>
        </label>
        <input type="range" id="osc2-detune" min="-50" max="50" step="1" value="7">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="osc2-mix-value">50%</span>
        </label>
        <input type="range" id="osc2-mix" min="0" max="100" value="50">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { oscillator2, osc1Gain, osc2Gain } = audioNodes.nodes;

      // Waveform control
      const waveformSelect = document.getElementById('osc2-waveform');
      const waveformValue = document.getElementById('osc2-wave-value');

      waveformSelect.addEventListener('change', (e) => {
        const waveform = e.target.value;
        oscillator2.type = waveform;
        params.waveform = waveform;
        waveformValue.textContent = waveform;
      });

      // Detune control
      const detuneSlider = document.getElementById('osc2-detune');
      const detuneValue = document.getElementById('osc2-detune-value');

      detuneSlider.addEventListener('input', (e) => {
        const cents = parseFloat(e.target.value);
        oscillator2.detune.value = cents;
        params.detune = cents;
        const sign = cents >= 0 ? '+' : '';
        detuneValue.textContent = sign + cents + ' cents';
      });

      // Mix control (balance between osc1 and osc2)
      const mixSlider = document.getElementById('osc2-mix');
      const mixValue = document.getElementById('osc2-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const osc2Amount = percent / 100;
        const osc1Amount = 1 - osc2Amount;

        // Equal power crossfade for smoother mixing
        osc2Gain.gain.value = Math.sqrt(osc2Amount);
        osc1Gain.gain.value = Math.sqrt(osc1Amount);

        params.mix = osc2Amount;
        mixValue.textContent = Math.round(percent) + '%';
      });
    }
  },

  state: {
    defaults: {
      waveform: 'sawtooth',
      detune: 7,
      mix: 0.5
    },
    save: (params) => ({
      waveform: params.waveform,
      detune: params.detune,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { oscillator2, osc1Gain, osc2Gain } = audioNodes.nodes;

      if (saved.waveform !== undefined) {
        oscillator2.type = saved.waveform;
        params.waveform = saved.waveform;
        document.getElementById('osc2-waveform').value = saved.waveform;
        document.getElementById('osc2-wave-value').textContent = saved.waveform;
      }
      if (saved.detune !== undefined) {
        oscillator2.detune.value = saved.detune;
        params.detune = saved.detune;
        document.getElementById('osc2-detune').value = saved.detune;
        const sign = saved.detune >= 0 ? '+' : '';
        document.getElementById('osc2-detune-value').textContent = sign + saved.detune + ' cents';
      }
      if (saved.mix !== undefined) {
        const osc2Amount = saved.mix;
        const osc1Amount = 1 - osc2Amount;
        osc2Gain.gain.value = Math.sqrt(osc2Amount);
        osc1Gain.gain.value = Math.sqrt(osc1Amount);
        params.mix = saved.mix;
        document.getElementById('osc2-mix').value = saved.mix * 100;
        document.getElementById('osc2-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Dual Oscillator] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Dual Oscillator] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Dual Oscillator] Module unloading');
    }
  }
};
