// Module Ideas Generator - Suggests random module concepts with audio feedback

export default {
  id: "utility-suggest",
  name: "Module Ideas Generator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create a simple passthrough with click/beep generator for suggestions
      const passthrough = ctx.createGain();
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      // Setup click generator (stopped by default)
      clickOsc.type = 'sine';
      clickOsc.frequency.value = 800;
      clickGain.gain.value = 0;

      clickOsc.connect(clickGain);
      clickGain.connect(passthrough);
      clickOsc.start();

      return {
        input: passthrough,
        output: passthrough,
        nodes: {
          passthrough: passthrough,
          clickOsc: clickOsc,
          clickGain: clickGain
        }
      };
    },
    insertionPoint: "pre-master",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Module Ideas Generator</h2>
      <div class="control-group">
        <label class="control-label">
          Category
        </label>
        <select id="suggest-category" style="width: 100%; padding: 8px; background: #1a1a1a; color: #00ff00; border: 1px solid #00ff00; font-family: 'Courier New', monospace;">
          <option value="all">All Categories</option>
          <option value="effect">Effects</option>
          <option value="filter">Filters</option>
          <option value="modulation">Modulation</option>
          <option value="utility">Utility</option>
          <option value="visualization">Visualization</option>
        </select>
      </div>
      <div class="control-group">
        <button id="suggest-generate" style="width: 100%; padding: 12px; background: #00ff00; color: #0a0a0a; border: none; font-family: 'Courier New', monospace; font-weight: bold; cursor: pointer; font-size: 14px;">
          GENERATE IDEA
        </button>
      </div>
      <div class="control-group">
        <label class="control-label">
          Suggested Module
        </label>
        <div id="suggest-output" style="background: #1a1a1a; border: 1px solid #00ff00; padding: 12px; min-height: 80px; color: #00ff00; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;">
          <em style="opacity: 0.6;">Click "GENERATE IDEA" to get a module suggestion...</em>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">
          Audio Feedback <span class="control-value" id="suggest-feedback-value">ON</span>
        </label>
        <input type="checkbox" id="suggest-feedback" checked style="width: 20px; height: 20px; cursor: pointer;">
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { clickOsc, clickGain } = audioNodes.nodes;

      const moduleIdeas = {
        effect: [
          { name: "Bitcrusher", desc: "Reduce audio bit depth and sample rate for lo-fi digital distortion" },
          { name: "Ring Modulator", desc: "Multiply input signal with oscillator for metallic, bell-like tones" },
          { name: "Phaser", desc: "Create sweeping notches in frequency spectrum using all-pass filters" },
          { name: "Chorus", desc: "Thicken sound with multiple delayed and detuned copies" },
          { name: "Reverb", desc: "Simulate acoustic space with convolution or algorithmic reverb" },
          { name: "Flanger", desc: "Jet-plane effect with short modulated delay and feedback" },
          { name: "Overdrive", desc: "Warm saturation using waveshaping distortion curves" },
          { name: "Tremolo", desc: "Rhythmic amplitude modulation for vintage vibrato effects" }
        ],
        filter: [
          { name: "Formant Filter", desc: "Vowel-like resonant peaks that shape timbre vocally" },
          { name: "Comb Filter", desc: "Harmonic peaks and notches for metallic resonance" },
          { name: "State Variable Filter", desc: "Multi-mode filter with simultaneous LP/HP/BP outputs" },
          { name: "Ladder Filter", desc: "Classic Moog-style 24dB/oct filter with resonance" },
          { name: "Graphic EQ", desc: "Multi-band equalizer with fixed frequency bands" },
          { name: "Auto-Wah", desc: "Envelope-following filter sweep based on input dynamics" }
        ],
        modulation: [
          { name: "LFO Matrix", desc: "Multiple LFOs with routing matrix to modulate any parameter" },
          { name: "Envelope Follower", desc: "Extract amplitude envelope to control other parameters" },
          { name: "Step Sequencer", desc: "Pattern-based modulation with programmable steps" },
          { name: "Sample & Hold", desc: "Random stepped voltages for glitchy modulation" },
          { name: "Arpeggiator", desc: "Transform held notes into rhythmic patterns" },
          { name: "Probability Gate", desc: "Randomize note triggering based on probability" }
        ],
        utility: [
          { name: "Spectrum Analyzer", desc: "Real-time frequency spectrum visualization using FFT" },
          { name: "Tuner", desc: "Pitch detection and tuning reference display" },
          { name: "Audio Recorder", desc: "Capture and export synthesizer output to WAV" },
          { name: "MIDI Learn", desc: "Map MIDI controllers to synthesizer parameters" },
          { name: "Preset Manager", desc: "Save, load, and organize sound presets" },
          { name: "A/B Compare", desc: "Quick toggle between two different settings" }
        ],
        visualization: [
          { name: "Oscilloscope", desc: "Display waveform in time domain with trigger options" },
          { name: "Waterfall Display", desc: "3D time-frequency spectrogram visualization" },
          { name: "Phase Scope", desc: "Stereo phase correlation and Goniometer display" },
          { name: "VU Meter", desc: "Classic volume unit meters with peak hold" },
          { name: "Particle Visualizer", desc: "Audio-reactive particle system with frequency mapping" },
          { name: "Waveform 3D", desc: "Rotating 3D representation of audio waveform" }
        ]
      };

      const generateButton = document.getElementById('suggest-generate');
      const categorySelect = document.getElementById('suggest-category');
      const outputDiv = document.getElementById('suggest-output');
      const feedbackCheckbox = document.getElementById('suggest-feedback');
      const feedbackValue = document.getElementById('suggest-feedback-value');

      // Play click sound
      const playClick = () => {
        if (!feedbackCheckbox.checked) return;

        const now = clickOsc.context.currentTime;
        clickGain.gain.cancelScheduledValues(now);
        clickGain.gain.setValueAtTime(0.1, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      };

      generateButton.addEventListener('click', () => {
        const category = categorySelect.value;
        let ideas = [];

        if (category === 'all') {
          // Combine all categories
          Object.values(moduleIdeas).forEach(cat => {
            ideas = ideas.concat(cat);
          });
        } else {
          ideas = moduleIdeas[category] || [];
        }

        if (ideas.length > 0) {
          const random = ideas[Math.floor(Math.random() * ideas.length)];
          outputDiv.innerHTML = `
            <div style="margin-bottom: 8px;">
              <strong style="color: #00ff00; font-size: 14px;">${random.name}</strong>
            </div>
            <div style="opacity: 0.8;">
              ${random.desc}
            </div>
            <div style="margin-top: 8px; opacity: 0.5; font-size: 11px;">
              Category: ${category === 'all' ? 'Mixed' : category}
            </div>
          `;
          playClick();
        }
      });

      feedbackCheckbox.addEventListener('change', (e) => {
        feedbackValue.textContent = e.target.checked ? 'ON' : 'OFF';
        params.audioFeedback = e.target.checked;
      });

      categorySelect.addEventListener('change', () => {
        playClick();
      });
    }
  },

  state: {
    defaults: {
      category: 'all',
      audioFeedback: true
    },
    save: (params) => ({
      category: params.category || 'all',
      audioFeedback: params.audioFeedback !== undefined ? params.audioFeedback : true
    }),
    load: (params, saved, audioNodes) => {
      if (saved.category !== undefined) {
        params.category = saved.category;
        const select = document.getElementById('suggest-category');
        if (select) select.value = saved.category;
      }
      if (saved.audioFeedback !== undefined) {
        params.audioFeedback = saved.audioFeedback;
        const checkbox = document.getElementById('suggest-feedback');
        const value = document.getElementById('suggest-feedback-value');
        if (checkbox) checkbox.checked = saved.audioFeedback;
        if (value) value.textContent = saved.audioFeedback ? 'ON' : 'OFF';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Module Ideas] Generator loaded - Ready to inspire!');
    },
    onConnect: (ctx) => {
      console.log('[Module Ideas] Connected to audio graph');
    },
    onUnload: (ctx) => {
      console.log('[Module Ideas] Unloading generator');
    }
  }
};
