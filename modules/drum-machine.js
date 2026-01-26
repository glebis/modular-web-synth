// Drum Machine - AI-powered sample sequencer with polyrhythmic patterns
// Features: folder drop, AI categorization, 16 tracks, variable length, multi-pattern

export default {
  id: "drum-machine",
  name: "Drum Machine",
  version: "1.0.0",

  audio: {
    createNodes: (ctx) => {
      // Simple gain pass-through initially
      // Individual sample playback will connect directly to output
      const inputNode = ctx.createGain();
      const outputNode = ctx.createGain();
      const masterGain = ctx.createGain();

      inputNode.gain.value = 1.0;
      outputNode.gain.value = 1.0;
      masterGain.gain.value = 0.8; // Master volume for drum machine

      // Input -> Output for pass-through
      inputNode.connect(outputNode);

      // Master gain for all drum samples
      masterGain.connect(outputNode);

      return {
        input: inputNode,
        output: outputNode,
        nodes: {
          input: inputNode,
          output: outputNode,
          masterGain: masterGain
        }
      };
    },
    insertionPoint: "post-oscillator", // Parallel to main synth
    routing: "parallel"
  },

  ui: {
    container: "custom-controls",
    template: `
      <style>
        .drum-machine-container {
          padding: 20px;
          background: #0a0a0a;
          border: 2px solid #00ff00;
          border-radius: 8px;
          max-width: 1400px;
        }

        .dm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #00ff00;
        }

        .dm-transport {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .dm-btn {
          padding: 8px 16px;
          background: #0a0a0a;
          color: #00ff00;
          border: 1px solid #00ff00;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Monaco', monospace;
          transition: all 0.2s;
        }

        .dm-btn:hover {
          background: #00ff00;
          color: #0a0a0a;
        }

        .dm-btn.active {
          background: #ffaa00;
          color: #0a0a0a;
          border-color: #ffaa00;
        }

        .dm-drop-zone {
          border: 2px dashed #00ff00;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          margin: 20px 0;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dm-drop-zone:hover,
        .dm-drop-zone.drag-over {
          background: rgba(0, 255, 0, 0.1);
          border-color: #ffaa00;
        }

        .dm-drop-zone-text {
          font-size: 18px;
          color: #00ff00;
          margin-bottom: 10px;
        }

        .dm-drop-zone-hint {
          font-size: 12px;
          color: #666;
        }

        .dm-sample-browser {
          margin: 20px 0;
          display: none; /* Hidden until samples loaded */
        }

        .dm-category {
          margin-bottom: 15px;
          border: 1px solid #333;
          border-radius: 4px;
          overflow: hidden;
        }

        .dm-category-header {
          background: #1a1a1a;
          padding: 10px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }

        .dm-category-title {
          font-weight: bold;
          text-transform: uppercase;
        }

        .dm-category.kicks .dm-category-title { color: #ff4444; }
        .dm-category.snares .dm-category-title { color: #4444ff; }
        .dm-category.hats .dm-category-title { color: #ffff44; }
        .dm-category.perc .dm-category-title { color: #44ff44; }
        .dm-category.other .dm-category-title { color: #888; }

        .dm-category-count {
          color: #666;
          font-size: 12px;
        }

        .dm-category-samples {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          padding: 10px;
          background: #0f0f0f;
        }

        .dm-category-samples.collapsed {
          display: none;
        }

        .dm-sample-card {
          padding: 10px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dm-sample-card:hover {
          border-color: #00ff00;
          background: #252525;
        }

        .dm-sample-name {
          font-size: 12px;
          color: #00ff00;
          margin-bottom: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dm-sample-info {
          font-size: 10px;
          color: #666;
        }

        .dm-sequencer {
          margin-top: 20px;
          display: none; /* Hidden until samples loaded */
        }

        .dm-pattern-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
          padding: 10px;
          background: #1a1a1a;
          border-radius: 4px;
        }

        .dm-track-row {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          padding: 5px;
          background: #0f0f0f;
          border-radius: 4px;
        }

        .dm-track-label {
          width: 150px;
          font-size: 11px;
          color: #00ff00;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
        }

        .dm-track-label:hover {
          color: #ffaa00;
        }

        .dm-step-grid {
          display: flex;
          gap: 2px;
          flex: 1;
        }

        .dm-step-btn {
          width: 24px;
          height: 24px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.1s;
          font-size: 8px;
          color: #666;
        }

        .dm-step-btn:hover {
          border-color: #00ff00;
        }

        .dm-step-btn.active {
          background: #00ff00;
          color: #0a0a0a;
          border-color: #00ff00;
        }

        .dm-step-btn.current {
          border-color: #ffaa00;
          border-width: 2px;
          box-shadow: 0 0 8px #ffaa00;
        }

        .dm-step-btn.beat-1 {
          border-color: #555;
          background: #252525;
        }

        .dm-step-btn.beat-1.active {
          background: #00ff00;
          box-shadow: 0 0 4px #00ff00;
        }

        .dm-track-controls {
          display: flex;
          gap: 5px;
          align-items: center;
          margin-left: 10px;
        }

        .dm-track-btn {
          padding: 4px 8px;
          font-size: 10px;
          background: #1a1a1a;
          color: #00ff00;
          border: 1px solid #333;
          border-radius: 2px;
          cursor: pointer;
        }

        .dm-track-btn.mute {
          color: #ff4444;
        }

        .dm-track-btn.solo {
          color: #ffff44;
        }

        .dm-track-btn.active {
          background: #00ff00;
          color: #0a0a0a;
        }

        .dm-loading {
          text-align: center;
          padding: 20px;
          color: #ffaa00;
          font-style: italic;
        }

        .control-label {
          color: #00ff00;
          font-size: 12px;
        }

        .control-value {
          color: #ffaa00;
        }

        select, input[type="range"] {
          background: #1a1a1a;
          color: #00ff00;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 4px 8px;
        }
      </style>

      <div class="drum-machine-container">
        <div class="dm-header">
          <h2>Drum Machine</h2>
          <div class="dm-transport">
            <button id="dm-play" class="dm-btn">▶ Play</button>
            <button id="dm-stop" class="dm-btn">■ Stop</button>
            <label class="control-label" style="margin-left: 20px;">
              BPM <span class="control-value" id="dm-bpm-value">120</span>
            </label>
            <input type="range" id="dm-bpm" min="60" max="200" value="120" style="width: 150px;">
            <label class="control-label" style="margin-left: 20px;">
              Master <span class="control-value" id="dm-master-value">80%</span>
            </label>
            <input type="range" id="dm-master" min="0" max="100" value="80" style="width: 100px;">
          </div>
        </div>

        <div id="dm-drop-zone" class="dm-drop-zone">
          <div class="dm-drop-zone-text">Drop audio folder here</div>
          <div class="dm-drop-zone-hint">Supports WAV, MP3, OGG - AI will categorize samples automatically</div>
        </div>

        <div id="dm-loading" class="dm-loading" style="display: none;">
          Processing samples...
        </div>

        <div id="dm-sample-browser" class="dm-sample-browser">
          <h3 style="color: #00ff00; margin-bottom: 10px;">Sample Browser</h3>
          <div id="dm-categories"></div>
        </div>

        <div id="dm-sequencer" class="dm-sequencer">
          <div class="dm-pattern-controls">
            <label class="control-label">Pattern</label>
            <select id="dm-pattern-select">
              <option value="0">Pattern 1</option>
            </select>
            <button id="dm-pattern-add" class="dm-btn">+ Add</button>
            <button id="dm-pattern-copy" class="dm-btn">Copy</button>
            <button id="dm-pattern-clear" class="dm-btn">Clear</button>
            <label class="control-label" style="margin-left: 20px;">
              Length <span class="control-value" id="dm-pattern-length-value">16</span>
            </label>
            <select id="dm-pattern-length">
              <option value="8">8</option>
              <option value="16" selected>16</option>
              <option value="32">32</option>
            </select>
          </div>
          <div id="dm-tracks"></div>
        </div>
      </div>
    `,
    bindEvents: (audioNodes, params) => {
      // Store audioNodes globally for sample preview
      window.drumMachineAudioNodes = audioNodes;

      // Initialize IndexedDB on bind
      initIndexedDB(params);

      // Bind all UI event handlers
      bindTransportControls(audioNodes, params);
      bindDropZone(audioNodes, params);
      bindPatternControls(audioNodes, params);
    }
  },

  state: {
    defaults: {
      bpm: 120,
      masterVolume: 0.8,
      patterns: [
        {
          id: 'pattern-1',
          name: 'Pattern 1',
          length: 16,
          tracks: []
        }
      ],
      currentPattern: 0,
      samples: [], // {id, name, category, bufferId, volume, pan, pitch}
      playing: false,
      currentStep: 0
    },
    save: (params) => ({
      bpm: params.bpm,
      masterVolume: params.masterVolume,
      patterns: params.patterns,
      currentPattern: params.currentPattern,
      samples: params.samples // Metadata only, no buffers
    }),
    load: (params, saved, audioNodes) => {
      if (saved.bpm !== undefined) {
        params.bpm = saved.bpm;
        document.getElementById('dm-bpm').value = saved.bpm;
        document.getElementById('dm-bpm-value').textContent = saved.bpm;
      }
      if (saved.masterVolume !== undefined) {
        params.masterVolume = saved.masterVolume;
        audioNodes.nodes.masterGain.gain.value = saved.masterVolume;
        document.getElementById('dm-master').value = saved.masterVolume * 100;
        document.getElementById('dm-master-value').textContent = Math.round(saved.masterVolume * 100) + '%';
      }
      if (saved.patterns) {
        params.patterns = saved.patterns;
        params.currentPattern = saved.currentPattern || 0;
        renderPatternSelector(params);
        renderTracks(audioNodes, params);
      }
      if (saved.samples) {
        params.samples = saved.samples;
        // Verify samples exist in IndexedDB
        verifySamplesInDB(params);
      }
    }
  },

  lifecycle: {
    onLoad: (ctx) => {
      console.log('[Drum Machine] Module loaded');
    },
    onConnect: (ctx) => {
      console.log('[Drum Machine] Audio graph connected');
    },
    onUnload: (ctx) => {
      console.log('[Drum Machine] Module unloading');
      // Stop sequencer if playing
      const params = window.drumMachineParams;
      if (params && params.playing && params.intervalId) {
        clearInterval(params.intervalId);
      }
    }
  }
};

