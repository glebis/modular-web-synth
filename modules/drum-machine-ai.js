// AI-First Generative Drum Machine
// Describe sounds, generate with ElevenLabs, pick best variants

export default {
  id: "drum-machine-ai",
  name: "AI Drum Machine",
  version: "2.0.0",

  audio: {
    createNodes: (ctx) => {
      const inputNode = ctx.createGain();
      const outputNode = ctx.createGain();
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      inputNode.gain.value = 1.0;
      outputNode.gain.value = 1.0;
      masterGain.gain.value = 0.8;
      analyser.fftSize = 2048;

      inputNode.connect(outputNode);
      masterGain.connect(outputNode);
      outputNode.connect(analyser);

      return {
        input: inputNode,
        output: analyser,
        nodes: {
          input: inputNode,
          output: outputNode,
          masterGain: masterGain,
          analyser: analyser
        }
      };
    },
    insertionPoint: "post-oscillator",
    routing: "parallel"
  },

  ui: {
    container: "custom-controls",
    template: `
      <style>
        * {
          font-family: 'Monaco', 'Courier New', monospace !important;
        }

        .ai-drum-container {
          padding: 20px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-width: 1400px;
        }

        .ai-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }

        .ai-header h2 {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0;
          color: #333;
          margin: 0 0 5px 0;
        }

        .ai-header p {
          color: #888;
          font-size: 12px;
          margin: 0;
        }

        .ai-visualizer-section {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .ai-oscilloscope-container {
          flex: 2;
        }

        .ai-oscilloscope {
          width: 600px;
          height: 300px;
          background: #000;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .ai-visualizer-controls {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .ai-viz-label {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .ai-generate-section {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .ai-mode-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }

        .ai-mode-btn {
          flex: 1;
          padding: 10px;
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 400;
          transition: all 0.15s;
        }

        .ai-mode-btn:hover {
          border-color: #999;
          color: #333;
        }

        .ai-mode-btn.active {
          background: #333;
          color: #fff;
          border-color: #333;
        }

        .ai-input-group {
          margin-bottom: 20px;
        }

        .ai-input-label {
          display: block;
          color: #888;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .ai-input {
          width: 100%;
          padding: 10px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 3px;
          color: #333;
          font-size: 13px;
          transition: all 0.15s;
        }

        .ai-input:focus {
          outline: none;
          border-color: #999;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
        }

        .ai-input::placeholder {
          color: #aaa;
        }

        .ai-generate-btn {
          width: 100%;
          padding: 12px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ai-generate-btn:hover {
          background: #222;
        }

        .ai-generate-btn:active {
          background: #111;
        }

        .ai-generate-btn:disabled {
          background: #ddd;
          color: #999;
          cursor: not-allowed;
        }

        .ai-status {
          margin-top: 15px;
          padding: 12px;
          background: #1a1a1a;
          border-radius: 6px;
          text-align: center;
          color: #00ff00;
          font-size: 13px;
          display: none;
        }

        .ai-status.show {
          display: block;
        }

        .ai-status.loading {
          color: #ffaa00;
        }

        .ai-status.error {
          color: #ff0000;
        }

        .ai-morph-section {
          margin-bottom: 20px;
          padding: 20px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .ai-morph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          color: #333;
          font-size: 13px;
          font-weight: 600;
        }

        .ai-morph-hint {
          font-size: 11px;
          color: #888;
          font-weight: 400;
        }

        .ai-morph-container {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .ai-morph-pad {
          width: 500px;
          height: 500px;
          background: #000;
          border: 1px solid #ddd;
          border-radius: 4px;
          position: relative;
        }

        .ai-morph-labels {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .ai-morph-label {
          color: #fff;
          font-size: 11px;
          font-weight: 400;
          background: rgba(0,0,0,0.7);
          padding: 4px 8px;
          border-radius: 3px;
        }

        .ai-morph-controls {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        #ai-select-morphed {
          max-width: 400px;
        }

        .ai-variants-section {
          margin-bottom: 30px;
        }

        .ai-variants-header {
          color: #00ff00;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
        }

        .ai-variants-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .ai-variant-card {
          background: #0f0f0f;
          border: 2px solid #222;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .ai-variant-card:hover {
          border-color: #00ff00;
          transform: translateY(-2px);
        }

        .ai-variant-card.selected {
          border-color: #00ff00;
          background: rgba(0, 255, 0, 0.05);
        }

        .ai-variant-number {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          background: #333;
          color: #666;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .ai-variant-card.selected .ai-variant-number {
          background: #00ff00;
          color: #0a0a0a;
        }

        .ai-variant-waveform {
          width: 100%;
          height: 60px;
          background: #1a1a1a;
          border-radius: 4px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #444;
          font-size: 12px;
        }

        .ai-variant-controls {
          display: flex;
          gap: 8px;
        }

        .ai-variant-btn {
          flex: 1;
          padding: 8px;
          background: #1a1a1a;
          color: #00ff00;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .ai-variant-btn:hover {
          background: #00ff00;
          color: #0a0a0a;
        }

        .ai-sequencer {
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 25px;
        }

        .ai-transport {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #222;
        }

        .ai-transport-btn {
          padding: 12px 24px;
          background: #1a1a1a;
          color: #00ff00;
          border: 1px solid #333;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .ai-transport-btn:hover {
          background: #00ff00;
          color: #0a0a0a;
        }

        .ai-transport-btn.active {
          background: #ffaa00;
          color: #0a0a0a;
          border-color: #ffaa00;
        }

        .ai-bpm-control {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ai-bpm-label {
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
        }

        .ai-bpm-value {
          color: #00ff00;
          font-size: 18px;
          font-weight: 600;
          min-width: 50px;
        }

        .ai-bpm-slider {
          flex: 1;
          height: 4px;
          background: #1a1a1a;
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .ai-bpm-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #00ff00;
          border-radius: 50%;
          cursor: pointer;
        }

        .ai-track-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-track {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #1a1a1a;
          border: 1px solid #222;
          border-radius: 6px;
        }

        .ai-track-label {
          width: 120px;
          color: #00ff00;
          font-size: 13px;
          cursor: pointer;
        }

        .ai-track-label:hover {
          color: #ffaa00;
        }

        .ai-track-steps {
          flex: 1;
          display: flex;
          gap: 4px;
        }

        .ai-step {
          flex: 1;
          height: 32px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.1s;
        }

        .ai-step:hover {
          border-color: #00ff00;
        }

        .ai-step.active {
          background: #00ff00;
          border-color: #00ff00;
        }

        .ai-step.active-step {
          box-shadow: 0 0 10px #00ff00;
          border-color: #00ff00;
          transform: scale(1.05);
        }

        .ai-step.current {
          border-color: #ffaa00;
          box-shadow: 0 0 8px #ffaa00;
        }

        .ai-track-controls {
          display: flex;
          gap: 6px;
        }

        .ai-track-btn {
          padding: 6px 12px;
          background: #0f0f0f;
          color: #666;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
        }

        .ai-track-btn.active {
          background: #00ff00;
          color: #0a0a0a;
          border-color: #00ff00;
        }

        .ai-quick-kits {
          margin-bottom: 20px;
          padding: 15px;
          background: #1a1a1a;
          border-radius: 6px;
        }

        .ai-quick-kits-label {
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .ai-quick-kits-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .ai-quick-kit-btn {
          padding: 10px;
          background: #0f0f0f;
          color: #666;
          border: 1px solid #222;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .ai-quick-kit-btn:hover {
          border-color: #00ff00;
          color: #00ff00;
        }
      </style>

      <div class="ai-drum-container">
        <div class="ai-header">
          <h2>AI DRUM MACHINE</h2>
          <p>Describe → Generate → Morph → Sequence</p>
        </div>

        <div class="ai-visualizer-section">
          <div class="ai-oscilloscope-container">
            <div class="ai-viz-label">Audio Visualizer</div>
            <div id="ai-oscilloscope" class="ai-oscilloscope"></div>
          </div>
          <div class="ai-visualizer-controls">
            <div>
              <div class="ai-viz-label">BPM</div>
              <div id="ai-bpm-dial-viz" style="width: 80px; height: 80px; margin-bottom: 10px;"></div>
              <div style="text-align: center; font-size: 18px; font-weight: 600; color: #333;">
                <span id="ai-bpm-value-viz">120</span>
              </div>
            </div>
            <div>
              <div class="ai-viz-label">Master Volume</div>
              <div id="ai-master-slider" style="height: 120px;"></div>
            </div>
          </div>
        </div>

        <div class="ai-generate-section">
          <div class="ai-mode-selector">
            <button class="ai-mode-btn active" data-mode="single">Single Sound</button>
            <button class="ai-mode-btn" data-mode="kit">Full Kit</button>
          </div>

          <div id="ai-single-mode">
            <div class="ai-input-group">
              <label class="ai-input-label">Describe the sound</label>
              <input
                type="text"
                id="ai-prompt"
                class="ai-input"
                placeholder="e.g., deep 808 kick with sub bass, crisp trap snare, metallic hi-hat..."
              />
            </div>
            <button id="ai-generate-single" class="ai-generate-btn">Generate 3 Variants</button>
          </div>

          <div id="ai-kit-mode" style="display: none;">
            <div class="ai-quick-kits">
              <div class="ai-quick-kits-label">Quick Generate:</div>
              <div class="ai-quick-kits-grid">
                <button class="ai-quick-kit-btn" data-style="808">808 Kit</button>
                <button class="ai-quick-kit-btn" data-style="trap">Trap Kit</button>
                <button class="ai-quick-kit-btn" data-style="house">House Kit</button>
                <button class="ai-quick-kit-btn" data-style="techno">Techno Kit</button>
                <button class="ai-quick-kit-btn" data-style="dnb">DnB Kit</button>
                <button class="ai-quick-kit-btn" data-style="lofi">Lo-Fi Kit</button>
                <button class="ai-quick-kit-btn" data-style="acoustic">Acoustic Kit</button>
                <button class="ai-quick-kit-btn" data-style="industrial">Industrial Kit</button>
              </div>
            </div>
            <div class="ai-input-group">
              <label class="ai-input-label">Or describe custom kit style</label>
              <input
                type="text"
                id="ai-kit-style"
                class="ai-input"
                placeholder="e.g., vintage 80s electronic, gritty hip-hop, ethereal ambient..."
              />
            </div>
            <button id="ai-generate-kit" class="ai-generate-btn">Generate Full Kit (5 sounds × 3 variants)</button>
          </div>

          <div id="ai-status" class="ai-status"></div>
        </div>

        <div id="ai-morph-section" class="ai-morph-section" style="display: none;">
          <div class="ai-morph-header">
            <span>Morph Between Variants</span>
            <span class="ai-morph-hint">Move the pad to blend sounds</span>
          </div>
          <div class="ai-morph-container">
            <div id="ai-morph-pad" class="ai-morph-pad"></div>
            <div class="ai-morph-labels">
              <div class="ai-morph-label" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%);">Variant 1</div>
              <div class="ai-morph-label" style="position: absolute; bottom: 10px; left: 20px;">Variant 2</div>
              <div class="ai-morph-label" style="position: absolute; bottom: 10px; right: 20px;">Variant 3</div>
            </div>
          </div>
          <div class="ai-morph-controls">
            <button id="ai-select-morphed" class="ai-generate-btn">✓ Add Morphed Sound to Track</button>
          </div>
        </div>

        <div id="ai-variants-section" class="ai-variants-section" style="display: none;">
          <div class="ai-variants-header">Or Select Individual Variant:</div>
          <div id="ai-variants-grid" class="ai-variants-grid"></div>
        </div>

        <div class="ai-sequencer">
          <div class="ai-transport">
            <button id="ai-play" class="ai-transport-btn">▶ Play</button>
            <button id="ai-stop" class="ai-transport-btn">■ Stop</button>
            <div class="ai-bpm-control">
              <span class="ai-bpm-label">Swing</span>
              <input type="range" id="ai-swing-slider" min="0" max="75" value="0" style="width: 120px; height: 20px;">
              <span id="ai-swing-value" class="ai-bpm-value">0%</span>
            </div>
            <div style="color: #666; font-size: 11px; margin-left: auto;">
              [Space] Play/Pause
            </div>
          </div>
          <div id="ai-track-list" class="ai-track-list">
            <div style="color: #666; text-align: center; padding: 40px;">
              Generate sounds to start sequencing
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <details class="ai-sounds-library">
            <summary style="cursor: pointer; padding: 15px; background: #0f0f0f; border: 1px solid #222; border-radius: 6px; color: #00ff00; font-size: 14px;">
              📦 Sounds Library (<span id="ai-sounds-count">0</span>)
            </summary>
            <div id="ai-sounds-list" style="padding: 15px; background: #0a0a0a; border: 1px solid #222; border-top: none;">
              <div style="color: #666; text-align: center; padding: 20px;">No sounds yet</div>
            </div>
            <div style="padding: 10px; background: #0f0f0f; border: 1px solid #222; border-top: none; border-radius: 0 0 6px 6px;">
              <button id="ai-download-all" class="ai-generate-btn" style="width: 100%; font-size: 12px;">⬇ Download All</button>
            </div>
          </details>

          <details class="ai-presets-library">
            <summary style="cursor: pointer; padding: 15px; background: #0f0f0f; border: 1px solid #222; border-radius: 6px; color: #ffaa00; font-size: 14px;">
              💾 Presets (<span id="ai-presets-count">0</span>)
            </summary>
            <div style="padding: 15px; background: #0a0a0a; border: 1px solid #222; border-top: none;">
              <div id="ai-presets-list" style="max-height: 300px; overflow-y: auto;">
                <div style="color: #666; text-align: center; padding: 20px;">No presets saved</div>
              </div>
            </div>
            <div style="padding: 10px; background: #0f0f0f; border: 1px solid #222; border-top: none; border-radius: 0 0 6px 6px;">
              <button id="ai-save-preset" class="ai-generate-btn" style="width: 100%; font-size: 12px;">💾 Save Current Preset</button>
            </div>
          </details>
        </div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      window.aiDrumAudioNodes = audioNodes;
      window.aiDrumMachine = { audioNodes, params };
      bindAIControls(audioNodes, params);
    }
  },

  state: {
    defaults: {
      bpm: 120,
      swing: 0, // 0-75% swing amount
      masterVolume: 0.8,
      mode: 'single',
      generatedSounds: [],
      tracks: [],
      playing: false,
      currentStep: 0,
      currentPattern: 0,
      patterns: [
        {
          id: 'A',
          name: 'Pattern A',
          length: 16,
          tracks: [
            { sampleId: null, steps: Array(16).fill(0), length: 16, mute: false, solo: false, volume: 0.8 },
            { sampleId: null, steps: Array(16).fill(0), length: 16, mute: false, solo: false, volume: 0.8 },
            { sampleId: null, steps: Array(16).fill(0), length: 16, mute: false, solo: false, volume: 0.8 },
            { sampleId: null, steps: Array(16).fill(0), length: 16, mute: false, solo: false, volume: 0.8 }
          ]
        }
      ]
    },
    save: (params) => ({
      bpm: params.bpm,
      masterVolume: params.masterVolume,
      generatedSounds: params.generatedSounds,
      tracks: params.tracks,
      patterns: params.patterns,
      currentPattern: params.currentPattern
    }),
    load: (params, saved, audioNodes) => {
      if (saved.bpm) params.bpm = saved.bpm;
      if (saved.masterVolume) params.masterVolume = saved.masterVolume;
      if (saved.generatedSounds) params.generatedSounds = saved.generatedSounds;
      if (saved.tracks) params.tracks = saved.tracks;
      if (saved.patterns) params.patterns = saved.patterns;
      if (saved.currentPattern !== undefined) params.currentPattern = saved.currentPattern;
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[AI Drum Machine] Loading...');

      // Load NexusUI if not already loaded
      if (typeof Nexus === 'undefined') {
        console.log('[AI Drum Machine] Loading NexusUI library from local file...');
        const script = document.createElement('script');
        script.src = './nexusui.min.js'; // Use local file
        script.async = false; // Synchronous loading
        script.onload = () => {
          console.log('[AI Drum Machine] ✓ NexusUI loaded successfully');
          console.log('[AI Drum Machine] Nexus version:', Nexus?.version || 'unknown');
        };
        script.onerror = (err) => {
          console.error('[AI Drum Machine] ✗ Failed to load NexusUI from local file');
          console.error('[AI Drum Machine] Error:', err);

          // Fallback to CDN
          console.log('[AI Drum Machine] Trying CDN fallback...');
          const cdnScript = document.createElement('script');
          cdnScript.src = 'https://cdn.jsdelivr.net/npm/nexusui@latest/dist/NexusUI.min.js';
          cdnScript.onload = () => console.log('[AI Drum Machine] ✓ NexusUI loaded from CDN');
          cdnScript.onerror = () => console.error('[AI Drum Machine] ✗ CDN fallback failed');
          document.head.appendChild(cdnScript);
        };
        document.head.appendChild(script);
      } else {
        console.log('[AI Drum Machine] ✓ NexusUI already loaded');
      }

      // Load Anime.js for animations
      if (typeof anime === 'undefined') {
        console.log('[AI Drum Machine] Loading Anime.js...');
        const animeScript = document.createElement('script');
        animeScript.src = 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js';
        animeScript.async = false;
        animeScript.onload = () => console.log('[AI Drum Machine] ✓ Anime.js loaded');
        animeScript.onerror = () => console.warn('[AI Drum Machine] ⚠ Anime.js failed to load (animations disabled)');
        document.head.appendChild(animeScript);
      } else {
        console.log('[AI Drum Machine] ✓ Anime.js already loaded');
      }
    },
    onConnect: (ctx) => console.log('[AI Drum Machine] Connected'),
    onUnload: (ctx) => console.log('[AI Drum Machine] Unloading')
  }
};

// ============================================================================
// UI BINDING
// ============================================================================

function bindAIControls(audioNodes, params) {
  // Wait for NexusUI to load (longer delay for CDN)
  setTimeout(() => initializeNexusControls(audioNodes, params), 1000);

  // Mode switching
  document.querySelectorAll('.ai-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ai-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      params.mode = mode;

      document.getElementById('ai-single-mode').style.display = mode === 'single' ? 'block' : 'none';
      document.getElementById('ai-kit-mode').style.display = mode === 'kit' ? 'block' : 'none';
    });
  });

  // Single sound generation
  document.getElementById('ai-generate-single').addEventListener('click', () => {
    const prompt = document.getElementById('ai-prompt').value.trim();
    if (!prompt) {
      showStatus('Enter a sound description', 'error');
      return;
    }
    generateSingleSound(prompt, audioNodes, params);
  });

  // Kit generation
  document.getElementById('ai-generate-kit').addEventListener('click', () => {
    const style = document.getElementById('ai-kit-style').value.trim() || 'electronic';
    generateDrumKit(style, audioNodes, params);
  });

  // Quick kit buttons
  document.querySelectorAll('.ai-quick-kit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset.style;
      generateDrumKit(style, audioNodes, params);
    });
  });

  // Transport controls
  document.getElementById('ai-play').addEventListener('click', () => {
    if (sequencerInterval) {
      stopSequencer();
    } else {
      startSequencer(audioNodes, params);
    }
  });

  document.getElementById('ai-stop').addEventListener('click', () => {
    stopSequencer();
  });

  // Swing control
  document.getElementById('ai-swing-slider').addEventListener('input', (e) => {
    params.swing = parseInt(e.target.value);
    document.getElementById('ai-swing-value').textContent = params.swing + '%';
  });

  // Download all sounds
  document.getElementById('ai-download-all').addEventListener('click', () => {
    downloadAllSounds();
  });

  // Save preset
  document.getElementById('ai-save-preset').addEventListener('click', () => {
    // Prompt for custom name (optional)
    const customName = prompt('Preset name (leave empty for auto-generated):');
    savePreset(audioNodes, params, customName?.trim() || null);
  });

  // Load saved sounds and presets on init
  loadSoundsFromLocalStorage();
  updatePresetsUI();

  // Render empty tracks on init
  renderTracks(audioNodes, params);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Spacebar: Play/Pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (sequencerInterval) {
        stopSequencer();
      } else {
        startSequencer(audioNodes, params);
      }
    }
  });
}

function initializeNexusControls(audioNodes, params, retryCount = 0) {
  const maxRetries = 10;

  if (typeof Nexus === 'undefined') {
    if (retryCount < maxRetries) {
      console.warn(`[AI Drum] NexusUI not loaded yet, retry ${retryCount + 1}/${maxRetries}...`);
      setTimeout(() => initializeNexusControls(audioNodes, params, retryCount + 1), 1000);
    } else {
      console.error('[AI Drum] ✗ NexusUI failed to load after 10 retries');
      alert('Failed to load NexusUI library. Check your internet connection and reload the page.');
    }
    return;
  }

  console.log('[AI Drum] Initializing NexusUI controls...');

  // Get or create analyser in the correct audio context
  const ctx = audioNodes.nodes.masterGain.context;
  let analyser = audioNodes.nodes.analyser;

  // Verify analyser is from the correct context
  if (!analyser || analyser.context !== ctx) {
    console.log('[AI Drum] Creating analyser for oscilloscope');
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;

    // Connect to audio chain: masterGain -> analyser -> (destination already connected by test page)
    // Don't disconnect masterGain as test page may have connected it
    // Just tap the signal for analysis
    const splitter = ctx.createChannelSplitter(2);
    audioNodes.nodes.masterGain.connect(splitter);
    splitter.connect(analyser, 0);

    audioNodes.nodes.analyser = analyser;
  }

  // Oscilloscope - Large central visualizer
  const oscilloscope = new Nexus.Oscilloscope('#ai-oscilloscope', {
    size: [600, 300]
  });

  // Connect oscilloscope to analyser
  try {
    oscilloscope.connect(analyser);
    console.log('[AI Drum] ✓ Oscilloscope connected');
  } catch (error) {
    console.error('[AI Drum] ✗ Oscilloscope connection failed:', error);
  }

  // BPM Dial
  const bpmDial = new Nexus.Dial('#ai-bpm-dial-viz', {
    size: [80, 80],
    interaction: 'radial',
    mode: 'relative',
    min: 60,
    max: 200,
    step: 1,
    value: 120
  });

  bpmDial.on('change', (v) => {
    params.bpm = Math.round(v);
    document.getElementById('ai-bpm-value-viz').textContent = params.bpm;
  });

  // Master Volume Slider
  const masterSlider = new Nexus.Slider('#ai-master-slider', {
    size: [40, 120],
    mode: 'relative',
    min: 0,
    max: 1,
    step: 0.01,
    value: 0.8
  });

  masterSlider.on('change', (v) => {
    params.masterVolume = v;
    audioNodes.nodes.masterGain.gain.value = v;
  });

  // Store globally
  window.nexusControls = { oscilloscope, bpmDial, masterSlider };

  console.log('[AI Drum] ✓ NexusUI controls initialized');
}

// ============================================================================
// GENERATION FUNCTIONS
// ============================================================================

async function generateSingleSound(prompt, audioNodes, params) {
  showStatus('Generating 3 variants...', 'loading');
  document.getElementById('ai-generate-single').disabled = true;

  try {
    const response = await fetch('/api/generate-sound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, variants: 3 })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Generation failed');
    }

    const data = await response.json();
    showStatus(`✓ Generated ${data.sounds.length} variants`, 'success');

    // Display variants for selection
    displayVariants(data.sounds, audioNodes, params);

  } catch (error) {
    console.error('[AI Drum] Generation error:', error);
    showStatus(`✗ ${error.message}`, 'error');
  } finally {
    document.getElementById('ai-generate-single').disabled = false;
  }
}

async function generateDrumKit(style, audioNodes, params) {
  showStatus(`Generating ${style} kit (this may take 30-60 seconds)...`, 'loading');
  document.getElementById('ai-generate-kit').disabled = true;

  try {
    const response = await fetch('/api/generate-drum-kit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style, variants: 3 })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Kit generation failed');
    }

    const data = await response.json();
    showStatus(`✓ Generated ${data.totalSounds} sounds`, 'success');

    // Store kit data
    params.kitData = data.kit;

    // Auto-add all sounds to sequencer
    console.log('[AI Drum] Kit data:', data.kit);

    // Each sound type (kick, snare, etc.) has 3 variants
    // Add first variant of each to different tracks
    Object.keys(data.kit).forEach((soundType, index) => {
      const variants = data.kit[soundType];
      if (variants && variants.length > 0) {
        // Add first variant, pass all variants for switching
        addTrack(variants[0], audioNodes, params, variants);
        console.log(`[AI Drum] Added ${soundType} to track ${index + 1}`);
      }
    });

    showStatus(`✓ Kit loaded: ${Object.keys(data.kit).length} sounds with variants`, 'success');

  } catch (error) {
    console.error('[AI Drum] Kit generation error:', error);
    showStatus(`✗ ${error.message}`, 'error');
  } finally {
    document.getElementById('ai-generate-kit').disabled = false;
  }
}

function displayVariants(sounds, audioNodes, params) {
  // Show morph section with animation
  const morphSection = document.getElementById('ai-morph-section');
  morphSection.style.display = 'block';

  // Animate appearance
  if (typeof anime !== 'undefined') {
    anime({
      targets: morphSection,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 600,
      easing: 'easeOutCubic'
    });
  }

  // Initialize XY pad for morphing
  if (!window.nexusMorphPad) {
    window.nexusMorphPad = new Nexus.Position('#ai-morph-pad', {
      size: [500, 500],
      mode: 'absolute',
      x: 0.5,
      y: 0.5
    });

    window.nexusMorphPad.colorize("accent", "#00ff00");
    window.nexusMorphPad.colorize("fill", "#0a0a0a");

    // Real-time morphing on move
    // Update morph weights on pad move
    window.nexusMorphPad.on('change', (v) => {
      morphSounds(sounds, v.x, v.y, audioNodes, params);
    });

    // Play morphed sound on pad click/release
    window.nexusMorphPad.on('release', (v) => {
      if (params.currentMorphWeights && sounds.length === 3) {
        playMorphedSound(sounds, params.currentMorphWeights, audioNodes);
      }
    });

    // Add morphed sound button
    document.getElementById('ai-select-morphed').addEventListener('click', () => {
      const v = window.nexusMorphPad.value;
      const morphed = getMorphedSound(sounds, v.x, v.y);
      selectVariant(morphed, -1, audioNodes, params);

      // Also play the morphed sound
      if (params.currentMorphWeights && sounds.length === 3) {
        playMorphedSound(sounds, params.currentMorphWeights, audioNodes);
      }

      showStatus('✓ Added morphed sound to tracks', 'success');
    });
  }

  // Store sounds for morphing
  params.currentVariants = sounds;

  // Save to localStorage
  saveSoundsToLocalStorage(sounds);

  // Auto-add first variant to sequencer immediately with all variants
  if (sounds.length > 0) {
    addTrack(sounds[0], audioNodes, params, sounds); // Pass all variants
    showStatus(`✓ Added "${sounds[0].prompt}" to sequencer (Variant 1 selected)`, 'success');
  }

  // Also show individual variant selection
  const section = document.getElementById('ai-variants-section');
  const grid = document.getElementById('ai-variants-grid');

  section.style.display = 'block';
  grid.innerHTML = '';

  sounds.forEach((sound, index) => {
    const card = document.createElement('div');
    card.className = 'ai-variant-card';
    card.dataset.variant = index;

    card.innerHTML = `
      <div class="ai-variant-number">${index + 1}</div>
      <div class="ai-variant-waveform">~ waveform ~</div>
      <div class="ai-variant-controls">
        <button class="ai-variant-btn" data-action="play">▶ Play</button>
        <button class="ai-variant-btn" data-action="select">✓ Select</button>
      </div>
    `;

    // Play button
    card.querySelector('[data-action="play"]').addEventListener('click', (e) => {
      e.stopPropagation();
      playVariant(sound, audioNodes);
    });

    // Select button
    card.querySelector('[data-action="select"]').addEventListener('click', (e) => {
      e.stopPropagation();
      selectVariant(sound, index, audioNodes, params);
    });

    grid.appendChild(card);
  });
}

function morphSounds(sounds, x, y, audioNodes, params) {
  // Calculate blend weights based on XY position
  // Position variants in triangle: top (0.5, 0), bottom-left (0, 1), bottom-right (1, 1)

  const positions = [
    { x: 0.5, y: 0 },    // Variant 1 - top
    { x: 0, y: 1 },      // Variant 2 - bottom left
    { x: 1, y: 1 }       // Variant 3 - bottom right
  ];

  const weights = positions.map(pos => {
    const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
    return Math.max(0, 1 - dist);
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);

  // Visual feedback of current blend
  console.log('[AI Drum] Morph weights:', normalizedWeights.map(w => Math.round(w * 100) + '%'));

  // Store current morph state
  params.currentMorphWeights = normalizedWeights;
  params.currentMorphPosition = { x, y };
}

function getMorphedSound(sounds, x, y) {
  // For now, return closest sound
  // TODO: Actually blend audio buffers

  const positions = [
    { x: 0.5, y: 0, sound: sounds[0] },
    { x: 0, y: 1, sound: sounds[1] },
    { x: 1, y: 1, sound: sounds[2] }
  ];

  let closest = positions[0];
  let minDist = Infinity;

  positions.forEach(pos => {
    const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
    if (dist < minDist) {
      minDist = dist;
      closest = pos;
    }
  });

  return closest.sound;
}

async function playVariant(sound, audioNodes) {
  try {
    const ctx = audioNodes.nodes.masterGain.context;

    // Decode base64 audio
    const audioData = atob(sound.audioData);
    const arrayBuffer = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      arrayBuffer[i] = audioData.charCodeAt(i);
    }

    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.buffer);

    // Play
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioNodes.nodes.masterGain);
    source.start(0);

  } catch (error) {
    console.error('[AI Drum] Playback error:', error);
  }
}

async function playMorphedSound(sounds, weights, audioNodes) {
  try {
    if (!sounds || sounds.length < 3) {
      console.warn('[AI Drum] Not enough variants to morph');
      return;
    }

    const ctx = audioNodes.nodes.masterGain.context;

    // For now, play all 3 variants simultaneously with volume based on weights
    // Full morphing would require buffer blending, which is complex
    const playPromises = sounds.map(async (sound, i) => {
      const weight = weights[i];
      if (weight < 0.01) return; // Skip if weight too low

      try {
        const audioData = atob(sound.audioData);
        const arrayBuffer = new Uint8Array(audioData.length);
        for (let j = 0; j < audioData.length; j++) {
          arrayBuffer[j] = audioData.charCodeAt(j);
        }

        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.buffer);

        // Create gain node for this variant's volume
        const gainNode = ctx.createGain();
        gainNode.gain.value = weight;
        gainNode.connect(audioNodes.nodes.masterGain);

        // Play with weighted volume
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.start(0);

        console.log(`[AI Drum] Playing variant ${i+1} at ${Math.round(weight * 100)}% volume`);
      } catch (e) {
        console.warn(`[AI Drum] Could not play variant ${i}:`, e);
      }
    });

    await Promise.all(playPromises);
  } catch (error) {
    console.error('[AI Drum] Morph playback error:', error);
  }
}

let sequencerInterval = null;
let currentStep = 0;

function startSequencer(audioNodes, params) {
  if (sequencerInterval) {
    console.log('[AI Drum] Sequencer already running');
    return;
  }

  // Check if any tracks have sounds
  const pattern = params.patterns[params.currentPattern];
  const hasSounds = pattern && pattern.tracks && pattern.tracks.some(t => t.sound);

  if (!hasSounds) {
    showStatus('✗ Generate sounds first before starting sequencer', 'error');
    return;
  }

  console.log('[AI Drum] Starting sequencer at', params.bpm, 'BPM');

  let stepDuration = (60 / params.bpm) * 1000 / 4; // 16th notes
  currentStep = 0;

  // Store timing for swing calculation
  let lastStepTime = audioNodes.nodes.masterGain.context.currentTime;

  // Update play button
  const playBtn = document.getElementById('ai-play');
  playBtn.textContent = '⏸ Pause';
  playBtn.style.background = '#4a4';

  sequencerInterval = setInterval(() => {
    // Recalculate step duration from current BPM (allows real-time changes)
    stepDuration = (60 / params.bpm) * 1000 / 4;

    // Get current pattern
    const pattern = params.patterns[params.currentPattern];
    if (!pattern || !pattern.tracks) {
      console.warn('[AI Drum] No pattern data');
      return;
    }

    // Highlight current step
    highlightStep(currentStep);

    // Check if any tracks are soloed
    const hasSoloedTracks = pattern.tracks.some(t => t.solo);

    // Play active tracks on this step (with per-track length)
    pattern.tracks.forEach((track, trackIndex) => {
      // Calculate track-specific step (respects individual track length)
      const trackLength = track.length || 16; // Default to 16 if not set
      const trackStep = currentStep % trackLength;

      // Solo logic: if ANY track is soloed, only play soloed tracks
      // Otherwise, respect mute status
      const shouldPlay = hasSoloedTracks ? track.solo : !track.mute;

      if (shouldPlay && track.steps[trackStep] === 1 && track.sound) {
        // Apply swing if enabled (delay even steps slightly)
        const swingAmount = params.swing || 0;
        const isEvenStep = trackStep % 2 === 1;
        const swingDelay = isEvenStep ? (stepDuration * swingAmount / 100) : 0;

        // Schedule playback
        setTimeout(() => {
          playVariant(track.sound, audioNodes);
        }, swingDelay);
      }
    });

    // Advance step (global counter, tracks loop independently)
    currentStep = (currentStep + 1) % 16;
  }, stepDuration);
}

function stopSequencer() {
  if (sequencerInterval) {
    clearInterval(sequencerInterval);
    sequencerInterval = null;
    currentStep = 0;

    // Update play button
    const playBtn = document.getElementById('ai-play');
    playBtn.textContent = '▶ Play';
    playBtn.style.background = '';

    // Clear step highlighting
    clearStepHighlights();

    console.log('[AI Drum] Sequencer stopped');
  }
}

function highlightStep(step) {
  // Clear previous highlights
  document.querySelectorAll('.ai-step').forEach(s => s.classList.remove('active-step'));

  // Highlight current step column
  const activeSteps = document.querySelectorAll(`.ai-step[data-step="${step}"]`);
  activeSteps.forEach(s => {
    s.classList.add('active-step');

    // Animate with anime.js if available
    if (typeof anime !== 'undefined') {
      anime({
        targets: s,
        scale: [1.1, 1],
        backgroundColor: ['#00ff00', '#0a0a0a'],
        duration: 150,
        easing: 'easeOutQuad'
      });
    }
  });
}

function clearStepHighlights() {
  const steps = document.querySelectorAll('.ai-step');

  if (typeof anime !== 'undefined') {
    anime({
      targets: Array.from(steps),
      opacity: [1, 0.7, 1],
      duration: 200,
      easing: 'easeInOutQuad',
      complete: () => {
        steps.forEach(s => s.classList.remove('active-step'));
      }
    });
  } else {
    steps.forEach(s => s.classList.remove('active-step'));
  }
}

function selectVariant(sound, index, audioNodes, params) {
  // Mark as selected visually
  document.querySelectorAll('.ai-variant-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[data-variant="${index}"]`).classList.add('selected');

  // Add to generated sounds
  params.generatedSounds.push(sound);

  // Add track
  addTrack(sound, audioNodes, params);

  showStatus(`✓ Added variant ${index + 1} to tracks`, 'success');
}

