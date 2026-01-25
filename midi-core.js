// === MIDI CORE ENGINE ===
// MIDI processing system with effect chain routing

class MIDICore {
  constructor(synth) {
    this.synth = synth;
    this.modules = new Map();
    this.chain = []; // Ordered chain of MIDI processors
    this.midiAccess = null;
    this.activeNotes = new Set();
    this.recording = false;
    this.recordedEvents = [];
    this.looping = false;
    this.loopStartTime = 0;

    // Initialize Web MIDI API
    this.initMIDI();
  }

  /**
   * Initialize Web MIDI API
   */
  async initMIDI() {
    if (navigator.requestMIDIAccess) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess();
        console.log('[MIDI] Web MIDI API initialized');
        this.setupMIDIInputs();
      } catch (error) {
        console.warn('[MIDI] Web MIDI API not available:', error);
      }
    } else {
      console.warn('[MIDI] Web MIDI API not supported in this browser');
    }
  }

  /**
   * Setup MIDI input listeners
   */
  setupMIDIInputs() {
    if (!this.midiAccess) return;

    for (const input of this.midiAccess.inputs.values()) {
      input.onmidimessage = (msg) => this.handleMIDIMessage(msg);
      console.log('[MIDI] Connected to input:', input.name);
    }
  }

  /**
   * Handle incoming MIDI messages
   */
  handleMIDIMessage(message) {
    const [status, note, velocity] = message.data;
    const command = status & 0xf0;

    const midiEvent = {
      type: command === 0x90 ? 'noteon' : command === 0x80 ? 'noteoff' : 'other',
      note,
      velocity,
      timestamp: performance.now()
    };

    // Record MIDI if recording
    if (this.recording) {
      this.recordedEvents.push({
        ...midiEvent,
        relativeTime: midiEvent.timestamp - this.recordingStartTime
      });
    }

    // Process through MIDI chain
    this.processMIDIEvent(midiEvent);
  }

  /**
   * Process MIDI event through effect chain
   */
  processMIDIEvent(event) {
    let events = [event];

    // Pass through each MIDI module in chain
    for (const module of this.chain) {
      if (module.enabled) {
        const newEvents = [];
        for (const evt of events) {
          const processed = module.process(evt);
          if (Array.isArray(processed)) {
            newEvents.push(...processed);
          } else if (processed) {
            newEvents.push(processed);
          }
        }
        events = newEvents;
      }
    }

    // Trigger audio synthesis for each resulting event
    for (const evt of events) {
      // Validate note value before processing
      if (typeof evt.note !== 'number' || isNaN(evt.note)) {
        console.error('[MIDI] Event has invalid note:', evt);
        continue;
      }

      if (evt.type === 'noteon' && evt.velocity > 0) {
        const freq = this.midiNoteToFrequency(evt.note);
        this.synth.playNote(freq, `midi-${evt.note}`);
        this.activeNotes.add(evt.note);
      } else if (evt.type === 'noteoff' || (evt.type === 'noteon' && evt.velocity === 0)) {
        this.synth.stopNote(`midi-${evt.note}`);
        this.activeNotes.delete(evt.note);
      }
    }
  }

  /**
   * Convert MIDI note number to frequency
   */
  midiNoteToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  /**
   * Load MIDI module
   */
  loadModule(module) {
    if (!this.validateModule(module)) {
      throw new Error('Invalid MIDI module structure');
    }

    if (this.modules.has(module.id)) {
      console.warn(`[MIDI] Module ${module.id} already loaded, replacing...`);
      this.unloadModule(module.id);
    }

    // Create module instance with deep copy of defaults
    const defaultParams = module.state?.defaults || {};
    const params = {};

    // Deep copy defaults (handle Sets, Maps, Arrays, etc.)
    for (const [key, value] of Object.entries(defaultParams)) {
      if (value instanceof Set) {
        params[key] = new Set(value);
      } else if (value instanceof Map) {
        params[key] = new Map(value);
      } else if (Array.isArray(value)) {
        params[key] = [...value];
      } else if (typeof value === 'object' && value !== null) {
        params[key] = { ...value };
      } else {
        params[key] = value;
      }
    }

    const instance = {
      definition: module,
      enabled: true,
      params: params,
      process: (event) => module.process(event, instance.params)
    };

    this.modules.set(module.id, instance);
    this.chain.push(instance);

    // Inject UI
    this.injectUI(instance);

    console.log(`[MIDI] Module ${module.id} loaded`);

    return module.id;
  }

  /**
   * Validate MIDI module structure
   */
  validateModule(module) {
    const required = ['id', 'name', 'version', 'process', 'ui', 'state'];
    for (const field of required) {
      if (!module[field]) {
        console.error(`Module missing required field: ${field}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Inject module UI
   */
  injectUI(instance) {
    const { definition, params } = instance;
    const container = document.getElementById(definition.ui.container);

    if (!container) {
      console.warn(`[MIDI] Container #${definition.ui.container} not found`);
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.id = `midi-module-${definition.id}`;
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

    // Bind control events
    controls.querySelector('.bypass').addEventListener('click', () => {
      this.toggleBypass(definition.id);
    });

    controls.querySelector('.delete').addEventListener('click', () => {
      if (confirm(`Delete MIDI module "${definition.name}"?`)) {
        this.unloadModule(definition.id);
      }
    });

    // Bind events
    if (definition.ui.bindEvents) {
      definition.ui.bindEvents(instance, params);
    }

    instance.uiElement = wrapper;
  }

  /**
   * Unload MIDI module
   */
  unloadModule(moduleId) {
    const instance = this.modules.get(moduleId);
    if (!instance) return;

    // Remove from chain
    const idx = this.chain.indexOf(instance);
    if (idx !== -1) {
      this.chain.splice(idx, 1);
    }

    // Remove UI
    if (instance.uiElement) {
      instance.uiElement.remove();
    }

    this.modules.delete(moduleId);
    console.log(`[MIDI] Module ${moduleId} unloaded`);
  }

  /**
   * Toggle bypass state for a MIDI module
   */
  toggleBypass(moduleId) {
    const instance = this.modules.get(moduleId);
    if (!instance) {
      console.warn(`[MIDI] Module ${moduleId} not found`);
      return;
    }

    instance.enabled = !instance.enabled;

    if (instance.uiElement) {
      instance.uiElement.classList.toggle('bypassed', !instance.enabled);

      // Update bypass button text
      const bypassBtn = instance.uiElement.querySelector('.bypass');
      if (bypassBtn) {
        bypassBtn.textContent = instance.enabled ? 'Bypass' : 'Enable';
        bypassBtn.style.color = instance.enabled ? '' : '#00ff00';
      }
    }

    console.log(`[MIDI] Module ${moduleId} ${instance.enabled ? 'enabled' : 'bypassed'}`);
  }

  /**
   * Start recording MIDI
   */
  startRecording() {
    this.recording = true;
    this.recordedEvents = [];
    this.recordingStartTime = performance.now();
    console.log('[MIDI] Recording started');
  }

  /**
   * Stop recording and optionally start looping
   */
  stopRecording(startLoop = false) {
    this.recording = false;
    console.log(`[MIDI] Recording stopped, ${this.recordedEvents.length} events captured`);

    if (startLoop && this.recordedEvents.length > 0) {
      this.startLoop();
    }
  }

  /**
   * Start looping recorded MIDI
   */
  startLoop() {
    if (this.recordedEvents.length === 0) {
      console.warn('[MIDI] No recorded events to loop');
      return;
    }

    this.looping = true;
    this.loopStartTime = performance.now();
    this.playLoop();
    console.log('[MIDI] Looping started');
  }

  /**
   * Stop looping
   */
  stopLoop() {
    this.looping = false;
    // Stop all active notes
    for (const note of this.activeNotes) {
      this.synth.stopNote(`midi-${note}`);
    }
    this.activeNotes.clear();
    console.log('[MIDI] Looping stopped');
  }

  /**
   * Playback loop
   */
  playLoop() {
    if (!this.looping) return;

    const loopDuration = this.recordedEvents[this.recordedEvents.length - 1].relativeTime;
    const currentTime = performance.now() - this.loopStartTime;
    const loopPosition = currentTime % loopDuration;

    // Find events to play
    for (const evt of this.recordedEvents) {
      const eventTime = evt.relativeTime;
      const prevLoopPosition = loopPosition - 16; // Check last frame

      if (eventTime >= prevLoopPosition && eventTime < loopPosition) {
        this.processMIDIEvent({
          type: evt.type,
          note: evt.note,
          velocity: evt.velocity,
          timestamp: performance.now()
        });
      }
    }

    requestAnimationFrame(() => this.playLoop());
  }

  /**
   * Trigger manual MIDI event (from computer keyboard, sequencer, etc)
   */
  triggerNote(note, velocity = 100, duration = null) {
    // Validate note value
    if (typeof note !== 'number' || isNaN(note) || note < 0 || note > 127) {
      console.error('[MIDI] Invalid note value in triggerNote:', note, 'type:', typeof note);
      return;
    }

    const event = {
      type: 'noteon',
      note,
      velocity,
      timestamp: performance.now()
    };

    this.processMIDIEvent(event);

    if (duration) {
      setTimeout(() => {
        this.processMIDIEvent({
          type: 'noteoff',
          note,
          velocity: 0,
          timestamp: performance.now()
        });
      }, duration);
    }
  }

  /**
   * Release manually triggered note
   */
  releaseNote(note) {
    this.processMIDIEvent({
      type: 'noteoff',
      note,
      velocity: 0,
      timestamp: performance.now()
    });
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
        enabled: instance.enabled
      });
    });
    return list;
  }
}

// === EXPORT GLOBAL API ===
window.MIDICore = {
  instance: null,

  init(synth) {
    if (!this.instance) {
      this.instance = new MIDICore(synth);
      console.log('[MIDI] MIDICore initialized');
    }
    return this.instance;
  },

  get midi() {
    return this.instance;
  }
};

console.log('✓ midi-core.js loaded');
