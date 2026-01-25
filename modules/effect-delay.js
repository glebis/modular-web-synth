// Delay effect module with time and feedback controls

export default {
  id: "effect-delay",
  name: "Delay Effect",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create delay line with feedback loop
      const delayNode = ctx.createDelay(2.0);  // Max 2 seconds delay
      const feedbackGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Set initial values
      delayNode.delayTime.value = 0.3;   // 300ms delay
      feedbackGain.gain.value = 0.4;     // 40% feedback
      wetGain.gain.value = 0.5;          // 50% wet signal
      dryGain.gain.value = 0.5;          // 50% dry signal

      // Create feedback loop: delay -> feedback gain -> delay
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);

      // Wet signal path
      delayNode.connect(wetGain);
      wetGain.connect(outputMix);

      // Dry signal path (input also goes to dry)
      dryGain.connect(outputMix);

      // Input splitter (for dry/wet routing)
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(delayNode);
      inputSplitter.connect(dryGain);

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          delay: delayNode,
          feedback: feedbackGain,
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
      <h2>Delay Effect</h2>
      <div class="control-group">
        <label class="control-label">
          Time <span class="control-value" id="delay-time-value">300 ms</span>
        </label>
        <input type="range" id="delay-time" min="0" max="2000" step="10" value="300">
      </div>
      <div class="control-group">
        <label class="control-label">
          Feedback <span class="control-value" id="delay-feedback-value">40%</span>
        </label>
        <input type="range" id="delay-feedback" min="0" max="95" value="40">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="delay-mix-value">50%</span>
        </label>
        <input type="range" id="delay-mix" min="0" max="100" value="50">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { delay, feedback, wet, dry } = audioNodes.nodes;

      // Delay time control
      const timeSlider = document.getElementById('delay-time');
      const timeValue = document.getElementById('delay-time-value');

      timeSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        delay.delayTime.value = seconds;
        params.time = seconds;
        timeValue.textContent = Math.round(ms) + ' ms';
      });

      // Feedback control
      const feedbackSlider = document.getElementById('delay-feedback');
      const feedbackValue = document.getElementById('delay-feedback-value');

      feedbackSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        feedback.gain.value = gain;
        params.feedback = gain;
        feedbackValue.textContent = Math.round(percent) + '%';
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('delay-mix');
      const mixValue = document.getElementById('delay-mix-value');

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
      time: 0.3,
      feedback: 0.4,
      mix: 0.5
    },
    save: (params) => ({
      time: params.time,
      feedback: params.feedback,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { delay, feedback, wet, dry } = audioNodes.nodes;

      if (saved.time !== undefined) {
        delay.delayTime.value = saved.time;
        params.time = saved.time;
        document.getElementById('delay-time').value = saved.time * 1000;
        document.getElementById('delay-time-value').textContent = Math.round(saved.time * 1000) + ' ms';
      }
      if (saved.feedback !== undefined) {
        feedback.gain.value = saved.feedback;
        params.feedback = saved.feedback;
        document.getElementById('delay-feedback').value = saved.feedback * 100;
        document.getElementById('delay-feedback-value').textContent = Math.round(saved.feedback * 100) + '%';
      }
      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('delay-mix').value = saved.mix * 100;
        document.getElementById('delay-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Delay] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Delay] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Delay] Module unloading');
    }
  }
};
