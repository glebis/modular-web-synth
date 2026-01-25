// Reggae Dub Delay Stereo - Classic dub delay with stereo ping-pong and filtering

export default {
  id: "effect-reggi-dub-delay-stereo",
  name: "Reggi Dub Delay Stereo",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create stereo splitter and merger
      const splitter = ctx.createChannelSplitter(2);
      const merger = ctx.createChannelMerger(2);

      // Left channel delay chain
      const delayLeft = ctx.createDelay(2.0);
      const feedbackLeft = ctx.createGain();
      const filterLeft = ctx.createBiquadFilter();
      const wetLeft = ctx.createGain();

      // Right channel delay chain
      const delayRight = ctx.createDelay(2.0);
      const feedbackRight = ctx.createGain();
      const filterRight = ctx.createBiquadFilter();
      const wetRight = ctx.createGain();

      // Dry signal and output mix
      const dryGain = ctx.createGain();
      const outputMix = ctx.createGain();

      // Ping-pong cross-feedback
      const crossFeedback = ctx.createGain();

      // Set initial values - classic dub settings
      delayLeft.delayTime.value = 0.375;      // 3/16 note at 120bpm
      delayRight.delayTime.value = 0.5;       // 1/4 note at 120bpm (dotted rhythm)
      feedbackLeft.gain.value = 0.6;          // 60% feedback for dub trails
      feedbackRight.gain.value = 0.6;
      crossFeedback.gain.value = 0.3;         // Stereo ping-pong amount
      wetLeft.gain.value = 0.7;
      wetRight.gain.value = 0.7;
      dryGain.gain.value = 0.6;

      // Configure filters for dub "tape delay" character
      filterLeft.type = 'lowpass';
      filterLeft.frequency.value = 2400;      // Roll off highs on each repeat
      filterLeft.Q.value = 0.5;

      filterRight.type = 'lowpass';
      filterRight.frequency.value = 2400;
      filterRight.Q.value = 0.5;

      // Input routing
      const inputNode = ctx.createGain();

      // Connect stereo split
      inputNode.connect(splitter);

      // Left channel feedback loop with filter
      splitter.connect(delayLeft, 0);
      delayLeft.connect(filterLeft);
      filterLeft.connect(feedbackLeft);
      feedbackLeft.connect(delayLeft);

      // Right channel feedback loop with filter
      splitter.connect(delayRight, 1);
      delayRight.connect(filterRight);
      filterRight.connect(feedbackRight);
      feedbackRight.connect(delayRight);

      // Cross-feedback for ping-pong (left -> right, right -> left)
      filterLeft.connect(crossFeedback);
      crossFeedback.connect(delayRight);
      filterRight.connect(crossFeedback);
      crossFeedback.connect(delayLeft);

      // Wet signal routing to merger
      filterLeft.connect(wetLeft);
      wetLeft.connect(merger, 0, 0);

      filterRight.connect(wetRight);
      wetRight.connect(merger, 0, 1);

      // Dry signal routing
      inputNode.connect(dryGain);
      dryGain.connect(outputMix);

      // Wet to output
      merger.connect(outputMix);

      return {
        input: inputNode,
        output: outputMix,
        nodes: {
          delayLeft,
          delayRight,
          feedbackLeft,
          feedbackRight,
          filterLeft,
          filterRight,
          wetLeft,
          wetRight,
          dryGain,
          crossFeedback
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Reggi Dub Delay Stereo</h2>
      <div class="control-group">
        <label class="control-label">
          Left Time <span class="control-value" id="dub-time-left-value">375 ms</span>
        </label>
        <input type="range" id="dub-time-left" min="50" max="2000" step="5" value="375">
      </div>
      <div class="control-group">
        <label class="control-label">
          Right Time <span class="control-value" id="dub-time-right-value">500 ms</span>
        </label>
        <input type="range" id="dub-time-right" min="50" max="2000" step="5" value="500">
      </div>
      <div class="control-group">
        <label class="control-label">
          Feedback <span class="control-value" id="dub-feedback-value">60%</span>
        </label>
        <input type="range" id="dub-feedback" min="0" max="90" value="60">
      </div>
      <div class="control-group">
        <label class="control-label">
          Ping-Pong <span class="control-value" id="dub-pingpong-value">30%</span>
        </label>
        <input type="range" id="dub-pingpong" min="0" max="100" value="30">
      </div>
      <div class="control-group">
        <label class="control-label">
          Filter <span class="control-value" id="dub-filter-value">2400 Hz</span>
        </label>
        <input type="range" id="dub-filter" min="400" max="8000" step="100" value="2400">
      </div>
      <div class="control-group">
        <label class="control-label">
          Mix <span class="control-value" id="dub-mix-value">70%</span>
        </label>
        <input type="range" id="dub-mix" min="0" max="100" value="70">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { delayLeft, delayRight, feedbackLeft, feedbackRight, filterLeft, filterRight, wetLeft, wetRight, dryGain, crossFeedback } = audioNodes.nodes;

      // Left delay time control
      const timeLeftSlider = document.getElementById('dub-time-left');
      const timeLeftValue = document.getElementById('dub-time-left-value');

      timeLeftSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        delayLeft.delayTime.value = seconds;
        params.timeLeft = seconds;
        timeLeftValue.textContent = Math.round(ms) + ' ms';
      });

      // Right delay time control
      const timeRightSlider = document.getElementById('dub-time-right');
      const timeRightValue = document.getElementById('dub-time-right-value');

      timeRightSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        const seconds = ms / 1000;
        delayRight.delayTime.value = seconds;
        params.timeRight = seconds;
        timeRightValue.textContent = Math.round(ms) + ' ms';
      });

      // Feedback control (both channels)
      const feedbackSlider = document.getElementById('dub-feedback');
      const feedbackValue = document.getElementById('dub-feedback-value');

      feedbackSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        feedbackLeft.gain.value = gain;
        feedbackRight.gain.value = gain;
        params.feedback = gain;
        feedbackValue.textContent = Math.round(percent) + '%';
      });

      // Ping-pong (cross-feedback) control
      const pingpongSlider = document.getElementById('dub-pingpong');
      const pingpongValue = document.getElementById('dub-pingpong-value');

      pingpongSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        crossFeedback.gain.value = gain;
        params.pingpong = gain;
        pingpongValue.textContent = Math.round(percent) + '%';
      });

      // Filter control (both channels)
      const filterSlider = document.getElementById('dub-filter');
      const filterValue = document.getElementById('dub-filter-value');

      filterSlider.addEventListener('input', (e) => {
        const freq = parseFloat(e.target.value);
        filterLeft.frequency.value = freq;
        filterRight.frequency.value = freq;
        params.filter = freq;
        filterValue.textContent = Math.round(freq) + ' Hz';
      });

      // Mix control (wet/dry balance)
      const mixSlider = document.getElementById('dub-mix');
      const mixValue = document.getElementById('dub-mix-value');

      mixSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const wetAmount = percent / 100;
        wetLeft.gain.value = wetAmount;
        wetRight.gain.value = wetAmount;
        dryGain.gain.value = 1 - (wetAmount * 0.5); // Dry compensated for wet
        params.mix = wetAmount;
        mixValue.textContent = Math.round(percent) + '%';
      });
    }
  },

  state: {
    defaults: {
      timeLeft: 0.375,
      timeRight: 0.5,
      feedback: 0.6,
      pingpong: 0.3,
      filter: 2400,
      mix: 0.7
    },
    save: (params) => ({
      timeLeft: params.timeLeft,
      timeRight: params.timeRight,
      feedback: params.feedback,
      pingpong: params.pingpong,
      filter: params.filter,
      mix: params.mix
    }),
    load: (params, saved, audioNodes) => {
      const { delayLeft, delayRight, feedbackLeft, feedbackRight, filterLeft, filterRight, wetLeft, wetRight, dryGain, crossFeedback } = audioNodes.nodes;

      if (saved.timeLeft !== undefined) {
        delayLeft.delayTime.value = saved.timeLeft;
        params.timeLeft = saved.timeLeft;
        document.getElementById('dub-time-left').value = saved.timeLeft * 1000;
        document.getElementById('dub-time-left-value').textContent = Math.round(saved.timeLeft * 1000) + ' ms';
      }

      if (saved.timeRight !== undefined) {
        delayRight.delayTime.value = saved.timeRight;
        params.timeRight = saved.timeRight;
        document.getElementById('dub-time-right').value = saved.timeRight * 1000;
        document.getElementById('dub-time-right-value').textContent = Math.round(saved.timeRight * 1000) + ' ms';
      }

      if (saved.feedback !== undefined) {
        feedbackLeft.gain.value = saved.feedback;
        feedbackRight.gain.value = saved.feedback;
        params.feedback = saved.feedback;
        document.getElementById('dub-feedback').value = saved.feedback * 100;
        document.getElementById('dub-feedback-value').textContent = Math.round(saved.feedback * 100) + '%';
      }

      if (saved.pingpong !== undefined) {
        crossFeedback.gain.value = saved.pingpong;
        params.pingpong = saved.pingpong;
        document.getElementById('dub-pingpong').value = saved.pingpong * 100;
        document.getElementById('dub-pingpong-value').textContent = Math.round(saved.pingpong * 100) + '%';
      }

      if (saved.filter !== undefined) {
        filterLeft.frequency.value = saved.filter;
        filterRight.frequency.value = saved.filter;
        params.filter = saved.filter;
        document.getElementById('dub-filter').value = saved.filter;
        document.getElementById('dub-filter-value').textContent = Math.round(saved.filter) + ' Hz';
      }

      if (saved.mix !== undefined) {
        wetLeft.gain.value = saved.mix;
        wetRight.gain.value = saved.mix;
        dryGain.gain.value = 1 - (saved.mix * 0.5);
        params.mix = saved.mix;
        document.getElementById('dub-mix').value = saved.mix * 100;
        document.getElementById('dub-mix-value').textContent = Math.round(saved.mix * 100) + '%';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Reggi Dub Delay Stereo] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Reggi Dub Delay Stereo] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Reggi Dub Delay Stereo] Module unloading');
    }
  }
};
