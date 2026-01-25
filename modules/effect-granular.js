// Granular Synthesis module - break audio into tiny grains and rearrange
// Simplified implementation using multiple delay taps with envelopes

export default {
  id: "effect-granular",
  name: "Granular Synthesizer",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create multiple delay lines (grains)
      const numGrains = 8;
      const grains = [];
      const grainGains = [];

      // Master buffer delay
      const bufferDelay = ctx.createDelay(2.0);
      bufferDelay.delayTime.value = 0.5; // 500ms buffer

      // Create grain delay taps
      for (let i = 0; i < numGrains; i++) {
        const delay = ctx.createDelay(2.0);
        const gain = ctx.createGain();

        // Randomize grain positions
        const grainPos = (i / numGrains) * 0.4 + Math.random() * 0.1;
        delay.delayTime.value = grainPos;
        gain.gain.value = 0.3 / numGrains; // Spread volume across grains

        // Connect buffer to this grain
        bufferDelay.connect(delay);
        delay.connect(gain);

        grains.push(delay);
        grainGains.push(gain);
      }

      // Mix all grains
      const grainMix = ctx.createGain();
      grainGains.forEach(g => g.connect(grainMix));

      // Wet/dry controls
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      grainMix.connect(wetGain);
      wetGain.connect(outputMix);
      dryGain.connect(outputMix);

      // Set initial mix
      wetGain.gain.value = 0.8;
      dryGain.gain.value = 0.2;

      // Input splitter
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(bufferDelay);
      inputSplitter.connect(dryGain);

      // Store grain info for manipulation
      const grainData = grains.map((delay, i) => ({
        delay,
        gain: grainGains[i],
        basePosition: (i / numGrains) * 0.4
      }));

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          bufferDelay: bufferDelay,
          grains: grainData,
          grainMix: grainMix,
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
      <h2>Granular Synthesizer</h2>
      <div class="control-group">
        <label class="control-label">
          Grain Size <span class="control-value" id="granular-size-value">50 ms</span>
        </label>
        <input type="range" id="granular-size" min="10" max="200" step="5" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Grain Density <span class="control-value" id="granular-density-value">8</span>
        </label>
        <input type="range" id="granular-density" min="2" max="16" step="1" value="8">
      </div>
      <div class="control-group">
        <label class="control-label">
          Grain Spread <span class="control-value" id="granular-spread-value">50%</span>
        </label>
        <input type="range" id="granular-spread" min="0" max="100" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Randomness <span class="control-value" id="granular-random-value">30%</span>
        </label>
        <input type="range" id="granular-random" min="0" max="100" value="30">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="granular-mix-value">80%</span>
        </label>
        <input type="range" id="granular-mix" min="0" max="100" value="80">
      </div>
      <div class="control-group">
        <button id="granular-randomize" class="module-btn" style="width: 100%; margin-top: 10px;">
          Randomize Grains
        </button>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { bufferDelay, grains, grainMix, wet, dry } = audioNodes.nodes;

      // Initialize params
      params.grainSize = 0.05;
      params.spread = 0.5;
      params.randomness = 0.3;

      // Grain size control (affects buffer delay)
      const sizeSlider = document.getElementById('granular-size');
      const sizeValue = document.getElementById('granular-size-value');

      sizeSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        params.grainSize = seconds;
        bufferDelay.delayTime.value = seconds * 10; // Buffer is 10x grain size
        sizeValue.textContent = Math.round(ms) + ' ms';
      });

      // Density control (currently fixed at 8 grains)
      const densitySlider = document.getElementById('granular-density');
      const densityValue = document.getElementById('granular-density-value');

      densitySlider.addEventListener('input', (e) => {
        const density = parseInt(e.target.value);
        params.density = density;
        densityValue.textContent = density;

        // Adjust gain per grain to maintain volume
        const gainPerGrain = 0.3 / density;
        grains.forEach(g => {
          g.gain.gain.value = gainPerGrain;
        });
      });

      // Spread control (how far apart grains are)
      const spreadSlider = document.getElementById('granular-spread');
      const spreadValue = document.getElementById('granular-spread-value');

      spreadSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        params.spread = percent / 100;
        spreadValue.textContent = Math.round(percent) + '%';

        // Update grain positions
        updateGrainPositions();
      });

      // Randomness control
      const randomSlider = document.getElementById('granular-random');
      const randomValue = document.getElementById('granular-random-value');

      randomSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        params.randomness = percent / 100;
        randomValue.textContent = Math.round(percent) + '%';

        // Update grain positions
        updateGrainPositions();
      });

      // Mix control
      const mixSlider = document.getElementById('granular-mix');
      const mixValue = document.getElementById('granular-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const wetAmount = percent / 100;
        const dryAmount = 1 - wetAmount;
        wet.gain.value = wetAmount;
        dry.gain.value = dryAmount;
        params.mix = wetAmount;
        mixValue.textContent = Math.round(percent) + '%';
      });

      // Randomize button
      const randomizeBtn = document.getElementById('granular-randomize');

      randomizeBtn.addEventListener('click', () => {
        // Fully randomize grain positions across entire buffer
        grains.forEach((grain, i) => {
          // Random position between 0.01 and 1.5 seconds
          const randomPos = 0.01 + Math.random() * 1.49;
          grain.delay.delayTime.value = randomPos;
        });

        // Visual feedback
        randomizeBtn.textContent = 'Randomized!';
        setTimeout(() => {
          randomizeBtn.textContent = 'Randomize Grains';
        }, 300);
      });

      // Helper function to update grain positions
      function updateGrainPositions() {
        grains.forEach((grain, i) => {
          const basePos = grain.basePosition;
          const spread = params.spread || 0.5;
          const randomness = params.randomness || 0.3;

          // Calculate position with spread and randomness
          const spreadOffset = (Math.random() - 0.5) * spread * 0.5;
          const randomOffset = (Math.random() - 0.5) * randomness * 0.2;
          const newPos = Math.max(0.01, Math.min(1.9, basePos + spreadOffset + randomOffset));

          grain.delay.delayTime.value = newPos;
        });
      }
    }
  },

  state: {
    defaults: {
      grainSize: 0.05,
      density: 8,
      spread: 0.5,
      randomness: 0.3,
      mix: 0.8
    },
    save: (params) => ({
      grainSize: params.grainSize,
      density: params.density,
      spread: params.spread,
      randomness: params.randomness,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { bufferDelay, grains, wet, dry } = audioNodes.nodes;

      if (saved.grainSize !== undefined) {
        params.grainSize = saved.grainSize;
        bufferDelay.delayTime.value = saved.grainSize * 10;
        document.getElementById('granular-size').value = saved.grainSize * 1000;
        document.getElementById('granular-size-value').textContent = Math.round(saved.grainSize * 1000) + ' ms';
      }

      if (saved.density !== undefined) {
        params.density = saved.density;
        const gainPerGrain = 0.3 / saved.density;
        grains.forEach(g => {
          g.gain.gain.value = gainPerGrain;
        });
        document.getElementById('granular-density').value = saved.density;
        document.getElementById('granular-density-value').textContent = saved.density;
      }

      if (saved.spread !== undefined) {
        params.spread = saved.spread;
        document.getElementById('granular-spread').value = saved.spread * 100;
        document.getElementById('granular-spread-value').textContent = Math.round(saved.spread * 100) + '%';
      }

      if (saved.randomness !== undefined) {
        params.randomness = saved.randomness;
        document.getElementById('granular-random').value = saved.randomness * 100;
        document.getElementById('granular-random-value').textContent = Math.round(saved.randomness * 100) + '%';
      }

      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('granular-mix').value = saved.mix * 100;
        document.getElementById('granular-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Granular Synthesizer] Module loaded');
      console.log('[Granular Synthesizer] Using simplified multi-tap delay granulation');
    },
    onConnect: (ctx) => {
      console.log('[Granular Synthesizer] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Granular Synthesizer] Module unloading');
    }
  }
};