// ============================================================================
// INDEXEDDB MANAGEMENT
// ============================================================================

let dbInstance = null;

async function initIndexedDB(params) {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('drum-machine-samples', 1);

    request.onerror = () => {
      console.error('[Drum Machine] IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('[Drum Machine] IndexedDB initialized');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create samples store if it doesn't exist
      if (!db.objectStoreNames.contains('samples')) {
        const store = db.createObjectStore('samples', { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('uploadDate', 'uploadDate', { unique: false });
        console.log('[Drum Machine] Created samples object store');
      }
    };
  });
}

async function storeSample(sampleData) {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['samples'], 'readwrite');
    const store = transaction.objectStore('samples');
    const request = store.put(sampleData);

    request.onsuccess = () => resolve(sampleData.id);
    request.onerror = () => reject(request.error);
  });
}

async function loadSample(id) {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['samples'], 'readonly');
    const store = transaction.objectStore('samples');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteSample(id) {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['samples'], 'readwrite');
    const store = transaction.objectStore('samples');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAllSamples() {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['samples'], 'readonly');
    const store = transaction.objectStore('samples');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// UI EVENT BINDING
// ============================================================================

function bindTransportControls(audioNodes, params) {
  const playBtn = document.getElementById('dm-play');
  const stopBtn = document.getElementById('dm-stop');
  const bpmSlider = document.getElementById('dm-bpm');
  const bpmValue = document.getElementById('dm-bpm-value');
  const masterSlider = document.getElementById('dm-master');
  const masterValue = document.getElementById('dm-master-value');

  // BPM control
  bpmSlider.addEventListener('input', (e) => {
    params.bpm = parseInt(e.target.value);
    bpmValue.textContent = params.bpm;

    // Restart sequencer if playing
    if (params.playing) {
      stopSequencer(params);
      startSequencer(audioNodes, params);
    }
  });

  // Master volume
  masterSlider.addEventListener('input', (e) => {
    const percent = parseInt(e.target.value);
    params.masterVolume = percent / 100;
    audioNodes.nodes.masterGain.gain.value = params.masterVolume;
    masterValue.textContent = percent + '%';
  });

  // Play button
  playBtn.addEventListener('click', async () => {
    // Resume audio context if suspended (Chrome requirement)
    if (audioNodes.nodes.masterGain.context.state === 'suspended') {
      await audioNodes.nodes.masterGain.context.resume();
    }

    if (!params.playing) {
      startSequencer(audioNodes, params);
      playBtn.classList.add('active');
      playBtn.textContent = '⏸ Pause';
    } else {
      stopSequencer(params);
      playBtn.classList.remove('active');
      playBtn.textContent = '▶ Play';
    }
  });

  // Stop button
  stopBtn.addEventListener('click', () => {
    stopSequencer(params);
    playBtn.classList.remove('active');
    playBtn.textContent = '▶ Play';
    params.currentStep = 0;
  });

  // Store params globally for cleanup
  window.drumMachineParams = params;
}

