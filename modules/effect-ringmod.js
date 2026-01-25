// Ring Modulator module - metallic, inharmonic timbres
// Multiplies incoming audio with carrier oscillator

export default {
  id: "effect-ringmod",
  name: "Ring Modulator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Carrier oscillator that modulates the input signal
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.value = 200; // Default carrier frequency

      // Gain nodes for wet/dry mix
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Ring modulation uses multiplication - GainNode can multiply signals
      // We'll use a GainNode where carrier controls the gain
      const modulator = ctx.createGain();
      modulator.gain.value = 0; // Will be controlled by carrier oscillator

      // Connect carrier to modulate the gain
      carrier.connect(modulator.gain);

      // Signal flow: input -> modulator -> wet -> output
      modulator.connect(wetGain);
      wetGain.connect(outputMix);

      // Dry signal path
      dryGain.connect(outputMix);

      // Set initial mix
      wetGain.gain.value = 0.7;  // 70% wet
      dryGain.gain.value = 0.3;  // 30% dry

      // Start carrier oscillator
      carrier.start();

      // Input splitter
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(modulator);
      inputSplitter.connect(dryGain);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          carrier: carrier,
          modulator: modulator,
          wet: wetGain,
          dry: dryGain
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Ring Modulator</h2>
      <div class="control-group">
        <label class="control-label">
          Carrier Frequency <span class="control-value" id="ringmod-freq-value">200 Hz</span>
        </label>
        <input type="range" id="ringmod-freq" min="20" max="2000" step="1" value="200">
      </div>
      <div class="control-group">
        <label class="control-label">
          Carrier Waveform
        </label>
        <select id="ringmod-wave">
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="triangle">Triangle</option>
          <option value="sawtooth">Sawtooth</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="ringmod-mix-value">70%</span>
        </label>
        <input type="range" id="ringmod-mix" min="0" max="100" value="70">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { carrier, modulator, wet, dry } = audioNodes.nodes;

      // Frequency control
      const freqSlider = document.getElementById('ringmod-freq');
      const freqValue = document.getElementById('ringmod-freq-value');

      freqSlider.addEventListener('input', (e) => {
        const freq = parseFloat(e.target.value);
        carrier.frequency.value = freq;
        params.frequency = freq;
        freqValue.textContent = Math.round(freq) + ' Hz';
      });

      // Waveform control
      const waveSelect = document.getElementById('ringmod-wave');

      waveSelect.addEventListener('change', (e) => {
        carrier.type = e.target.value;
        params.waveform = e.target.value;
      });

      // Mix control
      const mixSlider = document.getElementById('ringmod-mix');
      const mixValue = document.getElementById('ringmod-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const wetAmount = percent / 100;
        const dryAmount = 1 - wetAmount;
        wet.gain.value = wetAmount;
        dry.gain.value = dryAmount;
        params.mix = wetAmount;
        mixValue.textContent = Math.round(percent) + '%';
      });
    }
  },

  state: {
    defaults: {
      frequency: 200,
      waveform: 'sine',
      mix: 0.7
    },
    save: (params) => ({
      frequency: params.frequency,
      waveform: params.waveform,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { carrier, wet, dry } = audioNodes.nodes;

      if (saved.frequency !== undefined) {
        carrier.frequency.value = saved.frequency;
        params.frequency = saved.frequency;
        document.getElementById('ringmod-freq').value = saved.frequency;
        document.getElementById('ringmod-freq-value').textContent = Math.round(saved.frequency) + ' Hz';
      }
      if (saved.waveform !== undefined) {
        carrier.type = saved.waveform;
        params.waveform = saved.waveform;
        document.getElementById('ringmod-wave').value = saved.waveform;
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('ringmod-mix').value = saved.mix * 100;
        document.getElementById('ringmod-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Ring Modulator] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Ring Modulator] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Ring Modulator] Module unloading');
    }
  }
};
