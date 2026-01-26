# AI-First Drum Machine - Professional Prototype

## Design Philosophy

**Core Principle**: AI-first means the generative capabilities aren't a feature tacked on - they're the primary workflow. Traditional "load sample + sequence" is secondary.

**Target User**: Electronic music producers who want instant drum sounds without sample library management.

**Key Insight**: The best drum machines let you think musically, not technically. AI should accelerate that flow.

---

## Primary Workflow (AI-First)

### 1. Describe → Generate → Sequence
```
User Input: "punchy trap kick"
    ↓
AI generates 3 variants in ~5 seconds
    ↓
User morphs between variants in real-time
    ↓
Click step to add to pattern
    ↓
Pattern plays immediately
```

**Design Decision**: Zero friction from idea to sound. No file browsing, no downloads, no "save to library".

---

## Three-Panel Layout

```
┌────────────────────────────────────────────────┐
│ PANEL 1: GENERATION (Left - 30%)              │
│                                                │
│  [Text Input: "describe sound..."]            │
│  [Generate Button]                             │
│                                                │
│  Quick Presets:                                │
│  [808] [Trap] [House] [DnB] [Techno]          │
│                                                │
│  ┌──────────────┐ ┌──────────────┐             │
│  │  Variant 1   │ │  Variant 2   │             │
│  │  [Play] [+]  │ │  [Play] [+]  │             │
│  └──────────────┘ └──────────────┘             │
│  ┌──────────────┐                              │
│  │  Variant 3   │  XY Morph Pad (250×250)      │
│  │  [Play] [+]  │  ┌────────────┐              │
│  └──────────────┘  │     1      │              │
│                    │  2     3   │              │
│                    └────────────┘              │
│                                                │
│  Generated Sounds (History):                   │
│  • Kick 808 (3 variants)                       │
│  • Snare Trap (3 variants)                     │
│  • Hi-Hat Closed (3 variants)                  │
│                                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ PANEL 2: SEQUENCER (Center - 50%)             │
│                                                │
│  Transport: [▶] [■] [◀◀] BPM: [120]           │
│                                                │
│  Track 1: Kick      [━━━━━━━━━━━━━━━━]        │
│   [●][◌][◌][◌][●][◌][◌][◌][●][◌][◌][◌]...     │
│   [MUTE] [SOLO] Vol: [▓▓▓░░] Pan: [═══]       │
│                                                │
│  Track 2: Snare     [━━━━━━━━━━━━━━━━]        │
│   [◌][◌][◌][◌][●][◌][◌][◌][◌][◌][◌][◌]...     │
│   [MUTE] [SOLO] Vol: [▓▓▓░░] Pan: [═══]       │
│                                                │
│  Track 3: Hi-Hat    [━━━━━━━━━━━━━━━━]        │
│   [●][●][●][●][●][●][●][●][●][●][●][●]...     │
│   [MUTE] [SOLO] Vol: [▓▓▓░░] Pan: [═══]       │
│                                                │
│  Track 4: Clap      [━━━━━━━━━━━━━━━━]        │
│   [◌][◌][◌][◌][●][◌][◌][◌][◌][◌][◌][◌]...     │
│   [MUTE] [SOLO] Vol: [▓▓▓░░] Pan: [═══]       │
│                                                │
│  Patterns: [A] [B] [C] [D] [+New]              │
│                                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ PANEL 3: VISUALIZATION (Right - 20%)          │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │                                      │     │
│  │       OSCILLOSCOPE                   │     │
│  │       (Waveform)                     │     │
│  │                                      │     │
│  │  ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂▁             │     │
│  │                                      │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  Master: [▓▓▓▓▓▓▓░░░] 80%                     │
│                                                │
│  FX: [Reverb ▼] [Off/On]                      │
│      [Delay   ▼] [Off/On]                      │
│      [Filter  ▼] [Off/On]                      │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Feature Breakdown

### Panel 1: AI Generation

#### Input Methods
1. **Text Description**
   - Free-form: "punchy 808 kick with sub bass"
   - Structured: "[Style] [Instrument] [Character]"
   - Examples shown below input

2. **Quick Presets** (One-click full kits)
   - 808: Classic Roland TR-808 sounds
   - Trap: Modern trap production
   - House: Four-on-the-floor house
   - DnB: Fast-paced drum & bass
   - Techno: Minimal techno kicks
   - Lo-Fi: Degraded, vintage character
   - Acoustic: Natural drum sounds
   - Industrial: Metallic, harsh textures

3. **Generation Options**
   - Variants: 1-5 (default 3)
   - Duration: 0.5-3s (default 1.5s)
   - Character slider: Clean → Gritty
   - Pitch range: ±12 semitones

#### Variant Display
```
┌──────────────────────┐
│  Variant 1           │
│  ▓▓▓▓▓░░░ waveform   │
│  [▶ Play]  [+ Add]   │
│  Duration: 1.2s      │
└──────────────────────┘
```

- Mini waveform visualization
- Play button (instant audition)
- Add to track (drag or click)
- Duration display
- Variant number badge

#### XY Morph Pad
- **Size**: 250×250px (compact but usable)
- **Layout**: Triangle with 3 variants at corners
- **Interaction**:
  - Click/drag to blend variants
  - Auto-play on release
  - Visual feedback of current blend
  - Lock button to stay at position
- **Use Case**: Fine-tune between AI variants

#### Generated Sound History
```
• Kick 808 (3 variants) - 2 min ago
• Snare Trap (3 variants) - 5 min ago
• Hi-Hat Closed (3 variants) - 8 min ago
```

- Scrollable list of recent generations
- Click to reload variants
- Delete button
- Star to favorite
- Auto-save to local storage

---

### Panel 2: Sequencer

#### Transport Controls
```
[▶ Play] [■ Stop] [◀◀ Reset] [BPM: 120 ▼] [Length: 16 ▼]
```

- Play/Pause toggle
- Stop (reset to step 0)
- BPM selector: 60-200 in increments of 5
- Pattern length: 8, 16, 32 steps
- Swing amount: 0-75%

#### Track Display (Per Track)
```
Track 1: Kick 808 v2     [Sample Selector ▼]
┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
│●│◌│◌│◌│●│◌│◌│◌│●│◌│◌│◌│●│◌│◌│◌│  ← Steps (◌=off, ●=on)
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
[Current step indicator moves across during playback]