function bindDropZone(audioNodes, params) {
  const dropZone = document.getElementById('dm-drop-zone');

  // Drag events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    // Show loading
    document.getElementById('dm-loading').style.display = 'block';

    try {
      await handleFileDrop(items, audioNodes, params);
    } catch (error) {
      console.error('[Drum Machine] Error processing files:', error);
      alert('Error processing files: ' + error.message);
    } finally {
      document.getElementById('dm-loading').style.display = 'none';
    }
  });
}

function bindPatternControls(audioNodes, params) {
  const patternSelect = document.getElementById('dm-pattern-select');
  const addBtn = document.getElementById('dm-pattern-add');
  const copyBtn = document.getElementById('dm-pattern-copy');
  const clearBtn = document.getElementById('dm-pattern-clear');
  const lengthSelect = document.getElementById('dm-pattern-length');

  // Pattern switching
  patternSelect.addEventListener('change', (e) => {
    params.currentPattern = parseInt(e.target.value);
    renderTracks(audioNodes, params);
  });

  // Add pattern
  addBtn.addEventListener('click', () => {
    const newId = `pattern-${params.patterns.length + 1}`;
    params.patterns.push({
      id: newId,
      name: `Pattern ${params.patterns.length + 1}`,
      length: 16,
      tracks: []
    });
    renderPatternSelector(params);
    params.currentPattern = params.patterns.length - 1;
    patternSelect.value = params.currentPattern;
    renderTracks(audioNodes, params);
  });

  // Copy pattern
  copyBtn.addEventListener('click', () => {
    const current = params.patterns[params.currentPattern];
    const copy = JSON.parse(JSON.stringify(current)); // Deep copy
    copy.id = `pattern-${params.patterns.length + 1}`;
    copy.name = `${current.name} (Copy)`;
    params.patterns.push(copy);
    renderPatternSelector(params);
    params.currentPattern = params.patterns.length - 1;
    patternSelect.value = params.currentPattern;
    renderTracks(audioNodes, params);
  });

  // Clear pattern
  clearBtn.addEventListener('click', () => {
    const current = params.patterns[params.currentPattern];
    current.tracks.forEach(track => {
      track.steps = new Array(current.length).fill(0);
    });
    renderTracks(audioNodes, params);
  });

  // Pattern length
  lengthSelect.addEventListener('change', (e) => {
    const newLength = parseInt(e.target.value);
    const current = params.patterns[params.currentPattern];
    current.length = newLength;

    // Resize all track steps
    current.tracks.forEach(track => {
      const oldSteps = track.steps || [];
      track.steps = new Array(newLength).fill(0);
      track.velocity = new Array(newLength).fill(127);
      // Copy old steps
      for (let i = 0; i < Math.min(oldSteps.length, newLength); i++) {
        track.steps[i] = oldSteps[i];
      }
      // Update track length if not set
      if (!track.length || track.length > newLength) {
        track.length = newLength;
      }
    });

    document.getElementById('dm-pattern-length-value').textContent = newLength;
    renderTracks(audioNodes, params);
  });
}

