// Reverb effect module with room size, decay, and mix controls

export default {
  id: "effect-reverb",
  name: "Reverb Effect",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create convolver for reverb with impulse response
      const convolver = ctx.createConvolver();
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Create pre-delay for more natural reverb
      const preDelay = ctx.createDelay(0.1);
      preDelay.delayTime.value = 0.02; // 20ms pre-delay

      // Create tone controls for reverb character
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 4000; // Dampening for decay

      // Set initial values
      wetGain.gain.value = 0.3;  // 30% wet signal
      dryGain.gain.value = 0.7;  // 70% dry signal

      // Generate impulse response for reverb simulation
      const generateImpulse = (duration = 2.0, decay = 2.0) => {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const n = i / sampleRate;
          const envelope = Math.exp(-n * decay);

          // Generate random noise with stereo spread
          leftChannel[i] = (Math.random() * 2 - 1) * envelope;
          rightChannel[i] = (Math.random() * 2 - 1) * envelope;
        }

        return impulse;
      };

      convolver.buffer = generateImpulse(2.0, 2.0);

      // Routing: input -> pre-delay -> convolver -> lowpass -> wet gain -> output
      preDelay.connect(convolver);
      convolver.connect(lowpass);
      lowpass.connect(wetGain);
      wetGain.connect(outputMix);

      // Dry signal path
      dryGain.connect(outputMix);

      // Input splitter for dry/wet routing
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(preDelay);
      inputSplitter.connect(dryGain);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          convolver: convolver,
          wet: wetGain,
          dry: dryGain,
          preDelay: preDelay,
          lowpass: lowpass,
          impulseGenerator: generateImpulse
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Reverb Effect</h2>
      <div class="control-group">
        <label class="control-label">
          Room Size <span class="control-value" id="reverb-size-value">2.0 s</span>
        </label>
        <input type="range" id="reverb-size" min="0.5" max="4.0" step="0.1" value="2.0">
      </div>
      <div class="control-group">
        <label class="control-label">
          Decay <span class="control-value" id="reverb-decay-value">2.0</span>
        </label>
        <input type="range" id="reverb-decay" min="0.5" max="8.0" step="0.1" value="2.0">
      </div>
      <div class="control-group">
        <label class="control-label">
          Damping <span class="control-value" id="reverb-damping-value">4000 Hz</span>
        </label>
        <input type="range" id="reverb-damping" min="500" max="10000" step="100" value="4000">
      </div>
      <div class="control-group">
        <label class="control-label">
          Pre-Delay <span class="control-value" id="reverb-predelay-value">20 ms</span>
        </label>
        <input type="range" id="reverb-predelay" min="0" max="100" step="1" value="20">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="reverb-mix-value">30%</span>
        </label>
        <input type="range" id="reverb-mix" min="0" max="100" value="30">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { nodes } = audioNodes;

      // Room size control
      const sizeSlider = document.getElementById('reverb-size');
      const sizeValue = document.getElementById('reverb-size-value');

      sizeSlider.addEventListener('input', (e) => {
        const size = parseFloat(e.target.value);
        params.size = size;
        nodes.convolver.buffer = nodes.impulseGenerator(size, params.decay);
        sizeValue.textContent = size.toFixed(1) + ' s';
      });

      // Decay control
      const decaySlider = document.getElementById('reverb-decay');
      const decayValue = document.getElementById('reverb-decay-value');

      decaySlider.addEventListener('input', (e) => {
        const decay = parseFloat(e.target.value);
        params.decay = decay;
        nodes.convolver.buffer = nodes.impulseGenerator(params.size, decay);
        decayValue.textContent = decay.toFixed(1);
      });

      // Damping control
      const dampingSlider = document.getElementById('reverb-damping');
      const dampingValue = document.getElementById('reverb-damping-value');

      dampingSlider.addEventListener('input', (e) => {
        const freq = parseFloat(e.target.value);
        nodes.lowpass.frequency.value = freq;
        params.damping = freq;
        dampingValue.textContent = Math.round(freq) + ' Hz';
      });

      // Pre-delay control
      const preDelaySlider = document.getElementById('reverb-predelay');
      const preDelayValue = document.getElementById('reverb-predelay-value');

      preDelaySlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        nodes.preDelay.delayTime.value = seconds;
        params.preDelay = seconds;
        preDelayValue.textContent = Math.round(ms) + ' ms';
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('reverb-mix');
      const mixValue = document.getElementById('reverb-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const wet = percent / 100;
        const dry = 1 - wet;
        nodes.wet.gain.value = wet;
        nodes.dry.gain.value = dry;
        params.mix = wet;
        mixValue.textContent = Math.round(percent) + '%';
      });
    }
  },

  state: {
    defaults: {
      size: 2.0,
      decay: 2.0,
      damping: 4000,
      preDelay: 0.02,
      mix: 0.3
    },
    save: (params) => ({
      size: params.size,
      decay: params.decay,
      damping: params.damping,
      preDelay: params.preDelay,
      mix: params.mix
    }),
    load: (params, saved, nodes) => {
      if (saved.size !== undefined) {
        params.size = saved.size;
        document.getElementById('reverb-size').value = saved.size;
        document.getElementById('reverb-size-value').textContent = saved.size.toFixed(1) + ' s';
      }
      if (saved.decay !== undefined) {
        params.decay = saved.decay;
        document.getElementById('reverb-decay').value = saved.decay;
        document.getElementById('reverb-decay-value').textContent = saved.decay.toFixed(1);
      }
      if (saved.size !== undefined || saved.decay !== undefined) {
        nodes.convolver.buffer = nodes.impulseGenerator(params.size, params.decay);
      }
      if (saved.damping !== undefined) {
        nodes.lowpass.frequency.value = saved.damping;
        params.damping = saved.damping;
        document.getElementById('reverb-damping').value = saved.damping;
        document.getElementById('reverb-damping-value').textContent = Math.round(saved.damping) + ' Hz';
      }
      if (saved.preDelay !== undefined) {
        nodes.preDelay.delayTime.value = saved.preDelay;
        params.preDelay = saved.preDelay;
        document.getElementById('reverb-predelay').value = saved.preDelay * 1000;
        document.getElementById('reverb-predelay-value').textContent = Math.round(saved.preDelay * 1000) + ' ms';
      }
      if (saved.mix !== undefined) {
        nodes.wet.gain.value = saved.mix;
        nodes.dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('reverb-mix').value = saved.mix * 100;
        document.getElementById('reverb-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Reverb] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Reverb] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Reverb] Module unloading');
    }
  }
};
