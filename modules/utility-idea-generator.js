// Module Idea Generator - Randomized modulation with creative suggestions

export default {
  id: "utility-idea-generator",
  name: "Idea Generator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create randomized LFO modulation for inspiring new sounds
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();

      // Set initial values
      lfo.type = 'sine';
      lfo.frequency.value = 0.5; // Slow modulation
      lfoGain.gain.value = 200; // Modulation depth
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1;

      // Connect LFO to filter frequency for randomized modulation
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Audio path
      inputGain.connect(filter);
      filter.connect(outputGain);

      // Start LFO
      lfo.start();

      return {
        input: inputGain,
        output: outputGain,
        nodes: {
          lfo: lfo,
          lfoGain: lfoGain,
          filter: filter,
          inputGain: inputGain,
          outputGain: outputGain
        }
      };
    },
    insertionPoint: "post-filter",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Idea Generator</h2>
      <div class="control-group">
        <label class="control-label">
          Randomness <span class="control-value" id="idea-randomness-value">50%</span>
        </label>
        <input type="range" id="idea-randomness" min="0" max="100" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">
          Modulation Rate <span class="control-value" id="idea-rate-value">0.5 Hz</span>
        </label>
        <input type="range" id="idea-rate" min="0.1" max="10" step="0.1" value="0.5">
      </div>
      <div class="control-group">
        <button id="generate-idea-btn" style="
          width: 100%;
          padding: 12px;
          background-color: #1a1a1a;
          color: #00ff00;
          border: 2px solid #00ff00;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        ">GENERATE NEW IDEA</button>
      </div>
      <div id="idea-display" style="
        margin-top: 15px;
        padding: 15px;
        background-color: #0a0a0a;
        border: 1px solid #00ff00;
        border-radius: 4px;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        min-height: 80px;
      ">
        <div style="color: #00aa00; margin-bottom: 8px;">Click GENERATE for module ideas</div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { lfo, lfoGain, filter, outputGain } = audioNodes.nodes;

      const moduleIdeas = [
        {
          name: "Granular Synthesizer",
          desc: "Break audio into tiny grains and rearrange them for glitchy textures"
        },
        {
          name: "Spectral Freeze",
          desc: "Capture and hold frequency spectrum using FFT analysis"
        },
        {
          name: "Waveshaper Distortion",
          desc: "Custom transfer curves for harmonic/inharmonic distortion"
        },
        {
          name: "Stereo Widener",
          desc: "Haas effect and M/S processing for spatial enhancement"
        },
        {
          name: "Ring Modulator",
          desc: "Multiply signals for metallic, bell-like timbres"
        },
        {
          name: "Vocoder",
          desc: "Carrier/modulator synthesis for robotic voice effects"
        },
        {
          name: "Pitch Shifter",
          desc: "Real-time pitch manipulation using delay/playback rate"
        },
        {
          name: "Compressor/Limiter",
          desc: "Dynamic range control with attack/release/ratio controls"
        },
        {
          name: "Reverb Chamber",
          desc: "Convolution or algorithmic reverb for spatial depth"
        },
        {
          name: "Phaser Effect",
          desc: "All-pass filter modulation for sweeping phase shifts"
        },
        {
          name: "Flanger Effect",
          desc: "Short delay modulation with feedback for jet-like swooshes"
        },
        {
          name: "Chorus Effect",
          desc: "Multiple detuned voices for thick, ensemble sound"
        },
        {
          name: "Tremolo/Autopan",
          desc: "Amplitude modulation for rhythmic volume/stereo movement"
        },
        {
          name: "Bit Crusher",
          desc: "Sample rate/bit depth reduction for lo-fi digital degradation"
        },
        {
          name: "Envelope Follower",
          desc: "Extract amplitude envelope to modulate other parameters"
        },
        {
          name: "LFO Matrix",
          desc: "Multiple LFOs with crossfade modulation routing"
        },
        {
          name: "Frequency Shifter",
          desc: "Linear frequency shift (not pitch) for dissonant effects"
        },
        {
          name: "Formant Filter",
          desc: "Vocal formant synthesis with vowel morphing"
        },
        {
          name: "Comb Filter",
          desc: "Short delay feedback for metallic resonances"
        },
        {
          name: "Gate/Sequencer",
          desc: "Rhythmic amplitude gating with step sequencer pattern"
        },
        {
          name: "Harmonic Generator",
          desc: "Add harmonics/subharmonics using oscillator stacking"
        },
        {
          name: "Sidechain Ducker",
          desc: "Dynamic volume control triggered by external source"
        },
        {
          name: "Tape Saturation",
          desc: "Analog warmth simulation with soft clipping/filtering"
        },
        {
          name: "Glitch Generator",
          desc: "Random stutters, repeats, and buffer manipulations"
        }
      ];

      // Randomness control
      const randomnessSlider = document.getElementById('idea-randomness');
      const randomnessValue = document.getElementById('idea-randomness-value');

      randomnessSlider.addEventListener('input', (e) => {
        const percent = parseFloat(e.target.value);
        const depth = (percent / 100) * 500;
        lfoGain.gain.value = depth;
        params.randomness = percent;
        randomnessValue.textContent = Math.round(percent) + '%';
      });

      // Modulation rate control
      const rateSlider = document.getElementById('idea-rate');
      const rateValue = document.getElementById('idea-rate-value');

      rateSlider.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        lfo.frequency.value = rate;
        params.rate = rate;
        rateValue.textContent = rate.toFixed(1) + ' Hz';
      });

      // Idea generator button
      const generateBtn = document.getElementById('generate-idea-btn');
      const ideaDisplay = document.getElementById('idea-display');

      generateBtn.addEventListener('mouseenter', () => {
        generateBtn.style.backgroundColor = '#00ff00';
        generateBtn.style.color = '#0a0a0a';
      });

      generateBtn.addEventListener('mouseleave', () => {
        generateBtn.style.backgroundColor = '#1a1a1a';
        generateBtn.style.color = '#00ff00';
      });

      generateBtn.addEventListener('click', () => {
        const idea = moduleIdeas[Math.floor(Math.random() * moduleIdeas.length)];

        const randomRate = 0.1 + Math.random() * 9.9;
        const randomDepth = Math.random() * 100;

        lfo.frequency.value = randomRate;
        lfoGain.gain.value = (randomDepth / 100) * 500;

        rateSlider.value = randomRate;
        rateValue.textContent = randomRate.toFixed(1) + ' Hz';
        randomnessSlider.value = randomDepth;
        randomnessValue.textContent = Math.round(randomDepth) + '%';

        params.rate = randomRate;
        params.randomness = randomDepth;

        ideaDisplay.style.opacity = '0';
        setTimeout(() => {
          ideaDisplay.innerHTML = `
            <div style="color: #00ff00; font-weight: bold; margin-bottom: 8px;">
              ${idea.name}
            </div>
            <div style="color: #00aa00; font-size: 12px;">
              ${idea.desc}
            </div>
            <div style="color: #006600; font-size: 11px; margin-top: 8px; font-style: italic;">
              Audio params randomized - Listen for inspiration!
            </div>
          `;
          ideaDisplay.style.opacity = '1';
        }, 150);
      });
    }
  },

  state: {
    defaults: {
      randomness: 50,
      rate: 0.5
    },
    save: (params) => ({
      randomness: params.randomness,
      rate: params.rate
    }),
    load: (params, saved, audioNodes) => {
      const { lfo, lfoGain } = audioNodes.nodes;

      if (saved.randomness !== undefined) {
        const depth = (saved.randomness / 100) * 500;
        lfoGain.gain.value = depth;
        params.randomness = saved.randomness;
        document.getElementById('idea-randomness').value = saved.randomness;
        document.getElementById('idea-randomness-value').textContent = Math.round(saved.randomness) + '%';
      }
      if (saved.rate !== undefined) {
        lfo.frequency.value = saved.rate;
        params.rate = saved.rate;
        document.getElementById('idea-rate').value = saved.rate;
        document.getElementById('idea-rate-value').textContent = saved.rate.toFixed(1) + ' Hz';
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Idea Generator] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Idea Generator] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Idea Generator] Module unloading');
    }
  }
};