Controls:
[M] Mute    [S] Solo    Vol: [───█──] 70%    Pan: [──█──] C
```

**Key Features**:
- Sample selector dropdown (shows all generated sounds)
- Steps clickable to toggle
- Right-click for velocity/probability
- Shift+click for rapid fill
- Color-coded by track
- Track name editable (double-click)

#### Advanced Step Features
- **Velocity**: Per-step volume (0-127)
- **Probability**: % chance to trigger (0-100%)
- **Ratcheting**: Subdivide step (2x, 3x, 4x)
- **Pitch**: Per-step pitch offset (±12 semitones)

**UI**: Right-click step opens mini editor:
```
┌─────────────────────┐
│ Step 5              │
│ Velocity: [▓▓▓░] 75%│
│ Probability: [▓] 50%│
│ Ratchet: [2x ▼]     │
│ Pitch: [+0 ▼]       │
└─────────────────────┘
```

#### Pattern Management
```
Patterns: [A*] [B] [C] [D] [+New] [Copy] [Clear]
```

- A-H patterns (8 slots)
- Active pattern highlighted (green star)
- Switch patterns instantly
- Copy pattern to new slot
- Clear pattern
- Pattern chaining: A→B→C→A (loop)

---

### Panel 3: Visualization & FX

#### Oscilloscope
- **Size**: Full width of panel, ~300px tall
- **Modes**:
  - Waveform (default)
  - Spectrum analyzer
  - Stereo (L/R channels)
  - Lissajous (XY correlation)
- **Interaction**:
  - Click to switch modes
  - Pinch to zoom
  - Drag to freeze/scroll

#### Master Controls
```
Master Volume:  [▓▓▓▓▓▓▓░░░] 80%
Output Limiter: [On ▼]
```

#### FX Chain
```
┌─────────────────────────────┐
│ FX 1: Reverb         [On ▼] │
│   Room Size: [▓▓░░] 40%     │
│   Mix:       [▓░░░] 20%     │
└─────────────────────────────┘

┌─────────────────────────────┐
│ FX 2: Delay          [Off▼] │
│   Time: [1/4 ▼]             │
│   Feedback: [▓▓░░] 40%      │
│   Mix:      [▓░░░] 30%      │
└─────────────────────────────┘

┌─────────────────────────────┐
│ FX 3: Filter         [Off▼] │
│   Type: [LP ▼]              │
│   Freq: [▓▓▓░] 800Hz        │
│   Res:  [▓▓░░] 40%          │
└─────────────────────────────┘
```

**Per-FX Controls**:
- On/Off toggle
- Preset selector
- 2-3 key parameters
- Expand button for full controls

---

## Key Musician-Focused Features

### 1. Instant Workflow
**Problem**: Traditional drum machines require sample loading, browsing libraries, managing files.

**Solution**:
- Zero-config: type → generate → play
- No file management
- No "save to" dialogs
- Everything auto-persists to browser storage

### 2. Morphing as Creative Tool
**Problem**: AI generates variants, but switching between them is binary.

**Solution**:
- XY pad blends 3 variants in real-time
- Use pad as performance control (record automation)
- "Lock" button to stay at sweet spot
- Visual feedback of blend weights

### 3. Pattern-First Sequencing
**Problem**: Step sequencers often feel like data entry, not music-making.

**Solution**:
- Click anywhere to toggle step (no mode switching)
- Shift+drag for rapid fills
- Right-click for micro-editing
- Patterns switch instantly (no "loading")
- Visual playback cursor (always know where you are)

### 4. Sound Management
**Problem**: Generated sounds pile up without organization.

**Solution**:
- History panel shows chronological list
- Star to favorite
- One-click to re-generate with variations
- Auto-cleanup after 50 sounds
- Export selected sounds as WAV pack

### 5. Professional Transport
**Problem**: Many web tools lack proper timing/sync.

**Solution**:
- Accurate BPM (uses Web Audio clock, not setTimeout)
- Swing control (humanize timing)
- Pattern chaining (A→B→C automation)
- MIDI clock out (future: sync with DAW)

---

## AI-Specific Features

### 1. Iterative Refinement
```
User: "punchy kick"
   ↓ Generate 3 variants
