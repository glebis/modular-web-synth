// Second oscillator module with detune and mix controls

export default {
  id: "oscillator-second",
  name: "Second Oscillator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create second oscillator with gain control for mixing
      const oscillator = ctx.createOscillator();
      const mixGain = ctx.createGain();

      // Set initial values
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 440;  // Will be synced with main oscillator
      oscillator.detune.value = 7;       // 7 cents detune for fatness
      mixGain.gain.value = 0.3;          // 30% mix by default

      // Connect oscillator to mix gain
      oscillator.connect(mixGain);

      // Start the oscillator
      oscillator.start();

      return {
        input: null,              // This is a source, not an effect
        output: mixGain,          // Output goes through mix control
        nodes: {
          oscillator: oscillator,
          mix: mixGain
        }
      };
    },
    insertionPoint: "post-oscillator",
    routing: "parallel"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Second Oscillator</h2>
      <div class="control-group">
        <label class="control-label">
          Waveform <span class="control-value" id="osc2-wave-value">Sawtooth</span>
        </label>
        <select id="osc2-waveform" class="waveform-select">
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth" selected>Sawtooth</option>
          <option value="triangle">Triangle</option>
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
          Mix <span class="control-value" id="osc2-mix-value">30%</span>
        </label>
        <input type="range" id="osc2-mix" min="0" max="100" value="30">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { oscillator, mix } = audioNodes.nodes;

      // Waveform control
      const waveformSelect = document.getElementById('osc2-waveform');
      const waveformValue = document.getElementById('osc2-wave-value');

      waveformSelect.addEventListener('change', (e) => {
        const waveform = e.target.value;
        oscillator.type = waveform;
        params.waveform = waveform;
        waveformValue.textContent = waveform.charAt(0).toUpperCase() + waveform.slice(1);
      });

      // Detune control
      const detuneSlider = document.getElementById('osc2-detune');
      const detuneValue = document.getElementById('osc2-detune-value');

      detuneSlider.addEventListener('input', (e) => {
        const cents = parseFloat(e.target.value);
        oscillator.detune.value = cents;
        params.detune = cents;
        const sign = cents >= 0 ? '+' : '';
        detuneValue.textContent = sign + cents + ' cents';
      });

      // Mix control
      const mixSlider = document.getElementById('osc2-mix');
      const mixValue = document.getElementById('osc2-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        mix.gain.value = gain;
        params.mix = gain;
        mixValue.textContent = Math.round(percent) + '%';
      });
    }
  },

  state: {
    defaults: {
      waveform: 'sawtooth',
      detune: 7,
      mix: 0.3
    },
    save: (params) => ({
      waveform: params.waveform,
      detune: params.detune,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { oscillator, mix } = audioNodes.nodes;

      if (saved.waveform !== undefined) {
        oscillator.type = saved.waveform;
        params.waveform = saved.waveform;
        const select = document.getElementById('osc2-waveform');
        if (select) {
          select.value = saved.waveform;
          document.getElementById('osc2-wave-value').textContent =
            saved.waveform.charAt(0).toUpperCase() + saved.waveform.slice(1);
        }
      }
      if (saved.detune !== undefined) {
        oscillator.detune.value = saved.detune;
        params.detune = saved.detune;
        const slider = document.getElementById('osc2-detune');
        if (slider) {
          slider.value = saved.detune;
          const sign = saved.detune >= 0 ? '+' : '';
          document.getElementById('osc2-detune-value').textContent = sign + saved.detune + ' cents';
        }
      }
      if (saved.mix !== undefined) {
        mix.gain.value = saved.mix;
        params.mix = saved.mix;
        const slider = document.getElementById('osc2-mix');
        if (slider) {
          slider.value = saved.mix * 100;
          document.getElementById('osc2-mix-value').textContent = Math.round(saved.mix * 100) + '%';
        }
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Second Oscillator] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Second Oscillator] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Second Oscillator] Module unloading');
    }
  }
};