function addTrack(sound, audioNodes, params, allVariants = null) {
  // Store all variants if provided (for switching)
  const variants = allVariants || [sound];
  const selectedVariant = 0; // Default to first variant

  const track = {
    soundId: sound.id,
    sound: sound, // Current selected sound
    variants: variants, // All 3 variants
    selectedVariant: selectedVariant,
    prompt: sound.prompt,
    steps: new Array(16).fill(0),
    length: 16, // Per-track length
    volume: 0.8,
    mute: false,
    solo: false
  };

  params.tracks.push(track);

  // Also add to current pattern if there's space
  const pattern = params.patterns[params.currentPattern];
  const trackIndex = pattern.tracks.findIndex(t => t.sampleId === null);

  if (trackIndex !== -1) {
    pattern.tracks[trackIndex] = {
      sampleId: sound.id,
      sound: sound, // Store sound for playback
      variants: variants,
      selectedVariant: selectedVariant,
      steps: new Array(16).fill(0),
      mute: false,
      solo: false,
      volume: 0.8
    };
    console.log(`[AI Drum] Added sound to pattern track ${trackIndex + 1}`);
  } else {
    console.warn('[AI Drum] No empty pattern tracks available');
  }

  // Re-render tracks
  renderTracks(audioNodes, params);
}

