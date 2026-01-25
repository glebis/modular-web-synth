// Modulation sources suggestion module with LFO and envelope generators

export default {
  id: "suggest-modulation",
  name: "Modulation Sources",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create LFO using OscillatorNode
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      // Create envelope using GainNode (ADSR simulation)
      const envelopeGain = ctx.createGain();

      // Create analyzer for visualization
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      // Set initial LFO values
      lfo.frequency.value = 2.0;  // 2 Hz default
      lfo.type = 'sine';
      lfoGain.gain.value = 0.5;   // 50% depth

      // Set initial envelope values
      envelopeGain.gain.value = 0.0;

      // Connect LFO for modulation output
      lfo.connect(lfoGain);
      lfoGain.connect(analyser);

      // Start LFO
      lfo.start();

      // Passthrough node for audio
      const input = ctx.createGain();
      const output = ctx.createGain();
      input.connect(output);

      return {
        input: input,
        output: output,
        nodes: {
          lfo: lfo,
          lfoGain: lfoGain,
          envelopeGain: envelopeGain,
          analyser: analyser
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Modulation Sources</h2>

      <div class="control-group">
        <label class="control-label" style="color: #00ff00; margin-bottom: 8px; display: block;">
          LFO (Low Frequency Oscillator)
        </label>
      </div>

      <div class="control-group">
        <label class="control-label">
          Rate <span class="control-value" id="lfo-rate-value">2.00 Hz</span>
        </label>
        <input type="range" id="lfo-rate" min="0.1" max="20" step="0.1" value="2.0">
      </div>

      <div class="control-group">
        <label class="control-label">
          Waveform <span class="control-value" id="lfo-wave-value">Sine</span>
        </label>
        <select id="lfo-wave" style="width: 100%; padding: 4px; background: #0a0a0a; color: #00ff00; border: 1px solid #00ff00;">
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">
          Depth <span class="control-value" id="lfo-depth-value">50%</span>
        </label>
        <input type="range" id="lfo-depth" min="0" max="100" value="50">
      </div>

      <div class="control-group" style="margin-top: 20px;">
        <label class="control-label" style="color: #00ff00; margin-bottom: 8px; display: block;">
          Envelope Generator (ADSR)
        </label>
      </div>

      <div class="control-group">
        <label class="control-label">
          Attack <span class="control-value" id="env-attack-value">100 ms</span>
        </label>
        <input type="range" id="env-attack" min="1" max="2000" step="1" value="100">
      </div>

      <div class="control-group">
        <label class="control-label">
          Decay <span class="control-value" id="env-decay-value">200 ms</span>
        </label>
        <input type="range" id="env-decay" min="1" max="2000" step="1" value="200">
      </div>

      <div class="control-group">
        <label class="control-label">
          Sustain <span class="control-value" id="env-sustain-value">70%</span>
        </label>
        <input type="range" id="env-sustain" min="0" max="100" value="70">
      </div>

      <div class="control-group">
        <label class="control-label">
          Release <span class="control-value" id="env-release-value">300 ms</span>
        </label>
        <input type="range" id="env-release" min="1" max="3000" step="1" value="300">
      </div>

      <div class="control-group" style="margin-top: 15px;">
        <button id="env-trigger" style="width: 100%; padding: 8px; background: #1a1a1a; color: #00ff00; border: 1px solid #00ff00; cursor: pointer; font-family: monospace;">
          Trigger Envelope
        </button>
      </div>

      <div class="control-group" style="margin-top: 20px;">
        <label class="control-label" style="color: #00ff00; font-size: 0.85em;">
          Suggestions: Use LFO for vibrato, tremolo, filter sweeps. Use Envelope for dynamics and transients.
        </label>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { lfo, lfoGain, envelopeGain } = audioNodes.nodes;

      // LFO Rate control
      const rateSlider = document.getElementById('lfo-rate');
      const rateValue = document.getElementById('lfo-rate-value');

      rateSlider.addEventListener('input', (e) => {
        const hz = parseFloat(e.target.value);
        lfo.frequency.value = hz;
        params.lfoRate = hz;
        rateValue.textContent = hz.toFixed(2) + ' Hz';
      });

      // LFO Waveform control
      const waveSelect = document.getElementById('lfo-wave');
      const waveValue = document.getElementById('lfo-wave-value');

      waveSelect.addEventListener('change', (e) => {
        const waveType = e.target.value;
        lfo.type = waveType;
        params.lfoWave = waveType;
        waveValue.textContent = waveType.charAt(0).toUpperCase() + waveType.slice(1);
      });

      // LFO Depth control
      const depthSlider = document.getElementById('lfo-depth');
      const depthValue = document.getElementById('lfo-depth-value');

      depthSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const gain = percent / 100;
        lfoGain.gain.value = gain;
        params.lfoDepth = gain;
        depthValue.textContent = Math.round(percent) + '%';
      });

      // Envelope Attack control
      const attackSlider = document.getElementById('env-attack');
      const attackValue = document.getElementById('env-attack-value');

      attackSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        params.envAttack = ms / 1000;
        attackValue.textContent = Math.round(ms) + ' ms';
      });

      // Envelope Decay control
      const decaySlider = document.getElementById('env-decay');
      const decayValue = document.getElementById('env-decay-value');

      decaySlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        params.envDecay = ms / 1000;
        decayValue.textContent = Math.round(ms) + ' ms';
      });

      // Envelope Sustain control
      const sustainSlider = document.getElementById('env-sustain');
      const sustainValue = document.getElementById('env-sustain-value');

      sustainSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        params.envSustain = percent / 100;
        sustainValue.textContent = Math.round(percent) + '%';
      });

      // Envelope Release control
      const releaseSlider = document.getElementById('env-release');
      const releaseValue = document.getElementById('env-release-value');

      releaseSlider.addEventListener('input', (e) => {
        const ms = parseFloat(e.target.value);
        params.envRelease = ms / 1000;
        releaseValue.textContent = Math.round(ms) + ' ms';
      });

      // Envelope Trigger button
      const triggerButton = document.getElementById('env-trigger');

      triggerButton.addEventListener('click', () => {
        const now = envelopeGain.context.currentTime;
        const attack = params.envAttack || 0.1;
        const decay = params.envDecay || 0.2;
        const sustain = params.envSustain || 0.7;
        const release = params.envRelease || 0.3;

        // Cancel any scheduled changes
        envelopeGain.gain.cancelScheduledValues(now);

        // ADSR envelope
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(1.0, now + attack);
        envelopeGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
        envelopeGain.gain.setValueAtTime(sustain, now + attack + decay + 0.5); // Hold sustain
        envelopeGain.gain.linearRampToValueAtTime(0, now + attack + decay + 0.5 + release);

        console.log('[Modulation] Envelope triggered');
      });
    }
  },

  state: {
    defaults: {
      lfoRate: 2.0,
      lfoWave: 'sine',
      lfoDepth: 0.5,
      envAttack: 0.1,
      envDecay: 0.2,
      envSustain: 0.7,
      envRelease: 0.3
    },
    save: (params) => ({
      lfoRate: params.lfoRate,
      lfoWave: params.lfoWave,
      lfoDepth: params.lfoDepth,
      envAttack: params.envAttack,
      envDecay: params.envDecay,
      envSustain: params.envSustain,
      envRelease: params.envRelease
    }),
    load: (params, saved, audioNodes) => {
      const { lfo, lfoGain } = audioNodes.nodes;

      if (saved.lfoRate !== undefined) {
        lfo.frequency.value = saved.lfoRate;
        params.lfoRate = saved.lfoRate;
        document.getElementById('lfo-rate').value = saved.lfoRate;
        document.getElementById('lfo-rate-value').textContent = saved.lfoRate.toFixed(2) + ' Hz';
      }
      if (saved.lfoWave !== undefined) {
        lfo.type = saved.lfoWave;
        params.lfoWave = saved.lfoWave;
        document.getElementById('lfo-wave').value = saved.lfoWave;
        document.getElementById('lfo-wave-value').textContent = saved.lfoWave.charAt(0).toUpperCase() + saved.lfoWave.slice(1);
      }
      if (saved.lfoDepth !== undefined) {
        lfoGain.gain.value = saved.lfoDepth;
        params.lfoDepth = saved.lfoDepth;
        document.getElementById('lfo-depth').value = saved.lfoDepth * 100;
        document.getElementById('lfo-depth-value').textContent = Math.round(saved.lfoDepth * 100) + '%';
      }
      if (saved.envAttack !== undefined) {
        params.envAttack = saved.envAttack;
        document.getElementById('env-attack').value = saved.envAttack * 1000;
        document.getElementById('env-attack-value').textContent = Math.round(saved.envAttack * 1000) + ' ms';
      }
      if (saved.envDecay !== undefined) {
        params.envDecay = saved.envDecay;
        document.getElementById('env-decay').value = saved.envDecay * 1000;
        document.getElementById('env-decay-value').textContent = Math.round(saved.envDecay * 1000) + ' ms';
      }
      if (saved.envSustain !== undefined) {
        params.envSustain = saved.envSustain;
        document.getElementById('env-sustain').value = saved.envSustain * 100;
        document.getElementById('env-sustain-value').textContent = Math.round(saved.envSustain * 100) + '%';
      }
      if (saved.envRelease !== undefined) {
        params.envRelease = saved.envRelease;
        document.getElementById('env-release').value = saved.envRelease * 1000;
        document.getElementById('env-release-value').textContent = Math.round(saved.envRelease * 1000) + ' ms';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Modulation Sources] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Modulation Sources] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Modulation Sources] Module unloading');
    }
  }
};
