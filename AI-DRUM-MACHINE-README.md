# AI-First Generative Drum Machine

**Paradigm**: Describe sounds → Generate with AI → Morph with XY pad → Sequence

## 🎨 NEW DESIGN PHILOSOPHY

### Traditional Approach
❌ Upload samples → Organize → Program → Play

### AI-First Approach
✅ **Describe** → **Generate** → **Morph** → **Sequence**

---

## 🚀 SETUP

### 1. Get ElevenLabs API Key
```bash
# Sign up at https://elevenlabs.io
# Get API key from: https://elevenlabs.io/app/settings/api-keys
export ELEVENLABS_API_KEY="your_key_here"
```

### 2. Start Server
```bash
npm run dev
```

### 3. Open AI Drum Machine
```
http://localhost:5555/test-ai-drum.html
```

---

## 🎹 HOW TO USE

### STEP 1: Describe Sound
**Single Mode:**
```
"deep 808 kick with sub bass rumble"
"crisp trap snare with short decay"
"metallic hi-hat with bright shimmer"
```

**Kit Mode - Quick Generate:**
- Click preset: `808`, `Trap`, `House`, `Techno`, `DnB`, `Lo-Fi`
- Or describe custom: `"vintage 80s electronic"`, `"gritty hip-hop"`

### STEP 2: AI Generates 3 Variants
- API calls ElevenLabs Sound Effects
- Returns 3 unique interpretations
- Each ~1.5 seconds long

### STEP 3: Morph with XY Pad
**Large Central Control** - 400×400px with animations

**Triangle Layout:**
```
      Variant 1
         △
        / \
       /   \
      /  ●  \    ← You are here (blend all 3)
     /       \
    △─────────△
Variant 2   Variant 3
```

**What Happens:**
- Move pad → Real-time morphing
- Blends 3 variants based on distance
- Visual feedback + audio preview
- Click "Add Morphed Sound" when happy

**Or Pick Individual Variant:**
- 3 cards below XY pad
- ▶ Play = Preview
- ✓ Select = Add to track

### STEP 4: Sequence Pattern
- Sounds auto-add to track grid
- Click steps to program (16-step sequencer)
- M = Mute, S = Solo
- BPM dial (NexusUI control)

---

## 🎛️ NEXUSUI CONTROLS

### Integrated Components
- **Dial** - BPM control (60-200)
- **Position** - Large XY morph pad
- **Sequencer** - Step grid (coming soon)
- **Sliders** - Volume per track (coming soon)
- **Buttons** - Transport controls (coming soon)

### Why NexusUI?
- Built for WebAudio
- Beautiful SVG rendering
- Touch-optimized
- Event-driven
- Minimal styling needed