[v1: too soft] [v2: perfect!] [v3: too clicky]
   ↓ User clicks "More like v2"
   ↓ Generate 3 new variants based on v2
[v2a] [v2b] [v2c] ← All variations of v2
```

**Implementation**:
- "More like this" button on each variant
- Sends variant audio + original prompt back to AI
- AI generates variations of that specific sound

### 2. Smart Kit Generation
```
User: "trap kit"
   ↓ AI generates complete kit:
   - Kick (3 variants)
   - Snare (3 variants)
   - Hi-Hat Closed (3 variants)
   - Hi-Hat Open (3 variants)
   - Clap (3 variants)
   ↓ All sounds auto-assigned to tracks
   ↓ Basic pattern pre-programmed
```

**Implementation**:
- One-click kit generation
- Auto-populate 8 tracks
- Load starter pattern (optional)
- Cohesive sound (AI uses style consistency)

### 3. Describe-by-Reference
```
User: "like Arca's kick drums" or "808 but more digital"
   ↓ AI understands references:
   - Artist names → style inference
   - Equipment names → timbre matching
   - Adjectives → sonic characteristics
```

**Implementation**:
- LLM preprocesses prompt to extract references
- Generates ElevenLabs prompt with expanded context
- Example: "Arca" → "glitchy, deconstructed, harsh transients"

### 4. Batch Generation
```
User: "Generate 10 variations of this kick"
   ↓ AI generates 10 variants in parallel
   ↓ Grid view shows all 10
   ↓ User auditions and picks favorites
```

**Implementation**:
- Slider: "Generate 1-10 variants"
- Parallel API calls for speed
- Grid layout for comparison
- Batch add to tracks

---

## Technical Implementation Notes

### Audio Engine
```javascript
// Audio graph structure
AudioContext
  ├─ Track 1 Chain
  │    ├─ BufferSource (sample playback)
  │    ├─ GainNode (volume)
  │    ├─ StereoPannerNode (pan)
  │    └─ → Track Mix
  │
  ├─ Track 2-8 (same structure)
  │
  ├─ Master Chain
  │    ├─ All tracks → MasterGain
  │    ├─ FX Chain (Reverb, Delay, Filter)
  │    ├─ AnalyserNode (for oscilloscope)
  │    └─ → Destination
```

### Timing System
```javascript
// Use Web Audio scheduling, not setTimeout
class Sequencer {
  schedule() {
    const lookahead = 0.1; // 100ms
    const scheduleAhead = 0.2; // 200ms

    while (nextStepTime < audioContext.currentTime + scheduleAhead) {
      scheduleStep(currentStep, nextStepTime);
      nextStep();
    }

    setTimeout(() => this.schedule(), lookahead * 1000);
  }

  scheduleStep(step, time) {
    tracks.forEach(track => {
      if (track.steps[step]) {
        playSample(track.sample, time);
      }
    });
  }
}
```

### State Management
```javascript
const state = {
  // Generation
  generatedSounds: [],
  currentPrompt: '',
  generationHistory: [],

  // Sequencer
  patterns: [
    { id: 'A', name: 'Pattern A', tracks: [...] },
    { id: 'B', name: 'Pattern B', tracks: [...] }
  ],
  currentPattern: 0,
  bpm: 120,
  isPlaying: false,
  currentStep: 0,

  // Tracks
  tracks: [
    {
      id: 1,
      name: 'Kick',
      sample: null,
      steps: [1,0,0,0, 1,0,0,0, ...],
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false
    }
  ],

  // FX
  fx: [
    { type: 'reverb', enabled: true, params: {...} },
    { type: 'delay', enabled: false, params: {...} }
  ]
};
```

### Storage Strategy
```javascript
// IndexedDB for large audio data
db.sounds.add({
  id: 'kick-808-v1',
  prompt: 'punchy 808 kick',
  variant: 1,
  audioBuffer: ArrayBuffer,
  duration: 1.2,
  timestamp: Date.now()
});

