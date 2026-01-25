// Wah-wah delay effect - combines auto-wah filter with delay

export default {
  id: "effect-wah-delay",
  name: "Wah-Wah Delay",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create delay line with feedback
      const delayNode = ctx.createDelay(2.0);
      const feedbackGain = ctx.createGain();

      // Create wah-wah filter (bandpass filter with LFO modulation)
      const wahFilter = ctx.createBiquadFilter();
      wahFilter.type = 'bandpass';
      wahFilter.frequency.value = 1000;
      wahFilter.Q.value = 10;  // High Q for pronounced wah effect

      // LFO for wah-wah modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 2;  // 2 Hz LFO
      lfoGain.gain.value = 500;  // Modulation depth (±500 Hz)

      // Connect LFO to filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(wahFilter.frequency);
      lfo.start();

      // Wet/dry mix
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Set initial values
      delayNode.delayTime.value = 0.375;  // 375ms delay
      feedbackGain.gain.value = 0.5;      // 50% feedback
      wetGain.gain.value = 0.6;           // 60% wet signal
      dryGain.gain.value = 0.4;           // 40% dry signal

      // Create audio routing:
      // input -> delay -> wah filter -> feedback -> delay (loop)
      //                              -> wet gain -> output
      //       -> dry gain -> output

      const inputSplitter = ctx.createGain();

      // Delay + wah path
      inputSplitter.connect(delayNode);
      delayNode.connect(wahFilter);
      wahFilter.connect(feedbackGain);
      feedbackGain.connect(delayNode);  // Feedback loop
      wahFilter.connect(wetGain);
      wetGain.connect(outputMix);

      // Dry path
      inputSplitter.connect(dryGain);
      dryGain.connect(outputMix);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          delay: delayNode,
          feedback: feedbackGain,
          wahFilter: wahFilter,
          lfo: lfo,
          lfoGain: lfoGain,
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
      <h2>Wah-Wah Delay</h2>
      <div class="control-group">
        <label class="control-label">
          Delay Time <span class="control-value" id="wah-delay-time-value">375 ms</span>
        </label>
        <input type="range" id="wah-delay-time" min="50" max="2000" step="25" value="375">
      </div>
      <div class="control-group">
        <label class="control-label">
          Feedback <span class="control-value" id="wah-delay-feedback-value">50%</span>
        </label>
        <input type="range" id="wah-delay-feedback" min="0" max="90" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Wah Speed <span class="control-value" id="wah-speed-value">2.0 Hz</span>
        </label>
        <input type="range" id="wah-speed" min="0.1" max="10" step="0.1" value="2.0">
      </div>
      <div class="control-group">
        <label class="control-label">
          Wah Depth <span class="control-value" id="wah-depth-value">500 Hz</span>
        </label>
        <input type="range" id="wah-depth" min="100" max="2000" step="50" value="500">
      </div>
      <div class="control-group">
        <label class="control-label">
          Wah Center <span class="control-value" id="wah-center-value">1000 Hz</span>
        </label>
        <input type="range" id="wah-center" min="200" max="3000" step="50" value="1000">
      </div>
      <div class="control-group">
        <label class="control-label">
          Resonance <span class="control-value" id="wah-resonance-value">10</span>
        </label>
        <input type="range" id="wah-resonance" min="1" max="30" step="0.5" value="10">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="wah-delay-mix-value">60%</span>
        </label>
        <input type="range" id="wah-delay-mix" min="0" max="100" value="60">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { delay, feedback, wahFilter, lfo, lfoGain, wet, dry } = audioNodes.nodes;

      // Delay time control
      const timeSlider = document.getElementById('wah-delay-time');
      const timeValue = document.getElementById('wah-delay-time-value');

      timeSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        delay.delayTime.value = seconds;
        params.delayTime = seconds;
        timeValue.textContent = Math.round(ms) + ' ms';
      });

      // Feedback control
      const feedbackSlider = document.getElementById('wah-delay-feedback');
      const feedbackValue = document.getElementById('wah-delay-feedback-value');

      feedbackSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        feedback.gain.value = gain;
        params.feedback = gain;
        feedbackValue.textContent = Math.round(percent) + '%';
      });

      // Wah speed (LFO rate)
      const speedSlider = document.getElementById('wah-speed');
      const speedValue = document.getElementById('wah-speed-value');

      speedSlider.addEventListener('input', (e) => {
        const hz = parseFloat(e.target.value);
        lfo.frequency.value = hz;
        params.wahSpeed = hz;
        speedValue.textContent = hz.toFixed(1) + ' Hz';
      });

      // Wah depth (LFO amplitude)
      const depthSlider = document.getElementById('wah-depth');
      const depthValue = document.getElementById('wah-depth-value');

      depthSlider.addEventListener('input', (e) => {
        const depth = parseFloat(e.target.value);
        lfoGain.gain.value = depth;
        params.wahDepth = depth;
        depthValue.textContent = Math.round(depth) + ' Hz';
      });

      // Wah center frequency
      const centerSlider = document.getElementById('wah-center');
      const centerValue = document.getElementById('wah-center-value');

      centerSlider.addEventListener('input', (e) => {
        const freq = parseFloat(e.target.value);
        wahFilter.frequency.value = freq;
        params.wahCenter = freq;
        centerValue.textContent = Math.round(freq) + ' Hz';
      });

      // Resonance (filter Q)
      const resonanceSlider = document.getElementById('wah-resonance');
      const resonanceValue = document.getElementById('wah-resonance-value');

      resonanceSlider.addEventListener('input', (e) => {
        const q = parseFloat(e.target.value);
        wahFilter.Q.value = q;
        params.resonance = q;
        resonanceValue.textContent = q.toFixed(1);
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('wah-delay-mix');
      const mixValue = document.getElementById('wah-delay-mix-value');

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
      delayTime: 0.375,
      feedback: 0.5,
      wahSpeed: 2.0,
      wahDepth: 500,
      wahCenter: 1000,
      resonance: 10,
      mix: 0.6
    },
    save: (params) => ({
      delayTime: params.delayTime,
      feedback: params.feedback,
      wahSpeed: params.wahSpeed,
      wahDepth: params.wahDepth,
      wahCenter: params.wahCenter,
      resonance: params.resonance,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { delay, feedback, wahFilter, lfo, lfoGain, wet, dry } = audioNodes.nodes;

      if (saved.delayTime !== undefined) {
        delay.delayTime.value = saved.delayTime;
        params.delayTime = saved.delayTime;
        document.getElementById('wah-delay-time').value = saved.delayTime * 1000;
        document.getElementById('wah-delay-time-value').textContent = Math.round(saved.delayTime * 1000) + ' ms';
      }
      if (saved.feedback !== undefined) {
        feedback.gain.value = saved.feedback;
        params.feedback = saved.feedback;
        document.getElementById('wah-delay-feedback').value = saved.feedback * 100;
        document.getElementById('wah-delay-feedback-value').textContent = Math.round(saved.feedback * 100) + '%';
      }
      if (saved.wahSpeed !== undefined) {
        lfo.frequency.value = saved.wahSpeed;
        params.wahSpeed = saved.wahSpeed;
        document.getElementById('wah-speed').value = saved.wahSpeed;
        document.getElementById('wah-speed-value').textContent = saved.wahSpeed.toFixed(1) + ' Hz';
      }
      if (saved.wahDepth !== undefined) {
        lfoGain.gain.value = saved.wahDepth;
        params.wahDepth = saved.wahDepth;
        document.getElementById('wah-depth').value = saved.wahDepth;
        document.getElementById('wah-depth-value').textContent = Math.round(saved.wahDepth) + ' Hz';
      }
      if (saved.wahCenter !== undefined) {
        wahFilter.frequency.value = saved.wahCenter;
        params.wahCenter = saved.wahCenter;
        document.getElementById('wah-center').value = saved.wahCenter;
        document.getElementById('wah-center-value').textContent = Math.round(saved.wahCenter) + ' Hz';
      }
      if (saved.resonance !== undefined) {
        wahFilter.Q.value = saved.resonance;
        params.resonance = saved.resonance;
        document.getElementById('wah-resonance').value = saved.resonance;
        document.getElementById('wah-resonance-value').textContent = saved.resonance.toFixed(1);
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('wah-delay-mix').value = saved.mix * 100;
        document.getElementById('wah-delay-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Wah-Wah Delay] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Wah-Wah Delay] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Wah-Wah Delay] Module unloading');
    }
  }
};