// ============================================================================
// FILE HANDLING (Phase 2)
// ============================================================================

async function handleFileDrop(items, audioNodes, params) {
  const files = [];

  // Traverse dropped items
  for (let i = 0; i < items.length; i++) {
    const item = items[i].webkitGetAsEntry();
    if (item) {
      await traverseFileTree(item, files);
    }
  }

  console.log(`[Drum Machine] Found ${files.length} files`);

  // Filter audio files
  const audioFiles = files.filter(file => {
    const ext = file.name.toLowerCase().split('.').pop();
    return ['wav', 'mp3', 'ogg', 'flac', 'm4a'].includes(ext);
  });

  console.log(`[Drum Machine] Loading ${audioFiles.length} audio files`);

  // Load each audio file
  const ctx = audioNodes.nodes.masterGain.context;
  const loadedSamples = [];

  for (const file of audioFiles) {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Verify it's valid audio
      try {
        await ctx.decodeAudioData(arrayBuffer.slice(0));
      } catch (e) {
        console.warn(`[Drum Machine] Skipping invalid audio: ${file.name}`);
        continue;
      }

      // Store in IndexedDB
      const sampleId = `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sampleData = {
        id: sampleId,
        name: file.name.replace(/\.[^.]+$/, ''),
        category: categorizeSample(file.name), // Simple categorization
        arrayBuffer: arrayBuffer,
        uploadDate: Date.now()
      };

      await storeSample(sampleData);

      // Add to params
      const sample = {
        id: sampleId,
        name: sampleData.name,
        category: sampleData.category,
        bufferId: sampleId,
        volume: 0.8,
        pan: 0,
        pitch: 0
      };
      params.samples.push(sample);
      loadedSamples.push(sample);

      console.log(`[Drum Machine] Loaded: ${file.name} (${sampleData.category})`);
    } catch (error) {
      console.error(`[Drum Machine] Error loading ${file.name}:`, error);
    }
  }

  // Auto-assign to tracks
  autoAssignTracks(params, loadedSamples);

  // Show UI
  document.getElementById('dm-drop-zone').style.display = 'none';
  document.getElementById('dm-sample-browser').style.display = 'block';
  document.getElementById('dm-sequencer').style.display = 'block';

  // Render
  renderSampleBrowser(params);
  renderTracks(audioNodes, params);

  console.log(`[Drum Machine] ✓ Loaded ${loadedSamples.length} samples`);
}

async function traverseFileTree(item, files) {
  if (item.isFile) {
    return new Promise((resolve) => {
      item.file((file) => {
        files.push(file);
        resolve();
      });
    });
  } else if (item.isDirectory) {
    const dirReader = item.createReader();
    return new Promise((resolve) => {
      dirReader.readEntries(async (entries) => {
        for (const entry of entries) {
          await traverseFileTree(entry, files);
        }
        resolve();
      });
    });
  }
}

function categorizeSample(filename) {
  const name = filename.toLowerCase();

  if (name.includes('kick') || name.includes('bd') || name.includes('bass drum')) return 'kick';
  if (name.includes('snare') || name.includes('sd') || name.includes('clap')) return 'snare';
  if (name.includes('hat') || name.includes('hh') || name.includes('cymbal')) return 'hat';
  if (name.includes('perc') || name.includes('tom') || name.includes('conga') || name.includes('bongo')) return 'perc';

  return 'other';
}

function autoAssignTracks(params, samples) {
  const pattern = params.patterns[params.currentPattern];

  // Group samples by category
  const byCategory = {
    kick: samples.filter(s => s.category === 'kick'),
    snare: samples.filter(s => s.category === 'snare'),
    hat: samples.filter(s => s.category === 'hat'),
    perc: samples.filter(s => s.category === 'perc'),
    other: samples.filter(s => s.category === 'other')
  };

  // Assign to tracks (max 16 tracks)
  let trackIndex = 0;
  const categories = ['kick', 'snare', 'hat', 'perc', 'other'];

  for (const cat of categories) {
    for (const sample of byCategory[cat]) {
      if (trackIndex >= 16) break;

      pattern.tracks.push({
        sampleId: sample.id,
        steps: new Array(pattern.length).fill(0),
        length: pattern.length,
        velocity: new Array(pattern.length).fill(127),
        offset: 0,
        volume: 0.8,
        mute: false,
        solo: false
      });

      trackIndex++;
    }
    if (trackIndex >= 16) break;
  }

  console.log(`[Drum Machine] Auto-assigned ${pattern.tracks.length} tracks`);
}

// ============================================================================
// SAMPLE PLAYBACK ENGINE (Phase 7)
// ============================================================================

// Sample cache for decoded buffers
const sampleCache = new Map();

async function playSample(audioNodes, params, trackIndex, stepIndex) {
  const pattern = params.patterns[params.currentPattern];
  const track = pattern.tracks[trackIndex];

  if (!track) return;

  const sample = params.samples.find(s => s.id === track.sampleId);
  if (!sample) return;

  try {
    // Get cached buffer or decode
    let audioBuffer = sampleCache.get(sample.bufferId);

    if (!audioBuffer) {
      const sampleData = await loadSample(sample.bufferId);
      if (!sampleData || !sampleData.arrayBuffer) return;

      const ctx = audioNodes.nodes.masterGain.context;
      audioBuffer = await ctx.decodeAudioData(sampleData.arrayBuffer.slice(0));
      sampleCache.set(sample.bufferId, audioBuffer);
    }

    // Create playback chain
    const ctx = audioNodes.nodes.masterGain.context;
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();

    source.buffer = audioBuffer;

    // Apply pitch (playback rate)
    source.playbackRate.value = Math.pow(2, sample.pitch / 12);

    // Apply velocity
    const velocity = track.velocity[stepIndex] / 127;
    gainNode.gain.value = track.volume * sample.volume * velocity;

    // Apply pan
    panNode.pan.value = sample.pan;

    // Connect chain
    source.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioNodes.nodes.masterGain);

    // Play
    source.start(0);

    // Cleanup after playback
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
      panNode.disconnect();
    };

  } catch (error) {
    console.error('[Drum Machine] Playback error:', error);
  }
}

// Manual trigger (for previewing samples)
async function triggerSample(audioNodes, params, sampleId) {
  const sample = params.samples.find(s => s.id === sampleId);
  if (!sample) return;

  try {
    let audioBuffer = sampleCache.get(sample.bufferId);

    if (!audioBuffer) {
      const sampleData = await loadSample(sample.bufferId);
      if (!sampleData) return;

      const ctx = audioNodes.nodes.masterGain.context;
      audioBuffer = await ctx.decodeAudioData(sampleData.arrayBuffer.slice(0));
      sampleCache.set(sample.bufferId, audioBuffer);
    }

    const ctx = audioNodes.nodes.masterGain.context;
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = audioBuffer;
    gainNode.gain.value = sample.volume;

    source.connect(gainNode);
    gainNode.connect(audioNodes.nodes.masterGain);

    source.start(0);

    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };

  } catch (error) {
    console.error('[Drum Machine] Trigger error:', error);
  }
}

// ============================================================================
// SEQUENCER ENGINE (Phase 8)
// ============================================================================

function startSequencer(audioNodes, params) {
  const stepDuration = (60 / params.bpm) * 1000 / 4; // 16th notes

  params.intervalId = setInterval(() => {
    const pattern = params.patterns[params.currentPattern];

    // Check for solo tracks
    const hasSolo = pattern.tracks.some(t => t.solo);

    // Play active steps
    pattern.tracks.forEach((track, trackIndex) => {
      // Skip if muted
      if (track.mute) return;

      // Skip if solo mode and this track isn't soloed
      if (hasSolo && !track.solo) return;

      // Calculate track step with variable length
      const trackStep = params.currentStep % track.length;
      const offsetStep = (trackStep + track.offset) % track.length;

      // Check if step is active
      if (track.steps[offsetStep] === 1) {
        playSample(audioNodes, params, trackIndex, offsetStep);
      }
    });

    // Update visual
    updateStepVisual(params.currentStep, pattern.length);

    // Advance step
    params.currentStep = (params.currentStep + 1) % pattern.length;
  }, stepDuration);

  params.playing = true;
}

function stopSequencer(params) {
  if (params.intervalId) {
    clearInterval(params.intervalId);
    params.intervalId = null;
  }
  params.playing = false;

  // Clear visual highlights
  const buttons = document.querySelectorAll('.dm-step-btn');
  buttons.forEach(btn => btn.classList.remove('current'));
}

function updateStepVisual(currentStep, patternLength) {
  const buttons = document.querySelectorAll('.dm-step-btn');
  buttons.forEach((btn, index) => {
    const stepIndex = index % patternLength;
    if (stepIndex === currentStep) {
      btn.classList.add('current');
    } else {
      btn.classList.remove('current');
    }
  });
}

// ============================================================================
// UI RENDERING
// ============================================================================

function renderPatternSelector(params) {
  const select = document.getElementById('dm-pattern-select');
  select.innerHTML = params.patterns.map((p, i) =>
    `<option value="${i}">${p.name}</option>`
  ).join('');
  select.value = params.currentPattern;
}

function renderTracks(audioNodes, params) {
  const tracksContainer = document.getElementById('dm-tracks');
  const pattern = params.patterns[params.currentPattern];

  if (!pattern.tracks || pattern.tracks.length === 0) {
    tracksContainer.innerHTML = '<div style="color: #666; padding: 20px; text-align: center;">Load samples to begin</div>';
    return;
  }

  tracksContainer.innerHTML = '';

  pattern.tracks.forEach((track, trackIndex) => {
    const sample = params.samples.find(s => s.id === track.sampleId);
    if (!sample) return;

    const row = document.createElement('div');
    row.className = 'dm-track-row';

    // Track label (click to preview)
    const label = document.createElement('div');
    label.className = 'dm-track-label';
    label.textContent = sample.name;
    label.title = 'Click to preview';
    label.addEventListener('click', () => {
      triggerSample(audioNodes, params, sample.id);
    });

    // Step grid
    const grid = document.createElement('div');
    grid.className = 'dm-step-grid';

    for (let i = 0; i < pattern.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'dm-step-btn';
      btn.dataset.track = trackIndex;
      btn.dataset.step = i;

      // Add beat emphasis for downbeats
      if (i % 4 === 0) {
        btn.classList.add('beat-1');
      }

      if (track.steps[i] === 1) {
        btn.classList.add('active');
      }

      // Toggle step on click
      btn.addEventListener('click', () => {
        track.steps[i] = track.steps[i] === 1 ? 0 : 1;
        btn.classList.toggle('active');
      });

      // Right-click for velocity (future)
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // TODO: Show velocity editor
      });

      grid.appendChild(btn);
    }

    // Track controls
    const controls = document.createElement('div');
    controls.className = 'dm-track-controls';

    // Mute button
    const muteBtn = document.createElement('button');
    muteBtn.className = 'dm-track-btn mute';
    muteBtn.textContent = 'M';
    muteBtn.title = 'Mute';
    if (track.mute) muteBtn.classList.add('active');
    muteBtn.addEventListener('click', () => {
      track.mute = !track.mute;
      muteBtn.classList.toggle('active');
    });

    // Solo button
    const soloBtn = document.createElement('button');
    soloBtn.className = 'dm-track-btn solo';
    soloBtn.textContent = 'S';
    soloBtn.title = 'Solo';
    if (track.solo) soloBtn.classList.add('active');
    soloBtn.addEventListener('click', () => {
      track.solo = !track.solo;
      soloBtn.classList.toggle('active');
    });

    controls.appendChild(muteBtn);
    controls.appendChild(soloBtn);

    // Assemble row
    row.appendChild(label);
    row.appendChild(grid);
    row.appendChild(controls);

    tracksContainer.appendChild(row);
  });

  console.log(`[Drum Machine] Rendered ${pattern.tracks.length} tracks`);
}

function renderSampleBrowser(params) {
  const container = document.getElementById('dm-categories');

  // Group by category
  const byCategory = {
    kick: [],
    snare: [],
    hat: [],
    perc: [],
    other: []
  };

  params.samples.forEach(sample => {
    if (byCategory[sample.category]) {
      byCategory[sample.category].push(sample);
    } else {
      byCategory.other.push(sample);
    }
  });

  container.innerHTML = '';

  // Render each category
  Object.entries(byCategory).forEach(([category, samples]) => {
    if (samples.length === 0) return;

    const catDiv = document.createElement('div');
    catDiv.className = `dm-category ${category}s`;

    // Header
    const header = document.createElement('div');
    header.className = 'dm-category-header';
    header.innerHTML = `
      <span class="dm-category-title">${category}s</span>
      <span class="dm-category-count">${samples.length}</span>
    `;

    // Toggle collapse
    let collapsed = false;
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      samplesDiv.classList.toggle('collapsed', collapsed);
    });

    // Samples
    const samplesDiv = document.createElement('div');
    samplesDiv.className = 'dm-category-samples';

    samples.forEach(sample => {
      const card = document.createElement('div');
      card.className = 'dm-sample-card';
      card.innerHTML = `
        <div class="dm-sample-name">${sample.name}</div>
        <div class="dm-sample-info">${category}</div>
      `;

      card.addEventListener('click', () => {
        // Preview sample
        const audioNodes = window.drumMachineAudioNodes;
        if (audioNodes) {
          triggerSample(audioNodes, params, sample.id);
        }
      });

      samplesDiv.appendChild(card);
    });

    catDiv.appendChild(header);
    catDiv.appendChild(samplesDiv);
    container.appendChild(catDiv);
  });

  console.log(`[Drum Machine] Rendered ${params.samples.length} samples in browser`);
}

async function verifySamplesInDB(params) {
  console.log('[Drum Machine] Verifying samples in IndexedDB...');

  const missing = [];

  for (const sample of params.samples) {
    try {
      const data = await loadSample(sample.bufferId);
      if (!data) {
        missing.push(sample.name);
      }
    } catch (error) {
      missing.push(sample.name);
    }
  }

  if (missing.length > 0) {
    console.warn('[Drum Machine] Missing samples:', missing);
    alert(`Warning: ${missing.length} samples not found in IndexedDB:\n${missing.join('\n')}`);
  } else {
    console.log('[Drum Machine] ✓ All samples verified');
  }
}