function renderTracks(audioNodes, params) {
  const container = document.getElementById('ai-track-list');
  container.innerHTML = '';

  // Always show 8 tracks (filled or empty)
  const maxTracks = 8;
  const defaultTrackNames = ['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Perc 1', 'Perc 2', 'FX 1', 'FX 2'];

  for (let trackIndex = 0; trackIndex < maxTracks; trackIndex++) {
    const track = params.tracks[trackIndex];
    const hasSound = track && track.sound;
    const trackDiv = document.createElement('div');
    trackDiv.className = 'ai-track';
    if (!hasSound) {
      trackDiv.style.opacity = '0.5';
    }

    // Label with variant selector and morph button
    const labelContainer = document.createElement('div');
    labelContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; width: 180px;';

    const label = document.createElement('div');
    label.className = 'ai-track-label';

    if (hasSound) {
      label.textContent = track.prompt.substring(0, 15);
      label.title = track.prompt;
    } else {
      label.textContent = defaultTrackNames[trackIndex];
      label.title = 'Empty - generate sounds to fill';
      label.style.color = '#666';
    }
    label.style.flex = '1';

    // Variant selector (if multiple variants available)
    if (hasSound && track.variants && track.variants.length > 1) {
      const variantSelector = document.createElement('select');
      variantSelector.style.cssText = 'background: #222; color: #00ff00; border: 1px solid #333; padding: 2px 4px; font-size: 11px; cursor: pointer;';

      track.variants.forEach((variant, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `v${i + 1}`;
        if (i === track.selectedVariant) option.selected = true;
        variantSelector.appendChild(option);
      });

      variantSelector.addEventListener('change', (e) => {
        const newVariantIndex = parseInt(e.target.value);
        track.selectedVariant = newVariantIndex;
        track.sound = track.variants[newVariantIndex];

        // Update pattern track too
        const pattern = params.patterns[params.currentPattern];
        if (pattern && pattern.tracks[trackIndex]) {
          pattern.tracks[trackIndex].sound = track.sound;
          pattern.tracks[trackIndex].selectedVariant = newVariantIndex;
        }

        console.log(`[AI Drum] Switched track ${trackIndex + 1} to variant ${newVariantIndex + 1}`);
        showStatus(`✓ Switched to Variant ${newVariantIndex + 1}`, 'success');
      });

      labelContainer.appendChild(label);
      labelContainer.appendChild(variantSelector);

      // Morph button (shows morph interface for this sound's variants)
      const morphBtn = document.createElement('button');
      morphBtn.textContent = '⚡';
      morphBtn.title = 'Morph between variants';
      morphBtn.style.cssText = 'background: #222; color: #888; border: 1px solid #333; padding: 2px 6px; font-size: 14px; cursor: pointer; border-radius: 3px;';
      morphBtn.addEventListener('click', () => {
        // Show morph section with this track's variants
        const morphSection = document.getElementById('ai-morph-section');
        morphSection.style.display = 'block';

        // Update morph pad to use this track's variants
        params.currentVariants = track.variants;

        // Scroll to morph section
        morphSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

        showStatus(`✓ Morph interface ready for "${track.prompt}"`, 'success');
      });
      morphBtn.addEventListener('mouseenter', () => {
        morphBtn.style.color = '#00ff00';
      });
      morphBtn.addEventListener('mouseleave', () => {
        morphBtn.style.color = '#888';
      });

      labelContainer.appendChild(morphBtn);
    } else {
      labelContainer.appendChild(label);
    }

    // Steps
    const steps = document.createElement('div');
    steps.className = 'ai-track-steps';

    for (let i = 0; i < 16; i++) {
      const step = document.createElement('div');
      step.className = 'ai-step';
      step.dataset.step = i; // For highlighting during playback

      if (hasSound && track.steps[i] === 1) {
        step.classList.add('active');
      }

      if (!hasSound) {
        step.style.cursor = 'not-allowed';
        step.style.opacity = '0.3';
      }

      step.addEventListener('click', () => {
        if (!hasSound) {
          showStatus('✗ Generate sounds first to program steps', 'error');
          return;
        }

        // Toggle step
        track.steps[i] = track.steps[i] === 1 ? 0 : 1;
        step.classList.toggle('active');

        // Also update pattern track
        const pattern = params.patterns[params.currentPattern];
        if (pattern && pattern.tracks[trackIndex]) {
          pattern.tracks[trackIndex].steps[i] = track.steps[i];
          console.log(`[AI Drum] Updated pattern track ${trackIndex + 1}, step ${i + 1}: ${track.steps[i] ? 'ON' : 'OFF'}`);
        }
      });

      steps.appendChild(step);
    }

    // Controls
    const controls = document.createElement('div');
    controls.className = 'ai-track-controls';

    const muteBtn = document.createElement('button');
    muteBtn.className = 'ai-track-btn';
    muteBtn.textContent = 'M';

    if (hasSound) {
      if (track.mute) muteBtn.classList.add('active');
      muteBtn.addEventListener('click', () => {
        track.mute = !track.mute;
        muteBtn.classList.toggle('active');

        // Update pattern track
        const pattern = params.patterns[params.currentPattern];
        if (pattern && pattern.tracks[trackIndex]) {
          pattern.tracks[trackIndex].mute = track.mute;
        }
      });
    } else {
      muteBtn.disabled = true;
      muteBtn.style.opacity = '0.3';
      muteBtn.style.cursor = 'not-allowed';
    }

    const soloBtn = document.createElement('button');
    soloBtn.className = 'ai-track-btn';
    soloBtn.textContent = 'S';

    if (hasSound) {
      if (track.solo) soloBtn.classList.add('active');
      soloBtn.addEventListener('click', () => {
        track.solo = !track.solo;
        soloBtn.classList.toggle('active');

        // Update pattern track
        const pattern = params.patterns[params.currentPattern];
        if (pattern && pattern.tracks[trackIndex]) {
          pattern.tracks[trackIndex].solo = track.solo;
        }
      });
    } else {
      soloBtn.disabled = true;
      soloBtn.style.opacity = '0.3';
      soloBtn.style.cursor = 'not-allowed';
    }

    controls.appendChild(muteBtn);
    controls.appendChild(soloBtn);

    trackDiv.appendChild(labelContainer);
    trackDiv.appendChild(steps);
    trackDiv.appendChild(controls);

    container.appendChild(trackDiv);
  }
}