// localStorage for patterns
localStorage.setItem('drum-patterns', JSON.stringify(state.patterns));

// Auto-save every 5 seconds
setInterval(saveState, 5000);
```

---

## UI/UX Principles

### 1. Zero Latency Feel
- Optimistic UI updates
- Instant visual feedback
- Background generation (show spinner)
- Cache decoded audio buffers

### 2. Keyboard Shortcuts
```
Space       - Play/Pause
Enter       - Generate sound
1-8         - Switch tracks
M           - Mute selected track
S           - Solo selected track
Cmd+Z       - Undo
Cmd+C/V     - Copy/Paste pattern
Delete      - Clear selected step
Arrow Keys  - Navigate steps
```

### 3. Visual Hierarchy
- **Primary**: Sequencer (center, largest)
- **Secondary**: Generation (left, always visible)
- **Tertiary**: Visualization (right, collapsible)
- **Colors**: Minimal (green accents, black/gray base)

### 4. Progressive Disclosure
- Basic controls visible by default
- Advanced features (velocity, probability) in right-click menu
- FX expanded on demand
- Help tooltips on hover

---

## Mobile/Responsive Considerations

### Tablet (768-1024px)
- Stack panels vertically: Generation → Sequencer → Viz
- Smaller step grid (scrollable horizontally)
- Touch-optimized step buttons (larger)
- Morph pad remains full-size

### Phone (< 768px)
- Tab-based navigation: [Generate] [Sequence] [Mix]
- Simplified sequencer (4 tracks visible, scroll for more)
- Morph pad 200×200px
- No oscilloscope (space constraint)

---

## API Design

### Generation Endpoint
```javascript
POST /api/generate-sound

Request:
{
  "prompt": "punchy trap kick",
  "variants": 3,
  "duration": 1.5,
  "character": "gritty", // clean, natural, gritty, digital
  "temperature": 0.7 // creativity vs. consistency
}

Response:
{
  "sounds": [
    {
      "id": "kick-trap-v1",
      "variant": 1,
      "audioData": "base64...",
      "duration": 1.42,
      "sampleRate": 48000
    },
    ...
  ]
}
```

### Kit Generation Endpoint
```javascript
POST /api/generate-kit

Request:
{
  "style": "trap",
  "sounds": ["kick", "snare", "hihat-closed", "hihat-open", "clap"],
  "variants": 3
}

Response:
{
  "kit": {
    "kick": [ {variant 1}, {variant 2}, {variant 3} ],
    "snare": [ ... ],
    "hihat-closed": [ ... ]
  }
}
```

---

## Success Metrics

### User Experience
- Time from prompt to playing pattern: < 60 seconds
- Generation success rate: > 90% usable
- Pattern creation time: < 2 minutes

### Technical
- Audio latency: < 10ms
- Step timing accuracy: < ±5ms
- Generation time: < 10 seconds for 3 variants
- UI responsiveness: 60 FPS

### Musician Feedback
- "Feels like a real drum machine"
- "AI sounds are actually usable in tracks"
- "Faster than browsing sample packs"

---

## Roadmap

### V1 (MVP)
- Text-based generation (3 variants)
- 4-track, 16-step sequencer
- Basic transport (play, stop, BPM)
- Morph pad
- Master volume + oscilloscope

### V2 (Professional)
- 8 tracks, 32 steps
- Per-step velocity + probability
- Pattern chaining (A→B→C)
- FX chain (reverb, delay, filter)
- Kit presets (808, Trap, House)
- Sound history panel

### V3 (Advanced)
- "More like this" iterative generation
- Batch generation (10 variants)
- MIDI export
- Audio export (mix down, stems)
- Preset save/load
- Cloud sync

### V4 (Future)
- Real-time morphing (modulate XY pad with LFO)
- Generative patterns (AI writes drum patterns)
- MIDI controller mapping
- DAW integration (Ableton Link)
- Collaborative sessions (multiplayer)

---

## Open Questions

1. **Morphing Algorithm**: Simultaneous playback (current) vs. true buffer blending?
2. **Generation Speed**: Trade-off between quality and latency?
3. **History Management**: How many sounds to keep before cleanup?
4. **Preset Sharing**: Community presets? Public gallery?
5. **Pricing Model**: Free tier limits? Pro subscription?

---

## Next Steps

1. **User Testing**: Show prototype to 5 electronic musicians
2. **AI Provider Evaluation**: ElevenLabs vs. AudioLDM vs. Stable Audio
3. **Performance Benchmarking**: Test with 100+ generated sounds
4. **UI Mockups**: High-fidelity designs in Figma
5. **Technical Spike**: Implement morphing algorithms

---

**Document Status**: Prototype Design
**Date**: 2026-01-26
**Author**: Claude + User
**Next Review**: After user feedback
