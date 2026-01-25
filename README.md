# Modular Web Synthesizer

A terminal-aesthetic modular synthesizer built with Web Audio API and Claude Agent SDK. Features dynamic module generation, MIDI processing chains, and experimental sequencers including Euclidean rhythms and binary spiral patterns.

## Features

### 🎹 Core Synthesizer
- **Web Audio API** synthesis with multiple waveforms
- **ADSR envelope** control
- **Low-pass filter** with cutoff and resonance
- **Visual keyboard** interface
- **Waveform visualizer**

### 🎚️ Audio Effects Modules
- **Delay** - Echo/repeat with feedback control
- **Reverb** - Convolution reverb for spatial depth
- **Chorus** - Triple LFO chorus for thickness
- **Distortion** - Waveshaping with drive control
- **Ring Modulator** - Metallic/robotic timbres
- **Pitch Shifter** - Harmonization and pitch shifting
- **Granular Synth** - Break audio into grains
- **Haas Effect** - Stereo width via psychoacoustic delay
- **Bitcrusher** - Lo-fi degradation
- **High-Pass Filter** - Remove low frequencies
- **LFO Modulator** - Auto-wah filter sweep

### 🎛️ MIDI Processing Chain
- **MIDI Visualizer** - Real-time MIDI event display
- **Step Sequencer** - 16-step programmable sequencer
- **Euclidean Rhythm** - Mathematically perfect rhythm patterns
- **Binary Spiral Sequencer** - Circular polyrhythmic patterns with fractal structure
- **Transpose** - Semitone shifting (-12 to +12)
- **Velocity Curve** - Dynamic response shaping
- **Chord Generator** - Harmonize notes with intervals
- **Quantizer** - Snap notes to scales (Major, Minor, Pentatonic, etc.)
- **MIDI Delay** - Time-based note repetition

### 🤖 AI-Powered Module Generation
- **Claude Agent SDK integration** for dynamic module creation
- Chat interface to generate new effects on demand
- Suggestion system for creative module ideas

### 💾 Preset System
- Save/load entire synthesizer setups
- Persistent localStorage storage
- Export/import capability

## Installation

```bash
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

Server runs at: http://localhost:5555

## Architecture

### Module System

**Audio Modules** (`modules/`)
```javascript
export default {
  id: "effect-name",
  name: "Effect Name",
  version: "1.0.0",
  audio: {
    createNodes: (ctx) => ({ input, output, nodes }),
    insertionPoint: "post-filter",
    routing: "series"
  },
  ui: {
    container: "custom-controls",
    template: `...`,
    bindEvents: (audioNodes, params) => { ... }
  },
  state: {
    defaults: { ... },
    save: (params) => { ... },
    load: (params, saved, audioNodes) => { ... }
  }
}
```

**MIDI Modules** (`midi-modules/`)
```javascript
export default {
  id: "midi-name",
  name: "MIDI Module",
  version: "1.0.0",
  process: (event, params) => { ... },
  ui: { ... },
  state: { defaults: { ... } }
}
```

### Signal Flow

```
Keyboard Input
  ↓
MIDI Chain (Visualizer → Sequencer → Transpose → Velocity → Chord → Quantizer → Delay → Euclidean → Binary Spiral)
  ↓
Synthesizer (Oscillator → Envelope → Filter)
  ↓
Audio Effects Chain (sorted by insertionPoint)
  ↓
Master Output
```

## Experimental Sequencers

### Euclidean Rhythm Sequencer
Distributes N pulses across M steps as evenly as possible using the Euclidean algorithm. Classic patterns:
- `(5, 8)` - Cuban Son/Fume
- `(3, 8)` - Tresillo
- `(5, 16)` - Bossa Nova clave

### Binary Spiral Sequencer
Concentric rings with power-of-2 step counts (1, 2, 4, 8, 16, 32, 64, 128 beats). Playhead spirals outward creating fractal polyrhythmic patterns. Features interactive canvas visualization with click-to-toggle steps.

## Bypass & Control

All modules include:
- **Bypass button** - Enable/disable module without removing
- **Delete button** - Remove module from chain
- Hover over module to reveal controls

## Console Helpers

```javascript
// Load MIDI modules on-demand
await loadMIDIModule("./midi-modules/midi-euclidean.js")
await loadMIDIModule("./midi-modules/midi-binary-spiral.js")
```

## Tech Stack

- **Web Audio API** - Audio synthesis and processing
- **TypeScript** - Server-side logic
- **Express** - HTTP server
- **Claude Agent SDK** - AI-powered module generation
- **Vanilla JavaScript** - Frontend (no framework dependencies)

## Terminal Aesthetic

- Colors: `#00ff00` (terminal green) on `#0a0a0a` (black)
- Monospace font: JetBrains Mono
- Hardware-inspired UI design
- Consistent dark theme throughout

## Browser Support

Requires modern browser with:
- Web Audio API support
- ES6 modules
- Web MIDI API (optional, for MIDI controller input)

## License

MIT

## Credits

Built with Claude Code and the Claude Agent SDK.