function showStatus(message, type = '') {
  const status = document.getElementById('ai-status');
  status.textContent = message;
  status.className = `ai-status show ${type}`;

  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      status.classList.remove('show');
    }, 3000);
  }
}

// ============================================================================
// SOUNDS LIBRARY & PERSISTENCE
// ============================================================================

function saveSoundsToLocalStorage(sounds) {
  try {
    const existing = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');

    // Add new sounds, avoid duplicates by ID
    sounds.forEach(sound => {
      if (!existing.find(s => s.id === sound.id)) {
        existing.push({
          id: sound.id,
          prompt: sound.prompt,
          audioData: sound.audioData,
          variant: sound.variant,
          timestamp: Date.now()
        });
      }
    });

    localStorage.setItem('ai-drum-sounds', JSON.stringify(existing));
    updateSoundsLibraryUI();
    console.log(`[AI Drum] Saved ${existing.length} sounds to localStorage`);
  } catch (error) {
    console.error('[AI Drum] Failed to save sounds:', error);
    if (error.name === 'QuotaExceededError') {
      showStatus('⚠ Storage full - clearing old sounds', 'error');
      // Keep only last 20 sounds
      const existing = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');
      const recent = existing.slice(-20);
      localStorage.setItem('ai-drum-sounds', JSON.stringify(recent));
    }
  }
}