**Library:** [nexus-js.github.io/ui](https://nexus-js.github.io/ui/)
**CDN:** `https://cdn.jsdelivr.net/npm/nexusui@latest/dist/NexusUI.min.js`

---

## 🎨 UI DESIGN CONCEPT

### Minimalist AI-First Interface

```
╔═══════════════════════════════════════════╗
║         AI DRUM MACHINE                   ║
║  Describe → Generate → Morph → Sequence   ║
╠═══════════════════════════════════════════╣
║                                           ║
║  MODE: [●Single Sound] [○Full Kit]        ║
║                                           ║
║  ┌─────────────────────────────────────┐  ║
║  │ "deep 808 kick with sub bass"       │  ║
║  └─────────────────────────────────────┘  ║
║                                           ║
║  [ GENERATE 3 VARIANTS ]                  ║
║                                           ║
╠═══════════════════════════════════════════╣
║         MORPH BETWEEN VARIANTS            ║
║  ┌───────────────────────────────────┐    ║
║  │            Variant 1              │    ║
║  │               △                   │    ║
║  │              / \                  │    ║
║  │             /   \                 │    ║
║  │            /  ●  \                │    ║
║  │           /       \               │    ║
║  │          △─────────△              │    ║
║  │      Variant 2  Variant 3         │    ║
║  └───────────────────────────────────┘    ║
║                                           ║
║  [ ✓ ADD MORPHED SOUND TO TRACK ]         ║
║                                           ║
╠═══════════════════════════════════════════╣
║  SEQUENCER                                ║
║  [▶] [■]         (BPM: 120)               ║
║  ─────────────────────────────────────────║
║  808 Kick │ █ · · · █ · · · █ · · · █ · ·║
║  Snare    │ · · · · █ · · · · · · · █ · ·║
║  Hi-Hat   │ █ · █ · █ · █ · █ · █ · █ · ·║
╚═══════════════════════════════════════════╝
```

### Visual Features
- **Gradient backgrounds** - Depth + modern feel
- **Neon accents** - #00ff00 terminal green
- **Large central XY pad** - 400×400px focal point
- **Smooth animations** - Hover effects, transitions
- **Minimal text** - Focus on interaction
- **Responsive cards** - 3-column variant grid

---

## 🔊 AI GENERATION

### Single Sound Generation
**Endpoint:** `POST /api/generate-sound`

**Request:**
```json
{
  "prompt": "deep 808 kick with sub bass",
  "variants": 3
}
```

**Response:**
```json
{
  "prompt": "deep 808 kick with sub bass",
  "sounds": [
    {
      "id": "sound-1234-0",
      "prompt": "...",
      "variant": 1,
      "audioData": "base64_encoded_mp3...",
      "format": "mp3",
      "duration": 1.5
    }
  ],
  "count": 3
}
```

### Full Kit Generation
**Endpoint:** `POST /api/generate-drum-kit`

**Request:**
```json
{
  "style": "808",
  "variants": 3
}
```

**Response:**
```json
{
  "style": "808",
  "kit": {
    "kick": [sound1, sound2, sound3],
    "snare": [sound1, sound2, sound3],
    "hihat-closed": [sound1, sound2, sound3],
    "hihat-open": [sound1, sound2, sound3],
    "clap": [sound1, sound2, sound3]
  },
  "totalSounds": 15
}
```

### ElevenLabs API Details
- **Model:** Sound Effects V2
- **Quality:** 48kHz, MP3
- **Duration:** ~1.5s per sound
- **Cost:** Check ElevenLabs pricing
- **Limits:** Rate limited by API key tier

---

## 🎵 MORPHING ALGORITHM

### Concept
Blend 3 audio buffers based on XY position

### Triangle Positions
```javascript
const positions = [
  { x: 0.5, y: 0 },    // Variant 1 - top
  { x: 0, y: 1 },      // Variant 2 - bottom left
  { x: 1, y: 1 }       // Variant 3 - bottom right
];
```

### Weight Calculation
```javascript
// Distance-based weighting
const weights = positions.map(pos => {
  const dist = Math.sqrt(
    Math.pow(x - pos.x, 2) +
    Math.pow(y - pos.y, 2)
  );
  return Math.max(0, 1 - dist);
});

// Normalize to sum = 1
const total = weights.reduce((a, b) => a + b);
const normalized = weights.map(w => w / total);
```

### Audio Blending (TODO)
```javascript
// Mix 3 buffers with weights
const mixedBuffer = blendAudioBuffers([
  { buffer: sound1, weight: 0.5 },
  { buffer: sound2, weight: 0.3 },
  { buffer: sound3, weight: 0.2 }
]);
```

---

## 🏗️ ARCHITECTURE

### Module Structure
```
modules/drum-machine-ai.js
├── Audio Nodes (Web Audio API)
│   ├── Input → Output → Master Gain
│   └── Per-sample playback chains
├── UI (NexusUI + Custom HTML/CSS)
│   ├── Generation inputs
│   ├── XY morph pad (Nexus.Position)
│   ├── Variant selection cards
│   ├── Sequencer grid
│   └── Transport (BPM dial, play/stop)
├── State Management
│   ├── Generated sounds cache
│   ├── Tracks + patterns
│   └── XY pad position
└── Lifecycle Hooks
    ├── onLoad → Initialize
    ├── onConnect → Audio routing
    └── onUnload → Cleanup
```

### Data Flow
```
User input (text)
  → API call (ElevenLabs)
  → 3 Variants generated
  → Display XY pad + cards
  → User moves pad
  → Calculate blend weights
  → (TODO) Mix audio buffers
  → Play morphed sound
  → User selects
  → Add to track
  → Sequencer plays
```

---

## ✅ IMPLEMENTATION STATUS

### Phase 1: Core Generation ✓
- [x] ElevenLabs API integration
- [x] Single sound generation (3 variants)
- [x] Full kit generation (5 sounds × 3)
- [x] API endpoints (`/api/generate-sound`, `/api/generate-drum-kit`)
- [x] Error handling

### Phase 2: UI & NexusUI ✓
- [x] Minimalist AI-first design
- [x] NexusUI CDN integration
- [x] BPM Dial (Nexus.Dial)
- [x] XY Morph Pad (Nexus.Position)
- [x] Mode switching (Single/Kit)
- [x] Quick kit buttons
- [x] Variant display cards

### Phase 3: Morphing 🔄
- [x] XY pad layout (triangle)
- [x] Weight calculation
- [x] Visual feedback
- [ ] **TODO:** Audio buffer blending
- [ ] **TODO:** Real-time morphed playback

### Phase 4: Sequencer 🔄
- [x] Track data structure
- [x] Step grid UI
- [x] Mute/Solo buttons
- [ ] **TODO:** Playback engine
- [ ] **TODO:** Current step highlighting

### Phase 5: Advanced Features 📋
- [ ] NexusUI Sequencer component
- [ ] Per-track volume sliders
- [ ] Per-step velocity
- [ ] Pattern save/load
- [ ] Export patterns as MIDI
- [ ] Waveform visualization
- [ ] Sample trimming/editing

---

## 🎯 TESTING CHECKLIST

### API Generation
- [ ] Generate single sound (valid prompt)
- [ ] Generate single sound (empty prompt → error)
- [ ] Generate full kit (808 style)
- [ ] Generate full kit (custom style)
- [ ] API key missing → proper error
- [ ] Rate limit handling

### UI/UX
- [ ] Mode switching (Single ↔ Kit)
- [ ] Text input accepts prompts
- [ ] Quick kit buttons work
- [ ] Generate button shows loading state
- [ ] Status messages clear and helpful

### XY Morph Pad
- [ ] Pad renders (400×400px)
- [ ] Touch/mouse interaction works
- [ ] Visual feedback on move
- [ ] Triangle labels positioned correctly
- [ ] "Add Morphed Sound" button works

### Variant Selection
- [ ] 3 cards displayed
- [ ] Play button previews sound
- [ ] Select button adds to track
- [ ] Visual selection highlight

### Sequencer
- [ ] BPM dial changes tempo
- [ ] Play/Stop buttons
- [ ] Click steps toggles on/off
- [ ] Mute/Solo buttons work
- [ ] Multiple tracks display correctly

---

## 🐛 KNOWN ISSUES

1. **Audio morphing not implemented** - Currently snaps to closest variant
2. **Sequencer playback pending** - Visual only, no audio trigger
3. **ElevenLabs API key required** - No fallback/mock mode
4. **No waveform visualization** - Placeholder text only
5. **Kit generation slow** - 15 sounds takes 30-60s

---

## 🚀 FUTURE ENHANCEMENTS

### Short Term
1. Implement audio buffer morphing
2. Add sequencer playback engine
3. NexusUI sequencer component
4. Waveform visualization
5. Pattern save/load

### Medium Term
1. Multiple XY pads (one per track)
2. Per-step parameter locks
3. AI-assisted pattern generation
4. Collaborative generation (vote on variants)
5. Sample library management

### Long Term
1. Real-time AI regeneration
2. Gesture-based morphing
3. ML-based sound matching
4. Cloud preset sharing
5. Mobile app version

---

## 💡 PRO TIPS

### Writing Good Prompts
```
✓ GOOD:
- "deep 808 kick with sub bass and vinyl crackle"
- "crisp trap snare, short decay, layered clap"
- "metallic hi-hat, bright shimmer, resonant tail"

✗ AVOID:
- "kick" (too vague)
- "the best trap snare ever made" (subjective)
- "like the one in that song" (no reference)
```

### Morphing Techniques
- **Center** = Equal blend of all 3
- **Corners** = Pure variants
- **Edges** = 50/50 blend of 2 variants
- **Circle around** = Smooth transitions
- **Rapid movements** = Glitchy effects

### Kit Generation
- Start with preset (808, Trap, House)
- Tweak description for variation
- Generate multiple kits, mix & match
- Save favorite combinations

---

## 📚 RESOURCES

### Libraries Used
- **[NexusUI](https://nexus-js.github.io/ui/)** - Web Audio interfaces
- **[ElevenLabs Sound Effects](https://elevenlabs.io/sound-effects)** - AI audio generation
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Audio processing

### Related Projects
- **[Tone.js](https://tonejs.github.io/)** - Web Audio framework
- **[WebPD](https://github.com/sebpiq/WebPd)** - Pure Data for browser
- **[Gibber](https://gibber.cc/)** - Live coding audio

---

**Version:** 2.0.0
**Status:** Core generation ✓ | Morphing 🔄 | Sequencer 🔄
**Date:** 2026-01-26
