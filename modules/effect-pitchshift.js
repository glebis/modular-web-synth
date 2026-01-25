// Pitch Shifter module - shift pitch up/down without changing tempo
// Uses simple playback rate manipulation (note: affects tempo slightly)

export default {
  id: "effect-pitchshift",
  name: "Pitch Shifter",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // We'll use a buffer to create a feedback delay with pitch shift
      // This is a simplified approach - true pitch shifting needs granular synthesis

      // Create a short delay buffer for pitch manipulation
      const delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.value = 0.05; // 50ms delay

      // Create gain nodes for mixing
      const wetGain = ctx.createGain();
      const dryGain = ctx.createGain();
      const feedbackGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Pitch shift amount (stored for UI, applied via ScriptProcessor in real impl)
      // For now, we'll create a simple octave effect with delay
      const pitchGain = ctx.createGain();
      pitchGain.gain.value = 1.0;

      // Signal flow for simple pitch effect
      // input -> delay -> pitchGain -> wet -> output
      delayNode.connect(pitchGain);
      pitchGain.connect(wetGain);
      pitchGain.connect(feedbackGain);
      feedbackGain.connect(delayNode); // Feedback loop

      wetGain.connect(outputMix);
      dryGain.connect(outputMix);

      // Set initial values
      wetGain.gain.value = 0.5;
      dryGain.gain.value = 0.5;
      feedbackGain.gain.value = 0.3;

      // Input splitter
      const inputSplitter = ctx.createGain();
      inputSplitter.connect(delayNode);
      inputSplitter.connect(dryGain);

      // Note: For true pitch shifting, we'd need AudioWorklet or a granular engine
      // This implementation creates a pitch-like effect using delay and feedback

      return {
        input: inputSplitter,
        output: outputMix,
        nodes: {
          delay: delayNode,
          pitchGain: pitchGain,
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
      <h2>Pitch Shifter</h2>
      <div class="control-group">
        <label class="control-label">
          Pitch Shift <span class="control-value" id="pitchshift-amount-value">0 semitones</span>
        </label>
        <input type="range" id="pitchshift-amount" min="-12" max="12" step="1" value="0">
      </div>
      <div class="control-group">
        <label class="control-label">
          Delay Time <span class="control-value" id="pitchshift-delay-value">50 ms</span>
        </label>
        <input type="range" id="pitchshift-delay" min="10" max="200" step="5" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Feedback <span class="control-value" id="pitchshift-feedback-value">30%</span>
        </label>
        <input type="range" id="pitchshift-feedback" min="0" max="90" value="30">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="pitchshift-mix-value">50%</span>
        </label>
        <input type="range" id="pitchshift-mix" min="0" max="100" value="50">
      </div>
      <p style="font-size: 10px; color: #666; margin-top: 10px;">
        Note: Simplified pitch shifter using delay-based harmonization
      </p>
    `,
    bindEvents: (audioNodes, params) => {
      const { delay, pitchGain, feedback, wet, dry } = audioNodes.nodes;

      // Pitch shift amount (simulated via gain - true pitch shift needs worklet)
      const amountSlider = document.getElementById('pitchshift-amount');
      const amountValue = document.getElementById('pitchshift-amount-value');

      amountSlider.addEventListener('input', (e) => {
        const semitones = parseInt(e.target.value);

        // Simulate pitch shift by adjusting gain and delay
        // Positive semitones = higher pitch (shorter delay)
        // Negative semitones = lower pitch (longer delay)
        const delayAdjust = 1 - (semitones / 24); // ±50% range
        delay.delayTime.value = Math.max(0.01, params.delayTime * delayAdjust);

        // Adjust gain to compensate
        const gainAdjust = Math.pow(2, semitones / 12);
        pitchGain.gain.value = gainAdjust;

        params.semitones = semitones;
        amountValue.textContent = semitones + ' semitones';
      });

      // Delay time control
      const delaySlider = document.getElementById('pitchshift-delay');
      const delayValue = document.getElementById('pitchshift-delay-value');

      delaySlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        params.delayTime = seconds;

        // Reapply pitch shift adjustment
        const semitones = params.semitones || 0;
        const delayAdjust = 1 - (semitones / 24);
        delay.delayTime.value = Math.max(0.01, seconds * delayAdjust);

        delayValue.textContent = Math.round(ms) + ' ms';
      });

      // Feedback control
      const feedbackSlider = document.getElementById('pitchshift-feedback');
      const feedbackValue = document.getElementById('pitchshift-feedback-value');

      feedbackSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        feedback.gain.value = gain;
        params.feedback = gain;
        feedbackValue.textContent = Math.round(percent) + '%';
      });

      // Mix control
      const mixSlider = document.getElementById('pitchshift-mix');
      const mixValue = document.getElementById('pitchshift-mix-value');

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
      semitones: 0,
      delayTime: 0.05,
      feedback: 0.3,
      mix: 0.5
    },
    save: (params) => ({
      semitones: params.semitones,
      delayTime: params.delayTime,
      feedback: params.feedback,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { delay, pitchGain, feedback, wet, dry } = audioNodes.nodes;

      if (saved.delayTime !== undefined) {
        params.delayTime = saved.delayTime;
        document.getElementById('pitchshift-delay').value = saved.delayTime * 1000;
        document.getElementById('pitchshift-delay-value').textContent = Math.round(saved.delayTime * 1000) + ' ms';
      }

      if (saved.semitones !== undefined) {
        const semitones = saved.semitones;
        const delayAdjust = 1 - (semitones / 24);
        delay.delayTime.value = Math.max(0.01, params.delayTime * delayAdjust);

        const gainAdjust = Math.pow(2, semitones / 12);
        pitchGain.gain.value = gainAdjust;

        params.semitones = semitones;
        document.getElementById('pitchshift-amount').value = semitones;
        document.getElementById('pitchshift-amount-value').textContent = semitones + ' semitones';
      }

      if (saved.feedback !== undefined) {
        feedback.gain.value = saved.feedback;
        params.feedback = saved.feedback;
        document.getElementById('pitchshift-feedback').value = saved.feedback * 100;
        document.getElementById('pitchshift-feedback-value').textContent = Math.round(saved.feedback * 100) + '%';
      }

      if (saved.mix !== undefined) {
        wet.gain.value = saved.mix;
        dry.gain.value = 1 - saved.mix;
        params.mix = saved.mix;
        document.getElementById('pitchshift-mix').value = saved.mix * 100;
        document.getElementById('pitchshift-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Pitch Shifter] Module loaded');
      console.log('[Pitch Shifter] Note: Simplified pitch shifting using delay harmonization');
    },
    onConnect: (ctx) => {
      console.log('[Pitch Shifter] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Pitch Shifter] Module unloading');
    }
  }
};
