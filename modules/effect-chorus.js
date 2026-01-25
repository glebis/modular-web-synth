// Chorus effect module with rate, depth, and mix controls

export default {
  id: "effect-chorus",
  name: "Chorus Effect",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create chorus using multiple delay lines with LFO modulation
      const delayNode1 = ctx.createDelay(0.1);
      const delayNode2 = ctx.createDelay(0.1);
      const delayNode3 = ctx.createDelay(0.1);

      // LFO oscillators for each delay line (slightly detuned)
      const lfo1 = ctx.createOscillator();
      const lfo2 = ctx.createOscillator();
      const lfo3 = ctx.createOscillator();

      // Depth control (modulation amount)
      const depth1 = ctx.createGain();
      const depth2 = ctx.createGain();
      const depth3 = ctx.createGain();

      // Wet and dry mix
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();
      const chorusMix = ctx.createGain();

      // Set initial values
      const baseDelay = 0.02; // 20ms base delay
      delayNode1.delayTime.value = baseDelay;
      delayNode2.delayTime.value = baseDelay;
      delayNode3.delayTime.value = baseDelay;

      // LFO frequencies (slightly different for richer chorus)
      lfo1.frequency.value = 0.5;
      lfo2.frequency.value = 0.7;
      lfo3.frequency.value = 0.9;
      lfo1.type = 'sine';
      lfo2.type = 'sine';
      lfo3.type = 'sine';

      // Depth (modulation amount in seconds)
      depth1.gain.value = 0.003; // 3ms modulation
      depth2.gain.value = 0.003;
      depth3.gain.value = 0.003;

      // Mix settings
      wetGain.gain.value = 0.5;
      dryGain.gain.value = 0.5;

      // Connect LFO modulation to delay times
      lfo1.connect(depth1);
      lfo2.connect(depth2);
      lfo3.connect(depth3);
      depth1.connect(delayNode1.delayTime);
      depth2.connect(delayNode2.delayTime);
      depth3.connect(delayNode3.delayTime);

      // Start oscillators
      lfo1.start();
      lfo2.start();
      lfo3.start();

      // Mix the three delayed signals together
      delayNode1.connect(chorusMix);
      delayNode2.connect(chorusMix);
      delayNode3.connect(chorusMix);

      // Wet signal path
      chorusMix.connect(wetGain);
      wetGain.connect(outputMix);

      // Dry signal path
      dryGain.connect(outputMix);

      // Input splitter
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(delayNode1);
      inputSplitter.connect(delayNode2);
      inputSplitter.connect(delayNode3);
      inputSplitter.connect(dryGain);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          lfo1: lfo1,
          lfo2: lfo2,
          lfo3: lfo3,
          depth1: depth1,
          depth2: depth2,
          depth3: depth3,
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
      <h2>Chorus Effect</h2>
      <div class="control-group">
        <label class="control-label">
          Rate <span class="control-value" id="chorus-rate-value">0.7 Hz</span>
        </label>
        <input type="range" id="chorus-rate" min="0.1" max="5" step="0.1" value="0.7">
      </div>
      <div class="control-group">
        <label class="control-label">
          Depth <span class="control-value" id="chorus-depth-value">30%</span>
        </label>
        <input type="range" id="chorus-depth" min="0" max="100" value="30">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="chorus-mix-value">50%</span>
        </label>
        <input type="range" id="chorus-mix" min="0" max="100" value="50">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { lfo1, lfo2, lfo3, depth1, depth2, depth3, wet, dry } = audioNodes.nodes;

      // Rate control (LFO frequency)
      const rateSlider = document.getElementById('chorus-rate');
      const rateValue = document.getElementById('chorus-rate-value');

      rateSlider.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        // Set slightly different rates for each LFO
        lfo1.frequency.value = rate * 0.8;
        lfo2.frequency.value = rate;
        lfo3.frequency.value = rate * 1.2;
        params.rate = rate;
        rateValue.textContent = rate.toFixed(1) + ' Hz';
      });

      // Depth control (modulation amount)
      const depthSlider = document.getElementById('chorus-depth');
      const depthValue = document.getElementById('chorus-depth-value');

      depthSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        // Convert percentage to modulation depth in seconds (0-10ms)
        const depth = (percent / 100) * 0.01;
        depth1.gain.value = depth;
        depth2.gain.value = depth;
        depth3.gain.value = depth;
        params.depth = depth;
        depthValue.textContent = Math.round(percent) + '%';
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('chorus-mix');
      const mixValue = document.getElementById('chorus-mix-value');

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
      rate: 0.7,
      depth: 0.003,
      mix: 0.5
    },
    save: (params) => ({
      rate: params.rate,
      depth: params.depth,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { lfo1, lfo2, lfo3, depth1, depth2, depth3, wet, dry } = audioNodes.nodes;

      if (saved.rate !== undefined) {
        lfo1.frequency.value = saved.rate * 0.8;
        lfo2.frequency.value = saved.rate;
        lfo3.frequency.value = saved.rate * 1.2;
        params.rate = saved.rate;
        document.getElementById('chorus-rate').value = saved.rate;
        document.getElementById('chorus-rate-value').textContent = saved.rate.toFixed(1) + ' Hz';
      }
      if (saved.depth !== undefined) {
        depth1.gain.value = saved.depth;
        depth2.gain.value = saved.depth;
        depth3.gain.value = saved.depth;
        params.depth = saved.depth;
        const depthPercent = (saved.depth / 0.01) * 100;
        document.getElementById('chorus-depth').value = depthPercent;
        document.getElementById('chorus-depth-value').textContent = Math.round(depthPercent) + '%';
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('chorus-mix').value = saved.mix * 100;
        document.getElementById('chorus-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Chorus] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Chorus] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Chorus] Module unloading');
    }
  }
};