function loadSoundsFromLocalStorage() {
  try {
    const sounds = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');
    console.log(`[AI Drum] Loaded ${sounds.length} sounds from localStorage`);
    updateSoundsLibraryUI();
    return sounds;
  } catch (error) {
    console.error('[AI Drum] Failed to load sounds:', error);
    return [];
  }
}

function updateSoundsLibraryUI() {
  const sounds = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');
  const countEl = document.getElementById('ai-sounds-count');
  const listEl = document.getElementById('ai-sounds-list');

  if (countEl) countEl.textContent = sounds.length;

  if (listEl) {
    if (sounds.length === 0) {
      listEl.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">No sounds generated yet</div>';
      return;
    }

    listEl.innerHTML = '';

    // Group by prompt (show only unique prompts)
    const uniquePrompts = {};
    sounds.forEach(sound => {
      if (!uniquePrompts[sound.prompt]) {
        uniquePrompts[sound.prompt] = [];
      }
      uniquePrompts[sound.prompt].push(sound);
    });

    Object.keys(uniquePrompts).forEach(prompt => {
      const soundGroup = uniquePrompts[prompt];
      const div = document.createElement('div');
      div.style.cssText = 'padding: 10px; margin: 5px 0; background: #0f0f0f; border: 1px solid #222; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;';

      div.innerHTML = `
        <div>
          <div style="color: #00ff00; font-size: 13px; margin-bottom: 4px;">${prompt}</div>
          <div style="color: #666; font-size: 11px;">${soundGroup.length} variant${soundGroup.length > 1 ? 's' : ''}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="ai-variant-btn" onclick="downloadSound('${soundGroup[0].id}')" style="font-size: 11px; padding: 4px 8px;">⬇ Download</button>
          <button class="ai-variant-btn" onclick="deleteSound('${soundGroup[0].id}')" style="font-size: 11px; padding: 4px 8px; background: #f44;">✗ Delete</button>
        </div>
      `;

      listEl.appendChild(div);
    });
  }
}

