// Bit Crusher effect module - creative lo-fi digital degradation

export default {
  id: "effect-bitcrusher",
  name: "Bit Crusher",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create bit crusher using ScriptProcessorNode for sample manipulation
      const bufferSize = 4096;
      const crusher = ctx.createScriptProcessor(bufferSize, 1, 1);

      // Wet/dry mix nodes
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();
      const inputSplitter = ctx.createGain();

      // Set initial values
      wetGain.gain.value = 0.7;
      dryGain.gain.value = 0.3;

      // Bit crusher parameters
      let bitDepth = 8;        // Bits (1-16)
      let sampleRate = 8000;   // Hz (500-44100)

      // Sample hold buffer
      let lastSample = 0;
      let sampleCounter = 0;

      // Bit crushing algorithm
      crusher.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const output = e.outputBuffer.getChannelData(0);

        const step = Math.pow(0.5, bitDepth);
        const sampleRateReduction = ctx.sampleRate / sampleRate;

        for (let i = 0; i < bufferSize; i++) {
          // Sample rate reduction
          if (sampleCounter >= sampleRateReduction) {
            sampleCounter = 0;

            // Bit depth reduction
            const dry = input[i];
            const quantized = Math.floor(dry / step) * step;
            lastSample = quantized;
          }

          output[i] = lastSample;
          sampleCounter++;
        }
      };

      // Connect audio graph
      inputSplitter.connect(crusher);
      inputSplitter.connect(dryGain);
      crusher.connect(wetGain);
      wetGain.connect(outputMix);
      dryGain.connect(outputMix);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          crusher,
          wet: wetGain,
          dry: dryGain,
          params: { bitDepth, sampleRate }
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Bit Crusher</h2>
      <div class="control-group">
        <label class="control-label">
          Bit Depth <span class="control-value" id="bitcrusher-bits-value">8 bit</span>
        </label>
        <input type="range" id="bitcrusher-bits" min="1" max="16" step="1" value="8">
      </div>
      <div class="control-group">
        <label class="control-label">
          Sample Rate <span class="control-value" id="bitcrusher-rate-value">8000 Hz</span>
        </label>
        <input type="range" id="bitcrusher-rate" min="500" max="44100" step="100" value="8000">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="bitcrusher-mix-value">70%</span>
        </label>
        <input type="range" id="bitcrusher-mix" min="0" max="100" value="70">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { crusher, wet, dry } = audioNodes.nodes;

      // Bit depth control
      const bitsSlider = document.getElementById('bitcrusher-bits');
      const bitsValue = document.getElementById('bitcrusher-bits-value');

      bitsSlider.addEventListener('input', (e) => {
        const bits = parseInt(e.target.value);
        audioNodes.nodes.params.bitDepth = bits;
        params.bitDepth = bits;
        bitsValue.textContent = bits + ' bit';
      });

      // Sample rate control
      const rateSlider = document.getElementById('bitcrusher-rate');
      const rateValue = document.getElementById('bitcrusher-rate-value');

      rateSlider.addEventListener('input', (e) => {
        const rate = parseInt(e.target.value);
        audioNodes.nodes.params.sampleRate = rate;
        params.sampleRate = rate;

        if (rate >= 1000) {
          rateValue.textContent = (rate / 1000).toFixed(1) + ' kHz';
        } else {
          rateValue.textContent = rate + ' Hz';
        }
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('bitcrusher-mix');
      const mixValue = document.getElementById('bitcrusher-mix-value');

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
      bitDepth: 8,
      sampleRate: 8000,
      mix: 0.7
    },
    save: (params) => ({
      bitDepth: params.bitDepth,
      sampleRate: params.sampleRate,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { wet, dry } = audioNodes.nodes;

      if (saved.bitDepth !== undefined) {
        audioNodes.nodes.params.bitDepth = saved.bitDepth;
        params.bitDepth = saved.bitDepth;
        document.getElementById('bitcrusher-bits').value = saved.bitDepth;
        document.getElementById('bitcrusher-bits-value').textContent = saved.bitDepth + ' bit';
      }
      if (saved.sampleRate !== undefined) {
        audioNodes.nodes.params.sampleRate = saved.sampleRate;
        params.sampleRate = saved.sampleRate;
        document.getElementById('bitcrusher-rate').value = saved.sampleRate;

        const rate = saved.sampleRate;
        if (rate >= 1000) {
          document.getElementById('bitcrusher-rate-value').textContent = (rate / 1000).toFixed(1) + ' kHz';
        } else {
          document.getElementById('bitcrusher-rate-value').textContent = rate + ' Hz';
        }
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('bitcrusher-mix').value = saved.mix * 100;
        document.getElementById('bitcrusher-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Bit Crusher] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Bit Crusher] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Bit Crusher] Module unloading');
    }
  }
};
