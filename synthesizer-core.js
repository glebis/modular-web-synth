// === SYNTHESIZER CORE ===
// Modular synthesizer engine with dynamic module loading

class ModuleLoader {
  constructor(audioContext, masterGain) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
    this.modules = new Map();
    this.audioGraph = {
      oscillatorOutput: null,
      filterNode: null,
      insertionPoints: {
        'pre-gain': [],
        'post-oscillator': [],
        'post-filter': [],
        'pre-master': []
      }
    };
  }

  /**
   * Validate module structure against interface spec
   */
  validateModule(module) {
    const required = ['id', 'name', 'version', 'audio', 'ui'];
    for (const field of required) {
      if (!module[field]) {
        throw new Error(`Module missing required field: ${field}`);
      }
    }

    // Validate audio section
    if (!module.audio.createNodes || typeof module.audio.createNodes !== 'function') {
      throw new Error('Module.audio.createNodes must be a function');
    }
    if (!['pre-gain', 'post-oscillator', 'post-filter', 'pre-master'].includes(module.audio.insertionPoint)) {
      throw new Error(`Invalid insertionPoint: ${module.audio.insertionPoint}`);
    }
    if (!['series', 'parallel'].includes(module.audio.routing)) {
      throw new Error(`Invalid routing mode: ${module.audio.routing}`);
    }

    // Validate UI section
    if (!module.ui.container || !module.ui.template) {
      throw new Error('Module.ui must have container and template');
    }

    return true;
  }

  /**
   * Load module dynamically from URL
   */
  async loadModule(url) {
    console.log(`[ModuleLoader] Loading module from: ${url}`);

    try {
      // Dynamic import
      const moduleExport = await import(url);
      const module = moduleExport.default;

      // Validate
      this.validateModule(module);

      // Check if already loaded
      if (this.modules.has(module.id)) {
        console.warn(`[ModuleLoader] Module ${module.id} already loaded, replacing...`);
        await this.unloadModule(module.id);
      }

      // Create audio nodes
      const audioNodes = module.audio.createNodes(this.audioContext);
      if (!audioNodes.input || !audioNodes.output) {
        throw new Error('Module.audio.createNodes must return {input, output, nodes}');
      }

      // Store module
      const moduleInstance = {
        definition: module,
        audioNodes,
        params: { ...(module.state?.defaults || {}) },
        uiElements: null,
        url: url,  // Store URL for localStorage persistence
        bypassed: false
      };

      this.modules.set(module.id, moduleInstance);

      // Inject UI
      this.injectUI(moduleInstance);

      // Update audio graph
      this.updateAudioGraph();

      // Lifecycle: onLoad
      if (module.lifecycle?.onLoad) {
        module.lifecycle.onLoad(this.audioContext);
      }

      // Lifecycle: onConnect
      if (module.lifecycle?.onConnect) {
        module.lifecycle.onConnect(this.audioContext);
      }

      console.log(`[ModuleLoader] ✓ Module ${module.id} loaded successfully`);

      // Save to localStorage
      this.saveToLocalStorage();

      // Update module browser UI if available
      if (window.updateModuleBrowser) {
        window.updateModuleBrowser();
      }

      return module.id;

    } catch (error) {
      console.error(`[ModuleLoader] Failed to load module:`, error);
      throw error;
    }
  }

  /**
   * Inject module UI into DOM
   */
  injectUI(moduleInstance) {
    const { definition, audioNodes, params } = moduleInstance;
    const container = document.getElementById(definition.ui.container);

    if (!container) {
      console.warn(`[ModuleLoader] Container #${definition.ui.container} not found`);
      return;
    }

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.id = `module-${definition.id}`;
    wrapper.className = 'control-section';
    wrapper.innerHTML = definition.ui.template;

    // Add bypass/delete controls
    const controls = document.createElement('div');
    controls.className = 'module-controls';
    controls.innerHTML = `
      <button class="module-btn bypass" data-module-id="${definition.id}">Bypass</button>
      <button class="module-btn delete" data-module-id="${definition.id}">Delete</button>
    `;
    wrapper.appendChild(controls);

    container.appendChild(wrapper);

    // Trigger entrance animation
    if (window.SynthAnimations) {
      window.SynthAnimations.playModuleEnter(wrapper);
    }

    // Bind control events
    controls.querySelector('.bypass').addEventListener('click', () => {
      this.toggleBypass(definition.id);
    });

    controls.querySelector('.delete').addEventListener('click', () => {
      if (confirm(`Delete module "${definition.name}"?`)) {
        this.unloadModule(definition.id);
      }
    });

    // Bind module events
    if (definition.ui.bindEvents) {
      definition.ui.bindEvents(audioNodes, params);
    }

    moduleInstance.uiElements = wrapper;
  }

  /**
   * Update audio graph routing
   * Connects modules based on insertionPoint
   */
  updateAudioGraph() {
    // Disconnect all module outputs and filter
    this.modules.forEach(({ audioNodes }) => {
      try { audioNodes.output.disconnect(); } catch (e) {}
    });
    try { this.audioGraph.filterNode.disconnect(); } catch (e) {}

    // Build chain by insertion point
    let currentOutput = null;

    // Post-oscillator modules (between oscillator and filter)
    const postOscModules = this.getModulesByInsertionPoint('post-oscillator');
    if (postOscModules.length > 0) {
      currentOutput = this.chainModules(postOscModules);
    }

    // Connect to filter
    if (this.audioGraph.filterNode) {
      if (currentOutput) {
        currentOutput.connect(this.audioGraph.filterNode);
      }
      currentOutput = this.audioGraph.filterNode;
    }

    // Post-filter modules
    const postFilterModules = this.getModulesByInsertionPoint('post-filter');
    if (postFilterModules.length > 0) {
      if (currentOutput) {
        try {
          currentOutput.connect(postFilterModules[0].audioNodes.input);
        } catch (e) {
          console.error('[ModuleLoader] Connection failed:', e);
        }
      }
      currentOutput = this.chainModules(postFilterModules);
    }

    // Pre-master modules
    const preMasterModules = this.getModulesByInsertionPoint('pre-master');
    if (preMasterModules.length > 0) {
      if (currentOutput) {
        currentOutput.connect(preMasterModules[0].audioNodes.input);
      }
      currentOutput = this.chainModules(preMasterModules);
    }

    // Final connection to master
    if (currentOutput && currentOutput !== this.masterGain) {
      try {
        currentOutput.connect(this.masterGain);
      } catch (e) {
        console.error('[ModuleLoader] Failed to connect to master:', e);
      }
    } else if (currentOutput === this.audioGraph.filterNode) {
      try {
        this.audioGraph.filterNode.connect(this.masterGain);
      } catch (e) {
        console.error('[ModuleLoader] Failed to connect filter to master:', e);
      }
    }
  }

  /**
   * Chain modules in series
   */
  chainModules(modules) {
    for (let i = 0; i < modules.length - 1; i++) {
      modules[i].audioNodes.output.connect(modules[i + 1].audioNodes.input);
    }
    return modules[modules.length - 1].audioNodes.output;
  }

  /**
   * Get modules by insertion point
   */
  getModulesByInsertionPoint(point) {
    const result = [];
    this.modules.forEach((moduleInstance) => {
      if (moduleInstance.definition.audio.insertionPoint === point && !moduleInstance.bypassed) {
        result.push(moduleInstance);
      }
    });
    return result;
  }

  /**
   * Toggle module bypass state
   */
  toggleBypass(moduleId) {
    const moduleInstance = this.modules.get(moduleId);
    if (!moduleInstance) {
      console.warn(`[ModuleLoader] Module ${moduleId} not found`);
      return;
    }

    moduleInstance.bypassed = !moduleInstance.bypassed;

    if (moduleInstance.uiElements) {
      moduleInstance.uiElements.classList.toggle('bypassed', moduleInstance.bypassed);
    }

    // Trigger bypass animation
    if (window.SynthAnimations) {
      window.SynthAnimations.playModuleBypass(moduleInstance.uiElements, moduleInstance.bypassed);
    }

    console.log(`[ModuleLoader] Module ${moduleId} ${moduleInstance.bypassed ? 'bypassed' : 'active'}`);

    // Update audio graph (bypassed modules are skipped in routing)
    this.updateAudioGraph();
  }

  /**
   * Unload module
   */
  async unloadModule(moduleId) {
    const moduleInstance = this.modules.get(moduleId);
    if (!moduleInstance) {
      console.warn(`[ModuleLoader] Module ${moduleId} not found`);
      return;
    }

    console.log(`[ModuleLoader] Unloading module: ${moduleId}`);

    // Lifecycle: onUnload
    if (moduleInstance.definition.lifecycle?.onUnload) {
      moduleInstance.definition.lifecycle.onUnload(this.audioContext);
    }

    // Disconnect audio nodes
    try {
      moduleInstance.audioNodes.input.disconnect();
      moduleInstance.audioNodes.output.disconnect();
    } catch (e) {
      // Already disconnected
    }

    // Animate removal then remove UI
    if (moduleInstance.uiElements) {
      if (window.SynthAnimations) {
        window.SynthAnimations.playModuleDelete(moduleInstance.uiElements, () => {
          moduleInstance.uiElements.remove();
        });
      } else {
        moduleInstance.uiElements.remove();
      }
    }

    // Remove from map
    this.modules.delete(moduleId);

    // Update graph
    this.updateAudioGraph();

    console.log(`[ModuleLoader] ✓ Module ${moduleId} unloaded`);

    // Update localStorage
    this.saveToLocalStorage();

    // Update module browser UI if available
    if (window.updateModuleBrowser) {
      window.updateModuleBrowser();
    }
  }

  /**
   * List loaded modules
   */
  listModules() {
    const list = [];
    this.modules.forEach((instance, id) => {
      list.push({
        id,
        name: instance.definition.name,
        version: instance.definition.version,
        insertionPoint: instance.definition.audio.insertionPoint
      });
    });
    return list;
  }

  /**
   * Get reference to filter node for oscillator routing
   */
  setFilterNode(filterNode) {
    this.audioGraph.filterNode = filterNode;
  }

  /**
   * Get first connection point for oscillators
   * (either first post-oscillator module or filter)
   */
  getOscillatorTarget() {
    const postOscModules = this.getModulesByInsertionPoint('post-oscillator');
    if (postOscModules.length > 0) {
      return postOscModules[0].audioNodes.input;
    }
    return this.audioGraph.filterNode || this.masterGain;
  }

  /**
   * Save loaded modules to localStorage
   */
  saveToLocalStorage() {
    const moduleList = [];
    this.modules.forEach((instance) => {
      moduleList.push(instance.url);
    });
    localStorage.setItem('synth_loaded_modules', JSON.stringify(moduleList));
    console.log('[ModuleLoader] Saved to localStorage:', moduleList);
  }

  /**
   * Load modules from localStorage
   */
  async loadFromLocalStorage() {
    const saved = localStorage.getItem('synth_loaded_modules');
    if (!saved) return;

    try {
      const moduleUrls = JSON.parse(saved);
      console.log('[ModuleLoader] Loading from localStorage:', moduleUrls);

      for (const url of moduleUrls) {
        try {
          await this.loadModule(url);
        } catch (error) {
          console.warn(`[ModuleLoader] Failed to restore module ${url}:`, error);
        }
      }

      // Update module browser after all modules loaded
      if (window.updateModuleBrowser) {
        window.updateModuleBrowser();
      }
    } catch (error) {
      console.error('[ModuleLoader] Failed to parse localStorage:', error);
    }
  }

  /**
   * Save current setup as a preset
   */
  savePreset(name) {
    if (!name || name.trim() === '') {
      throw new Error('Preset name cannot be empty');
    }

    // Gather all module data
    const modulesData = [];
    this.modules.forEach((instance) => {
      const savedState = instance.definition.state?.save ?
        instance.definition.state.save(instance.params) :
        instance.params;

      modulesData.push({
        id: instance.definition.id,
        url: instance.url,
        state: savedState || {},
        bypassed: instance.bypassed
      });
    });

    // Gather synth parameters
    const synthParams = window.SynthCore.synth ? {
      waveform: window.SynthCore.synth.params.waveform,
      detune: window.SynthCore.synth.params.detune,
      attack: window.SynthCore.synth.params.attack,
      release: window.SynthCore.synth.params.release,
      volume: window.SynthCore.synth.params.volume,
      filterCutoff: window.SynthCore.synth.params.filterCutoff,
      filterResonance: window.SynthCore.synth.params.filterResonance
    } : {};

    const preset = {
      name: name.trim(),
      timestamp: Date.now(),
      modules: modulesData,
      synth: synthParams
    };

    // Save to localStorage
    const presets = this.listPresets();
    presets[name] = preset;
    localStorage.setItem('synth_presets', JSON.stringify(presets));

    console.log('[ModuleLoader] Preset saved:', name);
    return preset;
  }

  /**
   * Load a preset
   */
  async loadPreset(presetData) {
    console.log('[ModuleLoader] Loading preset:', presetData.name);

    // Clear all current modules
    const currentModuleIds = Array.from(this.modules.keys());
    for (const id of currentModuleIds) {
      await this.unloadModule(id);
    }

    // Load modules in order
    for (const moduleData of presetData.modules) {
      try {
        await this.loadModule(moduleData.url);

        // Apply saved state
        const instance = this.modules.get(moduleData.id);
        if (instance && instance.definition && moduleData.state) {
          if (instance.definition.state?.load) {
            instance.definition.state.load(instance.params, moduleData.state, instance.audioNodes);
            // Rebind UI if needed
            if (instance.definition.ui.bindEvents) {
              instance.definition.ui.bindEvents(instance.audioNodes, instance.params);
            }
          } else {
            instance.params = { ...moduleData.state };
          }

          // Apply bypass state
          if (moduleData.bypassed) {
            this.toggleBypass(moduleData.id);
          }
        }
      } catch (error) {
        console.warn(`[ModuleLoader] Failed to load module ${moduleData.id}:`, error);
      }
    }

    // Apply synth parameters
    if (presetData.synth && window.SynthCore.synth) {
      const synth = window.SynthCore.synth;
      synth.params.waveform = presetData.synth.waveform;
      synth.params.detune = presetData.synth.detune;
      synth.params.attack = presetData.synth.attack;
      synth.params.release = presetData.synth.release;
      synth.params.volume = presetData.synth.volume;
      synth.params.filterCutoff = presetData.synth.filterCutoff;
      synth.params.filterResonance = presetData.synth.filterResonance;

      // Update UI controls
      if (typeof window.updateSynthUI === 'function') {
        window.updateSynthUI();
      }
    }

    console.log('[ModuleLoader] Preset loaded:', presetData.name);
  }

  /**
   * Delete a preset
   */
  deletePreset(name) {
    const presets = this.listPresets();
    delete presets[name];
    localStorage.setItem('synth_presets', JSON.stringify(presets));
    console.log('[ModuleLoader] Preset deleted:', name);
  }

  /**
   * List all presets
   */
  listPresets() {
    const saved = localStorage.getItem('synth_presets');
    if (!saved) return {};

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('[ModuleLoader] Failed to parse presets:', error);
      return {};
    }
  }
}