function downloadSound(soundId) {
  try {
    const sounds = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');
    const sound = sounds.find(s => s.id === soundId);

    if (!sound) {
      showStatus('✗ Sound not found', 'error');
      return;
    }

    // Convert base64 to blob
    const audioData = atob(sound.audioData);
    const arrayBuffer = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      arrayBuffer[i] = audioData.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sound.prompt.replace(/[^a-z0-9]/gi, '-')}-v${sound.variant}.mp3`;
    a.click();

    URL.revokeObjectURL(url);
    showStatus(`✓ Downloaded ${sound.prompt}`, 'success');
  } catch (error) {
    console.error('[AI Drum] Download error:', error);
    showStatus('✗ Download failed', 'error');
  }
}

function downloadAllSounds() {
  try {
    const sounds = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');

    if (sounds.length === 0) {
      showStatus('No sounds to download', 'error');
      return;
    }

    sounds.forEach(sound => downloadSound(sound.id));
    showStatus(`✓ Downloading ${sounds.length} sounds`, 'success');
  } catch (error) {
    console.error('[AI Drum] Download all error:', error);
    showStatus('✗ Download failed', 'error');
  }
}

function deleteSound(soundId) {
  try {
    const sounds = JSON.parse(localStorage.getItem('ai-drum-sounds') || '[]');
    const filtered = sounds.filter(s => s.id !== soundId);

    localStorage.setItem('ai-drum-sounds', JSON.stringify(filtered));
    updateSoundsLibraryUI();
    showStatus('✓ Sound deleted', 'success');
  } catch (error) {
    console.error('[AI Drum] Delete error:', error);
    showStatus('✗ Delete failed', 'error');
  }
}

// Make functions global for onclick handlers
window.downloadSound = downloadSound;
window.deleteSound = deleteSound;

// ============================================================================
// PRESETS
// ============================================================================

function generatePresetName(params) {
  // Generate descriptive name based on content
  const tracks = params.tracks.filter(t => t.sound);

  if (tracks.length === 0) {
    return `Empty ${new Date().toLocaleTimeString()}`;
  }

  // Detect kit style from prompts
  let style = null;
  const allPrompts = tracks.map(t => t.prompt.toLowerCase()).join(' ');

  if (allPrompts.includes('808')) style = '808';
  else if (allPrompts.includes('trap')) style = 'Trap';
  else if (allPrompts.includes('house')) style = 'House';
  else if (allPrompts.includes('techno')) style = 'Techno';
  else if (allPrompts.includes('dnb') || allPrompts.includes('drum and bass')) style = 'DnB';
  else if (allPrompts.includes('lofi') || allPrompts.includes('lo-fi')) style = 'Lo-Fi';
  else if (allPrompts.includes('acoustic')) style = 'Acoustic';
  else if (allPrompts.includes('industrial')) style = 'Industrial';

  // Count active steps per track
  let totalSteps = 0;
  const pattern = params.patterns[params.currentPattern];
  pattern.tracks.forEach(t => {
    totalSteps += t.steps.filter(s => s === 1).length;
  });

  // Classify pattern complexity
  const density = totalSteps === 0 ? 'empty' :
                  totalSteps > 30 ? 'heavy' :
                  totalSteps > 20 ? 'full' :
                  totalSteps > 10 ? 'medium' : 'sparse';

  // Build name
  const bpm = params.bpm;
  const swing = params.swing > 0 ? ` sw${params.swing}%` : '';

  if (style) {
    return `${style} ${density} ${bpm}bpm${swing}`;
  } else {
    // Generic name with track count
    return `${tracks.length}trk ${density} ${bpm}bpm${swing}`;
  }
}

function savePreset(audioNodes, params, customName = null) {
  try {
    const presetName = customName || generatePresetName(params);

    const preset = {
      id: Date.now().toString(),
      name: presetName,
      timestamp: Date.now(),
      bpm: params.bpm,
      swing: params.swing,
      masterVolume: params.masterVolume,
      tracks: params.tracks.map(t => ({
        soundId: t.soundId,
        sound: t.sound,
        variants: t.variants,
        selectedVariant: t.selectedVariant,
        prompt: t.prompt,
        steps: [...t.steps],
        length: t.length,
        volume: t.volume,
        mute: t.mute,
        solo: t.solo
      })),
      patterns: params.patterns.map(p => ({
        id: p.id,
        name: p.name,
        length: p.length,
        tracks: p.tracks.map(t => ({
          sampleId: t.sampleId,
          sound: t.sound,
          variants: t.variants,
          selectedVariant: t.selectedVariant,
          steps: [...t.steps],
          length: t.length,
          mute: t.mute,
          solo: t.solo,
          volume: t.volume
        }))
      })),
      currentPattern: params.currentPattern
    };

    // Save to localStorage
    const presets = JSON.parse(localStorage.getItem('ai-drum-presets') || '[]');
    presets.push(preset);
    localStorage.setItem('ai-drum-presets', JSON.stringify(presets));

    updatePresetsUI();
    showStatus(`✓ Preset saved: "${presetName}"`, 'success');
    console.log('[AI Drum] Preset saved:', presetName);

    return preset;
  } catch (error) {
    console.error('[AI Drum] Save preset error:', error);
    showStatus('✗ Failed to save preset', 'error');
  }
}

function loadPreset(presetId, audioNodes, params) {
  try {
    const presets = JSON.parse(localStorage.getItem('ai-drum-presets') || '[]');
    const preset = presets.find(p => p.id === presetId);

    if (!preset) {
      showStatus('✗ Preset not found', 'error');
      return;
    }

    // Load all preset data into params
    params.bpm = preset.bpm;
    params.swing = preset.swing;
    params.masterVolume = preset.masterVolume;
    params.tracks = preset.tracks.map(t => ({...t}));
    params.patterns = preset.patterns.map(p => ({
      ...p,
      tracks: p.tracks.map(t => ({...t}))
    }));
    params.currentPattern = preset.currentPattern || 0;

    // Update UI
    document.getElementById('ai-bpm-value-viz').textContent = params.bpm;
    document.getElementById('ai-swing-value').textContent = params.swing + '%';
    document.getElementById('ai-swing-slider').value = params.swing;

    // Update BPM dial if it exists
    if (window.nexusControls && window.nexusControls.bpmDial) {
      window.nexusControls.bpmDial.value = params.bpm;
    }

    // Re-render tracks
    renderTracks(audioNodes, params);

    showStatus(`✓ Loaded: "${preset.name}"`, 'success');
    console.log('[AI Drum] Preset loaded:', preset.name);
  } catch (error) {
    console.error('[AI Drum] Load preset error:', error);
    showStatus('✗ Failed to load preset', 'error');
  }
}

function deletePreset(presetId) {
  try {
    const presets = JSON.parse(localStorage.getItem('ai-drum-presets') || '[]');
    const filtered = presets.filter(p => p.id !== presetId);

    localStorage.setItem('ai-drum-presets', JSON.stringify(filtered));
    updatePresetsUI();
    showStatus('✓ Preset deleted', 'success');
  } catch (error) {
    console.error('[AI Drum] Delete preset error:', error);
    showStatus('✗ Delete failed', 'error');
  }
}

function updatePresetsUI() {
  const presets = JSON.parse(localStorage.getItem('ai-drum-presets') || '[]');
  const countEl = document.getElementById('ai-presets-count');
  const listEl = document.getElementById('ai-presets-list');

  if (countEl) countEl.textContent = presets.length;

  if (listEl) {
    if (presets.length === 0) {
      listEl.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">No presets saved</div>';
      return;
    }

    listEl.innerHTML = '';

    // Sort by timestamp (newest first)
    presets.sort((a, b) => b.timestamp - a.timestamp);

    presets.forEach(preset => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 10px; margin: 5px 0; background: #0f0f0f; border: 1px solid #222; border-radius: 4px; cursor: pointer; transition: all 0.2s;';

      const date = new Date(preset.timestamp).toLocaleDateString();
      const time = new Date(preset.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const trackCount = preset.tracks.filter(t => t.sound).length;

      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;" onclick="loadPreset('${preset.id}', window.aiDrumAudioNodes, window.aiDrumMachine.params)">
            <div style="color: #ffaa00; font-size: 13px; font-weight: 600; margin-bottom: 4px;">${preset.name}</div>
            <div style="color: #666; font-size: 11px;">${trackCount} tracks • ${preset.bpm} BPM • ${date} ${time}</div>
          </div>
          <button onclick="event.stopPropagation(); deletePreset('${preset.id}')" style="background: #f44; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer;">✗</button>
        </div>
      `;

      div.addEventListener('mouseenter', () => {
        div.style.background = '#1a1a1a';
        div.style.borderColor = '#ffaa00';
      });

      div.addEventListener('mouseleave', () => {
        div.style.background = '#0f0f0f';
        div.style.borderColor = '#222';
      });

      listEl.appendChild(div);
    });
  }
}

// Make functions global
window.loadPreset = loadPreset;
window.deletePreset = deletePreset;
