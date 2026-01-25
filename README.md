# Modular Web Synthesizer

AI-powered modular synthesizer built with Web Audio API and Claude Agent SDK. Generate custom audio modules through natural language requests.

**🎹 [Live Demo](https://modular-web-synth-n4ury9rib-glebis-projects.vercel.app)**

**⚠️ Note**: AI module generation requires [Claude Code](https://claude.ai/code) subscription. Live demo provides pre-built modules only.

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

### 🤖 AI-Powered Module Generation (Requires Claude Code Subscription)
- **Claude Agent SDK integration** for dynamic module creation
- Natural language requests like "create a shimmer reverb"
- Modules generated and loaded instantly into audio chain
- Only works with local dev server (not available on Vercel deployment)

### 💾 Preset System
- Save/load entire synthesizer setups
- Persistent localStorage storage
- Export/import capability

## Quick Start

### Option 1: Try the Live Demo
Visit [modular-web-synth-n4ury9rib-glebis-projects.vercel.app](https://modular-web-synth-n4ury9rib-glebis-projects.vercel.app)

Pre-built modules only (no AI generation):
- All audio effects and MIDI modules included
- Preset system works
- No Claude Code subscription needed

### Option 2: Run Locally with AI Features

**Requirements**:
- Node.js 18+
- [Claude Code](https://claude.ai/code) subscription for AI module generation

**Installation**:
```bash
git clone https://github.com/yourusername/modular-web-synth.git
cd modular-web-synth
npm install
```

**Start Development Server**:
```bash
npm run dev
```

Open http://localhost:5555/synthesizer.html

**Build for Production**:
```bash
npm run build
npm start
```

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

## Using AI Module Generation

**Only available when running locally with Claude Code**:

1. Start dev server: `npm run dev`
2. Type a feature request in the chat interface:
   - "Add a tape delay with wow and flutter"
   - "Create a shimmer reverb"
   - "Make a synced LFO tremolo"
3. Click "Send Request"
4. Claude generates code and loads module automatically

Example requests:
- Effects: "phaser", "flanger", "auto-pan"
- Creative: "glitch effect", "lo-fi degradation"
- Modulation: "envelope follower", "sample & hold"

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

## Deployment

### Vercel/Netlify/Static Hosting
The synthesizer works perfectly on static hosts:
- ✅ All pre-built audio and MIDI modules
- ✅ Preset system (localStorage)
- ✅ Full synthesizer functionality
- ❌ AI module generation (requires local Claude Code)

### Enabling AI Features
AI module generation requires:
1. Claude Code subscription
2. Local development server (`npm run dev`)
3. Backend running at localhost:5555

This is a **local-only feature** by design - it cannot run on deployed static sites.

## License

MIT

## Credits

Built with Claude Code and the Claude Agent SDK.
