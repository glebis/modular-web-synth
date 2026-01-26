// Envelope Follower - Extracts amplitude envelope from audio to control other parameters dynamically

export default {
  id: "effect-envelope-follower",
  name: "Envelope Follower",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create envelope follower using ScriptProcessor for amplitude detection
      const analyser = ctx.createAnalyser();
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();

      // Configurable filter for envelope control
      const envelopeFilter = ctx.createBiquadFilter();
      envelopeFilter.type = 'lowpass';
      envelopeFilter.frequency.value = 20; // Smooth out the envelope

      // Configure analyser for amplitude detection
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Set initial values
      inputGain.gain.value = 1.0;
      outputGain.gain.value = 1.0;

      // Audio routing
      inputGain.connect(analyser);
      inputGain.connect(outputGain);

      // Storage for envelope output value
      const envelopeState = {
        currentValue: 0,
        attackTime: 0.01,  // 10ms attack
        releaseTime: 0.1,  // 100ms release
        threshold: 0.01,
        sensitivity: 1.0,
        dataArray: new Uint8Array(analyser.frequencyBinCount),
        intervalId: null
      };

      return {
        input: inputGain,
        output: outputGain,
        nodes: {
          analyser: analyser,
          inputGain: inputGain,
          outputGain: outputGain,
          envelopeFilter: envelopeFilter
        },
        envelopeState: envelopeState
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Envelope Follower</h2>
      <div class="control-group">
        <label class="control-label">
          Envelope <span class="control-value" id="envelope-level-value">0.00</span>
        </label>
        <div style="background: #1a1a1a; padding: 8px; border-radius: 4px; margin-top: 4px;">
          <div id="envelope-meter" style="height: 20px; background: linear-gradient(to right, #00ff00, #00ff00); width: 0%; border-radius: 2px; transition: width 0.05s;"></div>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">
          Attack <span class="control-value" id="envelope-attack-value">10 ms</span>
        </label>
        <input type="range" id="envelope-attack" min="1" max="500" step="1" value="10">
      </div>
      <div class="control-group">
        <label class="control-label">
          Release <span class="control-value" id="envelope-release-value">100 ms</span>
        </label>
        <input type="range" id="envelope-release" min="10" max="2000" step="10" value="100">
      </div>
      <div class="control-group">
        <label class="control-label">
          Sensitivity <span class="control-value" id="envelope-sensitivity-value">100%</span>
        </label>
        <input type="range" id="envelope-sensitivity" min="10" max="300" value="100">
      </div>
      <div class="control-group">
        <label class="control-label">
          Threshold <span class="control-value" id="envelope-threshold-value">1%</span>
        </label>
        <input type="range" id="envelope-threshold" min="0" max="50" value="1">
      </div>
      <div class="control-group">
        <label class="control-label">
          Smoothing <span class="control-value" id="envelope-smoothing-value">20 Hz</span>
        </label>
        <input type="range" id="envelope-smoothing" min="5" max="100" step="5" value="20">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { analyser, envelopeFilter } = audioNodes.nodes;
      const { envelopeState } = audioNodes;

      // Attack time control
      const attackSlider = document.getElementById('envelope-attack');
      const attackValue = document.getElementById('envelope-attack-value');

      attackSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        envelopeState.attackTime = ms / 1000;
        params.attack = envelopeState.attackTime;
        attackValue.textContent = Math.round(ms) + ' ms';
      });

      // Release time control
      const releaseSlider = document.getElementById('envelope-release');
      const releaseValue = document.getElementById('envelope-release-value');

      releaseSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        envelopeState.releaseTime = ms / 1000;
        params.release = envelopeState.releaseTime;
        releaseValue.textContent = Math.round(ms) + ' ms';
      });

      // Sensitivity control
      const sensitivitySlider = document.getElementById('envelope-sensitivity');
      const sensitivityValue = document.getElementById('envelope-sensitivity-value');

      sensitivitySlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        envelopeState.sensitivity = percent / 100;
        params.sensitivity = envelopeState.sensitivity;
        sensitivityValue.textContent = Math.round(percent) + '%';
      });

      // Threshold control
      const thresholdSlider = document.getElementById('envelope-threshold');
      const thresholdValue = document.getElementById('envelope-threshold-value');

      thresholdSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        envelopeState.threshold = percent / 100;
        params.threshold = envelopeState.threshold;
        thresholdValue.textContent = Math.round(percent) + '%';
      });

      // Smoothing control (lowpass filter frequency)
      const smoothingSlider = document.getElementById('envelope-smoothing');
      const smoothingValue = document.getElementById('envelope-smoothing-value');

      smoothingSlider.addEventListener('input', (e) => {
        const hz = parseFloat(e.target.value);
        envelopeFilter.frequency.value = hz;
        params.smoothing = hz;
        smoothingValue.textContent = Math.round(hz) + ' Hz';
      });

      // Start envelope detection loop
      const levelValue = document.getElementById('envelope-level-value');
      const meterBar = document.getElementById('envelope-meter');

      envelopeState.intervalId = setInterval(() => {
        // Get time domain data for amplitude detection
        analyser.getByteTimeDomainData(envelopeState.dataArray);

        // Calculate RMS (root mean square) for better amplitude detection
        let sum = 0;
        for (let i = 0; i < envelopeState.dataArray.length; i++) {
          const normalized = (envelopeState.dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / envelopeState.dataArray.length);

        // Apply sensitivity
        let targetValue = rms * envelopeState.sensitivity;

        // Apply threshold
        if (targetValue < envelopeState.threshold) {
          targetValue = 0;
        }

        // Apply attack/release envelope
        const currentValue = envelopeState.currentValue;
        let newValue;

        if (targetValue > currentValue) {
          // Attack phase
          const attackRate = 1000 / (envelopeState.attackTime * 1000) * 0.02; // 50Hz update rate
          newValue = Math.min(targetValue, currentValue + attackRate);
        } else {
          // Release phase
          const releaseRate = 1000 / (envelopeState.releaseTime * 1000) * 0.02;
          newValue = Math.max(targetValue, currentValue - releaseRate);
        }

        envelopeState.currentValue = newValue;

        // Update UI
        levelValue.textContent = newValue.toFixed(2);
        meterBar.style.width = (newValue * 100) + '%';

        // Store in params for external access
        params.envelopeValue = newValue;

      }, 20); // 50Hz update rate
    }
  },

  state: {
    defaults: {
      attack: 0.01,
      release: 0.1,
      sensitivity: 1.0,
      threshold: 0.01,
      smoothing: 20,
      envelopeValue: 0
    },
    save: (params) => ({
      attack: params.attack,
      release: params.release,
      sensitivity: params.sensitivity,
      threshold: params.threshold,
      smoothing: params.smoothing
    }),
    load: (params, saved, audioNodes) => {
      const { envelopeFilter } = audioNodes.nodes;
      const { envelopeState } = audioNodes;

      if (saved.attack !== undefined) {
        envelopeState.attackTime = saved.attack;
        params.attack = saved.attack;
        document.getElementById('envelope-attack').value = saved.attack * 1000;
        document.getElementById('envelope-attack-value').textContent = Math.round(saved.attack * 1000) + ' ms';
      }
      if (saved.release !== undefined) {
        envelopeState.releaseTime = saved.release;
        params.release = saved.release;
        document.getElementById('envelope-release').value = saved.release * 1000;
        document.getElementById('envelope-release-value').textContent = Math.round(saved.release * 1000) + ' ms';
      }
      if (saved.sensitivity !== undefined) {
        envelopeState.sensitivity = saved.sensitivity;
        params.sensitivity = saved.sensitivity;
        document.getElementById('envelope-sensitivity').value = saved.sensitivity * 100;
        document.getElementById('envelope-sensitivity-value').textContent = Math.round(saved.sensitivity * 100) + '%';
      }
      if (saved.threshold !== undefined) {
        envelopeState.threshold = saved.threshold;
        params.threshold = saved.threshold;
        document.getElementById('envelope-threshold').value = saved.threshold * 100;
        document.getElementById('envelope-threshold-value').textContent = Math.round(saved.threshold * 100) + '%';
      }
      if (saved.smoothing !== undefined) {
        envelopeFilter.frequency.value = saved.smoothing;
        params.smoothing = saved.smoothing;
        document.getElementById('envelope-smoothing').value = saved.smoothing;
        document.getElementById('envelope-smoothing-value').textContent = Math.round(saved.smoothing) + ' Hz';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Envelope Follower] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Envelope Follower] Audio graph connected');
    },
    onUnload: (ctx, audioNodes) => {
      console.log('[Envelope Follower] Module unloading');
      // Clean up interval
      if (audioNodes && audioNodes.envelopeState && audioNodes.envelopeState.intervalId) {
        clearInterval(audioNodes.envelopeState.intervalId);
      }
    }
  }
};
