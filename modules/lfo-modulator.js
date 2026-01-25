// LFO (Low Frequency Oscillator) that modulates the built-in filter cutoff

export default {
  id: "lfo-modulator",
  name: "LFO Modulator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create LFO oscillator
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2;  // 2 Hz default
      lfo.type = 'sine';

      // Create gain node to control modulation depth
      const modulationGain = ctx.createGain();
      modulationGain.gain.value = 500;  // +/- 500 Hz modulation

      // Connect LFO -> gain -> (will connect to filter.frequency in onConnect)
      lfo.connect(modulationGain);

      // Start LFO immediately
      lfo.start();

      // Pass-through for audio signal (LFO is control signal only)
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();
      inputGain.connect(outputGain);

      return {
        input: inputGain,
        output: outputGain,
        nodes: {
          lfo,
          modulationGain,
          passthrough: outputGain
        }
      };
    },
    insertionPoint: "post-oscillator",  // Early in chain to modulate filter
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>LFO Modulator</h2>
      <div class="control-group">
        <label class="control-label">
          Rate <span class="control-value" id="lfo-rate-value">2.0 Hz</span>
        </label>
        <input type="range" id="lfo-rate" min="0.1" max="20" step="0.1" value="2">
      </div>
      <div class="control-group">
        <label class="control-label">
          Depth <span class="control-value" id="lfo-depth-value">500 Hz</span>
        </label>
        <input type="range" id="lfo-depth" min="0" max="2000" step="10" value="500">
      </div>
      <div class="control-group">
        <label class="control-label">
          Waveform
        </label>
        <select id="lfo-waveform">
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="triangle">Triangle</option>
          <option value="sawtooth">Sawtooth</option>
        </select>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      // Extract the actual nodes from the audioNodes structure
      const { lfo, modulationGain } = audioNodes.nodes;

      // LFO rate control
      const rateSlider = document.getElementById('lfo-rate');
      const rateValue = document.getElementById('lfo-rate-value');

      rateSlider.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        lfo.frequency.value = rate;
        params.rate = rate;
        rateValue.textContent = rate.toFixed(1) + ' Hz';
      });

      // Modulation depth control
      const depthSlider = document.getElementById('lfo-depth');
      const depthValue = document.getElementById('lfo-depth-value');

      depthSlider.addEventListener('input', (e) => {
        const depth = parseFloat(e.target.value);
        modulationGain.gain.value = depth;
        params.depth = depth;
        depthValue.textContent = Math.round(depth) + ' Hz';
      });

      // Waveform selector
      const waveformSelect = document.getElementById('lfo-waveform');

      waveformSelect.addEventListener('change', (e) => {
        lfo.type = e.target.value;
        params.waveform = e.target.value;
      });
    }
  },

  state: {
    defaults: {
      rate: 2,
      depth: 500,
      waveform: 'sine'
    },
    save: (params) => ({
      rate: params.rate,
      depth: params.depth,
      waveform: params.waveform
    }),
    load: (params, saved, audioNodes) => {
      const { lfo, modulationGain } = audioNodes.nodes;

      if (saved.rate !== undefined) {
        lfo.frequency.value = saved.rate;
        params.rate = saved.rate;
        document.getElementById('lfo-rate').value = saved.rate;
        document.getElementById('lfo-rate-value').textContent = saved.rate.toFixed(1) + ' Hz';
      }
      if (saved.depth !== undefined) {
        modulationGain.gain.value = saved.depth;
        params.depth = saved.depth;
        document.getElementById('lfo-depth').value = saved.depth;
        document.getElementById('lfo-depth-value').textContent = Math.round(saved.depth) + ' Hz';
      }
      if (saved.waveform !== undefined) {
        lfo.type = saved.waveform;
        params.waveform = saved.waveform;
        document.getElementById('lfo-waveform').value = saved.waveform;
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[LFO] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[LFO] Connecting to filter frequency parameter');

      // Find the built-in filter node from SynthCore
      const synthCore = window.SynthCore?.instance;
      if (synthCore && synthCore.filterNode) {
        // Get the modulation output
        const moduleInstance = window.SynthCore.loader.modules.get('lfo-modulator');
        if (moduleInstance) {
          // Connect LFO modulation to filter frequency AudioParam
          moduleInstance.audioNodes.nodes.modulationGain.connect(
            synthCore.filterNode.frequency
          );
          console.log('[LFO] ✓ Connected to filter.frequency');
        }
      } else {
        console.warn('[LFO] Could not find filter node for modulation');
      }
    },
    onUnload: (ctx) => {
      console.log('[LFO] Stopping LFO and disconnecting');
      const moduleInstance = window.SynthCore.loader.modules.get('lfo-modulator');
      if (moduleInstance) {
        // Disconnect from filter frequency
        try {
          moduleInstance.audioNodes.nodes.modulationGain.disconnect();
        } catch (e) {
          // Already disconnected
        }

        // Stop oscillator
        try {
          moduleInstance.audioNodes.nodes.lfo.stop();
        } catch (e) {
          // Already stopped
        }
      }
    }
  }
};
