// Module Idea Generator - Analyzes audio and suggests creative module ideas

export default {
  id: "tool-idea-generator",
  name: "Module Idea Generator",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Create analyser node to read audio characteristics
      const analyser = ctx.createAnalyser();
      const passthrough = ctx.createGain();

      // Configure analyser for frequency and waveform analysis
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      // Connect analyser in parallel (doesn't affect audio)
      passthrough.connect(analyser);

      return {
        input: passthrough,
        output: passthrough,
        nodes: {
          analyser: analyser,
          passthrough: passthrough
        }
      };
    },
    insertionPoint: "pre-master",
    routing: "series"
  },

  ui: {
    container: "custom-controls",
    template: `
      <h2>Module Idea Generator</h2>
      <div class="control-group">
        <label class="control-label">
          Analysis Mode
        </label>
        <select id="idea-mode" style="width: 100%; padding: 8px; background: #0a0a0a; color: #00ff00; border: 1px solid #00ff00; font-family: 'Courier New', monospace;">
          <option value="frequency">Frequency Analysis</option>
          <option value="dynamics">Dynamic Range</option>
          <option value="timbre">Timbre Characteristics</option>
          <option value="random">Random Inspiration</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">
          Suggestion Rate <span class="control-value" id="idea-rate-value">3 sec</span>
        </label>
        <input type="range" id="idea-rate" min="1" max="10" step="0.5" value="3">
      </div>
      <div class="control-group">
        <button id="generate-idea-btn" style="width: 100%; padding: 12px; background: #1a1a1a; color: #00ff00; border: 2px solid #00ff00; font-family: 'Courier New', monospace; font-size: 16px; cursor: pointer; margin-bottom: 10px;">
          ▶ Generate Idea
        </button>
      </div>
      <div class="control-group" style="background: #0a0a0a; border: 1px solid #00ff00; padding: 15px; min-height: 150px;">
        <div style="color: #00ff00; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6;">
          <div style="margin-bottom: 10px; border-bottom: 1px solid #00ff00; padding-bottom: 5px;">
            <strong id="idea-category">READY</strong>
          </div>
          <div id="idea-display" style="white-space: pre-wrap;">
Click "Generate Idea" to analyze your audio and receive a creative module suggestion based on the characteristics of your sound.
          </div>
        </div>
      </div>
      <div class="control-group">
        <label style="display: flex; align-items: center; color: #00ff00; font-family: 'Courier New', monospace;">
          <input type="checkbox" id="auto-suggest" style="margin-right: 8px;">
          Auto-suggest mode
        </label>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      const { analyser } = audioNodes.nodes;

      const modeSelect = document.getElementById('idea-mode');
      const rateSlider = document.getElementById('idea-rate');
      const rateValue = document.getElementById('idea-rate-value');
      const generateBtn = document.getElementById('generate-idea-btn');
      const autoSuggest = document.getElementById('auto-suggest');
      const ideaCategory = document.getElementById('idea-category');
      const ideaDisplay = document.getElementById('idea-display');

      let autoInterval = null;

      // Module idea database
      const moduleIdeas = {
        frequency: [
          { cat: "FILTER", idea: "Vowel Filter\nCreate a filter that morphs between vowel sounds (A, E, I, O, U) using formant filtering.\nParams: Vowel position, morphing speed, resonance" },
          { cat: "EFFECT", idea: "Harmonic Exciter\nAdd harmonics to dull sounds by generating and mixing octaves above the fundamental.\nParams: Harmonic content, octave mix, brightness" },
          { cat: "FILTER", idea: "Comb Filter\nCreate metallic/robotic tones using a series of notches in the frequency spectrum.\nParams: Delay time, feedback, mix" },
          { cat: "EFFECT", idea: "Ring Modulator\nMultiply your signal with a carrier frequency for bell-like/alien tones.\nParams: Carrier freq, modulation depth, mix" }
        ],
        dynamics: [
          { cat: "DYNAMICS", idea: "Transient Shaper\nEnhance or reduce attack and sustain portions independently.\nParams: Attack gain, sustain gain, detection threshold" },
          { cat: "DYNAMICS", idea: "Gate + Sidechain\nRhythmic gating effect triggered by an internal oscillator.\nParams: Threshold, gate time, pattern speed" },
          { cat: "EFFECT", idea: "Waveshaper\nAdd harmonic distortion using various transfer curves.\nParams: Drive, curve type (soft/hard/asymmetric), output gain" },
          { cat: "DYNAMICS", idea: "Envelope Follower\nExtract amplitude envelope to control other parameters.\nParams: Attack time, release time, output scaling" }
        ],
        timbre: [
          { cat: "EFFECT", idea: "Chorus\nThicken sound with multiple detuned copies.\nParams: Depth, rate, number of voices, stereo width" },
          { cat: "EFFECT", idea: "Phaser\nSweeping notch filter for swooshing effects.\nParams: Rate, depth, feedback, number of stages" },
          { cat: "FILTER", idea: "Formant Filter\nHuman voice-like filtering using multiple bandpass filters.\nParams: Formant 1, formant 2, formant 3, bandwidth" },
          { cat: "EFFECT", idea: "Granular Effect\nSplit audio into tiny grains and rearrange them.\nParams: Grain size, density, pitch shift, randomness" }
        ],
        random: [
          { cat: "GENERATOR", idea: "Noise Generator\nAdd white, pink, or brown noise as a separate layer.\nParams: Noise color, level, filtering" },
          { cat: "EFFECT", idea: "Bitcrusher\nReduce bit depth and sample rate for lo-fi effects.\nParams: Bit depth, sample rate reduction, mix" },
          { cat: "EFFECT", idea: "Reverse Delay\nDelay effect that plays audio backwards.\nParams: Reverse time, feedback, mix" },
          { cat: "MODULATION", idea: "LFO Bank\nMultiple LFOs with different shapes to modulate parameters.\nParams: Rate, shape, phase offset, routing" },
          { cat: "EFFECT", idea: "Freeze\nCapture and hold/loop the current audio buffer.\nParams: Freeze trigger, loop length, decay" },
          { cat: "SPATIAL", idea: "Auto-Panner\nRhythmic stereo movement.\nParams: Rate, depth, waveform, sync" },
          { cat: "FILTER", idea: "State Variable Filter\nFilter with multiple simultaneous outputs (LP/HP/BP/Notch).\nParams: Cutoff, resonance, output mix" },
          { cat: "EFFECT", idea: "Octave Doubler\nPitch shift +/- 1 octave and mix with original.\nParams: Octave up mix, octave down mix, detune" }
        ]
      };

      // Analysis function
      const analyzeAudio = () => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Calculate characteristics
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const max = Math.max(...dataArray);
        const lowFreq = dataArray.slice(0, bufferLength / 4).reduce((a, b) => a + b, 0);
        const highFreq = dataArray.slice(bufferLength * 3 / 4).reduce((a, b) => a + b, 0);

        return { average, max, lowFreq, highFreq };
      };

      // Generate idea based on mode
      const generateIdea = () => {
        const mode = modeSelect.value;
        const ideas = moduleIdeas[mode];

        if (mode === 'random') {
          // Pure random selection
          const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
          displayIdea(randomIdea);
        } else {
          // Use audio analysis to influence selection
          const analysis = analyzeAudio();
          let index = 0;

          if (mode === 'frequency') {
            // Use frequency balance to pick
            index = analysis.highFreq > analysis.lowFreq ?
                    Math.floor(Math.random() * 2) :
                    2 + Math.floor(Math.random() * 2);
          } else if (mode === 'dynamics') {
            // Use amplitude to pick
            index = analysis.max > 128 ?
                    Math.floor(Math.random() * 2) :
                    2 + Math.floor(Math.random() * 2);
          } else if (mode === 'timbre') {
            // Rotate through suggestions
            index = Math.floor(Math.random() * ideas.length);
          }

          displayIdea(ideas[index]);
        }
      };

      const displayIdea = (idea) => {
        ideaCategory.textContent = idea.cat;
        ideaDisplay.textContent = idea.idea;

        // Flash effect
        ideaDisplay.style.opacity = '0';
        setTimeout(() => {
          ideaDisplay.style.transition = 'opacity 0.3s';
          ideaDisplay.style.opacity = '1';
        }, 50);
      };

      // Rate control
      rateSlider.addEventListener('input', (e) => {
        const seconds = parseFloat(e.target.value);
        params.rate = seconds;
        rateValue.textContent = seconds + ' sec';

        // Restart auto-suggest with new rate
        if (autoSuggest.checked) {
          clearInterval(autoInterval);
          autoInterval = setInterval(generateIdea, seconds * 1000);
        }
      });

      // Mode selection
      modeSelect.addEventListener('change', (e) => {
        params.mode = e.target.value;
      });

      // Generate button
      generateBtn.addEventListener('click', () => {
        generateIdea();
      });

      // Auto-suggest toggle
      autoSuggest.addEventListener('change', (e) => {
        params.autoSuggest = e.target.checked;

        if (e.target.checked) {
          const rate = parseFloat(rateSlider.value);
          autoInterval = setInterval(generateIdea, rate * 1000);
          generateBtn.textContent = '⏸ Auto Mode Active';
          generateBtn.style.background = '#00ff00';
          generateBtn.style.color = '#0a0a0a';
        } else {
          clearInterval(autoInterval);
          generateBtn.textContent = '▶ Generate Idea';
          generateBtn.style.background = '#1a1a1a';
          generateBtn.style.color = '#00ff00';
        }
      });
    }
  },

  state: {
    defaults: {
      mode: 'frequency',
      rate: 3,
      autoSuggest: false
    },
    save: (params) => ({
      mode: params.mode,
      rate: params.rate,
      autoSuggest: params.autoSuggest
    }),
    load: (params, saved, audioNodes) => {
      if (saved.mode !== undefined) {
        params.mode = saved.mode;
        const modeSelect = document.getElementById('idea-mode');
        if (modeSelect) modeSelect.value = saved.mode;
      }
      if (saved.rate !== undefined) {
        params.rate = saved.rate;
        const rateSlider = document.getElementById('idea-rate');
        const rateValue = document.getElementById('idea-rate-value');
        if (rateSlider) rateSlider.value = saved.rate;
        if (rateValue) rateValue.textContent = saved.rate + ' sec';
      }
      if (saved.autoSuggest !== undefined) {
        params.autoSuggest = saved.autoSuggest;
        const autoCheckbox = document.getElementById('auto-suggest');
        if (autoCheckbox) autoCheckbox.checked = saved.autoSuggest;
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Idea Generator] Module loaded - Ready to inspire!');
    },
    onConnect: (ctx) => {
      console.log('[Idea Generator] Audio analysis active');
    },
    onUnload: (ctx) => {
      console.log('[Idea Generator] Module unloading');
      // Clear any intervals
      const autoCheckbox = document.getElementById('auto-suggest');
      if (autoCheckbox && autoCheckbox.checked) {
        autoCheckbox.checked = false;
        autoCheckbox.dispatchEvent(new Event('change'));
      }
    }
  }
};