// === SYNTHESIZER STATE ===
class SynthesizerCore {
  constructor() {
    // Audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.audioContext.destination);

    // Filter node (built-in)
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 5000;
    this.filterNode.Q.value = 0;
    this.filterNode.connect(this.masterGain);

    // Analyser for visualizer
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.masterGain.connect(this.analyser);

    // Module loader
    this.moduleLoader = new ModuleLoader(this.audioContext, this.masterGain);
    this.moduleLoader.setFilterNode(this.filterNode);

    // Active notes
    this.activeNotes = new Map();

    // Synth parameters
    this.params = {
      waveform: 'sine',
      detune: 0,
      attack: 0.1,
      release: 0.3,
      volume: 0.5,
      filterCutoff: 5000,
      filterResonance: 0
    };

    // Note frequencies
    this.noteFrequencies = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25
    };

    // Keyboard mapping
    this.keyMap = {
      // Lower octave (C3-C4)
      'z': 'C3', 's': 'C#3', 'x': 'D3', 'd': 'D#3', 'c': 'E3',
      'v': 'F3', 'g': 'F#3', 'b': 'G3', 'h': 'G#3', 'n': 'A3',
      'j': 'A#3', 'm': 'B3',
      // Middle octave (C4-C5)
      'q': 'C4', '2': 'C#4', 'w': 'D4', '3': 'D#4', 'e': 'E4',
      'r': 'F4', '5': 'F#4', 't': 'G4', '6': 'G#4', 'y': 'A4',
      '7': 'A#4', 'u': 'B4', 'i': 'C5'
    };
  }

  /**
   * Play note
   */
  playNote(frequency, noteId) {
    if (this.activeNotes.has(noteId)) return;

    // Validate frequency to prevent non-finite errors
    if (!isFinite(frequency) || frequency === null || frequency === undefined || isNaN(frequency)) {
      console.error(`[SynthCore] Invalid frequency: ${frequency}, noteId: ${noteId}`);
      return;
    }

    // Clamp to valid range
    frequency = Math.max(20, Math.min(20000, frequency));

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = this.params.waveform;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = this.params.detune || 0;

    oscillator.connect(gainNode);

    // Route through modules or directly to filter
    const target = this.moduleLoader.getOscillatorTarget();
    gainNode.connect(target);

    // Envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.params.volume, now + this.params.attack);

    oscillator.start(now);

    this.activeNotes.set(noteId, { oscillator, gainNode });
  }

  /**
   * Stop note
   */
  stopNote(noteId) {
    const note = this.activeNotes.get(noteId);
    if (!note) return;

    const now = this.audioContext.currentTime;
    note.gainNode.gain.cancelScheduledValues(now);
    note.gainNode.gain.setValueAtTime(note.gainNode.gain.value, now);
    note.gainNode.gain.linearRampToValueAtTime(0, now + this.params.release);

    note.oscillator.stop(now + this.params.release);
    this.activeNotes.delete(noteId);
  }

  /**
   * Update filter parameters
   */
  updateFilter(cutoff, resonance) {
    this.params.filterCutoff = cutoff;
    this.params.filterResonance = resonance;
    this.filterNode.frequency.value = cutoff;
    this.filterNode.Q.value = resonance;
  }

  /**
   * Update volume
   */
  updateVolume(volume) {
    this.params.volume = volume;
    this.masterGain.gain.value = volume;
  }
}

// === EXPORT GLOBAL API ===
window.SynthCore = {
  instance: null,

  init() {
    if (!this.instance) {
      this.instance = new SynthesizerCore();
      console.log('🎹 SynthCore initialized');
    }
    return this.instance;
  },

  get loader() {
    return this.instance?.moduleLoader;
  },

  get audioContext() {
    return this.instance?.audioContext;
  },

  get synth() {
    return this.instance;
  }
};

console.log('✓ synthesizer-core.js loaded');
